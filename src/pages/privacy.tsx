import './policy.css'
import { useI18n } from '../i18n/I18nContext'

type Page = 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact'

interface PrivacyProps {
  onNavigate?: (page: Page) => void
}

export default function Privacy({ onNavigate }: PrivacyProps) {
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
        <h1>{locale === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}</h1>
        <button
          className="legal-lang"
          onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
          aria-label="Switch language"
        >
          {locale === 'ko' ? 'EN' : '한국어'}
        </button>
      </div>
      <div className="legal-content">
        {locale === 'ko' ? <PrivacyKo /> : <PrivacyEn />}
      </div>
    </div>
  )
}

function PrivacyKo() {
  return (
    <>
      <p className="legal-date">시행일: 2026년 3월 8일 · 최종 개정: 2026년 5월 2일</p>

      <h2>1. 서문</h2>
      <p>kissinskin("당사")은 <a href="https://kissinskin.net" target="_blank" rel="noopener noreferrer">https://kissinskin.net</a> 웹사이트를 운영합니다. 본 개인정보처리방침은 AI 메이크업 분석 서비스("서비스") 이용 시 이용자의 정보를 어떻게 수집, 이용, 보호, 공개하는지 설명합니다.</p>
      <p>당사는 EU 일반개인정보보호법(GDPR), UK GDPR, 미국 캘리포니아 소비자 프라이버시법(CCPA/CPRA), 브라질 LGPD, 대한민국 개인정보 보호법(PIPA), 캐나다 PIPEDA, 일본 개인정보보호법(APPI), 호주 프라이버시법 1988 등 전 세계 데이터 보호법 준수를 약속합니다.</p>

      <h2>2. 개인정보 관리자</h2>
      <p>서비스를 통해 처리되는 개인정보에 대한 관리자는 kissinskin입니다. 결제 관련 데이터는 <strong>Polar</strong>가 독립적인 관리자로서 책임집니다.</p>
      <ul>
        <li>개인정보 관리자: kissinskin</li>
        <li>문의: <strong>support@kissinskin.net</strong></li>
        <li>웹사이트: <a href="https://kissinskin.net" target="_blank" rel="noopener noreferrer">https://kissinskin.net</a></li>
      </ul>

      <h2>3. 수집하는 정보</h2>

      <h3>3.1 업로드한 사진 (생체/얼굴 데이터)</h3>
      <ul>
        <li>서비스 이용 시 AI 분석을 위해 얼굴 사진을 업로드합니다.</li>
        <li>사진은 처리를 위해 <strong>OpenAI API</strong>로 전송되며, <strong>당사 서버에 저장되지 않습니다</strong>.</li>
        <li>사진은 실시간 메모리에서 처리되며 결과 생성 후 <strong>즉시 폐기</strong>됩니다.</li>
        <li>당사는 사진을 어떠한 형태로도 보관, 보존, 백업하지 않습니다.</li>
        <li><strong>생체 데이터 고지:</strong> 얼굴 사진은 일부 법률(예: 미국 일리노이 BIPA, 텍사스 CUBI, 워싱턴주 법)상 생체 데이터에 해당할 수 있습니다. 당사는 사진에서 생체 식별자 또는 템플릿을 추출, 저장, 생성하지 않습니다. 사진은 오직 AI 메이크업 시뮬레이션 생성 목적으로만 사용되며 보관되지 않습니다.</li>
      </ul>

      <h3>3.2 결제 정보</h3>
      <ul>
        <li>모든 결제 처리는 <strong>Polar</strong>(<a href="https://polar.sh" target="_blank" rel="noopener noreferrer">polar.sh</a>)가 Merchant of Record 자격으로 수행합니다.</li>
        <li>당사는 신용카드 번호, CVV, 전체 청구 세부사항을 <strong>수신·열람·저장하지 않습니다</strong>.</li>
        <li>Polar가 거래 처리에 필요한 결제 정보(카드 정보, 청구 주소, 이메일)를 수집합니다. 해당 데이터는 <a href="https://polar.sh/legal/privacy" target="_blank" rel="noopener noreferrer">Polar의 개인정보처리방침</a>의 적용을 받습니다.</li>
        <li>당사는 Polar로부터 거래 확인, 주문 금액, 고객 지원용 참조 ID를 전달받을 수 있습니다.</li>
      </ul>

      <h3>3.3 자동 수집 데이터 · 쿠키 · 광고</h3>
      <p>당사는 사이트 운영, 측정, 광고 게재를 위해 다음 제3자 서비스의 쿠키와 유사 기술(localStorage, 픽셀)을 사용합니다. EU/EEA·영국 이용자에게는 <strong>Google Consent Mode v2</strong>가 적용되어, 쿠키 배너에서 "모두 동의"를 선택하기 전까지 광고/분석 쿠키는 비활성 상태로 유지됩니다.</p>
      <table className="legal-table">
        <thead>
          <tr><th>서비스</th><th>목적</th><th>쿠키/저장소</th><th>보관 기간</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Google AdSense</strong> (ca-pub-5109067049933124)</td>
            <td>본 사이트의 무료 콘텐츠 운영 비용 충당을 위한 광고 게재 및 측정</td>
            <td>제3자 쿠키 (`__gads`, `__gpi`, `IDE`, `ANID` 등) — google.com / doubleclick.net 도메인 발행</td>
            <td>최대 13개월</td>
          </tr>
          <tr>
            <td><strong>Google Analytics 4</strong> (G-JJ7G39W5T3)</td>
            <td>익명 트래픽 분석 및 사이트 개선</td>
            <td>자체 쿠키 (`_ga`, `_ga_*`) — kissinskin.net 도메인</td>
            <td>최대 14개월</td>
          </tr>
          <tr>
            <td><strong>Microsoft Clarity</strong> (w5fx3z4rfg)</td>
            <td>익명 사용성 분석 (히트맵·스크롤 패턴). 텍스트는 마스킹되어 전송</td>
            <td>자체 + 제3자 쿠키 (`_clck`, `_clsk`, `MUID` 등)</td>
            <td>최대 1년</td>
          </tr>
          <tr>
            <td><strong>Cloudflare</strong></td>
            <td>호스팅·CDN·보안(봇 방지)</td>
            <td>엄격히 필요한 기술 쿠키 (`__cf_bm` 등)</td>
            <td>세션 또는 30분</td>
          </tr>
          <tr>
            <td><strong>kissinskin (자체)</strong></td>
            <td>쿠키 동의 결정·언어 설정 저장</td>
            <td>localStorage (`kissinskin_cookie_consent`, `kissinskin_locale`)</td>
            <td>이용자가 삭제할 때까지</td>
          </tr>
        </tbody>
      </table>
      <p><strong>Google AdSense 광고:</strong> 본 사이트는 제3자 공급업체인 Google이 본 사이트와 다른 사이트에서의 이용자의 방문 정보에 기반해 광고를 게재할 수 있도록 허용합니다. Google은 광고 쿠키를 통해 광고를 게재합니다. 이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google 광고 설정</a>에서 맞춤 광고를 거부할 수 있으며, <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info</a> 또는 <a href="https://youronlinechoices.eu" target="_blank" rel="noopener noreferrer">youronlinechoices.eu</a>(EU)에서 일부 제3자 공급업체의 맞춤 광고를 거부할 수 있습니다.</p>
      <p><strong>동의 변경:</strong> 쿠키 동의는 브라우저 저장소를 비우거나 사이트 데이터를 삭제하면 다시 표시됩니다. EU/EEA·영국 이용자는 동의 전까지 Google AdSense가 비개인화(non-personalized) 광고만 게재하도록 설정되어 있습니다.</p>
      <p><strong>쿠팡 파트너스 어필리에이트 링크:</strong> 추천 제품 카드 일부에 쿠팡 어필리에이트 링크가 포함되어 있으며 <code>rel="sponsored"</code>로 표기됩니다. 해당 링크를 <strong>클릭한 시점에만</strong> 쿠팡 도메인(<code>link.coupang.com</code>, <code>coupang.com</code>)이 자체 트래킹 쿠키(예: <code>OVERSEAS_GUEST_COUNTRY</code>, <code>X-CP-PG-NID</code>)를 발행합니다. 이러한 쿠키는 kissinskin.net이 발행하지 않으며 당사는 해당 데이터에 접근할 수 없습니다. 어필리에이트 수익은 추천 선정에 영향을 주지 않습니다. 자세한 내용은 <a href="https://partners.coupang.com" target="_blank" rel="noopener noreferrer">쿠팡 파트너스</a> 정책을 참고하세요.</p>

      <h2>4. 처리의 법적 근거 (GDPR 제6조)</h2>
      <p>EU/EEA 및 영국 이용자에 대해 당사는 다음 법적 근거에 따라 데이터를 처리합니다.</p>
      <table className="legal-table">
        <thead>
          <tr><th>처리 활동</th><th>법적 근거</th><th>GDPR 조항</th></tr>
        </thead>
        <tbody>
          <tr><td>AI 분석을 위한 사진 처리</td><td>이용자의 명시적 동의 (능동 업로드·제출)</td><td>제6조(1)(a), 제9조(2)(a)</td></tr>
          <tr><td>결제 처리</td><td>계약 이행</td><td>제6조(1)(b)</td></tr>
          <tr><td>익명 분석 (Cloudflare)</td><td>정당한 이익 (서비스 개선)</td><td>제6조(1)(f)</td></tr>
          <tr><td>고객 문의 대응</td><td>계약 이행 / 정당한 이익</td><td>제6조(1)(b), 제6조(1)(f)</td></tr>
          <tr><td>법적 준수</td><td>법적 의무</td><td>제6조(1)(c)</td></tr>
        </tbody>
      </table>

      <h2>5. 정보 이용 방식</h2>
      <table className="legal-table">
        <thead>
          <tr><th>데이터</th><th>목적</th><th>보관 기간</th></tr>
        </thead>
        <tbody>
          <tr><td>업로드한 사진</td><td>AI 메이크업 분석 생성</td><td>미보관 (실시간 처리 후 즉시 삭제)</td></tr>
          <tr><td>분석 결과</td><td>브라우저 표시</td><td>브라우저 세션 한정 (서버 미저장)</td></tr>
          <tr><td>결제 정보</td><td>Polar를 통한 결제 처리</td><td>Polar 보관 정책에 따름</td></tr>
          <tr><td>거래 참조</td><td>고객 지원</td><td>최대 12개월 또는 세무/회계법이 요구하는 기간</td></tr>
          <tr><td>익명 분석</td><td>서비스 품질 개선</td><td>집계·개인정보 미포함, Cloudflare 관리</td></tr>
        </tbody>
      </table>

      <h2>6. 자동화된 의사결정 및 프로파일링</h2>
      <p>GDPR 제22조에 따라:</p>
      <ul>
        <li>서비스는 메이크업 시뮬레이션 및 피부 분석 리포트 생성을 위해 <strong>자동화된 처리</strong>(OpenAI 모델)를 사용합니다.</li>
        <li>이 자동 처리는 <strong>예술적/화장적 성격</strong>의 결과를 생성하며, 법적 효과나 이에 준하는 중대한 영향을 발생시키지 않습니다.</li>
        <li>당사는 이용자의 데이터를 프로파일링, 타겟 광고, 신용 평가 또는 법적·중대한 영향을 미치는 의사결정에 <strong>이용하지 않습니다</strong>.</li>
        <li>본 자동 처리의 법적 근거는 사진 업로드 및 분석 개시 시 제공된 이용자의 명시적 동의입니다.</li>
      </ul>

      <h2>7. 제3자 서비스 및 처리자</h2>
      <p>당사는 다음 제3자 서비스를 이용하며, 각 서비스는 자체 개인정보처리방침을 가집니다.</p>
      <table className="legal-table">
        <thead>
          <tr><th>서비스</th><th>역할</th><th>목적</th><th>전송 데이터</th><th>위치</th><th>개인정보처리방침</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>OpenAI</strong></td><td>처리자</td><td>AI 이미지 생성 및 텍스트 분석</td><td>업로드 사진 (일시적)</td><td>미국</td><td><a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">openai.com/privacy</a></td></tr>
          <tr><td><strong>Polar</strong></td><td>독립 관리자</td><td>결제 처리 (MoR)</td><td>결제 및 청구 정보</td><td>미국 / EU</td><td><a href="https://polar.sh/legal/privacy" target="_blank" rel="noopener noreferrer">polar.sh/legal/privacy</a></td></tr>
          <tr><td><strong>Cloudflare</strong></td><td>처리자</td><td>웹사이트 호스팅, CDN, 보안</td><td>익명 분석, IP (일시적)</td><td>글로벌 (엣지 네트워크)</td><td><a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">cloudflare.com/privacy</a></td></tr>
        </tbody>
      </table>
      <p><strong>중요:</strong> OpenAI의 API 데이터 이용 정책에 따르면 API를 통해 전송된 데이터는 <strong>모델 학습에 사용되지 않습니다</strong>. 이용자 사진은 OpenAI 또는 당사에 의해 AI 학습에 사용되지 않습니다.</p>

      <h2>8. 국경 간 데이터 이전</h2>
      <p>데이터는 거주 국가 외 국가(미국 포함)로 이전·처리될 수 있습니다. 당사는 적절한 보호 장치를 마련합니다.</p>
      <ul>
        <li><strong>EU/EEA → 미국:</strong> OpenAI 및 Polar로의 이전은 EU 집행위원회가 채택한 표준계약조항(SCC) 및/또는 해당하는 경우 EU-미국 데이터 프라이버시 프레임워크로 보호됩니다.</li>
        <li><strong>영국:</strong> 이전은 UK 국제데이터이전협약(IDTA) 또는 EU SCC에 대한 UK 부록으로 보호됩니다.</li>
        <li><strong>대한민국:</strong> 국경 간 이전은 개인정보 보호법 제17조 요구사항을 준수합니다. 서비스 이용에 대한 동의는 명시된 목적의 국경 간 데이터 이전에 대한 동의에 해당합니다.</li>
        <li><strong>브라질:</strong> LGPD 제33조에 따라 동의 및 적절한 보호 장치 기반으로 이전됩니다.</li>
        <li><strong>일본:</strong> APPI 요구사항을 준수하여 적절한 보호 장치와 함께 이전됩니다.</li>
        <li>당사는 사진 또는 개인정보를 서버에 저장하지 않으므로, 실제 데이터 이전은 일시적이며 API 처리 시간에 한정됩니다.</li>
      </ul>

      <h2>9. 수집하지 않는 데이터</h2>
      <ul>
        <li>이름, 전화번호, 주소를 직접 수집하지 않습니다(결제 시 Polar에 제공되는 경우, 분석 리포트 발송용 이메일 입력 시 제외).</li>
        <li>사용자 계정이나 프로필을 강제 생성하지 않습니다.</li>
        <li>업로드한 사진을 AI 모델 학습에 이용하지 않습니다 — OpenAI API 사용 시 학습 비활용 옵션이 적용됩니다.</li>
        <li>생체 식별자(얼굴 임베딩 벡터·해시·템플릿)를 생성하거나 저장하지 않습니다.</li>
        <li>당사 자체적으로는 개인정보를 판매·대여하지 않습니다. 다만 Google AdSense를 통해 게재되는 광고는 Google이 자체 정책에 따라 이용자의 일반 인구 통계 추정치를 활용할 수 있으며, 이용자는 <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google 광고 설정</a>에서 거부할 수 있습니다.</li>
      </ul>

      <h2>10. 데이터 보안</h2>
      <ul>
        <li>모든 데이터 전송은 <strong>HTTPS/TLS</strong>(TLS 1.2 이상)로 암호화됩니다.</li>
        <li>사진은 브라우저에서 당사의 안전한 서버리스 함수를 거쳐 OpenAI API로 직접 전송됩니다 — 중간 저장이 없습니다.</li>
        <li>인프라는 <strong>Cloudflare Workers</strong>(서버리스)에서 실행되므로 데이터가 저장되거나 접근될 수 있는 영구 서버가 존재하지 않습니다.</li>
        <li>무단 접근, 변경, 공개 또는 파기로부터 데이터를 보호하기 위한 적절한 기술적·조직적 조치를 구현합니다.</li>
      </ul>

      <h2>11. 데이터 유출 통지</h2>
      <p>개인정보가 관련된 유출 사고 발생 시(가능성은 낮으나):</p>
      <ul>
        <li><strong>EU/EEA (GDPR):</strong> 사실 인지 후 72시간 이내에 감독기관에 통지합니다(제33조). 이용자의 권리와 자유에 높은 위험이 있는 경우 지체 없이 개인에게도 통지합니다(제34조).</li>
        <li><strong>영국:</strong> 72시간 이내에 정보위원회(ICO)에 통지합니다.</li>
        <li><strong>대한민국 (PIPA):</strong> 영향받는 개인 및 개인정보보호위원회(PIPC)에 지체 없이 통지합니다.</li>
        <li><strong>브라질 (LGPD):</strong> 국가데이터보호청(ANPD) 및 영향받는 개인에게 통지합니다.</li>
        <li><strong>캘리포니아 (CCPA):</strong> Cal. Civ. Code § 1798.82 요구에 따라 영향받는 주민에게 통지합니다.</li>
        <li><strong>캐나다 (PIPEDA):</strong> 실질적 피해 위험이 있는 유출의 경우 캐나다 프라이버시 커미셔너 및 영향받는 개인에게 통지합니다.</li>
        <li><strong>호주:</strong> Notifiable Data Breaches scheme에 따라 OAIC 및 영향받는 개인에게 통지합니다.</li>
      </ul>

      <h2>12. 이용자의 권리</h2>

      <h3>12.1 모든 이용자의 권리</h3>
      <p>거주 지역과 무관하게 이용자는 다음 권리를 가집니다.</p>
      <ul>
        <li><strong>열람:</strong> 당사가 보유한 이용자 데이터를 확인할 수 있습니다(상기한 바와 같이 사실상 없음).</li>
        <li><strong>삭제:</strong> 모든 데이터의 삭제를 요청할 수 있습니다. 사진 및 개인정보를 저장하지 않으므로 주로 Polar가 보관하는 결제 기록에 해당합니다.</li>
        <li><strong>이동:</strong> 데이터를 이동 가능한 형식으로 요청할 수 있습니다.</li>
        <li><strong>처리 반대:</strong> 데이터 처리에 반대할 수 있습니다.</li>
        <li><strong>동의 철회:</strong> 언제든 동의를 철회할 수 있습니다. 철회 이전 처리의 적법성에는 영향을 주지 않습니다.</li>
      </ul>

      <h3>12.2 EU/EEA 이용자 (GDPR)</h3>
      <p>위 권리에 더해 다음 권리를 가집니다.</p>
      <ul>
        <li><strong>정정:</strong> 부정확한 개인정보의 수정 (제16조)</li>
        <li><strong>제한:</strong> 특정 상황에서 처리 제한 요청 (제18조)</li>
        <li><strong>정당한 이익 처리 반대:</strong> 정당한 이익 기반 처리에 반대 (제21조)</li>
        <li><strong>자동화된 의사결정 배제:</strong> 자동 처리에 관한 권리 (제22조) — 상기 제6조 참조</li>
        <li><strong>민원 제기:</strong> 거주지 데이터보호당국(DPA)에 민원을 제기할 권리. EU DPA 목록: <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer">edpb.europa.eu</a></li>
      </ul>

      <h3>12.3 대한민국 이용자 (PIPA)</h3>
      <ul>
        <li>개인정보 보호법에 따라 개인정보 열람, 정정, 삭제 및 처리 정지 요구권을 가집니다.</li>
        <li>당사는 목적 달성 시 개인정보를 파기할 의무를 준수합니다 — 사진은 처리 즉시 파기됩니다.</li>
        <li><strong>개인정보보호위원회(PIPC)</strong>(<a href="https://www.pipc.go.kr" target="_blank" rel="noopener noreferrer">pipc.go.kr</a>)에 민원을 제기할 수 있습니다.</li>
        <li>한국인터넷진흥원(KISA) 개인정보침해신고센터(privacy.kisa.or.kr)를 통해서도 분쟁 해결이 가능합니다.</li>
      </ul>

      <h3>12.4 영국 이용자 (UK GDPR)</h3>
      <ul>
        <li>UK GDPR 및 데이터보호법 2018에 따라 EU 이용자와 동등한 권리를 가집니다.</li>
        <li><strong>정보위원회(ICO)</strong>(<a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>)에 민원을 제기할 수 있습니다.</li>
      </ul>

      <h3>12.5 캘리포니아 이용자 (CCPA/CPRA)</h3>
      <ul>
        <li><strong>알 권리:</strong> 지난 12개월 수집된 개인정보 카테고리 및 구체적 항목 공개 요청.</li>
        <li><strong>삭제권:</strong> 개인정보 삭제 요청.</li>
        <li><strong>정정권:</strong> 부정확한 개인정보 정정 요청.</li>
        <li><strong>판매/공유 거부권:</strong> 당사는 CCPA/CPRA 정의상 개인정보를 <strong>판매하거나 공유하지 않습니다</strong>. 별도 거부 요청이 필요하지 않습니다.</li>
        <li><strong>비차별:</strong> CCPA/CPRA 권리 행사로 인한 차별을 받지 않습니다.</li>
        <li><strong>권한 있는 대리인:</strong> 대리인을 지정하여 요청할 수 있습니다.</li>
        <li>당사는 확인 가능한 소비자 요청에 <strong>45일 이내</strong> 대응합니다.</li>
      </ul>

      <h3>12.6 브라질 이용자 (LGPD) / 캐나다 이용자 (PIPEDA) / 일본 이용자 (APPI) / 호주 이용자 (Privacy Act 1988)</h3>
      <ul>
        <li><strong>브라질:</strong> LGPD상 확인, 열람, 정정, 익명화, 이동, 삭제, 공유 정보, 동의 철회 권리. <strong>ANPD</strong>에 민원 가능.</li>
        <li><strong>캐나다:</strong> PIPEDA상 접근, 정확성 이의제기, 동의 철회 권리. <strong>OPC</strong>(<a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer">priv.gc.ca</a>)에 민원 가능.</li>
        <li><strong>일본:</strong> APPI상 공개, 정정, 이용 정지, 삭제 요청 권리. <strong>PPC</strong>에 민원 가능.</li>
        <li><strong>호주:</strong> 호주 프라이버시 원칙(APP)상 접근 및 정정 권리. <strong>OAIC</strong>(<a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">oaic.gov.au</a>)에 민원 가능.</li>
      </ul>

      <p>권리 행사: <strong>support@kissinskin.net</strong>으로 문의해 주십시오. 관련 법률이 요구하는 기간(일반적으로 30일, CCPA의 경우 45일) 내에 답변드립니다.</p>

      <h2>13. 아동 개인정보</h2>
      <ul>
        <li>본 서비스는 <strong>만 16세 미만</strong>(또는 관할지역의 최소 연령) 아동을 대상으로 하지 않습니다.</li>
        <li>당사는 만 16세 미만(미국 COPPA상 만 13세 미만)의 데이터를 고의로 수집하지 않습니다.</li>
        <li>아동이 서비스를 이용했다고 판단되면 문의해 주시고, 잘못 수집된 데이터를 삭제하는 등 적절한 조치를 취하겠습니다.</li>
        <li>EU/EEA의 최소 연령은 GDPR 제8조에 따라 회원국별로 13~16세 범위입니다.</li>
        <li>대한민국의 최소 연령은 개인정보 보호법상 만 14세입니다.</li>
      </ul>

      <h2>14. Do Not Track (DNT) 신호</h2>
      <p>당사 서비스는 제3자 웹사이트에서 이용자를 추적하지 않으므로 Do Not Track(DNT) 신호에 응답하지 않습니다. 당사는 어떠한 교차 사이트 추적에도 관여하지 않습니다.</p>

      <h2>15. 데이터 보관 및 파기</h2>
      <ul>
        <li><strong>사진:</strong> 미보관. AI 처리 완료 즉시 파기.</li>
        <li><strong>분석 결과:</strong> 브라우저 세션에만 존재. 서버 미저장.</li>
        <li><strong>거래 참조:</strong> 고객 지원 및 법률/세무 준수를 위해 최대 12개월 보관 후 삭제.</li>
        <li><strong>결제 데이터:</strong> Polar의 데이터 보관 정책 및 관련 금융 규정에 따라 Polar가 보관.</li>
        <li>PIPA(대한민국), LGPD(브라질) 및 기타 관련법의 데이터 파기 요구사항을 준수합니다.</li>
      </ul>

      <h2>16. 방침 변경</h2>
      <p>본 개인정보처리방침은 수시로 갱신될 수 있습니다. 중요한 변경 사항은 상단에 갱신된 시행일과 함께 반영됩니다. 법률(GDPR, PIPA 등)이 요구하는 경우 시행 전 중요 변경을 통지합니다. 변경 후에도 서비스를 계속 이용하는 것은 변경에 대한 동의로 간주됩니다.</p>

      <h2>17. 문의</h2>
      <p>개인정보 관련 질문, 데이터 요청 또는 권리 행사:</p>
      <ul>
        <li>이메일: <strong>support@kissinskin.net</strong></li>
        <li>웹사이트: <a href="https://kissinskin.net" target="_blank" rel="noopener noreferrer">https://kissinskin.net</a></li>
      </ul>
      <p>모든 개인정보 관련 문의에 <strong>30일 이내</strong>(또는 관련 지역법이 요구하는 기간 내) 답변드립니다.</p>
    </>
  )
}

function PrivacyEn() {
  return (
    <>
      <p className="legal-date">Effective Date: March 8, 2026 · Last updated: May 2, 2026</p>

      <h2>1. Introduction</h2>
      <p>kissinskin ("we", "our", "us") operates the website <a href="https://kissinskin.net" target="_blank" rel="noopener noreferrer">https://kissinskin.net</a>. This Privacy Policy explains how we collect, use, protect, and disclose your information when you use our AI makeup analysis service ("Service").</p>
      <p>We are committed to protecting your privacy and complying with applicable data protection laws worldwide, including the EU General Data Protection Regulation (GDPR), UK GDPR, California Consumer Privacy Act (CCPA/CPRA), Brazil's Lei Geral de Proteção de Dados (LGPD), South Korea's Personal Information Protection Act (PIPA), Canada's Personal Information Protection and Electronic Documents Act (PIPEDA), Japan's Act on the Protection of Personal Information (APPI), and the Australian Privacy Act 1988.</p>

      <h2>2. Data Controller</h2>
      <p>kissinskin is the data controller responsible for your personal data processed through the Service. For payment-related data, <strong>Polar</strong> acts as an independent data controller.</p>
      <ul>
        <li>Data Controller: kissinskin</li>
        <li>Contact: <strong>support@kissinskin.net</strong></li>
        <li>Website: <a href="https://kissinskin.net" target="_blank" rel="noopener noreferrer">https://kissinskin.net</a></li>
      </ul>

      <h2>3. Information We Collect</h2>

      <h3>3.1 Photos You Upload (Biometric/Facial Data)</h3>
      <ul>
        <li>When you use our Service, you upload a facial photo for AI analysis.</li>
        <li>Your photo is sent to <strong>OpenAI's API</strong> for processing and is <strong>not stored on our servers</strong>.</li>
        <li>Photos are processed in real-time memory and <strong>discarded immediately</strong> after your analysis results are generated.</li>
        <li>We do not keep, archive, or back up your photos in any form.</li>
        <li><strong>Biometric data notice:</strong> Your facial photo may constitute biometric data under certain laws (e.g., Illinois BIPA, Texas CUBI, Washington state law). We do not extract, store, or create biometric identifiers or templates from your photos. The photo is used solely for the purpose of generating AI makeup simulations and is not retained.</li>
      </ul>

      <h3>3.2 Payment Information</h3>
      <ul>
        <li>All payment processing is handled by <strong>Polar</strong> (<a href="https://polar.sh" target="_blank" rel="noopener noreferrer">polar.sh</a>), acting as our Merchant of Record.</li>
        <li>We <strong>never</strong> receive, see, or store your credit card number, CVV, or full billing details.</li>
        <li>Polar collects the necessary payment information (card details, billing address, email) to process your transaction. This data is subject to <a href="https://polar.sh/legal/privacy" target="_blank" rel="noopener noreferrer">Polar's Privacy Policy</a>.</li>
        <li>We may receive from Polar: transaction confirmation, order amount, and a reference ID for customer support purposes.</li>
      </ul>

      <h3>3.3 Automatically Collected Data, Cookies, and Advertising</h3>
      <p>We use the following third-party services with cookies and similar technologies (localStorage, pixels) to operate the site, measure traffic, and serve ads. EU/EEA and UK visitors are protected by <strong>Google Consent Mode v2</strong>: advertising and analytics cookies remain disabled until you click "Accept all" on the cookie banner.</p>
      <table className="legal-table">
        <thead>
          <tr><th>Service</th><th>Purpose</th><th>Cookies / Storage</th><th>Retention</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Google AdSense</strong> (ca-pub-5109067049933124)</td>
            <td>Ads that fund the free content on this site, plus related measurement</td>
            <td>Third-party cookies (`__gads`, `__gpi`, `IDE`, `ANID`, etc.) issued by google.com / doubleclick.net</td>
            <td>Up to 13 months</td>
          </tr>
          <tr>
            <td><strong>Google Analytics 4</strong> (G-JJ7G39W5T3)</td>
            <td>Anonymous traffic analysis to improve the site</td>
            <td>First-party cookies (`_ga`, `_ga_*`) on kissinskin.net</td>
            <td>Up to 14 months</td>
          </tr>
          <tr>
            <td><strong>Microsoft Clarity</strong> (w5fx3z4rfg)</td>
            <td>Anonymous usability analysis (heatmaps, scroll patterns); text content is masked before transmission</td>
            <td>First- and third-party cookies (`_clck`, `_clsk`, `MUID`, etc.)</td>
            <td>Up to 1 year</td>
          </tr>
          <tr>
            <td><strong>Cloudflare</strong></td>
            <td>Hosting, CDN, security (bot protection)</td>
            <td>Strictly necessary technical cookies (`__cf_bm`, etc.)</td>
            <td>Session or 30 minutes</td>
          </tr>
          <tr>
            <td><strong>kissinskin (first-party)</strong></td>
            <td>Stores cookie-consent decision and language preference</td>
            <td>localStorage (`kissinskin_cookie_consent`, `kissinskin_locale`)</td>
            <td>Until you clear it</td>
          </tr>
        </tbody>
      </table>
      <p><strong>Google AdSense advertising:</strong> We allow Google, as a third-party vendor, to serve ads based on your visit to this site and other sites using advertising cookies. You can opt out of personalized advertising at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>, and you can opt out of some third-party vendors at <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info</a> or, in the EU, at <a href="https://youronlinechoices.eu" target="_blank" rel="noopener noreferrer">youronlinechoices.eu</a>.</p>
      <p><strong>Changing your consent:</strong> Clearing your browser storage or site data will re-show the cookie banner. EU/EEA and UK visitors see only non-personalized AdSense ads until they consent.</p>
      <p><strong>Coupang Partners affiliate links:</strong> Some product recommendation cards contain Coupang affiliate links, marked with <code>rel="sponsored"</code>. Tracking cookies (e.g. <code>OVERSEAS_GUEST_COUNTRY</code>, <code>X-CP-PG-NID</code>) are set by the Coupang domain (<code>link.coupang.com</code>, <code>coupang.com</code>) <strong>only when you click such a link</strong>. These cookies are not set by kissinskin.net and we have no access to the data they collect. Affiliate revenue does not influence which products we recommend. See <a href="https://partners.coupang.com" target="_blank" rel="noopener noreferrer">Coupang Partners</a> for their policies.</p>

      <h2>4. Legal Basis for Processing (GDPR Article 6)</h2>
      <p>For users in the EU/EEA and UK, we process your data based on the following legal grounds:</p>
      <table className="legal-table">
        <thead>
          <tr><th>Processing Activity</th><th>Legal Basis</th><th>GDPR Article</th></tr>
        </thead>
        <tbody>
          <tr><td>Processing your uploaded photo for AI analysis</td><td>Your explicit consent (you actively upload and submit)</td><td>Art. 6(1)(a), Art. 9(2)(a)</td></tr>
          <tr><td>Processing payment</td><td>Performance of contract</td><td>Art. 6(1)(b)</td></tr>
          <tr><td>Anonymous analytics (Cloudflare)</td><td>Legitimate interest (service improvement)</td><td>Art. 6(1)(f)</td></tr>
          <tr><td>Responding to support requests</td><td>Performance of contract / Legitimate interest</td><td>Art. 6(1)(b), Art. 6(1)(f)</td></tr>
          <tr><td>Legal compliance</td><td>Legal obligation</td><td>Art. 6(1)(c)</td></tr>
        </tbody>
      </table>

      <h2>5. How We Use Your Information</h2>
      <table className="legal-table">
        <thead>
          <tr><th>Data</th><th>Purpose</th><th>Retention</th></tr>
        </thead>
        <tbody>
          <tr><td>Uploaded photo</td><td>Generate AI makeup analysis</td><td>Not retained (real-time processing only, deleted immediately)</td></tr>
          <tr><td>Analysis results</td><td>Display in your browser</td><td>Browser session only (not stored on server)</td></tr>
          <tr><td>Payment info</td><td>Process payment via Polar</td><td>Managed by Polar per their retention policy</td></tr>
          <tr><td>Transaction reference</td><td>Customer support</td><td>Up to 12 months or as required by tax/accounting law</td></tr>
          <tr><td>Anonymous analytics</td><td>Improve service quality</td><td>Aggregated, no PII, managed by Cloudflare</td></tr>
        </tbody>
      </table>

      <h2>6. Automated Decision-Making & Profiling</h2>
      <p>In accordance with GDPR Article 22:</p>
      <ul>
        <li>The Service uses <strong>automated processing</strong> (AI models by OpenAI) to generate makeup simulations and skin analysis reports.</li>
        <li>This automated processing produces results that are <strong>artistic/cosmetic in nature</strong> and do not produce legal effects or similarly significantly affect you.</li>
        <li>We do <strong>not</strong> use your data for profiling, targeted advertising, credit scoring, or any automated decision-making that produces legal or similarly significant effects.</li>
        <li>The legal basis for this automated processing is your explicit consent provided when you upload your photo and initiate the analysis.</li>
      </ul>

      <h2>7. Third-Party Services & Data Processors</h2>
      <p>We use the following third-party services. Each has their own privacy policy:</p>
      <table className="legal-table">
        <thead>
          <tr><th>Service</th><th>Role</th><th>Purpose</th><th>Data Transferred</th><th>Location</th><th>Privacy Policy</th></tr>
        </thead>
        <tbody>
          <tr><td><strong>OpenAI</strong></td><td>Data Processor</td><td>AI image generation & text analysis</td><td>Uploaded photo (transient)</td><td>United States</td><td><a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">openai.com/privacy</a></td></tr>
          <tr><td><strong>Polar</strong></td><td>Independent Controller</td><td>Payment processing (MoR)</td><td>Payment & billing info</td><td>United States / EU</td><td><a href="https://polar.sh/legal/privacy" target="_blank" rel="noopener noreferrer">polar.sh/legal/privacy</a></td></tr>
          <tr><td><strong>Cloudflare</strong></td><td>Data Processor</td><td>Website hosting, CDN, security</td><td>Anonymous analytics, IP (transient)</td><td>Global (edge network)</td><td><a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">cloudflare.com/privacy</a></td></tr>
        </tbody>
      </table>
      <p><strong>Important:</strong> OpenAI's API data usage policy states that data sent through the API is <strong>not used to train their models</strong>. Your photos are not used for AI training by OpenAI or by us.</p>

      <h2>8. International Data Transfers</h2>
      <p>Your data may be transferred to and processed in countries outside your country of residence, including the United States. We ensure appropriate safeguards are in place:</p>
      <ul>
        <li><strong>EU/EEA to US:</strong> Transfers to OpenAI and Polar are protected by Standard Contractual Clauses (SCCs) as adopted by the European Commission, and/or the EU-U.S. Data Privacy Framework where applicable.</li>
        <li><strong>UK:</strong> Transfers are protected by the UK International Data Transfer Agreement (IDTA) or UK Addendum to EU SCCs.</li>
        <li><strong>South Korea:</strong> Cross-border transfers comply with PIPA Article 17 requirements. Your consent to use the Service constitutes consent to cross-border data transfer for the stated purposes.</li>
        <li><strong>Brazil:</strong> Transfers comply with LGPD Article 33, based on your consent and adequate safeguards.</li>
        <li><strong>Japan:</strong> Transfers comply with APPI requirements, with appropriate safeguards in place.</li>
        <li>Since we do not store your photos or personal data on our servers, the actual data transfer is transient and limited to the duration of API processing.</li>
      </ul>

      <h2>9. Data We Do NOT Collect</h2>
      <ul>
        <li>We do not directly collect your name, phone number, or address (except information you provide to Polar during payment, or the email you enter to receive your analysis report).</li>
        <li>We do not force you to create user accounts or profiles.</li>
        <li>We do not use your uploaded photos for AI model training — we use OpenAI's API with the no-training option enabled.</li>
        <li>We do not create or store biometric identifiers (face embeddings, hashes, or templates).</li>
        <li>We do not sell or rent your personal information ourselves. Note: ads served via Google AdSense may use Google's general demographic estimates; you can opt out at <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</li>
      </ul>

      <h2>10. Data Security</h2>
      <ul>
        <li>All data transmission is encrypted using <strong>HTTPS/TLS</strong> (TLS 1.2 or higher).</li>
        <li>Photos are transmitted directly from your browser to OpenAI's API via our secure serverless function — no intermediate storage.</li>
        <li>Our infrastructure runs on <strong>Cloudflare Workers</strong> (serverless), meaning there is no persistent server where data could be stored or accessed.</li>
        <li>We implement appropriate technical and organizational measures to protect against unauthorized access, alteration, disclosure, or destruction of data.</li>
      </ul>

      <h2>11. Data Breach Notification</h2>
      <p>In the unlikely event of a data breach involving personal data:</p>
      <ul>
        <li><strong>EU/EEA (GDPR):</strong> We will notify the relevant supervisory authority within 72 hours of becoming aware of the breach (Article 33). If the breach poses a high risk to your rights and freedoms, we will also notify affected individuals without undue delay (Article 34).</li>
        <li><strong>UK:</strong> We will notify the Information Commissioner's Office (ICO) within 72 hours.</li>
        <li><strong>South Korea (PIPA):</strong> We will notify affected individuals and the Personal Information Protection Commission (PIPC) without delay.</li>
        <li><strong>Brazil (LGPD):</strong> We will notify the National Data Protection Authority (ANPD) and affected individuals.</li>
        <li><strong>California (CCPA):</strong> We will notify affected California residents as required by Cal. Civ. Code § 1798.82.</li>
        <li><strong>Canada (PIPEDA):</strong> We will notify the Privacy Commissioner of Canada and affected individuals for breaches posing a real risk of significant harm.</li>
        <li><strong>Australia:</strong> We will notify the Office of the Australian Information Commissioner (OAIC) and affected individuals for eligible data breaches under the Notifiable Data Breaches scheme.</li>
      </ul>

      <h2>12. Your Rights</h2>

      <h3>12.1 Rights for All Users</h3>
      <p>Regardless of your location, you have the right to:</p>
      <ul>
        <li><strong>Access:</strong> Know what data we hold about you (effectively none, as described above).</li>
        <li><strong>Deletion:</strong> Request deletion of any data. Since we don't store photos or personal data, this primarily applies to payment records held by Polar.</li>
        <li><strong>Portability:</strong> Request your data in a portable format.</li>
        <li><strong>Objection:</strong> Object to any data processing.</li>
        <li><strong>Withdraw consent:</strong> You may withdraw consent at any time. Withdrawal does not affect the lawfulness of processing performed before withdrawal.</li>
      </ul>

      <h3>12.2 EU/EEA Users (GDPR)</h3>
      <p>In addition to the above, you have the right to:</p>
      <ul>
        <li><strong>Rectification:</strong> Correct inaccurate personal data (Art. 16).</li>
        <li><strong>Restriction:</strong> Request restriction of processing in certain circumstances (Art. 18).</li>
        <li><strong>Object to legitimate interest processing:</strong> You may object to processing based on legitimate interests (Art. 21).</li>
        <li><strong>Not be subject to automated decision-making:</strong> You have rights regarding automated processing (Art. 22). See Section 6 above.</li>
        <li><strong>Lodge a complaint:</strong> You have the right to lodge a complaint with your local Data Protection Authority (DPA). A list of EU DPAs is available at <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer">edpb.europa.eu</a>.</li>
      </ul>

      <h3>12.3 UK Users (UK GDPR)</h3>
      <ul>
        <li>You have equivalent rights to EU users under the UK GDPR and Data Protection Act 2018.</li>
        <li>You may lodge a complaint with the <strong>Information Commissioner's Office (ICO)</strong> at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.</li>
      </ul>

      <h3>12.4 California Users (CCPA/CPRA)</h3>
      <ul>
        <li><strong>Right to Know:</strong> You may request disclosure of the categories and specific pieces of personal information we have collected about you in the past 12 months.</li>
        <li><strong>Right to Delete:</strong> You may request deletion of your personal information.</li>
        <li><strong>Right to Correct:</strong> You may request correction of inaccurate personal information.</li>
        <li><strong>Right to Opt-Out of Sale/Sharing:</strong> We do <strong>not sell or share</strong> your personal information as defined by the CCPA/CPRA. No opt-out is necessary.</li>
        <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your CCPA/CPRA rights.</li>
        <li><strong>Authorized Agent:</strong> You may designate an authorized agent to make requests on your behalf.</li>
        <li><strong>Categories of PI collected:</strong> Internet activity (anonymous analytics via Cloudflare), financial information (via Polar, not by us directly). We do not collect sensitive personal information as defined under the CPRA.</li>
        <li>We will respond to verifiable consumer requests within <strong>45 days</strong>.</li>
      </ul>

      <h3>12.5 South Korean Users (PIPA)</h3>
      <ul>
        <li>You have the right to access, correct, delete, and suspend processing of your personal information under PIPA.</li>
        <li>We comply with the duty to destroy personal information when its purpose has been achieved — photos are destroyed immediately after processing.</li>
        <li>You may lodge a complaint with the <strong>Personal Information Protection Commission (PIPC)</strong> at <a href="https://www.pipc.go.kr" target="_blank" rel="noopener noreferrer">pipc.go.kr</a>.</li>
        <li>You may also seek dispute resolution through the <strong>Korea Internet & Security Agency (KISA)</strong> Privacy Center (privacy.kisa.or.kr).</li>
      </ul>

      <h3>12.6 Brazilian Users (LGPD)</h3>
      <ul>
        <li>You have the right to confirmation, access, correction, anonymization, portability, deletion, information about sharing, and revocation of consent under the LGPD.</li>
        <li>You may lodge a complaint with the <strong>Autoridade Nacional de Proteção de Dados (ANPD)</strong>.</li>
      </ul>

      <h3>12.7 Canadian Users (PIPEDA)</h3>
      <ul>
        <li>You have the right to access your personal information, challenge its accuracy, and withdraw consent.</li>
        <li>You may lodge a complaint with the <strong>Office of the Privacy Commissioner of Canada (OPC)</strong> at <a href="https://www.priv.gc.ca" target="_blank" rel="noopener noreferrer">priv.gc.ca</a>.</li>
      </ul>

      <h3>12.8 Japanese Users (APPI)</h3>
      <ul>
        <li>You have the right to request disclosure, correction, cessation of use, and deletion of your personal information under the APPI.</li>
        <li>You may lodge a complaint with the <strong>Personal Information Protection Commission (PPC)</strong> of Japan.</li>
      </ul>

      <h3>12.9 Australian Users (Privacy Act 1988)</h3>
      <ul>
        <li>You have the right to access and correct your personal information under the Australian Privacy Principles (APPs).</li>
        <li>You may lodge a complaint with the <strong>Office of the Australian Information Commissioner (OAIC)</strong> at <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">oaic.gov.au</a>.</li>
      </ul>

      <p>To exercise any of these rights, contact <strong>support@kissinskin.net</strong>. We will respond within the timeframe required by applicable law (generally 30 days, or 45 days for CCPA).</p>

      <h2>13. Children's Privacy</h2>
      <ul>
        <li>The Service is not intended for children under <strong>16</strong> (or the applicable minimum age in your jurisdiction).</li>
        <li>We do not knowingly collect data from children under 16 (or 13 under COPPA in the United States).</li>
        <li>If you believe a child has used our Service, contact us and we will take appropriate action, including deleting any data that may have been inadvertently collected.</li>
        <li>In the EU/EEA, the minimum age varies by member state (13–16) per GDPR Article 8.</li>
        <li>In South Korea, the minimum age is 14 under PIPA.</li>
      </ul>

      <h2>14. Do Not Track (DNT) Signals</h2>
      <p>Our Service does not track users across third-party websites and therefore does not respond to Do Not Track (DNT) signals. We do not engage in any cross-site tracking.</p>

      <h2>15. Data Retention & Destruction</h2>
      <ul>
        <li><strong>Photos:</strong> Not retained. Destroyed immediately after AI processing is complete.</li>
        <li><strong>Analysis results:</strong> Exist only in your browser session. Not stored on any server.</li>
        <li><strong>Transaction references:</strong> Retained for up to 12 months for customer support and legal/tax compliance, then deleted.</li>
        <li><strong>Payment data:</strong> Retained by Polar according to their data retention policy and applicable financial regulations.</li>
        <li>We comply with the data destruction requirements under PIPA (South Korea), LGPD (Brazil), and other applicable laws.</li>
      </ul>

      <h2>16. Changes to This Policy</h2>
      <p>We may update this Privacy Policy from time to time. Material changes will be reflected with an updated effective date at the top of this page. Where required by law (e.g., GDPR, PIPA), we will provide notice of material changes before they take effect. Continued use of the Service after changes constitutes acceptance.</p>

      <h2>17. Contact Us</h2>
      <p>For privacy-related questions, data requests, or to exercise any of your rights:</p>
      <ul>
        <li>Email: <strong>support@kissinskin.net</strong></li>
        <li>Website: <a href="https://kissinskin.net" target="_blank" rel="noopener noreferrer">https://kissinskin.net</a></li>
      </ul>
      <p>We aim to respond to all privacy-related inquiries within <strong>30 days</strong> (or within the timeframe required by your applicable local law).</p>
    </>
  )
}
