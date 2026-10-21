// 관상 + 사주 → 운 9가지 점수·이유·처방 (2026-10-21)
// ────────────────────────────────────────────────────────────────────
// 입력은 둘 중 하나만 있어도 된다(사진만 / 생년월일만 / 둘 다).
//   • 관상: 운마다 관상 12궁의 해당 부위 수치(z) — 예) 재물운 = 재백궁(콧방울 너비)
//   • 사주: 일간(나)을 기준으로 한 십성(十星) 분포 — 예) 재물운 = 재성(내가 극하는 오행)
// 점수 = 70 기준 ± 근거, 52~97 로 자른다. 결과마다 "왜 그런지" 한 줄을 함께 낸다.
// 같은 입력이면 항상 같은 결과(공유·재방문 시 결과가 바뀌면 신뢰가 깨진다).
//
// ⚠ 재미로 보는 결과다(화면 고지). 건강운은 활력·혈색 이야기만 — 질병·수명 언급 금지.
import { ELEMENTS, controls, generates, generatedBy, branchElement, stemElement, type Element, type Saju } from './saju'
import type { MetricKey } from './face'
import type { FortuneLookId } from './looks'

const ALL: FortuneLookId[] = ['wealth', 'love', 'marriage', 'reunion', 'career', 'exam', 'health', 'popularity', 'travel']

/** 나를 극하는 오행(관성) */
const controlledBy = (e: Element): Element => ELEMENTS[(ELEMENTS.indexOf(e) + 3) % 5]

const DOHWA = [0, 3, 6, 9] // 자·묘·오·유 — 도화(桃花)
const YEOKMA = [2, 5, 8, 11] // 인·사·신·해 — 역마(驛馬)

export interface FortuneScore {
  id: FortuneLookId
  score: number
  /** 관상 근거 한 줄(사진 있을 때) */
  faceKo?: string; faceEn?: string
  /** 사주 근거 한 줄(생년월일 있을 때) */
  sajuKo?: string; sajuEn?: string
}

// ── 관상: 운별 부위와 문장 ──
type FaceRule = { w: Partial<Record<MetricKey, number>>; hiKo: string; loKo: string; hiEn: string; loEn: string }
const FACE: Record<FortuneLookId, FaceRule> = {
  wealth: { w: { nose: 1, chin: 0.3 },
    hiKo: '콧방울이 넉넉한 편 — 재백궁(재물 창고)이 든든해요', loKo: '코가 섬세한 편 — 코끝에 빛을 더하면 재백궁이 살아나요',
    hiEn: 'Generous nose wings — a strong wealth palace', loEn: 'A delicate nose — light on the nose tip boosts the wealth palace' },
  love: { w: { open: 0.7, lip: 0.5 },
    hiKo: '눈이 크고 입술이 도톰한 편 — 남녀궁에 도화 기운이 있어요', loKo: '눈매가 차분한 편 — 애교살을 살리면 연애운이 피어나요',
    hiEn: 'Big eyes and full lips — peach-blossom energy in the love palace', loEn: 'Calm eyes — lifting the aegyo-sal blooms your love luck' },
  marriage: { w: { lip: 0.5, gap: 0.4, tilt: -0.2 },
    hiKo: '눈꼬리 옆이 매끈한 편 — 처첩궁이 안정적이에요', loKo: '눈꼬리 쪽이 날렵한 편 — 눈가에 은은한 광을 주면 인연이 부드러워져요',
    hiEn: 'Smooth outer eye area — a calm spouse palace', loEn: 'Sharp outer eyes — a soft glow there smooths your ties' },
  reunion: { w: { open: 0.5, tilt: -0.5 },
    hiKo: '순한 눈매 — 다시 만나고 싶은 인상을 줘요', loKo: '또렷한 눈매 — 힘을 빼면 첫 만남의 설렘이 돌아와요',
    hiEn: 'Gentle eyes — the face people want to see again', loEn: 'Defined eyes — softening them brings back first-meeting magic' },
  career: { w: { fore: 1, brow: 0.3 },
    hiKo: '이마가 시원한 편 — 관록궁(직업 자리)이 밝아요', loKo: '이마가 아담한 편 — 이마 중앙에 광을 주면 관록궁이 열려요',
    hiEn: 'An open forehead — a bright career palace', loEn: 'A compact forehead — light at its centre opens the career palace' },
  exam: { w: { brow: 1, gap: 0.3 },
    hiKo: '미간이 넓고 시원한 편 — 명궁이 맑아 집중력이 좋아요', loKo: '미간이 좁은 편 — 미간을 깨끗하게 정리하면 명궁이 밝아져요',
    hiEn: 'Wide space between the brows — a clear life palace and focus', loEn: 'Close brows — tidying the brow-space brightens the life palace' },
  health: { w: { chin: 0.5, nose: 0.3, open: 0.2 },
    hiKo: '얼굴 아래쪽이 탄탄한 편 — 활력이 오래가는 상이에요', loKo: '얼굴선이 가는 편 — 혈색을 더하면 생기가 확 살아나요',
    hiEn: 'A sturdy lower face — lasting vitality', loEn: 'Fine facial lines — a healthy flush brings energy forward' },
  popularity: { w: { mouth: 0.8, chin: 0.4 },
    hiKo: '입이 시원한 편 — 노복궁(사람 복)이 넉넉해요', loKo: '입이 아담한 편 — 입꼬리를 살리면 사람이 모여요',
    hiEn: 'A generous mouth — plenty of people-luck', loEn: 'A petite mouth — lifting the lip corners draws people in' },
  travel: { w: { fore: 0.5, gap: 0.6 },
    hiKo: '이마와 눈 사이가 넓은 편 — 천이궁(이동 자리)이 열려 있어요', loKo: '얼굴 중심이 모인 편 — 이마 양옆에 빛을 주면 천이궁이 열려요',
    hiEn: 'A wide brow area — an open travel palace', loEn: 'Centred features — light on the temples opens the travel palace' },
}

