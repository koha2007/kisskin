interface HomePageProps {
  onNavigate: (page: 'home' | 'analysis') => void
}

const STYLES = [
  { name: 'Natural Glow', icon: 'wb_sunny', color: 'from-amber-200 to-orange-300', desc: '촉촉한 광채 피부' },
  { name: 'Cloud Skin', icon: 'cloud', color: 'from-sky-200 to-blue-300', desc: '뽀얀 구름 피부' },
  { name: 'Blood Lip', icon: 'favorite', color: 'from-red-400 to-rose-600', desc: '진한 버건디 립' },
  { name: 'Maximalist Eye', icon: 'visibility', color: 'from-violet-400 to-purple-600', desc: '화려한 컬러 아이' },
  { name: 'Metallic Eye', icon: 'diamond', color: 'from-yellow-300 to-amber-500', desc: '메탈릭 골드/실버' },
  { name: 'Bold Lip', icon: 'local_fire_department', color: 'from-red-500 to-pink-600', desc: '선명한 강렬 립' },
  { name: 'Blush Draping', icon: 'spa', color: 'from-pink-300 to-rose-400', desc: '블러쉬 레이어링' },
  { name: 'Grunge', icon: 'contrast', color: 'from-slate-500 to-zinc-700', desc: '다크 스모키 그런지' },
  { name: 'K-pop Idol', icon: 'star', color: 'from-pink-400 to-fuchsia-500', desc: '유리알 아이돌 메이크업' },
]

