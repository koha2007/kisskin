import { FACE_SHAPE_TYPES, FACE_SHAPE_ORDER, type FaceShapeCode } from '../lib/face-shape/types'
import { FACE_SHAPE_MOOD } from '../lib/face-shape/moodImages'
import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { FS_RECOMMENDATIONS } from '../lib/recommendations/face-shape'
import { AFFILIATE_ENABLED } from '../lib/recommendations/types'
import RegionToggle from '../components/RegionToggle'
import { useRegion } from '../hooks/useRegion'
import ShareBar from '../components/ShareBar'
import IdentityCard from '../components/IdentityCard'
import { localizeCard } from '../lib/identityCard/types'
import RelatedTools from '../components/RelatedTools'
import DnaTracker from '../components/beauty-dna/DnaTracker'
import { SaveToAccount } from '../components/beauty-dna/SaveToAccount'
import ToolLongform from '../components/tools/ToolLongform'
import BentoGrid, {
  BentoFacts,
  BentoNote,
  BentoBanner,
  insertScattered,
  scatterSlot,
} from '../components/result-grid/BentoGrid'
import { ProductGridCard } from '../components/result-grid/ProductGridCard'
import { useI18n } from '../i18n/I18nContext'
import { TypePreviewCard } from '../components/tools/ToolLanding'
import { EmailSubscribe } from '../components/EmailSubscribe'
import { trackToolPromotion } from '../lib/analytics'
import { readableInk } from '../lib/a11y/readableInk'
import FaceShapeMix from '../components/face-shape/FaceShapeMix'
import FaceShapeMap from '../components/face-shape/FaceShapeMap'
import { styleById, type MakeupStyleId } from '../lib/makeup/styles'

interface Props { code: FaceShapeCode }

// 얼굴형 → 결과 화면에서 바로 입혀 볼 추천 룩(FaceShapeMap 의 블러셔·컨투어 방향과 맞춘다).
//   계란형=무엇이든 어울려 내추럴부터 · 둥근형=사선 드레이핑으로 길어 보이게 · 각진형=소프트 포커스로
//   각을 풀기 · 긴형=가로 블러셔 중심 아이돌 룩 · 하트형=시선을 아래로 내리는 볼드 립.
const FACE_SHAPE_LOOK: Record<FaceShapeCode, MakeupStyleId> = {
  oval: 'natural-glow',
  round: 'blush-draping',
  square: 'cloud-skin',
  oblong: 'kpop-idol',
  heart: 'bold-lip',
}

