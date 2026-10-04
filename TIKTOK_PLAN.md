# TikTok 성장 계획 — 대표 모델 × 9룩 비포/애프터 (2026-09-30)

> 목표(로드맵 1단계 통과기준): **틱톡 팔로워 1,000**. 조회수·좋아요는 그 수단.
> 1단계 = 이미지(비포→애프터) 시리즈 · 2단계 = 같은 모델에 움직임을 준 영상.

---

## 0. 전제 — 반드시 지킬 것 (조사 결과)

| 항목 | 내용 | 대응 |
|---|---|---|
| AI 라벨 | 틱톡은 "실제 사람으로 착각할 수 있으면 라벨" 원칙. C2PA 메타데이터로 **자동 감지**도 함(OpenAI 이미지는 C2PA 포함) | 업로드 때 **"AI 생성 콘텐츠" 토글 ON**. 캡션에 `AI model · made with kissinskin AI makeup` |
| 크리에이터 수익 | **가상 인플루언서 계정은 Creator Rewards 참여 불가** | 수익은 틱톡 정산이 아니라 **사이트 유입(무료 진단·구독)** 으로 설계. 원래 목표와 일치 |
| 신뢰 | 뷰티 시청자는 "조작된 비포/애프터"에 반감 | "이 화장품 쓰면 이렇게 된다"가 아니라 **"AI로 내 얼굴에 먼저 입혀본다"** 로 포지셔닝. 도구 데모임을 숨기지 않는다 |
| 일관성 | 9룩 **같은 모델 1명**, 애프터는 **표정 잠금**, 헤어는 **염색만**(`HAIR_RULE`) | 기존 `gen-look-models.mjs --before-dir` 경로 그대로 사용(라이브 도구와 동일 프롬프트 = 정직성) |

---

## 1단계 — 이미지 시리즈 (지금 시작)

### 1-1. 모델 · 룩 · 순서 (확정안, 2026-09-30 계정 실측 반영)

**실측(프로필 캡처 9/30):** 슬라이더 비포/애프터 207·139 > 어깨 너머 포즈 151 ≈ Blood Lip 150 > Bold Lip 93.
→ 형식 = **슬라이더 비포/애프터**(운영자 편집), 모델 = **대표 모델 1명 × 9룩 전부**(바이오 "1 selfie → 9 K-beauty looks" 와 일치).

사진 번호 = 운영자 폴더(D:\AI\kisskin\AI 사람이미지\JJ\새 폴더) 표시 순서, 왼→오·위→아래.

