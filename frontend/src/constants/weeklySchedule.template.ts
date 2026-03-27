// Example weekly rhythm — customize this to fit your own schedule.
// dayOfWeek: 0=Monday, 1=Tuesday, 2=Wednesday, 3=Thursday, 4=Friday, 5=Saturday, 6=Sunday

export interface WeeklyEvent {
  dayOfWeek: number;
  startTime: string; // "HH:mm"
  endTime: string;
  title: string;
  category: 'work' | 'rest' | 'spirit' | 'personal';
}

export const WEEKLY_SCHEDULE: WeeklyEvent[] = [
  // ── Weekdays (Mon–Fri) ──────────────────────────────────────────────────
  // Morning ritual
  { dayOfWeek: 0, startTime: "06:00", endTime: "08:00", title: "Morning Ritual", category: 'spirit' },
  { dayOfWeek: 1, startTime: "06:00", endTime: "08:00", title: "Morning Ritual", category: 'spirit' },
  { dayOfWeek: 2, startTime: "06:00", endTime: "08:00", title: "Morning Ritual", category: 'spirit' },
  { dayOfWeek: 3, startTime: "06:00", endTime: "08:00", title: "Morning Ritual", category: 'spirit' },
  { dayOfWeek: 4, startTime: "06:00", endTime: "08:00", title: "Morning Ritual", category: 'spirit' },

  // Deep work
  { dayOfWeek: 0, startTime: "09:00", endTime: "12:00", title: "Deep Work", category: 'work' },
  { dayOfWeek: 1, startTime: "09:00", endTime: "12:00", title: "Deep Work", category: 'work' },
  { dayOfWeek: 2, startTime: "09:00", endTime: "12:00", title: "Deep Work", category: 'work' },
  { dayOfWeek: 3, startTime: "09:00", endTime: "12:00", title: "Deep Work", category: 'work' },
  { dayOfWeek: 4, startTime: "09:00", endTime: "12:00", title: "Deep Work", category: 'work' },

  // Rest
  { dayOfWeek: 0, startTime: "12:00", endTime: "13:00", title: "Rest / Lunch", category: 'rest' },
  { dayOfWeek: 1, startTime: "12:00", endTime: "13:00", title: "Rest / Lunch", category: 'rest' },
  { dayOfWeek: 2, startTime: "12:00", endTime: "13:00", title: "Rest / Lunch", category: 'rest' },
  { dayOfWeek: 3, startTime: "12:00", endTime: "13:00", title: "Rest / Lunch", category: 'rest' },
  { dayOfWeek: 4, startTime: "12:00", endTime: "13:00", title: "Rest / Lunch", category: 'rest' },

  // Evening
  { dayOfWeek: 0, startTime: "20:00", endTime: "23:59", title: "Rest / Sleep", category: 'rest' },
  { dayOfWeek: 1, startTime: "20:00", endTime: "23:59", title: "Rest / Sleep", category: 'rest' },
  { dayOfWeek: 2, startTime: "20:00", endTime: "23:59", title: "Rest / Sleep", category: 'rest' },
  { dayOfWeek: 3, startTime: "20:00", endTime: "23:59", title: "Rest / Sleep", category: 'rest' },
  { dayOfWeek: 4, startTime: "20:00", endTime: "23:59", title: "Rest / Sleep", category: 'rest' },

  // ── Weekend ─────────────────────────────────────────────────────────────
  { dayOfWeek: 5, startTime: "09:00", endTime: "13:00", title: "Weekend Project / Rest", category: 'work' },
  { dayOfWeek: 5, startTime: "13:00", endTime: "14:00", title: "Rest / Lunch", category: 'rest' },
  { dayOfWeek: 5, startTime: "20:00", endTime: "23:59", title: "Rest / Sleep", category: 'rest' },

  { dayOfWeek: 6, startTime: "09:00", endTime: "12:00", title: "Weekend Rest / Reflection", category: 'spirit' },
  { dayOfWeek: 6, startTime: "12:00", endTime: "14:00", title: "Rest / Lunch", category: 'rest' },
  { dayOfWeek: 6, startTime: "20:00", endTime: "23:59", title: "Rest / Sleep", category: 'rest' },
];
