"""
Wi-Fi SOS - UDP Receiver / Hub Device
Run this on any hub device on the campus network.
It listens for UDP broadcasts and plays a sound/visual alarm.
"""
import socket
import json
import time
import sys
from datetime import datetime

UDP_PORT = 5555

def play_alarm():
    # Terminal bell
    print("\a\a\a", end="", flush=True)

def format_alert(alert: dict) -> str:
    lines = [
        "=" * 60,
        f"🚨  SOS ALERT #{alert.get('id', '?')}  🚨",
        "=" * 60,
        f"  From     : {alert.get('user_name')}",
        f"  Emergency : {alert.get('emergency')}",
        f"  Severity  : {alert.get('severity')}",
        f"  Category  : {alert.get('category')}",
        f"  IP        : {alert.get('ip_address')}",
        f"  Location  : lat={alert.get('latitude')} lon={alert.get('longitude')}",
        f"  Time      : {alert.get('timestamp')}",
        "=" * 60,
    ]
    return "\n".join(lines)

def main():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(("", UDP_PORT))
    print(f"[HUB] Listening for UDP broadcasts on port {UDP_PORT}...")

    while True:
        try:
            data, addr = sock.recvfrom(65535)
            alert = json.loads(data.decode())
            print(format_alert(alert))
            play_alarm()
        except json.JSONDecodeError:
            print(f"[HUB] Non-JSON packet from {addr}")
        except KeyboardInterrupt:
            print("\n[HUB] Shutting down.")
            break

if __name__ == "__main__":
    main()
