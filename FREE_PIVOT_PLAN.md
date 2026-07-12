# Free-Pivot 실행 계획 (P0 → P2)
> 기준 문서: 「kissinskin 최종 구현 문서 (FINAL) 2026-06-13」
> 브랜치: `feat/free-pivot` · 작성: 2026-06-13
> 이 문서는 **합의용 계획서**다. 합의 후 P0 첫 슬라이스부터 커밋 단위로 들어간다.

---

## 0. 현재 코드 ↔ 스펙 간극 (확정 사실)

| 영역 | 현재 상태 | 스펙 요구 | 작업량 |
|---|---|---|---|
| 무료 도구 4종 라우트·퀴즈·판정 | **이미 존재** (`pages/tools/*` → `src/pages/*Quiz·*Result`) | 입력·판정 유지 | 유지 |
| 결과 화면 | 긴 마케팅 페이지 (`*Result.tsx`) | **9:16 정체성 카드 + 서술** (§3-4) | **신규** |
| 닉네임 데이터 | `koName/enName/tagline`만, 닉네임 전용 필드 없음 | 31종 닉네임/영문/한줄정체성/해시태그/그라데이션 (§3-5/3-6) | **신규 필드** |
| 얼굴형 입력 | 6문항 퀴즈 (`FaceShapeQuiz.tsx`) | **사진 + MediaPipe 비율** (§3-3) | **입력 교체** |
| AI 메이크업 | 온디바이스 MediaPipe + 성별당 풀메이크업 1장 + Gemini 텍스트 | **5스타일 + MediaPipe 마스크 → OpenAI 이미지 편집** (§2) | **재설계 + 신규 외부비용** |
| 가격 | $2.99 1회 + $9.88 구독 (코드·스키마·i18n) | $2.99/5크레딧 + $6.99/15 · **구독 폐지** (§2-3) | 교체 |
| 사이트 카피 | "9가지/6가지" HomePage·i18n·6개 컴포넌트 산재 | "5가지 스타일, 룩 1장" (§5) | 전면 치환 |
| 측정 | GA4 purchase/내부필터 일부 존재 | style_selected·free_trial_used·credit_purchased·card_saved·affiliate_click (§6) | 이벤트 추가 |

**핵심 모순**: 카피는 "9가지"인데 코드는 성별당 1장만 생성(`src/lib/makeup/looksConfig.ts`에서 9선택 폐기됨). §5에서 카피를 5가지/1장으로 통일하면 해소.

---

## 작업 레이어 지도 (경로 고정)

- Vike 라우트 래퍼: `pages/tools/<tool>/+Page.tsx`(인트로), `pages/tools/<tool>/@type/+Page.tsx`(결과)
- 구현: `src/pages/<Tool>Quiz.tsx`, `src/pages/<Tool>Result.tsx`
- 데이터: `src/lib/<tool>/types.ts` (+ `types.en.ts`)
- 공통 컴포넌트: `src/components/*` (ShareBar, ToolUpsellCTA, RelatedTools 등)
- 카피/i18n: `src/HomePage.tsx`, `src/i18n/ko.ts`(+en), `pages/index/+Head.tsx`
- AI 메이크업: `src/AnalysisApp.tsx`, `src/components/MakeupStudio.tsx`, `src/lib/makeup/*`, `functions/api/analyze.ts`
- 어필리에이트/GA: `src/config/affiliate.ts`, `src/lib/affiliate/*`, `src/lib/internalTraffic.ts`

도구 4종 동일 패턴: `personal-color`(4·퀴즈6), `makeup-mbti`(16·퀴즈8), `face-shape`(5·퀴즈→사진), `perfume-type`(6·퀴즈8).

---

# P0 — 사이트 통일 + 결과 카드 + 측정 (비용 0, 바이럴 핵심)

