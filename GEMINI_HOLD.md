# Gemini 결제 홀딩 운영 메모 (2026-08-09 ~ )

Google Cloud 결제 계정 `0132B5-093836-A876FE` 가 연체로 정지됐다.
운영자 카드 재등록까지 **무기한 홀딩**. 이 문서는 "지금 상태"와 "카드 생기면 되살리는 순서"다.

## 무슨 일이 있었나

- 2026-08-06: 아직 정상 (`HTTP 200`, `serviceTier: standard`)
- 2026-08-08: AI Studio 메일 "moved to **Suspended Service Tier**"
- 2026-08-09 06:19 KST: `daily-news.yml` 이 20초 만에 실패. 3회 재시도 전부 아래 응답

```
HTTP 403  PERMISSION_DENIED
"Your project has been denied access. Please contact support."
```

메일 문구는 "한도가 줄었다"지만 실제로는 **완전 차단**이다.
`Suspended Service Tier` 는 공식 등급표(Free/Tier 1/2/3)에 없는 이름 — 정지 상태에 붙는 라벨이다.

원인은 지출 상한이 아니라 **연체**다. 근거 두 가지:
우리 유료 사용은 하루 imagen 1장(월 $2 미만)이라 Tier 1 상한 $250 근처도 못 간다.
그리고 상한 정지는 매월 1일 리셋인데 우리는 8/6~8/7 멀쩡히 돌다 월중인 8/8 에 죽었다.

> Google 공식 문서: "Your Gemini API usage will be suspended if your Cloud Billing account
> is flagged for issues such as: A delinquent or overdue balance [or] A declined payment."

## 🛡️ 홀딩 창을 버티려고 넣은 방어 (2026-08-09, 커밋 참조)

카드 등록 → 승인 반영까지 며칠 열려 있는 구간을 견디려고 코드에 넣은 것들이다.
**대부분 자동 복구형이라 카드가 붙어도 되돌릴 작업이 없다.** 되돌릴 게 있는 것만 아래 체크리스트에 있다.

| 방어 | 무엇을 막나 | 카드 복구 시 |
|---|---|---|
| `analyze.ts` Gemini 서킷브레이커 | 죽은 키에 유료 고객 셀카를 매번 업로드→403→재업로드 하던 것. 401/403 을 만나면 30분간 1차를 건너뛴다 | **자동.** 쿨다운 후 한 요청이 다시 찔러보고 성공하면 그대로 1차 복귀 |
| `daily-news.yml` 스텝 분리 | 뉴스가 죽으면 제품까지 못 나가 그날 발행이 0건이던 것. 이제 각자 끝까지 시도하고, 둘 다 죽을 때만 잡이 빨개진다(=실패 메일) | **자동.** 되돌릴 것 없음 |
| `scripts/_geminiImage.mjs` | `imagen-4.0-*` 2026-08-17 종료. 세 스크립트가 각자 갖고 있던 호출부를 모아 `gemini-3.1-flash-image` 로 이전 | **수동 1줄** — 아래 체크리스트 4번 |
| `privacy.tsx` 처리자 고지 | 리포트 처리자를 Gemini 로만 적어 둔 것. 실제로는 폴백으로 OpenAI 가 처리할 수 있고, 지금은 OpenAI 가 전담 중 | 영구 수정. 되돌리지 말 것 |
| `wrangler.toml` 주석 | 무료 키가 Cloudflare 에 잘못 들어가 셀카가 학습되는 사고 | — |

## ⚠️ 함정: 새 프로젝트 키는 `gemini-2.5-flash` 를 못 쓴다 (2026-08-09 실측)

무료 키로 갈아끼우고 첫 실행에서 **403 이 아니라 404** 가 났다:

```
404 NOT_FOUND
"This model models/gemini-2.5-flash is no longer available to new users.
 Please update your code to use a newer model."
```

**키도 결제도 문제가 아니었다.** 기존 프로젝트는 유예를 받아 계속 쓰고 있었을 뿐이고,
새로 만든 프로젝트는 "신규 사용자"라 이 모델 자체가 안 열린다.
공식 종료일(2026-10-16)보다 먼저 신규 발급 키에만 선차단이 걸린 것 — 널리 보고된 현상이다.

