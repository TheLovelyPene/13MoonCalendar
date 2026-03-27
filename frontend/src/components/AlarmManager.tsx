import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Trash2, Music, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Alarm } from '../types';
import {
  requestNotificationPermission,
  getNotificationPermission,
  formatCountdown,
} from '../services/notificationService';

interface AlarmManagerProps {
  alarms: Alarm[];
  onToggleAlarm: (id: string) => void;
  onDeleteAlarm: (id: string) => void;
}

const AlarmManager: React.FC<AlarmManagerProps> = ({ alarms, onToggleAlarm, onDeleteAlarm }) => {
  const [permission, setPermission] = useState<NotificationPermission>(getNotificationPermission());
  const [tick, setTick] = useState(0);

  // Refresh countdowns every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  // Sort: upcoming first, then past; within each group sort by datetime
  const now = Date.now();
  const sorted = [...alarms].sort((a, b) => {
    const ta = new Date(`${a.date}T${a.time}`).getTime();
    const tb = new Date(`${b.date}T${b.time}`).getTime();
    const aFuture = ta > now;
    const bFuture = tb > now;
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    return ta - tb;
  });

  const upcoming = sorted.filter((a) => new Date(`${a.date}T${a.time}`).getTime() > now);
  const past = sorted.filter((a) => new Date(`${a.date}T${a.time}`).getTime() <= now);

  const displayDate = (dateStr: string) =>
    new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '1.1rem 1.25rem',
    marginBottom: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {/* ── Permission Banner ──────────────────────────── */}
      {permission === 'default' || permission === 'denied' ? (
        <div style={{
          background: permission === 'denied' ? 'rgba(255,107,107,0.12)' : 'rgba(244,208,63,0.1)',
          border: `1px solid ${permission === 'denied' ? '#ff6b6b' : 'var(--accent-gold)'}`,
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          {permission === 'denied' ? (
            <>
              <AlertCircle size={20} style={{ color: '#ff6b6b', flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, color: '#ff6b6b', marginBottom: '0.25rem' }}>Notifications blocked</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  To enable alarms, go to <strong>Chrome → Settings → Site Settings → Notifications</strong> and allow this site.
                </p>
              </div>
            </>
          ) : (
            <>
              <Bell size={20} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Enable alarm notifications</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                  Allow notifications so your alarms can ring even when the app is in the background.
                </p>
              </div>
              <button
                onClick={handleRequestPermission}
                style={{ background: 'var(--accent-gold)', color: 'var(--bg-deep)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap', fontSize: '0.875rem' }}
              >
                Allow
              </button>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: '#55efc4', fontSize: '0.85rem' }}>
          <CheckCircle2 size={16} />
          Notifications are enabled — your alarms will ring!
        </div>
      )}

      {/* ── Upcoming Alarms ────────────────────────────── */}
      <h3 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
        Upcoming ({upcoming.length})
      </h3>

      {upcoming.length === 0 && (
        <p style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '0.9rem', marginBottom: '2rem' }}>
          No upcoming alarms. Tap any day on the calendar to add one!
        </p>
      )}

      {upcoming.map((a) => (
        <div key={a.id + tick} style={{ ...cardStyle, borderColor: a.enabled ? 'rgba(244,208,63,0.3)' : 'var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Bell size={22} style={{ color: a.enabled ? 'var(--accent-gold)' : 'var(--text-dim)', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 600, marginBottom: '0.15rem' }}>{a.label}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Clock size={12} /> {displayDate(a.date)} at {a.time}
                <span style={{ color: 'var(--accent-gold)', marginLeft: '0.25rem' }}>· {formatCountdown(a)} away</span>
              </p>
              {a.musicFileName && (
                <p style={{ fontSize: '0.75rem', color: 'var(--accent-silver)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                  <Music size={11} /> {a.musicFileName}
                </p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
            <button
              onClick={() => onToggleAlarm(a.id)}
              title={a.enabled ? 'Disable alarm' : 'Enable alarm'}
              style={{ background: 'transparent', border: '1px solid var(--border)', color: a.enabled ? 'var(--accent-gold)' : 'var(--text-dim)', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
            >
              {a.enabled ? <Bell size={14} /> : <BellOff size={14} />}
              {a.enabled ? 'On' : 'Off'}
            </button>
            <button onClick={() => onDeleteAlarm(a.id)} title="Delete alarm" style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer', padding: '0.4rem' }}>
              <Trash2 size={17} />
            </button>
          </div>
        </div>
      ))}

      {/* ── Past Alarms ────────────────────────────────── */}
      {past.length > 0 && (
        <>
          <h3 style={{ fontSize: '0.8rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem', marginTop: '2rem' }}>
            Past ({past.length})
          </h3>
          {past.map((a) => (
            <div key={a.id} style={{ ...cardStyle, opacity: 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <BellOff size={22} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 600, marginBottom: '0.15rem' }}>{a.label}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                    {displayDate(a.date)} at {a.time}
                  </p>
                  {a.musicFileName && (
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-silver)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px' }}>
                      <Music size={11} /> {a.musicFileName}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={() => onDeleteAlarm(a.id)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default AlarmManager;
