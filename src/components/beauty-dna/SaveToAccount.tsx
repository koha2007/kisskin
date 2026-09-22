// "저장하려면 로그인" 띠 (SUBSCRIBER_GROWTH_PLAN P1).
//
// 우리가 세우는 **유일한 로그인 벽**이다. 도구 자체는 계속 무로그인으로 둔다 —
// 유입의 대부분이 거기로 오므로 거기에 벽을 세우면 트래픽이 죽는다. 대신
// "이미 만든 걸 잃지 않으려면"이라는, 사람들이 납득하는 자리에만 권한다.
//
// 무로그인 결과는 localStorage 에만 있어 브라우저를 지우거나 폰을 바꾸면 사라진다.
// 그 사실을 숨기지 않고 그대로 쓰는 게 이 띠의 전부다. 겁주는 게 아니라 사실이고,
// 로그인하면 lib/beauty-dna/sync.ts 가 계정으로 올려 기기를 넘어 따라온다.

import { useI18n } from '../../i18n/I18nContext'
import { useAuth } from '../../hooks/useAuth'
import { useBeautyDna } from '../../hooks/useBeautyDna'
import { trackSaveIntent } from '../../lib/analytics'

export function SaveToAccount() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const { user, loading } = useAuth()
  const { done, total } = useBeautyDna()

  // 저장할 게 없으면 권하지 않는다. 로그인했으면 이미 계정에 올라가 있다.
  // loading 중에는 아무것도 그리지 않는다 — 로그인한 사람에게 이 띠가 깜빡이면 거짓말이 된다.
  if (loading || user || done === 0) return null

  const nextParam = encodeURIComponent(`${isEn ? '/en' : ''}/tools/beauty-dna/`)

  return (
    <section className="bg-navy">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          {/* 카피 규칙(2026-09-22): "저장하세요"라는 **우리 쪽 동작**이 아니라
              저장하면 그 사람에게 무엇이 남는지를 먼저 말한다. 잃는 것(브라우저에만 있음)만
              말하면 겁주기로 읽히고, 얻는 것(4개가 모이면 통합 해석)이 빠져 있었다. */}
          <p className="text-white font-bold text-sm md:text-base">
            {isEn
              ? done >= total
                ? 'Keep all your results — and your combined reading'
                : `Keep your ${done} result${done > 1 ? 's' : ''} — and pick up where you left off`
              : done >= total
                ? '진단 4가지 완료 — 결과와 통합 해석을 계정에 남겨두세요'
                : `여기까지 한 ${done}개, 다음에도 이어서 볼 수 있게 남겨두세요`}
          </p>
          <p className="text-white/70 text-xs md:text-sm mt-1">
            {isEn
              ? 'They live only in this browser right now. Saving keeps them across devices, and once all four are in we read them together into one makeup profile.'
              : '지금은 이 브라우저에만 있어요. 저장해 두면 폰을 바꿔도 따라오고, 4가지가 모이면 하나의 메이크업 해석으로 묶어드려요.'}
          </p>
        </div>
        <a
          href={`${isEn ? '/en' : ''}/auth/?next=${nextParam}`}
          onClick={() => trackSaveIntent(done, total)}
          className="inline-flex items-center justify-center gap-2 bg-white text-navy px-6 py-3 font-bold text-sm whitespace-nowrap hover:bg-white/90 transition-colors"
        >
          {/* 로그인이 필요하다는 사실을 버튼에서 숨기지 않는다 — 눌러보고 로그인 화면이 뜨면
              그 자리에서 이탈한다(2026-07-31 "가입 없이"가 거짓이었던 건과 같은 뿌리). */}
          {isEn ? 'Save — free account' : '무료 계정으로 저장'}
          <span className="material-symbols-outlined text-base">arrow_forward</span>
        </a>
      </div>
    </section>
  )
}
