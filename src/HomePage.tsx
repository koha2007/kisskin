interface HomePageProps {
  onNavigate: (page: 'home' | 'analysis') => void
}

function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="font-display bg-background-light text-slate-900 antialiased overflow-x-hidden">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full bg-background-light/80 backdrop-blur-md border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">flare</span>
            <span className="text-xl font-bold tracking-tight text-slate-900">KisSkin</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">How it Works</a>
            <a className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Styles</a>
            <a className="text-sm font-medium hover:text-primary transition-colors cursor-pointer">Pricing</a>
          </div>
          <button
            className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-primary/20"
            onClick={() => onNavigate('analysis')}
          >
            Try Now
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-12 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-8 order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Next-Gen Beauty Tech
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight text-slate-900">
                  One Photo, 9 <span className="text-primary">Stunning</span> Transformations
                </h1>
                <p className="text-lg md:text-xl text-slate-600 max-w-xl font-light leading-relaxed">
                  Upload a single selfie and let our AI reveal 9 professionally curated makeup styles tailored just for you.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/25 group"
                  onClick={() => onNavigate('analysis')}
                >
                  Start My Transformation
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <button className="border border-slate-200 hover:bg-slate-50 px-8 py-4 rounded-xl text-lg font-bold transition-all flex items-center justify-center">
                  View Samples
                </button>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-background-light bg-slate-200 overflow-hidden">
                    <img className="w-full h-full object-cover" alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMTv3DfXryRKQq1jYsNpvOhCP9GxF6DbQsXllv-WCSw5xN3kVc2hbcp00hicxiitM7X60D16JuVRM3f7g_6LXZW82TKJ1mUYBRp3VGolvyH00ojDoChcWcN3fLHNooUbGtDRA1JARofpjPVffjI5JqjuNKN0PO7LDIbUr-co-XKEUHCuhoOg1jthZ254cImnBGBl68J0zrBETKv40TM2wR8On9GfR2HNSuca3xvttJ7330npkyGCSmPgsmqJ-xiDIn6UBnC0GhyBXx" />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-background-light bg-slate-200 overflow-hidden">
                    <img className="w-full h-full object-cover" alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6FcmhE0rCCKuGMsJLaJdr_Pd8PIrlya0lrVQCUmNvQoJ1EBDhd71UL-5suUvxeJddtcIfvCUCbPvOAKQkO7BxBs7n5aclb-fOhdvhHGQyISzXVBS8lD47x8inbWaFOpi49JfUOjqu7NSx5a90qvKjcMk4uRdLUUqGWkWL3I3lKyy-81LJdnCWGBq0OKFIGDGn7B18rNM38wILkTondaxmpmd31KId3HcM2dUGU_FNGAyUhROSP4QGELA3dswcTmmWf3_ELJAP1cAS" />
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-background-light bg-slate-200 overflow-hidden">
                    <img className="w-full h-full object-cover" alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCG8fzEFPU7pjmydnACsRI4CRaPI012RTkzf1dxNYmScAR7RyMHYADRP2YUPOBZKdTeV7LZThrR0rLtoS2XWwR8rtGV1mGpaZXvvDs-yu4HqsrXmOlWkouV3m5SgD92ZnRxoQTwh_jf81juzLBon9TGW3fOnxH0aU5hNH0Td4ns4vEkV_ozT-3umRQRoqokC4cfYhdATVSg_aPl9STyCiMiq7COVWkqDWxquRMM-XmxMBu8QYSOJkK9ksihhm4oPaebtt_xJ8fORitF" />
                  </div>
                </div>
                <p>Joined by 50,000+ beauty enthusiasts</p>
              </div>
            </div>
            <div className="relative order-1 lg:order-2 group">
              <div className="absolute -inset-4 bg-primary/10 rounded-[2.5rem] blur-2xl group-hover:bg-primary/20 transition-all"></div>
              <div className="relative aspect-square md:aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/20 shadow-2xl">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDMk-5PuQM9fE7CE2kF8_gLPOhPdIKTC6gH8q2inJ_ZYGuwsXwhuTocE2MwIT6lcyT31thnOTXHchrVagaCisy6CqNVx1DBBMGhlk7XvlQcfB9t1VUhVDuV8QNgxRIblNnV1oWdzNhho5dDlQXVz8Y468xuWmtoIfNrYO6IRJs9yCG-fxYLilt-tjv989G9BSx-oLvZNka0xC8QefJcYEZk_wYR6PJ7yePv-SpCHRf4Dz3-5M3yogkmQeOSlAa9wfRu5KWxA6f-xoIM')" }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                {/* UI Overlay Element */}
                <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between text-white">
                  <div className="flex flex-col">
                    <span className="text-xs uppercase font-bold tracking-widest opacity-80">Style #04</span>
                    <span className="font-bold">Ethereal Glow</span>
                  </div>
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    <span className="w-2 h-2 rounded-full bg-white/40"></span>
                    <span className="w-2 h-2 rounded-full bg-white/40"></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl transition-all hover:bg-background-light group">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl">bolt</span>
              </div>
              <h3 className="text-xl font-bold">Instant Analysis</h3>
              <p className="text-slate-500 font-light">Advanced facial mapping delivers results in seconds, no waiting required.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl transition-all hover:bg-background-light group">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl">grid_view</span>
              </div>
              <h3 className="text-xl font-bold">9 Signature Styles</h3>
              <p className="text-slate-500 font-light">From 'Natural Glow' to 'K-pop Idol', explore a curated range of professional looks.</p>
            </div>
            <div className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl transition-all hover:bg-background-light group">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-4xl">camera</span>
              </div>
              <h3 className="text-xl font-bold">Studio Quality</h3>
              <p className="text-slate-500 font-light">Photorealistic rendering that looks like it was done by a celebrity MUA.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 flex flex-col items-center gap-4">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Your Journey to Radiance</h2>
            <div className="h-1.5 w-24 bg-primary rounded-full"></div>
          </div>
          <div className="relative grid md:grid-cols-3 gap-12 lg:gap-24">
            {/* Connectors for Desktop */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-slate-200 -z-10"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center text-center gap-6">
              <div className="relative w-24 h-24 rounded-full bg-white border-4 border-primary flex items-center justify-center text-primary shadow-xl">
                <span className="material-symbols-outlined text-4xl">upload_file</span>
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">1</div>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-2xl font-bold">Upload</h4>
                <p className="text-slate-500">Select your favorite high-res selfie from your library.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center gap-6">
              <div className="relative w-24 h-24 rounded-full bg-white border-4 border-primary flex items-center justify-center text-primary shadow-xl">
                <span className="material-symbols-outlined text-4xl">psychology</span>
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">2</div>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-2xl font-bold">AI Analyzes</h4>
                <p className="text-slate-500">Our engine maps your unique facial features and skin tone.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center gap-6">
              <div className="relative w-24 h-24 rounded-full bg-white border-4 border-primary flex items-center justify-center text-primary shadow-xl">
                <span className="material-symbols-outlined text-4xl">auto_awesome</span>
                <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">3</div>
              </div>
              <div className="flex flex-col gap-2">
                <h4 className="text-2xl font-bold">Reveal</h4>
                <p className="text-slate-500">Instantly explore 9 stunning versions of yourself.</p>
              </div>
            </div>
          </div>

          <div className="mt-20 text-center">
            <button
              className="bg-primary hover:bg-primary/90 text-white px-10 py-5 rounded-2xl text-xl font-extrabold transition-all shadow-2xl shadow-primary/30"
              onClick={() => onNavigate('analysis')}
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2 lg:col-span-2 flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl">flare</span>
                <span className="text-2xl font-bold tracking-tight">KisSkin</span>
              </div>
              <p className="text-slate-500 max-w-sm font-light">
                Redefining beauty through the lens of artificial intelligence. Discover your perfect look with studio-grade precision.
              </p>
              <div className="flex gap-4">
                <a className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-xl">share</span>
                </a>
                <a className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-xl">public</span>
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="font-bold text-slate-900">Product</h5>
              <ul className="flex flex-col gap-3 text-slate-500 text-sm">
                <li><a className="hover:text-primary transition-colors cursor-pointer">How it Works</a></li>
                <li><a className="hover:text-primary transition-colors cursor-pointer">Style Gallery</a></li>
                <li><a className="hover:text-primary transition-colors cursor-pointer">Success Stories</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="font-bold text-slate-900">Company</h5>
              <ul className="flex flex-col gap-3 text-slate-500 text-sm">
                <li><a className="hover:text-primary transition-colors cursor-pointer">About Us</a></li>
                <li><a className="hover:text-primary transition-colors cursor-pointer">Privacy Policy</a></li>
                <li><a className="hover:text-primary transition-colors cursor-pointer">Terms of Service</a></li>
              </ul>
            </div>
            <div className="flex flex-col gap-4">
              <h5 className="font-bold text-slate-900">Support</h5>
              <ul className="flex flex-col gap-3 text-slate-500 text-sm">
                <li><a className="hover:text-primary transition-colors cursor-pointer">Help Center</a></li>
                <li><a className="hover:text-primary transition-colors cursor-pointer">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 text-center">
            <p className="text-slate-500 text-xs uppercase tracking-widest font-medium">
              &copy; 2024 KisSkin. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