그래서 `gemini-3.6-flash` 로 올렸더니 이번엔 **첫 호출부터 429** 가 났다:

```
429  "You exceeded your current quota, please check your plan and billing details."
```

**3.x 계열은 무료 티어 쿼터가 0 이다.** 2025-12 이후 무료 한도가 대폭 축소되면서
3.x 는 사실상 유료 전용이 됐다(Pro 는 2026-04 에 무료 티어에서 아예 빠졌다).

### ⭐ 결론: 모델명을 박아두지 않는다 — `scripts/_geminiText.mjs`

하루에 같은 이유로 두 번 깨졌다(404 → 429). 모델명을 하나 고정하면 구글이 정책을
바꿀 때마다 발행이 멈추고, 고치려면 워크플로를 돌려 로그를 봐야 해서 왕복이 오래 걸린다.
그래서 **후보를 좋은 순서로 세워 두고 위에서부터 시도**한다:

```
gemini-3.6-flash → gemini-3.5-flash → gemini-2.5-flash-lite → gemini-2.0-flash
```

- `404`(막힌 모델) · `429`(쿼터 0/소진) → 조용히 다음 후보로
- 그 외 오류 → 진짜 문제라 그대로 throw
- 유료 키면 첫 후보에서 끝나고, 무료 키면 쿼터 남은 세대까지 내려간다
- 한 번 통한 모델은 실행 내에서 재사용 · 어떤 모델을 썼는지 로그에 찍힌다
- 고정하고 싶으면 `GEMINI_TEXT_MODELS` 환경변수(콤마 목록)

⭐ **이 구조 덕에 카드가 붙어 유료로 올라가면 자동으로 3.6-flash 로 올라간다.** 되돌릴 작업 없음.

### 그 밖에 확인된 것

- thinking 파라미터는 세대마다 이름이 다르다: 2.x `thinkingConfig.thinkingBudget=0` /
  3.x `thinkingConfig.thinkingLevel='low'`. **`generationConfig.thinkingLevel` 은 없는 필드다**
  (400 `Unknown name "thinkingLevel"`). 세대 보고 고르고, 400 이면 빼고 1회 재시도한다
- **`node scripts/gemini-preflight.mjs`** 로 그 키가 보는 모델을 찍는다. 워크플로 첫 스텝으로도
  돈다(과금 없는 메타데이터 호출). ⚠️ 단 목록만 믿으면 안 된다 — `gemini-2.5-flash` 는
  목록에 뜨면서 호출은 404 였고, **쿼터는 목록에 안 나온다**(3.x 가 그래서 429)
- 검색 그라운딩 무료 한도도 세대별로 다르다: 2.5 계열 500 RPD → 3.x 월 5,000건
  (우리 사용 하루 2~4회 = 월 120건 안팎이라 어느 쪽이든 여유)

## ❌ 무료 티어로 버티는 계획은 무효였다 (2026-08-09 실측)

이 문서가 원래 권했던 "새 프로젝트에서 무료 키 발급 → $0 로 발행 유지"는 **작동하지 않는다.**
새로 만든 프로젝트 키로 후보 4개를 전부 때려봤고 결과는 이랬다:

```
gemini-3.6-flash(429) · gemini-3.5-flash(429) · gemini-2.5-flash-lite(404) · gemini-2.0-flash(429)
```

**신규 프로젝트 키에는 쓸 만한 무료 쿼터가 남아 있지 않다.** 2025-12 무료 한도 대폭 축소 이후
3.x 는 사실상 유료 전용이고, 구세대는 신규 사용자에게 아예 안 열린다.
👉 **다음에 같은 사고가 나면 무료 키 발급에 시간 쓰지 말고 곧장 OpenAI 폴백을 확인할 것.**

## ⭐ 진짜 생존로 = OpenAI 폴백 (영구 구성)

`scripts/_geminiText.mjs` 가 Gemini 후보를 모두 시도한 뒤 막히면 **OpenAI 로 넘어간다.**
그라운딩은 Responses API 의 `web_search` 툴이 Gemini `google_search` 자리를 대신한다.

- 로컬에서 **실제로 발행까지 검증했다**(뉴스·제품 각 1건, KO+EN). 추정이 아니다
- 워크플로 Secret 에 **`OPENAI_API_KEY` 가 있어야 동작한다**
- 인용 정리: `web_search` 가 흘리는 마크다운 링크와 `utm_source=openai` 는 코드에서 제거한다
  (기존 뉴스 본문엔 링크가 없는 게 스타일이고, 통제 못 하는 추적 파라미터를 실을 이유가 없다)
