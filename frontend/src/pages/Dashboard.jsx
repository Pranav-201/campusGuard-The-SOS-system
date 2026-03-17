import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import AlertCard from '../components/AlertCard';
import { formatDistanceToNow } from 'date-fns';
import { Activity, AlertTriangle, Building2, CheckCircle2, Flame, HeartPulse, Megaphone, ShieldAlert, Siren, Users, Wrench } from 'lucide-react';

const catIcons = {
  MEDICAL: HeartPulse,
  FIRE: Flame,
  SECURITY: ShieldAlert,
  LIFT: Building2,
  INFRASTRUCTURE: Wrench,
  GENERAL: Megaphone,
};

export default function Dashboard() {
  const { alerts, stats, responders, acknowledgeAlert } = useApp();
  const navigate = useNavigate();

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const recentAlerts = alerts.slice(0, 8);

  return (
    <div className="dashboard-page">

      {/* Hero Banner - Active Emergency */}
      {activeAlerts.length > 0 && (
        <div className="dashboard-hero" style={{
          background: 'linear-gradient(135deg, rgba(255,59,92,0.15) 0%, rgba(255,107,53,0.08) 100%)',
          border: '1px solid rgba(255,59,92,0.4)',
          borderRadius: 20,
          padding: '20px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          animation: 'slide-in 0.5s ease both',
        }}>
          <div className="dashboard-hero-content" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--red)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 22,
                boxShadow: '0 0 24px var(--red-glow)',
                animation: 'pulse-ring 2s infinite'
              }}>
                <AlertTriangle size={22} color="#fff" />
              </div>
            </div>
            <div>
              <div className="dashboard-hero-title" style={{ fontFamily: 'Sora', fontWeight: 800, fontSize: 18, color: 'var(--red)' }}>
                {activeAlerts.length} ACTIVE EMERGENCY{activeAlerts.length > 1 ? 'S' : ''}
              </div>
              <div className="dashboard-hero-subtitle" style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
                {activeAlerts[0]?.user_name}: {activeAlerts[0]?.emergency}
              </div>
            </div>
          </div>
          <button
            className="btn btn-danger dashboard-hero-action"
            onClick={() => navigate('/log')}
          >
            View All
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard
          label="Total Alerts"
          value={stats.total}
          icon={Activity}
          color="var(--blue)"
          glow="var(--blue-glow)"
        />
        <StatCard
          label="Active Now"
          value={stats.active}
          icon={AlertTriangle}
          color="var(--red)"
          glow="var(--red-glow)"
          pulse={stats.active > 0}
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          color="var(--green)"
          glow="var(--green-glow)"
        />
        <StatCard
          label="Responders"
          value={responders.length}
          icon={Users}
          color="var(--purple)"
          glow="var(--purple-glow)"
        />
      </div>

      {/* Main Grid */}
      <div className="dashboard-main-grid">

        {/* Left: Recent Alerts */}
        <div>
          <div className="dashboard-section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>Recent Alerts</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="live-dot" />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Live</span>
            </div>
          </div>

          {recentAlerts.length === 0 ? (
            <div className="dashboard-empty-state" style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 40, textAlign: 'center',
              color: 'var(--text-muted)',
            }}>
              <div style={{ fontSize: 40, marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
                <CheckCircle2 size={38} color="var(--green)" />
              </div>
              <div style={{ fontWeight: 600 }}>No active emergencies</div>
              <div style={{ fontSize: 13, marginTop: 4 }}>Campus is clear</div>
            </div>
          ) : (
            <div className="alerts-grid">
              {recentAlerts.map((alert, i) => (
                <AlertCard key={alert.id} alert={alert} onAcknowledge={acknowledgeAlert} delay={i * 0.05} />
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="dashboard-side-column">

          {/* Campus Map */}
          <CampusMap alerts={activeAlerts} />

          {/* Category breakdown */}
          {stats.by_category.length > 0 && (
            <div className="glass-card" style={{ padding: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>By Category</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.by_category.map(({ category, count }) => {
                  const pct = Math.round((count / stats.total) * 100);
                  const CatIcon = catIcons[category] || Megaphone;
                  return (
                    <div key={category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CatIcon size={14} />
                          <span style={{ color: 'var(--text-secondary)' }}>{category}</span>
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{count}</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${pct}%`, background: getCatColor(category) }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick SOS */}
          <div className="dashboard-quick-card" style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 20, textAlign: 'center',
          }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
              In an emergency?
            </p>
            <button
              className="btn btn-danger"
              onClick={() => navigate('/sos')}
              style={{ width: '100%', padding: '14px 20px', fontSize: 15, fontWeight: 700 }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Siren size={16} /> Send SOS Alert
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Stat Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatCard({ label, value, icon: Icon, color, glow, pulse }) {
  return (
    <div className="stat-card" style={{ animation: 'slide-in 0.4s ease both' }}>
      <div className="stat-glow" style={{ background: glow }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ display: 'flex' }}><Icon size={22} /></span>
        {pulse && <div className="live-dot" />}
      </div>
      <div
        className="stat-number"
        style={{ color, ...(pulse ? { textShadow: `0 0 20px ${glow}` } : {}) }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

// â”€â”€â”€ Campus Map (visual) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CampusMap({ alerts }) {
  // Map markers from lat/lon (normalized to Mumbai campus area)
  const baseCoords = { lat: 19.0760, lon: 72.8777 };
  const scale = 3000; // px per degree

  function toPixel(lat, lon) {
    const x = ((lon - baseCoords.lon) * scale * Math.cos(lat * Math.PI / 180)) + 150;
    const y = ((baseCoords.lat - lat) * scale) + 100;
    return { x: Math.max(8, Math.min(x, 292)), y: Math.max(8, Math.min(y, 192)) };
  }

  return (
    <div className="map-container" style={{ height: 220, padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <h4 style={{ fontSize: 13, fontWeight: 600 }}>Campus Map</h4>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{alerts.length} active</span>
      </div>

      <div style={{ position: 'relative', height: 160, background: 'var(--bg-secondary)', borderRadius: 10, overflow: 'hidden' }}>
        {/* Grid lines */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <line key={`v${i}`} x1={`${i * 14.3}%`} y1="0" x2={`${i * 14.3}%`} y2="100%"
              stroke="var(--text-muted)" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line key={`h${i}`} x1="0" y1={`${i * 20}%`} x2="100%" y2={`${i * 20}%`}
              stroke="var(--text-muted)" strokeWidth="0.5" />
          ))}
        </svg>

        {/* Buildings */}
        {[
          { label: 'Block A', x: 20, y: 30, w: 40, h: 30 },
          { label: 'Block B', x: 80, y: 20, w: 40, h: 40 },
          { label: 'Hostel',  x: 160, y: 60, w: 50, h: 35 },
          { label: 'Library', x: 60, y: 90, w: 45, h: 28 },
          { label: 'Canteen', x: 220, y: 30, w: 40, h: 25 },
        ].map(b => (
          <div key={b.label} style={{
            position: 'absolute',
            left: b.x, top: b.y, width: b.w, height: b.h,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 8, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{b.label}</span>
          </div>
        ))}

        {/* Alert pins */}
        {alerts.filter(a => a.latitude && a.longitude).map(alert => {
          const { x, y } = toPixel(alert.latitude, alert.longitude);
          return (
            <div
              key={alert.id}
              className="ping-dot"
              style={{ left: x - 8, top: y - 8 }}
              title={`${alert.user_name}: ${alert.emergency}`}
            />
          );
        })}

        {alerts.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            flexDirection: 'column', gap: 4,
          }}>
            <span style={{ display: 'flex' }}><CheckCircle2 size={20} color="var(--green)" /></span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>All clear</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getCatColor(cat) {
  const map = {
    MEDICAL: 'var(--orange)', FIRE: 'var(--red)',
    SECURITY: 'var(--blue)', LIFT: 'var(--purple)',
    INFRASTRUCTURE: 'var(--yellow)', GENERAL: 'var(--text-muted)',
  };
  return map[cat] || 'var(--text-muted)';
}

