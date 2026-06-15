import React, { useState } from 'react';
import { X, Plus, Bell, Trash2, Music, Clock } from 'lucide-react';
import type { PersonalEvent, Alarm, ExternalEvent } from '../types';
import type { WeeklyEvent } from '../constants/weeklySchedule';
import { readFileAsDataUrl } from '../services/notificationService';

interface DayModalProps {
  date: Date;
  moonName: string;
  dayOfMoon: number;
  personalEvents: PersonalEvent[];
  externalEvents: ExternalEvent[];
  weeklyEvents: WeeklyEvent[];
  alarms: Alarm[];
  onClose: () => void;
  onAddPersonalEvent: (event: PersonalEvent) => void;
  onDeletePersonalEvent: (id: string) => void;
  onAddAlarm: (alarm: Alarm) => void;
  onDeleteAlarm: (id: string) => void;
  onToggleAlarm: (id: string) => void;
}

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const DayModal: React.FC<DayModalProps> = ({
  date,
  moonName,
  dayOfMoon,
  personalEvents,
  externalEvents,
  weeklyEvents,
  alarms,
  onClose,
  onAddPersonalEvent,
  onDeletePersonalEvent,
  onAddAlarm,
  onDeleteAlarm,
  onToggleAlarm,
}) => {
  const key = dateKey(date);

  // ── Personal Event Form ──────────────────────────────────────────────────
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');
  const [eventNotes, setEventNotes] = useState('');
  const [eventColor, setEventColor] = useState('#f4d03f');

  const handleAddEvent = () => {
    if (!eventTitle.trim()) return;
    onAddPersonalEvent({
      id: `pe-${Date.now()}`,
      title: eventTitle.trim(),
      date: key,
      startTime: eventStart || undefined,
      endTime: eventEnd || undefined,
      notes: eventNotes.trim() || undefined,
      color: eventColor,
    });
    setEventTitle('');
    setEventStart('');
    setEventEnd('');
    setEventNotes('');
    setEventColor('#f4d03f');
    setShowEventForm(false);
  };

  // ── Alarm Form ───────────────────────────────────────────────────────────
  const [showAlarmForm, setShowAlarmForm] = useState(false);
  const [alarmLabel, setAlarmLabel] = useState('');
  const [alarmTime, setAlarmTime] = useState('08:00');
  const [alarmMusicFile, setAlarmMusicFile] = useState<File | null>(null);
  const [alarmLoading, setAlarmLoading] = useState(false);

  const handleAddAlarm = async () => {
    if (!alarmLabel.trim() || !alarmTime) return;
    setAlarmLoading(true);
    let musicDataUrl: string | undefined;
    let musicFileName: string | undefined;
    if (alarmMusicFile) {
      musicDataUrl = await readFileAsDataUrl(alarmMusicFile);
      musicFileName = alarmMusicFile.name;
    }
    onAddAlarm({
      id: `alarm-${Date.now()}`,
      label: alarmLabel.trim(),
      date: key,
      time: alarmTime,
      musicFileName,
      musicDataUrl,
      enabled: true,
    });
    setAlarmLabel('');
    setAlarmTime('08:00');
    setAlarmMusicFile(null);
    setAlarmLoading(false);
    setShowAlarmForm(false);
  };

  const dayAlarms = alarms.filter((a) => a.date === key);

  const displayDate = date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.7rem 1rem',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-main)',
    fontSize: '0.9rem',
  };

  const btnPrimary: React.CSSProperties = {
    background: 'var(--accent-gold)',
    color: 'var(--bg-deep)',
    border: 'none',
    padding: '0.65rem 1.4rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: '0.9rem',
  };

  const btnGhost: React.CSSProperties = {
    background: 'transparent',
    color: 'var(--text-dim)',
    border: '1px solid var(--border)',
    padding: '0.65rem 1.2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        className="day-modal-sheet"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          borderRadius: '24px 24px 0 0',
          border: '1px solid var(--border)',
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '2rem',
          paddingBottom: '3rem',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.3rem' }}>
              {moonName} · Day {dayOfMoon}
            </p>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 400 }}>{displayDate}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '4px' }}>
            <X size={22} />
          </button>
        </div>

        {/* ── Weekly Schedule ─────────────────────────────────── */}
        {weeklyEvents.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              Weekly Rhythm
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {weeklyEvents.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(244,208,63,0.07)', borderLeft: '2px solid var(--accent-gold)', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <Clock size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--text-dim)', minWidth: '3.5rem' }}>{e.startTime}</span>
                  <span>{e.title}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── External Events ─────────────────────────────────── */}
        {externalEvents.length > 0 && (
          <section style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
              Imported Events
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {externalEvents.map((e) => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(189,195,199,0.08)', borderLeft: '2px solid var(--accent-silver)', borderRadius: '4px', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-dim)', minWidth: '3.5rem' }}>
                    {e.start.getHours()}:{String(e.start.getMinutes()).padStart(2, '0')}
                  </span>
                  <span>{e.title}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Personal Events ─────────────────────────────────── */}
        <section style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              My Events
            </h3>
            {!showEventForm && (
              <button onClick={() => setShowEventForm(true)} style={{ ...btnGhost, padding: '0.3rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Plus size={14} /> Add
              </button>
            )}
          </div>

          {personalEvents.map((e) => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.04)', borderLeft: `2px solid ${e.color || 'var(--accent-gold)'}`, borderRadius: '4px', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
              <div>
                {e.startTime && <span style={{ color: 'var(--text-dim)', marginRight: '0.5rem', fontSize: '0.8rem' }}>{e.startTime}</span>}
                <strong>{e.title}</strong>
                {e.notes && <p style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginTop: '2px' }}>{e.notes}</p>}
              </div>
              <button onClick={() => onDeletePersonalEvent(e.id)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                <Trash2 size={15} />
              </button>
            </div>
          ))}

          {showEventForm && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginTop: '0.75rem' }}>
              <input
                style={{ ...inputStyle, marginBottom: '0.6rem' }}
                placeholder="Event title *"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                autoFocus
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input style={inputStyle} type="time" value={eventStart} onChange={(e) => setEventStart(e.target.value)} />
                <input style={inputStyle} type="time" value={eventEnd} onChange={(e) => setEventEnd(e.target.value)} />
              </div>
              <textarea
                style={{ ...inputStyle, marginBottom: '0.6rem', resize: 'vertical', minHeight: '60px' }}
                placeholder="Notes (optional)"
                value={eventNotes}
                onChange={(e) => setEventNotes(e.target.value)}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Color:</label>
                {['#f4d03f', '#a29bfe', '#55efc4', '#fd79a8', '#74b9ff'].map((c) => (
                  <button key={c} onClick={() => setEventColor(c)} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: eventColor === c ? '2px solid white' : '2px solid transparent', cursor: 'pointer' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleAddEvent} style={btnPrimary} disabled={!eventTitle.trim()}>Save</button>
                <button onClick={() => setShowEventForm(false)} style={btnGhost}>Cancel</button>
              </div>
            </div>
          )}

          {personalEvents.length === 0 && !showEventForm && (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontStyle: 'italic' }}>No personal events yet. Tap Add to create one.</p>
          )}
        </section>

        {/* ── Alarms ──────────────────────────────────────────── */}
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Alarms
            </h3>
            {!showAlarmForm && (
              <button onClick={() => setShowAlarmForm(true)} style={{ ...btnGhost, padding: '0.3rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Bell size={14} /> Add Alarm
              </button>
            )}
          </div>

          {dayAlarms.map((a) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '0.4rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bell size={16} style={{ color: a.enabled ? 'var(--accent-gold)' : 'var(--text-dim)' }} />
                <div>
                  <strong>{a.label}</strong> <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginLeft: '0.4rem' }}>{a.time}</span>
                  {a.musicFileName && (
                    <p style={{ color: 'var(--accent-silver)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Music size={11} /> {a.musicFileName}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button
                  onClick={() => onToggleAlarm(a.id)}
                  style={{ background: a.enabled ? 'rgba(244,208,63,0.15)' : 'transparent', border: '1px solid var(--border)', color: a.enabled ? 'var(--accent-gold)' : 'var(--text-dim)', padding: '0.25rem 0.6rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  {a.enabled ? 'On' : 'Off'}
                </button>
                <button onClick={() => onDeleteAlarm(a.id)} style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}

          {showAlarmForm && (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1.25rem', marginTop: '0.75rem' }}>
              <input
                style={{ ...inputStyle, marginBottom: '0.6rem' }}
                placeholder="Alarm label (e.g. Morning Ritual) *"
                value={alarmLabel}
                onChange={(e) => setAlarmLabel(e.target.value)}
                autoFocus
              />
              <input
                style={{ ...inputStyle, marginBottom: '0.6rem' }}
                type="time"
                value={alarmTime}
                onChange={(e) => setAlarmTime(e.target.value)}
              />
              <div style={{ marginBottom: '0.75rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'block', marginBottom: '0.4rem' }}>
                  Choose Music (optional) — MP3, M4A, OGG from your device
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 1rem', border: '1px dashed var(--border)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', color: alarmMusicFile ? 'var(--accent-gold)' : 'var(--text-dim)' }}>
                  <Music size={16} />
                  {alarmMusicFile ? alarmMusicFile.name : 'Tap to choose a song…'}
                  <input
                    type="file"
                    accept="audio/*"
                    style={{ display: 'none' }}
                    onChange={(e) => setAlarmMusicFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleAddAlarm} style={btnPrimary} disabled={!alarmLabel.trim() || alarmLoading}>
                  {alarmLoading ? 'Saving…' : 'Set Alarm'}
                </button>
                <button onClick={() => setShowAlarmForm(false)} style={btnGhost}>Cancel</button>
              </div>
            </div>
          )}

          {dayAlarms.length === 0 && !showAlarmForm && (
            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', fontStyle: 'italic' }}>No alarms for this day yet.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default DayModal;
