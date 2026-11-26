// 홈 화면용 작은 이미지(가로 480px) — 2026-11-26. 파일은 빌드 때 scripts/gen-sm-images.mjs 가 public/sm 에 만든다.
// <img {...smImg(src)} /> — /sm/... 를 쓰고, 없거나 깨지면 한 번만 원본으로 되돌린다.
const SM_DIRS = ['mood/', 'looks/charts/', 'ideal-type/', 'fortune/looks/', 'hair/jj/', 'paint/samples/', 'styles/looks/hero/', 'products/', 'news/', 'real/']

export function smSrc(src: string): string {
  if (!src.startsWith('/') || src.startsWith('/sm/')) return src
  const path = src.slice(1).split('?')[0]
  const dir = path.slice(0, path.lastIndexOf('/') + 1)
  // ideal-type 는 바로 아래·samples·card 만(뱃지 등은 원본이 이미 작다)
  const ok = SM_DIRS.some((d) => dir === d) || dir === 'ideal-type/samples/' || dir === 'ideal-type/card/'
  return ok ? `/sm${src}` : src
}

export function smImg(src: string): { src: string; onError?: (e: { currentTarget: HTMLImageElement }) => void } {
  const s = smSrc(src)
  if (s === src) return { src }
  return { src: s, onError: (e) => { const el = e.currentTarget; if (el.dataset.fb) return; el.dataset.fb = '1'; el.src = src } }
}
