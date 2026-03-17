import React, { useState } from 'react';
import { useApp } from '../App';
import { toast } from 'react-hot-toast';
import { Building2, ClipboardList, Flame, Globe, HeartPulse, Landmark, Laptop2, MapPin, RadioTower, ShieldCheck, Trash2, UserRound } from 'lucide-react';

const ROLES = ['Medical Officer', 'Security Guard', 'Batch Guardian', 'Lift Maintenance', 'Hostel Warden', 'Fire Safety Officer', 'IT Support', 'Admin Staff'];
const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';

export default function Responders() {
  const { responders, fetchResponders, token, myResponder } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', role: ROLES[0], latitude: '', longitude: '' });

  function setDeviceResponderProfile(profile) {
    localStorage.setItem('sos_my_responder', JSON.stringify(profile));
    window.dispatchEvent(new Event('responder-profile-changed'));
  }

  async function addResponder(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/responders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || 'demo' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('Responder added');
        setDeviceResponderProfile({ name: form.name, role: form.role });
        setShowForm(false);
        setForm({ name: '', role: ROLES[0], latitude: '', longitude: '' });
        fetchResponders();
      }
    } catch {
      toast.error('Failed to add responder');
    }
  }

  async function clearResponders() {
    try {
      const res = await fetch(`${API_BASE}/responders`, {
        method: 'DELETE',
        headers: { 'X-Auth-Token': token || 'demo' },
      });
      if (!res.ok) {
        throw new Error('Request failed');
      }
      localStorage.removeItem('sos_my_responder');
      window.dispatchEvent(new Event('responder-profile-changed'));
      toast.success('All responders deleted');
      fetchResponders();
    } catch {
      toast.error('Failed to delete responders');
    }
  }

  async function deleteResponder(id) {
    try {
      const res = await fetch(`${API_BASE}/responders/${id}`, {
        method: 'DELETE',
        headers: { 'X-Auth-Token': token || 'demo' },
      });
      if (!res.ok) {
        throw new Error('Request failed');
      }
      toast.success('Responder deleted');
      fetchResponders();
    } catch {
      toast.error('Failed to delete responder');
    }
  }

  const roleIcon = {
    'Medical Officer':      HeartPulse,
    'Security Guard':       ShieldCheck,
    'Batch Guardian':       Landmark,
    'Lift Maintenance':     Building2,
    'Hostel Warden':        Landmark,
    'Fire Safety Officer':  Flame,
    'IT Support':           Laptop2,
    'Admin Staff':          ClipboardList,
  };

  const roleColor = {
    'Medical Officer':      'var(--orange)',
    'Security Guard':       'var(--blue)',
    'Batch Guardian':       'var(--yellow)',
    'Lift Maintenance':     'var(--purple)',
    'Hostel Warden':        'var(--yellow)',
    'Fire Safety Officer':  'var(--red)',
    'IT Support':           'var(--green)',
    'Admin Staff':          'var(--text-secondary)',
  };

  return (
    <div className="responders-page" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div className="responders-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontFamily: 'Sora', fontSize: 22 }}>Responders</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {responders.length} registered - Nearest responders receive TCP alerts directly
          </p>
          {myResponder?.role && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
              This device role: <strong>{myResponder.role}</strong>
            </p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost" onClick={clearResponders}>
            Delete All
          </button>
          <button className="btn btn-danger" onClick={() => setShowForm(s => !s)}>
            {showForm ? 'Cancel' : '+ Add Responder'}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showForm && (
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 16, padding: 24,
          animation: 'scale-in 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}>
          <h4 style={{ marginBottom: 20, fontFamily: 'Sora' }}>Register New Responder</h4>
          <form onSubmit={addResponder}>
            <div className="responders-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" required value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Dr. Ananya Sharma" />
              </div>
              <div className="form-group">
                <label className="form-label">Role *</label>
                <select className="form-select" value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input className="form-input" type="number" step="any"
                  value={form.latitude}
                  onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                  placeholder="19.0760" />
              </div>
              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input className="form-input" type="number" step="any"
                  value={form.longitude}
                  onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                  placeholder="72.8777" />
              </div>
            </div>
            <div className="responders-form-actions" style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-success">âœ“ Register</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Responders grid */}
      <div className="responders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {responders.map((resp, i) => (
          <div
            key={resp.id}
            className="glass-card"
            style={{
              padding: 20,
              position: 'relative',
              animation: `slide-in 0.4s ease ${i * 0.06}s both`,
            }}
          >
            <button
              className="btn btn-ghost"
              aria-label={`Delete ${resp.name}`}
              onClick={() => deleteResponder(resp.id)}
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                width: 34,
                height: 34,
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Trash2 size={15} />
            </button>

            {/* Role icon */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: `${roleColor[resp.role] || 'var(--purple)'}20`,
                border: `1px solid ${roleColor[resp.role] || 'var(--purple)'}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
              }}>
                {React.createElement(roleIcon[resp.role] || UserRound, { size: 20 })}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{resp.name}</div>
                <div style={{
                  fontSize: 11, color: roleColor[resp.role] || 'var(--purple)',
                  fontWeight: 600,
                }}>
                  {resp.role}
                </div>
              </div>
              <div style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                background: resp.is_active ? 'var(--green)' : 'var(--text-muted)',
                boxShadow: resp.is_active ? '0 0 6px var(--green-glow)' : 'none',
              }} />
            </div>

            <div className="divider" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {resp.latitude && resp.longitude && (
                <InfoRow icon={MapPin} label={`${Number(resp.latitude).toFixed(4)}, ${Number(resp.longitude).toFixed(4)}`} />
              )}
              {!resp.latitude && (
                <InfoRow icon={MapPin} label="No location set" muted />
              )}
              <InfoRow icon={Globe} label="TCP alert delivery enabled" />
              <InfoRow icon={RadioTower} label="UDP broadcast receiver" />
            </div>

            <div style={{ marginTop: 12 }}>
              <div
                className="badge"
                style={{
                  background: resp.is_active ? 'var(--green-soft)' : 'var(--border)',
                  color: resp.is_active ? 'var(--green)' : 'var(--text-muted)',
                  borderColor: resp.is_active ? 'rgba(0,230,118,0.3)' : 'var(--border)',
                }}
              >
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                {resp.is_active ? 'Active' : 'Inactive'}
              </div>
              <button
                className="btn btn-ghost"
                style={{ marginTop: 10, width: '100%' }}
                onClick={() => {
                  setDeviceResponderProfile({ name: resp.name, role: resp.role });
                  toast.success('Device role updated');
                }}
              >
                Use This Device As {resp.role}
              </button>
            </div>
          </div>
        ))}

        {responders.length === 0 && (
          <div style={{
            gridColumn: '1/-1', textAlign: 'center', padding: 60,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 16, color: 'var(--text-muted)',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12, display: 'flex', justifyContent: 'center' }}><UserRound size={36} /></div>
            <div style={{ fontWeight: 600 }}>No responders registered</div>
            <div style={{ fontSize: 13, marginTop: 4 }}>Add responders to enable proximity-based dispatch</div>
          </div>
        )}
      </div>

    </div>
  );
}

function InfoRow({ icon: Icon, label, muted }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ display: 'flex' }}><Icon size={13} /></span>
      <span style={{ fontSize: 12, color: muted ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}

