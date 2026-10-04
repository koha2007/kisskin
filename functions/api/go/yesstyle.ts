// GET /api/go/yesstyle?q=<영문 검색어>  →  302 YesStyle 검색 결과
//
// 사이트의 "YesStyle에서 검색" 버튼이 전부 여기를 거친다(buildYesStyleLink).
// 검색어를 그대로 넘기면 대부분 "0 items" 가 떠서(2026-10-04 실측 80개 중 61개),
// 후보(_yesstyleQuery.ts)를 앞에서부터 실제로 조회해 결과 있는 첫 후보로 보낸다.
//
// · YesStyle 결과 페이지 HTML 에 `totalCount":N` 이 박혀 온다 — JS 실행 없이 읽힌다.
// · 연속 조회가 많으면 YesStyle 이 차단 페이지를 준다 → 순차 조회, 첫 성공에서 멈춤,
//   결과를 하루 캐시. 차단·타임아웃이면 조회 없이 FALLBACK 후보로 보낸다(버튼이 죽지는 않는다).

import { yesStyleCandidates, yesStyleSearchUrl } from '../_yesstyleQuery'
import { YESSTYLE_AFFILIATE } from '../../../src/config/affiliate'

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36'
const MAX_LOOKUPS = 6
const LOOKUP_TIMEOUT_MS = 2500

/** 결과 수. 차단·오류면 null. */
async function countResults(q: string): Promise<number | null> {
  try {
    const res = await fetch(yesStyleSearchUrl(q), {
      headers: { 'user-agent': UA, 'accept-language': 'en' },
      signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
    })
    if (!res.ok) return null
    const m = /totalCount\\?":(\d+)/.exec(await res.text())
    return m ? Number(m[1]) : null
  } catch {
    return null
  }
}

async function resolve(candidates: string[]): Promise<string> {
  // 조회가 막히면 컬러명만 뗀 후보 — 실측상 가장 덜 틀린다.
  const fallback = candidates[1] ?? candidates[0]
  for (const c of candidates.slice(0, MAX_LOOKUPS)) {
    const n = await countResults(c)
    if (n === null) return fallback
    if (n > 0) return c
  }
  // 앞 후보가 전부 0 이면 마지막(종류만 — "cream blush")으로. 비어 보이는 화면보단 낫다.
  return candidates[candidates.length - 1]
}

const redirect = (q: string) => {
  const dest = yesStyleSearchUrl(q)
  // CF 딥링크는 목적지 URL 을 통째로 인코딩해 프리픽스 뒤에 붙이는 형식이다.
  const { approved, deeplinkPrefix } = YESSTYLE_AFFILIATE
  const location = approved && deeplinkPrefix ? `${deeplinkPrefix}${encodeURIComponent(dest)}` : dest
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      'Cache-Control': 'public, max-age=86400',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  })
}

export const onRequestGet: PagesFunction = async ({ request, waitUntil }) => {
  const raw = (new URL(request.url).searchParams.get('q') || '').slice(0, 200).trim()
  if (!raw) return Response.redirect('https://www.yesstyle.com/en/', 302)

  // Workers 전역 caches.default — DOM 타입과 겹쳐 타입에선 안 보인다.
  const cache = (caches as unknown as { default: Cache }).default
  const cacheKey = new Request(`https://kissinskin.net/api/go/yesstyle?q=${encodeURIComponent(raw.toLowerCase())}`)
  const hit = await cache.match(cacheKey)
  if (hit) return hit

  const res = redirect(await resolve(yesStyleCandidates(raw)))
  waitUntil(cache.put(cacheKey, res.clone()))
  return res
}
