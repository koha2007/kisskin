import './policy.css'

type Page = 'home' | 'analysis' | 'terms' | 'privacy' | 'refund' | 'contact'

interface ContactProps {
  onNavigate: (page: Page) => void
}

export default function Contact({ onNavigate }: ContactProps) {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <button className="legal-back" onClick={() => onNavigate('home')}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1>Contact Us</h1>
      </div>
      <div className="legal-content">
        <div style={{ textAlign: 'center', padding: '20px 0 32px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#ec4899' }}>mail</span>
          <p style={{ fontSize: 16, color: '#0f172a', fontWeight: 600, margin: '12px 0 4px' }}>We'd love to hear from you</p>
          <p style={{ color: '#64748b', fontSize: 14 }}>Questions, feedback, or support — reach out anytime.</p>
        </div>

        <h2>General & Support</h2>
        <p>For questions about your analysis results, account issues, or general inquiries:</p>
        <p><strong>Email:</strong> <a href="mailto:support@kissinskin.net">support@kissinskin.net</a></p>
        <p>We typically respond within 24 hours on business days.</p>

        <h2>Billing & Refunds</h2>
        <p>For payment issues, refund requests, or billing questions:</p>
        <p><strong>Email:</strong> <a href="mailto:support@kissinskin.net">support@kissinskin.net</a></p>
        <p>Payments are processed by <a href="https://polar.sh" target="_blank" rel="noopener noreferrer">Polar</a>. For billing-specific inquiries, you may also contact Polar directly through your purchase receipt.</p>
        <p>For full details, see our <a className="legal-link" onClick={() => onNavigate('refund')}>Refund Policy</a>.</p>

        <h2>Privacy & Data Requests</h2>
        <p>To request data deletion, access your personal data, or ask privacy-related questions:</p>
        <p><strong>Email:</strong> <a href="mailto:privacy@kissinskin.net">privacy@kissinskin.net</a></p>
        <p>We process data requests within 30 days as required by applicable privacy laws (GDPR, CCPA, PIPA). See our <a className="legal-link" onClick={() => onNavigate('privacy')}>Privacy Policy</a> for details.</p>

        <h2>Business & Partnerships</h2>
        <p>For business inquiries, collaborations, or partnership proposals:</p>
        <p><strong>Email:</strong> <a href="mailto:biz@kissinskin.net">biz@kissinskin.net</a></p>

        <h2>Report an Issue</h2>
        <p>Found a bug or technical issue? Let us know so we can fix it:</p>
        <p><strong>Email:</strong> <a href="mailto:support@kissinskin.net">support@kissinskin.net</a></p>
        <p>Please include:</p>
        <ul>
          <li>Your device and browser (e.g., iPhone 15, Safari)</li>
          <li>What happened vs. what you expected</li>
          <li>A screenshot if possible</li>
        </ul>

        <h2>Website</h2>
        <p><a href="https://kissinskin.net" target="_blank" rel="noopener noreferrer">https://kissinskin.net</a></p>
      </div>
    </div>
  )
}
