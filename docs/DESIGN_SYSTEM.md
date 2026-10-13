# kissinskin 디자인 시스템

통일된 시각 언어의 **단일 소스**. 새 UI를 만들 때 이 문서의 토큰·규칙을 따른다.
실제 토큰 정의는 `src/index.css` 의 `@theme` 블록에 있다(이 문서와 항상 일치시킬 것).

> 원칙: **메인 2색(네이비+핑크) + 통일된 카드.** "미니멀이 고급."
> 도구별 색은 식별용 **액센트 1점**으로만 쓰고, 면을 가득 칠하지 않는다.
> **배경은 색을 쥐지 않는다 — 색은 사진이 담당한다.**

---

## 1. 폰트

| 용도 | 토큰 | 스택 | 사용처 |
|------|------|------|--------|
| 제목 (display) | `--font-serif` | "Cormorant Garamond" → "Pretendard Variable" → system-ui | 큰 헤드라인 — `font-serif` 유틸 / `.article-body` 드롭캡 |
| 본문 | `--font-body` | "Pretendard Variable" + system-ui 폴백 | 그 외 모든 텍스트 |

- **Manrope 제거됨.** (이전 본문 폰트 → Pretendard 로 대체)
- **2026-07-21: 세리프 제목 폐기 → 2026-07-22 부분 복원.** 문제였던 건 세리프 자체가 아니라
  **한글 명조**(Noto Serif KR)였다. 한글 명조가 2010년대 쇼핑몰 느낌을 내 "옛스럽다"의
  주원인이었으므로 **Noto Serif KR 은 계속 제외**한다. 반대로 영문 세리프는 지금 뷰티
  에디토리얼의 표준 문법이라(Rhode·MERIT·Glossier 모두 세리프 디스플레이 + 산세리프 본문)
  **Cormorant Garamond 만 되살렸다.**
- 핵심 트릭: 스택을 `Cormorant → Pretendard` 순으로 두면 브라우저 폰트 폴백이 **글리프
  단위**로 동작하므로, Cormorant 에 없는 한글은 자동으로 Pretendard(산세리프)가 받는다.
  → **영문 제목=세리프 / 한글 제목=산세리프**가 토큰 하나로 동시에 성립한다.
  `font-serif` 유틸이 40여 곳에 박혀 있어 토큰 값만으로 전 페이지가 함께 움직인다.
- 제목 스케일 기준: 히어로 `text-[2.6rem] md:text-[3.4rem] lg:text-[4rem]` /
  섹션 제목 `text-3xl md:text-[2.5rem]`. 한글 제목 굵기는 `font-extrabold`, 자간 `-0.03em` 내외.
- `font-display` 유틸(전 페이지 본문 래퍼, ~20곳)은 호환 위해 값만 `--font-body` 와
  동일하게 둔 **legacy 별칭**이다. 신규 코드는 `--font-body`/기본 상속을 쓰고, 여유 될 때
  `font-display` → 제거 또는 `font-body` 로 정리한다.
- 웹폰트 로드: `index.html` + `pages/+Head.tsx` (Pretendard Variable **동적 서브셋**,
  jsDelivr CDN / Cormorant Garamond, Google Fonts **`display=optional`**) ·
  `pages/+Head.tsx` (Material Symbols 아이콘, `display=block`).
  ⚠️ Cormorant 가 `optional` 인 건 CLS 방어다 — 늦게 도착하면 폴백을 유지하고 바꿔치지
  않는다. Clarity 에서 CLS 0.56(나쁨)이 찍힌 상태라 제목 폰트 스왑을 추가로 허용할 수 없었다.
  아이콘 폰트도 같은 이유로 `.material-symbols-outlined` 에 1em 박스를 고정해 뒀다
  (`src/index.css`) — 리거처 텍스트 폭 때문에 site-wide 시프트가 나던 것을 막는다.
  ⚠️ 그전까지 Pretendard 는 스택에 **이름만 있고 실제 로드된 적이 없어** 한글이 시스템
  폴백(Windows=맑은 고딕)으로 렌더됐다. 폰트 스택을 바꿀 땐 실제 로드 여부를 함께 확인할 것.

