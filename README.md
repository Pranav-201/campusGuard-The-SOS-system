# 📡 Wi-Fi SOS — Campus Emergency Alert System
# Author: Pranav Amrutkar.

A **real-time, location-aware emergency alert system** for campuses and hostels, built with Python (Flask + asyncio) for the backend and React for the frontend. Uses **UDP broadcast** for fast dissemination and **TCP** for reliable direct delivery to responders.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Campus Wi-Fi Network                      │
│                                                                  │
│  ┌──────────┐    HTTP/WS    ┌───────────────────────────────┐   │
│  │  React   │◄────────────►│      Flask Server (5000)       │   │
│  │Dashboard │              │  + WebSocket Server (8765)     │   │
│  └──────────┘              └───────┬───────────────┬────────┘   │
│                                    │               │             │
│                         UDP Broadcast           TCP Direct       │
│                         Port 5555               Port 5556        │
│                              │                     │             │
│                    ┌─────────┼──────┐    ┌─────────┼──────┐     │
│                    │  Hub Device 1  │    │  Hub Device 2  │     │
│                    │  (Receiver)    │    │  (Receiver)    │     │
│                    └────────────────┘    └────────────────┘     │
│                                                                  │
│              [SOS Sender: Student's Phone/Laptop]                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm

### One command start
- npm run dev

### Manual start
```bash
# Terminal 1: Backend
cd backend
pip install -r requirements.txt
python3 server.py

# Terminal 2: Frontend
cd frontend
npm install
npm start

# Terminal 3: UDP Hub (any device on network)
python3 backend/udp_receiver.py

# Terminal 4: TCP Responder (on responder device)
python3 backend/tcp_responder.py
```

---

## 🌐 Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/token` | Get auth token |
| POST | `/api/alerts` | Create SOS alert |
| GET | `/api/alerts` | List alerts |
| PATCH | `/api/alerts/:id/acknowledge` | Resolve alert |
| GET | `/api/alerts/stats` | Statistics |
| GET | `/api/responders` | List responders |
| POST | `/api/responders` | Add responder |

---

## 📡 Networking

### UDP Broadcast (Port 5555)
- **Purpose**: Fast, simultaneous dissemination to all hub devices
- **Protocol**: UDP with `SO_BROADCAST` socket option
- **Latency**: < 1ms on LAN
- **Use case**: Alert all campus receivers instantly

### TCP Direct (Port 5556)  
- **Purpose**: Reliable delivery to nearest responders
- **Protocol**: TCP with acknowledgment
- **Retry**: Auto-retry on failure
- **Use case**: Medical, security, lift emergency dispatch

### WebSocket (Port 8765)
- **Purpose**: Live React dashboard updates
- **Protocol**: WebSocket over TCP
- **Events**: `NEW_ALERT`, `ALERT_RESOLVED`, `ping/pong`

### REST API (Port 5000)
- **Purpose**: CRUD operations, auth, stats
- **Security**: Token auth + rate limiting (3 alerts/min per IP)

---

## 🔒 Security Features

- **Token Authentication**: SHA-256 based device tokens
- **Rate Limiting**: Max 3 alerts per minute per IP (prevents spam)
- **Input Validation**: Required fields enforced
- **Audit Log**: All alerts stored with timestamp and IP

---

## 📍 Geolocation

Each SOS includes GPS coordinates. The system:
1. Calculates distance to all registered responders using **Haversine formula**
2. Sorts responders by proximity
3. Sends **direct TCP alerts** to the 5 nearest responders
4. Visual map on dashboard shows alert locations with ping animation

---

## 🎨 Frontend Features

- **Dark / Light theme** toggle
- **Live WebSocket** feed — new alerts appear instantly
- **Animated SOS button** with pulse rings
- **3-second countdown** before broadcast (cancel option)
- **Campus map** with active alert pins
- **Filter & search** alert log
- **Category-based** quick dispatch

---

## 📁 File Structure

```
wifi-sos/
├── backend/
│   ├── server.py          # Main Flask + WebSocket + UDP/TCP server
│   ├── udp_receiver.py    # Hub device listener (run on hub PCs)
│   ├── tcp_responder.py   # Responder TCP listener
│   ├── requirements.txt
│   └── sos_alerts.db      # SQLite (auto-created)
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Root: routing, context, WS client
│   │   ├── index.css       # Design system with CSS variables
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Stats, map, recent alerts
│   │   │   ├── SOSSend.jsx     # Animated SOS sender
│   │   │   ├── AlertLog.jsx    # Filterable alert history
│   │   │   └── Responders.jsx  # Responder management + protocol info
│   │   └── components/
│   │       └── AlertCard.jsx   # Reusable alert card
│   └── public/index.html
└── start.sh               # One-command launcher
```

---

## 🧠 Interview Talking Points

| Concept | Implementation |
|---------|---------------|
| UDP Broadcasting | `SO_BROADCAST` socket, port 5555 |
| TCP Reliability | Direct socket with ACK, retry on failure |
| WebSocket | asyncio + `websockets` library |
| Geolocation | Haversine formula for distance calculation |
| Rate Limiting | In-memory sliding window per IP |
| Auth | SHA-256 token with time-based rotation |
| Concurrency | `threading` for UDP/TCP alongside Flask |
| Persistence | SQLite with full audit trail |

---

## 🔮 Future Enhancements

- Video/audio stream from sender device
- Push notifications via Firebase
- Mobile app (React Native)
- Integration with campus PA system
- ML-based false alarm detection
- Lift sensor IoT integration (MQTT)
