"""
Wi-Fi SOS Emergency Alert System - Backend Server
UDP broadcast + TCP reliable delivery + WebSocket for React frontend
"""
import asyncio
import json
import logging
import socket
import sqlite3
import time
import hashlib
import math
import os
from datetime import datetime
from collections import defaultdict
from typing import Optional

import websockets
from flask import Flask, request, jsonify
from flask_cors import CORS
import threading

# ─── Configuration ─────────────────────────────────────────────────────────────
UDP_BROADCAST_PORT = 5555
TCP_PORT = 5556
HTTP_PORT = int(os.environ.get("HTTP_PORT", "5000"))
WS_PORT = 8765

RATE_LIMIT_WINDOW = 60      # seconds
RATE_LIMIT_MAX    = 3       # max alerts per window

SECRET_KEY = "campus_sos_2024_secret"

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger(__name__)

# ─── Database ──────────────────────────────────────────────────────────────────
def init_db():
    conn = sqlite3.connect("sos_alerts.db")
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS alerts (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            user_name TEXT    NOT NULL,
            emergency TEXT    NOT NULL,
            latitude  REAL,
            longitude REAL,
            ip_address TEXT,
            timestamp TEXT    NOT NULL,
            severity  TEXT    DEFAULT 'HIGH',
            status    TEXT    DEFAULT 'ACTIVE',
            acknowledged_by TEXT,
            acknowledged_at TEXT,
            category  TEXT    DEFAULT 'GENERAL'
        )
    """)
    c.execute("""
        CREATE TABLE IF NOT EXISTS responders (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            name      TEXT NOT NULL,
            role      TEXT NOT NULL,
            latitude  REAL,
            longitude REAL,
            ip_address TEXT,
            token     TEXT UNIQUE,
            is_active INTEGER DEFAULT 1
        )
    """)
    conn.commit()
    conn.close()
    log.info("Database initialized")

# ─── Rate Limiter ───────────────────────────────────────────────────────────────
rate_store: dict = defaultdict(list)

def is_rate_limited(ip: str) -> bool:
    now = time.time()
    rate_store[ip] = [t for t in rate_store[ip] if now - t < RATE_LIMIT_WINDOW]
    if len(rate_store[ip]) >= RATE_LIMIT_MAX:
        return True
    rate_store[ip].append(now)
    return False

# ─── Geolocation helpers ────────────────────────────────────────────────────────
def haversine(lat1, lon1, lat2, lon2) -> float:
    R = 6371000  # metres
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def normalize_role(role: str) -> str:
    return (role or "").strip().lower()

def get_nearby_responders(lat, lon, radius_m=500, allowed_roles=None):
    conn = sqlite3.connect("sos_alerts.db")
    c = conn.cursor()
    c.execute("SELECT * FROM responders WHERE is_active=1")
    rows = c.fetchall()
    conn.close()
    cols = ["id","name","role","latitude","longitude","ip_address","token","is_active"]
    nearby = []
    allowed_role_set = None
    if allowed_roles:
        allowed_role_set = {normalize_role(r) for r in allowed_roles}
    for row in rows:
        r = dict(zip(cols, row))
        if allowed_role_set and normalize_role(r.get("role")) not in allowed_role_set:
            continue
        if r["latitude"] and r["longitude"]:
            dist = haversine(lat, lon, r["latitude"], r["longitude"])
            r["distance_m"] = round(dist)
            if dist <= radius_m:
                nearby.append(r)
    nearby.sort(key=lambda x: x["distance_m"])
    return nearby

# ─── Auth ───────────────────────────────────────────────────────────────────────
def generate_token(device_id: str) -> str:
    raw = f"{device_id}:{SECRET_KEY}:{int(time.time() // 3600)}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]

def verify_token(token: str) -> bool:
    # simple: any non-empty token is accepted for demo
    return bool(token and len(token) >= 8)

# ─── WebSocket broadcast ────────────────────────────────────────────────────────
ws_clients: set = set()

async def ws_handler(websocket):
    ws_clients.add(websocket)
    log.info(f"WS client connected: {websocket.remote_address}")
    try:
        async for msg in websocket:
            data = json.loads(msg)
            if data.get("type") == "ping":
                await websocket.send(json.dumps({"type": "pong"}))
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        ws_clients.discard(websocket)

async def ws_broadcast(payload: dict):
    if not ws_clients:
        return
    msg = json.dumps(payload)
    dead = set()
    for ws in ws_clients:
        try:
            await ws.send(msg)
        except Exception:
            dead.add(ws)
    ws_clients.difference_update(dead)

# ─── UDP broadcast ──────────────────────────────────────────────────────────────
def udp_broadcast(alert: dict):
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
    try:
        data = json.dumps(alert).encode()
        sock.sendto(data, ('<broadcast>', UDP_BROADCAST_PORT))
        log.info(f"UDP broadcast sent for alert id={alert.get('id')}")
    except Exception as e:
        log.error(f"UDP broadcast error: {e}")
    finally:
        sock.close()

# ─── TCP reliable delivery ──────────────────────────────────────────────────────
def tcp_send_to_responders(alert: dict, responders: list):
    for resp in responders[:5]:  # top 5 nearest
        ip = resp.get("ip_address")
        if not ip:
            continue
        def _send(ip=ip):
            try:
                with socket.create_connection((ip, TCP_PORT), timeout=3) as s:
                    s.sendall(json.dumps(alert).encode())
                    ack = s.recv(1024).decode()
                    log.info(f"TCP ACK from {ip}: {ack}")
            except Exception as e:
                log.warning(f"TCP delivery to {ip} failed: {e}")
        threading.Thread(target=_send, daemon=True).start()

# ─── Async loop for WebSocket ───────────────────────────────────────────────────
_loop: Optional[asyncio.AbstractEventLoop] = None

def get_loop():
    return _loop

def run_ws_server():
    global _loop
    _loop = asyncio.new_event_loop()
    asyncio.set_event_loop(_loop)

    async def _start():
        server = await websockets.serve(ws_handler, "0.0.0.0", WS_PORT)
        log.info(f"WebSocket server on ws://0.0.0.0:{WS_PORT}")
        await server.wait_closed()

    _loop.run_until_complete(_start())

def schedule_ws_broadcast(payload):
    if _loop and not _loop.is_closed():
        asyncio.run_coroutine_threadsafe(ws_broadcast(payload), _loop)

# ─── Flask HTTP API ──────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})

@app.route("/api/token", methods=["POST"])
def get_token():
    data = request.json or {}
    device_id = data.get("device_id", request.remote_addr)
    token = generate_token(device_id)
    return jsonify({"token": token, "device_id": device_id})

@app.route("/api/alerts", methods=["POST"])
def create_alert():
    token = request.headers.get("X-Auth-Token", "")
    if not verify_token(token):
        return jsonify({"error": "Unauthorized"}), 401

    ip = request.remote_addr
    if is_rate_limited(ip):
        return jsonify({"error": "Rate limit exceeded. Max 3 alerts per minute."}), 429

    data = request.json or {}
    required = ["user_name", "emergency"]
    for f in required:
        if not data.get(f):
            return jsonify({"error": f"Missing field: {f}"}), 400

    timestamp = datetime.utcnow().isoformat()
    lat  = data.get("latitude")
    lon  = data.get("longitude")
    severity = (data.get("severity", "HIGH") or "HIGH").upper()
    category = data.get("category", "GENERAL")

    dispatch_roles = None
    if severity in ("MEDIUM", "LOW"):
        dispatch_roles = ["Security Guard", "Batch Guardian"]

    conn = sqlite3.connect("sos_alerts.db")
    c = conn.cursor()
    c.execute("""
        INSERT INTO alerts (user_name, emergency, latitude, longitude,
                            ip_address, timestamp, severity, category)
        VALUES (?,?,?,?,?,?,?,?)
    """, (data["user_name"], data["emergency"], lat, lon,
          ip, timestamp, severity, category))
    alert_id = c.lastrowid
    conn.commit()
    conn.close()

    alert = {
        "id": alert_id,
        "user_name": data["user_name"],
        "emergency": data["emergency"],
        "latitude": lat,
        "longitude": lon,
        "ip_address": ip,
        "timestamp": timestamp,
        "severity": severity,
        "category": category,
        "status": "ACTIVE",
        "dispatch_roles": dispatch_roles or ["ALL"],
        "type": "SOS_ALERT"
    }

    # Nearby responders
    nearby = []
    if lat and lon:
        nearby = get_nearby_responders(lat, lon, allowed_roles=dispatch_roles)
        alert["nearby_responders"] = len(nearby)
        alert["nearest_responder"] = nearby[0]["name"] if nearby else None

    # Broadcast
    threading.Thread(target=udp_broadcast, args=(alert,), daemon=True).start()
    if nearby:
        threading.Thread(target=tcp_send_to_responders, args=(alert, nearby), daemon=True).start()
    schedule_ws_broadcast({"type": "NEW_ALERT", "alert": alert})

    log.info(f"SOS Alert #{alert_id} from {data['user_name']} [{severity}]")
    return jsonify({"success": True, "alert": alert}), 201

@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    status = request.args.get("status", "all")
    limit  = int(request.args.get("limit", 50))

    conn = sqlite3.connect("sos_alerts.db")
    c = conn.cursor()
    if status == "all":
        c.execute("SELECT * FROM alerts ORDER BY id DESC LIMIT ?", (limit,))
    else:
        c.execute("SELECT * FROM alerts WHERE status=? ORDER BY id DESC LIMIT ?", (status, limit))
    rows = c.fetchall()
    conn.close()

    cols = ["id","user_name","emergency","latitude","longitude","ip_address",
            "timestamp","severity","status","acknowledged_by","acknowledged_at","category"]
    alerts = [dict(zip(cols, r)) for r in rows]
    return jsonify({"alerts": alerts, "count": len(alerts)})

@app.route("/api/alerts/<int:alert_id>/acknowledge", methods=["PATCH"])
def acknowledge_alert(alert_id):
    data = request.json or {}
    by = data.get("acknowledged_by", "Staff")
    now = datetime.utcnow().isoformat()

    conn = sqlite3.connect("sos_alerts.db")
    c = conn.cursor()
    c.execute("UPDATE alerts SET status='RESOLVED', acknowledged_by=?, acknowledged_at=? WHERE id=?",
              (by, now, alert_id))
    conn.commit()
    conn.close()

    schedule_ws_broadcast({"type": "ALERT_RESOLVED", "alert_id": alert_id, "by": by})
    return jsonify({"success": True, "alert_id": alert_id})

@app.route("/api/alerts/stats", methods=["GET"])
def stats():
    conn = sqlite3.connect("sos_alerts.db")
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM alerts")
    total = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM alerts WHERE status='ACTIVE'")
    active = c.fetchone()[0]
    c.execute("SELECT COUNT(*) FROM alerts WHERE status='RESOLVED'")
    resolved = c.fetchone()[0]
    c.execute("SELECT category, COUNT(*) as cnt FROM alerts GROUP BY category ORDER BY cnt DESC")
    by_category = [{"category": r[0], "count": r[1]} for r in c.fetchall()]
    c.execute("SELECT severity, COUNT(*) as cnt FROM alerts GROUP BY severity ORDER BY cnt DESC")
    by_severity = [{"severity": r[0], "count": r[1]} for r in c.fetchall()]
    conn.close()
    return jsonify({
        "total": total, "active": active, "resolved": resolved,
        "by_category": by_category, "by_severity": by_severity
    })

@app.route("/api/responders", methods=["GET"])
def get_responders():
    conn = sqlite3.connect("sos_alerts.db")
    c = conn.cursor()
    c.execute("SELECT id,name,role,latitude,longitude,is_active FROM responders")
    rows = c.fetchall()
    conn.close()
    cols = ["id","name","role","latitude","longitude","is_active"]
    return jsonify({"responders": [dict(zip(cols,r)) for r in rows]})

@app.route("/api/responders", methods=["POST"])
def add_responder():
    data = request.json or {}
    conn = sqlite3.connect("sos_alerts.db")
    c = conn.cursor()
    c.execute("""
        INSERT INTO responders (name, role, latitude, longitude, ip_address, token)
        VALUES (?,?,?,?,?,?)
    """, (data.get("name"), data.get("role"), data.get("latitude"),
          data.get("longitude"), request.remote_addr,
          generate_token(data.get("name","") + str(time.time()))))
    conn.commit()
    conn.close()
    return jsonify({"success": True}), 201

@app.route("/api/responders", methods=["DELETE"])
def clear_responders():
    conn = sqlite3.connect("sos_alerts.db")
    c = conn.cursor()
    c.execute("DELETE FROM responders")
    conn.commit()
    conn.close()
    return jsonify({"success": True})

@app.route("/api/responders/<int:responder_id>", methods=["DELETE"])
def delete_responder(responder_id):
    conn = sqlite3.connect("sos_alerts.db")
    c = conn.cursor()
    c.execute("DELETE FROM responders WHERE id=?", (responder_id,))
    deleted = c.rowcount
    conn.commit()
    conn.close()
    if deleted == 0:
        return jsonify({"error": "Responder not found"}), 404
    return jsonify({"success": True, "id": responder_id})

# ─── Seed default responders only ──────────────────────────────────────────────
def remove_legacy_demo_responders():
    conn = sqlite3.connect("sos_alerts.db")
    c = conn.cursor()
    c.execute(
        "DELETE FROM responders WHERE name IN (?,?,?,?)",
        ("Dr. Kavitha", "Security Rajan", "Engineer Sunil", "Warden Meera")
    )

    conn.commit()
    conn.close()
    log.info("Legacy demo responders removed")

# ─── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    init_db()
    remove_legacy_demo_responders()

    # WebSocket in background thread
    ws_thread = threading.Thread(target=run_ws_server, daemon=True)
    ws_thread.start()
    time.sleep(0.5)

    log.info(f"HTTP API on http://0.0.0.0:{HTTP_PORT}")
    app.run(host="0.0.0.0", port=HTTP_PORT, debug=False, threaded=True)
