import html2canvas from 'html2canvas';

/** 摸鱼金句，每次随机取一句 */
const QUOTES = [
  '代码是公司的，身体是自己的。',
  '你摸的不是鱼，是带薪休息时间。',
  'Deadline 是第一生产力，但今天是周一。',
  '好好摸鱼，天天快乐。',
  '上班是生存，摸鱼是生活。',
  '认真工作，也认真休息。',
  '工资的一半是精神损失费。',
  '准时下班是基本人权。',
  '今天的鱼，明天再摸。',
  '摸鱼一时爽，一直摸鱼一直爽。',
  '上班如上坟？不如摸会儿鱼。',
  '距离财富自由还剩 47 年。',
  '人在工位，心在远方。',
  '你以为我在思考，其实我在发呆。',
  '午饭吃啥比工作重要多了。',
];

export function getRandomQuote(): string {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

/** 用 html2canvas 截取指定元素的图片 */
export async function captureShareImage(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: null,
    logging: false,
  });
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create image blob'));
      },
      'image/png',
      1.0,
    );
  });
}

/** 触发浏览器下载 */
export function downloadImage(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

/** 分享图片：优先用 Web Share API，不支持则下载 */
export async function shareImage(blob: Blob, filename: string): Promise<void> {
  if (navigator.share && navigator.canShare) {
    const file = new File([blob], filename, { type: 'image/png' });
    const data = { files: [file] };
    if (navigator.canShare(data)) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // user cancelled or API failed — fall through to download
      }
    }
  }
  downloadImage(blob, filename);
}