| 업로드 | 룩 | 사진 | 이유 |
|---|---|---|---|
| 1 | **K-Pop Idol** | #2 살짝 미소·고개 기울임 | 최근 3개(Grunge·Bold·Blood)와 안 겹치는 새 룩으로 시리즈 시작 · 글로벌 검색 수요 1위 |
| 2 | **Maximalist Eye** | #1 정면 무표정 | 눈 전체가 대칭으로 보여야 함 · 가장 과감 → 공유 |
| 3 | **Blood Lip** | #8 턱 당긴 미소 | 실측 검증 룩 · 1~3번이 새 맨 윗줄(왼쪽부터 Blood/Maximalist/K-Pop) |
| 4 | **Natural Glow** | #3 부드러운 미소 | 공감형 쉬어가기 |
| 5 | **Bold Lip** | #5 어깨 너머 | 실측 151 포즈 + Bold Lip 약세(93)를 포즈로 보강 |
| 6 | **Blush Draping** | #4 옆모습 | 드레이핑=볼→관자놀이, 옆에서만 제대로 보임 |
| 7 | **Metallic Eye** | 추가 요청: 눈 내리깐 정면 (없으면 #1 재사용) | 눈꺼풀 펄이 보여야 함 |
| 8 | **Grunge** | #7 무표정·고개 기울임 | 쿨한 무드 |
| 9 | **Cloud Skin** | #6 몸 숙여 클로즈업 | 피부 결 룩 = 클로즈업 필수 · 대비 약해서 뒤로 |
| 10 | **9룩 모아보기** | 9장 그리드/연속 슬라이더 | "Which one is your favorite? 1–9" → 상단 고정 |

**상단 고정(Pin 3개):** 10번(모아보기) · 조회수 1·2위.

### 1-1b. 10번 "9룩 모아보기" 만드는 법
- ⭐ **사진 1장(#1 정면 무표정)에 9룩을 전부 입힌 별도 세트**로 만든다. 1~9번 게시물은 포즈가 제각각이라 이어 붙이면 얼굴이 튄다.
  같은 사진 1장 → 9룩 = 바이오 "1 selfie → 9 K-beauty looks" 그대로의 증명. 추가 비용 ≈ 9 × $0.22 ≈ $2.
- 구성(약 10초, 루프): 비포 1초(`1 selfie →`) → 비트마다 룩 전환 0.6~0.8초 × 9(번호+룩 이름) → 3×3 그리드 2초(`which one are you? 1–9`) → 처음으로 루프.
- 커버 = 3×3 그리드. 캡션 = `comment your number 👇`. 게시 후 **상단 고정**.

### 1-1c. 프로필 링크 (수익 경로의 입구)
- 개인 계정은 **팔로워 1,000 전엔 바이오 링크가 클릭되지 않는다** → **비즈니스 계정 전환(무료) 시 즉시 클릭 가능**. 대가 = 음원이 상업용 라이브러리로 제한.
- 링크: `https://kissinskin.net/analysis/?utm_source=tiktok&utm_medium=social&utm_campaign=9looks` (/analysis 는 ko·en 한 URL).

### 1-2. 업로드 주기
- 신규 계정은 **하루 1개**가 알고리즘에 가장 빠르게 신호를 준다 → **10일 연속**(9룩 + 모아보기).
- 같은 시간대(한국 저녁 21시 = 미국 동부 오전 8시 → 글로벌 겹침).
- 30일 이상 꾸준히 올린 계정은 프로필 방문 +38% — 10일 후에도 주 3~5개 유지.

### 1-3. 게시물 형식 (영상 AI 없이 지금 만들 수 있는 것)
**7~9초 컷 전환 영상** (이미지 2장 + 편집만, 과금 0):
1. 0~1.5초 — 비포(민낯) + 흰 상자 훅 문구 (예: `the lip everyone's asking for`)
2. 비트 드롭에 **하드 컷** → 애프터 + DynaPuff 룩 이름 (`cover-text-dynapuff/`)
3. 애프터에 느린 줌인 3~4초
4. 끝 1.5초 — `try it on your own selfie → kissinskin.net` (프로필 링크 안내)

- 커버 = 애프터 + DynaPuff 제목 (그리드 3:4 안전영역 확인 완료).
- 캡션: 훅 1줄 + 룩 설명 + `#blood lip #kbeauty #makeuptransformation #aimakeup` 3~5개.
- 대안: 사진 모드(캐러셀) 비포 → 애프터 → CTA 3장. 영상 전환이 기본, 캐러셀은 A/B 한 번.

### 1-4. 생성 파이프라인 (애프터 이미지)
```
1) 운영자: 모델 원본(민낯) 을 코드스페이스 casting/tiktok/ 에 업로드
2) 무료 점검:  node scripts/gen-look-models.mjs --before-dir=./casting/tiktok --dry
3) 샘플 1장(Blood Lip) → --out-dir 로 스크래치에 생성 → 운영자 OK
4) 나머지 8장 → 개수 대조
```
- 비용: gpt-image-2 ≈ **$0.22/장 × 9 ≈ $2** (재생성 여유 포함 ~$3).
- 원본 매칭: **정면** 컷 → 눈 룩(Maximalist·Metallic·Grunge), **살짝 미소** 컷 → 립 룩(Blood·Bold), 측면(프로필) 컷은 애프터 편집에 부적합 → 제외 또는 영상 단계용.

### 1-5. 측정 (매 게시물 48시간 후)
조회수 · 평균 시청 시간 · 완주율 · 저장 · 공유 · 프로필 방문 · 팔로우 전환.
**다음 편 결정 규칙:** 완주율 상위 룩의 훅 문구 패턴을 다음 편에 복제.

---

## 2단계 — 모델에 움직임 (영상) 준비

> ✅ **착수 시점 확정(2026-10-04 운영자):** 1단계 9룩(+모아보기) 틱톡 게시를 **다 끝낸 다음** 2단계로 간다. 순서 바꾸지 않음.
> 착수 첫 행동 = 가격 재조사(WebSearch) → K-Pop 비포/애프터 쌍으로 **샘플 1개(≈$1)** → 운영자 OK → 나머지 8룩.
> 게시 형식은 1단계 캐러셀(209, 계정 최고)과 **A/B** — 영상이 무조건 이긴다고 가정하지 말 것.

> 🎬 **형식 확정(2026-10-04 운영자): 룩마다 컨셉·콘티가 있는 12~15초 CF.** 전 구간 AI 영상 아님 —
> 컷 4~6개 중 **움직임은 2~3컷(각 3~4초)**, 나머지는 스틸+편집(줌·패럴랙스·컷 전환). 컷이 짧을수록 얼굴 일관성↑·비용↓.
> 원칙: ①첫 1초에 훅(TV CF 의 느린 도입 금지) ②마지막 컷 = 룩 이름 + kissinskin.net ③AI 클립은 1단계 스틸을 시작/끝 프레임으로 고정(얼굴 튐 방지)
> ④매끈함보다 질감 — 틱톡은 광고 티 나는 영상을 덜 밀어줌(Creative Center: 오가닉형이 VTR +22%). 1편당 AI 비용 ≈ $1.5~3(재시도 포함).

### 2-1. 핵심 아이디어: "첫 프레임 = 비포, 마지막 프레임 = 애프터"
Kling·Veo 모두 **시작/끝 프레임 지정(image-to-video with first & last frame)** 을 지원 →
1단계에서 만든 비포/애프터 쌍을 그대로 넣으면 **메이크업이 얼굴 위에서 번져 나오는 변신 영상**이 된다.
= 새 촬영·새 캐스팅 없이 1단계 자산 재사용.

### 2-2. 모델 선택 (2026-09 기준 조사)

| 모델 | 가격(이미지→영상) | 장점 | 비고 |
|---|---|---|---|
| **Kling 3.0** | 1080p 무음 **$0.112/초**, 720p $0.084/초 | 인물 움직임·일관성 최상급, 15초, 9:16 | 1순위 후보 |
| **Veo 3.1 Fast** | 1080p 무음 **$0.10/초**, 유음 $0.15/초 | 9:16 네이티브, 음향 동기화 | Gemini 키 결제 상태 확인 필요(8월 차단 이력) |
| Runway Gen-4.5 | 구독형 | 샷 단위 연출 | 편집 중심일 때 |
| ~~Sora 2~~ | — | — | **API 2026-09-24 종료** — 쓰지 말 것 |

- 8초 클립 1개 ≈ **$0.8~0.9**. 9룩 × (시도 2~3회) ≈ **$15~25**.
- ⚠ 대량 전 필수: 무료 점검 → 비용 고지 → **샘플 1~2개** → 운영자 OK → 전량 (9/13 $13 사고 재발 방지).

### 2-3. 영상 포맷 로드맵
1. **변신 영상**(시작=비포, 끝=애프터, 6~8초) — 1단계 게시물을 영상 버전으로 재업로드/리믹스
2. **고개 돌리기·미소**(애프터 단독, 5초) — 룩을 여러 각도로 → "진짜 사람 같다" 체류시간
3. **9룩 연속 모핑**(15~20초) — 룩→룩 전환, 시리즈 결산
4. (이후) 립싱크/보이스는 **보류** — 실존 인물 오인 리스크↑, 라벨 필수

### 2-4. 운영자 준비물
- [ ] 모델 원본 8장 코드스페이스 업로드 (`casting/tiktok/`)
- [ ] Kling API 키(또는 Veo용 Gemini 결제 재확인) — 2단계 착수 전
- [ ] 틱톡 계정 프로필 링크 = 사이트 무료 진단 (UTM: `utm_source=tiktok&utm_campaign=9looks`)
- [ ] 업로드 시 AI 라벨 토글 ON

---

## 출처
- 비포/애프터 완주율 +40%, 뷰티 5대 포맷 — https://syncly.app/blog/tiktok-influencer-marketing-beauty-brands , https://benly.ai/learn/tiktok-ads/tiktok-ads-beauty-cosmetics
- 신규 계정 하루 1회, 30일 연속 +38% — https://sociallyin.com/resources/how-often-should-you-post-on-tiktok/ , https://joinbrands.com/blog/how-often-to-post-on-tiktok/
- AI 라벨·C2PA·가상 인플루언서 Creator Rewards 불가 — https://www.cinerads.com/blog/tiktok-ai-content-policy , https://www.tiktok.com/creator-academy/en/article/ai-generated-content-label
- 가상 인플루언서 참여율 5.67% vs 1.89% — https://metricool.com/ai-virtual-influencers/
- Kling 3.0 API 가격 — https://kling.ai/dev/pricing , https://costbench.com/software/ai-media-apis/kling-api/
- Veo 3.1 Fast 가격·9:16 — https://fal.ai/models/fal-ai/veo3.1/fast/image-to-video , https://developers.googleblog.com/en/veo-3-and-veo-3-fast-new-pricing-new-configurations-and-better-resolution/
- 모델 비교·Sora 2 종료 — https://pinggy.io/blog/best_video_generation_ai_models/ , https://www.lovart.ai/blog/5-best-ai-video-models-compared-2026
