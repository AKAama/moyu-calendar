import { Card, Cursor, Divider, Title } from 'animal-island-ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  daysToFriday,
  daysToWeekend,
  formatHolidayDate,
  getLunarDate,
  getNextHoliday,
  getProgress,
} from './lib/calendar';
import { captureShareImage, shareImage } from './lib/share';
import ShareCard from './components/ShareCard';

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

interface CountdownCardProps {
  eyebrow: string;
  value: number;
  unit?: string;
  note: string;
  color: 'app-yellow' | 'app-teal' | 'app-pink';
}

function CountdownCard({ eyebrow, value, unit = '天', note, color }: CountdownCardProps) {
  return (
    <Card pattern={color} className="countdown-card">
      <span className="card-eyebrow">{eyebrow}</span>
      <div className="countdown-value">
        <strong>{value}</strong>
        <span>{unit}</span>
      </div>
      <p>{note}</p>
    </Card>
  );
}

function ProgressRow({ label, value, color }: { label: string; value: number; color: string }) {
  const rounded = Math.round(value * 10) / 10;
  return (
    <div className="progress-row">
      <div className="progress-meta">
        <span>{label}</span>
        <strong>{rounded}%</strong>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label={`${label}百分比`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
      >
        <span className="progress-fill" style={{ width: `${rounded}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function App() {
  const [now, setNow] = useState(() => new Date());
  const [isSharing, setIsSharing] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const handleShare = useCallback(async () => {
    const cardEl = shareCardRef.current?.querySelector<HTMLElement>('[data-share-card]');
    if (!cardEl) return;

    setIsSharing(true);
    try {
      // Give the browser a tick to render the hidden card before capture
      await new Promise((r) => setTimeout(r, 100));
      const blob = await captureShareImage(cardEl);
      const filename = `moyu-calendar-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.png`;
      await shareImage(blob, filename);
    } catch (err) {
      console.error('分享失败', err);
    } finally {
      setIsSharing(false);
    }
  }, [now]);

  const holiday = useMemo(() => getNextHoliday(now), [now]);
  const progress = useMemo(() => getProgress(now), [now]);
  const friday = daysToFriday(now);
  const weekend = daysToWeekend(now);

  const fridayNote = friday === 0 ? '今天就是周五，稳住别浪' : '再坚持一下，周五在招手';
  const weekendNote = weekend === 0 ? '周末进行中，请放心摸鱼' : '距离自由活动时间';
  const holidayNote = holiday.active
    ? `${holiday.name}假期进行中`
    : `${formatHolidayDate(holiday.start)} · ${holiday.name}`;

  return (
    <Cursor>
      <main className="page-shell">
        <section className="calendar-app" aria-label="打工人摸鱼日历">
          <header className="topbar">
            <div>
              <p className="kicker">WORKDAY SURVIVAL GUIDE</p>
              <h1>摸鱼日历</h1>
            </div>
            <span className="status-pill">今天也有在努力</span>
          </header>

          <Card pattern="default" className="today-card">
            <div className="date-block">
              <span className="month-year">
                {now.getFullYear()}年 {now.getMonth() + 1}月
              </span>
              <strong className="day-number">{String(now.getDate()).padStart(2, '0')}</strong>
            </div>
            <div className="today-copy">
              <span className="weekday">{WEEKDAYS[now.getDay()]}</span>
              <h2>{getLunarDate(now)}</h2>
              <p>宜：按时吃饭、适当发呆、准点下班</p>
            </div>
          </Card>

          <section className="countdown-section" aria-labelledby="countdown-title">
            <div className="section-title" id="countdown-title">
              <Title size="middle" color="app-teal">盼头补给站</Title>
            </div>
            <div className="countdown-grid">
              <CountdownCard
                eyebrow={`下一个假期 · ${holiday.name}`}
                value={holiday.days}
                note={holidayNote}
                color="app-yellow"
              />
              <CountdownCard
                eyebrow="距离周五"
                value={friday}
                note={fridayNote}
                color="app-teal"
              />
              <CountdownCard
                eyebrow="距离周末"
                value={weekend}
                note={weekendNote}
                color="app-pink"
              />
            </div>
          </section>

          <Card pattern="app-blue" className="progress-card">
            <div className="progress-heading">
              <div>
                <span className="card-eyebrow">时间进度条</span>
                <h2>生活正在加载中</h2>
              </div>
              <span className="loading-copy">慢慢来，比较快</span>
            </div>
            <Divider />
            <div className="progress-list">
              <ProgressRow label="本周已过" value={progress.week} color="#19c8b9" />
              <ProgressRow label="本月已过" value={progress.month} color="#889df0" />
              <ProgressRow label="本年已过" value={progress.year} color="#f8a6b2" />
            </div>
          </Card>

          <footer>
            <p>认真工作，也认真休息。</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span>数据按本机时间自动更新</span>
              <button
                className="share-btn"
                type="button"
                disabled={isSharing}
                onClick={handleShare}
              >
                📤 分享摸鱼状态
              </button>
            </div>
          </footer>
        </section>

        {/* 隐藏的分享卡片，用于截图 */}
        <div ref={shareCardRef} className="share-card-wrapper" aria-hidden="true">
          <ShareCard now={now} />
        </div>

        {/* 分享中的 loading 遮罩 */}
        {isSharing && (
          <div className="share-overlay">
            <div className="share-overlay-toast">✨ 正在生成分享图片…</div>
          </div>
        )}
      </main>
    </Cursor>
  );
}

export default App;