### 커밋 P0-1 — 정체성 카드 데이터 모델 (닉네임 31 + 그라데이션 + 해시태그)
- **목적**: §3-5/3-6 데이터를 타입에 주입. UI 전에 데이터부터.
- **파일**:
  - `src/lib/personal-color/types.ts` — 각 시즌에 `nickname`, `enNickname`, `identityLine`, `hashtags[]`, `cardGradient`(navy→유형색) 추가. 4종.
  - `src/lib/makeup-mbti/types.ts` — 16종에 `identityLine` 추가(닉네임은 기존 유지, 스펙은 "기존 닉네임 유지 + 한줄 신규"). `cardGradient` 추가.
  - `src/lib/face-shape/types.ts` — 5종 보석 닉네임/영문/한줄/해시태그/그라데이션.
  - `src/lib/perfume-type/types.ts` — 6종 향무드 닉네임/영문/한줄/해시태그/그라데이션(§3-6 색).
  - (영문 `types.en.ts`는 enNickname/identityLineEn 동반 추가)
- **검증**: `tsc -b` 통과. 데이터만이라 화면 영향 없음.
- **주의**: 스펙 §3-5 닉네임 문구 **그대로** 입력. MBTI는 닉네임 교체 아님(한줄만 추가).

### 커밋 P0-2 — `IdentityCard` 공통 컴포넌트 + PNG 저장
- **목적**: §3-4 9:16(1080×1920) 카드 1개 컴포넌트로 4도구 공용.
- **신규 파일**:
  - `src/components/IdentityCard.tsx` — props: `{ label, emoji, nickname, enName, identityLine, hashtags[], gradient }`. 화면엔 축소 미리보기(aspect 9:16), 하단 `kissinskin.net` 워터마크.
  - `src/lib/cardToPng.ts` — Canvas API로 카드 DOM → 1080×1920 PNG. (html2canvas 미설치 → 우선 순수 Canvas 렌더러 권장; DOM 캡처 필요시 html2canvas 추가 결정)
- **GA**: 저장 시 `card_saved` 이벤트.
- **검증**: 임시 Storybook 없이 4도구 중 1개(perfume)에 먼저 끼워 시각 확인.
- **결정필요 ①**: 카드 렌더링 방식 — (a) 순수 Canvas 드로잉(폰트·이모지 정밀 제어, 의존성 0) vs (b) html2canvas로 DOM 캡처(레이아웃 빠름, 의존성+이모지 리스크). **권장 (a)**.

### 커밋 P0-3 — 4개 결과 페이지에 카드 + "나에 대한 이야기" 서술 결합
- **목적**: 각 `*Result.tsx` 최상단에 `IdentityCard` + 서술형 문단(③축 막대 해당 도구만).
- **파일**: `src/pages/PersonalColorResult.tsx`, `MakeupMbtiResult.tsx`, `FaceShapeResult.tsx`, `PerfumeTypeResult.tsx`
  - 카드 미리보기 + "이미지로 저장" 버튼을 hero 위치에 배치.
  - MBTI/퍼스널컬러: 축 막대(E/I·웜/쿨 등) 노출.
  - 기존 긴 본문(SEO)은 카드 **아래로 유지**(색인 가치 보존). ShareBar 유지.
- **검증**: 4 결과 URL 로컬 확인(`/tools/*/@type` 슬러그).

### 커밋 P0-4 — 사이트 카피 "9/6가지" → "5가지·1장" 통일 (§5)
- **파일**:
  - `src/HomePage.tsx` (hero·showcase·styles 마퀴 9종→5종)
  - `src/i18n/ko.ts` + `en.ts` (`home.hero.title2`, `home.value.desc1`, `home.toolsShowcase.*`, `home.styles.titleHighlight` 등)
  - `src/components/ToolUpsellCTA.tsx`, `GuideUpsellCTA.tsx`, `ArticleShell.tsx`, `HubShell.tsx`, `RelatedTools.tsx` (6/9가지 문구)
  - `pages/index/+Head.tsx` (title·OG·twitter + 가격 스키마)
- **카피 기준**: 헤드라인 "얼굴은 그대로, 메이크업만 바꿔요" / "5가지 스타일 중 원하는 룩 1장" (§2-4).
- **검증**: `grep -rn "9가지\|6가지\|9칸\|6칸"` 잔여 0 (의도적 예외 제외).

