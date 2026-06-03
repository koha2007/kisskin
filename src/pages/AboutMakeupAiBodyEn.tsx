import { useI18n } from '../i18n/I18nContext'

export const WOMEN_STYLES_EN = [
  {
    name: 'Cloudglow Skin',
    desc: 'The evolution of glass skin — a soft, cloud-like radiant base finished with a glossy nude lip. Luminous, translucent skin that flatters nearly every personal color season; the heart of the 2026 cloud-glow trend.',
  },
  {
    name: 'Idol Blur Base',
    desc: 'That filter-smooth K-pop idol complexion. A blur base softly diffuses imperfections and adds a quiet glow, for the flawless skin impression of a photo app left on.',
  },
  {
    name: 'Blurred Gradient Tint',
    desc: 'A gradient rose tint that is deepest at the center and fades toward the edges. The blurred boundary reads as natural color rising under the surface — the canon "did-she-or-didn\'t-she" K-beauty lip.',
  },
  {
    name: 'Berry Stain Lip',
    desc: 'The 2026 global berry-and-wine stained lip. A deep berry shade that looks soaked into the lips for a chic, moody impression — especially flattering on autumn and winter cool tones.',
  },
  {
    name: 'Glazed Lavender Lip',
    desc: 'A glossy lavender-mauve nude lip — the 2026 new-nude trend. A calm, lavender-tinted muted base finished with a clean eye for a refined, current impression.',
  },
  {
    name: 'K-Pop Idol Shimmer',
    desc: 'Inner-corner highlighter, pink shimmer eyeshadow, and a glossy pink lip — the three-beat stage formula seen on Jennie and IVE. The global icon of K-beauty that spread worldwide with the K-pop fandom.',
  },
  {
    name: 'Watercolor Flush',
    desc: 'A watercolor-soft blush carried up toward the under-eye. The flush blooms like you just finished a workout, for a youthful, lively impression — a 2026 blush trend.',
  },
  {
    name: 'Lingerie Nude',
    desc: 'A soft, sensual neutral mood, like lingerie. A muted beige soft-matte lip melts into the skin with a rosy blush — a quiet yet atmospheric 2026 trend look.',
  },
  {
    name: 'Copper Auburn Hair',
    desc: 'A hair-color change rather than makeup. Copper auburn is a leading 2026 global hair-color trend — your face stays exactly the same while only the hair color shifts, so you can preview the mood change.',
  },
]

export const MEN_STYLES_EN = [
  {
    name: 'Chok-Chok Glow',
    desc: 'Dewy, healthy skin with a hydrated K-pop-idol sheen on the forehead, nose tip, and cheekbones. Just enough cover on blemishes to read as "naturally good skin" — the default Korean men\'s approach.',
  },
  {
    name: 'Idol Blur Skin',
    desc: 'A filter-smooth base. Pores and blemishes are softly blurred for a clean skin impression even on camera and video calls — a restrained men\'s blur correction.',
  },
  {
    name: 'No-Makeup Base',
    desc: 'BB-cream-level natural correction. Skin texture, pores, and stubble stay intact while only the tone is smoothed — the "polished but unseen" approach most recommended for first-time men.',
  },
  {
    name: 'Tinted Lip Balm',
    desc: 'Just a hint of natural color on the lips, like a tinted balm. It lifts dull lips to a healthy tone for a tidy impression with no visible makeup — the easiest men\'s accent.',
  },
  {
    name: 'Healthy Flush',
    desc: 'A subtle, healthy flush across the cheeks. It adds a natural just-exercised vitality to fix a pale or tired look — a restrained men\'s blush.',
  },
  {
    name: 'K-Pop Idol Liner',
    desc: 'A gel-eyeliner accent that sharpens the eyes. The masculine face stays intact while the gaze turns defined like a male idol on stage — a balanced, crowd-pleasing style.',
  },
  {
    name: 'Smoky Brown Eye',
    desc: 'A restrained smudged smoky eye in brown and dark khaki. It builds sharp presence without going overboard — the men\'s read on the 2026 grunge revival.',
  },
  {
    name: 'Defined Brow',
    desc: 'Tidies the brows and fills gaps for a crisp, defined shape — the 2026 brow trend. Grooming the brows alone makes the whole face read neater and sharper, a core men\'s grooming step.',
  },
  {
    name: 'Ash Brown Hair',
    desc: 'A hair-color change rather than makeup. Ash brown is a leading 2026 global hair-color trend — your face stays exactly the same while only the hair color shifts to a calm ash brown.',
  },
]

