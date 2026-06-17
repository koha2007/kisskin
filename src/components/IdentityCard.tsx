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
}

export default function IdentityCard({ label, emoji, card, fileSlug, saveLabel }: Props) {
  const [saving, setSaving] = useState(false)
  const [from, to] = card.gradient

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

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="inline-flex items-center gap-2 bg-navy text-white px-7 py-3 rounded-full font-bold text-sm md:text-base shadow-lg disabled:opacity-60"
      >
        <span className="material-symbols-outlined">{saving ? 'hourglass_top' : 'download'}</span>
        {saving ? '저장 중…' : (saveLabel ?? '이미지로 저장')}
      </button>
    </div>
  )
}
