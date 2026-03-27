#!/usr/bin/env python3
"""
13-Month Personal Calendar → ICS Sync Generator
Extracts month dates and focus areas to create an iCalendar feed.
"""

import re
import uuid
from datetime import datetime, timedelta
from pathlib import Path

BASE_DIR = Path(__file__).parent
MD_FILE = BASE_DIR / "calendar.md"
OUTPUT_FILE = BASE_DIR / "13_month_sync.ics"

def parse_moons(md: str):
    # Matches | 1 | Awakening | Mar 1 - Mar 28 | ... |
    # or | - | Year Day | Feb 28 | ... |
    pattern = r"\| *([\d-]+) *\| *([^|]+) *\| *([^|]+) *\| *([^|]+) *\|"
    moons = []
    for line in md.splitlines():
        match = re.search(pattern, line)
        if match:
            num_str, name, dates, theme = match.groups()
            num_str = num_str.strip()
            if num_str == "-" or num_str.isdigit():
                date_parts = [d.strip() for d in dates.split("-")]
                moons.append({
                    "num": int(num_str) if num_str.isdigit() else None,
                    "name": name.strip(),
                    "date_str": dates.strip(),
                    "start_str": date_parts[0],
                    "end_str": date_parts[-1], # Handles single date like Feb 28
                    "theme": theme.strip()
                })
    return moons

def parse_monthly_focus(md: str):
    pattern = r"\|\s*([\d-]+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|"
    focus = {}
    for line in md.splitlines():
        match = re.search(pattern, line)
        if match:
            num_str, primary, secondary, rest = match.groups()
            num_str = num_str.strip()
            key = int(num_str) if num_str.isdigit() else num_str
            focus[key] = {
                "primary": primary.strip(),
                "secondary": secondary.strip(),
                "rest": rest.strip()
            }
    return focus

def get_actual_date(date_str: str, base_year: int = 2026):
    # date_str is e.g. "Mar 1"
    dt = datetime.strptime(f"{date_str} {base_year}", "%b %d %Y")
    # If the month is Jan or Feb, it might be the next year (2027)
    if dt.month in [1, 2] and base_year == 2026:
        dt = dt.replace(year=2027)
    return dt

def create_ics(moons, focus_areas):
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Antigravity//13-Moon Calendar//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "X-WR-CALNAME:13-Moon Personal Calendar",
        "X-WR-TIMEZONE:UTC",
    ]

    for m in moons:
        start_date = get_actual_date(m["start_str"])
        # ICS end date is exclusive for all-day events
        end_date = get_actual_date(m["end_str"]) + timedelta(days=1)
        
        f = focus_areas.get(m["num"] if m["num"] else "-", {})
        description = f"Energy Theme: {m['theme']}\\n\\n"
        description += f"Primary Focus: {f.get('primary', 'N/A')}\\n"
        description += f"Secondary Focus: {f.get('secondary', 'N/A')}\\n"
        description += f"Rest Priority: {f.get('rest', 'N/A')}"

        # Month Event
        summary = f"📅 {m['name']}" if m["num"] else f"🌟 {m['name']}"
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{uuid.uuid4()}@antigravity.internal",
            f"DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%SZ')}",
            f"DTSTART;VALUE=DATE:{start_date.strftime('%Y%m%d')}",
            f"DTEND;VALUE=DATE:{end_date.strftime('%Y%m%d')}",
            f"SUMMARY:{summary}",
            f"DESCRIPTION:{description}",
            "STATUS:CONFIRMED",
            "TRANSP:TRANSPARENT",
            "END:VEVENT"
        ])

        # Weekly Events (only for regular months)
        if m["num"]:
            for w in range(4):
                w_start = start_date + timedelta(days=w*7)
                w_end = w_start + timedelta(days=7)
                w_num = (m["num"] - 1) * 4 + (w + 1)
                
                lines.extend([
                    "BEGIN:VEVENT",
                    f"UID:{uuid.uuid4()}@antigravity.internal",
                    f"DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%SZ')}",
                    f"DTSTART;VALUE=DATE:{w_start.strftime('%Y%m%d')}",
                    f"DTEND;VALUE=DATE:{w_end.strftime('%Y%m%d')}",
                    f"SUMMARY:📌 Week {w_num} ({m['name']} Wk {w+1})",
                    f"DESCRIPTION:Part of {m['name']} cycle.\\nFocus: {f.get('primary', 'Regular Routine')}",
                    "STATUS:CONFIRMED",
                    "TRANSP:TRANSPARENT",
                    "END:VEVENT"
                ])

    lines.append("END:VCALENDAR")
    return "\n".join(lines)

def main():
    if not MD_FILE.exists():
        print(f"❌ Could not find {MD_FILE}")
        return

    md_content = MD_FILE.read_text()
    
    # Split content by sections to avoid cross-table parsing issues
    sections = re.split(r"##\s+", md_content)
    
    year_at_glance = ""
    monthly_focus = ""
    
    for section in sections:
        if section.startswith("Year-at-a-glance"):
            year_at_glance = section
        elif section.startswith("Monthly Focus Areas"):
            monthly_focus = section

    months = parse_moons(year_at_glance)
    focus_areas = parse_monthly_focus(monthly_focus)
    
    ics_content = create_ics(months, focus_areas)
    OUTPUT_FILE.write_text(ics_content)
    print(f"✅ ICS file generated: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
