// 최근 7일 요약 (과제 5). 규칙: t05/PLAN.md 1절. 외부 호출 없음.
import { SIGNAL_ID } from './core.js';

// 'YYYY-MM-DD' 에서 n일 더한 날짜 (달력 계산만, 시간대 영향 없음)
export function addDays(date, n) {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

const round1 = (x) => Math.round(x * 10) / 10;

export function weekSummary(rows, today) {
  const from = addDays(today, -6), to = today;
  const inWeek = (rows || [])
    .filter((r) => r.signal_id === SIGNAL_ID && r.record_date >= from && r.record_date <= to)
    .sort((a, b) => a.record_date.localeCompare(b.record_date));
  if (!inWeek.length) return { state: 'empty', count: 0, unit: null, min: null, max: null, avg: null, from, to };

  // TODO(B): 단위가 섞이면 state 'unit_mismatch' (T05-W09)
  // TODO(B): 같은 값이 여러 날이면 더 최근 날짜 (T05-W08) — 지금은 먼저 나온(이른) 날짜가 남음
  let min = inWeek[0], max = inWeek[0], sum = 0;
  for (const r of inWeek) {
    if (r.normalized_value < min.normalized_value) min = r;
    if (r.normalized_value > max.normalized_value) max = r;
    sum += r.normalized_value;
  }
  return {
    state: 'ok',
    count: inWeek.length,
    unit: inWeek[0].unit,
    min: { value: min.normalized_value, date: min.record_date },
    max: { value: max.normalized_value, date: max.record_date },
    avg: round1(sum / inWeek.length),
    from, to,
  };
}

// TODO(B): fmtWeek(summary) — 문구 규칙은 t05/PLAN.md 1절, 기대값은 T05-W10
