import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useApp } from '../App';
import { useNavigate } from 'react-router-dom';
import HomePatternBackground from '../components/HomePatternBackground';
import {
  ArrowLeft,
  Ban,
  Building2,
  CheckCircle2,
  Flame,
  HeartPulse,
  Loader2,
  MapPin,
  Megaphone,
  ShieldAlert,
  Siren,
  Wrench,
} from 'lucide-react';

const CATEGORIES = ['GENERAL', 'MEDICAL', 'FIRE', 'SECURITY', 'LIFT', 'INFRASTRUCTURE'];
const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const API_BASE = process.env.REACT_APP_API_BASE_URL || '/api';

const catInfo = {
  GENERAL: {
    icon: Megaphone,
    desc: 'General emergency or urgent assistance needed',
    tone: 'general',
  },
  MEDICAL: {
    icon: HeartPulse,
    desc: 'Medical emergency, injury, or health distress',
    tone: 'medical',
  },
  FIRE: {
    icon: Flame,
    desc: 'Fire, smoke, or combustion hazard',
    tone: 'fire',
  },
  SECURITY: {
    icon: ShieldAlert,
    desc: 'Security threat or suspicious activity',
    tone: 'security',
  },
  LIFT: {
    icon: Building2,
    desc: 'Lift entrapment or elevator malfunction',
    tone: 'lift',
  },
  INFRASTRUCTURE: {
    icon: Wrench,
    desc: 'Power, utility, or infrastructure failure',
    tone: 'infrastructure',
  },
};

