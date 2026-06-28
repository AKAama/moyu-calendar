import { useMemo } from 'react';
import { Card, Cursor } from 'animal-island-ui';
import type { CalendarStatus } from '../lib/useCalendarStatus';
import { getLunarDate } from '../lib/calendar';
import WeatherCard from './WeatherCard';

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
// 节日浮动 emoji，纯 CSS 动画，无依赖。
const PARTICLES = ['🎉', '🌴', '🍵', '🐟', '🎊', '💤'];

interface HolidayModeProps {
  now: Date;
  status: CalendarStatus;
  onExit: () => void;
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export default function HolidayMode({ now, status, onExit }: HolidayModeProps) {
  const title = status.holidayName ? `${status.holidayName}快乐！` : '周末快乐！';
  const subtitle = `${now.getMonth() + 1}月${now.getDate()}日 ${WEEKDAYS[now.getDay()]} ${getLunarDate(now)}`;

  const isHoliday = status.isHoliday;
  const tagline = isHoliday
    ? '法定假期，理直气壮地摸鱼。今天的 KPI 是：好好休息。'
    : '今天是休息日，老板的事，下周一再说。';

  // 假期进行中时，显示剩余天数（含今天）。
  const remainingDays = useMemo(() => {
    if (!status.isHoliday || !status.nextHoliday.active) return 0;
    const [y, m, d] = status.nextHoliday.end.split('-').map(Number);
    const end = new Date(y, m - 1, d);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((end.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)) + 1;
  }, [status, now]);

  return (
    <Cursor>
      <main className="page-shell">
        <section className="holiday-mode" aria-label="假期模式">
          <div className="holiday-particles" aria-hidden="true">
            {PARTICLES.map((emoji, index) => (
              <span
                key={emoji}
                className="holiday-particle"
                style={{
                  left: `${(index / PARTICLES.length) * 100 + 4}%`,
                  animationDelay: `${index * 0.8}s`,
                  animationDuration: `${7 + (index % 3)}s`,
                }}
              >
                {emoji}
              </span>
            ))}
          </div>

          <Card pattern="app-yellow" className="holiday-card">
            <span className="card-eyebrow">{isHoliday ? 'PUBLIC HOLIDAY' : 'WEEKEND MODE'}</span>
            <h1 className="holiday-title">{title}</h1>
            <p className="holiday-subtitle">{subtitle}</p>
            <p className="holiday-tagline">{tagline}</p>

            {isHoliday && remainingDays > 0 && (
              <p className="holiday-remaining">
                {status.holidayName}假期还剩 <strong>{remainingDays}</strong> 天，慢慢享受～
              </p>
            )}

            <div className="holiday-weather">
              <WeatherCard />
            </div>

            <button type="button" className="holiday-exit" onClick={onExit}>
              查看摸鱼日历 →
            </button>
          </Card>
        </section>
      </main>
    </Cursor>
  );
}
