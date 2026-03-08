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
        <p className="legal-date">Effective Date: March 6, 2026</p>

        <h2>1. Overview</h2>
        <p>kisskin provides AI-generated makeup analysis results that are delivered <strong>instantly</strong> after payment. Because our product is digital content consumed immediately upon delivery, our refund policy reflects this nature.</p>

        <h2>2. General Policy</h2>
        <p>All purchases are <strong>final</strong> once the AI analysis results have been successfully delivered to your browser. Since results are generated and displayed immediately after payment, we cannot "undo" or "take back" the delivered content.</p>

        <h2>3. When You ARE Eligible for a Refund</h2>
        <p>We will issue a <strong>full refund</strong> in the following cases:</p>
        <ul>
          <li><strong>Technical failure:</strong> Payment was charged but no analysis results were generated or displayed due to a server error, API failure, or other technical issue on our end.</li>
          <li><strong>Duplicate charge:</strong> You were accidentally charged more than once for the same analysis.</li>
          <li><strong>Processing error:</strong> The AI returned a completely blank, corrupted, or unrelated result (not merely an unsatisfactory style preference).</li>
        </ul>

        <h2>4. When You Are NOT Eligible for a Refund</h2>
        <ul>
          <li>You are <strong>dissatisfied with the AI-generated styles</strong> (style preferences are subjective; AI results vary based on photo quality, lighting, and other factors).</li>
          <li>You <strong>closed the browser</strong> before saving your results. Results exist only in your active browser session.</li>
          <li>You <strong>changed your mind</strong> after seeing the results.</li>
          <li>You <strong>uploaded the wrong photo</strong> or selected incorrect options (gender, skin type).</li>
          <li>Your <strong>device or internet connection</strong> caused issues displaying the results.</li>
        </ul>

        <h2>5. How to Request a Refund</h2>
        <ol>
          <li>Email <strong>support@kisskin.net</strong> within <strong>7 days</strong> of your purchase.</li>
          <li>Include the following information:
            <ul>
              <li>The email address used for payment</li>
              <li>Date and approximate time of purchase</li>
              <li>Description of the issue (screenshot if possible)</li>
            </ul>
          </li>
          <li>We will review your request and respond within <strong>3 business days</strong>.</li>
        </ol>

        <h2>6. How Refunds Are Processed</h2>
        <ul>
          <li>Approved refunds are processed through <strong>Polar</strong>, our payment processor.</li>
          <li>Refunds are returned to your <strong>original payment method</strong>.</li>
          <li>Processing time: <strong>5–10 business days</strong> depending on your bank or card issuer.</li>
          <li>You will receive a confirmation email from Polar once the refund is initiated.</li>
        </ul>

        <h2>7. Chargebacks</h2>
        <p>We encourage you to contact us at <strong>support@kisskin.net</strong> before initiating a chargeback with your bank. We are committed to resolving issues fairly and promptly. Filing a chargeback without contacting us first may result in delays and additional complications.</p>

        <h2>8. Pricing & Currency</h2>
        <ul>
          <li>All prices are listed in <strong>USD ($)</strong>.</li>
          <li>The final amount charged may vary slightly due to currency conversion fees applied by your bank. kisskin is not responsible for exchange rate differences.</li>
          <li>Tax may be added to your purchase depending on your location, as calculated by Polar.</li>
        </ul>

        <h2>9. Contact Us</h2>
        <p>For refund requests or billing questions:</p>
        <ul>
          <li>Email: <strong>support@kisskin.net</strong></li>
          <li>Response time: Within 3 business days</li>
        </ul>
      </div>
    </div>
  )
}
