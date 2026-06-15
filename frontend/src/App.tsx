import React, { useState, useEffect, useCallback } from 'react';
import { Moon, ExternalLink, Trash2, Calendar as CalendarIcon, Bell } from 'lucide-react';
import { getMoonDate, getGregorianDate } from './utils';
import { WEEKLY_SCHEDULE } from './constants/weeklySchedule';
import ImportModal from './components/ImportModal';
import DayModal from './components/DayModal';
import YearView from './components/YearView';
import AlarmManager from './components/AlarmManager';
import { rescheduleAll, scheduleAlarm, cancelAlarm } from './services/notificationService';
import type { GregorianToMoonDate, ExternalEvent, PersonalEvent, Alarm } from './types';
import './index.css';

type Tab = 'today' | 'year' | 'alarms';

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const App: React.FC = () => {
  const [currentDate] = useState(new Date());
  const [moonInfo, setMoonInfo] = useState<GregorianToMoonDate | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('today');

  // ── External (imported) events ──────────────────────────────────────────
  const [externalEvents, setExternalEvents] = useState<ExternalEvent[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // ── Personal events ─────────────────────────────────────────────────────
  const [personalEvents, setPersonalEvents] = useState<PersonalEvent[]>([]);

  // ── Alarms ──────────────────────────────────────────────────────────────
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  // ── Day Modal ───────────────────────────────────────────────────────────
  const [selectedDay, setSelectedDay] = useState<{ date: Date; moonIndex: number; dayOfMoon: number } | null>(null);

  // ── Load from localStorage ───────────────────────────────────────────────
  useEffect(() => {
    // External events
    try {
      const saved = localStorage.getItem('moonCalendarEvents');
      if (saved) {
        const parsed = JSON.parse(saved).map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }));
        setExternalEvents(parsed);
      }
    } catch {}

    // Personal events
    try {
      const saved = localStorage.getItem('moonPersonalEvents');
      if (saved) setPersonalEvents(JSON.parse(saved));
    } catch {}

    // Alarms
    try {
      const saved = localStorage.getItem('moonAlarms');
      if (saved) {
        const parsed: Alarm[] = JSON.parse(saved);
        setAlarms(parsed);
        rescheduleAll(parsed, (id) => {
          // Mark as fired
          setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, firedAt: Date.now() } : a)));
        });
      }
    } catch {}
  }, []);

  // ── Persist external events ──────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('moonCalendarEvents', JSON.stringify(externalEvents));
    } catch (e) {
      console.warn('Could not save external events to localStorage', e);
    }
  }, [externalEvents]);

  // ── Persist personal events ──────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('moonPersonalEvents', JSON.stringify(personalEvents));
    } catch (e) {
      console.warn('Could not save personal events to localStorage', e);
    }
  }, [personalEvents]);

  // ── Persist alarms ───────────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem('moonAlarms', JSON.stringify(alarms));
    } catch (e) {
      console.warn('Could not save alarms to localStorage', e);
    }
  }, [alarms]);

  // ── Moon info for today ──────────────────────────────────────────────────
  useEffect(() => {
    setMoonInfo(getMoonDate(currentDate));
  }, [currentDate]);

  if (!moonInfo) return null;
  const currentMoon = moonInfo.moon;

  const startOfYear = currentDate.getMonth() < 2 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();

  // ── Handlers: External Events ────────────────────────────────────────────
  const handleImport = (newEvents: ExternalEvent[]) => {
    setExternalEvents((prev) => [...prev, ...newEvents]);
  };

  const handleClearAll = () => {
    if (window.confirm('Delete all imported events?')) setExternalEvents([]);
  };

  // ── Handlers: Personal Events ────────────────────────────────────────────
  const handleAddPersonalEvent = useCallback((event: PersonalEvent) => {
    setPersonalEvents((prev) => [...prev, event]);
  }, []);

  const handleDeletePersonalEvent = useCallback((id: string) => {
    setPersonalEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ── Handlers: Alarms ─────────────────────────────────────────────────────
  const handleAddAlarm = useCallback((alarm: Alarm) => {
    setAlarms((prev) => {
      const next = [...prev, alarm];
      scheduleAlarm(alarm, (id) =>
        setAlarms((a) => a.map((x) => (x.id === id ? { ...x, firedAt: Date.now() } : x)))
      );
      return next;
    });
  }, []);

  const handleDeleteAlarm = useCallback((id: string) => {
    cancelAlarm(id);
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleToggleAlarm = useCallback((id: string) => {
    setAlarms((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a));
      const alarm = next.find((a) => a.id === id);
      if (alarm) {
        cancelAlarm(id);
        if (alarm.enabled) {
          scheduleAlarm(alarm, (firedId) =>
            setAlarms((a) => a.map((x) => (x.id === firedId ? { ...x, firedAt: Date.now() } : x)))
          );
        }
      }
      return next;
    });
  }, []);

  // ── Day click handler ────────────────────────────────────────────────────
  const handleDayClick = useCallback((date: Date, moonIndex: number, dayOfMoon: number) => {
    setSelectedDay({ date, moonIndex, dayOfMoon });
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const cleanDescription = (desc: string) => {
    if (!desc) return '';
    return desc
      .replace(/transit notes/gi, '')
      .replace(/transit tasks/gi, '')
      .replace(/transit stress/gi, '')
      .replace(/win for the week/gi, '')
      .trim();
  };

  const upcomingAlarmCount = alarms.filter(
    (a) => a.enabled && new Date(`${a.date}T${a.time}`).getTime() > Date.now()
  ).length;

  // ── Selected day data for modal ──────────────────────────────────────────
  const selectedDayKey = selectedDay ? dateKey(selectedDay.date) : '';
  const selectedDayPersonal = personalEvents.filter((e) => e.date === selectedDayKey);
  const selectedDayExternal = externalEvents.filter(
    (e) => selectedDay && new Date(e.start).toDateString() === selectedDay.date.toDateString()
  );
  const selectedDayWeekly = selectedDay
    ? WEEKLY_SCHEDULE.filter((e) => {
        const jsDay = selectedDay.date.getDay(); // 0=Sun, 1=Mon…6=Sat
        const moonDay = jsDay === 0 ? 6 : jsDay - 1; // convert to 0=Mon…6=Sun
        return e.dayOfWeek === moonDay;
      })
    : [];

  // ── Today tab: current 28-day grid ──────────────────────────────────────
  const TodayGrid = () => (
    <>
      {/* Current Moon Summary */}
      <section className="current-moon-summary" style={{
        background: 'var(--bg-card)',
        padding: '2rem',
        borderRadius: '16px',
        border: '1px solid var(--border)',
        marginBottom: '3rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <Moon color="var(--accent-gold)" size={32} />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 300 }}>
            Moon {currentMoon.number}: {currentMoon.name}
          </h2>
        </div>
        <p style={{ fontSize: '1.1rem', color: 'var(--accent-silver)', fontStyle: 'italic', marginBottom: '1.5rem' }}>
          "{cleanDescription(currentMoon.energyTheme)}"
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cycle Progress</h3>
            <p style={{ fontSize: '1.4rem' }}>Day {moonInfo.dayOfMoon} of 28 <span style={{ color: 'var(--text-dim)', fontSize: '1rem' }}>(Week {moonInfo.weekOfMoon})</span></p>
          </div>
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gregorian Window</h3>
            <p style={{ fontSize: '1.1rem' }}>{currentMoon.startGregorian} — {currentMoon.endGregorian}</p>
          </div>
        </div>
      </section>

      {/* Monthly Grid Controls */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 400 }}>Monthly Grid — {currentMoon.name}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {externalEvents.length > 0 && (
              <button onClick={handleClearAll} style={{
                background: 'rgba(255,107,107,0.1)',
                border: '1px solid #ff6b6b',
                color: '#ff6b6b',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}>
                <Trash2 size={14} /> Clear {externalEvents.length}
              </button>
            )}
            <button onClick={() => setIsImportModalOpen(true)} style={{
              background: 'transparent',
              border: '1px solid var(--accent-gold)',
              color: 'var(--accent-gold)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <ExternalLink size={16} /> Import External
            </button>
          </div>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
          Tap any day to view details, add events, or set an alarm.
        </p>

        <div className="moon-grid">
          {Array.from({ length: 28 }).map((_, i) => {
            const day = i + 1;
            const dayOfWeek = i % 7;
            const isActive = day === moonInfo.dayOfMoon;
            const gregDate = getGregorianDate(currentMoon.number, day, startOfYear);
            const key = dateKey(gregDate);
            const dayEvents = WEEKLY_SCHEDULE.filter((e) => e.dayOfWeek === dayOfWeek);
            const dayPersonal = personalEvents.filter((e) => e.date === key);
            const dayExternal = externalEvents.filter(
              (e) => new Date(e.start).toDateString() === gregDate.toDateString()
            );
            const dayAlarms = alarms.filter((a) => a.enabled && a.date === key);

            return (
              <div
                key={i}
                className="day-card"
                onClick={() => handleDayClick(gregDate, -1, day)}
                style={{
                  borderColor: isActive ? 'var(--accent-gold)' : 'var(--border)',
                  background: isActive ? 'rgba(244,208,63,0.05)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {/* Alarm badge */}
                {dayAlarms.length > 0 && (
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'var(--accent-gold)', color: 'var(--bg-deep)', borderRadius: '99px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800, zIndex: 1 }}>
                    {dayAlarms.length}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                    <span className="day-number">Day {day}</span>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)', fontWeight: 300 }}>
                      {gregDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>
                    {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'][dayOfWeek]}
                  </span>
                </div>

                <div className="event-list">
                  {day === 1 && (
                    <div className="event-item" style={{ background: 'rgba(244,208,63,0.2)' }}>✨ {currentMoon.name} Begins</div>
                  )}
                  {dayPersonal.slice(0, 2).map((e) => (
                    <div key={e.id} className="event-item" style={{ borderLeftColor: e.color || 'var(--accent-gold)', background: 'rgba(255,255,255,0.05)' }}>
                      {e.startTime && <span style={{ opacity: 0.6, fontSize: '0.6rem' }}>{e.startTime} </span>}{e.title}
                    </div>
                  ))}
                  {dayExternal.slice(0, 1).map((e, idx) => (
                    <div key={`ext-${idx}`} className="event-item" style={{ background: 'rgba(255,255,255,0.1)', borderLeftColor: 'var(--accent-silver)' }}>
                      <span style={{ fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '2px', opacity: 0.7 }}>
                        <CalendarIcon size={8} /> {e.start.getHours()}:{String(e.start.getMinutes()).padStart(2, '0')}
                      </span>
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.slice(0, 1).map((e, idx) => (
                    <div key={`week-${idx}`} className="event-item" title={`${e.startTime}-${e.endTime}`}>
                      <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>{e.startTime}</span> {e.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );

  return (
    <div className="app-container">
      <header className="calendar-header">
        <h1>THE 13 MOONS</h1>
        <p style={{ color: 'var(--text-dim)', marginTop: '0.5rem' }}>
          {currentDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* ── Tab Navigation ───────────────────────────────── */}
      <nav className="tab-nav">
        <button onClick={() => setActiveTab('today')} className={`tab-btn${activeTab === 'today' ? ' active' : ''}`}>
          <Moon size={16} /> Today
        </button>
        <button onClick={() => setActiveTab('year')} className={`tab-btn${activeTab === 'year' ? ' active' : ''}`}>
          <CalendarIcon size={16} /> Year View
        </button>
        <button onClick={() => setActiveTab('alarms')} className={`tab-btn${activeTab === 'alarms' ? ' active' : ''}`}>
          <Bell size={16} /> My Alarms
          {upcomingAlarmCount > 0 && (
            <span className="tab-badge">{upcomingAlarmCount}</span>
          )}
        </button>
      </nav>

      <main style={{ paddingTop: '1.5rem' }}>
        {activeTab === 'today' && TodayGrid()}
        {activeTab === 'year' && (
          <YearView
            today={currentDate}
            externalEvents={externalEvents}
            personalEvents={personalEvents}
            alarms={alarms}
            onDayClick={handleDayClick}
          />
        )}
        {activeTab === 'alarms' && (
          <AlarmManager
            alarms={alarms}
            onToggleAlarm={handleToggleAlarm}
            onDeleteAlarm={handleDeleteAlarm}
          />
        )}
      </main>

      {/* ── Import Modal ─────────────────────────────────── */}
      {isImportModalOpen && (
        <ImportModal
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImport}
        />
      )}

      {/* ── Day Modal ────────────────────────────────────── */}
      {selectedDay && (
        <DayModal
          date={selectedDay.date}
          moonName={selectedDay.moonIndex >= 0 && selectedDay.moonIndex < 14
            ? (selectedDay.moonIndex === 13 ? 'Day Out of Time' : `Moon ${selectedDay.moonIndex + 1}`)
            : currentMoon.name}
          dayOfMoon={selectedDay.dayOfMoon}
          personalEvents={selectedDayPersonal}
          externalEvents={selectedDayExternal}
          weeklyEvents={selectedDayWeekly}
          alarms={alarms}
          onClose={() => setSelectedDay(null)}
          onAddPersonalEvent={handleAddPersonalEvent}
          onDeletePersonalEvent={handleDeletePersonalEvent}
          onAddAlarm={handleAddAlarm}
          onDeleteAlarm={handleDeleteAlarm}
          onToggleAlarm={handleToggleAlarm}
        />
      )}

      <footer style={{ marginTop: '5rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        <p>Built for Lovely Penelope Inc. • Focused Alignment System</p>
      </footer>
    </div>
  );
};

export default App;
