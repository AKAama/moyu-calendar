import { useEffect, useState } from 'react';

// 定位失败或不可用时回退到上海，保证天气始终有内容，不设权限墙。
const DEFAULT_LOCATION = { lat: 31.2304, lon: 121.4737, city: '上海' };

export interface WeatherData {
  temp: number;
  feelsLike?: number;
  conditionCode: string;
  humidity?: number;
  windSpeed?: number;
  city: string;
}

export interface WeatherState {
  loading: boolean;
  data: WeatherData | null;
  // 'not_configured' 表示后端凭据未配，应静默不渲染；其他为真实错误。
  error: string | null;
}

function getPosition(): Promise<{ lat: number; lon: number; city: string }> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      resolve(DEFAULT_LOCATION);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          city: '当前位置',
        }),
      () => resolve(DEFAULT_LOCATION),
      { timeout: 5000, maximumAge: 600000 },
    );
  });
}

export function useWeather(): WeatherState {
  const [state, setState] = useState<WeatherState>({ loading: true, data: null, error: null });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { lat, lon, city } = await getPosition();
        const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
        if (!res.ok) throw new Error(`weather request failed: ${res.status}`);
        const json = await res.json();

        if (json.status === 'not_configured') {
          if (!cancelled) setState({ loading: false, data: null, error: 'not_configured' });
          return;
        }

        const current = json.currentWeather;
        if (!current) throw new Error('missing currentWeather');

        if (!cancelled) {
          setState({
            loading: false,
            error: null,
            data: {
              temp: current.temperature,
              feelsLike: current.temperatureApparent,
              conditionCode: current.conditionCode ?? 'unknown',
              humidity: current.humidity,
              windSpeed: current.windSpeed,
              city,
            },
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ loading: false, data: null, error: err instanceof Error ? err.message : 'failed' });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
