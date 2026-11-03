// src/week.js

export function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function weekSummary(rows, today) {
  const to = today;
  const toDate = new Date(to + 'T00:00:00');
  const fromDate = new Date(toDate);
  fromDate.setDate(toDate.getDate() - 6);
  
  const yyyy = fromDate.getFullYear();
  const mm = String(fromDate.getMonth() + 1).padStart(2, '0');
  const dd = String(fromDate.getDate()).padStart(2, '0');
  const from = `${yyyy}-${mm}-${dd}`;

  const filtered = (rows || []).filter(r => {
    if (r.signal_id !== 'daejeon-temperature-2m') return false;
    const rd = r.record_date;
    return rd >= from && rd <= to;
  });

  if (filtered.length === 0) {
    return { state: 'empty', count: 0, min: null, max: null, avg: null, from, to };
  }

  const units = [...new Set(filtered.map(r => r.unit || '°C'))];
  if (units.length > 1) {
    return { state: 'unit_mismatch', count: filtered.length, unit: null, min: null, max: null, avg: null, from, to };
  }
  const unit = units[0] || '°C';

  let minObj = null;
  let maxObj = null;
  let sum = 0;

  for (const r of filtered) {
    const val = r.normalized_value;
    const rd = r.record_date;
    sum += val;

    if (!minObj || val < minObj.value || (val === minObj.value && rd > minObj.date)) {
      minObj = { value: val, date: rd };
    }
    if (!maxObj || val > maxObj.value || (val === maxObj.value && rd > maxObj.date)) {
      maxObj = { value: val, date: rd };
    }
  }

  const avg = Math.round((sum / filtered.length) * 10) / 10;

  return {
    state: 'ok',
    count: filtered.length,
    unit,
    min: minObj,
    max: maxObj,
    avg,
    from,
    to
  };
}

export function fmtWeek(summary) {
  if (summary.state === 'empty') {
    return '최근 7일 기록 없음';
  }
  if (summary.state === 'unit_mismatch') {
    return '단위가 섞여 계산하지 못했습니다.';
  }
  return `최저 ${summary.min.value} ${summary.unit} · 최고 ${summary.max.value} ${summary.unit} · 평균 ${summary.avg} ${summary.unit} · 7일 중 ${summary.count}일 기록`;
}