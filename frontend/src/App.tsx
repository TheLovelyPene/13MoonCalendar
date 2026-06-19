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

const WEEKDAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

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

    try {
      const saved = localStorage.getItem('moonPersonalEvents');
      if (saved) setPersonalEvents(JSON.parse(saved));
    } catch {}

    try {
      const saved = localStorage.getItem('moonAlarms');
      if (saved) {
        const parsed: Alarm[] = JSON.parse(saved);
        setAlarms(parsed);
        rescheduleAll(parsed, (id) => {
          setAlarms((prev) => prev.map((a) => (a.id === id ? { ...a, firedAt: Date.now() } : a)));
        });
      }
    } catch {}
  }, []);

  // ── Persist external events ──────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem('moonCalendarEvents', JSON.stringify(externalEvents)); } catch {}
  }, [externalEvents]);

  // ── Persist personal events ──────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem('moonPersonalEvents', JSON.stringify(personalEvents)); } catch {}
  }, [personalEvents]);

  // ── Persist alarms ───────────────────────────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem('moonAlarms', JSON.stringify(alarms)); } catch {}
  }, [alarms]);

  // ── Moon info for today ──────────────────────────────────────────────────
  useEffect(() => {
    setMoonInfo(getMoonDate(currentDate));
  }, [currentDate]);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleAddPersonalEvent = useCallback((event: PersonalEvent) => {
    setPersonalEvents((prev) => [...prev, event]);
  }, []);

  const handleDeletePersonalEvent = useCallback((id: string) => {
    setPersonalEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

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

  const handleDayClick = useCallback((date: Date, moonIndex: number, dayOfMoon: number) => {
    setSelectedDay({ date, moonIndex, dayOfMoon });
  }, []);

  if (!moonInfo) return null;

  const currentMoon = moonInfo.moon;
  const startOfYear = currentDate.getMonth() < 2 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();

  const handleImport = (newEvents: ExternalEvent[]) => {
    setExternalEvents((prev) => [...prev, ...newEvents]);
  };

  const handleClearAll = () => {
    if (window.confirm('Delete all imported events?')) setExternalEvents([]);
  };

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
        const jsDay = selectedDay.date.getDay();
        const moonDay = jsDay === 0 ? 6 : jsDay - 1;
        return e.dayOfWeek === moonDay;
      })
    : [];

  // ── Today view: proper 7-col calendar grid ──────────────────────────────
  const TodayGrid = () => (
    <>
      {/* Current Moon Summary */}
      <section className="current-moon-summary">
        <div className="moon-summary-header">
          <Moon color="var(--accent-gold)" size={24} />
          <h2>Moon {currentMoon.number}: {currentMoon.name}</h2>
        </div>
        <p className="moon-energy-theme">"{cleanDescription(currentMoon.energyTheme)}"</p>
        <div className="moon-meta-grid">
          <div className="moon-meta-item">
            <h3>Cycle Progress</h3>
            <p>Day {moonInfo.dayOfMoon} / 28 <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Wk {moonInfo.weekOfMoon}</span></p>
          </div>
          <div className="moon-meta-item">
            <h3>Gregorian Window</h3>
            <p style={{ fontSize: '0.82rem', marginTop: '2px' }}>{currentMoon.startGregorian} – {currentMoon.endGregorian}</p>
          </div>
        </div>
      </section>

      {/* Calendar Controls */}
      <div className="calendar-section-header">
        <h2>{currentMoon.name}</h2>
        <div className="calendar-actions">
          {externalEvents.length > 0 && (
            <button onClick={handleClearAll} className="btn-outline-danger">
              <Trash2 size={13} /> {externalEvents.length}
            </button>
          )}
          <button onClick={() => setIsImportModalOpen(true)} className="btn-outline-gold">
            <ExternalLink size={13} /> Import
          </button>
        </div>
      </div>

      <p className="hint-text">Tap a day for details, events & alarms</p>

      {/* Weekday Headers */}
      <div className="weekday-header">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="weekday-label">{d}</div>
        ))}
      </div>

      {/* 7-Column Calendar Grid (4 rows × 7 cols = 28 days) */}
      <div className="moon-grid">
        {Array.from({ length: 28 }).map((_, i) => {
          const day = i + 1;
          const dayOfWeek = i % 7; // 0=Mon
          const isActive = day === moonInfo.dayOfMoon;
          const gregDate = getGregorianDate(currentMoon.number, day, startOfYear);
          const key = dateKey(gregDate);

          const hasPersonal = personalEvents.some((e) => e.date === key);
          const hasExternal = externalEvents.some(
            (e) => new Date(e.start).toDateString() === gregDate.toDateString()
          );
          const hasWeekly = WEEKLY_SCHEDULE.some((e) => e.dayOfWeek === dayOfWeek);
          const activeAlarms = alarms.filter((a) => a.enabled && a.date === key);

          return (
            <div
              key={i}
              className={`day-cell${isActive ? ' is-today' : ''}`}
              onClick={() => handleDayClick(gregDate, -1, day)}
            >
              {/* Alarm badge */}
              {activeAlarms.length > 0 && (
                <div className="alarm-badge">{activeAlarms.length}</div>
              )}

              {/* Day number */}
              <div className="day-cell-number">{day}</div>

              {/* Gregorian date */}
              <div className="day-cell-greg">
                {gregDate.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
              </div>

              {/* Event dot indicators */}
              <div className="day-cell-dots">
                {day === 1 && <span className="event-dot moon-start" title="Moon begins" />}
                {hasPersonal && <span className="event-dot personal" title="Personal event" />}
                {hasExternal && <span className="event-dot external" title="Imported event" />}
                {hasWeekly  && <span className="event-dot weekly"   title="Weekly event" />}
                {activeAlarms.length > 0 && <span className="event-dot alarm" title="Alarm set" />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item"><span className="event-dot personal" style={{ display:'inline-block' }} /> Personal</div>
        <div className="legend-item"><span className="event-dot external" style={{ display:'inline-block' }} /> Imported</div>
        <div className="legend-item"><span className="event-dot weekly"   style={{ display:'inline-block' }} /> Weekly</div>
        <div className="legend-item"><span className="event-dot alarm"    style={{ display:'inline-block' }} /> Alarm</div>
      </div>
    </>
  );

  return (
    <div className="app-container">
      <header className="calendar-header">
        <h1>THE 13 MOONS</h1>
        <p className="today-label">
          {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </header>

      {/* ── Desktop Top Tab Nav (hidden on mobile) ─── */}
      <nav className="tab-nav">
        <button onClick={() => setActiveTab('today')} className={`tab-btn${activeTab === 'today' ? ' active' : ''}`}>
          <Moon size={16} /> Today
        </button>
        <button onClick={() => setActiveTab('year')} className={`tab-btn${activeTab === 'year' ? ' active' : ''}`}>
          <CalendarIcon size={16} /> Year View
        </button>
        <button onClick={() => setActiveTab('alarms')} className={`tab-btn${activeTab === 'alarms' ? ' active' : ''}`}>
          <Bell size={16} /> My Alarms
          {upcomingAlarmCount > 0 && <span className="tab-badge">{upcomingAlarmCount}</span>}
        </button>
      </nav>

      <main style={{ paddingTop: '0.5rem' }}>
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

      {/* ── Mobile Bottom Navigation (Android-native style) ─── */}
      <nav className="bottom-nav">
        <button
          id="bottom-nav-today"
          className={`bottom-nav-btn${activeTab === 'today' ? ' active' : ''}`}
          onClick={() => setActiveTab('today')}
        >
          <span className="nav-icon-wrap"><Moon size={20} /></span>
          Today
        </button>
        <button
          id="bottom-nav-year"
          className={`bottom-nav-btn${activeTab === 'year' ? ' active' : ''}`}
          onClick={() => setActiveTab('year')}
        >
          <span className="nav-icon-wrap"><CalendarIcon size={20} /></span>
          Year
        </button>
        <button
          id="bottom-nav-alarms"
          className={`bottom-nav-btn${activeTab === 'alarms' ? ' active' : ''}`}
          onClick={() => setActiveTab('alarms')}
        >
          <span className="nav-icon-wrap"><Bell size={20} /></span>
          Alarms
          {upcomingAlarmCount > 0 && <span className="tab-badge">{upcomingAlarmCount}</span>}
        </button>
      </nav>

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
    </div>
  );
};

export default App;
