// SEO 제목·설명 길이 규칙 — 생성기(gen-news/gen-products)와 백필이 공유하는 단일 소스
// ════════════════════════════════════════════════════════════════════
// 2026-07-28. 프리렌더 216장을 실측하니 검색 결과에서 잘리는 페이지가 대부분이었다:
//   · 한글 title 35자 초과 104/124장(83%) — 최장 87자
//   · 영문 title 60자 초과  56/92장(60%) — 최장 174자
//   · 설명은 한글 60% / 영문 64% 초과 — 최장 430자
// 원인은 단순했다. 뉴스·제품 아이템에 seoTitle/seoDescription 이 아예 없어서
// `본문 제목 + ' · kissinskin News'` 와 `본문 요약` 으로 폴백하는데, 생성기 프롬프트에
// 길이 제약이 한 줄도 없었다.
//
// 잘리면 무슨 일이 생기나: 구글이 제목을 제 마음대로 다시 쓴다. 174자짜리 제목은
// 우리가 쓴 문장이 SERP 에 그대로 나갈 가능성이 0 이다. 브랜드 접미사 '· kissinskin
// News' 는 항상 잘려 나가서 붙이는 의미도 없었다.
//
// 한계치 근거: 구글 SERP 제목은 픽셀 폭(약 600px) 기준이라 글자 수는 근사치다.
// 한글은 글자당 폭이 영문의 약 2배 → 한글 30자 ≈ 영문 58자로 잡는다.
// 설명도 같은 원리(한글 78자 ≈ 영문 155자).
//
// ⚠️ seoTitle 에는 브랜드 접미사를 붙이지 않는다. +Head 는 seoTitle 이 있으면 그대로
//    쓰므로, 여기서 만든 문장이 곧 SERP 제목이다. 사이트명은 구글이 따로 표시한다.

export const LIMITS = {
  ko: { titleMax: 30, descMin: 55, descMax: 78 },
  en: { titleMax: 58, descMin: 110, descMax: 155 },
}

/** 프롬프트에 그대로 끼워 넣는 스키마 두 줄(한국어 생성용). */
export const KO_SCHEMA_LINES = `  "seoTitle": "검색 결과용 제목(한국어, ${LIMITS.ko.titleMax}자 이내). 본문 제목을 줄인 게 아니라, 이 글을 찾을 사람이 실제로 검색할 말로 다시 쓴 완결된 제목. 사이트명·브랜드 접미사 붙이지 말 것.",
  "seoDescription": "검색 결과용 설명(한국어, ${LIMITS.ko.descMin}~${LIMITS.ko.descMax}자). 이 글에서만 얻을 수 있는 게 뭔지 한 문장으로. 문장을 중간에 끊지 말 것.",`

/** 프롬프트에 그대로 끼워 넣는 스키마 두 줄(영어 번역용). */
export const EN_SCHEMA_LINES = `  "seoTitle": "SERP title in English, max ${LIMITS.en.titleMax} characters. A complete, natural headline someone would actually search — not a truncation. No site-name suffix.",
  "seoDescription": "SERP description in English, ${LIMITS.en.descMin}-${LIMITS.en.descMax} characters. One sentence on what this page uniquely gives. Never cut off mid-sentence.",`

/**
 * 마지막 안전망 — 모델이 한계를 넘겼을 때만 손본다.
 * 자르는 건 최후의 수단이다(어색해진다). 그래서 우선 문장/어절 경계를 찾고,
 * 그래도 안 되면 그때만 말줄임표를 쓴다.
 */
export function fitText(s, max, { sentence = false } = {}) {
  const t = String(s || '').trim().replace(/\s+/g, ' ')
  if (!t || t.length <= max) return t

  if (sentence) {
    // 설명: 한계 안에 들어오는 마지막 문장 끝에서 끊는다.
    const cuts = [...t.matchAll(/[.!?]\s|다\.\s|요\.\s/g)].map((m) => m.index + m[0].trimEnd().length)
    const fit = cuts.filter((i) => i <= max).pop()
    if (fit && fit >= max * 0.6) return t.slice(0, fit).trim()
  }
  // 어절 경계
  const space = t.lastIndexOf(' ', max - 1)
  if (space >= max * 0.6) return t.slice(0, space).trim()
  return t.slice(0, max - 1).trim() + '…'
}

/** 아이템에 seoTitle/seoDescription 을 보정해서 넣는다(없으면 폴백에서 만들어 준다). */
export function applySeoMeta(item, locale, { title, summary } = {}) {
  const lim = LIMITS[locale]
  item.seoTitle = fitText(item.seoTitle || title || item.title, lim.titleMax)
  item.seoDescription = fitText(item.seoDescription || summary || item.summary, lim.descMax, { sentence: true })
  return item
}
