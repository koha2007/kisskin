// /mypage/credits/ — 내 크레딧: 지금 몇 개 · 언제 몇 개 충전·사용했는지(2026-11-09)
// 운영자: "결제하고 충전하면 몇 개 충전됐는지, 내 크레딧이 몇 개인지 파악할 수 있는 페이지가 있으면 좋겠다"
// 읽기 전용 — 잔액(get_credit_balance RPC)·장부(credit_transactions, RLS 본인 것만). 쓰기는 서버만.
// 결제 복귀 토스트(ChargeReceiptToast)의 "내역 보기"와 마이페이지 크레딧 카드가 여기로 온다.
import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/I18nContext'
import { useAuth } from '../hooks/useAuth'
import { getCreditBalance, getCreditHistory, creditTxLabel, type CreditTransaction } from '../lib/credits'
import { getFreeStatus, type FreeStatus } from '../lib/freeStatus'

// MyPage 와 같은 팔레트(인라인 스타일 페이지)
const C = {
  cream: '#f8f6f6',
  surface: '#ffffff',
  navy: '#070953',
  muted: '#6b6f8c',
  line: 'rgba(7, 9, 83, 0.16)',
  primary: '#ef4da0',
  sage: '#2f6b3f',
} as const
const RAD = '4px'
const LIMIT = 100

const card: React.CSSProperties = {
  background: C.surface, borderRadius: RAD, padding: 'clamp(16px, 4vw, 24px)',
  width: '100%', maxWidth: '440px', border: `1px solid ${C.line}`, marginBottom: '16px', boxSizing: 'border-box',
}
const h2: React.CSSProperties = { fontSize: '15px', fontWeight: 700, color: C.navy, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: '8px' }
const btn = (primary: boolean): React.CSSProperties => ({
  flex: 1, minWidth: '140px', padding: '12px 14px', borderRadius: RAD, fontSize: '14px', fontWeight: 700, textDecoration: 'none',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
  background: primary ? C.primary : '#fff', color: primary ? '#fff' : C.navy, border: primary ? 'none' : `1px solid ${C.line}`,
})

