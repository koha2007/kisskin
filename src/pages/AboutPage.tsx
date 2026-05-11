import { ToolsNav, ToolsFooter } from '../components/ToolsLayout'
import { useI18n } from '../i18n/I18nContext'

export default function AboutPage() {
  const { locale } = useI18n()
  return (
    <div className="font-display bg-white min-h-screen">
      <ToolsNav />
      <main>
        <section className="border-b border-slate-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 mb-4">
              kissinskin · About
            </div>
            <h1 className="text-[28px] md:text-[40px] font-bold text-navy leading-[1.15] tracking-tight mb-4">
              {locale === 'ko'
                ? '셀카 한 장으로 K-뷰티를 실험하는 사이트'
                : 'A site for experimenting with K-beauty from a single selfie'}
            </h1>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed">
              {locale === 'ko'
                ? 'kissinskin은 K-뷰티 메이크업·퍼스널컬러·얼굴형을 AI로 시뮬레이션하고, 그 옆에 깊이 있는 읽을거리를 함께 제공하는 사이트입니다.'
                : 'kissinskin lets you preview K-beauty makeup, personal color, and face-shape advice with AI — alongside in-depth editorial content.'}
            </p>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 prose prose-slate max-w-none">
            {locale === 'ko' ? <AboutKo /> : <AboutEn />}
          </div>
        </section>
      </main>
      <ToolsFooter />
    </div>
  )
}

function AboutKo() {
  return (
    <>
      <h2>운영 주체</h2>
      <p>
        kissinskin은 대한민국에서 운영되는 1인 인디 프로젝트입니다. 운영자
        <strong> 김용헌(YONGHUN KIM)</strong>이 모든 도구·콘텐츠·디자인·기술을
        직접 만들고 유지하며, 모든 문의에 직접 응답합니다. 외부 투자 없이
        사용자 결제·Google AdSense 광고 수익·쿠팡 파트너스 어필리에이트 수수료로
        운영비를 충당합니다.
      </p>

      <h2>사이트 목적</h2>
      <p>
        2024년 K-뷰티 시장이 글로벌로 확장되면서 "한국식 메이크업이 나에게
        어울릴까?"라는 질문이 늘었습니다. 매장에 가지 않고도 셀카 한 장으로 9가지
        스타일을 미리 보고, 자신의 퍼스널컬러·얼굴형·취향을 진단하고, 글로벌
        뷰티 산업의 데이터·트렌드를 한 곳에서 읽을 수 있는 사이트가 필요하다고
        생각해 만들었습니다.
      </p>

      <h2>편집·검수 원칙</h2>
      <ul>
        <li>
          <strong>오리지널 콘텐츠:</strong> 가이드·블로그·뉴스·리뷰는 모두 운영자가
          직접 기획하고 작성합니다. 다른 사이트에서 복사하지 않습니다.
        </li>
        <li>
          <strong>출처 명시:</strong> 산업 데이터를 인용할 때는 BeautyMatter,
          Mintel, NIQ, NPD Group 등 공개 보고서를 본문에 명시합니다.
        </li>
        <li>
          <strong>AI 사용 고지:</strong> 본문은 사람이 직접 씁니다. AI는 도구
          기능(이미지 시뮬레이션·진단)에만 사용되며, 생성된 결과에는 EU AI법
          요구에 따라 AI 생성 표기를 합니다.
        </li>
        <li>
          <strong>제품 추천 정직성:</strong> 추천 제품은 글로벌 베스트셀러 데이터
          및 유형별 특성 분석 기반으로 큐레이션합니다. 2026년 5월부터 쿠팡 파트너스
          어필리에이트 프로그램에 참여하며, 추천 카드의 일부 링크는 어필리에이트
          링크입니다(<code>rel="sponsored"</code> 표기). 어필리에이트 수수료는
          제품 가격에 영향을 주지 않으며, 추천 선정 자체에도 영향이 없습니다.
          각 추천 섹션 하단에 디스클로저를 표시합니다.
        </li>
      </ul>

      <h2>기술과 개인정보</h2>
      <ul>
        <li>
          <strong>인프라:</strong> Cloudflare Pages + Workers (서버리스)에서 실행됩니다.
        </li>
        <li>
          <strong>AI:</strong> OpenAI API (gpt-image-1.5, gpt-4.1) — 학습 비활용 옵션 사용.
        </li>
        <li>
          <strong>결제:</strong> Polar (Merchant of Record) 가 처리하며, 카드
          정보는 본 사이트에 저장되지 않습니다.
        </li>
        <li>
          <strong>업로드 사진:</strong> 분석 직후 즉시 폐기되며, 어떠한 형태로도
          저장되지 않습니다. 자세한 내용은
          <a href="/privacy"> 개인정보처리방침</a>을 참고해 주세요.
        </li>
      </ul>

      <h2>광고 · 어필리에이트 정책</h2>
      <p>
        본 사이트는 무료 도구·콘텐츠 운영 비용을 충당하기 위해 Google AdSense
        광고를 게재합니다. 광고는 사이드/콘텐츠 사이에 명확히 구분되어 노출되며,
        편집 콘텐츠와 광고를 혼동하지 않도록 표시합니다. 광고 쿠키 동의는 사이트
        하단 쿠키 배너에서 변경할 수 있습니다.
      </p>
      <p>
        또한 본 사이트는 <strong>쿠팡 파트너스</strong> 어필리에이트 프로그램에
        참여하고 있으며, 추천 카드의 일부 링크는 어필리에이트 링크입니다
        (HTML <code>rel="sponsored"</code> 표기, 새 창 열림). 이용자가 해당
        링크를 통해 쿠팡에서 구매할 경우 쿠팡으로부터 일정액의 수수료를
        받습니다. 수수료는 제품 가격에 영향을 주지 않으며, 어떤 제품을 추천할지
        결정하는 데에도 영향을 주지 않습니다. 추천은 사용자의 유형 진단 결과와
        제품의 객관적 특성에만 기반합니다.
      </p>

      <h2>문의 · 정정 요청 · 신고</h2>
      <ul>
        <li>일반 문의: <a href="mailto:support@kissinskin.net">support@kissinskin.net</a></li>
        <li>개인정보 요청: <a href="mailto:privacy@kissinskin.net">privacy@kissinskin.net</a></li>
        <li>비즈니스: <a href="mailto:biz@kissinskin.net">biz@kissinskin.net</a></li>
        <li>전체 문의 채널: <a href="/contact">/contact</a></li>
      </ul>
      <p>
        콘텐츠 사실 오류·저작권 우려·접근성 문제가 있으면 위 이메일 또는
        문의 페이지로 알려 주세요. <strong>3 영업일 이내</strong>에 회신하고
        필요한 경우 정정합니다.
      </p>
    </>
  )
}

