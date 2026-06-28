import { useWeather } from '../lib/weather';
import { describeCondition } from '../lib/weatherConditions';

function round(value: number) {
  return Math.round(value * 10) / 10;
}

// 内联天气条，嵌入 today-card 内部，不再单独成 section。
export default function WeatherCard() {
  const { loading, data, error } = useWeather();

  // 后端凭据未配或请求出错时静默不渲染，不破坏页面。
  if (error === 'not_configured' || (!loading && !data)) {
    return null;
  }

  if (loading || !data) {
    return (
      <div className="weather-inline weather-inline--loading">正在获取天气…</div>
    );
  }

  const cond = describeCondition(data.conditionCode);
  const humidity = data.humidity !== undefined ? `${Math.round(data.humidity * 100)}%` : null;
  const wind = data.windSpeed !== undefined ? `${round(data.windSpeed)} km/h` : null;

  return (
    <div className="weather-inline">
      <span className="weather-emoji">{cond.emoji}</span>
      <div className="weather-temp">
        <strong>{round(data.temp)}</strong>
        <span>°C</span>
      </div>
      <div className="weather-cond">
        <span className="weather-cond-text">{cond.zh}</span>
        {data.feelsLike !== undefined && (
          <span className="weather-feels">体感 {round(data.feelsLike)}°</span>
        )}
      </div>
      {(humidity || wind) && (
        <div className="weather-meta">
          {humidity && <span>湿度 {humidity}</span>}
          {wind && <span>风速 {wind}</span>}
        </div>
      )}
      <span className="weather-city">{data.city}</span>
    </div>
  );
}
