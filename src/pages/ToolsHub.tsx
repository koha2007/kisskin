import { MBTI_ORDER, MAKEUP_MBTI_TYPES } from '../lib/makeup-mbti/types'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import ToolCard from '../components/ToolCard'
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
    enTitle: 'The Complete K-Beauty Makeup Guide',
    koDesc: 'K-뷰티 메이크업을 깊이 이해하는 심화 가이드.',
    enDesc: 'A long-form guide to how K-beauty makeup actually works.',
    koCta: '읽기',
    enCta: 'Read',
    accent: 'var(--color-tool-guide)',
    available: true,
  },
]

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
        {/* Header — same minimal pattern as other hubs */}
        <section className="border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
              kissinskin · Tools
            </div>
            <h1 className="text-[28px] md:text-[40px] font-bold text-navy leading-[1.15] tracking-tight mb-4">
              {isEn ? 'Every beauty answer, in one place' : '뷰티의 모든 답을 한 곳에서'}
            </h1>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed">
              {isEn
                ? 'Makeup, personal color, face shape, perfume. All free, all in under a minute.'
                : '메이크업 · 퍼스널 컬러 · 얼굴형 · MBTI까지. 모두 무료로 30초 안에.'}
            </p>
            <div className="mt-6 text-xs text-slate-500">
              {isEn ? `${count} tools · No sign-up needed` : `${count}개 도구 · 회원가입 불필요`}
            </div>
          </div>
        </section>

        {/* Tools — color-accented card grid for visual pull + at-a-glance scan */}
        <section className="py-10 md:py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {TOOLS.map((tool) => (
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
                />
              ))}
            </div>
          </div>
        </section>

        {/* MBTI types preview — clean grid */}
        <section className="border-t border-slate-200 bg-slate-50 py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
              {isEn ? '16 Makeup MBTI types' : '16가지 메이크업 MBTI'}
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-navy mb-2 tracking-tight">
              {isEn
                ? 'Browse the types before you take the quiz'
                : '테스트 전에 유형을 먼저 살펴볼 수도 있어요'}
            </h2>
            <p className="text-sm text-slate-600 mb-7">
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
                    <div className="text-[10px] font-mono text-slate-400 mb-0.5">
                      {t.code}
                    </div>
                    <div className="text-sm font-semibold text-navy group-hover:text-primary truncate">
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