// ── 사주: 운별 십성과 문장 ──
export function sajuRatios(s: Saju) {
  const total = ELEMENTS.reduce((a, e) => a + s.counts[e], 0) || 1
  const r = (e: Element) => s.counts[e] / total
  const dm = s.dayMaster
  const pillars = [s.year, s.month, s.day, ...(s.hour ? [s.hour] : [])]
  const branchIn = (set: number[]) => pillars.filter((p) => set.includes(p.branch)).length / pillars.length
  const mean = 1 / 5
  const variance = ELEMENTS.reduce((a, e) => a + (r(e) - mean) ** 2, 0) / 5
  return {
    same: r(dm), output: r(generates(dm)), wealth: r(controls(dm)), power: r(controlledBy(dm)), resource: r(generatedBy(dm)),
    dohwa: branchIn(DOHWA), yeokma: branchIn(YEOKMA), balance: 1 - Math.min(1, Math.sqrt(variance) / 0.2),
  }
}
type SajuKey = keyof ReturnType<typeof sajuRatios>
/**
 * 사주 요소별 [평균, 표준편차] — 1960~2009 무작위 생년월일 2만 개 실측(2026-10-21, 절반은 태어난 시 포함).
 * 기대값을 어림(0.2 등)으로 잡았더니 비겁(일간 자신이 항상 포함 → 평균 0.32)·도화가 부풀어
 * 1위가 재회운·인복운에 몰렸다(23%·20%, 건강·결혼 2%). 실측 기준으로 표준화해 고르게 만든다.
 */
