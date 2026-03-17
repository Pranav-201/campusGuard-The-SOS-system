import React, { useState, useEffect, useRef, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { AlertTriangle, ClipboardList, LayoutDashboard, Menu, Siren, Users, X } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import SOSSend from './pages/SOSSend';
import AlertLog from './pages/AlertLog';
import Responders from './pages/Responders';
import StartupLoader from './components/StartupLoader';
import topbarLogo from './assets/logo.png';
import './index.css';

const API_BASE = `${window.location.protocol}//${window.location.hostname}:5000/api`;
const TARGETED_RING_ROLES = new Set(['security guard', 'batch guardian']);

function normalizeRole(role) {
  return String(role || '').trim().toLowerCase();
}

function canRingForAlert(alert, responderRole) {
  const severity = String(alert?.severity || '').toUpperCase();
  if (severity === 'CRITICAL' || severity === 'HIGH') {
    return true;
  }
  if (severity === 'MEDIUM' || severity === 'LOW') {
    return TARGETED_RING_ROLES.has(normalizeRole(responderRole));
  }
  return false;
}

function hasRingEligibleActiveAlerts(alerts, responderRole) {
  return (alerts || []).some(
    (alert) => String(alert?.status || '').toUpperCase() === 'ACTIVE' && canRingForAlert(alert, responderRole)
  );
}


export const AppContext = createContext(null);
const AUTHORITY_PASSKEY = '123456';

export function useApp() { return useContext(AppContext); }

function Sidebar({ mobileOpen, onNavigate, onCloseMenu }) {
  const links = [
    { to: '/', icon: Siren, label: 'Send SOS' },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/log', icon: ClipboardList, label: 'Alert Log' },
    { to: '/responders', icon: Users, label: 'Responders' },
  ];

  return (
    <nav id="app-mobile-sidebar" className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <button className="mobile-menu-close mobile-menu-close-floating" onClick={onCloseMenu} aria-label="Close menu">
        <X size={16} />
      </button>

      <div className="sidebar-nav-list">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onNavigate}
          >
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, width: 24 }}>
              <Icon size={18} />
            </span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}


