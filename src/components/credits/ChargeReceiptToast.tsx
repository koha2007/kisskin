// 결제 복귀 영수증 토스트(2026-11-09) — 충전 결제 후 돌아온 모든 화면(/analysis/·/makeup/·/lucky-makeup/, 1·5·9장) 공통.
// 운영자: "결제하면 바로 생성 화면으로 가는데, 몇 개 충전됐는지·내가 몇 개 있는지 알 수 있으면 좋겠다"
//   → 이어 만들기 흐름은 그대로 두고, 위에 "+N개 충전 · 지금 M개 · 내역 보기" 를 띄운다.
// 5가지·9장 탭에선 기존 한 줄 안내가 숨은 상자 안에 있어 아예 안 보였다 → 화면 위 고정으로 통일.
// 상태(useChargeReceipt)와 그림(ChargeReceiptToast)을 나눴다 — 화면 단계가 바뀌며 토스트가 다시 붙어도 확인을 처음부터 다시 하지 않게.
import { CREDITS_PAGE, type ChargeState } from '../../hooks/useChargeReceipt'

export default function ChargeReceiptToast({ st, onClose, isEn }: { st: ChargeState; onClose: () => void; isEn: boolean }) {
  if (!st) return null
  const ok = st.k === 'ok'
  return (
    <div role="status" aria-live="polite" className="fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-[max(12px,env(safe-area-inset-top))] font-display">
      <div
        className="flex w-full max-w-md items-start gap-2 rounded-2xl px-4 py-3 text-left text-[13px] leading-snug text-white shadow-lg break-keep"
        style={{ background: st.k === 'late' ? '#7a4b12' : '#1f5e3a' }}
      >
        <span className="material-symbols-outlined mt-px text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
          {ok ? 'check_circle' : st.k === 'late' ? 'schedule' : 'hourglass_top'}
        </span>
        <span className="min-w-0 flex-1">
          {st.k === 'checking' && (isEn ? 'Confirming your payment…' : '결제를 확인하고 있어요…')}
          {ok && (
            <>
              <strong className="block text-[14px]">
                {isEn
                  ? `Payment complete — +${st.r.added} credit${st.r.added === 1 ? '' : 's'}`
                  : `결제 완료 — 크레딧 +${st.r.added}개 충전`}
                {st.r.bonus > 0 && (isEn ? ` (+${st.r.bonus} invite bonus)` : ` (초대 보너스 +${st.r.bonus})`)}
              </strong>
              {isEn
                ? `You now have ${st.r.balance} credit${st.r.balance === 1 ? '' : 's'}. 1 look uses 1. `
                : `지금 보유 ${st.r.balance}개 · 룩 1장에 1개씩 쓰여요. `}
              <a href={CREDITS_PAGE} className="font-bold underline underline-offset-2">{isEn ? 'View history' : '내역 보기'}</a>
            </>
          )}
          {st.k === 'late' && (
            <>
              {isEn
                ? 'Payment received, but your credits are taking longer to appear. Refresh in a minute — if they still don’t show, email support@kissinskin.net. '
                : '결제는 접수됐는데 크레딧 반영이 늦어지고 있어요. 1분 뒤 새로고침해 주세요. 그래도 안 보이면 support@kissinskin.net 으로 알려 주세요. '}
              <a href={CREDITS_PAGE} className="font-bold underline underline-offset-2">{isEn ? 'Check my credits' : '내 크레딧 확인'}</a>
            </>
          )}
        </span>
        {st.k !== 'checking' && (
          <button type="button" onClick={onClose} aria-label={isEn ? 'Close' : '닫기'} className="-mr-1 shrink-0 p-1 leading-none text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>
    </div>
  )
}
