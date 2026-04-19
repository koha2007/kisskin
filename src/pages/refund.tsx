import './policy.css'
import { useI18n } from '../i18n/I18nContext'

type Page = 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact'

interface RefundProps {
  onNavigate?: (page: Page) => void
}

export default function Refund({ onNavigate }: RefundProps) {
  const { locale, setLocale } = useI18n()

  const nav = (page: string) => {
    const paths: Record<string, string> = { home: '/', analysis: '/analysis', terms: '/terms', privacy: '/privacy', refund: '/refund', contact: '/contact', auth: '/auth', mypage: '/mypage' }
    if (onNavigate) onNavigate(page as Page)
    else window.location.href = paths[page] || '/'
  }

  return (
    <div className="legal-page">
      <div className="legal-header">
        <button className="legal-back" onClick={() => nav('home')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1>{locale === 'ko' ? '환불 정책' : 'Refund Policy'}</h1>
        <button
          className="legal-lang"
          onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
          aria-label="Switch language"
        >
          {locale === 'ko' ? 'EN' : '한국어'}
        </button>
      </div>
      <div className="legal-content">
        {locale === 'ko' ? <RefundKo /> : <RefundEn />}
      </div>
    </div>
  )
}

function RefundKo() {
  return (
    <>
      <p className="legal-date">시행일: 2026년 3월 8일</p>

      <h2>1. 개요</h2>
      <p>kissinskin은 결제 후 <strong>즉시</strong> 전달되는 AI 생성 메이크업 분석 결과를 제공합니다. 당사 제품은 전달 즉시 소비되는 디지털 콘텐츠이므로, 본 환불 정책은 이러한 특성을 반영하면서도 이용자의 법정 소비자 권리를 존중합니다.</p>

      <h2>2. 일반 정책</h2>
      <p>AI 분석 결과가 브라우저로 정상 전달된 시점에는 모든 구매가 <strong>최종 확정</strong>됩니다. 결과가 결제 직후 생성·표시되므로 전달된 콘텐츠를 "취소"하거나 "회수"할 수 없습니다.</p>
      <p><strong>중요:</strong> 본 정책은 이용자의 관할지역 법령상 법정 소비자 권리에 영향을 주지 않습니다. 지역별 권리는 제10조 이하를 참고해 주십시오.</p>

      <h2>3. 자동 환불 (서비스 실패)</h2>
      <p>AI가 결과(메이크업 이미지 또는 분석 리포트) 생성에 실패한 경우, 이용자의 별도 조치 없이 <strong>자동으로 전액 환불</strong>됩니다. 해당 상황은 다음을 포함합니다.</p>
      <ul>
        <li><strong>이미지 생성 실패:</strong> AI가 메이크업 시뮬레이션 이미지를 생성하지 못한 경우</li>
        <li><strong>리포트 생성 실패:</strong> AI가 피부 분석 리포트를 생성하지 못한 경우</li>
        <li><strong>서버/API 오류:</strong> 결과 전달을 방해하는 당사 측 기술 오류</li>
      </ul>
      <p>자동 환불은 Polar를 통해 즉시 처리됩니다. 환불이 개시되면 Polar로부터 확인 메일을 받게 됩니다.</p>

      <h2>4. 수동 환불 대상</h2>
      <p>자동 환불 외에도 다음 경우에는 요청에 따라 <strong>전액 환불</strong>됩니다.</p>
      <ul>
        <li><strong>중복 과금:</strong> 동일한 분석에 대해 실수로 여러 번 과금된 경우</li>
        <li><strong>처리 오류:</strong> AI가 완전히 공백, 손상되거나 관련 없는 결과를 반환한 경우 (단순히 스타일 취향에 맞지 않는 경우는 제외)</li>
        <li><strong>서비스가 설명과 다른 경우:</strong> 메이크업 스타일이 전혀 생성되지 않거나 분석 리포트가 제공되지 않는 등 서비스가 근본적으로 설명된 내용을 전달하지 못한 경우</li>
      </ul>

      <h2>5. 환불 대상이 아닌 경우</h2>
      <ul>
        <li><strong>AI 생성 스타일에 단순히 불만족</strong>한 경우 (스타일 취향은 주관적이며, AI 결과는 사진 품질, 조명 등에 따라 달라집니다)</li>
        <li>결과 저장 전 <strong>브라우저를 닫은 경우</strong>. 결과는 활성 브라우저 세션에만 존재합니다.</li>
        <li>결과를 본 후 <strong>마음이 바뀐 경우</strong></li>
        <li><strong>잘못된 사진을 업로드</strong>하거나 잘못된 옵션(성별, 피부 타입)을 선택한 경우</li>
        <li><strong>이용자의 기기 또는 인터넷 연결</strong> 문제로 결과 표시에 문제가 생긴 경우</li>
        <li><strong>잘못된 이메일 주소:</strong> 결제 시 잘못되거나 접근 불가능한 이메일 주소를 입력한 경우. 분석 리포트는 결제 시 입력한 이메일로 전송되며, 정확한 입력은 이용자의 책임입니다. 잘못된 이메일로 전송된 리포트에 대해서는 환불되지 않습니다.</li>
      </ul>

      <h2>6. EU/EEA 청약철회권</h2>
      <p>EU 소비자권리지침(2011/83/EU)에 따라 소비자는 온라인 구매에 대해 일반적으로 <strong>14일 청약철회권</strong>을 가집니다. 다만:</p>
      <ul>
        <li>본 서비스는 구매 직후 디지털 콘텐츠를 즉시 전달합니다.</li>
        <li>구매 시점에 이용자는 즉시 전달에 <strong>명시적으로 동의</strong>하고 콘텐츠 전달 즉시 청약철회권을 상실함을 <strong>인지</strong>합니다.</li>
        <li>이는 본인의 명시적 사전 동의 및 인지 하에 공급된 디지털 콘텐츠에 대한 예외를 규정한 지침 제16조(m)에 부합합니다.</li>
        <li>당사 측 오류로 결과가 전달되지 않은 경우, 구제 수단(수리, 교체, 환불)에 대한 법정 권리는 전적으로 보호됩니다.</li>
      </ul>

      <h2>7. 영국 소비자 권리</h2>
      <p>영국 소비자권리법 2015에 따라:</p>
      <ul>
        <li>디지털 콘텐츠는 <strong>만족할 만한 품질</strong>, <strong>목적 적합성</strong>, <strong>설명과의 일치</strong>를 갖추어야 합니다.</li>
        <li>디지털 콘텐츠에 하자가 있는 경우(생성 실패, 손상된 결과 등) <strong>수리 또는 교체</strong>를 받을 권리가 있습니다. 불가능한 경우 <strong>가격 감액 또는 환불</strong>이 가능합니다.</li>
        <li>즉시 전달에 동의하고 취소권 상실을 인지한 경우 14일 취소 기간은 적용되지 않습니다.</li>
      </ul>

      <h2>8. 호주 소비자법</h2>
      <p>호주 소비자법(Competition and Consumer Act 2010 Schedule 2)에 따라:</p>
      <ul>
        <li>서비스에는 계약으로 배제할 수 없는 <strong>소비자 보증</strong>이 부여됩니다.</li>
        <li>서비스에 <strong>중대한 실패</strong>(결과 미전달, 설명과 근본적으로 다름)가 있는 경우 환불 또는 교체를 받을 권리가 있습니다.</li>
        <li>경미한 실패에 대해서는 합리적 기간 내에 구제 수단을 제공합니다.</li>
        <li>당사 상품과 서비스는 호주 소비자법상 배제할 수 없는 보증을 수반합니다. 중대한 실패의 경우 교체 또는 환불 및 합리적으로 예견 가능한 기타 손실·손해에 대한 보상을 받을 권리가 있습니다.</li>
      </ul>

      <h2>9. 대한민국 소비자 권리</h2>
      <p>전자상거래 등에서의 소비자보호에 관한 법률(전자상거래법)에 따라:</p>
      <ul>
        <li>소비자는 온라인 구매에 대해 일반적으로 <strong>7일 청약철회권</strong>을 가집니다.</li>
        <li>다만 디지털 콘텐츠가 이미 사용되었거나 그 효용이 확정된 경우 청약철회권이 적용되지 않습니다(제17조 제2항 제5호).</li>
        <li>본 AI 분석 결과는 즉시 전달·소비되므로, 결과가 표시된 이후에는 철회권이 제한됩니다.</li>
        <li>서비스에 하자가 있거나 설명과 다르게 전달되지 않은 경우, 환불에 대한 법정 권리는 전적으로 보장됩니다.</li>
        <li>분쟁은 <strong>한국소비자원</strong>(<a href="https://www.kca.go.kr" target="_blank" rel="noopener noreferrer">kca.go.kr</a>)을 통해 해결할 수 있습니다.</li>
      </ul>

      <h2>10. 브라질 소비자 권리</h2>
      <p>브라질 소비자보호법(Código de Defesa do Consumidor)에 따라:</p>
      <ul>
        <li>소비자는 온라인 구매에 대해 <strong>7일 후회권</strong>(direito de arrependimento)을 가집니다 (제49조).</li>
        <li>즉시 소비되는 디지털 서비스의 경우 소비자가 즉시 전달에 명시적으로 동의하면 이 권리가 제한될 수 있습니다.</li>
        <li>서비스에 하자가 있거나 설명과 다른 경우 CDC 제18~20조에 따라 환불받을 권리가 있습니다.</li>
        <li><strong>PROCON</strong> 또는 <a href="https://www.consumidor.gov.br" target="_blank" rel="noopener noreferrer">consumidor.gov.br</a>에 민원을 제기할 수 있습니다.</li>
      </ul>

      <h2>11. 환불 요청 방법</h2>
      <ol>
        <li>구매일로부터 <strong>14일 이내</strong>(또는 거주 지역 소비자법이 요구하는 기간 중 더 긴 기간 내)에 <strong>support@kissinskin.net</strong>으로 이메일을 보내 주십시오.</li>
        <li>다음 정보를 포함해 주십시오.
          <ul>
            <li>결제에 사용한 이메일 주소</li>
            <li>구매 일자 및 대략적인 시각</li>
            <li>문제 설명 (가능하면 스크린샷 첨부)</li>
            <li>거주 국가 (해당 소비자법 적용을 위해)</li>
          </ul>
        </li>
        <li>요청을 검토한 후 <strong>3 영업일 이내</strong>에 회신드립니다.</li>
      </ol>

      <h2>12. 환불 처리 방식</h2>
      <ul>
        <li>승인된 환불은 결제 프로세서 <strong>Polar</strong>를 통해 처리됩니다.</li>
        <li>환불은 <strong>원래 결제 수단</strong>으로 반환됩니다.</li>
        <li>처리 기간: 은행 또는 카드사에 따라 <strong>5~10 영업일</strong>.</li>
        <li>환불 개시 시 Polar로부터 확인 이메일을 받게 됩니다.</li>
      </ul>

      <h2>13. 지급거절 (Chargeback)</h2>
      <p>은행에 지급거절(chargeback)을 신청하기 전에 <strong>support@kissinskin.net</strong>으로 먼저 연락해 주시길 권장합니다. 당사는 문제를 공정하고 신속하게 해결하는 데 전념하고 있습니다. 당사에 연락하지 않고 지급거절을 신청하면 처리 지연과 추가 문제가 발생할 수 있습니다.</p>

      <h2>14. 가격 및 통화</h2>
      <ul>
        <li>모든 가격은 <strong>미국 달러(USD, $)</strong>로 표시됩니다.</li>
        <li>최종 청구 금액은 은행의 환율 변환 수수료에 따라 다소 차이가 있을 수 있습니다. 환율 차이에 대해 kissinskin은 책임지지 않습니다.</li>
        <li>거주지에 따라 부가가치세(VAT, GST, 판매세)가 Polar에 의해 현지 세법에 맞게 추가될 수 있습니다.</li>
      </ul>

      <h2>15. 법정 권리</h2>
      <p><strong>본 환불 정책은 이용자의 관할지역 법률상 법정 소비자 권리를 제한하거나 배제할 의도가 없습니다.</strong> 본 정책의 조항이 관련 강행 소비자보호법과 충돌하는 경우 강행법이 우선합니다. 이에는 다음이 포함되나 이에 국한되지 않습니다.</p>
      <ul>
        <li>EU 소비자권리지침(2011/83/EU)</li>
        <li>영국 소비자권리법 2015</li>
        <li>호주 소비자법</li>
        <li>대한민국 전자상거래법 및 소비자기본법</li>
        <li>브라질 소비자보호법(CDC)</li>
        <li>캐나다 각 주의 소비자보호법</li>
        <li>일본 소비자계약법</li>
      </ul>

      <h2>16. 문의</h2>
      <p>환불 요청 또는 청구 관련 문의:</p>
      <ul>
        <li>이메일: <strong>support@kissinskin.net</strong></li>
        <li>응답 시간: 3 영업일 이내</li>
      </ul>
    </>
  )
}

function RefundEn() {
  return (
    <>
      <p className="legal-date">Effective Date: March 8, 2026</p>

      <h2>1. Overview</h2>
      <p>kissinskin provides AI-generated makeup analysis results that are delivered <strong>instantly</strong> after payment. Because our product is digital content consumed immediately upon delivery, our refund policy reflects this nature while respecting your statutory consumer rights.</p>

      <h2>2. General Policy</h2>
      <p>All purchases are <strong>final</strong> once the AI analysis results have been successfully delivered to your browser. Since results are generated and displayed immediately after payment, we cannot "undo" or "take back" the delivered content.</p>
      <p><strong>Important:</strong> This policy does not affect your statutory consumer rights under applicable law. See Section 10 for jurisdiction-specific rights.</p>

      <h2>3. Automatic Refund (Service Failure)</h2>
      <p>If our AI fails to generate results (makeup images or analysis report), a <strong>full refund is automatically processed</strong> without any action required on your part. This includes:</p>
      <ul>
        <li><strong>Image generation failure:</strong> The AI failed to generate makeup simulation images.</li>
        <li><strong>Report generation failure:</strong> The AI failed to generate the skin analysis report.</li>
        <li><strong>Server/API error:</strong> Any technical error on our end that prevents results from being delivered.</li>
      </ul>
      <p>Automatic refunds are processed instantly through Polar. You will receive a confirmation from Polar once the refund is initiated.</p>

      <h2>4. When You ARE Eligible for a Manual Refund</h2>
      <p>In addition to automatic refunds, we will issue a <strong>full refund</strong> upon request in the following cases:</p>
      <ul>
        <li><strong>Duplicate charge:</strong> You were accidentally charged more than once for the same analysis.</li>
        <li><strong>Processing error:</strong> The AI returned a completely blank, corrupted, or unrelated result (not merely an unsatisfactory style preference).</li>
        <li><strong>Service not as described:</strong> The Service fundamentally failed to deliver what was described (e.g., no makeup styles generated, no analysis report provided).</li>
      </ul>

      <h2>5. When You Are NOT Eligible for a Refund</h2>
      <ul>
        <li>You are <strong>dissatisfied with the AI-generated styles</strong> (style preferences are subjective; AI results vary based on photo quality, lighting, and other factors).</li>
        <li>You <strong>closed the browser</strong> before saving your results. Results exist only in your active browser session.</li>
        <li>You <strong>changed your mind</strong> after seeing the results.</li>
        <li>You <strong>uploaded the wrong photo</strong> or selected incorrect options (gender, skin type).</li>
        <li>Your <strong>device or internet connection</strong> caused issues displaying the results.</li>
        <li><strong>Incorrect email address:</strong> You provided an incorrect or inaccessible email address during payment. Analysis reports are sent to the email address you enter at checkout. It is your responsibility to ensure the email address is correct. We do not issue refunds for reports sent to an incorrect email address.</li>
      </ul>

      <h2>5. EU/EEA Right of Withdrawal</h2>
      <p>Under the EU Consumer Rights Directive (2011/83/EU), consumers normally have a <strong>14-day right of withdrawal</strong> for online purchases. However:</p>
      <ul>
        <li>Our Service delivers digital content immediately upon purchase.</li>
        <li>At the point of purchase, you <strong>expressly consent</strong> to immediate delivery and <strong>acknowledge</strong> that you lose your right of withdrawal once the content is delivered.</li>
        <li>This is in accordance with Article 16(m) of the Directive, which provides an exception for digital content supplied with the consumer's prior express consent and acknowledgment.</li>
        <li>If the Service fails to deliver results due to our error, your statutory right to a remedy (repair, replacement, or refund) remains fully protected.</li>
      </ul>

      <h2>6. UK Consumer Rights</h2>
      <p>Under the UK Consumer Rights Act 2015:</p>
      <ul>
        <li>Digital content must be of <strong>satisfactory quality</strong>, <strong>fit for purpose</strong>, and <strong>as described</strong>.</li>
        <li>If digital content is faulty (e.g., fails to generate, produces corrupted results), you are entitled to a <strong>repair or replacement</strong>. If that is not possible, you may be entitled to a <strong>price reduction or refund</strong>.</li>
        <li>The 14-day cooling-off period does not apply once you have consented to immediate delivery and acknowledged the loss of your right to cancel.</li>
      </ul>

      <h2>7. Australian Consumer Law</h2>
      <p>Under the Australian Consumer Law (Schedule 2 of the Competition and Consumer Act 2010):</p>
      <ul>
        <li>Services come with <strong>consumer guarantees</strong> that cannot be excluded by contract.</li>
        <li>You are entitled to a refund or replacement if the Service has a <strong>major failure</strong> (e.g., does not deliver results, is fundamentally different from what was described).</li>
        <li>For minor failures, we will provide a remedy within a reasonable time.</li>
        <li>Our goods and services come with guarantees that cannot be excluded under the Australian Consumer Law. You are entitled to a replacement or refund for a major failure and compensation for any other reasonably foreseeable loss or damage.</li>
      </ul>

      <h2>8. South Korean Consumer Rights</h2>
      <p>Under the Korean Act on Consumer Protection in Electronic Commerce (전자상거래법):</p>
      <ul>
        <li>Consumers generally have a <strong>7-day withdrawal right</strong> for online purchases.</li>
        <li>However, this right does not apply to digital content that has been used or whose utility has been determined (Article 17(2)(5)).</li>
        <li>Since our AI analysis results are delivered and consumed immediately, the withdrawal right is limited once results are displayed.</li>
        <li>If the Service is defective or fails to deliver as described, you retain full statutory rights to a refund.</li>
        <li>Disputes may be resolved through the <strong>Korea Consumer Agency (한국소비자원)</strong> at <a href="https://www.kca.go.kr" target="_blank" rel="noopener noreferrer">kca.go.kr</a>.</li>
      </ul>

      <h2>9. Brazilian Consumer Rights</h2>
      <p>Under the Brazilian Consumer Defense Code (Código de Defesa do Consumidor):</p>
      <ul>
        <li>Consumers have a <strong>7-day right of regret</strong> (direito de arrependimento) for online purchases (Article 49).</li>
        <li>For digital services consumed immediately, this right may be limited where the consumer expressly consents to immediate delivery.</li>
        <li>If the Service is defective or fails to deliver as described, you have full rights to a refund under Articles 18-20 of the CDC.</li>
        <li>You may file a complaint with <strong>PROCON</strong> or through <a href="https://www.consumidor.gov.br" target="_blank" rel="noopener noreferrer">consumidor.gov.br</a>.</li>
      </ul>

      <h2>10. How to Request a Refund</h2>
      <ol>
        <li>Email <strong>support@kissinskin.net</strong> within <strong>14 days</strong> of your purchase (or within the period required by your local consumer law, whichever is longer).</li>
        <li>Include the following information:
          <ul>
            <li>The email address used for payment</li>
            <li>Date and approximate time of purchase</li>
            <li>Description of the issue (screenshot if possible)</li>
            <li>Your country of residence (so we can apply the correct consumer law)</li>
          </ul>
        </li>
        <li>We will review your request and respond within <strong>3 business days</strong>.</li>
      </ol>

      <h2>11. How Refunds Are Processed</h2>
      <ul>
        <li>Approved refunds are processed through <strong>Polar</strong>, our payment processor.</li>
        <li>Refunds are returned to your <strong>original payment method</strong>.</li>
        <li>Processing time: <strong>5–10 business days</strong> depending on your bank or card issuer.</li>
        <li>You will receive a confirmation email from Polar once the refund is initiated.</li>
      </ul>

      <h2>12. Chargebacks</h2>
      <p>We encourage you to contact us at <strong>support@kissinskin.net</strong> before initiating a chargeback with your bank. We are committed to resolving issues fairly and promptly. Filing a chargeback without contacting us first may result in delays and additional complications.</p>

      <h2>13. Pricing & Currency</h2>
      <ul>
        <li>All prices are listed in <strong>USD ($)</strong>.</li>
        <li>The final amount charged may vary slightly due to currency conversion fees applied by your bank. kissinskin is not responsible for exchange rate differences.</li>
        <li>Tax (VAT, GST, sales tax) may be added to your purchase depending on your location, as calculated by Polar in compliance with local tax laws.</li>
      </ul>

      <h2>14. Statutory Rights</h2>
      <p><strong>Nothing in this Refund Policy is intended to limit or exclude your statutory consumer rights under the laws of your jurisdiction.</strong> Where any provision of this policy conflicts with mandatory consumer protection laws applicable to you, the mandatory law shall prevail. This includes but is not limited to:</p>
      <ul>
        <li>EU Consumer Rights Directive (2011/83/EU)</li>
        <li>UK Consumer Rights Act 2015</li>
        <li>Australian Consumer Law</li>
        <li>Korean Act on Consumer Protection in Electronic Commerce</li>
        <li>Brazilian Consumer Defense Code (CDC)</li>
        <li>Canadian provincial consumer protection legislation</li>
        <li>Japanese Consumer Contract Act</li>
      </ul>

      <h2>15. Contact Us</h2>
      <p>For refund requests or billing questions:</p>
      <ul>
        <li>Email: <strong>support@kissinskin.net</strong></li>
        <li>Response time: Within 3 business days</li>
      </ul>
    </>
  )
}
