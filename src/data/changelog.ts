export const APP_VERSION = '0.2.0';

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.2.0',
    date: '2026-06-23',
    title: '加上版本号和更新日志',
    changes: [
      '页面顶部展示当前版本号',
      '新增更新日志卡片，方便查看最近改了什么',
      '接入 Vercel Analytics，用于观察访问数据',
    ],
  },
  {
    version: '0.1.1',
    date: '2026-06-23',
    title: '优化评论区体验',
    changes: [
      '调整 Waline 评论区视觉风格',
      '修复表情选择框被卡片裁切的问题',
      '优化移动端评论输入和页脚布局',
    ],
  },
  {
    version: '0.1.0',
    date: '2026-06-22',
    title: '摸鱼日历初版',
    changes: [
      '展示日期、星期和农历',
      '展示假期、周五、周末倒计时',
      '展示本周、本月、本年进度条',
      '加入分享摸鱼状态和摸鱼吐槽区',
    ],
  },
];