function Topbar({ activeAlerts, onMenuToggle, isMenuOpen }) {
  const location = useLocation();
  const isSOSPage = location.pathname === '/';
  const isDashboardPage = location.pathname === '/dashboard';
  const isRespondersPage = location.pathname === '/responders';
  const titles = {
    '/':           'Send Emergency Alert',
    '/dashboard':  'Dashboard',
    '/log':        'Alert Log & History',
    '/responders': 'Responders',
  };

  return (
    <div className="topbar">
      <div className="topbar-row topbar-main-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {!isDashboardPage && <img src={topbarLogo} alt="CampusGuard" className="topbar-logo-image" />}
        </div>
        <button
          className="mobile-menu-btn"
          onClick={onMenuToggle}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMenuOpen}
          aria-controls="app-mobile-sidebar"
        >
          <span className="mobile-menu-btn-icon">
            {isMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </span>
        </button>
      </div>

      {!isSOSPage && !isRespondersPage && (
        <div className="topbar-row topbar-title-row">
          <h2 className="page-title">
            {titles[location.pathname] || 'Wi-Fi SOS'}
          </h2>
          {activeAlerts > 0 && (
            <div className="active-alert-chip">
              <div className="live-dot" />
              <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>
                {activeAlerts} ACTIVE
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AuthorityGate({ onUnlock }) {
  const location = useLocation();
  const [passkey, setPasskey] = useState('');
  const [error, setError] = useState('');

  const pageLabel = location.pathname === '/responders' ? 'Responders' : 'Alert Log';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (passkey === AUTHORITY_PASSKEY) {
      setError('');
      onUnlock();
      toast.success('Access granted');
      return;
    }
    setError('Invalid authority pass key');
    toast.error('Invalid authority pass key');
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', width: '100%' }}>
      <div className="glass-card" style={{ padding: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Restricted Access</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 16 }}>
          Enter authority pass key to open {pageLabel}.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label className="form-label">Authority Pass Key</label>
            <input
              className="form-input"
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Enter pass key"
              value={passkey}
              onChange={(e) => {
                setPasskey(e.target.value);
                if (error) {
                  setError('');
                }
              }}
            />
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 12, marginBottom: 10 }}>{error}</p>}
          <button type="submit" className="btn btn-danger" style={{ width: '100%' }}>
            Unlock Access
          </button>
        </form>
      </div>
    </div>
  );
}

// â”€â”€â”€ App â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0, by_category: [], by_severity: [] });
  const [responders, setResponders] = useState([]);
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [token, setToken] = useState(localStorage.getItem('sos_token') || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authorityUnlocked, setAuthorityUnlocked] = useState(false);
  const [myResponder, setMyResponder] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sos_my_responder') || 'null');
    } catch {
      return null;
    }
  });
  const audioContextRef = useRef(null);
  const alarmIntervalRef = useRef(null);
  const pendingAlarmRef = useRef(false);
  const responderRoleRef = useRef(myResponder?.role || '');

  useEffect(() => {
    const t = setTimeout(() => setIsBooting(false), 5000);
    return () => clearTimeout(t);
  }, []);

  const ensureAlarmContext = async () => {
    if (typeof window === 'undefined') {
      return null;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextClass();
    }

    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    return audioContextRef.current;
  };

  const playAlarmBurst = async () => {
    const audioContext = await ensureAlarmContext();
    if (!audioContext) {
      return;
    }

    const startAt = audioContext.currentTime;
    const burstPattern = [0, 0.26, 0.72, 0.98];

    burstPattern.forEach((offset, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const burstStart = startAt + offset;
      const burstEnd = burstStart + 0.18;
      const frequency = index % 2 === 0 ? 880 : 740;

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(frequency, burstStart);
      gain.gain.setValueAtTime(0.0001, burstStart);
      gain.gain.exponentialRampToValueAtTime(0.16, burstStart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, burstEnd);

      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(burstStart);
      oscillator.stop(burstEnd + 0.02);
    });
  };

  const stopAlarmLoop = () => {
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  };

  const startAlarmLoop = async () => {
    if (!alarmIntervalRef.current) {
      await playAlarmBurst();
      alarmIntervalRef.current = setInterval(() => {
        playAlarmBurst().catch(() => {});
      }, 1800);
    }
  };

  // Get/cache auth token
  useEffect(() => {
    if (!token) {
      fetch(`${API_BASE}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: `web_${Math.random().toString(36).slice(2)}` })
      })
        .then(r => r.json())
        .then(d => { setToken(d.token); localStorage.setItem('sos_token', d.token); })
        .catch(() => {});
    }
  }, []);

  // Load initial data
  const fetchAlerts = () => {
    fetch(`${API_BASE}/alerts?limit=150`)
      .then(r => r.json())
      .then(d => setAlerts(d.alerts || []))
      .catch(() => {});
  };

  const fetchStats = () => {
    fetch(`${API_BASE}/alerts/stats`)
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  };

  const fetchResponders = () => {
    fetch(`${API_BASE}/responders`)
      .then(r => r.json())
      .then(d => setResponders(d.responders || []))
      .catch(() => {});
  };

  useEffect(() => {
    responderRoleRef.current = myResponder?.role || '';
  }, [myResponder]);

  useEffect(() => {
    const syncResponderProfile = () => {
      try {
        setMyResponder(JSON.parse(localStorage.getItem('sos_my_responder') || 'null'));
      } catch {
        setMyResponder(null);
      }
    };

    window.addEventListener('storage', syncResponderProfile);
    window.addEventListener('responder-profile-changed', syncResponderProfile);

    return () => {
      window.removeEventListener('storage', syncResponderProfile);
      window.removeEventListener('responder-profile-changed', syncResponderProfile);
    };
  }, []);

  useEffect(() => {
    fetchAlerts();
    fetchStats();
    fetchResponders();
    const interval = setInterval(() => {
      fetchAlerts();
      fetchStats();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unlockAlarmAudio = () => {
      ensureAlarmContext()
        .then(() => {
          if (pendingAlarmRef.current || hasRingEligibleActiveAlerts(alerts, responderRoleRef.current)) {
            pendingAlarmRef.current = false;
            startAlarmLoop().catch(() => {});
          }
        })
        .catch(() => {});
    };

    window.addEventListener('pointerdown', unlockAlarmAudio, { passive: true });
    window.addEventListener('keydown', unlockAlarmAudio);

    return () => {
      window.removeEventListener('pointerdown', unlockAlarmAudio);
      window.removeEventListener('keydown', unlockAlarmAudio);
    };
  }, [alerts]);

  useEffect(() => {
    const shouldRing = hasRingEligibleActiveAlerts(alerts, responderRoleRef.current);
    if (!shouldRing) {
      pendingAlarmRef.current = false;
      stopAlarmLoop();
      return;
    }

    startAlarmLoop().catch(() => {
      pendingAlarmRef.current = true;
    });
  }, [alerts, myResponder]);

  // WebSocket live feed
  useEffect(() => {
    let ws;
    let reconnectTimer;

    function connect() {
      try {
        ws = new WebSocket(`ws://${window.location.hostname}:8765`);

        ws.onopen = () => {
          setWsStatus('connected');
        };

        ws.onmessage = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === 'NEW_ALERT') {
              const alert = msg.alert;
              setAlerts(prev => [{ ...alert, _new: true }, ...prev]);
              fetchStats();
              if (canRingForAlert(alert, responderRoleRef.current)) {
                startAlarmLoop().catch(() => {
                  pendingAlarmRef.current = true;
                });
              }
              toast.custom((t) => (
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--red)',
                  borderRadius: 12, padding: '12px 16px', display: 'flex',
                  gap: 12, alignItems: 'flex-start', maxWidth: 340,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  animation: t.visible ? 'scale-in 0.3s cubic-bezier(0.34,1.56,0.64,1)' : undefined
                }}>
                  <span style={{ display: 'flex', marginTop: 2 }}><AlertTriangle size={20} color="var(--red)" /></span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--red)' }}>
                      {alert.severity} ALERT
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                      {alert.user_name}: {alert.emergency}
                    </div>
                  </div>
                </div>
              ), { duration: 6000 });
              document.body.classList.add('emergency-mode');
              setTimeout(() => document.body.classList.remove('emergency-mode'), 3100);
            } else if (msg.type === 'ALERT_RESOLVED') {
              setAlerts(prev => {
                const next = prev.map(a =>
                  a.id === msg.alert_id ? { ...a, status: 'RESOLVED' } : a
                );
                if (!hasRingEligibleActiveAlerts(next, responderRoleRef.current)) {
                  stopAlarmLoop();
                }
                return next;
              });
              fetchStats();
            }
          } catch {}
        };

        ws.onclose = () => {
          setWsStatus('disconnected');
          reconnectTimer = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
          ws.close();
        };
      } catch {}
    }

    connect();
    return () => {
      stopAlarmLoop();
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
        audioContextRef.current = null;
      }
    };
  }, []);

  const acknowledgeAlert = async (alertId, by = 'Hub Staff') => {
    try {
      await fetch(`${API_BASE}/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token },
        body: JSON.stringify({ acknowledged_by: by }),
      });
      setAlerts(prev => {
        const next = prev.map(a => a.id === alertId ? { ...a, status: 'RESOLVED' } : a);
        if (!hasRingEligibleActiveAlerts(next, responderRoleRef.current)) {
          stopAlarmLoop();
        }
        return next;
      });
      fetchStats();
      toast.success('Alert resolved');
    } catch {
      toast.error('Failed to resolve alert');
    }
  };

  const ctx = {
    alerts,
    stats,
    responders,
    token,
    wsStatus,
    myResponder,
    acknowledgeAlert,
    fetchAlerts,
    fetchStats,
    fetchResponders,
  };

  if (isBooting) {
    return <StartupLoader />;
  }

  return (
    <AppContext.Provider value={ctx}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { zIndex: 9999 } }} />
        <div className={`app-container sidebar-static ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
          <Sidebar
            mobileOpen={mobileMenuOpen}
            onNavigate={() => setMobileMenuOpen(false)}
            onCloseMenu={() => setMobileMenuOpen(false)}
          />
          <div className="main-content">
            <Topbar
              activeAlerts={stats.active}
              onMenuToggle={() => setMobileMenuOpen(v => !v)}
              isMenuOpen={mobileMenuOpen}
            />
            <div className="app-page-content">
              <Routes>
                <Route path="/"           element={<SOSSend />} />
                <Route path="/dashboard"  element={<Dashboard />} />
                <Route
                  path="/log"
                  element={authorityUnlocked ? <AlertLog /> : <AuthorityGate onUnlock={() => setAuthorityUnlocked(true)} />}
                />
                <Route
                  path="/responders"
                  element={authorityUnlocked ? <Responders /> : <AuthorityGate onUnlock={() => setAuthorityUnlocked(true)} />}
                />
              </Routes>
            </div>
          </div>
          <button
            className={`mobile-menu-backdrop ${mobileMenuOpen ? 'show' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          />
        </div>
      </BrowserRouter>
    </AppContext.Provider>
  );
}