export const FAQ_EN = [
  {
    q: 'Makeup MBTI, personal color, face shape — which one should I do first?',
    a: 'In general, the recommended order is face shape → personal color → makeup MBTI. Face shape sets the basic frame for contouring, personal color confirms the range of shades that suit you, and makeup MBTI suggests the styles inside that range that match your personality. Knowing all three lets you build the most systematic personal formula.',
  },
  {
    q: 'How close to real makeup are the AI results?',
    a: 'kissinskin\'s AI uses a generative model trained on actual lighting reaction on skin, so the results are very close to real-world application. They are not 100% identical, however, and are best used as a "reference image" — a way to check if a look will suit you before buying products.',
  },
  {
    q: 'Are uploaded photos stored on your servers?',
    a: 'Original photos are deleted immediately after analysis; only an anonymized face vector is used to generate results. See our Privacy Policy for the full detail.',
  },
  {
    q: 'I am a woman — can I try the men\'s styles too?',
    a: 'Yes. The AI applies any style without gender restriction. Try whichever style fits your taste and the mood you want.',
  },
  {
    q: 'Can I share the results on social media?',
    a: 'Yes. The result page has share buttons for Instagram, KakaoTalk, X, and more. AI-generated images carry a watermark, and since the content includes your face, decide carefully where you share it.',
  },
]

