// WeatherKit conditionCode → 中文 + emoji。
// 未命中的 conditionCode 回退到通用「未知」。
const CONDITION_MAP: Record<string, { zh: string; emoji: string }> = {
  Clear: { zh: '晴', emoji: '☀️' },
  MostlyClear: { zh: '大部晴朗', emoji: '🌤️' },
  PartlyCloudy: { zh: '局部多云', emoji: '⛅' },
  MostlyCloudy: { zh: '大部多云', emoji: '🌥️' },
  Cloudy: { zh: '阴', emoji: '☁️' },
  Foggy: { zh: '雾', emoji: '🌫️' },
  Drizzle: { zh: '毛毛雨', emoji: '🌦️' },
  Rain: { zh: '雨', emoji: '🌧️' },
  HeavyRain: { zh: '大雨', emoji: '🌧️' },
  ScatteredShowers: { zh: '零星阵雨', emoji: '🌦️' },
  Snow: { zh: '雪', emoji: '❄️' },
  HeavySnow: { zh: '大雪', emoji: '❄️' },
  Flurries: { zh: '阵雪', emoji: '🌨️' },
  WintryMix: { zh: '雨雪混合', emoji: '🌨️' },
  Sleet: { zh: '雨夹雪', emoji: '🌨️' },
  FreezingRain: { zh: '冻雨', emoji: '🌧️' },
  Thunderstorms: { zh: '雷阵雨', emoji: '⛈️' },
  IsolatedThunderstorms: { zh: '局部雷雨', emoji: '⛈️' },
  ScatteredThunderstorms: { zh: '零星雷雨', emoji: '⛈️' },
  Breezy: { zh: '微风', emoji: '🍃' },
  Windy: { zh: '大风', emoji: '💨' },
  Frigid: { zh: '严寒', emoji: '🥶' },
  Hot: { zh: '炎热', emoji: '🥵' },
  Cold: { zh: '寒冷', emoji: '🥶' },
  Hail: { zh: '冰雹', emoji: '🧊' },
};

export function describeCondition(code: string): { zh: string; emoji: string } {
  return CONDITION_MAP[code] ?? { zh: '未知', emoji: '🌡️' };
}
