// 마이페이지 "저장한 메이크업 방법" — /looks/{id}/ 에서 저장한 룩(user_metadata.saved_looks).
// 저장해 놓고 다시 찾을 곳이 없으면 저장 버튼이 거짓말이 된다 → 마이페이지에 목록.
// 비어 있으면 숨기지 않고 "9룩 방법 보기"로 보낸다(채우고 싶게 — BeautyRecord 와 같은 원칙).
import { useI18n } from '../../i18n/I18nContext'
import { MAKEUP_STYLES } from '../../lib/makeup/styles'
import { LOOK_HOWTO } from '../../lib/looks/howto'
import { useSavedLooks } from '../../lib/looks/savedLooks'

export function SavedLooks() {
  const { locale } = useI18n()
  const isEn = locale === 'en'
  const prefix = isEn ? '/en' : ''
  const { saved, toggle, busy } = useSavedLooks()
  const items = MAKEUP_STYLES.filter((s) => saved.includes(s.id))

  if (items.length === 0) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex -space-x-3 shrink-0" aria-hidden="true">
          {['blood-lip', 'kpop-idol', 'maximalist-eye'].map((id) => (
            <span key={id} className="relative block h-14 w-11 overflow-hidden rounded-md border-2 border-white bg-[#f3eee6]">
              <img src={`/looks/charts/${id}.webp`} alt="" loading="lazy" decoding="async"
                className="absolute left-1/2 top-[-30%] w-[150%] max-w-none -translate-x-1/2" />
            </span>
          ))}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-slate-600 leading-snug">
            {isEn ? 'No saved looks yet. Save a how-to and it stays here on any device.' : '아직 저장한 룩이 없어요. 방법을 저장하면 어느 기기에서든 여기서 다시 볼 수 있어요.'}
          </p>
          <a href={`${prefix}/looks/`} className="mt-1.5 inline-flex items-center gap-1 text-[13px] font-bold text-navy">
            {isEn ? 'Browse 9 how-tos' : '9룩 방법 보기'}
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div>
      <ul className="grid grid-cols-3 gap-2.5">
        {items.map((s) => {
          const how = LOOK_HOWTO[s.id]
          return (
            <li key={s.id} className="relative">
              <a href={`${prefix}/looks/${s.id}/`} className="group block">
                <span className="relative block aspect-[3/4] overflow-hidden rounded-lg border border-slate-200 bg-[#f3eee6]">
                  <img src={`/looks/charts/${s.id}.webp`} alt={isEn ? `${s.subEn} face chart` : `${s.nameKo} 페이스 차트`}
                    loading="lazy" decoding="async"
                    className="absolute left-1/2 top-[-28%] w-[150%] max-w-none -translate-x-1/2 transition-transform group-hover:scale-105" />
                </span>
                <span className="mt-1.5 block truncate text-[12px] font-bold text-navy">{isEn ? s.subEn : s.nameKo}</span>
                <span className="block text-[11px] text-slate-500">
                  {how.steps.length}{isEn ? ' steps' : '단계'} · {how.minutes}{isEn ? ' min' : '분'}
                </span>
              </a>
              <button
                type="button"
                disabled={busy}
                onClick={() => void toggle(s.id)}
                aria-label={isEn ? `Remove ${s.subEn}` : `${s.nameKo} 저장 해제`}
                className="absolute right-1 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm hover:bg-white"
              >
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark</span>
              </button>
            </li>
          )
        })}
      </ul>
      <a href={`${prefix}/looks/`} className="mt-3 inline-flex items-center gap-1 text-[13px] font-bold text-navy">
        {isEn ? 'More how-tos' : '다른 룩 방법 보기'}
        <span className="material-symbols-outlined text-base">arrow_forward</span>
      </a>
    </div>
  )
}
