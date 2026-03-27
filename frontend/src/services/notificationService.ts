import type { Alarm } from '../types';

// ── Permission ──────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission === 'default') {
    return await Notification.requestPermission();
  }
  return Notification.permission;
}

export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
}

// ── Alarm Scheduling ─────────────────────────────────────────────────────────

// Map of alarmId → setTimeout handle (in-memory only; survives tab lifetime)
const scheduledTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Schedule a single alarm to fire at its date+time.
 * When it fires: shows a Notification and plays the chosen audio file.
 */
export function scheduleAlarm(alarm: Alarm, onFire?: (id: string) => void): void {
  // Clear any existing timer for this alarm
  cancelAlarm(alarm.id);

  if (!alarm.enabled) return;

  const [hours, minutes] = alarm.time.split(':').map(Number);
  const fireTime = new Date(alarm.date);
  fireTime.setHours(hours, minutes, 0, 0);

  const now = Date.now();
  const delay = fireTime.getTime() - now;

  if (delay <= 0) return; // Already passed

  const timer = setTimeout(async () => {
    scheduledTimers.delete(alarm.id);
    onFire?.(alarm.id);
    await fireAlarm(alarm);
  }, delay);

  scheduledTimers.set(alarm.id, timer);
}

export function cancelAlarm(id: string): void {
  const t = scheduledTimers.get(id);
  if (t !== undefined) {
    clearTimeout(t);
    scheduledTimers.delete(id);
  }
}

export function cancelAllAlarms(): void {
  scheduledTimers.forEach((t) => clearTimeout(t));
  scheduledTimers.clear();
}

// ── Reschedule all alarms on app load ────────────────────────────────────────

export function rescheduleAll(alarms: Alarm[], onFire?: (id: string) => void): void {
  cancelAllAlarms();
  alarms.forEach((a) => scheduleAlarm(a, onFire));
}

// ── Fire: Notification + Audio ───────────────────────────────────────────────

async function fireAlarm(alarm: Alarm): Promise<void> {
  // 1. Show browser notification
  if (Notification.permission === 'granted') {
    const musicNote = alarm.musicFileName ? ` 🎵 ${alarm.musicFileName}` : '';
    new Notification(`⏰ ${alarm.label}`, {
      body: `Your alarm is ringing!${musicNote}`,
      icon: '/moon-icon.png',
      badge: '/moon-icon.png',
      tag: alarm.id,
      requireInteraction: true,
    });
  }

  // 2. Play music (if a file was chosen and stored as data URL)
  if (alarm.musicDataUrl) {
    try {
      const audio = new Audio(alarm.musicDataUrl);
      audio.loop = false;
      await audio.play();
    } catch {
      // Audio can fail if user hasn't interacted with the page yet — that's OK
      console.warn('Could not auto-play alarm audio. User interaction required.');
    }
  }
}

// ── Utility: Read file as base64 data URL ────────────────────────────────────

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Format helpers ────────────────────────────────────────────────────────────

export function formatCountdown(alarm: Alarm): string {
  const [hours, minutes] = alarm.time.split(':').map(Number);
  const fireTime = new Date(alarm.date);
  fireTime.setHours(hours, minutes, 0, 0);
  const diff = fireTime.getTime() - Date.now();
  if (diff <= 0) return 'Past';
  const totalMins = Math.floor(diff / 60000);
  const d = Math.floor(totalMins / 1440);
  const h = Math.floor((totalMins % 1440) / 60);
  const m = totalMins % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}
