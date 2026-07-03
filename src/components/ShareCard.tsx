import { useMemo } from 'react';
import {
  formatHolidayDate,
  getLunarDate,
  getProgress,
} from '../lib/calendar';
import { getRandomQuote } from '../lib/share';
import type { CalendarStatus } from '../lib/useCalendarStatus';

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

interface ShareCardProps {
  now: Date;
  calendar: CalendarStatus | null;
}

export default function ShareCard({ now, calendar }: ShareCardProps) {
  const holiday = calendar?.nextHoliday;
  const progress = useMemo(() => getProgress(now), [now]);
  const friday = calendar?.daysToFriday;
  const restDay = calendar?.daysToRestDay;
  const quote = useMemo(() => getRandomQuote(), []);

  const holidayLabel = !holiday
    ? '日历数据加载中'
    : holiday.active
      ? `${holiday.name}假期进行中`
      : `${formatHolidayDate(holiday.start)} · ${holiday.name}`;

  const fridayLabel = friday === 0 ? '今天就是周五！' : '距离周五';
  const restDayLabel = restDay === 0 ? '休息日进行中' : '距离休息日';

  return (
    <div className="share-card" data-share-card>
      {/* 顶部品牌 */}
      <header className="share-header">
        <span className="share-kicker">WORKDAY SURVIVAL GUIDE</span>
        <h1 className="share-title">摸鱼日历</h1>
      </header>

      {/* 日期核心区 */}
      <div className="share-date-block">
        <span className="share-month-year">
          {now.getFullYear()}年 {now.getMonth() + 1}月
        </span>
        <strong className="share-day-number">
          {String(now.getDate()).padStart(2, '0')}
        </strong>
        <span className="share-weekday">{WEEKDAYS[now.getDay()]}</span>
        <span className="share-lunar">{getLunarDate(now)}</span>
        <p className="share-yi">宜：按时吃饭 · 适当发呆 · 准点下班</p>
      </div>

      {/* 倒计时区 */}
      <div className="share-countdowns">
        <div className="share-cd-item share-cd-friday">
          <span className="share-cd-eyebrow">{fridayLabel}</span>
          <strong>{friday === undefined ? '—' : friday === 0 ? '今' : friday}</strong>
          <span className="share-cd-unit">{friday === undefined || friday === 0 ? '' : '天'}</span>
        </div>
        <div className="share-cd-item share-cd-weekend">
          <span className="share-cd-eyebrow">{restDayLabel}</span>
          <strong>{restDay === undefined ? '—' : restDay === 0 ? '今' : restDay}</strong>
          <span className="share-cd-unit">{restDay === undefined || restDay === 0 ? '' : '天'}</span>
        </div>
        <div className="share-cd-item share-cd-holiday">
          <span className="share-cd-eyebrow">下一个假期</span>
          <strong>{!holiday ? '—' : holiday.active ? '今' : holiday.days}</strong>
          <span className="share-cd-unit">{!holiday || holiday.active ? '' : '天'}</span>
          <span className="share-cd-note">{holidayLabel}</span>
        </div>
      </div>

      {/* 进度条 */}
      <div className="share-progress-list">
        <ShareProgressBar label="本周已过" value={progress.week} color="#19c8b9" />
        <ShareProgressBar label="本月已过" value={progress.month} color="#889df0" />
        <ShareProgressBar label="本年已过" value={progress.year} color="#f8a6b2" />
      </div>

      {/* 底部金句 */}
      <footer className="share-footer">
        <p className="share-quote">「{quote}」</p>
        <span className="share-brand">摸鱼日历 · 今天也辛苦了</span>
      </footer>
    </div>
  );
}

function ShareProgressBar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const pct = Math.round(value * 10) / 10;
  return (
    <div className="share-progress-row">
      <div className="share-progress-meta">
        <span>{label}</span>
        <strong>{pct}%</strong>
      </div>
      <div className="share-progress-track">
        <span
          className="share-progress-fill"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
