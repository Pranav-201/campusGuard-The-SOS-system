"""
Wi-Fi SOS - TCP Responder Listener
Run this on each responder device (medical, security, warden).
Receives direct TCP messages and acknowledges them.
"""
import socket
import json
import threading
import sys

TCP_PORT = 5556

def handle_client(conn, addr):
    try:
        data = b""
        while True:
            chunk = conn.recv(4096)
            if not chunk:
                break
            data += chunk
        alert = json.loads(data.decode())
        print("\n" + "!"*60)
        print(f"  DIRECT SOS from {alert.get('user_name')} via TCP")
        print(f"  Emergency: {alert.get('emergency')}")
        print(f"  Severity:  {alert.get('severity')}")
        print(f"  Location:  {alert.get('latitude')}, {alert.get('longitude')}")
        print("!"*60)
        conn.sendall(b"ACK:RECEIVED")
    except Exception as e:
        print(f"TCP handle error: {e}")
    finally:
        conn.close()

def main():
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(("0.0.0.0", TCP_PORT))
    server.listen(10)
    print(f"[TCP] Responder listener on port {TCP_PORT}")
    while True:
        try:
            conn, addr = server.accept()
            threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()
        except KeyboardInterrupt:
            break

if __name__ == "__main__":
    main()
