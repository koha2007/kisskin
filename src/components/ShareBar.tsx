import { useState } from 'react'

interface ShareBarProps {
  /** Canonical share URL (use window.location.href or a static fallback) */
  url: string
  /** Pre-formatted share text (used by X/Twitter and clipboard fallback) */
  shareText: string
  /** Title for native Web Share API */
  shareTitle: string
  /** Where the "다시 하기" button links to (the quiz hub for this tool) */
  retakeUrl?: string
  retakeLabel?: string
}

export default function ShareBar({
  url,
  shareText,
  shareTitle,
  retakeUrl,
  retakeLabel = '다시 하기',
}: ShareBarProps) {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked — silently ignore */
    }
  }

  const nativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url })
      } catch {
        /* user cancelled */
      }
    }
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

  const hasNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <section className="py-14 md:py-16 bg-cream">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy mb-2 tracking-tight leading-tight">
          결과 공유하기
        </h2>
        <p className="text-sm text-slate-500 mb-7">친구·가족과 진단 결과를 공유해보세요</p>

        {/* Share buttons row */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {/* 링크 복사 */}
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-slate-200 hover:border-primary hover:shadow-md text-navy-mid hover:text-primary text-sm font-semibold transition-all"
            aria-label="링크 복사"
          >
            <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'link'}</span>
            {copied ? '복사됨!' : '링크 복사'}
          </button>

          {/* 공유하기 (Web Share API — mobile native sheet) */}
          {hasNativeShare && (
            <button
              type="button"
              onClick={nativeShare}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white border border-slate-200 hover:border-primary hover:shadow-md text-navy-mid hover:text-primary text-sm font-semibold transition-all"
              aria-label="공유하기"
            >
              <span className="material-symbols-outlined text-[18px]">ios_share</span>
              공유하기
            </button>
          )}

          {/* X (Twitter) */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-black text-white hover:bg-zinc-800 hover:shadow-md text-sm font-semibold transition-all"
            aria-label="X(Twitter)에 공유"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#1877F2] text-white hover:bg-[#155bd0] hover:shadow-md text-sm font-semibold transition-all"
            aria-label="Facebook에 공유"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[15px] h-[15px]">
              <path d="M24 12.073C24 5.446 18.627.073 12 .073S0 5.446 0 12.073c0 5.99 4.388 10.954 10.125 11.854V15.54H7.078v-3.467h3.047V9.43c0-3.007 1.792-4.668 4.533-4.668 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.467h-2.796v8.387C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Facebook
          </a>
        </div>

        {/* Quick actions row */}
        <div className="flex flex-wrap justify-center gap-2.5 mt-8 pt-6 border-t border-slate-200/70">
          {retakeUrl && (
            <a
              href={retakeUrl}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-primary hover:bg-white transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">refresh</span>
              {retakeLabel}
            </a>
          )}
          <a
            href="/tools/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-primary hover:bg-white transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">apps</span>
            다른 테스트 해보기
          </a>
        </div>
      </div>
    </section>
  )
}