- 사고의 실체는 "결제 연체"가 아니라 **콘텐츠 생성을 한 벤더에 전부 매달아 둔 것**이었다.
  그래서 이 폴백은 카드가 복구돼도 **끄지 않는다**

## 홀딩 중 구성

| 항목 | 상태 | 근거 |
|---|---|---|
| 뉴스·제품 **텍스트** 생성 | 🟢 **OpenAI 폴백으로 발행 중** | Gemini 전 후보 404/429/403 |
| 검색 그라운딩 | 🟢 OpenAI `web_search` 툴 | 로컬 실행에서 `web_search_call` 확인 |
| 제품 **무드컷** | 🔴 **OFF** — 이미지 생성은 무료 티어 없음 | 워크플로 `PRODUCT_IMAGES: '0'` |
| $2.99 유료 리포트 | 🟢 생존 — AI Gateway `gpt-4.1` 로 자동 폴백 | `analyze.ts` 3단 폴백 |
| AI 메이크업 | 🟢 무관 — OpenAI `gpt-image-2` |
| 무료 도구 4종 | 🟢 무관 — AI 안 씀 |

무드컷이 빠져도 제품 글은 정상 발행되고 카드만 디자인 폴백으로 나간다
(`gen-products.mjs:454` 의 try/catch — 이미지 실패는 원래 삼키게 돼 있다).

### 🔑 키를 어디에 넣고 어디에 넣지 않는가 — 중요

| 위치 | 무료 티어 키 | 이유 |
|---|---|---|
| GitHub Actions Secret `GEMINI_API_KEY` | ✅ **넣는다** | 뉴스·제품 생성은 사용자 데이터가 없다. 프롬프트가 K-뷰티 트렌드 질문뿐 |
| Cloudflare 환경변수 `GEMINI_API_KEY` | ❌ **지운다. 무료 키를 넣지 말 것** | 이 경로(`analyze.ts`)는 **사용자 셀카**를 보낸다 |

무료 티어 약관상 Google 은 입력을 제품 개선에 쓰고 **사람이 읽을 수 있다**:

> "Google uses the content you submit to the Services and any generated responses to provide,
> improve, and develop Google products and services" / "human reviewers may read, annotate,
> and process your API input and output"

유료 티어는 반대로 "Google doesn't use your prompts or responses to improve our products".
즉 **무료 키를 셀카 경로에 꽂으면 사용자 얼굴이 Google 학습·사람 검토로 들어간다.**
Cloudflare 쪽 키는 지워두면 `analyze.ts:286` 의 `if (env.GEMINI_API_KEY)` 가 1차를 건너뛰고
곧장 Gateway 로 간다 — 덤으로 매 결제 요청마다 버리던 403 왕복도 사라진다.

## ▶️ 재개 절차

### 1단계 — 지금 (카드 없이). 발행 되살리기

⚠️ ~~무료 키 발급~~ 은 헛수고다(위 "무료 티어로 버티는 계획은 무효였다" 참고). 대신:

1. GitHub → Settings → Secrets and variables → Actions → **`OPENAI_API_KEY` 추가**
   (값은 `.dev.vars` 의 것과 동일. AI 메이크업·유료 리포트가 이미 쓰는 그 키다)
2. Actions 탭 → Daily K-beauty content → **Run workflow** 로 검증
3. Cloudflare 대시보드의 `GEMINI_API_KEY` 환경변수는 **비워 둔다**
   (죽은 키라 어차피 서킷브레이커가 건너뛰고, 무료 키를 넣으면 안 되는 자리다 — 아래 표)

### 2단계 — 카드 재등록 후. 원상복구

