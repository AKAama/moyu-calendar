# 摸鱼日历

> 打工人摸鱼日历：看看今天离周五、周末和下一个假期还有多远。

[![CI](https://github.com/AKAama/moyu-calendar/actions/workflows/ci.yml/badge.svg)](https://github.com/AKAama/moyu-calendar/actions)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

一个温暖治愈的"摸鱼"倒计时小工具，帮助你优雅地度过每一个工作日。

在线访问：[47.96.83.175](http://47.96.83.175)

## 功能

- **今日面板** — 公历日期 + 农历 + 星期，一目了然
- **盼头补给站** — 距离周五 / 周末 / 下一个假期的倒计时
- **时间进度条** — 本周 / 本月 / 本年已过百分比
- **2026 节假日** — 内置国务院公布的全年假期安排
- **分享图片** — 一键生成摸鱼状态卡片，分享到微信/微博等社交平台
- **响应式** — 桌面端、平板、手机均可流畅使用

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 技术栈

- **React 18** + **TypeScript**
- **Vite** 构建工具
- **[animal-island-ui](https://www.npmjs.com/package/animal-island-ui)** 动物森友会风格 UI 组件库
- **html2canvas** 图片生成

## 项目结构

```
src/
├── main.tsx              # 入口
├── App.tsx               # 主页面
├── styles.css            # 全局样式
├── components/
│   └── ShareCard.tsx     # 分享卡片组件
├── lib/
│   ├── calendar.ts       # 日期计算逻辑
│   └── share.ts          # 截图与分享工具
└── data/
    └── holidays.ts       # 节假日数据
```

## 更新节假日

节假日数据在 `src/data/holidays.ts` 中维护。每年国务院公布新安排后，按以下格式更新即可：

```ts
{ name: '春节', start: '2027-02-06', end: '2027-02-12' },
```

## License

MIT

## 反馈

有建议或发现了 bug？欢迎 [提交 Issue](https://github.com/AKAama/moyu-calendar/issues) 或直接 PR~