export default function CreditsPage() {
  const { locale } = useI18n()
  const isKo = locale === 'ko'
  const { user, loading } = useAuth()
  const [balance, setBalance] = useState<number | null>(null)
  const [rows, setRows] = useState<CreditTransaction[] | null>(null)
  const [free, setFree] = useState<FreeStatus | null>(null)

  useEffect(() => {
    if (!loading && !user) window.location.replace('/auth?next=' + encodeURIComponent('/mypage/credits/'))
  }, [loading, user])

  useEffect(() => {
    if (!user?.id) return
    let off = false
    getCreditBalance().then((n) => { if (!off) setBalance(n) }).catch(() => { if (!off) setBalance(0) })
    getCreditHistory(LIMIT).then((r) => { if (!off) setRows(r) })
    getFreeStatus().then((s) => { if (!off) setFree(s) })
    return () => { off = true }
  }, [user?.id])

  const charged = (rows ?? []).filter((r) => r.type === 'charge').reduce((s, r) => s + r.amount, 0)
  const used = (rows ?? []).filter((r) => r.type === 'deduct').reduce((s, r) => s + r.amount, 0)
  const fmt = (iso: string) => new Date(iso).toLocaleString(isKo ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  const freeLeft = free ? free.makeup.left + free.lucky.left : 0

  return (
    <div style={{ minHeight: '100dvh', background: C.cream, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 16px' }}>
      <div style={{ width: '100%', maxWidth: '440px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <a href="/mypage/" aria-label={isKo ? '마이페이지로' : 'Back to My Page'} style={{ color: C.navy, padding: '4px', display: 'flex' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
        </a>
        <h1 className="t-h2" style={{ color: C.navy, margin: 0 }}>{isKo ? '내 크레딧' : 'My Credits'}</h1>
      </div>

      {/* 지금 잔액 */}
      <div style={card}>
        <p style={{ fontSize: '12px', fontWeight: 700, color: C.muted, margin: 0, letterSpacing: '0.04em' }}>{isKo ? '지금 보유' : 'Current balance'}</p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '6px 0 4px' }}>
          <span style={{ fontSize: '48px', fontWeight: 800, color: C.primary, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{balance === null ? '…' : balance}</span>
          <span style={{ fontSize: '15px', color: C.navy, fontWeight: 700 }}>{isKo ? '개' : balance === 1 ? 'credit' : 'credits'}</span>
        </div>
        <p style={{ fontSize: '13px', color: C.muted, margin: '0 0 4px', lineHeight: 1.5 }}>
          {isKo ? '크레딧 1개 = AI 메이크업 1장(2026 메이크업·럭키 메이크업 공통)' : '1 credit = 1 AI makeup look (2026 looks & lucky makeup)'}
        </p>
        {free && freeLeft > 0 && (
          <p style={{ fontSize: '13px', color: C.navy, fontWeight: 600, margin: '0 0 4px', lineHeight: 1.5 }}>
            {isKo
              ? `+ 가입 무료권 ${freeLeft}장 남음 (2026 메이크업 ${free.makeup.left} · 럭키 ${free.lucky.left}) — 크레딧과 따로예요`
              : `+ ${freeLeft} free sign-up pass${freeLeft === 1 ? '' : 'es'} left (2026 looks ${free.makeup.left} · lucky ${free.lucky.left}) — separate from credits`}
          </p>
        )}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px' }}>
          <a href="/makeup/" style={btn(true)}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_awesome</span>
            {isKo ? 'AI 메이크업 만들기' : 'Make a look'}
          </a>
          <a href="/analysis/?topup=1" style={btn(false)}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_circle</span>
            {isKo ? '크레딧 충전' : 'Top up'}
          </a>
        </div>
      </div>

      {/* 충전·사용 내역 */}
      <div style={card}>
        <h2 style={h2}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>receipt_long</span>
          {isKo ? '충전·사용 내역' : 'Top-ups & usage'}
        </h2>
        {rows && rows.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            {[
              { k: isKo ? '총 충전' : 'Added', v: `+${charged}`, c: C.sage },
              { k: isKo ? '총 사용' : 'Used', v: `−${used}`, c: C.navy },
            ].map((x) => (
              <div key={x.k} style={{ flex: 1, background: C.cream, borderRadius: RAD, padding: '10px 12px' }}>
                <p style={{ margin: 0, fontSize: '12px', color: C.muted }}>{x.k}</p>
                <p style={{ margin: '2px 0 0', fontSize: '20px', fontWeight: 800, color: x.c, fontVariantNumeric: 'tabular-nums' }}>{x.v}</p>
              </div>
            ))}
          </div>
        )}
        {rows === null ? (
          <p style={{ fontSize: '13px', color: C.muted, margin: 0 }}>{isKo ? '불러오는 중…' : 'Loading…'}</p>
        ) : rows.length === 0 ? (
          <p style={{ fontSize: '13px', color: C.muted, margin: 0, lineHeight: 1.6 }}>
            {isKo ? '아직 충전·사용 내역이 없어요.' : 'No top-ups or usage yet.'}
          </p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {rows.map((r) => {
              const plus = r.type === 'charge'
              return (
                <li key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderTop: `1px solid ${C.line}` }}>
                  <span className="material-symbols-outlined" aria-hidden style={{ fontSize: '20px', color: plus ? C.sage : C.muted }}>
                    {plus ? 'add_circle' : 'remove_circle'}
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: C.navy }}>{creditTxLabel(r, isKo)}</span>
                    <span style={{ display: 'block', fontSize: '12px', color: C.muted, marginTop: '2px' }}>{fmt(r.created_at)}</span>
                  </span>
                  <span style={{ textAlign: 'right' }}>
                    <span style={{ display: 'block', fontSize: '16px', fontWeight: 800, color: plus ? C.sage : C.navy, fontVariantNumeric: 'tabular-nums' }}>
                      {plus ? `+${r.amount}` : `−${r.amount}`}
                    </span>
                    <span style={{ display: 'block', fontSize: '11px', color: C.muted, marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
                      {isKo ? `잔액 ${r.balance_after}` : `Balance ${r.balance_after}`}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        <p style={{ fontSize: '12px', color: C.muted, margin: '14px 0 0', lineHeight: 1.6 }}>
          {isKo
            ? `가입 무료권으로 만든 룩은 크레딧을 쓰지 않아 여기 나오지 않아요.${rows && rows.length >= LIMIT ? ` 최근 ${LIMIT}건까지 보여요.` : ''} 충전이 안 보이면 support@kissinskin.net 으로 알려 주세요.`
            : `Looks made with free passes don’t use credits, so they aren’t listed.${rows && rows.length >= LIMIT ? ` Showing the latest ${LIMIT}.` : ''} Missing a top-up? Email support@kissinskin.net.`}
        </p>
      </div>
    </div>
  )
}
