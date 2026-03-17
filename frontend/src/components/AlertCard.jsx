import React, { useState } from 'react';
import { Building2, Check, ChevronDown, Clock3, Flame, Globe, HeartPulse, MapPin, Megaphone, ShieldAlert, Wrench } from 'lucide-react';

const catIcons = {
  MEDICAL: HeartPulse,
  FIRE: Flame,
  SECURITY: ShieldAlert,
  LIFT: Building2,
  INFRASTRUCTURE: Wrench,
  GENERAL: Megaphone,
};

const catClass = {
  MEDICAL: 'cat-medical', FIRE: 'cat-fire', SECURITY: 'cat-security',
  LIFT: 'cat-lift', INFRASTRUCTURE: 'cat-infrastructure', GENERAL: 'cat-general',
};

function timeAgo(ts) {
  try {
    return new Date(ts).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    });
  } catch { return ts; }
}

export default function AlertCard({ alert, onAcknowledge, delay = 0, expanded = false }) {
  const [open, setOpen] = useState(false);

  const severityClass = alert.severity?.toLowerCase() || 'high';
  const statusClass = alert.status?.toLowerCase() || 'active';
  const CategoryIcon = catIcons[alert.category] || Megaphone;

  return (
    <div
      className={`alert-card ${severityClass} ${alert._new ? 'new-alert' : ''}`}
      style={{ animationDelay: `${delay}s` }}
      onClick={() => setOpen(o => !o)}
    >
      {/* Main row */}
      <div className="alert-card-main" style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        {/* Category icon */}
        <div className={`category-icon ${catClass[alert.category] || 'cat-general'}`}>
          <CategoryIcon size={16} />
        </div>

        {/* Content */}
        <div className="alert-card-content" style={{ flex: 1, minWidth: 0 }}>
          <div className="alert-card-title-row" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{alert.user_name}</span>
            <span className={`badge badge-${severityClass}`}>{alert.severity}</span>
            <span className={`badge badge-${statusClass}`}>{alert.status}</span>
          </div>
          <div className="alert-card-message" style={{
            fontSize: 13, color: 'var(--text-secondary)',
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: open ? 'normal' : 'nowrap',
          }}>
            {alert.emergency}
          </div>
          <div className="alert-card-meta" style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Clock3 size={12} /> {timeAgo(alert.timestamp)}</span>
            {alert.ip_address && <span className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Globe size={12} /> {alert.ip_address}</span>}
            {alert.latitude && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {Number(alert.latitude).toFixed(3)}, {Number(alert.longitude).toFixed(3)}</span>}
          </div>
        </div>

        {/* Chevron */}
        <div className="alert-card-chevron" style={{
          fontSize: 12, color: 'var(--text-muted)',
          transform: open ? 'rotate(180deg)' : 'none',
          transition: 'transform 0.2s',
          marginTop: 4,
        }}><ChevronDown size={14} /></div>
      </div>

      {/* Expanded details */}
      {open && (
        <div
          className="alert-card-details"
          style={{
            marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)',
            animation: 'fade-in 0.2s ease',
          }}
          onClick={e => e.stopPropagation()}
        >
          <div className="alert-card-detail-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            <Detail label="Alert ID" value={`#${alert.id}`} />
            <Detail label="Category" value={alert.category} />
            <Detail label="Severity" value={alert.severity} />
            <Detail label="Status" value={alert.status} />
            {alert.acknowledged_by && <Detail label="Resolved by" value={alert.acknowledged_by} />}
            {alert.acknowledged_at && <Detail label="Resolved at" value={timeAgo(alert.acknowledged_at)} />}
          </div>

          {alert.status === 'ACTIVE' && onAcknowledge && (
            <button
              className="btn btn-success"
              onClick={() => onAcknowledge(alert.id)}
              style={{ fontSize: 13 }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Check size={14} /> Mark Resolved</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

