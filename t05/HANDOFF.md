# 인수인계 — 최근 7일 요약 (AI A → AI B, 2회차)

작성: AI A · 2026-11-03 15:33 KST · 이 문서와 저장소만으로 이어서 작업할 수 있게 썼습니다. 앞 대화는 필요 없습니다.

## 1. 목표

대전 기온 정보판 ② 일별 기록 아래에 **최근 7일 최저·최고·평균** 한 줄을 보여 준다.
완료 = `t05/checks.html` 에서 **10/10 PASS** + 실제 정보판(`index.html`)에서 ② 일별 기록이 그대로 보이고 그 아래 `data-testid="week-summary"` 한 줄이 보임.
규칙 전체는 `t05/PLAN.md` 1절, 기대값은 `t05/checks.js`.

## 2. 현재 상태

| 항목 | 값 |
|---|---|
| 저장소 | https://github.com/Lee-Minsoo6944/t04-real-information-board |
| 브랜치 | **`t05-r2/week-summary`** (이 브랜치에서만 작업) |
| 코드 기준 버전 | **`950a116`** (`950a116e593d6d09344e9af9641bde6915581137`) — 이 문서는 바로 다음 커밋에서 추가되었고, 그 사이 `src/` 변경 없음 |
| 검사 고정 버전 | `3ff1a1c` (checks.js SHA-256 `f3711bb7375f7c5db4926536222d673cc654f49afc7eaf7464e04784cf54ecd1`) |
| 검사 결과 | **7/10 PASS** — W01~W07 통과, W08·W09·W10 실패 (`t05/results/A-run1.json`) |
| 만든 것 | `src/week.js`: `addDays`, `weekSummary` (기간 필터·최저·최고·평균·empty) |
| 아직 없는 것 | 동점 규칙, 단위 섞임 처리, `fmtWeek`, 화면 연결 (`index.html`, `src/app.js` 는 아직 손대지 않음) |

## 3. 실행 명령

필요한 것: Git, 그리고 Python 3 (브라우저 검사) 또는 Node 18+ (명령줄 검사). 설치할 패키지·환경값·비밀키 없음.

```
git clone -b t05-r2/week-summary https://github.com/Lee-Minsoo6944/t04-real-information-board.git t05-work
cd t05-work
python -m http.server 8000
```

- Windows 에서 `python` 이 "Microsoft Store" 안내만 띄우면 `py -m http.server 8000` 을 쓰세요.
- 검사(브라우저): `http://localhost:8000/t05/checks.html` → 맨 위 `n/10 PASS`
- 검사(Node): 저장소 맨 위 폴더에서 `node t05/run-checks.mjs` → 마지막 줄 `합계 n/10 PASS` (FAIL 이 있으면 종료 코드 1)
- 화면: `http://localhost:8000/` → ② 일별 기록 칸
- 서버는 반드시 저장소 **맨 위 폴더**에서 켭니다 (`t05/` 안에서 켜면 `src/week.js` 를 못 찾음).

## 4. 통과 검사

W01 빈 기록 · W02 하나뿐 · W03 세 날 + 다른 signal 무시 · W04 오늘−6일 포함 · W05 오늘−7일 제외 · W06 미래 제외 · W07 연 넘김·영하 → **7개 PASS**

## 5. 남은 문제 (첫 실패부터)

1. **T05-W08 (첫 실패)** — 같은 값이 여러 날이면 더 최근 날짜여야 함.
   기대 min `{8, 2026-11-02}`, max `{10, 2026-11-03}` / 실제 min `{8, 2026-10-31}`, max `{10, 2026-11-01}`.
   원인: `src/week.js` 루프가 `<`, `>` 로만 바꿔서 먼저 나온(이른) 날짜가 남음. 행은 날짜 오름차순으로 정렬되어 있음.
2. **T05-W09** — 단위가 둘 이상이면 `{ state: 'unit_mismatch', count: 행 수, unit/min/max/avg: null, from, to }`. 지금은 그냥 `ok` 로 계산함.
3. **T05-W10** — `fmtWeek(summary)` 가 없음. ok 일 때 문구는 `최저 {min} {unit} · 최고 {max} {unit} · 평균 {avg} {unit} · 7일 중 {count}일 기록` (기대값: `최저 9.8 °C · 최고 14.2 °C · 평균 11.8 °C · 7일 중 3일 기록`). `empty`·`unit_mismatch` 문구는 검사 대상이 아니므로 자유 (예: "최근 7일 기록 없음", "단위가 섞여 계산하지 않음").
4. **화면 연결 (검사 밖, 완료 조건)** — 아직 화면에 안 나옴. 고정 검사는 `src/week.js` 만 보므로 화면이 깨져도 10/10 이 나올 수 있음 → 반드시 정보판을 직접 열어 확인.

## 6. 다음 행동

1. `src/week.js` 에서 W08 → W09 → W10 순서로 고치고, 고칠 때마다 검사를 다시 실행 (회차마다 PASS 수 기록).
2. 화면 연결 (기존 코드는 지우지 말고 **추가만**):
   - `index.html` 의 `<div id="change"></div>` 바로 아래에 `<div id="week" data-testid="week-summary"></div>` 추가
   - `src/app.js` 맨 위 import 에 `import { weekSummary, fmtWeek } from './week.js';` 추가, `./core.js` import 목록에 `kstDate` 추가
   - `src/app.js` 의 `async function renderDaily() { … }` **안쪽**, `const f = fmtComparison(c);` 다음 줄에 `#week` 에 `fmtWeek(weekSummary(rows, kstDate(new Date())))` 를 넣는 코드 추가. 함수 머리(`async function renderDaily() {`)와 끝 괄호는 그대로 둘 것.
3. 확인: 검사 10/10 PASS, 그리고 정보판 ② 일별 기록 건수가 0 이 아니고(`data/daily.json` 행 수와 같음) 그 아래 요약 한 줄이 보임.
4. 10/10 결과 JSON(검사 페이지 아래 칸)을 `t05/results/B-runN.json` 으로 저장, `t05/LOG.md` 실행 회차·B 줄 채우기, 커밋·푸시.

## 7. 건드리지 말 것

- `t05/checks.js`, `t05/run.js`, `t05/run-checks.mjs`, `t05/checks.html`, `t05/PLAN.md` — 검사 삭제·완화·기대값 변경 0건이어야 함
- `src/core.js` 의 기존 함수, `data/` 폴더(매일 자동 기록), `assets/` 공개 꾸러미, `.github/workflows/daily.yml`·`reference.yml`
- `main` 브랜치에 커밋하지 말 것 (작업은 `t05-r2/week-summary` 에서)
- 보지 말 것 (공정성 규칙, PLAN 5절): `3ff1a1c` 보다 앞선 git 기록, 태그 `t05-run1-final`, `t05-run1/` 폴더, 다른 브랜치(`main`, `t05/week-summary`)의 `src/week.js`
