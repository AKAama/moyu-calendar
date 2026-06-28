import { useEffect, useState } from 'react';

export interface NextHoliday {
  name: string;
  start: string;
  end: string;
  days: number;
  active: boolean;
}

export interface CalendarStatus {
  date: string;
  isWorkday: boolean;
  isRestDay: boolean;
  isHoliday: boolean;
  isTransferWorkday: boolean;
  holidayName: string | null;
  nextHoliday: NextHoliday;
}

export interface CalendarState {
  loading: boolean;
  data: CalendarStatus | null;
  error: string | null;
}

export function useCalendarStatus(): CalendarState {
  const [state, setState] = useState<CalendarState>({ loading: true, data: null, error: null });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/calendar');
        if (!res.ok) throw new Error(`calendar request failed: ${res.status}`);
        const json: CalendarStatus = await res.json();
        if (!cancelled) setState({ loading: false, data: json, error: null });
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
