import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import { isMerchantMonetized } from '../config/affiliate'
import { useI18n } from '../i18n/I18nContext'
import { useRegion } from '../hooks/useRegion'

// Unified affiliate disclosure block. Rendered once per page below the product CTAs.
//
// 고지문은 승인 상태를 **자동으로** 따라간다. 예전엔 글로벌 문구가 "제휴 아님"으로 하드코딩돼
// 있었는데, YesStyle/Amazon 승인이 나는 순간 그 문장은 거짓이 된다(수수료를 받으면서 안 받는다고
// 말하는 것 = FTC/공정위 고지 위반). config/affiliate.ts 의 approved 플래그만 켜면 문구가 바뀐다.
export default function AffiliateDisclosure({ className = '' }: { className?: string }) {
  const { t } = useI18n()
  const [region] = useRegion()
  if (!AFFILIATE_ENABLED) return null

  const globalEarns = isMerchantMonetized('yesstyle') || isMerchantMonetized('amazon')
  const key =
    region === 'global'
      ? globalEarns
        ? 'recProducts.disclosureGlobalAffiliate'
        : 'recProducts.disclosureGlobal'
      : 'recProducts.disclosure'

  return (
    <p
      className={`text-xs text-slate-400 leading-relaxed ${className}`}
      role="note"
    >
      {t(key)}
    </p>
  )
}
