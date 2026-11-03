// 과제 5 고정 검사 10개 — AI A 시작 전에 고정. 이 파일은 AI A·B 모두 수정 금지.
// 각 검사 = 고유 ID + 입력(rows, today) + 관찰 가능한 기대값.
// call 'weekSummary' : weekSummary(rows, today) 결과에서 expected 에 적힌 키만 비교한다.
// call 'fmtWeek'     : fmtWeek(weekSummary(rows, today)) 가 돌려준 문자열 전체를 비교한다.

const S = 'daejeon-temperature-2m';
const row = (record_date, normalized_value, unit = '°C', signal_id = S) => ({ signal_id, record_date, normalized_value, unit });

const W03_ROWS = [
  row('2026-11-01', 14.2),
  row('2026-11-02', 9.8),
  row('2026-11-03', 11.5),
  row('2026-11-02', 99.9, '°C', 'seoul-temperature-2m'), // 다른 signal — 무시되어야 함
];

export const CHECKS = Object.freeze([
  {
    id: 'T05-W01', title: '기록이 하나도 없으면 비어 있음',
    call: 'weekSummary', input: { rows: [], today: '2026-11-03' },
    expected: { state: 'empty', count: 0, min: null, max: null, avg: null, from: '2026-10-28', to: '2026-11-03' },
  },
  {
    id: 'T05-W02', title: '오늘 기록 하나뿐이면 최저=최고=평균',
    call: 'weekSummary', input: { rows: [row('2026-11-03', 12.3)], today: '2026-11-03' },
    expected: { state: 'ok', count: 1, unit: '°C', min: { value: 12.3, date: '2026-11-03' }, max: { value: 12.3, date: '2026-11-03' }, avg: 12.3 },
  },
  {
    id: 'T05-W03', title: '세 날 기록의 최저·최고·평균(소수 1자리), 다른 signal 무시',
    call: 'weekSummary', input: { rows: W03_ROWS, today: '2026-11-03' },
    expected: { state: 'ok', count: 3, unit: '°C', min: { value: 9.8, date: '2026-11-02' }, max: { value: 14.2, date: '2026-11-01' }, avg: 11.8 },
  },
  {
    id: 'T05-W04', title: '경계: 오늘−6일 기록은 포함',
    call: 'weekSummary', input: { rows: [row('2026-10-28', 5.0), row('2026-11-03', 7.0)], today: '2026-11-03' },
    expected: { state: 'ok', count: 2, min: { value: 5, date: '2026-10-28' }, max: { value: 7, date: '2026-11-03' }, avg: 6 },
  },
  {
    id: 'T05-W05', title: '경계: 오늘−7일 기록은 제외',
    call: 'weekSummary', input: { rows: [row('2026-10-27', 1.0), row('2026-11-03', 7.0)], today: '2026-11-03' },
    expected: { state: 'ok', count: 1, min: { value: 7, date: '2026-11-03' }, max: { value: 7, date: '2026-11-03' }, avg: 7 },
  },
  {
    id: 'T05-W06', title: '경계: 오늘보다 뒤 날짜 기록은 제외',
    call: 'weekSummary', input: { rows: [row('2026-11-04', 30.0), row('2026-11-03', 7.0)], today: '2026-11-03' },
    expected: { state: 'ok', count: 1, max: { value: 7, date: '2026-11-03' } },
  },
  {
    id: 'T05-W07', title: '연·월이 바뀌는 구간과 영하 값',
    call: 'weekSummary', input: { rows: [row('2026-12-26', -9.0), row('2026-12-27', 0.6), row('2027-01-01', -3.4)], today: '2027-01-02' },
    expected: { state: 'ok', count: 2, from: '2026-12-27', to: '2027-01-02', min: { value: -3.4, date: '2027-01-01' }, max: { value: 0.6, date: '2026-12-27' }, avg: -1.4 },
  },
  {
    id: 'T05-W08', title: '같은 값이 여러 날이면 더 최근 날짜를 보여 줌',
    call: 'weekSummary', input: { rows: [row('2026-11-01', 10.0), row('2026-11-02', 8.0), row('2026-11-03', 10.0), row('2026-10-31', 8.0)], today: '2026-11-03' },
    expected: { state: 'ok', count: 4, min: { value: 8, date: '2026-11-02' }, max: { value: 10, date: '2026-11-03' }, avg: 9 },
  },
  {
    id: 'T05-W09', title: '단위가 섞이면 계산하지 않음',
    call: 'weekSummary', input: { rows: [row('2026-11-02', 10.0, '°C'), row('2026-11-03', 50.0, '°F')], today: '2026-11-03' },
    expected: { state: 'unit_mismatch', count: 2, unit: null, min: null, max: null, avg: null },
  },
  {
    id: 'T05-W10', title: '화면에 쓰는 한 줄 문구',
    call: 'fmtWeek', input: { rows: W03_ROWS, today: '2026-11-03' },
    expected: '최저 9.8 °C · 최고 14.2 °C · 평균 11.8 °C · 7일 중 3일 기록',
  },
]);
