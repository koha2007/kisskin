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

/** 열린 상태의 문구 — 여는 문구가 영문이면 영문으로 닫는다. */
const closeLabel = (more?: string) => (more && /[A-Za-z]/.test(more) ? 'Show less' : '접기')

export default function ToolLongform({
  eyebrow,
  title,
  paragraphs,
  image,
  imageAlt = '',
  children,
  moreLabel,
}: {
  eyebrow: string
  title: string
  paragraphs: string[]
  /** 접힌 뒷부분을 여는 버튼 문구. 없으면 한국어 기본값. */
  moreLabel?: string
  /** 문단 사이에 끼워 넣을 무드 이미지 — 글 벽을 끊어 준다 */
  image?: string
  imageAlt?: string
  children?: ReactNode
}) {
  if (!paragraphs.length) return null

  // 두 번째 문단 뒤에 이미지를 끼운다. 문단이 2개 이하면 맨 뒤로 간다.
  const cut = paragraphs.length > 2 ? 2 : paragraphs.length
  const rest = paragraphs.slice(cut)

  return (
    <section className="bg-white py-14 md:py-20">
      <div className="mx-auto max-w-[46rem] px-5 sm:px-6">
        <p className="t-eyebrow text-primary-dark mb-3">{eyebrow}</p>
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

          {/* 뒷부분은 접어 둔다 (2026-09-22).
              이 글은 유형 페이지를 서로 구별해 주는 **유일한 고유 콘텐츠**라 지우면 안 된다
              (2026-07-14 에 색인 62건을 잃은 원인이 '내용이 서로 비슷함'이었다).
              그런데 모바일에서 이 섹션 하나가 2,114px — 화면 2.5개분을 먹어, 아래에 있는
              제품·구독·탐색을 전부 밀어냈다. 읽을 사람은 열고, 아닌 사람은 지나가게 한다.
              ⚠ `{open && …}` 조건부 렌더 금지 — 크롤러에 '내용 없음'이 된다. <details> 는
                DOM 에 그대로 있어 색인에 영향이 없다. */}
          {rest.length > 0 && (
            <details className="group border-t border-slate-200 pt-6">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-navy transition-colors hover:text-primary-dark [&::-webkit-details-marker]:hidden">
                <span className="material-symbols-outlined text-lg transition-transform group-open:rotate-180">
                  expand_more
                </span>
                <span className="group-open:hidden">{moreLabel ?? `이어서 읽기 (${rest.length})`}</span>
                <span className="hidden group-open:inline">{closeLabel(moreLabel)}</span>
              </summary>
              <div className="mt-6 flex flex-col gap-6">
                {rest.map((p, i) => (
                  <p key={`b-${i}`} className="t-body max-w-[68ch]">
                    {p}
                  </p>
                ))}
              </div>
            </details>
          )}
        </div>

        {children}
      </div>
    </section>
  )
}
