// 페이스 페인팅 22종 — /face-paint/ (2026-11-11)
// ─────────────────────────────────────────────────────────────────
// 운영자 11/11: "작은 거부터 얼굴 전체까지 다양하게, 준비했던 시즌 페인팅도, 작은 페인팅도."
// 벤치마크: Snap Lens Studio·TikTok Effect House "Face Mask" = 그림을 얼굴 기준점에 붙인다.
//   전문 페인터 분류 = 볼(2~4분)·하프(5~8분)·풀(8~15분). 트렌드 = 그래픽 라이너·페이스 젬·가짜 주근깨.
//
// 두 갈래:
//   small·half(14종) = SVG 무늬. MediaPipe 얼굴 기준점(landmark)에 자동으로 붙고, 사용자가 옮기고·키우고·돌린다.
//                      무료 저장. AI 완성본(1크레딧)은 "무늬를 얹은 사진"을 보내 같은 자리에 진짜 물감으로 다시 칠한다.
//   full·season(8종)  = AI 로만 만든다(얼굴 전체 스티커는 가면처럼 떠 보인다). 원본 셀카 + 지시문.
//
// ⚠ 이 파일은 import 가 없어야 한다 — scripts 의 샘플 생성(node 타입 제거 실행)이 그대로 읽는다.
//   좌표 규칙: primary 무늬는 "사진의 오른쪽"(= 사람의 왼쪽) 얼굴에 그린다. 바깥쪽 = +x.
//   mirror 가 있으면 사진 왼쪽에도 좌우 반전해서 한 번 더 그린다.

export type PaintSize = 'small' | 'half' | 'full' | 'season'

export interface Placement {
  /** 평균을 낼 landmark 번호(사진 오른쪽 얼굴 기준) */
  at: number[]
  /** 반대쪽(사진 왼쪽) landmark — 있으면 좌우 반전으로 한 번 더 그린다 */
  mirror?: number[]
  /** SVG 폭 = 얼굴 폭 × w */
  w: number
  /** 기준점에 놓일 SVG 안의 점(viewBox 단위) */
  origin: [number, number]
  /** 기준점에서 더 옮길 거리(얼굴 폭 단위, 얼굴 기울기 기준) */
  dx?: number
  dy?: number
}

export interface PaintDesign {
  id: string
  size: PaintSize
  ko: string
  en: string
  descKo: string
  descEn: string
  /** AI 에게 이 무늬가 무엇인지 설명(영어) */
  prompt: string
  /** small·half: SVG viewBox 와 본문 */
  vb?: [number, number]
  svg?: string
  place?: Placement
  /** full·season: 예시 사진 */
  sample?: string
  /** season: 몇 월 한정인지(표시용) */
  monthKo?: string
  monthEn?: string
}

