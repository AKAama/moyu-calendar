import { Card, Cursor, Divider, Title } from 'animal-island-ui';
import { Analytics } from '@vercel/analytics/react';
import { init } from '@waline/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  daysToFriday,
  daysToWeekend,
  formatHolidayDate,
  getLunarDate,
  getNextHoliday,
  getProgress,
} from './lib/calendar';
import { APP_VERSION, CHANGELOG } from './data/changelog';
import { captureShareImage, shareImage } from './lib/share';
import ShareCard from './components/ShareCard';

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const BINGO_STORAGE_PREFIX = 'moyu-bingo';
const BINGO_TASKS = [
  '喝水回血',
  '假装查资料',
  '看天气',
  '刷评论区',
  '盯进度条',
  '去厕所',
  '打开文档',
  '思考人生',
  '等周五',
];
const BINGO_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function getBingoTitle(count: number) {
  if (count >= 9) return '摸鱼全勤王';
  if (count >= 7) return '带薪游牧大师';
  if (count >= 5) return '办公室隐身术士';
  if (count >= 3) return '水分补充专家';
  return '摸鱼见习生';
}

function copyTextFallback(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '0';
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);
  }
}

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

interface QuickNavProps {
  onOpenChangelog: () => void;
}

function QuickNav({ onOpenChangelog }: QuickNavProps) {
  return (
    <nav className="quick-nav" aria-label="摸鱼日历快捷导航">
      <a href="#today-section">今日</a>
      <a href="#countdown-section">盼头</a>
      <a href="#progress-section">进度</a>
      <a href="#bingo-section">宾果</a>
      <button type="button" onClick={onOpenChangelog}>
        更新
      </button>
      <a href="#waline-section">吐槽</a>
    </nav>
  );
}

function BingoCard() {
  const todayKey = getDateKey(new Date());
  const storageKey = `${BINGO_STORAGE_PREFIX}:${todayKey}`;
  const [selected, setSelected] = useState<number[]>(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(selected));
  }, [selected, storageKey]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const completedLine = useMemo(
    () => BINGO_LINES.find((line) => line.every((index) => selectedSet.has(index))) ?? null,
    [selectedSet],
  );
  const achievement = completedLine
    ? {
        title: getBingoTitle(selected.length),
        route: completedLine.map((index) => BINGO_TASKS[index]).join(' / '),
      }
    : null;
  const achievementText = achievement
    ? `今日摸鱼成就：${achievement.title}\n我完成了「${achievement.route}」摸鱼宾果！\n#摸鱼宾果`
    : '';

  const toggleCell = (index: number) => {
    setCopyState('idle');
    setSelected((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index].sort((a, b) => a - b),
    );
  };

  const resetBingo = () => {
    setSelected([]);
    setCopyState('idle');
  };

  const copyAchievement = async () => {
    if (!achievementText) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(achievementText);
      } else if (!copyTextFallback(achievementText)) {
        throw new Error('copy failed');
      }
      setCopyState('copied');
    } catch {
      setCopyState(copyTextFallback(achievementText) ? 'copied' : 'failed');
    }
  };

  return (
    <section id="bingo-section" className="bingo-section" aria-labelledby="bingo-title">
      <div className="section-title" id="bingo-title">
        <Title size="middle" color="app-teal">今日摸鱼宾果</Title>
      </div>
      <Card pattern="app-yellow" className="bingo-card">
        <div className="bingo-intro">
          <div>
            <span className="card-eyebrow">DAILY SIDE QUEST</span>
            <h2>点亮一条线，领取今日成就</h2>
          </div>
          <span className="bingo-count">{selected.length}/9</span>
        </div>
        <div className="bingo-board" role="group" aria-label="今日摸鱼宾果格子">
          {BINGO_TASKS.map((task, index) => {
            const isActive = selectedSet.has(index);
            const isWinning = completedLine?.includes(index) ?? false;

            return (
              <button
                key={task}
                type="button"
                className={`bingo-cell${isActive ? ' active' : ''}${isWinning ? ' winning' : ''}`}
                aria-pressed={isActive}
                onClick={() => toggleCell(index)}
              >
                <span>{task}</span>
              </button>
            );
          })}
        </div>
        <div className={`bingo-result${achievement ? ' unlocked' : ''}`}>
          {achievement ? (
            <>
              <span className="bingo-result-label">今日摸鱼成就</span>
              <strong>{achievement.title}</strong>
              <p>完成路线：{achievement.route}</p>
              <pre className="bingo-share-text">{achievementText}</pre>
              <div className="bingo-actions">
                <button className="bingo-copy-btn" type="button" onClick={copyAchievement}>
                  复制成就去吐槽区
                </button>
                <button className="bingo-reset-btn" type="button" onClick={resetBingo}>
                  重新摸
                </button>
              </div>
              {copyState === 'copied' && <span className="bingo-copy-hint">复制好了，去评论区晒一下吧。</span>}
              {copyState === 'failed' && <span className="bingo-copy-hint">复制失败，可以手动选中成就文案。</span>}
            </>
          ) : (
            <p>还差一条连线。摸鱼讲究节奏，不要急，慢慢点。</p>
          )}
        </div>
      </Card>
    </section>
  );
}

