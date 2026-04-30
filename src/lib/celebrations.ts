// Helpers for birthdays & anniversaries (date math without year)

export type CelebrationKind = 'birthday' | 'anniversary';

export interface CelebrationItem {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  position: string | null;
  department: string | null;
  date: string; // ISO date
  kind: CelebrationKind;
  daysUntil: number;
  age?: number;
  years?: number;
}

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysUntilNextOccurrence(monthDay: { m: number; d: number }, today: Date): number {
  const year = today.getFullYear();
  let next = new Date(year, monthDay.m, monthDay.d);
  // Strip time portion of "today"
  const todayMidnight = new Date(year, today.getMonth(), today.getDate());
  if (next.getTime() < todayMidnight.getTime()) {
    next = new Date(year + 1, monthDay.m, monthDay.d);
  }
  return Math.round((next.getTime() - todayMidnight.getTime()) / MS_PER_DAY);
}

export function buildCelebrations(
  profiles: Array<{
    user_id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    position: string | null;
    department: string | null;
    birth_date: string | null;
    start_date: string | null;
  }>,
  windowDays = 60,
): CelebrationItem[] {
  const today = new Date();
  const items: CelebrationItem[] = [];

  for (const p of profiles) {
    if (p.birth_date) {
      const d = new Date(p.birth_date);
      if (!isNaN(d.getTime())) {
        const days = daysUntilNextOccurrence({ m: d.getMonth(), d: d.getDate() }, today);
        if (days <= windowDays) {
          const nextYear = days === 0 ? today.getFullYear() : new Date(today.getTime() + days * MS_PER_DAY).getFullYear();
          items.push({
            user_id: p.user_id,
            first_name: p.first_name,
            last_name: p.last_name,
            avatar_url: p.avatar_url,
            position: p.position,
            department: p.department,
            date: p.birth_date,
            kind: 'birthday',
            daysUntil: days,
            age: nextYear - d.getFullYear(),
          });
        }
      }
    }
    if (p.start_date) {
      const d = new Date(p.start_date);
      if (!isNaN(d.getTime())) {
        const days = daysUntilNextOccurrence({ m: d.getMonth(), d: d.getDate() }, today);
        if (days <= windowDays) {
          const nextYear = days === 0 ? today.getFullYear() : new Date(today.getTime() + days * MS_PER_DAY).getFullYear();
          const years = nextYear - d.getFullYear();
          if (years > 0) {
            items.push({
              user_id: p.user_id,
              first_name: p.first_name,
              last_name: p.last_name,
              avatar_url: p.avatar_url,
              position: p.position,
              department: p.department,
              date: p.start_date,
              kind: 'anniversary',
              daysUntil: days,
              years,
            });
          }
        }
      }
    }
  }

  return items.sort((a, b) => a.daysUntil - b.daysUntil);
}

export function bucketByWindow(items: CelebrationItem[]) {
  return {
    today: items.filter((i) => i.daysUntil === 0),
    week: items.filter((i) => i.daysUntil > 0 && i.daysUntil <= 7),
    month: items.filter((i) => i.daysUntil > 7 && i.daysUntil <= 31),
    later: items.filter((i) => i.daysUntil > 31),
  };
}
