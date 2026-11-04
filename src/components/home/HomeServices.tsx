// 홈 본문 — 2026-11-02 개편 (SNOW 서비스 페이지 벤치마크)
// ─────────────────────────────────────────────────────────────────
// 운영자: 슬라이드 대신 아이콘, 맨 위 좌우에 두 메이크업, 그 아래 사용법 영상,
//         유료(무료 2장 → 크레딧 순)와 무료(줄로 묶음)를 섞이지 않게.
// 색은 로고의 핑크·네이비. 핑크 위 글자는 네이비(흰 글자는 대비 3.37:1 로 미달).
// GA4 select_promotion creative_slot: home_hero_primary / home_hero_lucky(두 문 비교 유지) ·
//   home_plan(promotion_id=free|starter|collection|plus) · home_tile(promotion_id=도구 경로)
import { LOOK_HERO } from '../../lib/makeup/lookImages'
import { luckyLookImg } from '../../lib/fortune/looks'
import { TOOL_CARD_IMAGES } from '../../lib/toolCardImages'
import { trackEvent } from '../../lib/analytics'
import CollectionDemo from './CollectionDemo'
import HomeWeeklyLook from './HomeWeeklyLook'

const PINK = '#ef4da0'
const NAVY = '#070953'
// 흰 바탕 위 작은 글자용 핑크. 로고 핑크(#ef4da0)는 흰 바탕에서 3.37:1 이라 13px 글자에 미달 → 4.75:1 로 진하게.
const PINK_TEXT = '#d6247f'

interface Tile { ko: string; en: string; koDesc: string; enDesc: string; img: string; path: string; pos?: string; shared?: boolean }

const KNOW: Tile[] = [
  { ko: '오늘의 운세', en: 'Today’s Fortune', koDesc: '생년월일로 10초', enDesc: 'Birth date, 10 seconds', img: luckyLookImg('travel'), path: '/tools/today-fortune/', pos: '50% 20%' },
  { ko: '퍼스널컬러', en: 'Personal Color', koDesc: '6문항, 내 계절 찾기', enDesc: '6 questions, your season', img: TOOL_CARD_IMAGES.personalColor, path: '/tools/personal-color/' },
  { ko: '얼굴형', en: 'Face Shape', koDesc: '6문항, 컨투어·헤어', enDesc: '6 questions, contour & hair', img: TOOL_CARD_IMAGES.faceShape, path: '/tools/face-shape/' },
  { ko: '메이크업 MBTI', en: 'Makeup MBTI', koDesc: '8문항, 16가지 성향', enDesc: '8 questions, 16 types', img: TOOL_CARD_IMAGES.mbti, path: '/tools/makeup-mbti/' },
  { ko: '향수 찾기', en: 'Perfume Finder', koDesc: '5문항, 6가지 향', enDesc: '5 questions, 6 scents', img: TOOL_CARD_IMAGES.perfume, path: '/tools/perfume-type/' },
  { ko: '내 맞춤 루틴', en: 'My Routine', koDesc: '진단 4개를 하나로', enDesc: '4 quizzes in one', img: '/dna/feature.webp', path: '/tools/beauty-dna/' },
]
const LEARN: Tile[] = [
  { ko: '룩 따라 하기', en: 'Look How-Tos', koDesc: '페이스 차트 4단계', enDesc: 'Face charts, 4 steps', img: '/looks/charts/autumn-berry.webp', path: '/looks/', pos: '50% 42%' },
  { ko: '메이크업 클래스', en: 'Makeup Class', koDesc: '매주 새 강의', enDesc: 'New lessons weekly', img: '/looks/charts/winter-frost.webp', path: '/class/', pos: '50% 42%' },
  { ko: '가이드', en: 'Guides', koDesc: '깊이 읽는 메이크업 글', enDesc: 'In-depth makeup reads', img: TOOL_CARD_IMAGES.guide, path: '/guides/' },
  { ko: '신제품', en: 'New Products', koDesc: '매주 새로 나온 제품', enDesc: 'New launches weekly', img: '/products/clio-pro-eye-palette-air.webp', path: '/products/' },
  { ko: 'K-뷰티 뉴스', en: 'K-Beauty News', koDesc: '글로벌 트렌드 소식', enDesc: 'Global trend news', img: '/news/cooling-blush-2026-cheek-trend.webp', path: '/news/' },
  { ko: '제품 리뷰', en: 'Product Reviews', koDesc: '사기 전에 읽어 보기', enDesc: 'Read before you buy', img: '/mood/tool-guide.webp', path: '/reviews/', pos: '20% 50%' },
]

