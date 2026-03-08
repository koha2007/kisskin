import './policy.css'

type Page = 'home' | 'analysis' | 'terms' | 'privacy' | 'refund'

interface RefundProps {
  onNavigate: (page: Page) => void
}

export default function Refund({ onNavigate }: RefundProps) {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <button className="legal-back" onClick={() => onNavigate('home')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1>Refund Policy</h1>
      </div>
      <div className="legal-content">
        <p className="legal-date">Effective Date: March 8, 2026</p>

        <h2>1. Overview</h2>
        <p>kissinskin provides AI-generated makeup analysis results that are delivered <strong>instantly</strong> after payment. Because our product is digital content consumed immediately upon delivery, our refund policy reflects this nature while respecting your statutory consumer rights.</p>

        <h2>2. General Policy</h2>
        <p>All purchases are <strong>final</strong> once the AI analysis results have been successfully delivered to your browser. Since results are generated and displayed immediately after payment, we cannot "undo" or "take back" the delivered content.</p>
        <p><strong>Important:</strong> This policy does not affect your statutory consumer rights under applicable law. See Section 10 for jurisdiction-specific rights.</p>

        <h2>3. When You ARE Eligible for a Refund</h2>
        <p>We will issue a <strong>full refund</strong> in the following cases:</p>
        <ul>
          <li><strong>Technical failure:</strong> Payment was charged but no analysis results were generated or displayed due to a server error, API failure, or other technical issue on our end.</li>
          <li><strong>Duplicate charge:</strong> You were accidentally charged more than once for the same analysis.</li>
          <li><strong>Processing error:</strong> The AI returned a completely blank, corrupted, or unrelated result (not merely an unsatisfactory style preference).</li>
          <li><strong>Service not as described:</strong> The Service fundamentally failed to deliver what was described (e.g., no makeup styles generated, no analysis report provided).</li>
        </ul>

        <h2>4. When You Are NOT Eligible for a Refund</h2>
        <ul>
          <li>You are <strong>dissatisfied with the AI-generated styles</strong> (style preferences are subjective; AI results vary based on photo quality, lighting, and other factors).</li>
          <li>You <strong>closed the browser</strong> before saving your results. Results exist only in your active browser session.</li>
          <li>You <strong>changed your mind</strong> after seeing the results.</li>
          <li>You <strong>uploaded the wrong photo</strong> or selected incorrect options (gender, skin type).</li>
          <li>Your <strong>device or internet connection</strong> caused issues displaying the results.</li>
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
          <li>Email <strong>support@kisskin.net</strong> within <strong>14 days</strong> of your purchase (or within the period required by your local consumer law, whichever is longer).</li>
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
        <p>We encourage you to contact us at <strong>support@kisskin.net</strong> before initiating a chargeback with your bank. We are committed to resolving issues fairly and promptly. Filing a chargeback without contacting us first may result in delays and additional complications.</p>

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
          <li>Email: <strong>support@kisskin.net</strong></li>
          <li>Response time: Within 3 business days</li>
        </ul>
      </div>
    </div>
  )
}
