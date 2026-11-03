# 과제 5 · 고정 계획 (작업 전 고정)

고정 시각: 2026-11-03 14:02 KST · 고정 뒤에는 이 문서의 "기능 규칙·검사·상한"을 바꾸지 않습니다.

## 1. 고를 개선 하나 — 최근 7일 요약

과제 4 대전 기온 정보판 ② 일별 기록 아래에 **최근 7일 최저·최고·평균** 한 줄을 보여 줍니다.

- `src/week.js` 에 두 함수를 만듭니다.
  - `weekSummary(rows, today)` — `rows`: 일별 기록 행 배열(`signal_id, record_date, normalized_value, unit`), `today`: 한국 날짜 `YYYY-MM-DD`
  - `fmtWeek(summary)` — 화면에 쓸 한 줄 문구
- 화면: ② 일별 기록 칸 아래 `data-testid="week-summary"` 요소에 `fmtWeek` 결과를 보여 줍니다. 입력은 `data/daily.json` 의 실제 행, `today` 는 페이지를 연 시각의 한국 날짜.

### 규칙

| 항목 | 규칙 |
|---|---|
| 대상 | `signal_id` 가 `daejeon-temperature-2m` 인 행만 |
| 기간 | `from = today − 6일`, `to = today`, 양 끝 포함 (7개 날짜). 범위 밖·미래 날짜는 제외 |
| 결과 모양 | `{ state, count, unit, min, max, avg, from, to }` |
| `state` | 기간 안 행이 없으면 `empty`, 단위가 둘 이상이면 `unit_mismatch`, 그 밖에는 `ok` |
| `count` | 기간 안 행 수 (`empty` 면 0) |
| `min` / `max` | `{ value, date }`. 같은 값이 여러 날이면 **더 최근 날짜**. `ok` 가 아니면 `null` |
| `avg` | 평균을 소수 1자리로 반올림한 숫자. `ok` 가 아니면 `null` |
| `unit` | `ok` 면 그 단위, 아니면 `null` |
| `fmtWeek` (ok) | `최저 {min} {unit} · 최고 {max} {unit} · 평균 {avg} {unit} · 7일 중 {count}일 기록` |

## 2. 고정 검사 10개

원문: [`t05/checks.js`](checks.js) (이 파일이 기준. 표는 요약)
고정 시점 SHA-256: `f3711bb7375f7c5db4926536222d673cc654f49afc7eaf7464e04784cf54ecd1`

| ID | 입력 (today · rows) | 관찰 가능한 기대값 |
|---|---|---|
| T05-W01 | 2026-11-03 · 없음 | state `empty`, count 0, min/max/avg `null`, from `2026-10-28`, to `2026-11-03` |
| T05-W02 | 2026-11-03 · 11-03 12.3 | `ok`, count 1, min=max=12.3(11-03), avg 12.3 |
| T05-W03 | 2026-11-03 · 11-01 14.2, 11-02 9.8, 11-03 11.5, 다른 signal 99.9 | count 3, min 9.8(11-02), max 14.2(11-01), avg 11.8 |
| T05-W04 | 2026-11-03 · 10-28 5.0, 11-03 7.0 | 경계 포함: count 2, min 5(10-28), avg 6 |
| T05-W05 | 2026-11-03 · 10-27 1.0, 11-03 7.0 | 경계 제외: count 1, min=max=7, avg 7 |
| T05-W06 | 2026-11-03 · 11-04 30.0, 11-03 7.0 | 미래 제외: count 1, max 7(11-03) |
| T05-W07 | 2027-01-02 · 12-26 −9.0, 12-27 0.6, 01-01 −3.4 | 연 넘김: from `2026-12-27`, count 2, min −3.4, max 0.6, avg −1.4 |
| T05-W08 | 2026-11-03 · 10-31 8, 11-01 10, 11-02 8, 11-03 10 | 동점은 최근 날짜: min 8(11-02), max 10(11-03), avg 9 |
| T05-W09 | 2026-11-03 · 11-02 10 °C, 11-03 50 °F | `unit_mismatch`, count 2, unit/min/max/avg `null` |
| T05-W10 | W03 과 같은 입력 · `fmtWeek` | `최저 9.8 °C · 최고 14.2 °C · 평균 11.8 °C · 7일 중 3일 기록` |

### 검사 실행 방법 (둘 중 하나)

1. 브라우저: 저장소 폴더에서 `python -m http.server 8000` → `http://localhost:8000/t05/checks.html` → 맨 위에 `n/10 PASS`
2. Node 18+: `node t05/run-checks.mjs` → 마지막 줄 `합계 n/10 PASS`, 하나라도 FAIL 이면 종료 코드 1

작업 시작 전 기준 결과: **0/10 PASS** (모두 "src/week.js 를 불러오지 못함")

## 3. 공통 사용 상한 (AI A·B 똑같이)

| 상한 | 값 | 세는 법 |
|---|---|---|
| 시간 | **60분** | 시작 기록 시각 → 종료 기록 시각 (`t05/LOG.md`) |
| 요청 수 | **12회** | 사람이 AI 에게 보낸 메시지 수 (최초 요청 포함). AI 내부 도구 호출은 세지 않음 |

## 4. A·B에 똑같이 주는 최초 요청

> 대전 기온 정보판 저장소에 "최근 7일 요약" 기능을 완성해 주세요. 규칙은 `t05/PLAN.md`, 검사는 `t05/checks.js` 에 고정되어 있습니다. `src/week.js` 에 `weekSummary(rows, today)` 와 `fmtWeek(summary)` 를 만들고, ② 일별 기록 아래 `data-testid="week-summary"` 요소에 한 줄 요약을 보여 주세요. `t05/` 의 검사·계획 파일은 고치지 마세요. 완료 기준은 `t05/checks.html` 에서 10/10 PASS 와 화면의 요약 한 줄입니다.

## 5. 나눠 맡는 지점 (계획한 중단 시점)

- **AI A**: `weekSummary` 의 기간·최저·최고·평균 계산까지 하고 멈춥니다. 동점 규칙(W08)·단위 섞임(W09)·문구(W10)·화면 연결은 남깁니다. A는 이 지점에서 `t05/HANDOFF.md` 를 쓰고 종료합니다.
- **AI B**: A와 다른 서비스 또는 모델. 저장소 + `t05/HANDOFF.md` 만 받고 나머지를 완성합니다.

## 6. 측정 규칙

- 오류 수 = 고정 검사 10개를 실행한 회차 중 FAIL 이 하나라도 나온 회차 수 (`t05/LOG.md` 실행 회차 표)
- 통과 수 = 각 AI 종료 시점 마지막 실행의 PASS 수
- 재작업량은 수기로 쓰지 않습니다 (A·B 각각의 시작·종료 커밋 쌍만 남김)
- 검사 삭제·완화·기대값 변경 = `git diff <고정 커밋> <B 종료 커밋> -- t05/checks.js` 줄 수로 확인 (0 이어야 함)
