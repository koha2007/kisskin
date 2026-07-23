// 블로그 카테고리는 영구 삭제됐다(재생성 안 함).
//
// ⚠️ 이 함수는 2026-07-14 까지 **한 번도 실행된 적이 없다.** Cloudflare Pages 는
//    `public/_routes.json` 의 `include` 에 걸린 경로에서만 Functions 를 호출하는데
//    거기에 `/blog/*` 가 빠져 있었다. 그래서 구글은 넉 달 내내 404 만 받았다
//    (서치콘솔 "찾을 수 없음(404)" 10건 중 9건이 /blog/*). 같은 날 include 에 추가했다.
//    → functions/ 에 새 경로를 만들면 **_routes.json 에도 반드시 넣을 것.**
//
// 정책: 실제로 대체할 페이지가 있는 3개만 301. 나머지는 **410 Gone**.
//   전부 홈으로 301 보내면 구글이 soft 404 로 취급해서 오히려 안 좋고, 사용자에게도
//   "내가 찾던 글"이 아닌 홈이 뜬다. 없어진 건 없어졌다고 말하는 편이 정직하고 빨리 정리된다.

interface Ctx {
  request: Request
}

const REDIRECTS: Record<string, string> = {
  'personal-color-system-deep-dive': '/tools/personal-color/',
  'face-shape-celebrity-analysis': '/tools/face-shape/',
  'eyeliner-shape-eye-type': '/guides/',
}

function extractSlug(pathname: string): string | null {
  // /blog/<slug>/ 또는 /blog/<slug>
  const m = pathname.match(/^\/blog\/([^/]+)\/?$/)
  return m ? m[1] : null
}

const GONE_HTML = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>없어진 글입니다 · kissinskin</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
       font-family:system-ui,-apple-system,"Pretendard",sans-serif;background:#f5efe3;color:#232a52}
  .box{max-width:28rem;padding:2rem;text-align:center}
  h1{font-size:1.25rem;margin:0 0 .75rem;color:#232a52}
  p{margin:0 0 1.5rem;line-height:1.7;color:#6b6558;font-size:.95rem}
  a{display:inline-block;margin:0 .25rem;padding:.6rem 1.1rem;border-radius:4px;
    background:#d8503c;color:#fff;text-decoration:none;font-weight:700;font-size:.875rem}
  a.ghost{background:#fff;color:#232a52;border:1px solid #232a5240}
</style></head>
<body><div class="box">
  <h1>이 글은 삭제되었습니다</h1>
  <p>블로그는 더 이상 운영하지 않습니다. 대신 무료 진단 도구와 메이크업 가이드를 준비해 두었습니다.</p>
  <a href="/tools/">무료 도구 보기</a><a class="ghost" href="/guides/">가이드 읽기</a>
</div></body></html>`

export async function onRequest(context: Ctx) {
  const url = new URL(context.request.url)
  const slug = extractSlug(url.pathname)
  const target = slug ? REDIRECTS[slug] : undefined

  if (target) return Response.redirect(`${url.origin}${target}`, 301)

  // 그 외 전부(옛 허브 /blog/ 포함) — 영구 삭제.
  return new Response(GONE_HTML, {
    status: 410,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
