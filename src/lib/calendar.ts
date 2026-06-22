import { HOLIDAYS, type Holiday } from '../data/holidays';

const DAY_MS = 24 * 60 * 60 * 1000;

function atLocalMidnight(value: Date | string): Date {
  if (typeof value === 'string') {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function daysUntil(from: Date, target: Date | string): number {
  const diff = atLocalMidnight(target).getTime() - atLocalMidnight(from).getTime();
  return Math.max(0, Math.round(diff / DAY_MS));
}

export function getNextHoliday(now: Date): Holiday & { days: number; active: boolean } {
  const today = atLocalMidnight(now);
  const found = HOLIDAYS.find((holiday) => atLocalMidnight(holiday.end) >= today);

  if (!found) {
    const nextNewYear: Holiday = {
      name: '元旦',
      start: `${now.getFullYear() + 1}-01-01`,
      end: `${now.getFullYear() + 1}-01-01`,
    };
    return { ...nextNewYear, days: daysUntil(now, nextNewYear.start), active: false };
  }

  const active = atLocalMidnight(found.start) <= today;
  return { ...found, days: active ? 0 : daysUntil(now, found.start), active };
}

export function daysToFriday(now: Date): number {
  return (5 - now.getDay() + 7) % 7;
}

export function daysToWeekend(now: Date): number {
  const day = now.getDay();
  if (day === 0 || day === 6) return 0;
  return 6 - day;
}

function clampPercent(value: number): number {
  return Math.min(100, Math.max(0, value * 100));
}

export function getProgress(now: Date) {
  const weekDay = now.getDay() === 0 ? 7 : now.getDay();
  const weekStart = new Date(now);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(now.getDate() - (weekDay - 1));
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const yearEnd = new Date(now.getFullYear() + 1, 0, 1);

  return {
    week: clampPercent((now.getTime() - weekStart.getTime()) / (weekEnd.getTime() - weekStart.getTime())),
    month: clampPercent((now.getTime() - monthStart.getTime()) / (monthEnd.getTime() - monthStart.getTime())),
    year: clampPercent((now.getTime() - yearStart.getTime()) / (yearEnd.getTime() - yearStart.getTime())),
  };
}

export function getLunarDate(date: Date): string {
  try {
    const parts = new Intl.DateTimeFormat('zh-CN-u-ca-chinese', {
      month: 'long',
      day: 'numeric',
    }).formatToParts(date);
    const month = parts.find((part) => part.type === 'month')?.value ?? '';
    const day = Number(parts.find((part) => part.type === 'day')?.value);
    const dayNames = [
      '', '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
      '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
      '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
    ];
    return `${month}${dayNames[day] ?? day}`;
  } catch {
    return '农历日期';
  }
}

export function formatHolidayDate(date: string): string {
  const target = atLocalMidnight(date);
  return `${target.getMonth() + 1}月${target.getDate()}日`;
}