export default function FaceShapeResult({ code }: Props) {
  const t = FACE_SHAPE_TYPES[code]
  const mood = FACE_SHAPE_MOOD[code]
  const { t: i18n, locale } = useI18n()
  const [region] = useRegion()
  const isEn = locale === 'en'

  const name = isEn ? t.enName : t.koName
  const tagline = isEn && t.taglineEn ? t.taglineEn : t.tagline
  const features = isEn && t.featuresEn ? t.featuresEn : t.features
  const detailParagraphs = isEn && t.detailParagraphsEn ? t.detailParagraphsEn : t.detailParagraphs
  const LF_EYEBROW = isEn ? 'Face Shape · In depth' : '얼굴형 · 자세히'
  const contouring = isEn && t.contouringEn ? t.contouringEn : t.contouring
  const recommendedStyle = isEn && t.recommendedStyleEn ? t.recommendedStyleEn : t.recommendedStyle
  const avoidStyle = isEn && t.avoidStyleEn ? t.avoidStyleEn : t.avoidStyle
  const kissinskinReason = isEn && t.kissinskinReasonEn ? t.kissinskinReasonEn : t.kissinskin.reason
  const basePath = isEn ? '/en/tools/face-shape' : '/tools/face-shape'
  // AI 메이크업으로 가는 목적지. 히어로 CTA 와 아래 BentoBanner 가 같은 값을 써야
  // 해서 한 곳으로 뽑았다(예전엔 두 군데에 각각 박혀 있었다).
  // 2026-10-17: 얼굴형별 추천 룩을 미리 골라서 보낸다(?style=). 진단 147명 → 저장 4명 —
  // "아무 메이크업"보다 "내 얼굴형에 맞는 이 룩"이 눌러 볼 이유가 된다. EN 은 예전엔 홈(/en/)으로
  // 보내 한 단계를 더 걸었다 → 같은 /analysis/ 로, 클릭 때 언어를 en 으로 맞춰 둔다.
  const look = styleById(FACE_SHAPE_LOOK[t.code])
  // 버튼 한 줄에 들어가게 '블러쉬 드레이핑 & 레이어링' → '블러쉬 드레이핑'
  const lookName = (isEn ? look.subEn.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : look.nameKo).split(' & ')[0].replace(/ (메이크업|Makeup)$/, '')
  const makeupHref = `/analysis/?style=${look.id}`
  const keepLocale = () => { if (isEn) { try { localStorage.setItem('kisskin_locale', 'en') } catch { /* 없으면 브라우저 언어 */ } } }

  const accent = t.primaryColor

  // 카드 본문(닉네임·한 줄 문장·해시태그)을 로케일에 맞춰 한 번만 갈아끼운다.
  // 화면 미리보기와 저장되는 1080×1920 PNG 가 같은 객체를 읽으므로 자동으로 같이 맞는다.
  const card = localizeCard(t.card, isEn)

  // ④ 제품 카드는 얼굴형 코드 해시로 격자 안에 흩는다(결정적 분산).
  const recs = FS_RECOMMENDATIONS[t.code] ?? []

  const L = isEn
    ? {
        feature: 'Core feature', contour: 'Contouring', style: 'Styling', avoid: 'Style to avoid',
        look: 'Recommended look', more: 'Read the full analysis', allShapes: 'Browse all five shapes', me: 'You',
        retake: 'Retake', save: 'Save image', female: i18n('tools.common.female'), male: i18n('tools.common.male'),
        bannerTitle: 'See your look on your own face', bannerDesc: 'Try AI makeup on your selfie — your face stays exactly the same.',
        bannerCta: 'Try AI makeup',
        // 히어로 CTA. 문구는 제품과 정확히 일치시킬 것 — 룩은 9종이고(5종 아님),
        // 무료 1회도 **로그인을 지난다**(MakeupFlow 게이트). 없다고 해놓고 벽을
        // 세우면 그 자리에서 튕긴다(2026-07-31 정정).
        heroCta: `Try ${lookName} on my face`,
        heroCtaSub: `Picked for ${t.enName} faces. One selfie, first try free (quick sign-in).`,
        forehead: 'Forehead', cheekbone: 'Cheekbones', jawline: 'Jawline', highlighter: 'Highlight',
        brow: 'Brow', lip: 'Lip', blush: 'Blush', hair: 'Hair', glasses: 'Glasses',
      }
    : {
        feature: '핵심 특징', contour: '컨투어링', style: '스타일링', avoid: '피해야 할 스타일',
        look: '추천 룩', more: '더 알아보기 (상세 분석)', allShapes: '5가지 얼굴형 전체 보기', me: '나',
        retake: '다시 진단', save: '이미지 저장하기', female: i18n('tools.common.female'), male: i18n('tools.common.male'),
        bannerTitle: '이 룩, 내 얼굴에 직접', bannerDesc: 'AI로 어울리는 메이크업을 내 셀카에 입혀보세요. 얼굴은 그대로예요.',
        bannerCta: 'AI 메이크업 체험',
        heroCta: `'${lookName}' 내 얼굴로 보기`,
        heroCtaSub: `${t.koName}에 어울리는 룩 · 셀카 한 장 · 첫 1회 무료 (간편 로그인)`,
        forehead: '이마', cheekbone: '광대', jawline: '턱 라인', highlighter: '하이라이터',
        brow: '눈썹', lip: '립', blush: '블러쉬', hair: '헤어', glasses: '안경',
      }

  // ⑤ 벤토 타일 — 컨투어링 4장·스타일 5장이 전부 따로 회색 박스였다. 각각 한 타일에 접는다.
  // 무드 사진은 바로 위 롱폼이 이미 본문 안에서 크게 쓰고 있어 여기서 다시 쓰지 않는다.
  // 2026-09-22: `핵심 특징` 타일을 여기서 뺐다 — 같은 목록이 히어로로 올라갔다.
  const baseTiles = [
    <BentoFacts
      key="contour"
      title={L.contour}
      accent={accent}
      rows={[
        { label: L.forehead, text: contouring.forehead },
        { label: L.cheekbone, text: contouring.cheekbone },
        { label: L.jawline, text: contouring.jawline },
        { label: L.highlighter, text: contouring.highlighter },
      ]}
    />,
    <BentoFacts
      key="style"
      title={L.style}
      accent={accent}
      rows={[
        { label: L.brow, text: recommendedStyle.brow },
        { label: L.lip, text: recommendedStyle.lip },
        { label: L.blush, text: recommendedStyle.blush },
        { label: L.hair, text: recommendedStyle.hair },
        { label: L.glasses, text: recommendedStyle.glasses },
      ]}
    />,
    <BentoFacts
      key="look"
      title={L.look}
      accent={accent}
      rows={[
        { label: L.female, text: t.kissinskin.women },
        { label: L.male, text: t.kissinskin.men },
      ]}
    />,
    <BentoNote key="reason" icon="recommend" label={L.look} text={kissinskinReason} accent={accent} />,
    ...avoidStyle.map((a, i) => (
      <BentoNote key={`avoid-${i}`} icon="do_not_disturb_on" label={L.avoid} text={a} accent={accent} />
    )),
  ]

  const tiles = insertScattered(
    baseTiles,
    recs.map((item, i) => (
      <ProductGridCard
        key={`prod-${i}`}
        item={item}
        accent={accent}
        pageType="face_shape"
        pageSlug={t.code}
        span="sm"
        slot={scatterSlot(t.code, i, recs.length, baseTiles.length)}
      />
    )),
    t.code,
  )

  return (
    <div className="font-display bg-background-light min-h-screen">
      <ToolsNav />

      <main>
        {/* Hero — 2026-09-22 재설계. 메이크업 MBTI 에 먼저 적용한 구조를 4종 전체에 맞춘다.
            전: 이름·해시태그·9:16 카드·CTA 를 한 줄로 세로로 쌓아 모바일 세로를 크게 먹었고,
                데스크톱에선 넓은 화면 한가운데 좁은 기둥 하나만 섰다.
            후: 데스크톱은 **왼쪽 정보 + 근거 + CTA / 오른쪽 카드** 2단.
            ⚠ AI 메이크업 CTA 는 이 페이지의 핵심 장치라 위치를 그대로 지킨다(아래 주석 참조). */}
        <section className="relative pt-10 pb-8 md:pt-16 md:pb-12 overflow-hidden" style={{ background: `linear-gradient(135deg, ${t.primaryColor}10 0%, ${t.accentColor}18 100%)` }}>
          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center md:text-left md:grid md:grid-cols-[minmax(0,1fr)_300px] md:items-center md:gap-12">
            <div className="md:order-1">
              <p className="font-mono text-xs md:text-sm tracking-[0.3em] text-slate-500 mb-2">{t.enName.toUpperCase()}</p>
              <h1 className="font-serif text-4xl md:text-6xl font-semibold text-navy tracking-tight mb-3 leading-[1.02]">{name}</h1>
              <p className="text-base md:text-xl text-slate-700 max-w-xl mx-auto md:mx-0 leading-relaxed font-medium mb-5">{tagline}</p>
              {/* 2026-10-10: 한 줄 고정 — 글꼴이 늦게 오면 두 줄→한 줄로 바뀌며 아래가 밀렸다(CLS 0.11) */}
              <div className="flex flex-nowrap gap-2 justify-center md:justify-start mb-7 overflow-x-auto [scrollbar-width:none]">
                {card.hashtags.map(k => (
                  <span key={k} className="shrink-0 whitespace-nowrap px-3 py-1 bg-white/70 backdrop-blur-sm rounded-full text-xs font-bold text-slate-700 border" style={{ borderColor: `${t.primaryColor}40` }}>{k}</span>
                ))}
              </div>

              {/* 핵심 특징 — 벤토 첫 타일에 있던 걸 히어로로 끌어올렸다(2026-09-22).
                  이게 "왜 내 얼굴형이 이건가"의 유일한 근거인데 롱폼과 구독 폼을 지나
                  한참 내려가야 나왔다. 벤토의 흰 패널 대신 번호 + 본문만 쓴다. */}
              <ul className="mx-auto md:mx-0 max-w-sm space-y-2 text-left">
                {features.map((f, i) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="font-mono t-label mt-0.5 shrink-0" style={{ color: readableInk(accent) }}>{`0${i + 1}`}</span>
                    <span className="text-sm md:text-base text-slate-700 leading-snug">{f}</span>
                  </li>
                ))}
              </ul>

            {/* ⭐ 결과 → AI 메이크업 다리를 2026-08-15 에 여기로 올렸다.
                그전까지 이 자리 — 결과 카드 바로 아래, 페이지에서 가장 좋은 위치 —
                는 "다시 진단"이라는 **막다른 행동**이 차지했고, /analysis/ 로 가는
                유일한 문은 롱폼 본문 *아래* 벤토 그리드 안에 있었다.

                근거(GA4 7/19~8/15 + Clarity 3일치): `/tools/face-shape/` 는 활성
                사용자의 **34.78%** 로 사이트 최대 단일 유입구인데 **주요이벤트가
                0.00 (0%)** 이었다. 그런데 Clarity 세션들은 클릭 7~8회·페이지 3~4장으로
                퀴즈를 **끝까지 완주**한다. 즉 이탈이 아니라 완주 후 갈 곳이 없었던
                것이다. 평균 스크롤 깊이 47% 라 다리는 구조적으로 도달 불가였다.
                (같은 진단을 2026-07-31 에 이미 했고 그때는 데이터를 더 모으기로
                보류했다 — [[project_2026_07_31_clarity_audit]].)

                아래 BentoBanner 는 **그대로 뒀다**. 롱폼까지 읽고 내려온 사람에게는
                여전히 필요하고, 두 자리가 `creative_slot` 으로 갈려 찍히므로 어느
                위치가 실제로 먹히는지 다음 측정에서 바로 갈린다. */}
            <div className="mt-7">
              <a
                href={makeupHref}
                onClick={() => { keepLocale(); trackToolPromotion('face_shape', t.code, 'hero_primary') }}
                className="group inline-flex w-full sm:w-auto items-center justify-center gap-2.5 break-keep bg-primary hover:bg-primary-dark text-white px-8 py-4 font-bold text-base md:text-lg tracking-tight transition-colors shadow-lg shadow-primary/25"
              >
                <span className="material-symbols-outlined text-xl">auto_awesome</span>
                {L.heroCta}
                <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-0.5">arrow_forward</span>
              </a>
              <p className="mt-3 text-xs text-slate-500 leading-relaxed">{L.heroCtaSub}</p>

              {/* 다시 진단은 남기되 2차 행동으로 내렸다 — 지우면 오진단한 사람이
                  갈 곳이 없어진다. */}
              <a
                href={`${basePath}/`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-navy underline underline-offset-4 decoration-slate-300 transition-colors"
              >
                <span className="material-symbols-outlined text-base">refresh</span> {L.retake}
              </a>
            </div>
            </div>

            <div className="md:order-2 mt-8 md:mt-0">
            <IdentityCard
              label={isEn ? 'Face Shape' : '얼굴형'}
              emoji={t.emoji}
              illustration={mood.cardArt}
              card={card}
              fileSlug={`face-shape-${t.code}`}
              saveLabel={L.save}
              isEn={isEn}
              share={{
                url: `https://kissinskin.net${basePath}/${t.slug}/`,
                text: isEn
                  ? `My face shape is "${t.enName}" ${t.emoji}\n${t.taglineEn ?? t.tagline}\n\n`
                  : `나의 얼굴형은 "${t.koName}" ${t.emoji}\n${t.tagline}\n\n`,
                title: isEn ? `Face shape: ${t.enName}` : `얼굴형: ${t.koName}`,
              }}
              shareLabel={isEn ? 'Share' : '공유하기'}
            />
            </div>
          </div>
        </section>

        {/* 2026-10-10: 방금 진단한 사람에게만 — 가까운 정도(%) + 셀카 측정선 사진(이 기기 안에서만) */}
        <FaceShapeMix code={code} isEn={isEn} basePath={basePath} />
        {/* 2026-10-10: 얼굴형별 메이크업 지도(SVG 도식) + 클래스 11·23·25편 연결 */}
        <FaceShapeMap code={code} isEn={isEn} />

        {/* 이 얼굴형 + 추천 룩 비포/애프터 — 2026-10-17. 히어로 버튼("'룩' 내 얼굴로 보기")이 무엇을
            해 주는지 실제로 보여 준다. 같은 인물에 우리 AI 메이크업과 같은 프롬프트로 입혔다. */}
        {mood.lookImage && mood.image && (
          <section className="py-10 md:py-14 bg-background-light" aria-labelledby="fs-look-title">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
              <p className="t-label text-primary-dark mb-2">{isEn ? 'AI makeup preview' : 'AI 메이크업 미리보기'}</p>
              <h2 id="fs-look-title" className="t-h1 text-navy mb-6 break-keep">
                {isEn ? `${t.enName} + ${lookName}` : `${t.koName} + '${lookName}' 룩`}
              </h2>
              <div className="grid grid-cols-2 gap-3 md:gap-5">
                {[
                  { src: mood.image, cap: isEn ? 'Bare face' : '맨얼굴' },
                  { src: mood.lookImage, cap: lookName },
                ].map((f) => (
                  <figure key={f.cap}>
                    <img src={f.src} alt={`${name} — ${f.cap}`} loading="lazy" decoding="async" width={900} height={1200} className="w-full h-auto aspect-[3/4] object-cover" />
                    <figcaption className="mt-2 text-sm font-bold text-navy">{f.cap}</figcaption>
                  </figure>
                ))}
              </div>
              <a
                href={makeupHref}
                onClick={() => { keepLocale(); trackToolPromotion('face_shape', t.code, 'look_preview') }}
                className="mt-7 inline-flex items-center justify-center gap-2 break-keep bg-primary hover:bg-primary-dark text-white px-7 py-3.5 font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-lg">auto_awesome</span>
                {isEn ? 'Try it on my selfie' : '내 셀카로 해보기'}
              </a>
              <p className="mt-3 text-xs text-slate-500">
                {isEn ? 'Example person created with AI. Your result uses your own photo.' : 'AI로 만든 예시 인물이에요. 실제 결과는 내 사진으로 만들어져요.'}
              </p>
            </div>
          </section>
        )}

        {/* 다른 진단 2~3개 끝난 사람에게 "완성까지 N개" 넛지 — 히어로 바로 아래(2026-09-10) */}
        <DnaTracker field="faceShape" code={code} />
        {/* 진단 직후 = 저장 의향이 가장 높은 자리. 무로그인 결과는 이 브라우저에만 남으므로
            "잃지 않으려면"이라는 납득되는 이유로만 로그인을 권한다(도구 자체는 계속 무로그인).
            로그인 상태거나 저장할 게 없으면 SaveToAccount 가 스스로 숨는다.
            ⚠ 여태 이 띠는 /tools/beauty-dna/ 에만 있었다. 4종을 다 끝내고 그 페이지까지
              가야 처음 나오니, 1개만 하고 떠나는 대다수에게선 아무것도 못 남겼다. */}
        <SaveToAccount />

        {/* 유형별 롱폼 본문 — 아코디언 안 마소니 한 칸에 갇혀 있던 고유 콘텐츠를 꺼냈다.
            이 글이 각 유형을 다른 유형과 구별해 주는 유일한 자산인데, 접혀 있는 데다
            정보 한 조각 취급을 받아 유형 페이지들이 서로 85% 유사해졌었다(2026-07-14
            색인 이탈 62건). 16Personalities 처럼 긴 단일 컬럼으로 낸다. */}
        <ToolLongform
          eyebrow={LF_EYEBROW}
          title={L.more}
          moreLabel={isEn ? 'Keep reading' : '이어서 읽기'}
          paragraphs={detailParagraphs}
          image={mood.image}
          imageAlt={tagline}
        />

        {/* 주간 레터 — 2026-09-22 에 **페이지 끝에서 여기로 올렸다.**
            사람은 페이지 길이와 무관하게 위 40% 에서 시간의 65% 를 쓴다. 맨 아래(86~96% 지점)에
            있던 구독 폼은 사실상 아무에게도 보이지 않았다. 글을 다 읽은 직후에 둔다. */}
        <section className="pt-2 pb-10 md:pb-14">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <EmailSubscribe
              source="face-shape"
              resultName={name}
              result={{
                tool: 'face-shape',
                code: t.code,
                label: isEn ? 'Face Shape' : '얼굴형',
                name,
                tagline,
                emoji: t.emoji,
                path: `${basePath}/${t.slug}/`,
                image: mood.image,
                facts: features,
              }}
            />
          </div>
        </section>

        {/* 결과 벤토 — 컨투어링·스타일은 한 타일 안 행으로 */}
        <section className="py-8 md:py-12">
          <div className="max-w-5xl mx-auto px-3 sm:px-6">
            {AFFILIATE_ENABLED && <RegionToggle pageType="face_shape" className="mb-7" />}
            <BentoGrid>
              {tiles}
              <BentoBanner
                title={L.bannerTitle}
                desc={L.bannerDesc}
                ctaLabel={L.bannerCta}
                href={makeupHref}
                tool="face_shape"
                slug={t.code}
                gradient={t.card.gradient}
              />
            </BentoGrid>
            {AFFILIATE_ENABLED && (
              <p className="mt-7 text-center text-[11px] text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {i18n(region === 'global' ? 'recProducts.disclosureGlobal' : 'recProducts.disclosure')}
              </p>
            )}
          </div>
        </section>

        {/* FAQ — SEO 보존 */}
        {/* FAQ 는 **도구 랜딩에만** 둔다 (2026-07-23).
            같은 FAQ 5개가 유형 페이지 16장에 그대로 복제되면서 페이지 간 문장 중복률이
            54~67% 까지 올라갔고, 구글이 "사실상 같은 페이지"로 보고 유형별로 1~2개만
            색인했다(크롤링됨-색인 미생성 24건 중 15건이 도구 결과 페이지였다).
            FAQ 는 "이 도구가 뭔가"에 답하므로 진단 **전** 사용자를 위한 것이고,
            그 자리는 랜딩이다. 결과 페이지는 이미 진단을 받은 사람이 본다. */
        }

        {/* Share */}
        <ShareBar
          url={`https://kissinskin.net${basePath}/${t.slug}/`}
          shareText={
            isEn
              ? `My face shape is "${t.enName}" ${t.emoji}\n${t.taglineEn ?? t.tagline}\n\n`
              : `나의 얼굴형은 "${t.koName}" ${t.emoji}\n${t.tagline}\n\n`
          }
          shareTitle={isEn ? `Face shape: ${t.enName}` : `얼굴형: ${t.koName}`}
          retakeUrl={`${basePath}/`}
        />

        {/* Cross-promo — 다른 진단 3종 */}
        <RelatedTools exclude="face-shape" />

        {/* Other shapes */}
        <section className="py-14 bg-gradient-to-b from-white to-background-light">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-navy text-center mb-8 tracking-tight leading-tight">
              {L.allShapes}
            </h2>
            {/* 2026-09-22: 4:5 · 2열 → 정사각 · 3열 + compact. 이 그리드는 '읽을 것'이
                아니라 '고를 것'이라 카드가 클 필요가 없다. 같은 5개 내부링크는 그대로. */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
              {FACE_SHAPE_ORDER.map(c => {
                const s = FACE_SHAPE_TYPES[c]
                const isMe = s.code === t.code
                return (
                  <TypePreviewCard
                    key={c}
                    href={`${basePath}/${s.slug}/`}
                    emoji={s.emoji}
                    name={isEn ? s.enName : s.koName}
                    sub={isMe ? L.me : (isEn ? s.koName : s.enName)}
                    accent={s.primaryColor}
                    image={FACE_SHAPE_MOOD[c].image}
                    current={isMe}
                    aspectClass="aspect-square"
                    compact
                  />
                )
              })}
            </div>
          </div>
        </section>

      </main>
      <ToolsFooter />
    </div>
  )
}
