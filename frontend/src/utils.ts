import { MOONS } from './constants/moons';
import type { GregorianToMoonDate } from './types';

export function getMoonDate(date: Date): GregorianToMoonDate {
  // We'll normalize to the cycle starting Mar 1
  let currentYear = date.getFullYear();
  let startOfCycle = new Date(currentYear, 2, 1); // Mar 1 current year
  
  if (date < startOfCycle) {
    // If before Mar 1, it's part of the cycle that started last year
    startOfCycle = new Date(currentYear - 1, 2, 1);
  }

  const diffInMs = date.getTime() - startOfCycle.getTime();
  const dayIndex = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (dayIndex >= 364) {
    // Day 365 (and 366 in leap years) is Day Out of Time
    return {
      moon: MOONS[13],
      dayOfMoon: 1,
      weekOfMoon: 1,
      isDayOutOfTime: true
    };
  }

  const moonIndex = Math.floor(dayIndex / 28);
  const dayInMoon = (dayIndex % 28) + 1;
  const weekInMoon = Math.floor((dayInMoon - 1) / 7) + 1;

  return {
    moon: MOONS[moonIndex],
    dayOfMoon: dayInMoon,
    weekOfMoon: weekInMoon,
    isDayOutOfTime: false
  };
}

export function getGregorianDate(moonNumber: number | string, dayOfMoon: number, referenceYear: number): Date {
  const startOfCycle = new Date(referenceYear, 2, 1); // Mar 1
  if (moonNumber === "∞") {
    const d = new Date(startOfCycle);
    d.setDate(d.getDate() + 364);
    return d;
  }
  
  const mNum = typeof moonNumber === 'string' ? parseInt(moonNumber) : moonNumber;
  const daysOffset = (mNum - 1) * 28 + (dayOfMoon - 1);
  const d = new Date(startOfCycle);
  d.setDate(d.getDate() + daysOffset);
  return d;
}
