export interface Moon {
  number: number | string;
  name: string;
  startGregorian: string; // "Mar 1"
  endGregorian: string; // "Mar 28"
  energyTheme: string;
}

export interface GregorianToMoonDate {
  moon: Moon;
  dayOfMoon: number; // 1-28
  weekOfMoon: number; // 1-4
  isDayOutOfTime: boolean;
}

export interface ExternalEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  source: 'google' | 'proton' | 'upload';
}

// User-created/edited personal events on any day
export interface PersonalEvent {
  id: string;
  title: string;
  date: string;        // ISO date string "YYYY-MM-DD"
  startTime?: string;  // "HH:mm"
  endTime?: string;    // "HH:mm"
  notes?: string;
  color?: string;      // optional color tag
}

// Push notification alarm with optional music
export interface Alarm {
  id: string;
  label: string;
  date: string;        // ISO date string "YYYY-MM-DD"
  time: string;        // "HH:mm" — 24hr
  musicFileName?: string;  // display name of chosen audio file
  musicDataUrl?: string;   // base64 data URL of the audio file
  enabled: boolean;
  firedAt?: number;    // timestamp when last fired, to avoid duplicates
}
