import { MBTI_ORDER, MAKEUP_MBTI_TYPES } from '../lib/makeup-mbti/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import ToolCard from '../components/ToolCard'
import { LOOK_IMAGES } from '../lib/makeup/lookImages'
import { useI18n } from '../i18n/I18nContext'

interface Tool {
  koHref: string
  enHref: string
  icon: string
  koTitle: string
  enTitle: string
  koDesc: string
  enDesc: string
  koCta: string
  enCta: string
  accent: string
  badge?: 'NEW' | 'POPULAR' | 'CORE'
  available: boolean
  /** 실제 수치 — 문항 수·소요 시간. 지어낸 값은 쓰지 않는다. */
  koMeta?: string
  enMeta?: string
  /** 카드 상단 결과 사진(룩 이미지 재사용) */
  image?: string
}

// 도구색은 토큰(--color-tool-*)에서만 가져온다 — 단일 소스. 설명은 한 줄 핵심.
// 영문 제목은 영어권 실검색어를 따른다(detector/quiz) — "simulator"류 직역은 검색량이 없다.
// /analysis/ 는 KO·EN 공용 앱이다(로케일을 런타임에 잡는다) → 프리픽스를 붙이지 않는다.
const TOOLS: Tool[] = [
  {
    koHref: '/analysis/',
    enHref: '/analysis/',
    icon: 'auto_awesome',
    koTitle: 'AI 메이크업 시뮬레이터',
    enTitle: 'AI Makeup Try-On',
    koDesc: '셀카 한 장으로 즉시 K-뷰티 메이크업 — 무료.',
    enDesc: 'K-beauty makeup on your selfie, instantly — free.',
    koCta: '시작하기',
    enCta: 'Start',
    accent: 'var(--color-tool-ai)',
    badge: 'CORE',
    available: true,
  },
  {
    koHref: '/tools/makeup-mbti/',
    enHref: '/en/tools/makeup-mbti/',
    icon: 'quiz',
    koTitle: '메이크업 MBTI 테스트',
    koMeta: '8문항 · 약 2분 · 16유형',
    enMeta: '8 questions · ~2 min · 16 types',
    image: '/mood/tool-mbti.webp',
    enTitle: 'Makeup MBTI Quiz',
    koDesc: '8문항으로 보는 내 메이크업 성향 16타입.',
    enDesc: '8 questions → your makeup personality, 16 types.',
    koCta: '테스트',
    enCta: 'Take the quiz',
    accent: 'var(--color-tool-mbti)',
    badge: 'POPULAR',
    available: true,
  },
  {
    koHref: '/tools/personal-color/',
    enHref: '/en/tools/personal-color/',
    icon: 'palette',
    koTitle: '퍼스널 컬러 자가 진단',
    koMeta: '6문항 · 약 1분 · 4계절',
    enMeta: '6 questions · ~1 min · 4 seasons',
    image: '/mood/tool-personal-color.webp',
    enTitle: 'Personal Color Analyzer',
    koDesc: '6문항으로 찾는 봄·여름·가을·겨울 타입.',
    enDesc: '6 questions → Spring, Summer, Autumn or Winter.',
    koCta: '진단',
    enCta: 'Analyze',
    accent: 'var(--color-tool-pc)',
    available: true,
  },
  {
    koHref: '/tools/face-shape/',
    enHref: '/en/tools/face-shape/',
    icon: 'face',
    koTitle: '얼굴형 자가 진단',
    koMeta: '6문항 · 약 1분 · 5가지 얼굴형',
    enMeta: '6 questions · ~1 min · 5 shapes',
    image: '/mood/tool-face-shape.webp',
    enTitle: 'Face Shape Detector',
    koDesc: '6문항으로 보는 5가지 얼굴형 맞춤 가이드.',
    enDesc: '6 questions → 5 face shapes, each with its own guide.',
    koCta: '진단',
    enCta: 'Analyze',
    accent: 'var(--color-tool-face)',
    available: true,
  },
  {
    koHref: '/tools/perfume-type/',
    enHref: '/en/tools/perfume-type/',
    icon: 'local_florist',
    koTitle: '나에게 어울리는 향수',
    koMeta: '5문항 · 약 1분 · 6가지 향',
    enMeta: '5 questions · ~1 min · 6 scents',
    image: '/mood/tool-perfume.webp',
    enTitle: 'What Perfume Suits Me',
    koDesc: '5문항으로 찾는 6가지 향 타입.',
    enDesc: '5 questions → 6 scent families matched to you.',
    koCta: '진단',
    enCta: 'Find mine',
    accent: 'var(--color-tool-perfume)',
    badge: 'NEW',
    available: true,
  },
  {
    koHref: '/about-makeup-ai/',
    enHref: '/en/about-makeup-ai/',
    icon: 'menu_book',
    koTitle: 'K-뷰티 메이크업 완전 가이드',
    koMeta: '장문 가이드 · 읽는 데 약 12분',
    enMeta: 'Long-form · ~12 min read',
    image: '/mood/tool-guide.webp',
    enTitle: 'The Complete K-Beauty Makeup Guide',
    koDesc: 'K-뷰티 메이크업을 깊이 이해하는 심화 가이드.',
    enDesc: 'A long-form guide to how K-beauty makeup actually works.',
    koCta: '읽기',
    enCta: 'Read',
    accent: 'var(--color-tool-guide)',
    available: true,
  },
]

