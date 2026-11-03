// 홈 "이번 주 추천 룩" — 페이스 차트 번호와 제품을 잇고, 신제품·뉴스를 한 칸에 묶는다.
// 내용은 src/lib/home/weeklyLook.ts 에서 바꾼다.
// GA4 select_promotion creative_slot: home_weekly_look
//   promotion_id = try | product:{slug} | new_product:{slug} | news:{slug} | all_products | all_news
import { WEEKLY_LOOK as W } from '../../lib/home/weeklyLook'
import { LOOK_HERO } from '../../lib/makeup/lookImages'
import { trackEvent } from '../../lib/analytics'

const PINK = '#ef4da0'

/** 차트 위 번호 위치(%) — 번호 중심과 선의 양 끝. 차트는 눈·볼·입술 자리가 고정이라 룩이 바뀌어도 같다. */
const PINS = [
  { x: 86.9, y: 47.4, lineFrom: 73.1, lineTo: 82.9 },
  { x: 9.1, y: 51.4, lineFrom: 13.1, lineTo: 28.6 },
  { x: 86.9, y: 69.3, lineFrom: 58.3, lineTo: 82.9 },
]

const track = (id: string) => () => trackEvent('select_promotion', { creative_slot: 'home_weekly_look', promotion_id: id })

function Num({ n }: { n: number }) {
  return <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy text-sm font-extrabold text-white md:h-8 md:w-8 md:text-[15px]">{n}</span>
}