### 커밋 P0-5 — 가격 통일: $9.88 구독 폐지 (§2-3)
- **파일**: `src/AnalysisApp.tsx`(구독 옵션·GA item 제거), `pages/index/+Head.tsx`(Schema price), i18n 가격 문구.
- **주의(§8 금지)**: **무료 도구 페이지엔 가격 표기 금지.** 무료 결과의 "AI 메이크업 CTA"는 크로스프로모로 허용(가격은 메이크업 맥락에서만).
- **주의(§2-3)**: Polar 플랜이 Early Member면 **플랜 변경/해지 금지**. 신규 팩 추가는 별도 상품으로(P1-결제에서 처리). P0에서는 **표기·구독 옵션 제거**까지만, 실제 크레딧 상품 생성은 P1.
- **결정필요 ②**: P0에서 단건 $2.99(현행 1회 결제)를 그대로 둘지, 아니면 P1 크레딧팩 나올 때까지 결제 진입 자체를 임시 숨길지. **권장**: 표기만 정리하고 결제 동작은 P1까지 현행 유지.

### 커밋 P0-6 — 측정 세팅 (§6)
- **파일**: `src/lib/analytics.ts`(신규, gtag 래퍼 일원화) 또는 기존 `AnalysisApp.tsx` 헬퍼 추출.
  - 이벤트: `style_selected`, `free_trial_used`, `credit_purchased`, `card_saved`, `affiliate_click`.
  - `card_saved`는 P0-2, `affiliate_click`은 기존 어필리에이트 클릭에 부착.
  - 내부 트래픽 필터(`src/lib/internalTraffic.ts`) 재사용 확인.
- **수동 작업(운영자)**: GA4 콘솔 내부 IP 필터 + Clarity 본인 세션 제외(코드 아님, 체크리스트로 남김).

**P0 완료 정의**: 4도구 결과가 카드형으로 공유 가능 + 사이트 카피/가격 표기 통일 + 핵심 이벤트 발화. 신규 외부비용 0.

---

# P1 — AI 메이크업 파이프라인 + 얼굴형 실측

### 커밋 P1-1 — 5스타일 메뉴 UI + 스타일 단일 소스
- **파일**: `src/lib/makeup/styles.ts`(신규, §2-1 5종: NATURAL/EVERYDAY/SIGNATURE/POP/BOLD — 라벨·마스크부위·프롬프트), `src/AnalysisApp.tsx`(5카드 선택 UI), `src/components/MakeupStudio.tsx`.
- **GA**: `style_selected`.
- **§4 수정**: 5카드가 전부 동일 민낯 금지 → 각 카드 룩 미리보기.

### 커밋 P1-2 — MediaPipe 마스크 생성기 (부위별 + 페더링)
- **파일**: `src/lib/makeup/maskBuilder.ts`(신규) — 랜드마크 → 입술/볼/잡티스팟/콧대·광대 마스크, 가장자리 페더링 필수(경계 자국 방지). 기존 `looksEngine.ts`의 검출 코드 재활용, **색오버레이는 최종 미사용**(§8).
- **검증**: 마스크 시각화 디버그 토글.

### 커밋 P1-3 — OpenAI 이미지 편집 API (인페인팅)
- **파일**: `functions/api/makeup-edit.ts`(신규 Worker) — 원본+마스크+스타일 프롬프트 → gpt-image-1.5 마스크 영역 재생성. 키 env(`.dev.vars`/wrangler secret).
- **결정필요 ③**: gpt-image-1.5 가용성·실원가($0.05~0.10 가정) — 첫 인보이스 검증 전제. **운영자 OpenAI 계정/키·예산 한도 확인 필요.**
- **검증**: 얼굴 구조 불변 + 마스크 영역만 변경 실사 확인.

### 커밋 P1-4 — before/after 슬라이더 결과
- **파일**: `src/components/BeforeAfterSlider.tsx`(신규), `AnalysisApp.tsx` 결과부 교체(6칸 그리드 폐기 §8).

