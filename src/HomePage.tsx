import './HomePage.css'

interface HomePageProps {
  onNavigate: (page: 'home' | 'analysis') => void
}

function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="home-header-brand">
          <div className="home-header-icon">
            <span className="material-symbols-outlined">face_6</span>
          </div>
          <span className="home-header-name">KisSkin</span>
        </div>
        <button className="home-header-menu">
          <span className="material-symbols-outlined">menu</span>
        </button>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-bg">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBw3OWE1HL14Vd52UP_LhoDyWCbH6XJsaqZF6bcHkJIf92r-CGN56E4ou-JE_qrExYCMJbXJVI2SR602wjjT3xJQDiaGAYO_fQqk7rOW-pARxoqEqr73YLM6WrJVt8-5rYDu3eJ9yh9wDJ3SETrAt-qckVNh_rfWdTJLUid6o2RW-w3t8eT5UZKXVMWY0Qg38iZR4H3Qx1NsxT1KxOZMtOME6yWpw63CTiGFE4pFVDid7bn_mHZZWpZyt5Zu0DQddGzLSKsp2gMMOA"
              alt="뷰티 메이크업"
              className="hero-image"
            />
            <div className="hero-overlay">
              <div className="hero-content">
                <h1 className="hero-title">
                  Your Perfect Look, <span className="hero-accent">Powered by AI.</span>
                </h1>
                <p className="hero-desc">
                  Personalized makeup styles tailored to your unique features. Trusted by 10k+ beauty enthusiasts.
                </p>
                <button className="hero-cta" onClick={() => onNavigate('analysis')}>
                  <span className="material-symbols-outlined">auto_fix_high</span>
                  Start AI Analysis
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="process">
          <div className="process-header">
            <h2 className="process-title">Simple 3-Step Process</h2>
            <div className="process-bar" />
          </div>

          <div className="process-steps">
            <div className="process-line" />

            <div className="step">
              <div className="step-icon">
                <span className="material-symbols-outlined">add_a_photo</span>
              </div>
              <div className="step-body">
                <span className="step-label">Step 01</span>
                <h3 className="step-name">Upload Photo</h3>
                <p className="step-desc">
                  Take a selfie or upload a clear portrait for the most accurate AI mapping.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-icon">
                <span className="material-symbols-outlined">person_search</span>
              </div>
              <div className="step-body">
                <span className="step-label">Step 02</span>
                <h3 className="step-name">Select Profile</h3>
                <p className="step-desc">
                  Tell us your gender and skin type to fine-tune your personalized recommendations.
                </p>
              </div>
            </div>

            <div className="step">
              <div className="step-icon step-icon-filled">
                <span className="material-symbols-outlined">colors_spark</span>
              </div>
              <div className="step-body">
                <span className="step-label">Step 03</span>
                <h3 className="step-name">Get Results</h3>
                <p className="step-desc">
                  Instantly receive 9 stunning, personalized makeup personas ready to wear.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Styles Section */}
        <section className="explore">
          <h2 className="explore-title">Explore Styles</h2>
          <div className="explore-grid">
            <div className="style-card">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLiHzr9fswZFJP6buAHb1o9SXRuWmTVGzyrtB04gTas0HSxl45-yzjA1d50gcTpptccy1lJUAKOLUnDGiaiilp17fvGLGv-geoR6bAHlWPe7tRgYZBx3f9zvRRORUYMdg9T1Vzv_4noEq6ZzFxmGhCCK06oZC8RPC_nwg-D9v5Hf3d5Vfgxetfh3RzbTJm5SEIUbteyzNw_iygwaNuCu2JQjvcPrZxRuIDVb1v4yF67NPmMbepV9y0iMrr_uj9hqfqB6Rz_i02rpw"
                alt="Natural Glow"
                className="style-card-image"
              />
              <div className="style-card-label">
                <p>Natural Glow</p>
              </div>
            </div>
            <div className="style-card">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRrfvjp9YA9u51SI5X7tBiIAjYHBmNZhzH4pCnhx-J_EUWh6PgCRY7yi3YNJvaDBEyJ-vVPJiyzL_Y6_JunMiYToCioL6OVtan-z1OZ3HasKTiBbCrWwEefBFtQZ5kACuUOjUQnwLQqpNVLhOuFAcwrfk_vRkc84SPLsF-WZBhGT3bAOeFbh20JnuO3YBwBTyr2g7eg-UqFf1ajaaEkdRPD3zs5WEfn-FXBjcxEAI-_m1zzZcwm0ZH9rBjr-V-eh5xnFUIJViyj5g"
                alt="Bold Evening"
                className="style-card-image"
              />
              <div className="style-card-label">
                <p>Bold Evening</p>
              </div>
            </div>
          </div>
          <div className="explore-cta">
            <button className="explore-btn">
              View all 9 personas <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="home-footer">
          <div className="footer-trust">
            <div className="trust-privacy">
              <span className="material-symbols-outlined">verified_user</span>
              <p>Your privacy matters. All photos are deleted after analysis.</p>
            </div>
            <div className="trust-users">
              <div className="avatar-stack">
                <div className="avatar">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuABoH2KFV7G8rBa55JMSQnvc35WA9MfY8fv5JXPrdWKEZBgsyja5rh0zqRKdNJyUqgetGPPZvmUrBD8cmiYEaueQ3tQi6oTY5K3z0MqR5DDaanEdu8aUDxIFSzytUmMLVhzxtazTdq8TMI4ucACeqLpiIf-sPCWCXEg-cGIZxzcf8TrJ73RnrGojdk-ay81c0zqCi3k5wcI8i0TS38NlUra2jskS3EXnWnKfcbxFIK1qcBaRgwh_VpZgCpfY8fQrShJcTVegaaAD3E" alt="User" />
                </div>
                <div className="avatar">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFc-BL7YzKoC9OuFkPDiKXchpj5ejF1FGtFLGzdoTm4sUuTutKeywQG0jxZI1sHRqZ966bFHJp5uoI-eDJ5ODPhzoHvRopG0iiYcvje-VdZqhlVEIvYsfLyAs46J3ZxSMFJjNHXJwwnD8GJHltLIuJUosGyuL4d98J0oGW0w13hurKC2C1YgfWXil4uen-wVs8q7bWp6ryO9X6LbqZi4srnhtLRz3cdSVz5n12m2mfscl9aSbQceY5BhiEVX1EbY7ssXV6z6kjvnE" alt="User" />
                </div>
                <div className="avatar">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJ9VVJanJCeYO1ym4fUqdZZBnxETwxuscH1sRF74q03D6Qmb5xogulMz3lrOv972QLOU18WBCZLl-bonw0rIFPz3vDSue6WjcZLNLsg6cwr7jxa3a4TwtyhWab1tRjUR2aDtLKiNrq18SMHZRcqpUI_jBfIjCMNnHvwubfuh8mRWatoc4kiFBvn3G_Ctp-uR3_0cVDYx0hnK4Izf5wMt6b1364HOd0ys4eiOLpSsu-O-CVo631AT6B7-vO1DV7aRJoPAW0dy_5kjw" alt="User" />
                </div>
              </div>
              <p className="trust-count">Join 10k+ happy users</p>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <p className="footer-col-title">Product</p>
              <ul>
                <li><a href="#">How it works</a></li>
                <li><a href="#">Pricing</a></li>
                <li><a href="#">Styles</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <p className="footer-col-title">Legal</p>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-copy">
            &copy; 2024 AI Persona Makeup Artist. All rights reserved.
          </div>
        </footer>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <a className="nav-item active" onClick={() => onNavigate('home')}>
          <span className="material-symbols-outlined">home</span>
          <p>Home</p>
        </a>
        <a className="nav-item" onClick={() => onNavigate('analysis')}>
          <span className="material-symbols-outlined">auto_awesome</span>
          <p>Analysis</p>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined">palette</span>
          <p>Styles</p>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined">person</span>
          <p>Profile</p>
        </a>
      </nav>

      {/* Spacer for bottom nav */}
      <div className="nav-spacer" />
    </div>
  )
}

export default HomePage
