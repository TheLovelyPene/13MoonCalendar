import ICAL from 'ical.js';
import type { ExternalEvent } from '../types';

export function parseICS(icsData: string, source: ExternalEvent['source']): ExternalEvent[] {
  const jcalData = ICAL.parse(icsData);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents('vevent');

  return vevents.map(vevent => {
    const event = new ICAL.Event(vevent);
    return {
      id: event.uid,
      title: event.summary,
      start: event.startDate.toJSDate(),
      end: event.endDate.toJSDate(),
      description: event.description,
      source
    };
  });
}

export async function fetchExternalICS(url: string, source: ExternalEvent['source']): Promise<ExternalEvent[]> {
  // Note: Standard browser 'fetch' might hit CORS issues depending on provider settings. 
  // In a real app, you'd often use a small proxy. For MVP, we try direct or local file upload.
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch calendar');
    const data = await response.text();
    return parseICS(data, source);
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
