// 유형별 롱폼 본문 — 도구 4종 결과 페이지 공용 (2026-07-22)
// ────────────────────────────────────────────────────────────────────
// 왜 만들었나:
// 각 유형을 다른 유형과 구별해 주는 **유일한 고유 콘텐츠**가 detailParagraphs 인데,
// 그동안 이게 마소니 그리드 안의 AccordionCard(접힘) 한 칸에 들어가 있었다. 즉
//   ① 시각적으로 정보 한 조각 취급 — 결과 페이지의 알맹이가 부스러기처럼 보였고
//   ② 열어야 보이니 사람도 잘 안 읽었다
// 그 결과 유형 페이지들이 서로 85% 유사해졌고, 구글이 62개를 "크롤링됨 – 색인 안 됨"
// 으로 버린 이력이 있다(2026-07-14).
//
// 16Personalities(45개 언어·10억 회 응시)는 같은 구조에서 결과를 **긴 단일 컬럼
// 아티클**로 낸다. 작은 카드를 흩뿌리지 않는다. 그 형식을 가져왔다.
// 마소니는 없애지 않고 '보조 무드보드'로 아래에 남긴다 — 색·제품 정보는 카드가 낫다.

import type { ReactNode } from 'react'

export default function ToolLongform({
  eyebrow,
  title,
  paragraphs,
  image,
  imageAlt = '',
  children,
}: {
  eyebrow: string
  title: string
  paragraphs: string[]
  /** 문단 사이에 끼워 넣을 무드 이미지 — 글 벽을 끊어 준다 */
  image?: string
  imageAlt?: string
  children?: ReactNode
}) {
  if (!paragraphs.length) return null

  // 두 번째 문단 뒤에 이미지를 끼운다. 문단이 2개 이하면 맨 뒤로 간다.
  const cut = paragraphs.length > 2 ? 2 : paragraphs.length

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[46rem] px-5 sm:px-6">
        <p className="t-eyebrow text-primary mb-3">{eyebrow}</p>
        <h2 className="t-h1 text-navy mb-8">{title}</h2>

        {/* 본문 폭을 68ch 안쪽으로 묶는다 — 한 줄이 길면 읽다 놓친다 */}
        <div className="flex flex-col gap-6 text-slate-700">
          {paragraphs.slice(0, cut).map((p, i) => (
            <p key={`a-${i}`} className="t-body max-w-[68ch]">
              {p}
            </p>
          ))}

          {image && (
            <figure className="my-2 overflow-hidden rounded-lg">
              <img
                src={image}
                alt={imageAlt}
                loading="lazy"
                decoding="async"
                className="block h-full w-full object-cover"
              />
            </figure>
          )}

          {paragraphs.slice(cut).map((p, i) => (
            <p key={`b-${i}`} className="t-body max-w-[68ch]">
              {p}
            </p>
          ))}
        </div>

        {children}
      </div>
    </section>
  )
}