### 커밋 P1-5 — 크레딧 시스템 + Polar 팩 + 무료 1회 가드
- **파일**: `src/lib/credits.ts`(신규), 결제 핸들러, `functions/api/*`(웹훅).
  - 팩: 스타터 $2.99/5, 플러스 $6.99/15(POPULAR). 무료 1장: **기기 fingerprint + IP당 평생 1회**(가드가 마진 생명줄). 무료/저해상도 워터마크.
  - GA: `free_trial_used`, `credit_purchased`.
- **주의**: Polar Early Member 플랜 변경 금지 → **신규 팩 상품으로만** 생성.
- **결정필요 ④**: fingerprint 라이브러리(자체 vs FingerprintJS) + IP 카운팅 저장소(Supabase/KV).

### 커밋 P1-6 — 얼굴형 사진 + MediaPipe 비율 분석 (§3-3)
- **파일**: `src/pages/FaceShapeQuiz.tsx` → 사진 업로드 + `src/lib/face-shape/measure.ts`(신규, 비율→5종 판정). 기존 6문항 폐기 또는 폴백.
- **검증**: 실셀카 5종 분류 정확도 운영자 체크포인트.

**P1 완료 정의**: 5스타일 선택 → 마스크 → OpenAI 편집 → before/after, 크레딧 결제·무료가드 동작, 얼굴형 실측.

---

# P2 — 폴리시 + 출시 후

### 커밋 P2-1 — Stitch 채택 디자인 폴리시 (§4)
- 퀴즈 화면 새 토큰 적용(기존 작동 HTML 유지), 제품 카드 폴리시.

### 커밋 P2-2 — 라우트/잔재 정리 (§5 체크리스트 잔여)
- `/diagnose`·`/results`·`/saved` 네비 정리(존재 안 함 → 확인 후 무시 가능), 임시 이미지 교체, Kakao JS SDK 실연동, 쿠팡 트래킹·클리오 실링크 점검.

### P2-3 — 출시 후 (코드 아님, 운영)
- OpenAI 첫 인보이스로 실원가 검증 → 팩 재조정, 무료→유료 전환율(손익분기 5%), 카드 저장·공유율, $2.99/5 vs $1.99/3 A/B, 인기 유형 캐릭터 검토.

---

## 운영자 결정 대기 항목 (요약)
1. **카드 렌더링**: 순수 Canvas(권장) vs html2canvas
2. **P0 결제 동작**: 표기만 정리·결제 현행 유지(권장) vs 결제 임시 숨김
3. **OpenAI**: gpt-image-1.5 키·예산 한도 (P1 착수 전 필수)
4. **무료 1회 가드**: fingerprint 방식 + IP 저장소
5. **MBTI 닉네임**: 스펙대로 "기존 유지 + 한줄만 추가" 확정?

## 금지·폐기 재확인 (§8)
- 폐기: 9/6칸 그리드, 무제한 구독, OpenAI "생성"(얼굴변형), MediaPipe 색오버레이(최종)
- 금지: 무료 도구 가격 표기 / 가짜 후기·수치 / 미검증 연구 / 얼굴 구조 변형
- 이미지 원칙(2026-07-12 개정): **모델 인종 제한 없음** — 글로벌 전환(EN·Global 토글)에
  따라 "서양 모델 금지"는 폐기한다. 대신 두 가지를 지킨다.
  1. **보는 사람이 자기를 대입할 수 있는 모델**을 쓴다(KO=동아시아 중심, EN=다양하게).
     원래 규칙의 목적은 인종 배제가 아니라 "결과가 내 얘기로 읽히게" 하는 것이었다.
  2. **AI 생성 인물을 실제 인물·실제 고객처럼 포장하지 않는다.** 데모/장식용 사용은
     허용(예: /products 모델컷, 메이크업 룩 샘플). 후기·사용자 사진으로 쓰는 것은 금지
     (이는 "가짜 후기" 금지 항목에 해당).

## 제안 착수 순서
P0-1(데이터) → P0-2(카드) → P0-3(결합) 까지가 **바이럴 핵심 첫 슬라이스**. 여기까지 먼저 만들고 시각 검증 후 P0-4~6(통일·측정) 진행.
