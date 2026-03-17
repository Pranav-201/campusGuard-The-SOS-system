#!/bin/bash
# ─── Wi-Fi SOS Emergency Alert System - Startup ──────────────────────────────

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${RED}${BOLD}"
echo "  ██╗    ██╗██╗      ███████╗██╗    ███████╗ ██████╗ ███████╗"
echo "  ██║    ██║██║      ██╔════╝╚═╝    ██╔════╝██╔═══██╗██╔════╝"
echo "  ██║ █╗ ██║██║█████╗█████╗         ███████╗██║   ██║███████╗"
echo "  ██║███╗██║██║╚════╝██╔══╝         ╚════██║██║   ██║╚════██║"
echo "  ╚███╔███╔╝██║      ██║            ███████║╚██████╔╝███████║"
echo "   ╚══╝╚══╝ ╚═╝      ╚═╝            ╚══════╝ ╚═════╝ ╚══════╝"
echo -e "${NC}"
echo -e "${BOLD}  Campus Emergency Alert System${NC}"
echo -e "  UDP Broadcast · TCP Direct · WebSocket Live Feed"
echo ""

# ─── Check Python ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[1/4] Checking Python...${NC}"
if ! command -v python3 &>/dev/null; then
  echo -e "${RED}ERROR: Python 3 required${NC}"; exit 1
fi
echo -e "${GREEN}✓ Python $(python3 --version)${NC}"

# ─── Install Python deps ───────────────────────────────────────────────────────
echo -e "${BLUE}[2/4] Installing Python dependencies...${NC}"
cd backend
pip install -r requirements.txt -q --break-system-packages 2>/dev/null || pip install -r requirements.txt -q
echo -e "${GREEN}✓ Dependencies installed${NC}"

# ─── Start backend ─────────────────────────────────────────────────────────────
echo -e "${BLUE}[3/4] Starting Flask + WebSocket server...${NC}"
python3 server.py &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
sleep 1

# ─── Start frontend ────────────────────────────────────────────────────────────
echo -e "${BLUE}[4/4] Starting React frontend...${NC}"
cd ../frontend
npm install -q 2>/dev/null
npm start &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  System Running!${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 Dashboard:   ${BLUE}http://localhost:3000${NC}"
echo -e "  🔌 REST API:    ${BLUE}http://localhost:5000${NC}"
echo -e "  📡 WebSocket:   ${BLUE}ws://localhost:8765${NC}"
echo -e "  📻 UDP Hub:     Port ${YELLOW}5555${NC}"
echo -e "  🔗 TCP Resp:    Port ${YELLOW}5556${NC}"
echo ""
echo -e "  Optional: Run UDP hub on any device:"
echo -e "  ${YELLOW}python3 backend/udp_receiver.py${NC}"
echo ""
echo -e "  Optional: Run TCP responder listener:"
echo -e "  ${YELLOW}python3 backend/tcp_responder.py${NC}"
echo ""
echo -e "  Press ${RED}Ctrl+C${NC} to stop all services"
echo ""

# Cleanup on exit
trap "echo ''; echo 'Stopping...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Done.'; exit" INT TERM

wait