export default function HomeServices({ isEn }: { isEn: boolean }) {
  const prefix = isEn ? '/en' : ''

  const doors = [
    { name: isEn ? '9 Makeup Looks' : '9가지 메이크업', desc: isEn ? 'One selfie, nine of you' : '셀카 한 장, 아홉 명의 나', img: LOOK_HERO['autumn-berry'].after, href: `${prefix}/makeup/`, slot: 'home_hero_primary', alt: isEn ? 'Autumn Berry Mocha look on an AI-generated model' : '가을 베리 모카 룩, AI 생성 모델' },
    { name: isEn ? 'Lucky Makeup' : '럭키 메이크업', desc: isEn ? 'Makeup to call in every kind of luck' : '모든 운을 부르는 메이크업', img: luckyLookImg('wealth'), href: `${prefix}/lucky-makeup/`, slot: 'home_hero_lucky', alt: isEn ? 'Wealth Luck look on an AI-generated model' : '재물운 룩, AI 생성 모델' },
  ]
  const plans = [
    { id: 'free', icon: '1+1', small: true, bg: NAVY, fg: '#ffffff', name: isEn ? '2 free looks when you sign up' : '가입하면 2장 무료', desc: isEn ? '1 makeup look + 1 lucky look · no card' : '9가지 메이크업 1장 + 럭키 1장 · 카드 없음', price: isEn ? 'Free' : '무료', href: '/auth/?next=%2Fanalysis%2F' },
    { id: 'starter', icon: '5', bg: NAVY, fg: '#ffffff', name: isEn ? '5 credits' : '크레딧 5개', desc: isEn ? '5 looks · about $0.60 each' : '5장 · 장당 약 $0.60', price: '$2.99', href: `${prefix}/makeup/#price` },
    { id: 'collection', icon: '9', bg: PINK, fg: NAVY, name: isEn ? '9 credits · All 9 at once' : '크레딧 9개 · 9룩 한 번에', desc: isEn ? '9 looks from one selfie + 1 grid image' : '같은 셀카로 9장 + 모아보기 1장', price: '$4.99', href: '/analysis/?collection=new' },
    { id: 'plus', icon: '15', bg: NAVY, fg: '#ffffff', name: isEn ? '15 credits' : '크레딧 15개', desc: isEn ? '15 looks · about $0.47 each' : '15장 · 장당 약 $0.47', price: '$6.99', href: `${prefix}/makeup/#price` },
  ]
  const groups = [
    { title: isEn ? 'Get to know yourself' : '나를 알아보기', items: KNOW },
    { title: isEn ? 'Learn and choose' : '배우고 고르기', items: LEARN },
  ]

  return (
    <>
      <section className="text-navy" style={{ background: PINK }}>
        <div className="mx-auto flex min-h-[60px] max-w-[1120px] items-center px-5 py-1.5 md:min-h-[96px] md:px-4">
          <h1 className="whitespace-nowrap text-[clamp(24px,8.2vw,30px)] font-light leading-tight tracking-[-0.03em] md:text-[56px]">
            {isEn ? 'See it on your face first.' : '바르기 전에, 내 얼굴로 먼저.'}
          </h1>
        </div>
      </section>

      <section aria-label={isEn ? 'Start makeup' : '메이크업 시작하기'} className="mx-auto grid max-w-[1120px] grid-cols-2 gap-3.5 px-5 py-6 md:gap-10 md:px-4 md:py-11">
        {doors.map((d) => (
          <a key={d.slot} href={d.href} onClick={() => trackEvent('select_promotion', { creative_slot: d.slot })} className="flex min-w-0 flex-col gap-2.5 text-navy md:flex-row md:gap-6">
            <img src={d.img} alt={d.alt} width={400} height={400} decoding="async" className="aspect-square w-full shrink-0 rounded-[34px] object-cover object-[50%_22%] md:w-[230px] md:rounded-[46px]" />
            <span className="flex min-w-0 flex-col gap-1.5">
              <span className="text-[19px] font-extrabold leading-tight tracking-[-0.04em] md:text-[32px]">{d.name}</span>
              <span className="text-[13px] font-semibold leading-normal md:text-[15px]" style={{ color: PINK_TEXT }}>{d.desc}</span>
              <span className="mt-0.5 flex min-h-[44px] w-fit items-center rounded-full border border-navy px-4 text-[13px] font-extrabold">{isEn ? 'Start →' : '시작하기 →'}</span>
            </span>
          </a>
        ))}
      </section>

      <CollectionDemo isEn={isEn} />

      <section id="paid" aria-labelledby="home-paid" className="mx-auto max-w-[1120px] scroll-mt-16 px-5 pb-2 pt-8 text-navy md:px-4 md:pt-12">
        <span className="inline-block rounded-full px-3 py-0.5 text-[13px] font-extrabold" style={{ background: PINK }}>{isEn ? 'Paid · AI makeup' : '유료 · AI 메이크업'}</span>
        <h2 id="home-paid" className="mb-1 mt-1.5 text-[25px] font-extrabold leading-tight tracking-[-0.04em] md:text-[34px] break-keep">{isEn ? 'First 2 free, then credits' : '처음 2장은 무료, 그다음은 크레딧'}</h2>
        <p className="mb-2 text-sm leading-normal break-keep">{isEn ? '1 credit = 1 photo, for both makeup types. Tax may be added at checkout.' : '크레딧 1개 = 사진 1장. 두 메이크업에 똑같이 써요. 결제창에서 세금이 더해질 수 있어요.'}</p>
        <div className="grid gap-x-10 md:grid-cols-2">
          {plans.map((p) => (
            <a key={p.id} href={p.href} onClick={() => trackEvent('select_promotion', { creative_slot: 'home_plan', promotion_id: p.id })} className="grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-3.5 border-b border-navy py-4 text-navy md:grid-cols-[88px_minmax(0,1fr)_auto]">
              <span className={`flex aspect-square w-full items-center justify-center rounded-[18px] font-extrabold tracking-[-0.05em] md:rounded-[21px] ${p.small ? 'text-2xl' : 'text-[34px]'}`} style={{ background: p.bg, color: p.fg }}>{p.icon}</span>
              <span className="flex min-w-0 flex-col gap-0.5">
                <strong className="text-[17px] font-extrabold leading-tight tracking-[-0.03em] break-keep">{p.name}</strong>
                <span className="text-[13px] leading-snug break-keep">{p.desc}</span>
              </span>
              <strong className="text-lg font-extrabold">{p.price}</strong>
            </a>
          ))}
        </div>
      </section>

      <HomeWeeklyLook isEn={isEn} />

      <section id="free" aria-labelledby="home-free" className="mx-auto max-w-[1120px] scroll-mt-16 px-5 py-8 text-navy md:px-4 md:py-12">
        <span className="inline-block rounded-full bg-navy px-3 py-0.5 text-[13px] font-extrabold text-white">{isEn ? 'Free · No payment' : '무료 · 결제 없음'}</span>
        <h2 id="home-free" className="mb-3.5 mt-1.5 text-[25px] font-extrabold leading-tight tracking-[-0.04em] md:text-[34px]">{isEn ? 'Try everything free' : '무료로 다 써 보세요'}</h2>
        <div className="flex flex-col gap-6">
          {groups.map((g) => (
            <div key={g.title}>
              <h3 className="border-b-2 border-navy pb-2 text-base font-extrabold">{g.title}</h3>
              <div className="grid grid-cols-3 gap-x-2.5 md:gap-x-8">
                {g.items.map((it) => (
                  <a key={it.path} href={`${prefix}${it.path}`} onClick={() => trackEvent('select_promotion', { creative_slot: 'home_tile', promotion_id: it.path })} className="flex min-w-0 flex-col items-center gap-1.5 pb-1 pt-3 text-center text-navy md:flex-row md:gap-3.5 md:border-b md:border-navy md:py-3 md:text-left">
                    <img src={it.img} alt="" width={88} height={88} loading="lazy" decoding="async" className="h-[88px] w-[88px] shrink-0 rounded-[21px] object-cover" style={{ objectPosition: it.pos ?? '50% 50%' }} />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <strong className="text-sm font-extrabold leading-tight tracking-[-0.03em] md:text-base break-keep">{isEn ? it.en : it.ko}</strong>
                      <span className="text-xs leading-snug md:text-[13px] break-keep">{isEn ? it.enDesc : it.koDesc}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