export default function HomeWeeklyLook({ isEn }: { isEn: boolean }) {
  const prefix = isEn ? '/en' : ''
  const t = (x: { ko: string; en: string }) => (isEn ? x.en : x.ko)
  const label = `${isEn ? 'This week’s look' : '이번 주 추천 룩'} · ${t(W.week)}`
  const news = [
    { id: `new_product:${W.newProduct.slug}`, href: `${prefix}/products/${W.newProduct.slug}/`, tag: isEn ? 'New' : '신제품', dark: false, text: t(W.newProduct.name), go: isEn ? 'View →' : '보기 →' },
    { id: `news:${W.news.slug}`, href: `${prefix}/news/${W.news.slug}/`, tag: isEn ? 'News' : '뉴스', dark: true, text: t(W.news.title), go: isEn ? 'Read →' : '읽기 →' },
  ]

  return (
    <section id="weekly-look" aria-labelledby="home-weekly-look" className="mt-8 scroll-mt-16 text-navy md:mt-12">
      <div style={{ background: PINK }}>
        <div className="mx-auto flex max-w-[1120px] flex-col px-5 pb-3.5 pt-3 md:flex-row-reverse md:items-baseline md:justify-between md:px-4">
          <span className="text-[13px] font-extrabold md:text-[15px]">{label}</span>
          <h2 id="home-weekly-look" className="mt-0.5 text-[34px] font-light leading-[1.15] tracking-[-0.04em] md:mt-0 md:text-[56px]">{t(W.name)}</h2>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1120px] gap-[18px] px-5 pt-5 md:grid-cols-[460px_minmax(0,1fr)] md:items-start md:gap-14 md:px-4 md:pt-8">
        <div className="relative aspect-[5/6] overflow-hidden rounded-[34px] border border-navy md:rounded-[46px]">
          <img src={W.chart.src} alt={t(W.chart.alt)} width={1024} height={1536} loading="lazy" decoding="async" className="absolute left-0 top-[-3.8%] h-auto w-full max-w-none" />
          {PINS.map((p, i) => (
            <span key={i} aria-hidden="true">
              <span className="absolute border-t-2 border-navy" style={{ left: `${p.lineFrom}%`, width: `${p.lineTo - p.lineFrom}%`, top: `${p.y}%` }} />
              <span className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}><Num n={i + 1} /></span>
            </span>
          ))}
          <span className="absolute bottom-3 right-3 text-[11px] font-extrabold md:bottom-4 md:right-[18px] md:text-xs">{isEn ? 'AI illustration' : 'AI 일러스트'}</span>
        </div>

        <div className="flex min-w-0 flex-col gap-[18px]">
          <p className="text-[15px] leading-normal break-keep md:text-lg">{t(W.desc)}</p>

          <div className="border-t-2 border-navy">
            {W.products.map((p, i) => (
              <a key={p.slug} href={`${prefix}/products/${p.slug}/`} onClick={track(`product:${p.slug}`)} className="grid grid-cols-[28px_36px_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-navy py-3 text-navy md:grid-cols-[32px_40px_minmax(0,1fr)_auto] md:gap-3">
                <Num n={i + 1} />
                <span className="h-9 w-9 rounded-[10px] md:h-10 md:w-10" style={{ background: p.swatch }} />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <strong className="text-[15px] font-extrabold leading-snug break-keep md:text-base">{t(p.name)}</strong>
                  <span className="text-[13px] break-keep">{t(p.note)}</span>
                </span>
                <span className="whitespace-nowrap text-[13px] font-extrabold md:text-sm">{isEn ? 'Shop →' : '사러 가기 →'}</span>
              </a>
            ))}
          </div>

          <a href={`/analysis/?style=${W.styleId}`} onClick={track('try')} className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-3.5 rounded-3xl bg-navy py-2.5 pl-2.5 pr-[18px] text-white">
            <img src={LOOK_HERO[W.styleId].after} alt={isEn ? 'This look on an AI-generated model' : '이 룩을 입힌 AI 생성 모델'} width={76} height={76} loading="lazy" decoding="async" className="h-[76px] w-[76px] rounded-2xl object-cover object-[50%_25%]" />
            <span className="flex min-w-0 flex-col gap-0.5">
              <strong className="text-lg font-extrabold break-keep md:text-xl">{isEn ? 'Try it on your face →' : '내 얼굴에 입혀 보기 →'}</strong>
              <span className="text-xs break-keep">{isEn ? 'First look free when you sign up · photo is an AI-generated model' : '가입하면 첫 장 무료 · 사진은 AI 생성 모델'}</span>
            </span>
          </a>

          <div>
            <h3 className="mt-1 border-b-2 border-navy pb-2 text-base font-extrabold">{isEn ? 'New this week' : '이번 주 새 소식'}</h3>
            {news.map((n) => (
              <a key={n.id} href={n.href} onClick={track(n.id)} className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-2.5 border-b border-navy py-3 text-navy md:grid-cols-[60px_minmax(0,1fr)_auto] md:gap-3">
                <span className={`rounded-full py-0.5 text-center text-xs font-extrabold ${n.dark ? 'bg-navy text-white' : ''}`} style={n.dark ? undefined : { background: PINK }}>{n.tag}</span>
                <strong className="text-[15px] font-extrabold leading-snug break-keep">{n.text}</strong>
                <span className="whitespace-nowrap text-[13px] font-extrabold md:text-sm">{n.go}</span>
              </a>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <a href={`${prefix}/products/`} onClick={track('all_products')} className="flex min-h-[48px] items-center justify-center rounded-full border border-navy text-sm font-extrabold text-navy md:min-h-[44px] md:text-[13px]">{isEn ? 'All new products →' : '신제품 전체 →'}</a>
            <a href={`${prefix}/news/`} onClick={track('all_news')} className="flex min-h-[48px] items-center justify-center rounded-full border border-navy text-sm font-extrabold text-navy md:min-h-[44px] md:text-[13px]">{isEn ? 'All beauty news →' : '뷰티 뉴스 전체 →'}</a>
          </div>
        </div>
      </div>

      <p className="mx-auto mt-[18px] max-w-[1120px] px-5 text-xs leading-normal break-keep md:mt-5 md:px-4">
        {isEn
          ? 'This section links to pages with affiliate links; we may earn a commission on qualifying purchases.'
          : '이 포스팅은 쿠팡 파트너스 및 링크프라이스(클리오) 제휴마케팅이 포함된 광고로 일정액의 커미션을 지급 받습니다.'}
      </p>
    </section>
  )
}