interface ChangelogDialogProps {
  onClose: () => void;
}

function ChangelogDialog({ onClose }: ChangelogDialogProps) {
  return (
    <div className="changelog-overlay" role="presentation" onClick={onClose}>
      <section
        className="changelog-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="changelog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="changelog-heading">
          <div>
            <p className="changelog-kicker">RELEASE NOTES</p>
            <Title size="middle" color="app-teal">更新日志</Title>
          </div>
          <button className="changelog-close" type="button" aria-label="关闭更新日志" onClick={onClose}>
            ×
          </button>
        </header>
        <span className="version-badge">当前版本 v{APP_VERSION}</span>
        <ol className="changelog-list">
          {CHANGELOG.map((entry) => (
            <li key={entry.version} className="changelog-item">
              <div className="changelog-meta">
                <span>v{entry.version}</span>
                <time dateTime={entry.date}>{entry.date}</time>
              </div>
              <h3>{entry.title}</h3>
              <ul>
                {entry.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function App() {
  const [now, setNow] = useState(() => new Date());
  const [isSharing, setIsSharing] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const walineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isChangelogOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsChangelogOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isChangelogOpen]);

  useEffect(() => {
    const el = walineRef.current;
    if (!el) return;

    const walineInstance = init({
      el,
      serverURL: 'https://waline.ismyh.cn',
      lang: 'zh-CN',
      dark: false,
      emoji: [
        '//unpkg.com/@waline/emojis@1.2.0/tieba',
        '//unpkg.com/@waline/emojis@1.2.0/bilibili',
      ],
      search: false,
      pageSize: 10,
    });

    return () => {
      walineInstance?.destroy();
    };
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
    <>
      <Cursor>
        <main className="page-shell">
          <section className="calendar-app" aria-label="打工人摸鱼日历">
            <header className="topbar">
              <div>
                <p className="kicker">WORKDAY SURVIVAL GUIDE</p>
                <h1>摸鱼日历</h1>
              </div>
              <div className="topbar-actions">
                <span className="status-pill">今天也有在努力</span>
                <button className="version-pill" type="button" onClick={() => setIsChangelogOpen(true)}>
                  v{APP_VERSION}
                </button>
              </div>
            </header>

            <QuickNav onOpenChangelog={() => setIsChangelogOpen(true)} />

            <section id="today-section" className="today-section">
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
            </section>

            <section id="countdown-section" className="countdown-section" aria-labelledby="countdown-title">
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

            <section id="progress-section" className="progress-section">
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
            </section>

            <BingoCard />

            <section id="waline-section" className="waline-section" aria-label="摸鱼吐槽区">
              <div className="waline-title">
                <Title size="middle" color="app-teal">摸鱼吐槽区</Title>
              </div>
              <p className="waline-hint">今天也在摸鱼吗？来留个言吧～</p>
              <Card pattern="app-teal" className="waline-card">
                <div ref={walineRef} className="waline-container" />
              </Card>
            </section>

            <footer>
              <p>认真工作，也认真休息。</p>
              <div className="footer-actions">
                <span>数据按本机时间自动更新</span>
                <a
                  href="https://github.com/AKAama/moyu-calendar/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="feedback-link"
                >
                  反馈
                </a>
                <button
                  className="share-btn"
                  type="button"
                  disabled={isSharing}
                  onClick={handleShare}
                >
                  分享摸鱼状态
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
              <div className="share-overlay-toast">正在生成分享图片…</div>
            </div>
          )}

          {isChangelogOpen && <ChangelogDialog onClose={() => setIsChangelogOpen(false)} />}
        </main>
      </Cursor>
      <Analytics />
    </>
  );
}

export default App;
