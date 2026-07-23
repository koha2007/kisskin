// Affiliate product card sized for the masonry grid.
// Region-aware (재설계 지시 §3 + 운영자 ①): Korea → Coupang (+ Clio dual-button
// when the category maps to a Clio link), Global → Amazon + YesStyle. Reuses the
// shared link builders + click tracking so affiliate revenue keeps working.

import type { ReactNode } from 'react'
import type { ProductRec } from '../../lib/recommendations/types'
import {
  AFFILIATE_ENABLED,
  buildSearchLink,
  buildAmazonLink,
  buildYesStyleLink,
} from '../../lib/recommendations/types'
import { useRegion } from '../../hooks/useRegion'
import { useI18n } from '../../i18n/I18nContext'
import { AFFILIATE_CONFIG } from '../../config/affiliate'
import { getClioCategoryByIcon, getClioLinkByIcon } from '../../lib/affiliate/categoryMapping'
import { trackAffiliateClick, type AffiliatePageType } from '../../lib/affiliate/track'
import { GridCard } from './ResultGrid'
import { BentoTile, type BentoSpan } from './BentoGrid'

// Calm, compact buttons — outline chips instead of a loud full-bleed fill
// (재설계 지시 §4). `border` here sets width only; color comes per-variant.
const btn = 'flex items-center justify-center gap-1.5 w-full text-[12px] font-bold rounded-full py-2 border transition-colors'

export function ProductGridCard({
  item,
  accent = '#d8503c',
  pageType,
  pageSlug,
  span,
  slot,
}: {
  item: ProductRec
  accent?: string
  pageType: AffiliatePageType
  pageSlug: string
  /** 지정하면 벤토 그리드 타일로, 생략하면 기존 column 마소니 카드로 렌더한다.
   *  도구 결과 4종은 벤토, AI 메이크업 결과(MakeupResult)는 아직 마소니를 쓴다. */
  span?: BentoSpan
  /** 벤토에서 이 카드가 앉은 슬롯 번호 — GA4 affiliate_click 에 실린다. */
  slot?: number
}) {
  const [region] = useRegion()
  const { t, locale } = useI18n()
  const isEn = locale === 'en'
  const isGlobal = region === 'global'

  const category = isEn && item.categoryEn ? item.categoryEn : item.category
  const title = isEn && item.titleEn ? item.titleEn : item.title
  const globalQuery = item.categoryEn || item.titleEn || item.title

  const coupangLink = item.affiliateUrl || buildSearchLink(item.searchKeywords)
  const showClio =
    AFFILIATE_CONFIG.clio.enabled && AFFILIATE_CONFIG.clio.shouldShow(item.brandExamples)
  const clioCategory = showClio ? getClioCategoryByIcon(item.icon) : null
  const clioLink = showClio ? getClioLinkByIcon(item.icon) : null

  // 래퍼를 컴포넌트로 정의하면 렌더마다 새 타입이 되어 내용이 통째로 언마운트된다.
  // 내용을 먼저 만들고 껍데기만 갈아 끼운다.
  const inner: ReactNode = (
    <>
      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
            {item.icon}
          </span>
        </div>
        <div className="min-w-0">
          <div className="text-[0.6rem] uppercase tracking-wider font-bold text-slate-400">{category}</div>
          {/* truncate 였을 때 벤토 1칸 폭에서 "메탈릭 싱글 아이…" 처럼 제품명이 잘려
              무엇을 파는 카드인지 알 수 없었다. 두 줄까지 허용한다. */}
          <div className="text-[13px] font-bold text-navy leading-snug line-clamp-2">{title}</div>
        </div>
      </div>

      {item.brandExamples.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.brandExamples.map((b) => (
            <span key={b} className="px-2 py-0.5 rounded-full text-[10px] font-medium text-slate-500 bg-slate-50 border border-slate-200">
              {b}
            </span>
          ))}
        </div>
      )}

      {!AFFILIATE_ENABLED ? (
        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
          <span className="material-symbols-outlined text-sm">schedule</span>
          {t('recProducts.comingSoon')}
        </div>
      ) : isGlobal ? (
        <div className="flex flex-col gap-2">
          <a
            href={buildAmazonLink(globalQuery)}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            onClick={() => trackAffiliateClick({ merchant: 'amazon', category: item.icon, pageType, pageSlug, slot })}
            className={`${btn} bg-white`}
            style={{ color: accent, borderColor: `${accent}59` }}
          >
            🛒 {t('region.amazonButton')}
          </a>
          <a
            href={buildYesStyleLink(globalQuery)}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            onClick={() => trackAffiliateClick({ merchant: 'yesstyle', category: item.icon, pageType, pageSlug, slot })}
            className={`${btn} border border-amber-300 bg-white text-amber-600`}
          >
            ⭐ {t('region.yesstyleButton')}
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <a
            href={coupangLink}
            target="_blank"
            rel="sponsored noopener noreferrer"
            onClick={() => trackAffiliateClick({ merchant: 'coupang', category: item.icon, pageType, pageSlug, slot })}
            className={`${btn} bg-white`}
            style={{ color: accent, borderColor: `${accent}59` }}
          >
            🛒 {t('recProducts.findProducts')}
          </a>
          {showClio && clioLink && (
            <a
              href={clioLink}
              target="_blank"
              rel="sponsored noopener noreferrer"
              onClick={() => trackAffiliateClick({ merchant: 'clubclio', category: clioCategory ?? 'main', pageType, pageSlug, slot })}
              className={`${btn} border border-primary/30 bg-white text-primary`}
            >
              🌹 {t('recProducts.findOnClio')}
            </a>
          )}
        </div>
      )}
    </>
  )

  return span ? (
    <BentoTile span={span} surface="card" accent={accent} className="p-4">
      {inner}
    </BentoTile>
  ) : (
    <GridCard className="p-4" accent={accent}>
      {inner}
    </GridCard>
  )
}