1. `console.cloud.google.com` → 결제 → `0132B5-093836-A876FE` 에 새 카드 등록, 연체분 결제
   > 공식 문서: "resolve the Postpay account issue in the Google Cloud Billing console.
   > Once you resolve the issue, you will regain access"

   **결제 수단 선택지 (2026-08-09 확인)**
   - 받는 카드: "American Express, MasterCard, Visa, **Debit cards with the Visa or MasterCard logo**"
     → ⭐ **체크카드 가능.** 한도가 찬 게 원인이었으므로 잔액에서 빠지는 체크카드가 우회로다.
   - **즉시 결제 가능**: 결제 개요 → 계정 선택 → **"Make a payment" / "Pay early"**.
     자동 재청구를 기다릴 필요 없다. 그 화면에서 **주 결제수단 등록 없이 새 카드를 그 자리에서 추가해
     결제 가능** ("Select the payment method..., or add a new payment method") → 체크카드를 영구 등록할 필요 없음.
   - ⚠️ **카드를 다시 등록만 해도 미납액이 자동 청구된다** —
     "re-enabling your form of payment without making a manual payment will automatically
     trigger a charge for your outstanding balance". 잔액 먼저 확인할 것.
   - ⏳ 반영은 즉시가 아니다: "from 24 hours to a week or more"; 계좌 결제는 "up to 10 business days".
     문서가 급할 땐 카드를 권한다. **반영될 때까지 OpenAI 폴백이 발행을 이어간다**(1단계).
   - 드문 경우: 사기방지 플래그 계정은 재활성화에 $100 결제를 요구받은 사례가 있다.
     그런 안내가 뜨면 결제하지 말 것 — OpenAI 폴백으로 버티는 편이 낫다.

   **가족 카드로 처리하는 경우 (2026-08-09 선택한 경로)**

   ⭐ **주 결제수단으로 계속 연동하는 쪽을 권한다** (일회성 결제도 가능하지만 실익이 적다).
   운영자 카드가 생기면 언제든 교체 가능한 임시 조치다.

   실측 단가 기준 월 비용 — **$5 안팎**:

   | 항목 | 사용량 | 단가 | 월 |
   |---|---|---|---|
   | 검색 그라운딩 | 하루 2~4회 | **1,500 RPD 까지 무료** | **$0** |
   | 텍스트(`gemini-3.6-flash`) | 하루 4~8콜 | 입력 $0.30 / 출력 $2.50 per 1M | ~$1.5~3 |
   | 무드컷(`gemini-3.1-flash-image`) | 하루 1장 | $0.067/장 | ~$2 |
   | 유료 리포트 | 결제 시만 | 〃 | 미미(매출 동반) |

   연동이 나은 이유는 돈보다 이 둘이다:
   - 🔒 **유료 티어는 입력을 학습에 쓰지 않는다** → 셀카 경로(`analyze.ts`)를 Gemini 로 되돌려도
     안전해진다. 무료 키를 어디 넣을지 고민할 필요 자체가 사라진다.
   - 💰 **리포트 원가가 내려간다.** 지금은 Gemini 부재로 `gpt-4.1` 폴백을 타는데 flash 보다 비싸다.

   같이 할 것:
   - **예산 알림**: 결제 → 예산 및 알림 → 월 $10 로 설정(차단이 아니라 통지. 사용량이
     하루 1장·4콜로 결정론적이라 튈 구조는 아님)
   - 운영자 카드 생기면 교체: 카드 추가 후 드롭다운에서 **Primary** 지정
     ("The payment method previously marked as Primary will be marked as Other") → 가족 카드 삭제

   등록 시 실패 지점:
   - 청구지 주소는 **그 카드에 등록된 주소**를 넣을 것(운영자 주소 넣으면 AVS 불일치로 거절).
     명의가 결제 프로필과 달라도 무방.
   - 한국 카드: ①국내전용 카드 불가(Visa 로고면 해외겸용이라 OK)
     ②카드사 FDS 가 첫 해외결제를 막는 일이 흔함 → 카드사에 해외결제 승인 요청
     ③$0~1 가승인 테스트가 먼저 뜰 수 있음(실청구 아님)
   - **자동 복구가 아니다.** 상한 초과 정지는 1일에 자동 해제되지만 연체 정지는 결제해야 풀린다.
   - 메일의 **"Appeal the adjustment" 버튼은 이 문제의 창구가 아니다** — 저건 *한도 상향 요청* 폼이다.
   - 결제 후 즉시 복구된다는 보장은 없다(포럼에 며칠 걸린 사례 다수). 복구 확인 전까지 1단계 키를 유지할 것.
### ✅ 원상복구 체크리스트 — 위에서부터 순서대로

