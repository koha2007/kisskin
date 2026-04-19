import './policy.css'
import { useI18n } from '../i18n/I18nContext'

type Page = 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact'

interface TermsProps {
  onNavigate?: (page: Page) => void
}

export default function Terms({ onNavigate }: TermsProps) {
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
        <h1>{locale === 'ko' ? '이용약관' : 'Terms of Service'}</h1>
        <button
          className="legal-lang"
          onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
          aria-label="Switch language"
        >
          {locale === 'ko' ? 'EN' : '한국어'}
        </button>
      </div>
      <div className="legal-content">
        {locale === 'ko' ? <TermsKo /> : <TermsEn />}
      </div>
    </div>
  )
}

function TermsKo() {
  return (
    <>
      <p className="legal-date">시행일: 2026년 3월 8일</p>

      <h2>1. 약관 동의</h2>
      <p>kissinskin(<a href="https://kissinskin.net" target="_blank" rel="noopener noreferrer">https://kissinskin.net</a>, 이하 "서비스")에 접속하거나 이를 이용함으로써 본 이용약관(이하 "약관")에 동의한 것으로 간주됩니다. 동의하지 않는 경우 서비스를 이용하지 마십시오. 본 약관은 이용자와 kissinskin 사이에 법적 구속력을 가지는 계약입니다.</p>

      <h2>2. 서비스 설명</h2>
      <p>kissinskin은 AI 기반 메이크업 시뮬레이션 및 뷰티 추천 서비스입니다. 이용자가 사진을 제출하면 AI가 다음을 생성합니다.</p>
      <ul>
        <li>이용자 얼굴에 9가지 맞춤 메이크업 스타일 적용</li>
        <li>피부 타입 및 톤 분석</li>
        <li>맞춤형 화장품 추천</li>
      </ul>
      <p>결과물은 OpenAI의 이미지 생성 및 언어 모델로 생성되며, 브라우저에서 즉시 제공됩니다. 서비스는 자동화된 의사결정과 AI 처리를 사용하며, 결과 생성 과정에 사람의 검토는 포함되지 않습니다.</p>

      <h2>3. 결제 및 과금</h2>
      <ul>
        <li>각 분석은 <strong>1회 결제 $2.99 USD</strong>입니다. 구독, 정기결제, 숨겨진 수수료는 없습니다.</li>
        <li>결제는 <strong>Polar</strong>(<a href="https://polar.sh" target="_blank" rel="noopener noreferrer">polar.sh</a>, Merchant of Record)가 안전하게 처리합니다. Polar가 청구, 세금 계산, 결제 처리를 당사 대신 수행합니다.</li>
        <li>Polar가 지원하는 신용카드 및 기타 결제 수단을 사용할 수 있습니다.</li>
        <li>결제를 완료함으로써 선택한 결제 수단의 과금 권한을 Polar에 부여합니다.</li>
        <li>영수증 및 인보이스는 Polar를 통해 발행됩니다. 청구 관련 문의는 Polar 또는 <strong>support@kissinskin.net</strong>으로 문의해 주십시오.</li>
        <li>모든 가격은 USD로 표시됩니다. 거주 지역에 따라 부가가치세(VAT, GST, 판매세)가 결제 시 Polar에 의해 추가될 수 있습니다.</li>
      </ul>

      <h2>4. 서비스 제공</h2>
      <ul>
        <li>결제 완료 후 결과가 <strong>즉시</strong> 브라우저에 표시됩니다.</li>
        <li>피부 분석, 메이크업 스타일, 제품 추천이 포함된 상세 리포트가 결제 시 입력한 이메일 주소로 <strong>자동 전송</strong>됩니다.</li>
        <li><strong>이메일 정확성:</strong> 결제 시 정확하고 수신 가능한 이메일 주소를 입력하는 것은 전적으로 이용자의 책임입니다. 잘못 입력된, 오타가 있는, 또는 접근할 수 없는 이메일 주소로 전송된 리포트에 대해 당사는 책임지지 않으며, <strong>환불되지 않습니다</strong>.</li>
        <li>결과는 현재 브라우저 세션에서도 확인 가능합니다. 페이지를 닫으면 브라우저 내 결과는 복구되지 않으므로, <strong>저장</strong> 또는 <strong>공유</strong> 기능을 사용하거나 이메일을 확인해 주십시오.</li>
      </ul>

      <h2>5. 청약철회 및 디지털 콘텐츠 동의 (EU/EEA/영국)</h2>
      <p>EU 소비자권리지침(2011/83/EU) 및 영국 소비자권리법 2015에 따라 온라인 구매에 대해 일반적으로 <strong>14일 청약철회권</strong>이 부여됩니다. 그러나 AI 분석을 개시하고 즉시 결과를 받음으로써 이용자는 다음에 동의합니다.</p>
      <ul>
        <li>철회 기간 만료 전 디지털 콘텐츠 서비스의 즉시 이행에 <strong>명시적으로 동의</strong>합니다.</li>
        <li>디지털 콘텐츠가 완전히 전달된 시점(결과가 브라우저에 표시되는 시점)에 청약철회권을 상실한다는 점을 <strong>인지</strong>합니다.</li>
      </ul>
      <p>기술적 오류로 결과가 제공되지 않을 경우 이용자의 법정 권리(환불 등)는 전적으로 보호됩니다.</p>

      <h2>6. 환불 정책</h2>
      <p>상세 내용은 별도 <a className="legal-link" href="/refund">환불 정책</a> 페이지를 참고해 주십시오. 요약:</p>
      <ul>
        <li>AI가 결과(이미지 또는 리포트)를 생성하지 못한 경우, 이용자의 별도 조치 없이 <strong>자동으로 전액 환불</strong>됩니다.</li>
        <li>결과가 정상적으로 전달된 이후에는 디지털 콘텐츠의 특성상 <strong>원칙적으로 환불이 불가능</strong>합니다.</li>
        <li>이용자가 잘못 입력한 이메일 주소로 리포트가 전송된 경우 환불되지 않습니다.</li>
        <li>환불은 Polar를 통해 처리됩니다.</li>
        <li><strong>각국 법률에 따른 법정 소비자 권리는 본 약관으로 제한되지 않습니다.</strong></li>
      </ul>

      <h2>7. 이용자 자격 및 책임</h2>
      <ul>
        <li>서비스 이용을 위해서는 <strong>만 16세 이상</strong>(또는 해당 관할지역의 디지털 동의 최소 연령 중 더 높은 연령)이어야 합니다. 만 18세 미만은 부모 또는 보호자의 동의를 받아야 합니다.</li>
        <li>EU/EEA 이용자: 최소 연령은 각 회원국의 GDPR(제8조) 시행에 따라 13~16세 범위입니다.</li>
        <li>대한민국 이용자: 개인정보 보호법(PIPA)에 따라 <strong>만 14세 이상</strong>이어야 합니다.</li>
        <li>본인의 사진 또는 명시적 동의를 받은 타인의 사진만 업로드해야 합니다.</li>
        <li>유해하거나, 불법적이거나, 기만적이거나, 공격적인 콘텐츠 생성에 서비스를 이용하지 않을 것에 동의합니다.</li>
        <li>업로드하는 콘텐츠가 제3자의 권리를 침해하지 않도록 할 책임은 이용자에게 있습니다.</li>
      </ul>

      <h2>8. 지식재산권</h2>
      <ul>
        <li><strong>이용자의 사진:</strong> 업로드한 사진의 소유권은 이용자에게 있습니다. 원본 이미지에 대한 권리를 당사가 주장하지 않습니다.</li>
        <li><strong>AI 생성 결과물:</strong> 메이크업 시뮬레이션 이미지는 OpenAI 모델이 생성합니다. 이용자는 결과물에 대해 개인적, 비독점적, 전 세계적 사용·저장·공유 라이선스를 부여받으며, 상업적 이용도 허용됩니다.</li>
        <li><strong>당사 콘텐츠:</strong> kissinskin 브랜드, 로고, 웹사이트 디자인 및 모든 원저작 콘텐츠는 kissinskin이 소유하며 관련 지식재산권법으로 보호됩니다.</li>
      </ul>

      <h2>9. AI 투명성 및 면책</h2>
      <ul>
        <li>AI가 생성한 메이크업 시뮬레이션은 <strong>예술적 근사치</strong>이며 실제 외모의 보장이 아닙니다.</li>
        <li>서비스는 자동화된 처리(OpenAI의 gpt-image-1.5 및 gpt-4.1 모델)를 사용합니다. 사람의 검토나 큐레이션은 없습니다.</li>
        <li>제품 추천은 피부 분석에 기반한 AI 제안이며, kissinskin은 어떠한 제품도 제조·판매·보증하지 않습니다.</li>
        <li>AI 추천에 따른 구매 결정에 대해 당사는 책임지지 않습니다.</li>
        <li>AI 결과는 사진 품질, 조명, 각도 등에 따라 달라질 수 있습니다.</li>
        <li>EU AI법(규정 2024/1689)에 따라 본 서비스가 AI 생성 콘텐츠를 사용함을 고지합니다. 생성된 이미지를 실제 사진과 혼동해서는 안 됩니다.</li>
      </ul>

      <h2>10. 책임 제한</h2>
      <p>서비스는 명시적 또는 묵시적 보증 없이 <strong>"있는 그대로" 및 "이용 가능한 상태로"</strong> 제공됩니다. 관련 법률이 허용하는 최대 한도에서:</p>
      <ul>
        <li>kissinskin은 간접적, 부수적, 특별, 결과적 또는 징벌적 손해에 대해 책임지지 않습니다.</li>
        <li>모든 청구에 대한 당사의 총 책임액은 해당 청구를 야기한 구체적 거래에 대해 이용자가 지급한 금액을 초과하지 않습니다.</li>
      </ul>
      <p><strong>다만 본 약관은 다음에 대한 책임을 배제·제한하지 않습니다.</strong></p>
      <ul>
        <li>고의 또는 중대한 과실에 의한 사망 또는 신체 상해</li>
        <li>사기 또는 사기적 허위 표시</li>
        <li>관련 강행 소비자보호법(EU, 영국, 호주, 대한민국, 브라질 등)상 배제 또는 제한할 수 없는 책임</li>
      </ul>

      <h2>11. 손해 배상</h2>
      <p>이용자는 본 약관 위반, 서비스 오용, 제3자 권리 침해로 인해 발생한 청구, 손해 또는 비용(합리적 변호사 비용 포함)으로부터 kissinskin을 면책하고 손해를 배상할 것에 동의합니다. 다만 해당 조항이 집행 불가능한 관할지역(예: EU/EEA, 호주 소비자)에는 적용되지 않습니다.</p>

      <h2>12. 서비스 가용성</h2>
      <ul>
        <li>24/7 가용성을 위해 노력하나 중단 없는 서비스를 보장하지는 않습니다.</li>
        <li>유지보수, 업데이트, 불가피한 사정으로 서비스를 일시 중단할 수 있습니다.</li>
        <li>합리적 사전 통지 후 서비스를 수정, 중단 또는 폐지할 권리를 보유합니다.</li>
      </ul>

      <h2>13. 금지 행위</h2>
      <p>이용자는 다음을 할 수 없습니다.</p>
      <ul>
        <li>서비스 소스 코드의 역공학, 디컴파일, 추출 시도</li>
        <li>봇, 스크래퍼 등 자동화 도구를 이용한 서비스 접근</li>
        <li>결제 우회 또는 무료 체험, 프로모션 남용</li>
        <li>불법, 음란, 타인의 권리를 침해하는 콘텐츠 업로드</li>
        <li>실존 인물을 사칭하는 딥페이크 또는 오도성 콘텐츠 생성</li>
        <li>승인 없이 서비스 자체를 재판매, 재배포, 상업적으로 이용</li>
      </ul>

      <h2>14. 해지 및 정지</h2>
      <ul>
        <li>약관 위반 시 통지 없이 즉시 접근을 정지하거나 해지할 수 있습니다.</li>
        <li>해지 시 서비스 이용 권리가 소멸합니다. 이미 전달된 결과물은 이용자가 계속 보관할 수 있습니다.</li>
        <li>그 성질상 존속되어야 할 조항(지식재산권, 책임 제한, 손해 배상, 준거법 등)은 해지 후에도 유효합니다.</li>
      </ul>

      <h2>15. 불가항력</h2>
      <p>kissinskin은 천재지변, 전쟁, 테러, 팬데믹, 정부 조치, 정전, 인터넷 장애, 제3자 서비스 장애(OpenAI, Polar 포함) 등 합리적 통제를 벗어난 사정으로 인한 이행 실패나 지연에 대해 책임지지 않습니다.</p>

      <h2>16. 준거법 및 분쟁 해결</h2>
      <ul>
        <li>본 약관은 국제사법 원칙을 배제하고 <strong>대한민국법</strong>에 따라 해석됩니다.</li>
        <li>분쟁은 우선 선의의 협상으로 해결하며, 필요한 경우 중재를 통해 해결합니다.</li>
        <li><strong>EU/EEA 소비자:</strong> 거주 국가 법원에서 소송을 제기할 수 있으며, 유럽 위원회 온라인 분쟁해결(ODR) 플랫폼(<a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">ec.europa.eu/consumers/odr</a>)을 이용할 권리가 있습니다.</li>
        <li><strong>영국 소비자:</strong> 거주지에 따라 영국, 스코틀랜드, 북아일랜드 법원에서 소송을 제기할 수 있습니다.</li>
        <li><strong>호주 소비자:</strong> 호주 소비자법(Competition and Consumer Act 2010 Schedule 2)상 계약으로 배제할 수 없는 소비자 보증, 권리, 구제책은 본 약관에 의해 제한되지 않습니다.</li>
        <li><strong>대한민국 소비자:</strong> 분쟁은 한국소비자원 또는 대한상사중재원에 제기할 수 있습니다.</li>
        <li><strong>브라질 소비자:</strong> PROCON 또는 <a href="https://www.consumidor.gov.br" target="_blank" rel="noopener noreferrer">consumidor.gov.br</a>에 민원을 제기할 수 있습니다.</li>
      </ul>

      <h2>17. 법정 소비자 권리</h2>
      <p>본 약관은 이용자의 관할지역 법령상 법정 소비자 권리를 제한할 의도가 없습니다. 본 약관의 조항이 관련 강행 소비자보호법과 충돌하는 경우 강행법이 우선합니다. 이에는 다음이 포함되나 이에 국한되지 않습니다.</p>
      <ul>
        <li>EU 소비자권리지침(2011/83/EU)</li>
        <li>영국 소비자권리법 2015</li>
        <li>호주 소비자법</li>
        <li>한국 소비자기본법 및 전자상거래법</li>
        <li>브라질 소비자보호법(CDC)</li>
        <li>캐나다 각 주의 소비자보호법</li>
        <li>일본 소비자계약법</li>
      </ul>

      <h2>18. 접근성</h2>
      <p>모든 이용자가 서비스를 이용할 수 있도록 노력합니다. 접근성 관련 문제가 발생한 경우 <strong>support@kissinskin.net</strong>으로 문의해 주시면 개선하도록 하겠습니다.</p>

      <h2>19. 분리 가능성</h2>
      <p>본 약관의 어느 조항이 관할 법원에 의해 무효, 위법 또는 집행 불가능한 것으로 판명되더라도 나머지 조항은 계속 유효합니다. 무효 조항은 유효하고 집행 가능하도록 필요한 최소한의 범위에서 수정됩니다.</p>

      <h2>20. 완전 합의</h2>
      <p>본 약관은 <a className="legal-link" href="/privacy">개인정보처리방침</a> 및 <a className="legal-link" href="/refund">환불 정책</a>과 함께 서비스 이용에 관한 이용자와 kissinskin 사이의 완전한 합의를 구성합니다. 이전의 합의, 소통, 이해는 본 약관으로 대체됩니다.</p>

      <h2>21. 약관 변경</h2>
      <p>본 약관은 언제든 갱신될 수 있습니다. 중요한 변경은 본 페이지에 갱신된 시행일과 함께 게시됩니다. 법률상 요구되는 경우 시행 전에 중요한 변경 사항을 통지합니다. 변경 후에도 계속 서비스를 이용하는 것은 변경된 약관에 대한 동의로 간주됩니다. 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단해 주십시오.</p>

      <h2>22. 문의</h2>
      <p>약관에 관한 문의:</p>
      <ul>
        <li>이메일: <strong>support@kissinskin.net</strong></li>
        <li>웹사이트: <a href="https://kissinskin.net" target="_blank" rel="noopener noreferrer">https://kissinskin.net</a></li>
      </ul>
    </>
  )
}

function TermsEn() {
  return (
    <>
      <p className="legal-date">Effective Date: March 8, 2026</p>

      <h2>1. Agreement to Terms</h2>
      <p>By accessing or using kissinskin (<a href="https://kissinskin.net" target="_blank" rel="noopener noreferrer">https://kissinskin.net</a>), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service. These Terms constitute a legally binding agreement between you and kissinskin.</p>

      <h2>2. Service Description</h2>
      <p>kissinskin is an AI-powered makeup simulation and beauty recommendation service. When you submit a photo, our AI generates:</p>
      <ul>
        <li>9 personalized makeup style previews applied to your face</li>
        <li>Skin type and tone analysis</li>
        <li>Customized cosmetic product recommendations</li>
      </ul>
      <p>Results are generated using OpenAI's image generation and language models, delivered instantly in your browser. The Service uses automated decision-making and AI processing; no human review is involved in generating results.</p>

      <h2>3. Payment & Billing</h2>
      <ul>
        <li>Each analysis is a <strong>one-time purchase of $2.99 USD</strong>. There are no subscriptions, recurring charges, or hidden fees.</li>
        <li>Payment is securely processed by <strong>Polar</strong> (<a href="https://polar.sh" target="_blank" rel="noopener noreferrer">polar.sh</a>), a Merchant of Record. Polar handles all billing, tax calculation, and payment processing on our behalf.</li>
        <li>Accepted payment methods include credit/debit cards and other methods supported by Polar.</li>
        <li>By completing a purchase, you authorize Polar to charge your selected payment method.</li>
        <li>Your payment receipt and invoice are provided by Polar. For billing inquiries, you may contact Polar directly or reach us at <strong>support@kissinskin.net</strong>.</li>
        <li>All prices are displayed in USD. Applicable taxes (VAT, GST, sales tax) may be added at checkout based on your location, as determined by Polar.</li>
      </ul>

      <h2>4. Delivery of Service</h2>
      <ul>
        <li>Results are delivered <strong>immediately</strong> after payment, directly in your browser.</li>
        <li>A detailed analysis report (including skin analysis, makeup styles, and product recommendations) is <strong>automatically sent via email</strong> to the email address you provided during checkout.</li>
        <li><strong>Email accuracy:</strong> It is your sole responsibility to provide a valid and accessible email address at checkout. We are not responsible for reports sent to incorrect, misspelled, or inaccessible email addresses. <strong>Refunds will not be issued</strong> for reports delivered to an incorrect email address.</li>
        <li>Results are also available in your current browser session. Once you close the page, browser results cannot be recovered. We recommend using the <strong>Save</strong> or <strong>Share</strong> feature, or checking your email for the report.</li>
      </ul>

      <h2>5. Right of Withdrawal & Digital Content Consent (EU/EEA/UK)</h2>
      <p>Under the EU Consumer Rights Directive (2011/83/EU) and UK Consumer Rights Act 2015, you normally have a <strong>14-day right of withdrawal</strong> for online purchases. However, by initiating the AI analysis and receiving instant results, you:</p>
      <ul>
        <li><strong>Expressly consent</strong> to the immediate performance of the digital content service before the withdrawal period expires.</li>
        <li><strong>Acknowledge</strong> that you lose your right of withdrawal once the digital content has been fully delivered (i.e., when results are displayed in your browser).</li>
      </ul>
      <p>This consent is obtained at the point of purchase. If the Service fails to deliver results due to a technical error, your statutory rights (including refund rights) remain fully protected.</p>

      <h2>6. Refund Policy</h2>
      <p>Please see our dedicated <a className="legal-link" href="/refund">Refund Policy</a> page for full details. In summary:</p>
      <ul>
        <li>If the AI fails to generate results (images or report), a <strong>full refund is automatically processed</strong> without any action required from you.</li>
        <li>Since results are delivered instantly as digital content, <strong>all sales are generally final</strong> once results are successfully delivered.</li>
        <li>Refunds are <strong>not</strong> issued for reports sent to an incorrect email address provided by you at checkout.</li>
        <li>Refund requests are processed through Polar.</li>
        <li><strong>Your statutory consumer rights under applicable local law are not affected.</strong></li>
      </ul>

      <h2>7. User Eligibility & Responsibilities</h2>
      <ul>
        <li>You must be at least <strong>16 years old</strong> to use this Service (or the minimum age of digital consent in your jurisdiction, whichever is higher). Users under 18 should have parental or guardian consent.</li>
        <li>For users in the EU/EEA: the minimum age is determined by your member state's implementation of the GDPR (Article 8), which ranges from 13 to 16.</li>
        <li>For users in South Korea: you must be at least <strong>14 years old</strong> per the Personal Information Protection Act (PIPA).</li>
        <li>You must only upload photos of yourself, or photos for which you have explicit consent from the person depicted.</li>
        <li>You agree not to use the Service to generate harmful, illegal, deceptive, or offensive content.</li>
        <li>You are responsible for ensuring your uploaded content does not violate any third-party rights.</li>
      </ul>

      <h2>8. Intellectual Property</h2>
      <ul>
        <li><strong>Your photos:</strong> You retain full ownership of photos you upload. We claim no rights over your original images.</li>
        <li><strong>AI-generated results:</strong> The makeup simulation images are generated by OpenAI's models. You are granted a personal, non-exclusive, worldwide license to use, save, and share your results. Commercial use of results is permitted.</li>
        <li><strong>Our content:</strong> The kissinskin brand, logo, website design, and all original content are owned by kissinskin and protected by applicable intellectual property laws.</li>
      </ul>

      <h2>9. AI Transparency & Disclaimer</h2>
      <ul>
        <li>AI-generated makeup simulations are <strong>artistic approximations</strong>, not guarantees of real-world appearance.</li>
        <li>The Service uses automated processing (OpenAI's gpt-image-1.5 and gpt-4.1 models) to generate results. No human reviews or curates the output.</li>
        <li>Product recommendations are AI-generated suggestions based on your skin analysis. kissinskin does not manufacture, sell, or endorse any recommended products.</li>
        <li>kissinskin is not liable for any purchasing decisions you make based on AI recommendations.</li>
        <li>AI results may vary based on photo quality, lighting, angle, and other factors.</li>
        <li>In compliance with the EU AI Act (Regulation 2024/1689), we disclose that this Service uses AI-generated content. Generated images should not be mistaken for real photographs.</li>
      </ul>

      <h2>10. Limitation of Liability</h2>
      <p>The Service is provided <strong>"as is" and "as available"</strong> without warranties of any kind, express or implied. To the maximum extent permitted by applicable law:</p>
      <ul>
        <li>kissinskin shall not be liable for any indirect, incidental, special, consequential, or punitive damages.</li>
        <li>Our total liability for any claim shall not exceed the amount you paid for the specific transaction giving rise to the claim.</li>
      </ul>
      <p><strong>Nothing in these Terms excludes or limits liability for:</strong></p>
      <ul>
        <li>Death or personal injury caused by negligence.</li>
        <li>Fraud or fraudulent misrepresentation.</li>
        <li>Any liability that cannot be excluded or limited under applicable law (including mandatory consumer protection laws in the EU, UK, Australia, South Korea, Brazil, or other jurisdictions).</li>
      </ul>

      <h2>11. Indemnification</h2>
      <p>You agree to indemnify and hold harmless kissinskin from any claims, damages, or expenses (including reasonable legal fees) arising from your violation of these Terms, your misuse of the Service, or your infringement of any third-party rights. This clause does not apply to consumers in jurisdictions where such indemnification clauses are unenforceable (e.g., EU/EEA, Australia).</p>

      <h2>12. Service Availability</h2>
      <ul>
        <li>We strive for 24/7 availability but do not guarantee uninterrupted service.</li>
        <li>We may temporarily suspend the Service for maintenance, updates, or circumstances beyond our control.</li>
        <li>We reserve the right to modify, suspend, or discontinue the Service at any time with reasonable notice.</li>
      </ul>

      <h2>13. Prohibited Uses</h2>
      <p>You may not:</p>
      <ul>
        <li>Reverse-engineer, decompile, or attempt to extract the source code of the Service.</li>
        <li>Use automated tools (bots, scrapers) to access the Service.</li>
        <li>Circumvent payment or abuse free trials or promotional offers.</li>
        <li>Upload content that is illegal, explicit, or violates others' rights.</li>
        <li>Use the Service to create deepfakes or misleading content that impersonates real individuals.</li>
        <li>Resell, redistribute, or commercially exploit the Service itself without authorization.</li>
      </ul>

      <h2>14. Termination & Suspension</h2>
      <ul>
        <li>We may suspend or terminate your access to the Service immediately if you violate these Terms.</li>
        <li>Upon termination, your right to use the Service ceases. Any results already delivered remain yours to keep.</li>
        <li>Sections that by their nature should survive termination (including Intellectual Property, Limitation of Liability, Indemnification, Governing Law) shall survive.</li>
      </ul>

      <h2>15. Force Majeure</h2>
      <p>kissinskin shall not be liable for any failure or delay in performance due to circumstances beyond our reasonable control, including but not limited to natural disasters, war, terrorism, pandemics, government actions, power failures, internet disruptions, or third-party service outages (including OpenAI or Polar).</p>

      <h2>16. Governing Law & Dispute Resolution</h2>
      <ul>
        <li>These Terms are governed by the laws of the Republic of Korea, without regard to conflict of law principles.</li>
        <li>Any disputes shall be resolved through good-faith negotiation first, then through arbitration if necessary.</li>
        <li><strong>EU/EEA consumers:</strong> You may also bring proceedings in the courts of your country of residence. You have the right to use the European Commission's Online Dispute Resolution (ODR) platform at <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr</a>.</li>
        <li><strong>UK consumers:</strong> You may bring proceedings in the courts of England and Wales, Scotland, or Northern Ireland, depending on where you live.</li>
        <li><strong>Australian consumers:</strong> Nothing in these Terms excludes, restricts, or modifies any consumer guarantee, right, or remedy under the Australian Consumer Law (Schedule 2 of the Competition and Consumer Act 2010) that cannot be excluded, restricted, or modified by agreement.</li>
        <li><strong>South Korean consumers:</strong> Disputes may be submitted to the Korea Consumer Agency or the Korea Commercial Arbitration Board.</li>
        <li><strong>Brazilian consumers:</strong> You may file a complaint with PROCON or use the platform at <a href="https://www.consumidor.gov.br" target="_blank" rel="noopener noreferrer">consumidor.gov.br</a>.</li>
      </ul>

      <h2>17. Statutory Consumer Rights</h2>
      <p>Nothing in these Terms is intended to limit your statutory rights as a consumer under the laws of your jurisdiction. Where any provision of these Terms conflicts with mandatory consumer protection laws applicable to you, the mandatory law shall prevail. This includes but is not limited to:</p>
      <ul>
        <li>EU Consumer Rights Directive (2011/83/EU)</li>
        <li>UK Consumer Rights Act 2015</li>
        <li>Australian Consumer Law</li>
        <li>Korean Consumer Protection Act & Electronic Commerce Act</li>
        <li>Brazilian Consumer Defense Code (CDC)</li>
        <li>Canadian Consumer Protection Acts (provincial)</li>
        <li>Japanese Consumer Contract Act</li>
      </ul>

      <h2>18. Accessibility</h2>
      <p>We are committed to making our Service accessible to all users. If you experience any accessibility barriers, please contact us at <strong>support@kissinskin.net</strong> and we will work to address your needs.</p>

      <h2>19. Severability</h2>
      <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect. The invalid provision shall be modified to the minimum extent necessary to make it valid and enforceable.</p>

      <h2>20. Entire Agreement</h2>
      <p>These Terms, together with our <a className="legal-link" href="/privacy">Privacy Policy</a> and <a className="legal-link" href="/refund">Refund Policy</a>, constitute the entire agreement between you and kissinskin regarding the use of the Service. Any prior agreements, communications, or understandings are superseded.</p>

      <h2>21. Changes to Terms</h2>
      <p>We may update these Terms at any time. Material changes will be posted on this page with an updated effective date. Where required by law, we will notify you of material changes before they take effect. Your continued use of the Service after changes constitutes acceptance. If you do not agree with the updated Terms, you should discontinue use of the Service.</p>

      <h2>22. Contact Us</h2>
      <p>For any questions about these Terms:</p>
      <ul>
        <li>Email: <strong>support@kissinskin.net</strong></li>
        <li>Website: <a href="https://kissinskin.net" target="_blank" rel="noopener noreferrer">https://kissinskin.net</a></li>
      </ul>
    </>
  )
}