// 피처 카드에 깔 결과물 4장 — 피부톤·룩이 서로 다른 조합.
const FEATURE_LOOKS = ['natural-glow', 'bold-lip', 'blush-draping', 'metallic-eye'] as const

const BADGE_LABEL: Record<NonNullable<Tool['badge']>, { ko: string; en: string }> = {
  CORE: { ko: '시그니처', en: 'Signature' },
  POPULAR: { ko: '인기', en: 'Popular' },
  NEW: { ko: '신규', en: 'New' },
}

export default function ToolsHub() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const count = TOOLS.filter((t) => t.available).length

  return (
    <div className="font-display bg-white min-h-screen">
      <ToolsNav />

      <main>
        {/* ── 히어로 ──
            2026-07-22 개편. 이전엔 도구 6개가 전부 같은 크기 카드로 나란히 놓여 있었다.
            그래서 ① 우리 주력 상품(AI 메이크업)과 보조 진단 도구의 위계가 없었고
            ② 카드에 결과 사진이 한 장도 없어 "무엇을 해 주는 곳인지" 안 보였다.
            16Personalities 가 규모("10억 회 응시")를 앞세우고 CTA 를 하나로 모으는 방식,
            YouCam 이 결과물을 먼저 보여주는 방식을 합쳐 주력 1개를 큰 면으로 끌어올린다. */}
        <section className="border-b border-slate-200 bg-cream">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
            <p className="t-eyebrow text-primary mb-4">kissinskin · Tools</p>
            <h1 className="t-display text-navy mb-5 max-w-[18ch]">
              {isEn ? 'Every beauty answer, in one place' : '뷰티의 모든 답을 한 곳에서'}
            </h1>
            <p className="t-body text-slate-600 max-w-[52ch]">
              {isEn
                ? 'Makeup, personal color, face shape, perfume. All free, all in under a minute.'
                : '메이크업 · 퍼스널 컬러 · 얼굴형 · MBTI까지. 모두 무료로 30초 안에.'}
            </p>
            <p className="t-label text-slate-500 mt-5">
              {isEn ? `${count} tools · No sign-up needed` : `${count}개 도구 · 회원가입 불필요`}
            </p>
          </div>
        </section>

        {/* ── 주력: AI 메이크업 (대형 피처) ──
            나머지 5개와 같은 크기로 두면 "무료 진단 6개 중 하나"로 읽힌다. 실제로는 이게
            유일한 유료 전환 지점이다. 홈 히어로와 같은 패턴(결과물 + 예시 얼굴)을 쓴다. */}
        <section className="py-10 md:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <a
              href="/analysis/"
              className="group block overflow-hidden bg-navy text-white transition-colors hover:bg-navy-mid"
            >
              <div className="flex flex-col md:flex-row md:items-stretch">
                <div className="md:w-2/5 lg:w-1/3 shrink-0 grid grid-cols-2">
                  {FEATURE_LOOKS.map((id) => (
                    <img
                      key={id}
                      src={LOOK_IMAGES[id].after}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-32 w-full object-cover object-top md:h-full"
                    />
                  ))}
                </div>
                <div className="flex-1 p-6 md:p-10 flex flex-col justify-center">
                  <p className="t-eyebrow text-primary mb-3">
                    {isEn ? 'Signature · Free once' : '시그니처 · 무료 1회'}
                  </p>
                  <h2 className="t-h1 mb-3">
                    {isEn ? 'AI Makeup Try-On' : 'AI 메이크업 시뮬레이터'}
                  </h2>
                  <p className="t-body text-white/80 mb-6 max-w-[46ch]">
                    {isEn
                      ? 'K-beauty makeup on your own selfie in about 60 seconds. No card, no sign-up for your first try.'
                      : '셀카 한 장이면 60초 만에 K-뷰티 메이크업 9룩. 첫 생성은 카드도 가입도 필요 없습니다.'}
                  </p>
                  <span className="inline-flex w-fit items-center gap-2 bg-white text-navy px-6 py-3.5 font-bold t-body group-hover:gap-3 transition-all">
                    {isEn ? 'Try it free' : '무료로 시작하기'}
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </span>
                </div>
              </div>
            </a>
          </div>
        </section>

        {/* ── 나머지 무료 진단 도구 ──
            문항 수·유형 수를 라벨로 앞세운다. "얼마나 걸리고 무엇이 나오는지"가
            진단 도구를 누르게 만드는 유일한 정보다(16Personalities 가 같은 방식). */}
        <section className="pb-14 md:pb-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="t-h2 text-navy mb-1.5">
              {isEn ? 'Free diagnostics' : '무료 진단 도구'}
            </h2>
            <p className="t-caption text-slate-500 mb-6">
              {isEn ? 'No sign-up, unlimited retries.' : '가입 없이, 몇 번이든 다시 할 수 있어요.'}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.filter((t) => t.koHref !== '/analysis/').map((tool) => (
                <ToolCard
                  key={tool.koTitle}
                  href={isEn ? tool.enHref : tool.koHref}
                  icon={tool.icon}
                  accent={tool.accent}
                  title={isEn ? tool.enTitle : tool.koTitle}
                  desc={isEn ? tool.enDesc : tool.koDesc}
                  tag={tool.badge ? BADGE_LABEL[tool.badge][isEn ? 'en' : 'ko'] : undefined}
                  cta={isEn ? tool.enCta : tool.koCta}
                  available={tool.available}
                  image={tool.image}
                  meta={isEn ? tool.enMeta : tool.koMeta}
                />
              ))}
            </div>
          </div>
        </section>

        {/* MBTI types preview — clean grid */}
        <section className="border-t border-slate-200 bg-background-light py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="t-eyebrow text-primary mb-3">
              {isEn ? '16 Makeup MBTI types' : '16가지 메이크업 MBTI'}
            </div>
            <h2 className="t-h2 text-navy mb-2">
              {isEn
                ? 'Browse the types before you take the quiz'
                : '테스트 전에 유형을 먼저 살펴볼 수도 있어요'}
            </h2>
            <p className="t-caption text-slate-600 mb-7">
              {isEn
                ? 'Each type page has its signature look, matched colors, and styling tips.'
                : '각 유형 페이지에는 시그니처 룩, 추천 컬러, 매칭 팁이 정리되어 있습니다.'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {MBTI_ORDER.map((code) => {
                const t = MAKEUP_MBTI_TYPES[code]
                return (
                  <a
                    key={code}
                    href={`${isEn ? '/en' : ''}/tools/makeup-mbti/${t.slug}/`}
                    className="group bg-white border border-slate-200 hover:border-navy rounded-lg px-3 py-2.5 transition-colors"
                  >
                    <div className="t-label text-slate-400 mb-0.5">
                      {t.code}
                    </div>
                    <div className="t-caption font-bold text-navy group-hover:text-primary truncate">
                      {isEn ? t.enName : t.koName}
                    </div>
                  </a>
                )
              })}
            </div>
          </div>
        </section>
      </main>

      <ToolsFooter />
    </div>
  )
}
