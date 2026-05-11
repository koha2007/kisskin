import { useI18n } from '../i18n/I18nContext'

type ToolKey = 'face-shape' | 'personal-color' | 'makeup-mbti' | 'ai-makeup'

interface Tool {
  key: ToolKey
  href: string
  hrefEn?: string  // when present, replaces href when locale === 'en'
  emoji: string
  titleKo: string
  titleEn: string
  descKo: string
  descEn: string
  accent: string
}

const TOOLS: Tool[] = [
  {
    key: 'ai-makeup',
    href: '/analysis',
    hrefEn: '/en/',
    emoji: '💄',
    titleKo: 'AI 메이크업 시뮬레이터',
    titleEn: 'AI Makeup Simulator',
    descKo: '셀카 한 장으로 9가지 K-뷰티 룩을 30초 만에',
    descEn: 'One selfie, 9 K-beauty looks in 30 seconds',
    accent: '#eb4763',
  },
  {
    key: 'face-shape',
    href: '/tools/face-shape/',
    hrefEn: '/en/tools/face-shape/',
    emoji: '👤',
    titleKo: '얼굴형 진단',
    titleEn: 'Face Shape Quiz',
    descKo: '6문항으로 5가지 얼굴형 + 컨투어링 가이드',
    descEn: '6 questions → 5 shapes + contour guide',
    accent: '#10b981',
  },
  {
    key: 'personal-color',
    href: '/tools/personal-color/',
    emoji: '🌈',
    titleKo: '퍼스널 컬러 자가 진단',
    titleEn: 'Personal Color Quiz',
    descKo: '6문항으로 봄웜·여름쿨·가을웜·겨울쿨 분석',
    descEn: '6 questions → 4-season color analysis',
    accent: '#f59e0b',
  },
  {
    key: 'makeup-mbti',
    href: '/tools/makeup-mbti/',
    emoji: '🎨',
    titleKo: '메이크업 MBTI',
    titleEn: 'Makeup MBTI',
    descKo: '8문항으로 16가지 메이크업 성향 진단',
    descEn: '8 questions → 16 makeup personality types',
    accent: '#a855f7',
  },
]

interface Props {
  exclude: ToolKey
  /** Optional headline override. */
  titleKo?: string
  titleEn?: string
}

export default function RelatedTools({ exclude, titleKo, titleEn }: Props) {
  const { locale } = useI18n()
  const isEn = locale === 'en'

  const visible = TOOLS.filter((t) => t.key !== exclude)
  const heading = isEn
    ? titleEn || 'Try the other tools too'
    : titleKo || '다른 무료 도구도 시도해 보세요'
  const subheading = isEn
    ? 'All free. No signup. Each takes under two minutes.'
    : '모두 무료 · 회원가입 불필요 · 각 2분 이내'

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-background-light via-white to-background-light border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-2">
            {isEn ? 'More from kissinskin' : 'kissinskin 더 보기'}
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-2">
            {heading}
          </h2>
          <p className="text-sm text-slate-500">{subheading}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {visible.map((tool) => {
            const href = isEn && tool.hrefEn ? tool.hrefEn : tool.href
            return (
              <a
                key={tool.key}
                href={href}
                className="group bg-white rounded-2xl p-5 border hover:shadow-lg transition-all hover:-translate-y-0.5 flex flex-col gap-2"
                style={{ borderColor: `${tool.accent}30` }}
              >
                <div className="text-3xl mb-1">{tool.emoji}</div>
                <h3
                  className="text-base font-extrabold text-navy-mid leading-tight group-hover:text-primary transition-colors"
                  style={{ borderLeftColor: tool.accent }}
                >
                  {isEn ? tool.titleEn : tool.titleKo}
                </h3>
                <p className="text-xs md:text-sm text-slate-500 leading-relaxed">
                  {isEn ? tool.descEn : tool.descKo}
                </p>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 group-hover:text-primary group-hover:gap-2 transition-all mt-1">
                  {isEn ? 'Start' : '시작하기'}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
