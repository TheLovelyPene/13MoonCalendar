# 🌙 The 13 Moons Calendar

A Progressive Web App (PWA) for tracking time through a 13-moon cycle — a 28-day rhythm calendar rooted in natural cycles rather than the Gregorian 12-month system.

**[→ Open the Live App](https://yourusername.github.io/13-moon-calendar/)**  
*(Replace with your actual GitHub Pages URL after deploying)*

---

## What Is the 13-Moon Calendar?

The 13-Moon Calendar divides the year into 13 moons of exactly 28 days each (364 days), plus one "Day Out of Time" — a day of rest and reflection outside of ordinary time. The cycle begins on **March 1** each year.

Each moon has a name, a Gregorian date window, and an energy theme to guide the month's intention.

## Features

- 🗓️ **Monthly Grid** — current moon's 28-day view with your weekly rhythm
- 📅 **Year View** — navigate all 13 moons with Prev/Next arrows
- ✏️ **Editable Events** — tap any day to add personal events with time, notes & color
- 🔔 **Alarm System** — set notification alarms with a music file from your device
- 📥 **Import External Calendars** — upload a `.ics` file from Google Calendar or ProtonMail
- 📲 **PWA Install** — add to your Android home screen via Firefox for a native app experience

## Install on Your Phone (Android)

1. Open **Firefox** on your Android phone
2. Navigate to the GitHub Pages URL above
3. Tap the **⋮ menu → Add to Home Screen**
4. The app installs like a native app with its own icon

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Customize Your Weekly Rhythm

Edit `frontend/src/constants/weeklySchedule.ts` to define your own recurring weekly schedule. This file is **gitignored** (kept private) — the template version is used for the public build.

The template is at `frontend/src/constants/weeklySchedule.template.ts`.

## The 13 Moons (2025–2026 Cycle)

| Moon | Name | Gregorian Window | Theme |
|------|------|-----------------|-------|
| 1 | Awakening Moon | Mar 1 – Mar 28 | New beginnings, seeds |
| 2 | Flow Moon | Mar 29 – Apr 25 | Building momentum |
| 3 | Bloom Moon | Apr 26 – May 23 | Growth, expansion |
| 4 | Long Light Moon | May 24 – Jun 20 | Peak energy, long days |
| 5 | Heat Moon | Jun 21 – Jul 18 | Intensity, transformation |
| 6 | Harvest Moon | Jul 19 – Aug 15 | Reaping rewards |
| 7 | Equinox Moon | Aug 16 – Sep 12 | Balance, reflection |
| 8 | Turning Moon | Sep 13 – Oct 10 | Release, letting go |
| 9 | Bare Branch Moon | Oct 11 – Nov 7 | Rest, stillness |
| 10 | Stillness Moon | Nov 8 – Dec 5 | Deep rest, dreaming |
| 11 | Solstice Moon | Dec 6 – Jan 2 | Darkest before dawn |
| 12 | Stirring Moon | Jan 3 – Jan 30 | First signs of change |
| 13 | Gateway Moon | Jan 31 – Feb 27 | Preparation, completion |
| ∞ | Day Out of Time | Feb 28 | No work. No plans. Being. |

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **ical.js** (ICS calendar parsing)
- **Lucide React** (icons)
- **PWA** (manifest + service worker)
- Zero backend — all data stays in your browser's `localStorage`

## Privacy

All your data (events, alarms, imported calendars) is stored **only in your browser's local storage**. Nothing is sent to any server.

---

Built with 🌙 by Lovely Penelope Inc.
