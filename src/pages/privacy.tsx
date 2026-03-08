import './policy.css'

type Page = 'home' | 'analysis' | 'terms' | 'privacy' | 'refund'

interface PrivacyProps {
  onNavigate: (page: Page) => void
}

export default function Privacy({ onNavigate }: PrivacyProps) {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <button className="legal-back" onClick={() => onNavigate('home')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1>Privacy Policy</h1>
      </div>
      <div className="legal-content">
        <p className="legal-date">Effective Date: March 6, 2026</p>

        <h2>1. Introduction</h2>
        <p>kisskin ("we", "our", "us") operates the website <a href="https://kisskin.net" target="_blank" rel="noopener noreferrer">https://kisskin.net</a>. This Privacy Policy explains how we collect, use, and protect your information when you use our AI makeup analysis service.</p>

        <h2>2. Information We Collect</h2>

        <h3>2.1 Photos You Upload</h3>
        <ul>
          <li>When you use our Service, you upload a facial photo for AI analysis.</li>
          <li>Your photo is sent to <strong>OpenAI's API</strong> for processing and is <strong>not stored on our servers</strong>.</li>
          <li>Photos are processed in real-time memory and <strong>discarded immediately</strong> after your analysis results are generated.</li>
          <li>We do not keep, archive, or back up your photos in any form.</li>
        </ul>

        <h3>2.2 Payment Information</h3>
        <ul>
          <li>All payment processing is handled by <strong>Polar</strong> (<a href="https://polar.sh" target="_blank" rel="noopener noreferrer">polar.sh</a>), acting as our Merchant of Record.</li>
          <li>We <strong>never</strong> receive, see, or store your credit card number, CVV, or full billing details.</li>
          <li>Polar collects the necessary payment information (card details, billing address, email) to process your transaction. This data is subject to <a href="https://polar.sh/legal/privacy" target="_blank" rel="noopener noreferrer">Polar's Privacy Policy</a>.</li>
          <li>We may receive from Polar: transaction confirmation, order amount, and a reference ID for customer support purposes.</li>
        </ul>

        <h3>2.3 Automatically Collected Data</h3>
        <ul>
          <li><strong>Cloudflare Analytics:</strong> As our hosting provider, Cloudflare may collect anonymous usage data (page views, country, device type, browser). This data does not identify you personally.</li>
          <li>We do <strong>not</strong> use cookies for tracking or advertising.</li>
          <li>We do <strong>not</strong> use Google Analytics or any third-party tracking pixels.</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <table className="legal-table">
          <thead>
            <tr><th>Data</th><th>Purpose</th><th>Retention</th></tr>
          </thead>
          <tbody>
            <tr><td>Uploaded photo</td><td>Generate AI makeup analysis</td><td>Not retained (real-time only)</td></tr>
            <tr><td>Analysis results</td><td>Display in your browser</td><td>Browser session only (not on server)</td></tr>
            <tr><td>Payment info</td><td>Process payment via Polar</td><td>Managed by Polar</td></tr>
            <tr><td>Anonymous analytics</td><td>Improve service quality</td><td>Aggregated, no PII</td></tr>
          </tbody>
        </table>

        <h2>4. Third-Party Services</h2>
        <p>We use the following third-party services. Each has their own privacy policy:</p>
        <table className="legal-table">
          <thead>
            <tr><th>Service</th><th>Purpose</th><th>Privacy Policy</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>OpenAI</strong></td><td>AI image generation & text analysis</td><td><a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer">openai.com/privacy</a></td></tr>
            <tr><td><strong>Polar</strong></td><td>Payment processing (Merchant of Record)</td><td><a href="https://polar.sh/legal/privacy" target="_blank" rel="noopener noreferrer">polar.sh/legal/privacy</a></td></tr>
            <tr><td><strong>Cloudflare</strong></td><td>Website hosting & CDN</td><td><a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">cloudflare.com/privacy</a></td></tr>
          </tbody>
        </table>
        <p><strong>Important:</strong> OpenAI's API data usage policy states that data sent through the API is <strong>not used to train their models</strong>. Your photos are not used for AI training by OpenAI or by us.</p>

        <h2>5. Data We Do NOT Collect</h2>
        <ul>
          <li>We do not collect your name, email, phone number, or address (unless provided to Polar during payment).</li>
          <li>We do not create user accounts or profiles.</li>
          <li>We do not track you across websites.</li>
          <li>We do not sell, rent, or share your data with advertisers.</li>
          <li>We do not use your photos for AI model training.</li>
        </ul>

        <h2>6. Data Security</h2>
        <ul>
          <li>All data transmission is encrypted using <strong>HTTPS/TLS</strong>.</li>
          <li>Photos are transmitted directly from your browser to OpenAI's API via our secure serverless function — no intermediate storage.</li>
          <li>Our infrastructure runs on <strong>Cloudflare Workers</strong> (serverless), meaning there is no persistent server where data could be stored or accessed.</li>
        </ul>

        <h2>7. Your Rights</h2>
        <p>Regardless of your location, you have the right to:</p>
        <ul>
          <li><strong>Access:</strong> Know what data we hold about you (effectively none, as described above).</li>
          <li><strong>Deletion:</strong> Request deletion of any data. Since we don't store photos or personal data, this primarily applies to payment records held by Polar.</li>
          <li><strong>Portability:</strong> Request your data in a portable format.</li>
          <li><strong>Objection:</strong> Object to any data processing.</li>
        </ul>
        <p>To exercise these rights, contact <strong>support@kisskin.net</strong>.</p>

        <h2>8. International Users</h2>
        <ul>
          <li>kisskin is accessible worldwide. By using the Service, you consent to your photo being processed by OpenAI (based in the United States) and payment being processed by Polar.</li>
          <li>For <strong>EU/EEA users (GDPR):</strong> Polar acts as data controller for payment data. Our legal basis for processing your photo is your explicit consent when you upload it and initiate analysis.</li>
          <li>For <strong>California users (CCPA):</strong> We do not sell personal information. You may request disclosure of data collected about you.</li>
        </ul>

        <h2>9. Children's Privacy</h2>
        <p>The Service is not intended for children under <strong>13</strong>. We do not knowingly collect data from children under 13. If you believe a child has used our Service, contact us and we will take appropriate action.</p>

        <h2>10. Changes to This Policy</h2>
        <p>We may update this Privacy Policy from time to time. Material changes will be reflected with an updated effective date at the top of this page. Continued use of the Service after changes constitutes acceptance.</p>

        <h2>11. Contact Us</h2>
        <p>For privacy-related questions or data requests:</p>
        <ul>
          <li>Email: <strong>support@kisskin.net</strong></li>
          <li>Website: <a href="https://kisskin.net" target="_blank" rel="noopener noreferrer">https://kisskin.net</a></li>
        </ul>
      </div>
    </div>
  )
}
