// ════════════════════════════════════════════════════════════════════
// IndexNow 색인 요청 (네이버 + Bing) — 2026-07-12
// ────────────────────────────────────────────────────────────────────
// 왜: 메타(title/description/스키마)를 고쳐도 검색엔진이 다시 크롤링해야 스니펫이
//     갱신된다. 그냥 두면 몇 주가 걸린다. IndexNow 는 "이 URL 바뀌었으니 다시 와라"를
//     HTTP 한 번으로 알리는 공개 프로토콜이다(계정 로그인 불필요).
//
// ⚠ 구글은 IndexNow 를 지원하지 않는다 → 구글은 Search Console 에서 사람이 직접
//   "색인 생성 요청"을 눌러야 한다. 이 스크립트는 네이버·Bing 만 처리한다.
//   (Clarity 실측상 우리 외부 유입의 70%가 네이버라 실익이 크다.)
//
// 사전 조건: public/<KEY>.txt 가 배포돼 있어야 한다(소유 증명). 배포 전에 실행하면
//   검색엔진이 키 검증에 실패해 요청이 거부된다.
//
// 사용:
//   node scripts/indexnow.mjs                 # 사이트맵 전체
//   node scripts/indexnow.mjs --changed       # 이번에 메타를 고친 핵심 URL만
//   node scripts/indexnow.mjs --dry           # 전송 없이 목록만 출력
// ════════════════════════════════════════════════════════════════════
const KEY = '7a2764f44db55c311d1d17dfbc7e8389'
const HOST = 'kissinskin.net'
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`

// 색인 요청을 받는 엔드포인트. IndexNow 는 참여 검색엔진끼리 요청을 공유하지만,
// 네이버에는 직접 보내는 편이 확실하다.
const ENDPOINTS = [
  { name: 'Naver',    url: 'https://searchadvisor.naver.com/indexnow' },
  { name: 'IndexNow', url: 'https://api.indexnow.org/indexnow' },   // Bing 등에 전파
]

// 이번에 메타를 고친 페이지 — 스니펫이 거짓이던 곳이라 최우선 재크롤링 대상.
const CHANGED = [
  `https://${HOST}/`,
  `https://${HOST}/analysis/`,
  `https://${HOST}/en/`,
  `https://${HOST}/tools/`,
]

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const ONLY_CHANGED = args.includes('--changed')

async function urlsFromSitemap() {
  const res = await fetch(`https://${HOST}/sitemap.xml`)
  if (!res.ok) throw new Error(`sitemap ${res.status}`)
  const xml = await res.text()
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

async function submit(endpoint, urlList) {
  const res = await fetch(endpoint.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList }),
  })
  const text = await res.text().catch(() => '')
  // 200/202 = 접수. 422 = URL/키 불일치. 403 = 키 검증 실패(키 파일 미배포).
  return { status: res.status, body: text.slice(0, 160) }
}

async function main() {
  // 키 파일이 실제로 배포됐는지 먼저 확인 — 안 되어 있으면 요청이 전부 거부된다.
  const keyRes = await fetch(KEY_LOCATION)
  const keyBody = keyRes.ok ? (await keyRes.text()).trim() : ''
  if (keyBody !== KEY) {
    console.error(`✖ 키 파일 검증 실패: ${KEY_LOCATION} (HTTP ${keyRes.status})`)
    console.error('  배포가 끝난 뒤 다시 실행하세요. 키 파일이 없으면 색인 요청이 거부됩니다.')
    process.exit(1)
  }
  console.log(`✅ 키 파일 확인: ${KEY_LOCATION}`)

  const urlList = ONLY_CHANGED ? CHANGED : await urlsFromSitemap()
  console.log(`제출 대상: ${urlList.length}개 URL`)

  if (DRY) {
    urlList.slice(0, 10).forEach((u) => console.log('  ' + u))
    if (urlList.length > 10) console.log(`  … 외 ${urlList.length - 10}개`)
    console.log('\n--dry: 전송하지 않음.')
    return
  }

  for (const ep of ENDPOINTS) {
    try {
      const r = await submit(ep, urlList)
      const ok = r.status === 200 || r.status === 202
      console.log(`${ok ? '✅' : '⚠️'} ${ep.name}: HTTP ${r.status}${r.body ? ' — ' + r.body : ''}`)
    } catch (e) {
      console.error(`✖ ${ep.name}: ${e.message}`)
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