export default function AboutMakeupAiBodyEn() {
  const { t } = useI18n()
  return (
    <article className="py-14 md:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 prose max-w-none text-slate-700 leading-relaxed text-[15px] md:text-[17px]">

        <section id="history" className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">1. A short history of K-beauty makeup</h2>
          <p className="mb-4">The look we now call "K-beauty" was built fast — over the roughly fifteen years since the early 2010s. Before that, Korean makeup leaned heavily on either Japanese-style polish (clean, refined adult looks) or Western-style contouring (defined, sculpted features). It was the global rise of K-pop and K-dramas in the early 2010s that forced a separate "Korean aesthetic" to emerge.</p>
          <p className="mb-4">The cushion foundation, around 2013–2015, was K-beauty\'s first global turning point. The format AmorePacific developed became the standard for portable application and that signature "wet-skin" finish. From this period the global narrative of "Koreans = great skin" took hold, and Korean coinages like Glass Skin and Cloud Skin started appearing in English-language beauty press.</p>
          <p className="mb-4">2016–2019 was when the color story turned distinctly Korean. The icons of this era are Blood Lip — a flushed-from-within tint — and Gradient Lip — color that radiates out from the center. Both share the "did-she-or-didn\'t-she" philosophy: the goal is healthy color without obvious application. Eyeshadow palettes also picked up a Korean canon during this stretch: tone-on-tone layering instead of single-color statements.</p>
          <p className="mb-4">From 2020 onward came the era of personalization. During the pandemic, "mask makeup" — skipping the covered area, concentrating on the eye — drove the rise of the Maximalist Eye. From 2023 forward, men\'s makeup mainstreamed quickly, giving terms like Skincare Hybrid, Monochrome, and Utility Makeup their own slots in the lexicon. As of 2025–2026 the dominant theme is "makeup that reflects your individual persona" — which is exactly the demand context behind Makeup MBTI, personal color, and face-shape diagnostic content like the tools on this site.</p>
        </section>

        <section id="philosophy" className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">2. The K-beauty aesthetic — why the world watches</h2>
          <p className="mb-4">K-beauty\'s global appeal is not really about a single "style." It is about an unusual <strong>aesthetic philosophy</strong>, and that philosophy reduces to three principles.</p>
          <p className="mb-4"><strong>One: translucency over coverage.</strong> Where Western full-coverage foundation prioritizes "hide the imperfection," K-beauty pursues the opposite — "let the healthy underlying skin read through." Cushion, Cloud Skin, and Glass Skin are all techniques for making the skin look alive. The trick is not just applying lightly — it is the layering order and the texture combinations that produce a translucent but uniform finish.</p>
          <p className="mb-4"><strong>Two: precise casualness.</strong> The phrase "kkooan-kkoo" — "did-she-or-didn\'t-she" — describes K-beauty better than anything else. The reality is many steps (5–10 in skincare, 3–4 in base, 4–6 in color), but the result is meant to read "barely done." This is the opposite direction from a Western "clear visible transformation," and it lines up with a broader Korean cultural preference for understated polish.</p>
          <p className="mb-4"><strong>Three: makeup as emotional expression.</strong> K-beauty treats makeup not just as a tool to "look pretty" but as a tool to "express today\'s mood." A different lip color shifts the mood of the day; the placement of an eyeshadow accent assigns a character to your face. This same philosophy is the headwater of the diagnostic-and-style-match content stream this site publishes.</p>
        </section>

        <section id="women-styles" className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">3. Nine signature K-beauty styles for women</h2>
          <p className="mb-6">kissinskin simulates the nine most representative Korean women\'s makeup styles for 2026 (eight makeup looks plus one hair color), all rendered on your device. The essentials of each:</p>
          <div className="space-y-5 not-prose">
            {WOMEN_STYLES_EN.map((s) => (
              <div key={s.name} className="bg-white rounded-2xl p-5 border border-pink-100">
                <h3 className="font-extrabold text-primary-dark mb-1">{s.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="men-styles" className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">4. Nine signature K-beauty styles for men</h2>
          <p className="mb-6">Men\'s makeup mainstreamed sharply from 2023 onward, and kissinskin offers nine male-specific styles. The base principle for men\'s makeup is "polished but unseen."</p>
          <div className="space-y-5 not-prose">
            {MEN_STYLES_EN.map((s) => (
              <div key={s.name} className="bg-white rounded-2xl p-5 border border-blue-100">
                <h3 className="font-extrabold text-blue-600 mb-1">{s.name}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="ai-principle" className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">5. How the AI simulation works</h2>
          <p className="mb-4">The kissinskin AI makeup simulation runs in three stages.</p>
          <p className="mb-4"><strong>Stage 1 · Face analysis.</strong> The uploaded photo is processed to extract 68–98 facial landmarks (eyes, nose, lips, cheekbones, jaw). From these, the system computes face shape, skin tone, and eye/lip ratios. The data is processed only as an anonymized vector; the original photo is never stored on the server.</p>
          <p className="mb-4"><strong>Stage 2 · Style mapping.</strong> The selected style (Cloudglow Skin, Berry Stain Lip, etc.) loads its "style profile" into the AI. Each profile is the result of training on hundreds of reference images and brand color formulas, dynamically adapted to your face vector — color, intensity, placement.</p>
          <p className="mb-4"><strong>Stage 3 · Generation and composite.</strong> The final image preserves your original facial structure and only blends the makeup layer on top. Personal identity (eye shape, mouth angle, cheekbone height) is preserved; only the makeup layer is applied. This rule is what prevents "looks like a different person" results — what you see is your actual face wearing that look.</p>
          <p className="mb-4">Makeup is composited on your own device (in the browser), not on a server. Because only the makeup layer is overlaid on top of your original photo, your face is preserved 100%, and you can pick any of the nine looks and switch between them in 1–2 seconds. Nine styles each (eight makeup looks plus one hair color) are offered for women and men, and the selected look can be opened, downloaded, or shared from the result page.</p>
        </section>

        <section id="photo-tips" className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">6. Photo tips that improve accuracy</h2>
          <p className="mb-4">The simulation\'s quality depends heavily on the input photo. Following these five rules typically improves output quality by 20–40%.</p>
          <ol className="list-decimal pl-5 space-y-3 mb-4">
            <li><strong>Face the camera directly with a neutral expression.</strong> Even a slight tilt distorts left/right symmetry and leaves the result feeling off. Look straight ahead, relaxed, no smile.</li>
            <li><strong>Natural light or color-neutral lighting.</strong> Yellow incandescent or color-shifted lighting reads the skin tone wrong. Window daylight is most accurate; indoors, aim for 5000–6500K white light.</li>
            <li><strong>Bare or barely-touched skin.</strong> A full face of makeup makes it harder for the AI to read your "base skin," and the results layer too thick. Bare skin after skincare or a single layer of cushion is ideal.</li>
            <li><strong>Don\'t cover the face with bangs.</strong> The forehead and hairline need to be visible for face-shape analysis to land correctly. Sweep a fringe to the side.</li>
            <li><strong>High resolution, vertical orientation.</strong> Horizontal phone shots distort face proportions. Use vertical (portrait) orientation at minimum 1080px resolution.</li>
          </ol>
        </section>

        <section id="faq" className="mb-14">
          <h2 className="text-2xl md:text-3xl font-extrabold text-navy tracking-tight mb-5">7. Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQ_EN.map((f) => (
              <details key={f.q} className="bg-white rounded-2xl p-5 border border-pink-100">
                <summary className="font-bold text-navy-mid cursor-pointer">{f.q}</summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mb-14">
          <div className="bg-gradient-to-br from-pink-50 via-rose-50 to-purple-50 rounded-3xl p-8 md:p-10 text-center">
            <span
              className="material-symbols-outlined text-primary text-5xl mb-4 block"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-navy mb-3">Theory covered. Time to try it on yourself?</h2>
            <p className="text-slate-600 mb-6 max-w-lg mx-auto text-sm md:text-base">
              Run all six styles on your own face. You\'ll see which one fits within seconds.
            </p>
            <a
              href="/analysis/"
              className="bg-gradient-to-r from-primary to-pink-500 text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-primary/25 inline-flex items-center gap-2"
            >
              {t('tools.common.aiMakeupStart')}
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </div>
        </section>

      </div>
    </article>
  )
}

export const ABOUT_MAKEUP_AI_HERO_EN = {
  badge: 'Complete K-beauty makeup guide',
  title: 'Everything K-beauty makeup',
  subtitle:
    'History, nine women\'s styles, nine men\'s styles, how the AI simulation works, photo tips — a 3,000-word in-depth guide for both first-timers and working beauty editors.',
  toc: [
    ['#history', '1. A short history of K-beauty makeup'],
    ['#philosophy', '2. The K-beauty aesthetic — why the world watches'],
    ['#women-styles', '3. Nine signature K-beauty styles for women'],
    ['#men-styles', '4. Nine signature K-beauty styles for men'],
    ['#ai-principle', '5. How the AI simulation works'],
    ['#photo-tips', '6. Photo tips that improve accuracy'],
    ['#faq', '7. Frequently asked questions'],
  ] as const,
  tocLabel: 'Contents',
}