카드가 붙었다고 바로 되돌리지 말 것. **1번이 200 을 줄 때까지는 OpenAI 폴백이 발행을 이어간다.**
그리고 OpenAI 폴백 자체는 복구 후에도 **끄지 않는다** — 이번 사고의 실체가 단일 벤더 의존이었다.

- [ ] **1. 유료 키가 살아났는지 확인** (이게 통과해야 나머지가 의미 있다)
  ```bash
  GEMINI_API_KEY=<유료키> bash -c 'curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent" \
    -H "x-goog-api-key: $GEMINI_API_KEY" -H "Content-Type: application/json" \
    -d "{\"contents\":[{\"parts\":[{\"text\":\"hi\"}]}]}"'
  # 200 = 복구됨 → 진행.  403 = 아직 → 무료 키로 더 기다린다.
  ```
- [ ] **2. GitHub Secret `GEMINI_API_KEY` 를 유료 키로 되돌린다**
  (Settings → Secrets and variables → Actions. 무료 키는 지우지 말고 어딘가 적어둘 것 — 다음 사고 때 30초 스위치)
- [ ] **3. Cloudflare 환경변수 `GEMINI_API_KEY` 를 유료 키로 복원한다**
  🔒 무료 키를 넣지 말 것. 이유는 위 "키를 어디에 넣고 어디에 넣지 않는가" 표.
  복원하면 셀카 경로가 다시 Gemini 1차를 타서 리포트 원가가 내려간다.
  (서킷브레이커는 알아서 닫힌다 — 코드는 손대지 않는다.)
- [ ] **4. 무드컷 되살리기** — `.github/workflows/daily-news.yml` 의 `PRODUCT_IMAGES: '0'` **줄 삭제**
  모델 이전은 이미 끝나 있다(`scripts/_geminiImage.mjs`). 단 ⚠️ **실키 검증은 못 했다**
  (403 상태에서 작성). 지우고 나서 **반드시 수동 1회 실행으로 확인**할 것:
  ```bash
  GEMINI_API_KEY=<유료키> node scripts/gen-products.mjs
  # public/products/<slug>.webp 가 생기면 성공.
  # 400 이 뜨면 responseFormat 스키마가 또 바뀐 것 → _geminiImage.mjs 의 generationConfig 만 손보면 된다.
  ```
- [ ] **5. 예산 알림 월 $10** — 결제 → 예산 및 알림 (차단 아님, 통지)
- [ ] **6. 하루 뒤 심장박동 확인** — `gh run list --workflow=daily-news.yml --limit 3` 초록
- [ ] **7. 운영자 카드가 생기면 가족 카드 교체** — 새 카드 추가 → 드롭다운에서 Primary 지정 → 가족 카드 삭제

### 이미지 모델 이전 기록 (2026-08-09 완료)

`imagen-4.0-generate-001` / `-ultra` / `-fast` 3종이 **2026-08-17 종료**됐다.
모델명만 바꾸면 깨지는 교체라(요청·응답 모양이 둘 다 다름) 호출부를 공용 모듈로 옮겼다.

| | imagen (구·삭제됨) | gemini image (현) |
|---|---|---|
| 엔드포인트 | `:predict` | `:generateContent` |
| 요청 | `instances[].prompt` + `parameters.sampleCount/aspectRatio` | `contents[].parts[].text` + `generationConfig.responseFormat.image.aspectRatio` |
| 응답 | `predictions[0].bytesBase64Encoded` | `candidates[].content.parts[].inlineData.data` |

- 단일 소스: **`scripts/_geminiImage.mjs`** (`generateImageB64` / `generateImageBuffer`)
- 쓰는 곳 3군데: `gen-products.mjs`(일일 무드컷) · `gen-mood-images.mjs`(수동) · `gen-look-models.mjs`(수동)
- `sharp` 960×1280 webp 뒷단은 그대로다.
- 응답에 텍스트 파트가 섞여 오므로 `parts[0]` 이 아니라 `inlineData` 있는 파트를 찾아야 한다.
- 400 이 오면 `responseFormat` 없이 한 번 자동 재시도한다(비율은 잃지만 sharp 가 크롭).

## 상태 확인

```bash
gh run list --workflow=daily-news.yml --limit 5   # 초록이면 발행 정상
```
