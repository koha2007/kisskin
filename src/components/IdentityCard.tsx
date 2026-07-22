// IdentityCard — shared 9:16 result card used by all 4 free tools (FINAL §3-4).
// On screen: a scaled-down DOM preview (mirrors the canvas layout).
// "이미지로 저장": renders the real 1080×1920 PNG via the pure-canvas renderer
// in src/lib/cardToPng.ts (decision ①) and downloads it.

import { useState } from 'react'
import type { IdentityCardData } from '../lib/identityCard/types'
import { downloadIdentityCard } from '../lib/cardToPng'

interface Props {
  /** 진단명 라벨 — e.g. "향수 타입" */
  label: string
  emoji: string
  card: IdentityCardData
  /** PNG 파일명 슬러그 — e.g. "perfume-floral" */
  fileSlug: string
  saveLabel?: string
  /** 카드 바로 옆 공유 버튼. 넘기지 않으면 버튼이 뜨지 않는다. */
  share?: { url: string; text: string; title: string }
  shareLabel?: string
}

export default function IdentityCard({ label, emoji, card, fileSlug, saveLabel, share, shareLabel }: Props) {
  const [saving, setSaving] = useState(false)
  const [shared, setShared] = useState(false)
  const [from, to] = card.gradient

  // 2026-07-22: GA4 30일 기준 makeup_save 4명 / makeup_share 3명.
  // 기능이 없어서가 아니라 **공유 UI가 페이지 한참 아래(ShareBar)에만 있어서** 도달을 못 했다.
  // Colorwise 는 결과가 뜨는 순간 저장/공유를 나란히 1급으로 놓는다. 그 자리를 여기로 올린다.
  const onShare = async () => {
    if (!share) return
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> }
    try {
      if (nav.share) {
        await nav.share({ title: share.title, text: share.text, url: share.url })
        return
      }
      await navigator.clipboard.writeText(`${share.text}${share.url}`)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    } catch {
      /* 사용자가 공유 시트를 닫은 경우 — 조용히 통과 */
    }
  }

  const onSave = async () => {
    if (saving) return
    setSaving(true)
    try {
      await downloadIdentityCard({ label, emoji, card }, `kissinskin-${fileSlug}.png`)
    } catch (e) {
      console.error('card save failed', e)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* 9:16 미리보기 — 실제 PNG와 동일 레이아웃의 축소판 */}
      <div
        className="w-full max-w-[300px] rounded-3xl shadow-2xl overflow-hidden text-white"
        style={{ aspectRatio: '9 / 16', background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)` }}
      >
        <div className="h-full w-full flex flex-col items-center justify-between px-6 py-8 text-center">
          <p className="text-[11px] font-semibold tracking-[0.3em] text-white/80 uppercase">{label}</p>

          <div className="flex flex-col items-center gap-3 -mt-2">
            <div className="text-[88px] leading-none drop-shadow-lg">{emoji}</div>
            <h3 className="text-3xl font-extrabold leading-tight px-1">{card.nickname}</h3>
            <p className="text-[11px] font-semibold tracking-[0.2em] text-white/75">
              {card.enName.toUpperCase()}
            </p>
            <p className="text-sm font-medium text-white/95 leading-snug px-1">“{card.identityLine}”</p>
          </div>

          <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex flex-wrap justify-center gap-1.5">
              {card.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold bg-white/16 rounded-full px-2.5 py-1 whitespace-nowrap"
                >
                  {tag}
                </span>
              ))}
            </div>
            <p className="text-[11px] font-bold tracking-wider text-white/90">kissinskin.net</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        // 카드 내부 타이포는 건드리지 않는다 — 이 미리보기는 src/lib/cardToPng.ts 의
        // 1080×1920 캔버스 렌더러와 레이아웃이 1:1로 맞춰져 있어서, 여기만 바꾸면
        // 화면과 저장되는 PNG가 어긋난다. 버튼(카드 밖)만 새 언어로 맞춘다.
        className="inline-flex items-center gap-2 bg-navy hover:bg-navy-mid transition-colors text-white px-7 py-3.5 font-bold t-body disabled:opacity-60"
      >
        <span className="material-symbols-outlined">{saving ? 'hourglass_top' : 'download'}</span>
        {saving ? '저장 중…' : (saveLabel ?? '이미지로 저장')}
      </button>

        {share && (
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-2 border border-navy/25 hover:border-navy transition-colors text-navy px-7 py-3.5 font-bold t-body"
          >
            <span className="material-symbols-outlined">{shared ? 'check' : 'share'}</span>
            {shared ? (shareLabel === 'Share' ? 'Copied' : '복사됨') : (shareLabel ?? '공유하기')}
          </button>
        )}
      </div>
    </div>
  )
}
