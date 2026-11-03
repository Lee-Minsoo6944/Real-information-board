// Node 로 고정 검사 10개 실행:  node t05/run-checks.mjs
// 결과를 표로 찍고, 하나라도 FAIL 이면 종료 코드 1.
import { readFile } from 'node:fs/promises';
import { runChecks, summarize, checksHash } from './run.js';

const results = await runChecks();
for (const r of results) {
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.id}  ${r.title}${r.pass ? '' : `\n      기대: ${JSON.stringify(r.expected)}\n      실제: ${r.error ? `오류 — ${r.error}` : JSON.stringify(r.actual)}`}`);
}
const s = summarize(results);
const hash = await checksHash(await readFile(new URL('./checks.js', import.meta.url), 'utf8'));
console.log(`\n합계 ${s.passed}/${s.total} PASS · checks.js SHA-256 ${hash}`);
process.exit(s.any_fail ? 1 : 0);
