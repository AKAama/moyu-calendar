export interface Holiday {
  name: string;
  start: string;
  end: string;
}

// 2026 年日期按国务院办公厅公布的节假日安排维护。
// 每年只需更新此文件，页面和计算逻辑无需改动。
export const HOLIDAYS: Holiday[] = [
  { name: '元旦', start: '2026-01-01', end: '2026-01-03' },
  { name: '春节', start: '2026-02-15', end: '2026-02-23' },
  { name: '清明节', start: '2026-04-04', end: '2026-04-06' },
  { name: '劳动节', start: '2026-05-01', end: '2026-05-05' },
  { name: '端午节', start: '2026-06-19', end: '2026-06-21' },
  { name: '中秋节', start: '2026-09-25', end: '2026-09-27' },
  { name: '国庆节', start: '2026-10-01', end: '2026-10-07' },
  { name: '元旦', start: '2027-01-01', end: '2027-01-01' }
];