const SAJU_NORM: Record<SajuKey, [number, number]> = {
  same: [0.3176, 0.1448], output: [0.1713, 0.1443], wealth: [0.1707, 0.1437], power: [0.1703, 0.1425],
  resource: [0.1702, 0.1436], dohwa: [0.3356, 0.255], yeokma: [0.3333, 0.2544], balance: [0.2858, 0.2112],
}
const SAJU: Record<FortuneLookId, { w: Partial<Record<SajuKey, number>>; hiKo: string; loKo: string; hiEn: string; loEn: string }> = {
  wealth: { w: { wealth: 1, output: 0.5 },
    hiKo: '재성(財星)이 살아 있어 돈이 들어오는 길이 보여요', loKo: '재성이 약한 편 — 메이크업으로 금(金)·재물의 기운을 보태요',
    hiEn: 'Strong Wealth stars — money finds its way to you', loEn: 'Light Wealth stars — add golden energy with makeup' },
  love: { w: { output: 0.6, dohwa: 1 },
    hiKo: '도화(桃花) 기운이 있어 사람을 끄는 매력이 있어요', loKo: '도화가 조용한 편 — 볼의 혈색이 매력을 깨워요',
    hiEn: 'Peach-blossom stars — natural magnetism', loEn: 'Quiet peach-blossom stars — a cheek flush wakes your charm' },
  marriage: { w: { wealth: 0.5, power: 0.5, balance: 0.4 },
    hiKo: '재성·관성이 고르게 있어 인연이 안정적이에요', loKo: '인연의 별이 한쪽에 몰린 편 — 부드러운 로즈 톤이 균형을 잡아요',
    hiEn: 'Balanced Wealth and Power stars — steady relationships', loEn: 'Lopsided partner stars — soft rose tones restore balance' },
  reunion: { w: { dohwa: 0.8, same: 0.4 },
    hiKo: '도화와 비겁이 함께 있어 다시 이어지는 인연이 강해요', loKo: '지난 인연보다 새 인연의 기운이 강한 시기예요',
    hiEn: 'Peach-blossom plus companion stars — ties that come back', loEn: 'New connections outshine old ones right now' },
  career: { w: { power: 1, resource: 0.5 },
    hiKo: '관성(官星)이 있어 자리와 인정이 따라와요', loKo: '관성이 약한 편 — 반듯한 눈썹과 이마 광으로 존재감을 더해요',
    hiEn: 'Power stars — recognition and position follow you', loEn: 'Light Power stars — sharp brows and a lit forehead add presence' },
  exam: { w: { resource: 1, power: 0.5 },
    hiKo: '인성(印星)이 있어 배우고 붙는 힘이 좋아요', loKo: '인성이 약한 편 — 맑은 미간과 또렷한 눈빛이 집중력을 보태요',
    hiEn: 'Resource stars — you learn fast and pass well', loEn: 'Light Resource stars — a clear brow-space and bright eyes help focus' },
  health: { w: { balance: 1 },
    hiKo: '오행이 고르게 퍼져 기운이 안정적이에요', loKo: '오행이 한쪽에 몰린 편 — 부족한 기운의 색으로 생기를 채워요',
    hiEn: 'Evenly spread elements — steady energy', loEn: 'Uneven elements — the missing colour refills your vitality' },
  popularity: { w: { same: 0.8, output: 0.6 },
    hiKo: '비겁·식상이 살아 있어 친구와 팬이 모여요', loKo: '혼자가 편한 기운 — 웃어 보이는 입꼬리가 사람을 불러요',
    hiEn: 'Companion and Output stars — friends and fans gather', loEn: 'A solo streak — smiling lip corners draw people in' },
  travel: { w: { yeokma: 1, output: 0.3 },
    hiKo: '역마(驛馬) 기운이 있어 멀리 갈수록 운이 열려요', loKo: '역마가 조용한 편 — 이마 양옆의 빛이 새 길을 열어요',
    hiEn: 'Traveling-horse stars — luck opens the farther you go', loEn: 'Quiet traveling stars — light on the temples opens new roads' },
}

/** 입력 지문 → 같은 입력이면 같은 작은 흔들림(±3) — 모두 똑같은 점수가 나오지 않게 */
function jitter(seed: string, id: string): number {
  let h = 2166136261
  for (const c of seed + id) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) }
  return ((h >>> 0) % 7) - 3
}

export function readFortunes(input: { z?: Record<MetricKey, number>; saju?: Saju; seed: string }): FortuneScore[] {
  const sr = input.saju ? sajuRatios(input.saju) : null
  const out = ALL.map((id) => {
    let score = 70
    const r: FortuneScore = { id, score }
    if (input.z) {
      const rule = FACE[id]
      let v = 0, wsum = 0
      for (const [k, w] of Object.entries(rule.w) as [MetricKey, number][]) { v += input.z[k] * w; wsum += Math.abs(w) }
      const fz = v / (wsum || 1)
      score += fz * 9
      const hi = fz >= 0
      r.faceKo = hi ? rule.hiKo : rule.loKo
      r.faceEn = hi ? rule.hiEn : rule.loEn
    }
    if (sr) {
      const rule = SAJU[id]
      let v = 0, wsum = 0
      for (const [k, w] of Object.entries(rule.w) as [SajuKey, number][]) {
        const [mu, sd] = SAJU_NORM[k]
        v += ((sr[k] - mu) / sd) * w; wsum += Math.abs(w)
      }
      const sz = Math.max(-2, Math.min(2, v / (wsum || 1)))
      score += sz * 9
      const hi = sz >= 0
      r.sajuKo = hi ? rule.hiKo : rule.loKo
      r.sajuEn = hi ? rule.hiEn : rule.loEn
    }
    r.score = Math.round(Math.max(52, Math.min(97, score + jitter(input.seed, id))))
    return r
  })
  return out.sort((a, b) => b.score - a.score)
}

/** 일간·오행 요약(카드·결과용) */
export function sajuSummary(s: Saju) {
  return {
    dayMasterStem: s.day.stem,
    dayMaster: stemElement(s.day.stem),
    lacking: s.lacking,
    strongest: s.strongest,
    zodiacBranchElement: branchElement(s.year.branch),
  }
}
