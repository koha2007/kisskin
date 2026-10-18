// 홈 — 실제 사람 결과 (2026-10-18 대개편 2차)
// ────────────────────────────────────────────────────────────────────
// 히어로·9룩은 전부 AI 생성 모델이다. "진짜 사람한테도 되나?"에 답하는 자리가 없었다
// (10/17 성장 점검: AI 모델 → 실제 사람 결과로). Rhode "you + rhode"·Fenty "your Fenty face" 자리.
// 첫 사람은 운영자 본인(koha) — 사진은 운영자 셀카, 애프터는 그 셀카에 라이브 도구를 돌린 출력이다
// (public/home-ba-*.webp, 2026-07-04 f2f9412). 운영자 확인 10/18: "홈에 모자 쓴 사람이 나야".
// 2026-10-18 추가: 같은 운영자의 9룩 정면 사진 9장(public/real/koha-front-*, scripts/crop-real-person.mjs) 띠.
//   히어로 9룩은 AI 모델이라 "실제 사람 × 여러 룩"을 보여 주는 유일한 자리.
// ⚠ 다른 사람 사진을 여기 올릴 땐 반드시 본인 동의 + 18세 이상 + 축소본만(10/17 성장 점검 안전 조건).
import BeforeAfterSlider from '../makeup/BeforeAfterSlider'
import { trackEvent } from '../../lib/analytics'
import { MAKEUP_STYLES } from '../../lib/makeup/styles'

const REAL_LOOKS = ['natural-glow', 'cloud-skin', 'blood-lip', 'maximalist-eye', 'metallic-eye', 'bold-lip', 'blush-draping', 'grunge', 'kpop-idol'] as const

export default function RealPersonSection({ isEn }: { isEn: boolean }) {
  return (
    <section className="relative overflow-hidden bg-navy text-white" aria-labelledby="real-title">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(at 15% 20%, rgba(235, 71, 99, 0.18) 0px, transparent 45%)' }}
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 md:pt-24 md:pb-16 grid md:grid-cols-[auto_1fr] gap-10 md:gap-16 items-center">
        <figure className="mx-auto w-full max-w-[280px] md:max-w-[340px]">
          <BeforeAfterSlider beforeSrc="/home-ba-before.webp" afterSrc="/home-ba-after.webp" isEn={isEn} />
          <figcaption className="mt-3 text-center text-[11px] leading-relaxed text-white/55 break-keep">
            {isEn
              ? 'Real selfie of koha, who runs kissinskin. The after is an AI image made by the kissinskin tool from that selfie.'
              : 'kissinskin 운영자 koha의 실제 셀카예요. 애프터는 그 셀카로 kissinskin 도구가 만든 AI 이미지예요.'}
          </figcaption>
        </figure>

        <div className="text-center md:text-left">
          <p className="text-[11px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary-on-dark">
            {isEn ? 'Real person · not a model' : '실제 사람 · 모델 아님'}
          </p>
          <h2 id="real-title" className="mt-4 text-[2.1rem] sm:text-[2.6rem] md:text-[3.4rem] font-extrabold leading-[1.08] tracking-[-0.035em] break-keep">
            {isEn ? <>The maker tried it<br />on his own face first.</> : <>만든 사람이 먼저<br />자기 얼굴로 해 봤어요.</>}
          </h2>
          <p className="mt-5 max-w-lg mx-auto md:mx-0 text-[15px] md:text-lg text-white/75 leading-relaxed break-keep">
            {isEn
              ? 'Same face, same light, same hat — only the makeup changes. That’s what you get with your own selfie: you, not someone else.'
              : '얼굴·빛·모자까지 그대로, 메이크업만 바뀌어요. 내 셀카로 해도 똑같아요 — 다른 사람이 아니라 나.'}
          </p>
          <ul className="mt-6 flex flex-wrap justify-center md:justify-start gap-2 text-xs font-bold">
            {(isEn ? ['Face shape kept', 'Men welcome', 'Photo deleted right away'] : ['얼굴형 그대로', '남성도 OK', '사진 바로 삭제']).map((x) => (
              <li key={x} className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-white/85">
                <span className="material-symbols-outlined text-[15px] text-primary-on-dark" aria-hidden="true" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {x}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
            <a
              href="/analysis/"
              onClick={() => trackEvent('select_promotion', { creative_slot: 'home_real_person' })}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-white text-navy h-14 px-8 text-base font-extrabold hover:bg-slate-100 transition-colors"
            >
              {isEn ? 'Now try it on mine' : '나도 내 얼굴로 해 보기'}
              <span className="material-symbols-outlined text-xl" aria-hidden="true">arrow_forward</span>
            </a>
            <a href={isEn ? '/en/about/' : '/about/'} className="text-sm font-semibold text-white/70 underline underline-offset-4 hover:text-white">
              {isEn ? 'Who is koha?' : '운영자 koha 소개'}
            </a>
          </div>
        </div>
      </div>

      {/* 같은 사람 × 8룩 — 셀카 한 장으로 받은 9룩 컬렉션 낱장 */}
      <div className="relative max-w-6xl mx-auto pb-16 md:pb-24">
        <p className="px-4 sm:px-6 lg:px-8 text-sm md:text-base font-extrabold text-white">
          {isEn ? 'Same person, one selfie — all 9 looks' : '같은 사람, 셀카 한 장으로 — 9룩 전부'}
        </p>
        <ul className="mt-4 flex gap-3 overflow-x-auto snap-x snap-mandatory px-4 sm:px-6 lg:px-8 scroll-px-4 sm:scroll-px-6 lg:scroll-px-8 pb-2 [scrollbar-width:thin]">
          {REAL_LOOKS.map((id) => {
            const st = MAKEUP_STYLES.find((x) => x.id === id)
            const name = isEn ? st?.subEn : st?.nameKo
            return (
              <li key={id} className="snap-start shrink-0 w-[38vw] max-w-[170px] md:w-[150px]">
                <a href={`/analysis/?style=${id}`} onClick={() => trackEvent('select_promotion', { creative_slot: 'home_real_look', promotion_id: id })} className="group block">
                  <span className="block aspect-[4/5] overflow-hidden rounded-lg ring-1 ring-white/15 group-hover:ring-white/60 transition">
                    <img src={`/real/koha-front-${id}.webp`} alt={isEn ? `koha with ${name} makeup — AI result from his selfie` : `운영자 koha의 ${name} — 셀카로 만든 AI 결과`} loading="lazy" decoding="async" width={320} height={400} className="h-full w-full object-cover" />
                  </span>
                  <span className="mt-2 block truncate text-xs font-bold text-white/80 group-hover:text-white">{name}</span>
                </a>
              </li>
            )
          })}
        </ul>
        <p className="mt-2 px-4 sm:px-6 lg:px-8 text-[11px] text-white/45 break-keep">
          {isEn
            ? 'Looks kissinskin made from one selfie of koha (AI-generated). Tap a look to try it on yours.'
            : 'koha의 셀카 한 장으로 kissinskin이 만든 9룩이에요(AI 생성 이미지). 룩을 누르면 내 얼굴로 해 볼 수 있어요.'}
        </p>
      </div>
    </section>
  )
}