## 2. 색상

### 메인 (브랜드)
| 토큰 | 값 | 용도 |
|------|----|----|
| `--color-navy` | `#070953` | 제목·본문 강조·기본 텍스트 |
| `--color-primary` | `#eb4763` | 핵심 강조(핑크), 링크/CTA 포인트 |
| `--color-primary-dark` | `#c9304a` | primary hover |
| `--color-cream` / `--color-blush` | `#faf7f2` / `#f8f1ec` | 섹션 배경 |
| `--color-navy-mid` / `--color-navy-light` | `#121570` / `#2a2d8a` | 네이비 변주 |

### 도구 액센트 (식별용 1점만)
| 토큰 | 값 | 도구 |
|------|----|----|
| `--color-tool-ai` | `#eb4763` | AI 메이크업(시그니처) |
| `--color-tool-mbti` | `#a855f7` | 메이크업 MBTI |
| `--color-tool-pc` | `#f59e0b` | 퍼스널 컬러 |
| `--color-tool-face` | `#10b981` | 얼굴형 |
| `--color-tool-perfume` | `#ec4899` | 향수 |
| `--color-tool-guide` | `#0ea5e9` | 가이드 |

> 도구색은 **아이콘 칩 틴트 + 작은 태그/화살표**에만 쓴다. 카드 배경·테두리·CTA 버튼을
> 도구색으로 가득 칠하지 않는다(과거 "6색 제각각" 문제). 필요 시 hue 를 더 톤다운 가능.

## 3. 간격·라운드

| 토큰 | 값 |
|------|----|
| `--radius` | `0.25rem` |
| `--radius-lg` | `0.5rem` |
| `--radius-xl` | `0.75rem` |
| `--radius-full` | `9999px` |

- 카드 라운드: `rounded-2xl`. 카드 패딩: `p-5 md:p-6`. 그리드 간격: `gap-4 md:gap-5`.
- 섹션 세로 여백: `py-20 md:py-28`(큰 섹션) / `py-10 md:py-14`(보조).

## 4. 카드 규칙 — `src/components/ToolCard.tsx` (공통 컴포넌트)

홈 무료도구 그리드와 `/tools` 허브가 **같은 ToolCard 를 재사용**한다(마크업 중복 금지).

```tsx
<ToolCard
  href="/tools/personal-color/"
  icon="palette"                       // Material Symbols 이름
  accent="var(--color-tool-pc)"        // 토큰만 사용
  title="퍼스널 컬러 자가 진단"
  desc="10문항으로 찾는 봄·여름·가을·겨울 타입."  // 한 줄 핵심
  tag="신규"                            // 선택 — 작은 액센트 라벨
  cta="진단"                            // 선택
/>
```

규칙:
- 카드 틀(배경 흰색·`border-slate-200`·`rounded-2xl`·그림자·hover lift)은 **전 도구 동일**.
- 액센트는 **아이콘 칩 배경 틴트(`color-mix` 12%) + 아이콘 색 + 태그/화살표**까지만.
- 설명은 **한 줄 핵심**. 학술 용어·"N가지" 숫자 hype 지양.

## 5. 적용·확인 체크리스트

- [ ] 새 색은 토큰으로 추가(하드코딩 hex 금지). 도구색은 `--color-tool-*` 만.
- [ ] 새 도구 카드 = `ToolCard` 재사용(별도 마크업 금지).
- [ ] 폰트는 제목=serif / 본문=body 2족만. 새 폰트 추가 금지.
- [ ] 시각 변경 후 홈·`/tools`·5개 도구·결과 페이지 데스크톱+모바일 전수 점검.
