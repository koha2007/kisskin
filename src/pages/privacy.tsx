import './policy.css'

type Page = 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact'

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
        <p className="legal-date">Effective Date: March 8, 2026</p>

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

        <h3>3.3 Automatically Collected Data</h3>
        <ul>
          <li><strong>Cloudflare Analytics:</strong> As our hosting provider, Cloudflare may collect anonymous usage data (page views, country, device type, browser). This data does not identify you personally.</li>
          <li>We do <strong>not</strong> use cookies for tracking or advertising.</li>
          <li>We do <strong>not</strong> use Google Analytics or any third-party tracking pixels.</li>
          <li>We do <strong>not</strong> use any first-party or third-party cookies. Cloudflare may use strictly necessary technical cookies for security purposes (e.g., bot protection).</li>
        </ul>

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
          <li>We do not collect your name, email, phone number, or address (unless provided to Polar during payment).</li>
          <li>We do not create user accounts or profiles.</li>
          <li>We do not track you across websites.</li>
          <li>We do <strong>not sell, rent, or share your personal information</strong> with third parties for advertising, marketing, or any commercial purpose.</li>
          <li>We do not use your photos for AI model training.</li>
          <li>We do not engage in cross-context behavioral advertising.</li>
          <li>We do not create or store biometric identifiers or biometric templates.</li>
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
      </div>
    </div>
  )
}