// ── 그리기 도우미 ──
const heart = (cx: number, cy: number, s: number, fill: string, extra = '') => {
  const k = s / 100, X = (x: number) => (cx + (x - 50) * k).toFixed(1), Y = (y: number) => (cy + (y - 50) * k).toFixed(1)
  return `<path d="M${X(50)} ${Y(90)} C${X(18)} ${Y(66)} ${X(2)} ${Y(48)} ${X(2)} ${Y(30)} C${X(2)} ${Y(14)} ${X(14)} ${Y(4)} ${X(28)} ${Y(4)} C${X(38)} ${Y(4)} ${X(46)} ${Y(10)} ${X(50)} ${Y(19)} C${X(54)} ${Y(10)} ${X(62)} ${Y(4)} ${X(72)} ${Y(4)} C${X(86)} ${Y(4)} ${X(98)} ${Y(14)} ${X(98)} ${Y(30)} C${X(98)} ${Y(48)} ${X(82)} ${Y(66)} ${X(50)} ${Y(90)}Z" fill="${fill}" ${extra}/>`
}
const star5 = (cx: number, cy: number, r: number, fill: string) => {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.45 : r
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`)
  }
  return `<polygon points="${pts.join(' ')}" fill="${fill}" stroke="#b07a10" stroke-width="0.6" stroke-linejoin="round"/>`
}
const sparkle = (cx: number, cy: number, r: number, fill: string) =>
  `<path d="M${cx} ${cy - r} Q${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy} Q${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r} Q${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy} Q${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r}Z" fill="${fill}"/>`
const GEM_DEFS = `<defs><radialGradient id="g" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#e6f4ff"/><stop offset="0.7" stop-color="#a9c8ff"/><stop offset="1" stop-color="#d9b3ff"/></radialGradient></defs>`
const gem = (cx: number, cy: number, r: number) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#g)" stroke="#ffffff" stroke-width="${(r * 0.18).toFixed(2)}"/>` +
  `<circle cx="${cx - r * 0.35}" cy="${cy - r * 0.38}" r="${(r * 0.28).toFixed(2)}" fill="#ffffff"/>`

/** 늘 같은 점 배치(새로고침해도 주근깨가 바뀌지 않게) */
function rng(seed: number) {
  let s = seed >>> 0
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296 }
}
function freckleDots(seed: number, colors: string[], n: number, rMin: number, rMax: number, opMin: number, opMax: number) {
  const r = rng(seed); const out: string[] = []
  let k = 0
  while (out.length < n && k++ < n * 20) {
    const x = r() * 200, y = r() * 70
    // 콧등(가운데 좁은 띠) + 양 볼 위쪽. 눈(위쪽 가장자리)·콧구멍(가운데 아래)은 비운다.
    const nose = x > 86 && x < 114 && y > 8 && y < 44
    const cheek = (x < 74 || x > 126) && y > 18 + Math.abs(x - 100) * 0.08 && y < 66 && Math.abs(x - 100) < 96
    if (!nose && !cheek) continue
    const rad = rMin + r() * (rMax - rMin), op = opMin + r() * (opMax - opMin)
    out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rad.toFixed(2)}" fill="${colors[Math.floor(r() * colors.length)]}" opacity="${op.toFixed(2)}"/>`)
  }
  return out.join('')
}

// 사진 오른쪽(사람 왼쪽) landmark 와 그 반대편
const EYE_R = [362, 263, 386, 374]
const EYE_L = [133, 33, 159, 145]
const BROW_R = [336, 296, 334, 293, 300]
const BROW_L = [107, 66, 105, 63, 70]

