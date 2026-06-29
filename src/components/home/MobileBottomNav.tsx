// 모바일 하단 고정 네비 (홈/진단/결과/마이) — "홈 버튼 없음" 문제 해결.
// md 이상에선 숨김(데스크톱은 상단 nav 사용). 라우트는 운영자 확정 매핑:
// 홈→/ · 진단→/analysis/(AI 메이크업) · 결과→/mypage/ · 마이→로그인 여부에 따라.
import { useI18n } from '../../i18n/I18nContext'
import { useAuth } from '../../hooks/useAuth'

export default function MobileBottomNav() {
  const { t, locale } = useI18n()
  const isEn = locale === 'en'
  const { user } = useAuth()
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'

  const items = [
    { key: 'home', icon: 'home', label: t('nav.home'), href: isEn ? '/en/' : '/', active: path === '/' || path === '/en/' },
    { key: 'diagnose', icon: 'auto_awesome', label: t('nav.diagnose'), href: '/analysis/', active: path.startsWith('/analysis') },
    { key: 'results', icon: 'grid_view', label: t('nav.results'), href: '/mypage/', active: path.startsWith('/mypage') },
    { key: 'my', icon: 'person', label: t('nav.my'), href: user ? '/mypage/' : '/auth/', active: path.startsWith('/auth') },
  ]

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label={isEn ? 'Bottom navigation' : '하단 메뉴'}
    >
      <div className="grid grid-cols-4">
        {items.map((it) => (
          <a
            key={it.key}
            href={it.href}
            aria-current={it.active ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold transition-colors ${
              it.active ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px] leading-none"
              style={it.active ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {it.icon}
            </span>
            {it.label}
          </a>
        ))}
      </div>
    </nav>
  )
}