function AboutEn() {
  return (
    <>
      <h2>Who runs this site</h2>
      <p>
        kissinskin is an indie one-person project based in South Korea. The
        operator, <strong>Yonghun Kim</strong>, builds and maintains every tool,
        article, and feature, and personally answers all inquiries. There are
        no investors. The site is funded by user payments, Google AdSense ad
        revenue, and Coupang Partners affiliate commissions.
      </p>

      <h2>What the site is for</h2>
      <p>
        As K-beauty went global in 2024, more people started asking, "Would
        Korean makeup look good on me?" kissinskin lets you preview nine styles
        on a single selfie, diagnose your personal color, face shape, and
        preferences, and read in-depth K-beauty industry context — all in one
        place, without visiting a store.
      </p>

      <h2>Editorial standards</h2>
      <ul>
        <li>
          <strong>Original content:</strong> Guides, blog posts, news, and reviews
          are written by the operator. Nothing is copied from other sites.
        </li>
        <li>
          <strong>Sourced claims:</strong> Industry data references public reports
          (BeautyMatter, Mintel, NIQ, NPD Group) inline.
        </li>
        <li>
          <strong>AI disclosure:</strong> Editorial text is written by a human.
          AI is used only inside the tools (image simulation and diagnostics),
          and AI-generated results are labeled in line with the EU AI Act.
        </li>
        <li>
          <strong>Product recommendations:</strong> Picks are curated from global
          bestseller data and type-specific analysis. Starting May 2026, we
          participate in the Coupang Partners affiliate program; some links in
          the recommendation cards are affiliate links (marked
          <code> rel="sponsored"</code>). Affiliate commissions do not affect
          product prices or our selection. A disclosure is shown beneath each
          recommendation section.
        </li>
      </ul>

      <h2>Technology and privacy</h2>
      <ul>
        <li>
          <strong>Infrastructure:</strong> Cloudflare Pages + Workers (serverless).
        </li>
        <li>
          <strong>AI:</strong> OpenAI API (gpt-image-1.5, gpt-4.1) with the
          no-training option enabled.
        </li>
        <li>
          <strong>Payments:</strong> Processed by Polar (Merchant of Record). We
          never store your card details.
        </li>
        <li>
          <strong>Uploaded photos:</strong> Discarded immediately after analysis
          and never stored. See our <a href="/privacy">Privacy Policy</a> for full
          detail.
        </li>
      </ul>

      <h2>Advertising and affiliate policy</h2>
      <p>
        We display Google AdSense ads to fund the free tools and content. Ads
        are clearly distinct from editorial content. You can change your cookie
        consent any time via the cookie banner at the bottom of the page.
      </p>
      <p>
        We also participate in the <strong>Coupang Partners</strong> affiliate
        program. Some links inside the recommendation cards are affiliate links
        (marked <code>rel="sponsored"</code>, opens in a new tab). If you buy
        through one of those links, Coupang pays us a small commission. The
        commission does not change the price you pay, and it has no influence
        on which products we recommend — picks are based only on your diagnostic
        result and objective product attributes.
      </p>

      <h2>Contact, corrections, and reports</h2>
      <ul>
        <li>General: <a href="mailto:support@kissinskin.net">support@kissinskin.net</a></li>
        <li>Privacy: <a href="mailto:privacy@kissinskin.net">privacy@kissinskin.net</a></li>
        <li>Business: <a href="mailto:biz@kissinskin.net">biz@kissinskin.net</a></li>
        <li>All contact channels: <a href="/contact">/contact</a></li>
      </ul>
      <p>
        If you spot a factual error, a copyright concern, or an accessibility
        issue, write to one of the addresses above. We reply within
        <strong> 3 business days</strong> and correct the page when warranted.
      </p>
    </>
  )
}
