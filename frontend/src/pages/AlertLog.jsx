import React from 'react';
import { useApp } from '../App';
import AlertCard from '../components/AlertCard';

export default function AlertLog() {
  const { alerts, stats, acknowledgeAlert } = useApp();
  const filtered = alerts;

  return (
    <div className="alertlog-page">

      <section className="alertlog-hero">
        <div>
          <p className="alertlog-eyebrow">Emergency Timeline</p>
          <h2 className="alertlog-heading">Alert Log & History</h2>
          <p className="alertlog-subheading">
            Track active incidents and review resolved alerts in one mobile-friendly response feed.
          </p>
        </div>
      </section>

      {/* Stats mini row */}
      <div className="alertlog-stats-row">
        {[
          { label: 'Total', value: stats.total, color: 'var(--blue)' },
          { label: 'Active', value: stats.active, color: 'var(--red)' },
          { label: 'Resolved', value: stats.resolved, color: 'var(--green)' },
          { label: 'Shown', value: filtered.length, color: 'var(--purple)' },
        ].map(s => (
          <div key={s.label} className="alertlog-stat-card">
            <span className="alertlog-stat-value" style={{ color: s.color }}>{s.value}</span>
            <span className="alertlog-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="alertlog-empty-state">
          <div className="alertlog-empty-title">No alerts available</div>
        </div>
      ) : (
        <div className="alerts-grid">
          {filtered.map((alert, i) => (
            <AlertCard key={alert.id} alert={alert} onAcknowledge={acknowledgeAlert} delay={i * 0.03} expanded />
          ))}
        </div>
      )}
    </div>
  );
}

