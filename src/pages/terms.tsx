import './policy.css'

type Page = 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact'

interface TermsProps {
  onNavigate?: (page: Page) => void
}

export default function Terms({ onNavigate }: TermsProps) {
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
        <h1>Terms of Service</h1>
      </div>
      <div className="legal-content">
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
      </div>
    </div>
  )
}