export const PAINT_DESIGNS: PaintDesign[] = [
  // ───────── 작은 페인팅 9 ─────────
  {
    id: 'cheek-hearts', size: 'small', ko: '볼 하트', en: 'Cheek Hearts',
    descKo: '볼에 하트 세 개', descEn: 'Three hearts on one cheek',
    prompt: 'a cluster of three glossy hot-pink hearts (one larger, two small) hand-painted on one cheekbone',
    vb: [100, 90],
    svg: heart(45, 52, 62, '#ff3b7f') + heart(82, 18, 24, '#ff6fa3') + heart(14, 16, 15, '#ff3b7f') +
      '<ellipse cx="32" cy="36" rx="7" ry="4" fill="#fff" opacity="0.55" transform="rotate(-30 32 36)"/>',
    place: { at: [280], w: 0.2, origin: [50, 50], dx: 0.03, dy: -0.01 },
  },
  {
    id: 'freckles', size: 'small', ko: '가짜 주근깨', en: 'Faux Freckles',
    descKo: '콧등과 볼에 자연스러운 점', descEn: 'Soft dots across nose and cheeks',
    prompt: 'soft natural-looking faux freckles in warm brown dotted across the bridge of the nose and the upper cheeks',
    vb: [200, 70],
    svg: freckleDots(7, ['#7b4a2e', '#8a5634', '#6a3f27'], 90, 0.8, 1.9, 0.32, 0.6),
    place: { at: [5], w: 0.74, origin: [100, 22], dy: -0.075 },
  },
  {
    id: 'glitter-freckles', size: 'small', ko: '글리터 주근깨', en: 'Glitter Freckles',
    descKo: '금빛·분홍 반짝이 점', descEn: 'Gold and pink sparkle dots',
    prompt: 'glitter freckles: tiny gold, pink and white cosmetic glitter dots and a few small four-point sparkles across the nose bridge and upper cheeks',
    vb: [200, 70],
    svg: freckleDots(11, ['#f5c542', '#ffd76a', '#ff7ab6', '#ffffff'], 80, 0.9, 2.1, 0.7, 1) +
      sparkle(40, 34, 5, '#ffe28a') + sparkle(160, 30, 5, '#ffe28a') + sparkle(100, 14, 3.5, '#ffffff') + sparkle(24, 52, 3, '#ff9ccc') + sparkle(176, 50, 3, '#ff9ccc'),
    place: { at: [5], w: 0.74, origin: [100, 22], dy: -0.075 },
  },
  {
    id: 'eye-gems', size: 'small', ko: '눈가 큐빅', en: 'Eye Gems',
    descKo: '눈꼬리에 큐빅 세 알', descEn: 'Three gems at the outer eye',
    prompt: 'three small clear iridescent adhesive rhinestones in an arc just outside the outer corner of each eye',
    vb: [60, 60],
    svg: GEM_DEFS + gem(16, 20, 6.5) + gem(28, 33, 5) + gem(37, 46, 3.8),
    place: { at: [263], mirror: [33], w: 0.13, origin: [4, 14] },
  },
  {
    id: 'under-stars', size: 'small', ko: '눈 밑 별', en: 'Under-eye Stars',
    descKo: '한쪽 눈 밑에 금빛 별 셋', descEn: 'Three gold stars under one eye',
    prompt: 'three small metallic gold stars painted in a gentle curve just under one eye on the top of the cheekbone',
    vb: [80, 46],
    svg: star5(14, 14, 11, '#f4c430') + star5(38, 26, 8.5, '#f6cf4a') + star5(60, 34, 6, '#f8d968'),
    place: { at: [346], w: 0.2, origin: [24, 12], dy: 0.01 },
  },
  {
    id: 'graphic-liner', size: 'small', ko: '그래픽 라이너', en: 'Graphic Liner',
    descKo: '떠 있는 선 + 긴 꼬리', descEn: 'Floating crease + long wing',
    prompt: 'graphic eyeliner: a sharp black floating line drawn above the eye crease on each eye and a long, sharp black wing flicked out toward the temple',
    vb: [140, 70],
    svg: '<path d="M22 30 Q60 4 102 24" fill="none" stroke="#111" stroke-width="3.6" stroke-linecap="round"/>' +
      '<path d="M84 47 L140 9 L110 45 Z" fill="#111"/>',
    place: { at: EYE_R, mirror: EYE_L, w: 0.36, origin: [60, 46], dy: -0.005 },
  },
  {
    id: 'neon-dots', size: 'small', ko: '네온 점선', en: 'Neon Dots',
    descKo: '눈꼬리부터 이어지는 형광 점', descEn: 'Glowing dots from the eye corner',
    prompt: 'a line of small glowing neon pink and electric cyan UV-paint dots running from the outer corner of each eye down and out toward the temple',
    vb: [100, 60],
    svg: '<defs><filter id="b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter></defs>' +
      [[8, 6], [20, 13], [32, 20], [44, 27], [56, 33], [68, 39], [80, 44], [92, 49]].map(([x, y], i) => {
        const c = i % 2 ? '#19e3ff' : '#ff2bd6'
        return `<circle cx="${x}" cy="${y}" r="4.2" fill="${c}" filter="url(#b)" opacity="0.9"/><circle cx="${x}" cy="${y}" r="2.6" fill="${c}"/>`
      }).join(''),
    place: { at: [263], mirror: [33], w: 0.22, origin: [2, 2] },
  },
  {
    id: 'mini-butterfly', size: 'small', ko: '나비 한 마리', en: 'Little Butterfly',
    descKo: '눈꼬리 옆 작은 나비', descEn: 'A small butterfly by the eye',
    prompt: 'one small hand-painted blue and violet butterfly with fine black outlines beside the outer corner of one eye on the temple',
    vb: [60, 50],
    svg: '<defs><linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7cc4ff"/><stop offset="1" stop-color="#8b5cf6"/></linearGradient></defs>' +
      '<path d="M30 25 C20 2 2 4 4 18 C6 28 20 28 30 25Z" fill="url(#w)" stroke="#1b1033" stroke-width="1.4"/>' +
      '<path d="M30 25 C40 2 58 4 56 18 C54 28 40 28 30 25Z" fill="url(#w)" stroke="#1b1033" stroke-width="1.4"/>' +
      '<path d="M30 26 C22 30 10 40 16 46 C22 48 28 38 30 26Z" fill="#a78bfa" stroke="#1b1033" stroke-width="1.2"/>' +
      '<path d="M30 26 C38 30 50 40 44 46 C38 48 32 38 30 26Z" fill="#a78bfa" stroke="#1b1033" stroke-width="1.2"/>' +
      '<ellipse cx="30" cy="27" rx="1.8" ry="9" fill="#1b1033"/><circle cx="12" cy="14" r="1.6" fill="#fff"/><circle cx="48" cy="14" r="1.6" fill="#fff"/>',
    place: { at: [263], w: 0.14, origin: [30, 25], dx: 0.08, dy: -0.06 },
  },
  {
    id: 'cheek-rainbow', size: 'small', ko: '볼 무지개', en: 'Cheek Rainbow',
    descKo: '구름 달린 작은 무지개', descEn: 'A tiny rainbow with clouds',
    prompt: 'a small bright rainbow arc with two little white clouds at its ends painted on one cheek',
    vb: [100, 64],
    svg: ['#ff4d4d', '#ff9f1c', '#ffd93d', '#3ddc84', '#3a86ff', '#9d4edd'].map((c, i) =>
      `<path d="M${14 + i * 4.5} 50 A${36 - i * 4.5} ${36 - i * 4.5} 0 0 1 ${86 - i * 4.5} 50" fill="none" stroke="${c}" stroke-width="4.6"/>`).join('') +
      '<g fill="#fff" stroke="#d9e2ef" stroke-width="0.8"><circle cx="10" cy="52" r="8"/><circle cx="20" cy="54" r="7"/><circle cx="4" cy="56" r="5"/><circle cx="82" cy="54" r="7"/><circle cx="92" cy="52" r="8"/><circle cx="97" cy="57" r="5"/></g>',
    place: { at: [280], w: 0.24, origin: [50, 42], dx: 0.02 },
  },

  // ───────── 얼굴 절반 5 ─────────
  {
    id: 'eye-wings', size: 'half', ko: '눈가 나비 날개', en: 'Butterfly Wing Eye',
    descKo: '눈꼬리에서 펼쳐지는 날개', descEn: 'Wings unfolding from the eye',
    prompt: 'large violet-to-pink butterfly wings with black outlines and white dots painted fanning out from the outer corner of one eye, the upper wing over the brow bone and temple, the lower wing over the cheekbone',
    vb: [200, 200],
    svg: '<defs><linearGradient id="u" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#ff5fa8"/><stop offset="1" stop-color="#9b5cf6"/></linearGradient>' +
      '<linearGradient id="l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7eb6"/><stop offset="1" stop-color="#c084fc"/></linearGradient></defs>' +
      '<path d="M18 96 C34 22 132 -2 178 34 C198 70 136 98 18 96Z" fill="url(#u)" stroke="#24123a" stroke-width="3.2" stroke-linejoin="round"/>' +
      '<path d="M18 104 C88 104 172 126 152 174 C122 198 48 162 18 104Z" fill="url(#l)" stroke="#24123a" stroke-width="3.2" stroke-linejoin="round"/>' +
      '<path d="M30 92 C70 58 120 40 160 40 M30 106 C80 120 120 140 140 166" fill="none" stroke="#24123a" stroke-width="1.6" opacity="0.7"/>' +
      '<g fill="#fff">' + [[150, 48, 5], [166, 62, 3.6], [128, 30, 3.2], [140, 160, 4.4], [118, 168, 3], [156, 146, 3]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('') + '</g>',
    place: { at: [263], w: 0.42, origin: [14, 100], dx: 0.01 },
  },
  {
    id: 'gem-brows', size: 'half', ko: '큐빅 눈썹', en: 'Gem Brows',
    descKo: '눈썹 결을 따라 큐빅', descEn: 'Rhinestones along the brows',
    prompt: 'a row of small clear iridescent rhinestones glued along the top edge of each eyebrow following its arch, larger at the arch and smaller toward the tail',
    vb: [120, 40],
    svg: GEM_DEFS + [[8, 26, 2.6], [20, 20, 3], [33, 15, 3.4], [47, 11, 3.8], [61, 9, 4], [75, 9, 3.8], [88, 12, 3.3], [100, 17, 2.8], [111, 23, 2.3]].map(([x, y, r]) => gem(x, y, r)).join(''),
    place: { at: BROW_R, mirror: BROW_L, w: 0.3, origin: [58, 22], dy: -0.012 },
  },
  {
    id: 'galaxy-eye', size: 'half', ko: '은하수 눈가', en: 'Galaxy Eye',
    descKo: '보라·파랑 우주와 별', descEn: 'Violet-blue nebula and stars',
    prompt: 'a galaxy painted around one eye: soft blended violet, deep blue and magenta nebula clouds over the eyelid, brow bone and upper cheek, sprinkled with tiny white stars and a few four-point sparkles; the eye itself stays clear',
    vb: [200, 160],
    svg: '<defs><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>' +
      '<mask id="m"><rect width="200" height="160" fill="#fff"/><ellipse cx="88" cy="84" rx="34" ry="13" fill="#000"/></mask></defs>' +
      '<g mask="url(#m)"><g filter="url(#s)" opacity="0.9"><ellipse cx="90" cy="60" rx="70" ry="36" fill="#6d28d9"/><ellipse cx="140" cy="96" rx="44" ry="40" fill="#2563eb"/><ellipse cx="70" cy="112" rx="50" ry="22" fill="#db2777"/><ellipse cx="150" cy="50" rx="30" ry="20" fill="#a21caf"/></g>' +
      [[40, 50], [62, 34], [118, 30], [150, 70], [170, 100], [132, 120], [96, 132], [58, 118], [36, 92], [150, 40], [182, 70], [80, 22]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 3 ? 1.2 : 1.8}" fill="#fff"/>`).join('') +
      sparkle(160, 60, 7, '#ffffff') + sparkle(120, 126, 5, '#fde68a') + sparkle(54, 40, 4.5, '#ffffff') + '</g>',
    place: { at: EYE_R, w: 0.5, origin: [88, 84] },
  },
  {
    id: 'flower-vine', size: 'half', ko: '꽃 덩굴', en: 'Flower Vine',
    descKo: '관자놀이에서 볼까지', descEn: 'From temple down the cheek',
    prompt: 'a delicate painted vine of green leaves and small pink and white five-petal flowers trailing from one temple down along the outer cheek',
    vb: [120, 220],
    svg: '<path d="M70 6 C40 40 88 70 60 104 C36 134 70 160 36 212" fill="none" stroke="#2f7d4a" stroke-width="3.2" stroke-linecap="round"/>' +
      [[60, 30, -40], [78, 62, 30], [50, 86, -30], [72, 124, 35], [46, 150, -30], [54, 182, 30]].map(([x, y, a]) =>
        `<ellipse cx="${x}" cy="${y}" rx="11" ry="5" fill="#3fa564" transform="rotate(${a} ${x} ${y})"/>`).join('') +
      [[70, 8, '#ff8fb8'], [62, 104, '#ffffff'], [38, 196, '#ff8fb8'], [82, 74, '#ffd1e3'], [44, 142, '#ff6fa3']].map(([x, y, c]) => {
        const xx = +x, yy = +y
        return [0, 72, 144, 216, 288].map((a) => `<ellipse cx="${xx}" cy="${yy - 7}" rx="4.6" ry="7.4" fill="${c}" stroke="#d9467f" stroke-width="0.8" transform="rotate(${a} ${xx} ${yy})"/>`).join('') +
          `<circle cx="${xx}" cy="${yy}" r="3.4" fill="#ffcc33"/>`
      }).join(''),
    place: { at: [356], w: 0.24, origin: [70, 14], dx: -0.03, dy: -0.04 },
  },
  {
    id: 'cat-whiskers', size: 'half', ko: '고양이 수염', en: 'Cat Whiskers',
    descKo: '코끝과 수염', descEn: 'Nose tip and whiskers',
    prompt: 'a cute cat face paint: the tip of the nose painted black and three thin black whiskers on each cheek with a few dots',
    vb: [300, 110],
    svg: '<path d="M138 18 Q150 12 162 18 Q160 34 150 40 Q140 34 138 18Z" fill="#141414"/>' +
      '<g stroke="#141414" stroke-width="3" stroke-linecap="round" fill="none">' +
      '<path d="M112 54 Q60 40 12 34"/><path d="M112 62 Q60 62 6 66"/><path d="M112 70 Q62 82 16 98"/>' +
      '<path d="M188 54 Q240 40 288 34"/><path d="M188 62 Q240 62 294 66"/><path d="M188 70 Q238 82 284 98"/></g>' +
      '<g fill="#141414">' + [[96, 46], [104, 58], [92, 62], [204, 46], [196, 58], [208, 62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join('') + '</g>',
    place: { at: [4], w: 0.92, origin: [150, 24] },
  },

  // ───────── 얼굴 전체(명화) 4 — AI 로만 ─────────
  {
    id: 'starry-night', size: 'full', ko: '별이 빛나는 밤', en: 'Starry Night',
    descKo: '고흐의 밤하늘을 얼굴 전체에', descEn: 'Van Gogh’s night sky on your face',
    prompt: 'a post-impressionist oil painting in thick visible brush strokes across the whole face, in the manner of Vincent van Gogh\'s The Starry Night: swirling cobalt and ultramarine night sky over forehead, eyelids and cheeks, glowing yellow stars and crescent moon on the cheekbones, a dark cypress silhouette rising along one side of the jaw. Lips painted deep blue with a yellow star highlight.',
    sample: '/paint/samples/starry-night.webp',
  },
  {
    id: 'golden-klimt', size: 'full', ko: '클림트 금박', en: 'Golden Klimt',
    descKo: '금박 모자이크로 감싼 얼굴', descEn: 'Gold-leaf mosaic framing the face',
    prompt: 'in the manner of Gustav Klimt\'s golden period: gold leaf across the forehead, temples, cheeks and jaw, broken by mosaic spirals, small squares and circles in black, ivory, turquoise and coral. The centre of the face around the eyes and nose stays clean bare skin framed by the gold. Eyes lined in black, lips a solid coral red.',
    sample: '/paint/samples/golden-klimt.webp',
  },
  {
    id: 'primary-grid', size: 'full', ko: '몬드리안 격자', en: 'Primary Grid',
    descKo: '빨강·노랑·파랑 기하 격자', descEn: 'Red, yellow and blue geometric grid',
    prompt: 'a geometric abstract painting in the manner of Piet Mondrian: straight thick black lines dividing the whole face into rectangles filled with flat matte primary red, yellow, blue and white, crossing over brows, cheeks, nose and chin. Lips part red, part blue along a black line.',
    sample: '/paint/samples/primary-grid.webp',
  },
  {
    id: 'monarch', size: 'full', ko: '제왕나비', en: 'Monarch Wings',
    descKo: '얼굴 전체를 덮는 큰 나비', descEn: 'A giant butterfly across the face',
    prompt: 'a giant monarch butterfly painted across the whole face. Its body runs down the bridge of the nose, orange and black wings with white dots spread across the forehead, eyelids and both cheeks to the ears. Black lips with a thin orange line.',
    sample: '/paint/samples/monarch.webp',
  },

  // ───────── 시즌 4 — AI 로만 (11/3 이벤트 달력) ─────────
  {
    id: 'xmas-emerald', size: 'season', ko: '크리스마스 에메랄드', en: 'Christmas Emerald',
    descKo: '에메랄드 띠·금박·호랑가시', descEn: 'Emerald band, gold leaf, holly',
    monthKo: '12월', monthEn: 'Dec',
    prompt: 'a bold Christmas ornament look: a band of saturated emerald green painted from temple to temple across both eyelids and over the bridge of the nose, edged with metallic gold leaf; eyebrows brushed with gold leaf; a small sprig of painted holly leaves with glossy red berries on one cheekbone; scattered tiny gold flakes like falling snow; a glossy ruby red lip.',
    sample: '/paint/samples/xmas-emerald.webp',
  },
  {
    id: 'valentine-hearts', size: 'season', ko: '발렌타인 하트', en: 'Valentine Hearts',
    descKo: '핑크 날개와 흘러내리는 하트', descEn: 'Pink wings and falling hearts',
    monthKo: '2월', monthEn: 'Feb',
    prompt: 'heart-breaker Valentine glam: saturated hot pink and cherry red eyeshadow swept up to the temples in a bold wing; tiny hand-painted glossy red hearts in graduated sizes running from the outer corner of one eye down across that cheekbone; pink crystals on the inner corners; a high-shine vinyl cherry red lip.',
    sample: '/paint/samples/valentine-hearts.webp',
  },
  {
    id: 'cherry-blossom', size: 'season', ko: '벚꽃', en: 'Cherry Blossom',
    descKo: '이마에서 볼까지 벚꽃 가지', descEn: 'Blossom branch from brow to cheek',
    monthKo: '4월', monthEn: 'Apr',
    prompt: 'a painted cherry blossom branch: a fine dark brown branch growing from one temple across the forehead above the brow and down onto the opposite cheek, covered in clusters of soft pink and white five-petal sakura blossoms with darker pink centres, a few loose petals drifting across the cheeks; soft rosy pink wash on the eyelids; glossy petal-pink lips.',
    sample: '/paint/samples/cherry-blossom.webp',
  },
  {
    id: 'halloween-skull', size: 'season', ko: '할로윈 해골', en: 'Halloween Skull',
    descKo: '흑백 해골, 피 없이', descEn: 'Black and white skull, no blood',
    monthKo: '10월', monthEn: 'Oct',
    prompt: 'a realistic black and white skeleton face paint with no floral or cultural decoration: white base, black hollows around the eyes, a black triangle on the nose tip, painted teeth lines across the lips and cheeks, shaded cheekbones. No blood.',
    sample: '/paint/samples/halloween-skull.webp',
  },
]

export const paintById = (id: string): PaintDesign | undefined => PAINT_DESIGNS.find((d) => d.id === id)
export const isArOnly = (d: PaintDesign) => d.size === 'small' || d.size === 'half'

/** SVG 문서(그릴 때 이미지로 읽는다) */
export function svgDoc(d: PaintDesign): string {
  const [w, h] = d.vb ?? [100, 100]
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w * 4}" height="${h * 4}">${d.svg ?? ''}</svg>`
}

// ── AI 지시문 ──
const IDENTITY =
  'IDENTITY LOCK: the result must be instantly recognisable as the SAME person. Keep bone structure, eye shape and size, nose, ' +
  'mouth shape, jawline, face width and length exactly. Do not make the person prettier, younger or slimmer. Keep the same hairstyle, ' +
  'hair colour, clothing, background, lighting, pose, expression, framing and aspect ratio. Hair stays in front of the paint. ' +
  'If the person wears or holds any accessory or prop, keep it exactly as it is. Do not add any new accessory, costume, text or watermark.'

/** 얼굴 전체·시즌 — 원본 셀카에 그린다(11/3 r3 시험 통과 문구) */
export function promptFull(d: PaintDesign): string {
  const area = d.id === 'golden-klimt' ? 'covering most of the face and framing the eyes'
    : d.size === 'season' ? 'that reads boldly at a glance, well beyond the natural lip and eye zones'
    : 'COVERING THE ENTIRE FACE from hairline to chin, ear to ear'
  return `You are an avant-garde editorial makeup artist and face painter. Edit this selfie photo to apply the "${d.en}" face-paint look.\n\n${IDENTITY}\n\n` +
    `THIS IS NOT NATURAL MAKEUP. It is a fearless face-painting look ${area}. A timid, small or delicate result is a failure. Everything must be physically painted on the skin.\n\n` +
    `THE LOOK: ${d.prompt}\n\nPhotorealistic: a real photograph of real body paint and cosmetics on real skin with visible skin texture and brush marks. Not an illustration, not a filter, not CGI.`
}

/** 작은·절반 — 무늬를 얹은 사진을 보내 같은 자리에 진짜 물감으로 다시 칠한다 */
export function promptOverlay(ds: PaintDesign[]): string {
  const list = ds.map((d) => `- ${d.prompt}`).join('\n')
  return 'You are a professional face painter. This selfie has flat digital face-paint artwork placed on the skin as a guide. ' +
    'Repaint every piece of that artwork as REAL face paint applied by hand on the skin, keeping exactly the same designs, positions, sizes, ' +
    'angles and colours as the guide:\n' + list + '\n\n' +
    'The paint must follow the curves of the face and the real lighting, show skin texture and pores through it, and have a soft cosmetic sheen; ' +
    'any rhinestones become real adhesive gems that catch the light; glitter becomes real cosmetic glitter. Do not add any other makeup or design ' +
    'and do not move the artwork.\n\n' + IDENTITY + '\n\nPhotorealistic photograph. Not an illustration, not a sticker, not a filter.'
}
