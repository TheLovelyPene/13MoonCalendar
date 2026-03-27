import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Moon, Calendar as CalendarIcon } from 'lucide-react';
import { MOONS } from '../constants/moons';
import { getGregorianDate } from '../utils';
import { WEEKLY_SCHEDULE } from '../constants/weeklySchedule';
import type { ExternalEvent, PersonalEvent, Alarm } from '../types';

interface YearViewProps {
  today: Date;
  externalEvents: ExternalEvent[];
  personalEvents: PersonalEvent[];
  alarms: Alarm[];
  onDayClick: (date: Date, moonIndex: number, dayOfMoon: number) => void;
}

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// The cycle starts Mar 1 of whatever year; for 2026: cycle started Mar 1, 2025
function getCycleStartYear(today: Date): number {
  const yr = today.getFullYear();
  const startOfCycle = new Date(yr, 2, 1); // Mar 1 current year
  return today < startOfCycle ? yr - 1 : yr;
}

const YearView: React.FC<YearViewProps> = ({
  today,
  externalEvents,
  personalEvents,
  alarms,
  onDayClick,
}) => {
  const cycleStart = getCycleStartYear(today);

  // Determine which moon is active today
  const todayMs = today.getTime();
  let activeMoonIndex = 0;
  for (let i = 0; i < 13; i++) {
    const moonStart = new Date(cycleStart, 2, 1);
    moonStart.setDate(moonStart.getDate() + i * 28);
    const moonEnd = new Date(moonStart);
    moonEnd.setDate(moonEnd.getDate() + 27);
    if (todayMs >= moonStart.getTime() && todayMs <= moonEnd.getTime()) {
      activeMoonIndex = i;
      break;
    }
    // Day Out of Time check (index 13)
    if (i === 12) {
      const dot = new Date(cycleStart, 2, 1);
      dot.setDate(dot.getDate() + 364);
      if (today.toDateString() === dot.toDateString()) activeMoonIndex = 13;
    }
  }

  const [viewIndex, setViewIndex] = useState(activeMoonIndex);

  const moon = MOONS[viewIndex];
  const isDayOutOfTime = viewIndex === 13;

  const days = isDayOutOfTime ? 1 : 28;

  const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div>
      {/* ── Moon navigator ──────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setViewIndex((v) => Math.max(0, v - 1))}
          disabled={viewIndex === 0}
          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.6rem 1rem', borderRadius: '10px', cursor: viewIndex === 0 ? 'default' : 'pointer', opacity: viewIndex === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
        >
          <ChevronLeft size={18} /> Prev
        </button>

        <div style={{ textAlign: 'center', flex: 1, padding: '0 1rem' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.25rem' }}>
            {isDayOutOfTime ? '✧ Special Day' : `Moon ${moon.number} of 13`}
          </p>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 300, color: 'var(--accent-gold)' }}>{moon.name}</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.25rem' }}>
            {moon.startGregorian} — {moon.endGregorian}
            {viewIndex === activeMoonIndex && (
              <span style={{ marginLeft: '0.75rem', background: 'rgba(244,208,63,0.15)', color: 'var(--accent-gold)', padding: '0.15rem 0.6rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600 }}>
                ← NOW
              </span>
            )}
          </p>
          <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--accent-silver)', marginTop: '0.3rem' }}>"{moon.energyTheme}"</p>
        </div>

        <button
          onClick={() => setViewIndex((v) => Math.min(13, v + 1))}
          disabled={viewIndex === 13}
          style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-main)', padding: '0.6rem 1rem', borderRadius: '10px', cursor: viewIndex === 13 ? 'default' : 'pointer', opacity: viewIndex === 13 ? 0.3 : 1, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}
        >
          Next <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Moon progress dots ───────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {MOONS.map((_, i) => (
          <button
            key={i}
            onClick={() => setViewIndex(i)}
            title={MOONS[i].name}
            style={{
              width: i === viewIndex ? 22 : 8,
              height: 8,
              borderRadius: 99,
              background: i === viewIndex ? 'var(--accent-gold)' : i === activeMoonIndex ? 'rgba(244,208,63,0.5)' : 'rgba(255,255,255,0.15)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* ── Day grid ────────────────────────────────────── */}
      {isDayOutOfTime ? (
        <div
          onClick={() => {
            const dot = new Date(cycleStart, 2, 1);
            dot.setDate(dot.getDate() + 364);
            onDayClick(dot, 13, 1);
          }}
          style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', border: '1px solid var(--accent-gold)', borderRadius: '20px', cursor: 'pointer' }}
        >
          <Moon size={48} color="var(--accent-gold)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.4rem', fontWeight: 300, marginBottom: '0.5rem', color: 'var(--accent-gold)' }}>Day Out of Time</h3>
          <p style={{ color: 'var(--text-dim)' }}>No work. No plans. Being.</p>
        </div>
      ) : (
        <div className="moon-grid">
          {Array.from({ length: days }).map((_, i) => {
            const dayNum = i + 1;
            const dayOfWeek = i % 7;
            const gregDate = getGregorianDate(moon.number, dayNum, cycleStart);
            const key = dateKey(gregDate);
            const isToday = gregDate.toDateString() === today.toDateString();
            const dayPersonal = personalEvents.filter((e) => e.date === key);
            const dayExternal = externalEvents.filter((e) => new Date(e.start).toDateString() === gregDate.toDateString());
            const dayAlarms = alarms.filter((a) => a.enabled && a.date === key);
            const dayWeekly = WEEKLY_SCHEDULE.filter((e) => e.dayOfWeek === dayOfWeek);
            const totalEvents = dayPersonal.length + dayExternal.length + dayWeekly.length;

            return (
              <div
                key={i}
                className="day-card"
                onClick={() => onDayClick(gregDate, viewIndex, dayNum)}
                style={{
                  borderColor: isToday ? 'var(--accent-gold)' : 'var(--border)',
                  background: isToday ? 'rgba(244,208,63,0.06)' : 'var(--bg-card)',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {/* Alarm badge */}
                {dayAlarms.length > 0 && (
                  <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'var(--accent-gold)', color: 'var(--bg-deep)', borderRadius: '99px', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 800 }}>
                    {dayAlarms.length}
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                  <span className="day-number" style={{ color: isToday ? 'var(--accent-gold)' : 'var(--text-dim)' }}>
                    {isToday ? '● ' : ''}{dayNum}
                  </span>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-dim)' }}>{DAYS_OF_WEEK[dayOfWeek]}</span>
                </div>

                <div style={{ fontSize: '0.6rem', color: 'var(--accent-silver)', marginBottom: '0.4rem' }}>
                  {gregDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>

                <div className="event-list">
                  {dayNum === 1 && (
                    <div className="event-item" style={{ background: 'rgba(244,208,63,0.2)', fontSize: '0.65rem' }}>✨ {moon.name}</div>
                  )}
                  {dayPersonal.slice(0, 2).map((e) => (
                    <div key={e.id} className="event-item" style={{ borderLeftColor: e.color || 'var(--accent-gold)', background: 'rgba(255,255,255,0.05)', fontSize: '0.65rem' }}>
                      {e.startTime && <span style={{ opacity: 0.6 }}>{e.startTime} </span>}{e.title}
                    </div>
                  ))}
                  {dayExternal.slice(0, 1).map((e) => (
                    <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.6rem', color: 'var(--accent-silver)', marginBottom: '2px' }}>
                      <CalendarIcon size={8} /> {e.title}
                    </div>
                  ))}
                  {totalEvents > 3 && (
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-dim)' }}>+{totalEvents - 3} more…</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default YearView;