export default function SOSSend() {
  const { token } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState('idle'); // idle | form | sending | sent
  const [coords, setCoords] = useState(null);
  const [locStatus, setLocStatus] = useState('idle'); // idle | loading | got | denied
  const [form, setForm] = useState({
    user_name: '',
    emergency: '',
    category: 'GENERAL',
    severity: 'HIGH',
  });
  const [countdown, setCountdown] = useState(3);
  const [sending, setSending] = useState(false);
    const [sentAt, setSentAt] = useState(null);
  const activeCategory = catInfo[form.category];

  // Get location
  useEffect(() => {
    if (step === 'form') {
      setLocStatus('loading');
      navigator.geolocation?.getCurrentPosition(
        pos => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
          setLocStatus('got');
        },
        () => setLocStatus('denied'),
        { timeout: 5000 }
      );
    }
  }, [step]);

  // Countdown after SOS button press
  useEffect(() => {
    if (step === 'sending') {
      if (countdown <= 0) {
        handleSend();
        return;
      }
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [step, countdown]);

  function handleSOSPress() {
    if (!form.user_name.trim()) {
      setStep('form');
      return;
    }
    setStep('sending');
    setCountdown(3);
  }

  function cancelCountdown() {
    setStep('form');
    setCountdown(3);
  }

  async function handleSend() {
    setSending(true);
    try {
      const body = {
        user_name: form.user_name || 'Anonymous',
        emergency: form.emergency || `${catInfo[form.category].desc}`,
        category: form.category,
        severity: form.severity,
        ...(coords && { latitude: coords.lat, longitude: coords.lon }),
      };

      const res = await fetch(`${API_BASE}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Auth-Token': token || 'demo_token' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429) {
          toast.error('Rate limit: max 3 alerts per minute');
        } else {
          toast.error(data.error || 'Failed to send alert');
        }
        setStep('form');
        return;
      }
      setStep('sent');
        setSentAt(new Date().toLocaleString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true,
        }));
      toast.success('SOS Alert sent! Help is on the way.');
    } catch (err) {
      toast.error('Network error - check your connection');
      setStep('form');
    } finally {
      setSending(false);
    }
  }

  if (step === 'sent') {
    return (
      <div className="sos-page">
        <section className="sos-state-card success">
          <div className="sos-state-icon success">
            <CheckCircle2 size={44} color="var(--green)" />
          </div>
          <h2 className="sos-state-title">Alert Sent Successfully</h2>
          <p className="sos-state-copy">
            Your SOS has been relayed to the campus control network through UDP broadcast and direct TCP responder dispatch.
          </p>

          <div className="sos-summary-card">
            <div className="sos-summary-title">Alert details</div>
          <InfoRow label="Name" value={form.user_name} />
          <InfoRow label="Emergency" value={form.emergency || activeCategory.desc} />
          <InfoRow label="Category" value={form.category} />
          <InfoRow label="Severity" value={form.severity} />
          {coords && <InfoRow label="Location" value={`${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`} />}
            {sentAt && <InfoRow label="Time" value={sentAt} />}
          </div>

          <div className="sos-state-actions">
            <button
              className="btn btn-ghost"
              onClick={() => {
                setStep('idle');
                setForm({ ...form, emergency: '' });
              }}
            >
              Send Another
            </button>
            <button className="btn btn-outline" onClick={() => navigate('/log')}>
              View Alert Log
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (step === 'sending') {
    return (
      <div className="sos-page">
        <section className="sos-state-card countdown">
          <div className="sos-countdown-label">Broadcasting SOS in</div>
          <div className="sos-countdown-ring">
            <span className="sos-countdown-value">{countdown}</span>
          </div>
          <p className="sos-state-copy">{form.emergency || activeCategory.desc}</p>

          <button className="btn btn-ghost" onClick={cancelCountdown}>
            Cancel
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className={`sos-page ${step === 'idle' ? 'sos-page-home' : ''}`}>
      {step === 'idle' ? (
        <>
            <HomePatternBackground />
            <section className="sos-home-content">
            <h2 className="sos-hero-title">Emergency help needed?</h2>
            <p className="sos-hero-subtitle">
              Just hold and release the call button.
            </p>

            <div className="sos-launch-wrap">
              <button className="sos-btn" onClick={() => setStep('form')}>
                SOS
              </button>
            </div>

            <p className="sos-hero-note">Don't panic. Team will arrive in a few minutes.</p>
      </section>
    </>
      ) : (
        <section className="sos-form-shell">
          <button
            className="sos-back-arrow"
            onClick={() => setStep('idle')}
            aria-label="Go back"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="sos-form-grid">
            <div className="sos-panel-section">
              <div className="form-label sos-section-label">Emergency Type</div>
              <div className="sos-category-grid">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setForm(f => ({ ...f, category: cat }))}
                  className={`sos-category-card ${form.category === cat ? 'active' : ''}`}
                >
                  <div className="sos-category-icon">
                    {React.createElement(catInfo[cat].icon, { size: 18 })}
                  </div>
                  <div className="sos-category-label">{cat}</div>
                </button>
              ))}
              </div>
            </div>

            <div className="sos-panel-section">
              <div className="sos-fields-stack">
                <div className="form-group">
              <label className="form-label">Your Name *</label>
              <input
                className="form-input"
                placeholder="e.g. Rahul Sharma"
                value={form.user_name}
                onChange={e => setForm(f => ({ ...f, user_name: e.target.value }))}
                autoFocus
              />
                </div>

                <div className="form-group">
              <label className="form-label">Emergency Description</label>
              <textarea
                className="form-textarea"
                placeholder={activeCategory.desc}
                value={form.emergency}
                onChange={e => setForm(f => ({ ...f, emergency: e.target.value }))}
                rows={3}
              />
                </div>

                <div className="form-group">
              <label className="form-label">Severity</label>
                  <div className="sos-severity-row">
                {SEVERITIES.map(sev => (
                  <button
                    key={sev}
                    onClick={() => setForm(f => ({ ...f, severity: sev }))}
                    className={`sos-severity-pill ${form.severity === sev ? 'active' : ''} sev-${sev.toLowerCase()}`}
                  >
                    {sev}
                  </button>
                ))}
                  </div>
                </div>

                <div
                  className={`sos-location-banner ${locStatus}`}
                >
                  <span className="sos-location-icon">
                    {locStatus === 'loading' ? (
                      <Loader2 size={18} className="spin" />
                    ) : locStatus === 'got' ? (
                      <MapPin size={18} />
                    ) : (
                      <Ban size={18} />
                    )}
                  </span>
                  <div>
                    <div className="sos-location-title">
                      {locStatus === 'loading'
                        ? 'Fetching current location...'
                        : locStatus === 'got'
                        ? `Location acquired: ${coords?.lat.toFixed(4)}, ${coords?.lon.toFixed(4)}`
                        : 'Location unavailable'}
                    </div>
                    <div className="sos-location-subtitle">Used for proximity-based responder dispatch.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-danger sos-broadcast-btn"
            onClick={handleSOSPress}
            disabled={!form.user_name.trim() || sending}
          >
            <span className="sos-broadcast-content">
              <Siren size={16} /> Broadcast SOS Alert
            </span>
          </button>

          <p className="sos-footnote">
            Max 3 alerts per minute.
          </p>
        </section>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="sos-info-row">
      <span className="sos-info-label">{label}</span>
      <span className="sos-info-value">{value}</span>
    </div>
  );
}