function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="font-display bg-background-light text-slate-900 antialiased overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">flare</span>
            <span className="text-xl font-bold tracking-tight text-slate-900">KisSkin</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#styles" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Styles</a>
            <a href="#how" className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">How it Works</a>
          </div>
          <button
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20"
            onClick={() => onNavigate('analysis')}
          >
            Try Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative py-16 lg:py-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-pink-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="flex flex-col gap-8 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                AI Beauty Technology
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-slate-900">
                One Photo,<br />
                <span className="text-primary">9 Stunning</span><br />
                Makeup Looks
              </h1>
              <p className="text-lg text-slate-500 max-w-lg font-light leading-relaxed">
                Upload a selfie and our AI creates 9 professional makeup transformations with personalized product recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/25 group"
                  onClick={() => onNavigate('analysis')}
                >
                  Start Free Analysis
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <a
                  href="#styles"
                  className="border border-slate-200 hover:border-primary/30 hover:bg-primary/5 px-8 py-4 rounded-2xl text-lg font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-primary">grid_view</span>
                  View 9 Styles
                </a>
              </div>
              <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <span key={i} className="material-symbols-outlined text-amber-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-sm text-slate-500">Trusted by <strong className="text-slate-700">50,000+</strong> users worldwide</p>
              </div>
            </div>

            {/* Hero Visual - 3x3 Grid Preview */}
            <div className="relative order-1 lg:order-2">
              <div className="absolute -inset-6 bg-gradient-to-br from-primary/10 via-pink-100/50 to-amber-100/50 rounded-[3rem] blur-2xl"></div>
              <div className="relative bg-white rounded-[2rem] p-5 shadow-2xl border border-slate-100">
                <div className="grid grid-cols-3 gap-2">
                  {STYLES.map((s) => (
                    <div key={s.name} className="relative group cursor-pointer" onClick={() => onNavigate('analysis')}>
                      <div className={`aspect-square rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center transition-transform group-hover:scale-105`}>
                        <span className="material-symbols-outlined text-white text-3xl md:text-4xl drop-shadow-md" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                      </div>
                      <p className="text-[0.6rem] md:text-xs font-bold text-center mt-1.5 text-slate-700 leading-tight">{s.name}</p>
                    </div>
                  ))}
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-lg">auto_awesome</span>
                  AI Powered
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: 'bolt', title: 'Instant Analysis', desc: 'AI analyzes your face and generates 9 looks in under 60 seconds.' },
              { icon: 'palette', title: 'Smart Recommendations', desc: 'Get personalized product recommendations with direct purchase links.' },
              { icon: 'devices', title: 'Works Everywhere', desc: 'Upload from camera or gallery on any device — Galaxy, iPhone, or PC.' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className="text-slate-500 text-sm font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9 Styles Showcase */}
      <section id="styles" className="py-24 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 flex flex-col items-center gap-4">
            <span className="text-primary text-sm font-bold uppercase tracking-widest">Makeup Collection</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">9 Signature Styles</h2>
            <p className="text-slate-500 max-w-lg font-light">From natural everyday to bold editorial — find the perfect look for every occasion.</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-6 max-w-3xl mx-auto">
            {STYLES.map((s, i) => (
              <div
                key={s.name}
                className="group cursor-pointer"
                onClick={() => onNavigate('analysis')}
              >
                <div className={`aspect-square rounded-2xl md:rounded-3xl bg-gradient-to-br ${s.color} flex flex-col items-center justify-center gap-2 p-3 transition-all group-hover:scale-105 group-hover:shadow-xl relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all"></div>
                  <span className="material-symbols-outlined text-white text-4xl md:text-5xl drop-shadow-md relative" style={{ fontVariationSettings: "'FILL' 1" }}>{s.icon}</span>
                  <span className="absolute top-2 right-2 w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">{i + 1}</span>
                </div>
                <div className="mt-2 md:mt-3 text-center">
                  <p className="text-xs md:text-sm font-bold text-slate-800">{s.name}</p>
                  <p className="text-[0.6rem] md:text-xs text-slate-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-14 text-center">
            <button
              className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-2xl text-lg font-bold transition-all shadow-xl shadow-primary/25 inline-flex items-center gap-2"
              onClick={() => onNavigate('analysis')}
            >
              Try All 9 Styles
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how" className="py-24 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 flex flex-col items-center gap-4">
            <span className="text-primary text-sm font-bold uppercase tracking-widest">Simple Process</span>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">3 Easy Steps</h2>
          </div>
          <div className="relative grid md:grid-cols-3 gap-8 lg:gap-16 max-w-4xl mx-auto">
            {/* Connector line */}
            <div className="hidden md:block absolute top-14 left-[20%] right-[20%] h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20"></div>

            {[
              { num: '1', icon: 'photo_camera', title: 'Upload Photo', desc: 'Take a selfie or upload from your gallery' },
              { num: '2', icon: 'psychology', title: 'AI Analyzes', desc: 'Skin type, tone, and facial features are mapped' },
              { num: '3', icon: 'auto_awesome', title: 'Get Results', desc: '9 makeup styles + personalized product picks' },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center gap-5 relative">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary/10 to-pink-50 flex items-center justify-center border-2 border-primary/20">
                    <span className="material-symbols-outlined text-primary text-5xl">{step.icon}</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-sm shadow-lg">{step.num}</div>
                </div>
                <h4 className="text-xl font-bold">{step.title}</h4>
                <p className="text-slate-500 text-sm font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-pink-50 to-amber-50"></div>
        <div className="max-w-3xl mx-auto px-4 text-center relative">
          <span className="material-symbols-outlined text-primary text-6xl mb-6 block">auto_awesome</span>
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-6">
            Ready to Discover<br />Your Best Look?
          </h2>
          <p className="text-lg text-slate-500 font-light mb-10 max-w-lg mx-auto">
            Join thousands of users who found their signature style with KisSkin's AI technology.
          </p>
          <button
            className="bg-primary hover:bg-primary/90 text-white px-12 py-5 rounded-2xl text-xl font-extrabold transition-all shadow-2xl shadow-primary/30 inline-flex items-center gap-3"
            onClick={() => onNavigate('analysis')}
          >
            Start Free Analysis
            <span className="material-symbols-outlined text-2xl">arrow_forward</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">flare</span>
                <span className="text-2xl font-bold tracking-tight">KisSkin</span>
              </div>
              <p className="text-slate-400 text-sm font-light leading-relaxed max-w-xs">
                AI-powered makeup analysis and personalized beauty recommendations for everyone.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-sm uppercase tracking-wider text-slate-300">Product</h5>
              <ul className="flex flex-col gap-2 text-slate-400 text-sm">
                <li><a href="#styles" className="hover:text-primary transition-colors cursor-pointer">9 Styles</a></li>
                <li><a href="#how" className="hover:text-primary transition-colors cursor-pointer">How it Works</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-3">
              <h5 className="font-bold text-sm uppercase tracking-wider text-slate-300">Legal</h5>
              <ul className="flex flex-col gap-2 text-slate-400 text-sm">
                <li><a className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</a></li>
                <li><a className="hover:text-primary transition-colors cursor-pointer">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-xs">&copy; 2026 KisSkin. All rights reserved.</p>
            <p className="text-slate-600 text-xs">Powered by AI</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
