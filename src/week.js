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

  const units = new Set(inWeek.map((r) => r.unit));
  if (units.size > 1) {
    return { state: 'unit_mismatch', count: inWeek.length, unit: null, min: null, max: null, avg: null, from, to };
  }

  let min = inWeek[0], max = inWeek[0], sum = 0;
  for (const r of inWeek) {
    if (r.normalized_value < min.normalized_value || (r.normalized_value === min.normalized_value && r.record_date > min.record_date)) min = r;
    if (r.normalized_value > max.normalized_value || (r.normalized_value === max.normalized_value && r.record_date > max.record_date)) max = r;
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

export function fmtWeek(summary) {
  if (summary.state === 'empty') return '최근 7일 기록 없음';
  if (summary.state === 'unit_mismatch') return '최근 7일 단위가 섞여 계산할 수 없음';
  return `최저 ${summary.min.value} ${summary.unit} · 최고 ${summary.max.value} ${summary.unit} · 평균 ${summary.avg} ${summary.unit} · 7일 중 ${summary.count}일 기록`;
}
