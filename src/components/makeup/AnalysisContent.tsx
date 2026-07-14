import { MAKEUP_STYLES } from '../../lib/makeup/styles'
import { useI18n } from '../../i18n/I18nContext'
import ToolFaq from '../ToolFaq'

// /analysis/ 아래에 항상 깔리는 본문.
//
// 왜 이게 있어야 하는가: 예전에는 `pages/analysis/+Page.tsx` 가 SSR 에서만 SeoShell 을 그리고
// 클라이언트가 마운트되면 앱으로 **통째로 교체**했다. 그래서 (a) 실제 사용자는 그 텍스트를 영영
// 못 봤고, (b) JS 를 실행하는 구글봇도 앱만 보게 되어 SEO 용 텍스트가 아무 일도 하지 않았다.
// 서치콘솔에서 /analysis/ 본문이 394자로 잡히고 색인이 안 붙던 이유다. 게다가 그 목록에 적힌
// 스타일 이름 9개는 실제 MAKEUP_STYLES 와 하나도 일치하지 않는 낡은 값이었다.
//
// 그래서 이 컴포넌트는 **SSR 과 클라이언트가 똑같이** 렌더한다(크롤러/사용자 차별 없음 = 클로킹 아님).
// 룩 목록은 MAKEUP_STYLES 를 직접 읽으므로 스타일이 바뀌면 본문도 자동으로 따라간다.
export default function AnalysisContent() {
  const { locale } = useI18n()
  const isEn = locale === 'en'

  const faq = isEn
    ? [
        {
          q: 'Is the virtual makeup try-on really free?',
          a: 'Yes — your first try is free and needs no card. After that a small credit top-up covers the AI compute, which is the honest reason nothing here is unlimited: someone pays for the GPU either way.',
        },
        {
          q: 'What happens to my selfie?',
          a: 'It is sent to the AI model to generate your looks and is not sold, published, or used to train anyone else\'s model. You can delete your results at any time from your account page.',
        },
        {
          q: 'Will it still look like me?',
          a: 'That is the hard part, and we are direct about it. The model is run image-to-image and constrained to repaint makeup and hair colour only — bone structure, eye shape and skin texture are meant to survive. It is not perfect: strong filters, heavy shadow or an extreme angle in your source photo make identity drift more likely.',
        },
        {
          q: 'What photo works best?',
          a: 'Front-facing, flat even light, a bare or lightly made-up face, eyes to camera, no heavy filter. The photo decides the result more than the look you pick.',
        },
        {
          q: 'Can it change my hair colour too?',
          a: 'Yes. Each look carries a matching hair colour, which is exactly what an AR filter cannot do — filters overlay makeup on live video but cannot restyle hair.',
        },
      ]
    : [
        {
          q: 'AI 메이크업, 정말 무료인가요?',
          a: '첫 1회는 카드 등록 없이 무료입니다. 그다음부터는 소액 크레딧을 충전해야 하는데, AI 연산 비용이 실제로 들기 때문입니다. "무제한 무료"라고 하지 않는 이유가 그것입니다 — GPU 비용은 누군가 냅니다.',
        },
        {
          q: '올린 셀카는 어떻게 되나요?',
          a: '룩을 생성하기 위해 AI 모델로 전송되며, 판매하거나 공개하거나 다른 곳의 학습에 쓰지 않습니다. 결과물은 마이페이지에서 언제든 삭제할 수 있습니다.',
        },
        {
          q: '얼굴이 제 얼굴로 남나요?',
          a: '가장 어려운 부분이고, 솔직하게 말씀드립니다. 이미지-투-이미지 방식으로 **메이크업과 헤어 컬러만 다시 칠하도록** 제약을 걸어 골격·눈매·피부결이 유지되도록 합니다. 완벽하지는 않습니다 — 원본 사진에 강한 필터가 걸려 있거나, 그림자가 짙거나, 각도가 극단적이면 얼굴이 달라 보일 확률이 올라갑니다.',
        },
        {
          q: '어떤 사진이 잘 나오나요?',
          a: '정면, 고르고 평평한 조명, 민낯이나 옅은 화장, 카메라를 보는 눈, 강한 필터 없음. 어떤 룩을 고르느냐보다 **어떤 사진을 올리느냐가 결과를 더 크게 좌우합니다.**',
        },
        {
          q: '헤어 컬러도 바뀌나요?',
          a: '네. 룩마다 어울리는 헤어 컬러가 함께 적용됩니다. 이건 AR 필터가 못 하는 일입니다 — 필터는 실시간 영상 위에 메이크업을 덧씌울 뿐 머리색을 바꾸지는 못합니다.',
        },
      ]

  return (
    <div className="font-display bg-white">
      <section className="border-t border-slate-200 py-14 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tight mb-4">
            {isEn ? 'How the AI makeup try-on works' : 'AI 메이크업은 어떻게 작동하나요'}
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            {isEn
              ? 'Upload one selfie. The model repaints makeup and hair colour onto your own photo — it does not draw a new person. You get nine K-beauty looks back, each with a matching hair colour, plus a report on your skin tone and the products that suit it.'
              : '셀카 한 장을 올리면, 모델이 그 사진 위에 메이크업과 헤어 컬러를 다시 칠합니다. 새로운 사람을 그려내는 게 아닙니다. 9가지 K-뷰티 룩이 각각 어울리는 헤어 컬러와 함께 돌아오고, 피부 톤 분석과 그에 맞는 제품 추천이 따라옵니다.'}
          </p>
          <p className="text-slate-600 leading-relaxed">
            {isEn
              ? 'Three different technologies get called “virtual makeup”, and they fail in different ways. AR filters run live on video but are locked to a brand’s SKUs and cannot touch your hair. Photo editors are manual and slow. AI generation — what runs here — can restyle skin finish and hair colour, but it is the one that can drift away from your face if the source photo fights it. That trade-off is real, and we would rather tell you than pretend.'
              : '"가상 메이크업"이라 불리는 기술은 사실 세 가지이고, 실패하는 방식이 각각 다릅니다. AR 필터는 실시간으로 돌지만 브랜드 제품에 묶여 있고 머리카락은 못 건드립니다. 사진 편집은 수작업이라 느립니다. 여기서 돌아가는 AI 생성은 피부 표현과 헤어 컬러까지 바꿀 수 있지만, 원본 사진이 나쁘면 얼굴이 달라질 수 있는 유일한 방식이기도 합니다. 이 트레이드오프는 실재하고, 숨기기보다 말씀드리는 편을 택했습니다.'}
          </p>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-50 py-14 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tight mb-3">
            {isEn ? 'The nine looks' : '9가지 룩'}
          </h2>
          <p className="text-sm text-slate-600 mb-8">
            {isEn
              ? 'Every look carries its own hair colour. You can generate them one at a time and compare before and after.'
              : '룩마다 어울리는 헤어 컬러가 함께 적용됩니다. 하나씩 생성해 비포/애프터로 비교할 수 있습니다.'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {MAKEUP_STYLES.map((s) => (
              <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4">
                {/* 영문에서는 제목이 곧 subEn 이라 위 라벨을 또 쓰면 같은 말이 두 번 나온다. */}
                {!isEn && (
                  <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 mb-1">
                    {s.subEn}
                  </div>
                )}
                <div className="text-sm font-bold text-navy mb-1">{isEn ? s.subEn : s.nameKo}</div>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  {isEn ? s.descEn : s.descKo}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 py-14 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-navy tracking-tight mb-4">
            {isEn ? 'What it cannot do' : '이건 못 합니다'}
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            {isEn
              ? 'It cannot tell you how a specific lipstick will behave on your lips over eight hours. It cannot match a shade to a product SKU with the accuracy of a counter test. And it cannot rescue a bad source photo — a blurred, back-lit or heavily filtered selfie produces a result that looks like someone else, and no amount of prompting fixes that.'
              : '특정 립스틱이 여덟 시간 뒤 내 입술에서 어떻게 변할지는 알려주지 못합니다. 매장 테스트만큼 정확하게 색을 특정 제품과 매칭하지도 못합니다. 그리고 나쁜 원본 사진은 구제하지 못합니다 — 흔들렸거나, 역광이거나, 필터가 잔뜩 걸린 셀카는 남의 얼굴 같은 결과를 냅니다. 프롬프트로 해결되는 문제가 아닙니다.'}
          </p>
          <p className="text-slate-600 leading-relaxed">
            {isEn
              ? 'What it is good for is the decision before the purchase: does a deep berry lip suit my face at all, would warm copper hair work on me, is a bold eye worth trying. That question is cheap to answer here and expensive to answer at a store.'
              : '대신 잘하는 건 **구매 직전의 결정**입니다. 진한 베리 립이 내 얼굴에 어울리기는 하는가, 웜 코퍼 헤어가 나한테 받는가, 화려한 아이 메이크업을 시도해볼 만한가. 이 질문은 여기서 답하면 싸고, 매장에서 답하면 비쌉니다.'}
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={isEn ? '/en/tools/personal-color/' : '/tools/personal-color/'}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-navy hover:border-navy transition-colors"
            >
              {isEn ? 'Find your personal color first' : '먼저 퍼스널 컬러부터 진단하기'}
            </a>
            <a
              href={isEn ? '/en/about-makeup-ai/' : '/about-makeup-ai/'}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-navy hover:border-navy transition-colors"
            >
              {isEn ? 'Read the full K-beauty guide' : 'K-뷰티 메이크업 완전 가이드 읽기'}
            </a>
          </div>
        </div>
      </section>

      <ToolFaq title={isEn ? 'Frequently asked questions' : '자주 묻는 질문'} items={faq} />
    </div>
  )
}
