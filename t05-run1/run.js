// 고정 검사 10개 실행기 (브라우저·Node 공용). 검사 내용은 checks.js 에만 있다.
import { CHECKS } from './checks.js';

const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// expected 가 객체면 그 키만 골라 비교한다(키 순서는 expected 기준).
function pick(actual, expected) {
  if (!isObj(expected) || !isObj(actual)) return actual;
  return Object.fromEntries(Object.keys(expected).map((k) => [k, k in actual ? actual[k] : '(없음)']));
}

export async function runChecks() {
  let mod = null, loadErr = null;
  try { mod = await import(`../src/week.js?t=${Date.now()}`); } catch (e) { loadErr = e; }
  return CHECKS.map((c) => {
    const base = { id: c.id, title: c.title, call: c.call, input: c.input, expected: c.expected };
    try {
      if (loadErr) throw new Error(`src/week.js 를 불러오지 못함 (${loadErr.message})`);
      if (typeof mod.weekSummary !== 'function') throw new Error('weekSummary 함수가 없음');
      const summary = mod.weekSummary(c.input.rows, c.input.today);
      let actual;
      if (c.call === 'fmtWeek') {
        if (typeof mod.fmtWeek !== 'function') throw new Error('fmtWeek 함수가 없음');
        actual = mod.fmtWeek(summary);
      } else actual = pick(summary, c.expected);
      return { ...base, actual, pass: same(actual, c.expected), error: null };
    } catch (e) {
      return { ...base, actual: null, pass: false, error: e.message };
    }
  });
}

export function summarize(results) {
  const passed = results.filter((r) => r.pass).length;
  return { total: results.length, passed, failed: results.length - passed, any_fail: passed !== results.length };
}

// checks.js 원문의 SHA-256 — 고정 시점 값과 같으면 검사가 바뀌지 않은 것.
export async function checksHash(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text.replace(/\r\n/g, '\n')));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
