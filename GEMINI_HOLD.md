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

## 홀딩 중 구성

| 항목 | 상태 | 근거 |
|---|---|---|
| 뉴스·제품 **텍스트** 생성 | 🟢 **무료 티어 키로 계속 발행** | `gemini-2.5-flash` 무료 |
| Google 검색 그라운딩 | 🟢 **무료** — 500 RPD (우리 사용 하루 2~4회) | 공식 가격표 free tier 행 |
| 제품 **무드컷**(imagen) | 🔴 **OFF** — 무료 티어 없음 | 워크플로 `PRODUCT_IMAGES: '0'` |
| $2.99 유료 리포트 | 🟢 생존 — AI Gateway `gpt-4.1` 로 자동 폴백 | `analyze.ts:280~371` 3단 폴백 |
| AI 메이크업 | 🟢 무관 — OpenAI `gpt-image-2` |

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

### 1단계 — 지금 (카드 없이, $0). 발행 되살리기

1. https://aistudio.google.com/apikey → **Create API key**
2. ⚠️ **새 프로젝트를 고르고, 지금 그 결제 계정을 연결하지 말 것.**
   공식 문서가 "해당 계정에 묶인 모든 서비스가 멈춘다"고 명시 — 연결하는 순간 새 키도 같이 죽는다.
   결제 연결이 없어야 순수 무료 티어로 뜬다.
3. GitHub → Settings → Secrets and variables → Actions → `GEMINI_API_KEY` 값 교체
   (또는 `gh secret set GEMINI_API_KEY`)
4. Actions 탭 → Daily K-beauty content → **Run workflow** 로 즉시 검증
5. Cloudflare 대시보드에서 `GEMINI_API_KEY` 환경변수 **삭제** (위 표 참고)

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
     문서가 급할 땐 카드를 권한다. **반영될 때까지 1단계 무료 키를 유지할 것.**
   - 드문 경우: 사기방지 플래그 계정은 재활성화에 $100 결제를 요구받은 사례가 있다.
     그런 안내가 뜨면 결제하지 말고 무료 키로 버티는 편이 낫다.

   **가족 카드로 처리하는 경우 (2026-08-09 선택한 경로)**
   - ⭐ **일회성 결제로 끝낼 것.** 무드컷을 껐고 발행은 무료 키로 도니 이 결제계정에 쌓일
     신규 사용량이 0에 수렴한다 → 가족 카드를 주 결제수단으로 상주시킬 이유가 없다.
   - **주 결제수단을 바꾸지 말 것.** 바꾸면 이후 요금이 계속 가족에게 청구되고,
     나중에 무드컷을 되살리는 순간 과금이 그쪽으로 나간다. 주 결제수단 교체는 운영자 카드가 생겼을 때.
   - 청구지 주소는 **그 카드에 등록된 주소**를 넣을 것(운영자 주소 넣으면 AVS 불일치로 거절).
     명의가 결제 프로필과 달라도 무방.
   - 한국 카드 실패 지점: ①국내전용 카드 불가(Visa 로고면 해외겸용이라 OK)
     ②카드사 FDS 가 첫 해외결제를 막는 일이 흔함 → 카드사에 해외결제 승인 요청
     ③$0~1 가승인 테스트가 먼저 뜰 수 있음(실청구 아님)
   - **자동 복구가 아니다.** 상한 초과 정지는 1일에 자동 해제되지만 연체 정지는 결제해야 풀린다.
   - 메일의 **"Appeal the adjustment" 버튼은 이 문제의 창구가 아니다** — 저건 *한도 상향 요청* 폼이다.
   - 결제 후 즉시 복구된다는 보장은 없다(포럼에 며칠 걸린 사례 다수). 복구 확인 전까지 1단계 키를 유지할 것.
2. 복구 확인:
   ```bash
   curl -s -o /dev/null -w '%{http_code}\n' \
     -X POST 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent' \
     -H "x-goog-api-key: $GEMINI_API_KEY" -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"hi"}]}]}'
   # 200 이면 복구, 403 이면 아직
   ```
3. Secret 을 원래 유료 키로 되돌린다(셀카 경로를 유료 티어로 되돌리는 효과 — Cloudflare 변수도 이때 복원).

### 무드컷 복구 — ⚠️ 환경변수만으로는 안 된다

`PRODUCT_IMAGES: '0'` 한 줄만 지워도 무드컷은 안 돌아온다.
`imagen-4.0-generate-001` 이 **2026-08-17 종료**되기 때문이다(후속 `gemini-3.1-flash-image`).

교체는 모델명 한 줄이 아니라 `gen-products.mjs` 의 `imagenOnce()` 재작성이다:

| | 현재 (imagen) | 후속 (gemini image) |
|---|---|---|
| 엔드포인트 | `:predict` | `:generateContent` |
| 요청 | `instances[].prompt` + `parameters.sampleCount/aspectRatio` | `contents[].parts[].text` |
| 응답 | `predictions[0].bytesBase64Encoded` | `candidates[].content.parts[].inlineData.data` |

`sharp` 로 960×1280 webp 변환하는 뒷단은 그대로 쓸 수 있다.
실제 키가 살아있을 때 작업해야 검증이 되므로 **1단계 이후로 미뤄둔 상태**다.

## 상태 확인

```bash
gh run list --workflow=daily-news.yml --limit 5   # 초록이면 발행 정상
```
