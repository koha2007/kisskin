// Makeup MBTI — English overrides for the 16 personas.
// Mirrors `MAKEUP_MBTI_TYPES` keys in types.ts.
//
// ⚠️ 2026-07-14: `detailParagraphs` 와 `hashtags` 가 여기 없어서 영문 유형 페이지는
//    **본문을 아예 렌더하지 않았고**(MakeupMbtiResult 의 `!isEn` 게이트) **한글 해시태그가
//    영문 페이지에 그대로 노출**되고 있었다. 그 결과 16개 유형 페이지가 서로 85% 동일해져
//    구글이 전부 "크롤링됨 – 색인 안 됨"으로 버렸다. 두 필드를 필수로 만들어 되풀이를 막는다.
import type { MbtiCode } from './types'

export interface MakeupMbtiTypeEn {
  enPersona: string                 // Display label, e.g. "The Architect"
  tagline: string
  shortDesc: string
  /** Long-form body — the only thing that makes this page different from the other 15. */
  detailParagraphs: string[]
  /** English hashtags. Without these the Korean ones leak onto the English page. */
  hashtags: string[]
  traits: { icon: string; title: string; desc: string }[]
  signature: { lip: string; eye: string; base: string; blush: string }
  recommended: {
    women: { reason: string }
    men: { reason: string }
  }
  vibes: string[]
  avoidTip: string
  boostTip: string
}

export const MAKEUP_MBTI_EN: Record<MbtiCode, MakeupMbtiTypeEn> = {
  INTJ: {
    enPersona: 'The Architect',
    tagline: 'Calculated, structural — a metallic signature drawn like a blueprint',
    shortDesc:
      'INTJ makeup is engineered. A restrained background with one precise statement piece — a metallic eye, a sharp lip — that completes the look with calculated intensity.',
    detailParagraphs: [
      'The Architect, INTJ, approaches beauty like a well-engineered design. Your makeup isn\'t about fleeting trends; it\'s a structural masterpiece. Every element is a calculated decision, placed with precision to create maximum impact with minimal effort. This calculated intensity is your signature, reflecting your desire for proven excellence and strategic execution in every facet of life.',
      'Build your blueprint starting with a semi-matte base, creating a flawless canvas. Next, the star: a gunmetal metallic eye, applied with sharp angles, perhaps a precise liner or a single wash of shimmer. For lips, a sophisticated MLBB beige nude keeps the focus on your eyes. Finish with a natural coral blush, subtly sculpted to enhance your facial architecture.',
      'INTJs often err by resisting any deviation from their established formula. While consistency is key, avoiding heavy blur or smoky, soft moods can make your look too rigid. Once a season, integrate a single accent color—a plum lipstick or an emerald liner—to refresh your verified system without sacrificing your geometric precision.',
      'For everyday, your signature offers a refined, minimalist presence. When stakes are high, the core structure remains, but the metallic intensity of the eye can be amplified. Consider a bolder gunmetal wing or a richer, deeper tone of your MLBB nude, maintaining your calculated intensity for a powerful, unshakeable presence.',
    ],
    hashtags: [
      '#INTJMakeup',
      '#TheArchitectBeauty',
      '#EngineeredBeauty',
      '#CalculatedGlam',
    ],
    traits: [
      { icon: 'architecture', title: 'Structural design', desc: 'Each highlight and angle is placed by intention, not impulse.' },
      { icon: 'gavel', title: 'Verified rotation', desc: 'Once a product earns the slot, it stays for years.' },
      { icon: 'diamond', title: 'Minimal presence', desc: 'Maximum impact from the smallest possible kit.' },
    ],
    signature: { lip: 'MLBB beige nude', eye: 'Gunmetal metallic', base: 'Semi-matte', blush: 'Natural coral' },
    recommended: {
      women: {
        reason: 'A precision metallic eye lines up exactly with INTJ\'s "calculated intensity."',
      },
      men: {
        reason: 'A single-tone monochrome look fits the restraint and structure of an INTJ kit perfectly.',
      },
    },
    vibes: ['editorial', 'studio', 'architectural', 'evening'],
    avoidTip: 'Heavy blur or smoky-soft moods read uncomfortable when your design is this geometric.',
    boostTip: 'Once a season, swap in a single accent color (red, plum, emerald) to refresh the formula.',
  },

  INTP: {
    enPersona: 'The Alchemist',
    tagline: 'A theorist who tests the color combinations no one else attempts',
    shortDesc:
      'INTP makeup runs like a lab. You analytically explore unexpected color combinations and build your own private theory of why they work.',
    detailParagraphs: [
      'The Alchemist, INTP, approaches makeup like a scientific inquiry. You\'re drawn to unexpected color combinations, not for shock value, but to analytically explore their underlying principles. Your personal theory dictates every shade, questioning conventional pairings and seeking new harmonies through meticulous experimentation. This isn\'t about following trends, but about proving your hypothesis on how disparate colors can coalesce into a unique, reasoned aesthetic.',
      'For your signature look, start with a \'Natural Glow\' base, letting your skin\'s true texture shine. Move to eyes, defining with \'Underline Violet\' for an unconventional pop—think a precise liquid liner or a smudged pencil along the lower lash line. Then, apply \'Mocha Brown\' to lips, a rich, grounding tone. Finish with a \'Coral Orange\' blush, strategically placed to add warmth without overpowering your carefully constructed color story, ensuring each shade works in concert.',
      'INTPs often stumble by over-complicating their experiments, leading to muddy or chaotic results. Your intellectual curiosity can lead to too many layers or a blend of too many colors, diluting the impact of your precise theories. The fix is elegant simplicity: cap your color palette at three distinct shades per look. This sharpens your intellectual edge, forcing a more refined analysis of color interaction, and dramatically elevates the final quality of your unique creations.',
      'For everyday, the Alchemist\'s look is a subtle demonstration of your theories, perhaps just the \'Underline Violet\' and \'Mocha Brown\' to hint at your analytical mind. When the stakes are higher, you lean into strategic layering, not more colors. Intensify the \'Underline Violet\' with a deeper pigment or add a subtle shimmer, and refine the \'Mocha Brown\' lip with a precise, opaque application. The \'Coral Orange\' blush can be built up for a more defined contour, subtly emphasizing your calculated artistry.',
    ],
    hashtags: [
      '#TheAlchemist',
      '#AnalyticBeauty',
      '#ColorTheoryMakeup',
      '#ExperimentalChic',
    ],
    traits: [
      { icon: 'science', title: 'Color experiment', desc: 'Question the rules; test new combinations.' },
      { icon: 'layers', title: 'Layered logic', desc: 'Place accent color in unconventional spots — under-line, inner corner.' },
      { icon: 'hub', title: 'Personal theory', desc: 'Every pick comes with your own reasoning.' },
    ],
    signature: { lip: 'Mocha brown', eye: 'Under-line violet', base: 'Natural glow', blush: 'Coral orange' },
    recommended: {
      women: {
        reason: 'The maximalist eye is the largest playground for the unconventional layering INTP loves.',
      },
      men: {
        reason: 'Color-point eye nails the partial-accent style that produces an INTP "make-them-think" look.',
      },
    },
    vibes: ['conceptual', 'art', 'editorial', 'alternative'],
    avoidTip: 'Trend-following without your own interpretation strips out the very thing that makes the look feel INTP.',
    boostTip: 'Cap each look at three colors. The intellectual edge stays; finish quality jumps.',
  },

  ENTJ: {
    enPersona: 'The Commander',
    tagline: 'One red lip and the room is yours',
    shortDesc:
      'For ENTJ, makeup is a performance tool. A defined red lip, a structural liner, a sharp contour — a powerful signature designed to own the room.',
    detailParagraphs: [
      'For the ENTJ, The Commander, makeup isn\'t a casual adornment; it\'s a strategic performance tool. You understand that a single, impactful red lip speaks volumes, instantly commanding attention and establishing your presence. Your efficiency-driven nature demands a routine that\'s swift yet high-impact, focusing on precise elements that convey authority and unwavering confidence.',
      'Achieving your signature look starts with a flawless semi-matte base, providing the perfect canvas for command. Next, define your gaze with a sharp black liquid liner, creating a structural, decisive line. Then, unleash your power with a classic red lip—a single stroke is often all you need. Finish with a touch of rose wood blush for a refined, balanced complexion.',
      'Your biggest misstep? Overlooking the subtle power of approachability. While glitter or heavy glow might dilute your professional signal, entirely avoiding softer touches can make your charisma seem unyielding. Incorporate one weekly \'soft moment\' – a tinted lip balm or a whisper of pink blush – to ensure your leadership is also perceived as approachable.',
      'For your high-stakes moments, double down on your signature: a bolder classic red, a more pronounced liner, and a sharper contour. For everyday, maintain the semi-matte base and defined eye, perhaps opting for a slightly less intense red or even a tinted lip for that touch of approachability, while still projecting your inherent strength and purpose.',
    ],
    hashtags: [
      '#ENTJMakeup',
      '#TheCommander',
      '#PowerMakeup',
      '#StrategicBeauty',
    ],
    traits: [
      { icon: 'bolt', title: 'One-shot impact', desc: 'A single decisive accent over fussy layering.' },
      { icon: 'schedule', title: 'Five-minute efficiency', desc: 'Short routine, premium investment per item.' },
      { icon: 'military_tech', title: 'Performance tool', desc: 'Makeup as an instrument of impression design.' },
    ],
    signature: { lip: 'Classic red', eye: 'Black liquid liner', base: 'Semi-matte', blush: 'Rose wood' },
    recommended: {
      women: {
        reason: 'A clear red focal point captures the room — exactly what ENTJ presence is built for.',
      },
      men: {
        reason: 'Functional, no-frills polish matches the pragmatism that drives an ENTJ kit.',
      },
    },
    vibes: ['power suit', 'boardroom', 'executive', 'runway'],
    avoidTip: 'Glitter or heavy glow dilutes the professionalism signal you want to send.',
    boostTip: 'Add one weekly soft moment — a tinted lip or pink blush — so charisma reads as approachable too.',
  },

  ENTP: {
    enPersona: 'The Trendsetter',
    tagline: 'A different experiment every week — that\'s the signature',
    shortDesc:
      'ENTP "consistency" means consistently different. Grunge smoky one week, pastel inner-glow the next. The experiment itself is the look.',
    detailParagraphs: [
      'Meet The Trendsetter! For the ENTP, makeup isn\'t a routine; it\'s a dynamic canvas for endless experimentation. Your "consistency" lies in constantly evolving, pushing boundaries, and making every week a new beauty adventure. From grunge smoky to pastel inner-glow, the thrill of the experiment itself is your ultimate look, reflecting your bold, inquisitive spirit.',
      'Ready to build your signature? Start with a dewy, glossy base using a hydrating serum-foundation. Next, define eyes with a smudged smoky effect – think a kohl pencil blended out for that perfectly undone look. For lips, a vibrant blood tint applied with a dab-and-blend technique adds an edgy flush. Finish with a diffused red blush, softly blended on the apples of your cheeks for a cohesive, artistic statement.',
      'Your biggest trap? Falling for every new trend simultaneously. Mixing four+ distinct ideas into one face can look fragmented, not fearlessly bold. Instead, embrace your monthly theme. Dedicate two weeks to fully exploring one palette, mastering the technique before moving on. This refines your execution, ensuring each new experiment is a triumph, not just a trial.',
      'From everyday to high-stakes, your look is effortlessly adaptable. For daily wear, simply soften the intensity: a sheerer lip tint and a lighter hand with the smoky shadow. When it\'s time to truly shine, amplify your signature. Deepen the blood tint, intensify the smudged liner, and perhaps add a subtle gloss to your glossy base for an extra dimension, solidifying your status as the ultimate trendsetter.',
    ],
    hashtags: [
      '#ENTPMakeup',
      '#TheTrendsetter',
      '#ExperimentalBeauty',
      '#KBeautyInnovator',
    ],
    traits: [
      { icon: 'bolt', title: 'Instant test', desc: 'First to try a trend, first to bend it into your version.' },
      { icon: 'palette', title: 'Monthly theme', desc: 'Reshuffle the entire palette once a month.' },
      { icon: 'all_inclusive', title: 'Cross-genre', desc: 'Mix grunge with pastel without flinching.' },
    ],
    signature: { lip: 'Blood tint', eye: 'Smudged smoky', base: 'Glossy', blush: 'Diffused red blush' },
    recommended: {
      women: {
        reason: 'Grunge is, philosophically, "breaking the perfect" — exactly the ENTP experimental impulse.',
      },
      men: {
        reason: 'Grunge smoky eye captures both the experiment and the popular appeal you want at once.',
      },
    },
    vibes: ['street', 'fashion week', 'viral', 'alternative'],
    avoidTip: 'Mixing four+ trend ideas into one face reads fragmented, not bold.',
    boostTip: 'Hold each theme for two weeks before swapping — the finish quality goes up sharply.',
  },

  INFJ: {
    enPersona: 'The Dreamweaver',
    tagline: 'Painting the inner mood, quietly, in blurred edges',
    shortDesc:
      'INFJ makeup blurs the inner mood onto the face like watercolor. Soft blush, diffused glow, smudged tint — soft-edged emotional makeup is the signature.',
    detailParagraphs: [
      'INFJ, The Dreamweaver, your makeup is an intimate reflection of your rich inner world. You gravitate towards soft, blurred edges because your emotions flow like watercolor, not rigid lines. Makeup isn\'t just color; it\'s a quiet ritual, a moment of self-improvement that harmonizes your day, connecting you to the deeper narrative behind each product.',
      'Cultivate your signature look starting with \'Cloud Skin\' – a diffused, glowing base, achieving that coveted boundary blur. For eyes, a whisper of \'Lavender Mauve\' eyeshadow, softly blended. Lips come alive with a \'Blurred Tint\' – apply and gently smudge for that lived-in, emotional stain. Finish with \'Lilac Soft\' blush, diffused onto the apples of your cheeks for a dreamlike flush.',
      'Your gentle nature often makes heavy matte full-face makeup feel jarringly cold against your warm, nuanced spirit. Instead of striving for sharp contour or opaque coverage, lean into the ethereal. Embrace sheer textures and soft focus finishes. Let your natural radiance shine through, enhanced by subtle blurring rather than masked by density.',
      'For everyday, your \'Blurred Tint\' lips and \'Cloud Skin\' base are your soft uniform. But for those high-stakes moments, don’t shy away from a deliberate, bold lip. This intentional pop against your characteristic softness creates an intriguing contrast, making your gentle presence even more impactful and memorable, without ever feeling out of character.',
    ],
    hashtags: [
      '#INFJDreamweaver',
      '#BlurredBeauty',
      '#EmotionalMakeup',
      '#QuietAlchemy',
    ],
    traits: [
      { icon: 'blur_on', title: 'Edges that blur', desc: 'Soft, diffused boundaries over hard lines.' },
      { icon: 'favorite', title: 'Brand narrative', desc: 'Story and philosophy behind the product matter.' },
      { icon: 'self_improvement', title: 'Tuning ritual', desc: 'The morning routine is a quiet meditation.' },
    ],
    signature: { lip: 'Blurred blood tint', eye: 'Lavender mauve', base: 'Cloud skin', blush: 'Lilac soft' },
    recommended: {
      women: {
        reason: 'Blush draping connects the whole face into one unified mood — exactly INFJ\'s emotional throughline.',
      },
      men: {
        reason: 'A blurred lip reads as the soft inner emotion INFJ wants to express outwardly.',
      },
    },
    vibes: ['dreamy', 'literary', 'moodboard', 'moonlight'],
    avoidTip: 'Heavy matte full-face makeup reads cold against the gentleness you actually live in.',
    boostTip: 'Once or twice a month, deliberately wear a bold lip — your softness reads sharper for it.',
  },

  INFP: {
    enPersona: 'The Stargazer',
    tagline: 'Pastel glitter and dream-state fantasy',
    shortDesc:
      'INFP makeup looks like a fantasy illustration. Pastel glitter, romantic lips, dreamy glow — a frame from a story translated to the face.',
    detailParagraphs: [
      'The INFP Stargazer finds beauty in the unseen, translating abstract dreams into tangible artistry. Your makeup isn\'t just color; it\'s a narrative, a whisper of a fantasy realm brought to life on your face. You gravitate towards ethereal pastels and twinkling glitters, creating looks that feel less like a trend and more like a cherished illustration.',
      'Begin your Stargazer journey with a luminous "Dewy Glow" base, a canvas for your dreams. Next, let your eyes sparkle with "Champagne Glitter," applied delicately to the center of your lid for that soft, dreamy twinkle. A "Glossy Peach" lip adds a touch of romantic warmth, followed by a flush of "Baby Pink" blush on the apples of your cheeks for an innocent, storybook charm.',
      'INFPs, in their love for all things whimsical, sometimes fall into the trap of over-sparkling. Multiple glitter zones paired with too many accent colors can fragment your ethereal vision instead of harmonizing it. Instead, focus on one key glitter point and one soft accent color to maintain that cohesive, dreamy romance without overwhelming your delicate aesthetic.',
      'For an everyday Stargazer look, a subtle sweep of champagne glitter and a hint of glossy peach suffice. When the stars align for a high-stakes occasion, amplify your signature elements: a more intense champagne glitter on the lid, a deeper peach on the lips, and a slightly bolder baby pink blush, ensuring your dreamy glow shines even brighter.',
    ],
    hashtags: [
      '#INFPStargazer',
      '#FantasyMakeup',
      '#PastelGlitter',
      '#DreamyGlow',
    ],
    traits: [
      { icon: 'auto_stories', title: 'Story-to-color', desc: 'Translate abstract inspiration into specific shades.' },
      { icon: 'auto_awesome', title: 'Glitter love', desc: 'Pastel sparkle for dream-state shimmer.' },
      { icon: 'collections', title: 'Emotion collection', desc: 'You collect colors for joy, not utility.' },
    ],
    signature: { lip: 'Glossy peach', eye: 'Champagne glitter', base: 'Dewy glow', blush: 'Baby pink' },
    recommended: {
      women: {
        reason: 'A pastel-glitter twist on the metallic eye reads most naturally as INFP fantasy.',
      },
      men: {
        reason: 'Vampire romantic catches both the dark fantasy and the inner narrative INFP carries.',
      },
    },
    vibes: ['fantasy', 'vintage', 'dreamy', 'romantic'],
    avoidTip: 'Multiple glitter zones plus multiple accent colors fragment instead of romanticize.',
    boostTip: 'One glitter point + one accent color: keeps everyday wearability and the romance both alive.',
  },

  ENFJ: {
    enPersona: 'The Muse',
    tagline: 'A warm light that draws people in',
    shortDesc:
      'ENFJ makeup transmits warmth. Peach blush, warm coral lip, a natural glow — a generous, inviting presence is the signature.',
    detailParagraphs: [
      'As "The Muse," ENFJs naturally draw people in with their warm, inviting presence. Your makeup isn\'t about transformation, but amplification – a reflection of your innate ability to create comfort and connection. It’s all about radiating that gentle, approachable glow that makes everyone feel at ease, a true embodiment of your \'warm light\' persona.',
      'Cultivate your signature look by starting with a glowy base, letting your natural radiance shine through. Next, define eyes with soft brown tones, keeping them inviting and approachable. A warm coral lip tint, your "Coral Blood Tint," adds a flush of life, followed by a generous sweep of peach coral blush to complete your generous, inviting presence.',
      'The biggest misstep for an ENFJ is embracing cold, stark matte finishes. This erases the very warmth that defines your essence. Instead, lean into textures and shades that enhance your natural glow. Choose luminous foundations, creamy blushes, and hydrating lip products to continuously project that signature warmth.',
      'For everyday, your balanced 20-25 minute routine centers on a shared, approachable warmth. When it\'s a high-stakes moment, elevate your look by swapping your coral lip for an intentional red. This instantly communicates leadership and passion, while still maintaining the fundamental warmth that is uniquely ENFJ.',
    ],
    hashtags: [
      '#ENFJMakeup',
      '#TheMuseGlow',
      '#WarmLightBeauty',
      '#GenerousGlam',
    ],
    traits: [
      { icon: 'favorite', title: 'Warmth by design', desc: 'Warm-tone first, so others feel at ease near you.' },
      { icon: 'diversity_3', title: 'Shared routine', desc: 'You enjoy trading product picks with friends.' },
      { icon: 'wb_sunny', title: '20–25 min balance', desc: 'A well-balanced routine, not too long, not too short.' },
    ],
    signature: { lip: 'Coral blood tint', eye: 'Soft brown', base: 'Glow', blush: 'Peach coral' },
    recommended: {
      women: {
        reason: 'Warm glow plus a from-within lip completes the inviting, warm impression ENFJ projects.',
      },
      men: {
        reason: 'K-pop idol balances charisma and warmth — the same duality ENFJ already carries.',
      },
    },
    vibes: ['warm', 'glow', 'community', 'sunday brunch'],
    avoidTip: 'Sticking only to cold mattes erases the warmth that is the ENFJ essence.',
    boostTip: 'For high-stakes moments, switch to an intentional red lip — warmth and leadership shown together.',
  },

  ENFP: {
    enPersona: "Today's Palette",
    tagline: 'A free painter who swaps colors with the mood',
    shortDesc:
      "ENFP is a different palette every day. Orange eye today, mauve lip tomorrow — colors dancing with mood and energy is the signature.",
    detailParagraphs: [
      'ENFP, the free painter who swaps colors with the mood! Your daily palette is a vibrant reflection of your inner world. One day it\'s an orange eye, the next a mauve lip—your makeup is a canvas where colors dance to your ever-shifting emotions and energy.',
      'For your signature look, start with a dewy glow base. For eyes, embrace layered colors, blending shades intuitively. Lips are ever-changing—coral, plum, or mauve, depending on your vibe. Finish with a blush that perfectly color-matches your chosen lip or eye shade.',
      'The daily reset can lead to decision fatigue and tardiness. Instead, try a loose weekday formula: Mon = coral, Wed = plum. This offers both creative freedom and efficiency, ensuring you\'re always vibrant and on time.',
      'From everyday to high-stakes, your look truly transforms with your mood. While daily makeup is spontaneous, for big moments, you might layer more intense colors on your eyes and opt for a bolder lip, still letting your emotions guide the palette.',
    ],
    hashtags: [
      '#ENFPMakeup',
      '#MoodPalette',
      '#SpontaneousBeauty',
      '#ColorChameleon',
    ],
    traits: [
      { icon: 'palette', title: 'Daily palette', desc: 'A new color scheme nearly every day.' },
      { icon: 'auto_awesome', title: 'Emotion-led color', desc: 'Mood is the first criterion for color choice.' },
      { icon: 'shuffle', title: 'Improvised styling', desc: 'No fixed sequence or fixed kit — pure freedom.' },
    ],
    signature: { lip: 'Variable — coral / plum / mauve', eye: 'Layered colors', base: 'Glow', blush: 'Color-matched blush' },
    recommended: {
      women: {
        reason: 'A layered, multi-color eye carries ENFP\'s many-sided emotional energy best.',
      },
      men: {
        reason: 'Color-point eye lets you express today\'s mood through one accent — clicks with ENFP freedom.',
      },
    },
    vibes: ['free', 'carnival', 'playful', 'creative'],
    avoidTip: 'Resetting everything every morning leads to decision fatigue — and being late.',
    boostTip: 'A loose weekday formula (Mon = coral, Wed = plum) gives freedom and efficiency at once.',
  },

  ISTJ: {
    enPersona: 'The Classicist',
    tagline: 'Verified routines — a ten-year natural formula',
    shortDesc:
      'ISTJ makeup is verified canon. A natural routine held for years, honestly revealing the healthy tone of the skin underneath.',
    detailParagraphs: [
      'The Classicist, your beauty philosophy is rooted in what works, consistently. You\'re the ultimate verificator, building your routine on products that have earned their place through years of repurchase. This isn\'t about chasing fleeting fads; it\'s about honoring the healthy, natural tone of your skin with a trusted, economical approach that prioritizes longevity and proven results. Your makeup is an extension of your meticulous, honest nature, revealing your authentic self.',
      'Cultivate your signature look starting with a semi-matte base, applied evenly for a refined canvas that lets your skin\'s natural health shine through. Define eyes with a natural brown shadow, using a soft wash across the lid and a touch along the lower lash line for subtle depth. Complete with an MLBB rose lipstick, applied directly from the bullet or with a brush for precision. Finish with a delicate sweep of apricot coral blush on the apples of your cheeks, blending outwards for a soft flush.',
      'Your greatest beauty misstep? Forcing trends onto your face that don\'t align with your established formula. While others might experiment wildly, your strength lies in your verified routine. Resist the urge to overhaul your look for every new viral product. Instead, trust the formulas you\'ve meticulously curated; they consistently win for a reason. Your reliable foundation is your most powerful asset.',
      'For your everyday face, your established routine offers effortless polish. When a high-stakes moment calls, elevate your look by subtly shifting your MLBB lip color one tone per season – perhaps a warmer rose for spring, or a deeper berry for winter. This intelligent tweak introduces freshness without compromising the reliability you value. Your base and eye remain steadfast, a testament to your unwavering, classic elegance.',
      'Your greatest beauty misstep? Forcing trends onto your face that don\'t align with your established formula. While others might experiment wildly, your strength lies in your verified routine. Resist the urge to overhaul your look for every new viral product. Instead, trust the formulas you\'ve meticulously curated; they consistently win for a reason. Your reliable foundation is your most powerful asset.',
    ],
    hashtags: [
      '#TheClassicist',
      '#VerifiedBeauty',
      '#NaturalElegance',
      '#SustainableRoutine',
    ],
    traits: [
      { icon: 'verified', title: 'Verified-first', desc: 'Re-purchased products anchor the routine.' },
      { icon: 'savings', title: 'Run-to-zero', desc: 'Use products to the very end before replacing.' },
      { icon: 'eco', title: 'Skin\'s own tone', desc: 'Healthy native skin tone is the goal, not transformation.' },
    ],
    signature: { lip: 'MLBB rose', eye: 'Natural brown', base: 'Semi-matte', blush: 'Apricot coral' },
    recommended: {
      women: {
        reason: 'Natural glow honestly reveals healthy native skin — the very heart of an ISTJ approach.',
      },
      men: {
        reason: 'No-makeup makeup matches the honesty and discipline that ISTJ already lives by.',
      },
    },
    vibes: ['classic', 'tidy', 'diligent', 'everyday'],
    avoidTip: 'Forcing trends onto your face when they don\'t suit you — your formula always wins.',
    boostTip: 'Shift the lip color one tone per season — reliability stays, freshness arrives.',
  },

  ISFJ: {
    enPersona: 'The Warm Guardian',
    tagline: 'A dewy glow that wraps the room in warmth',
    shortDesc:
      'ISFJ makeup is a soft blanket. Dewy cloud skin, faint pink blush, sheer tint lips — a non-imposing warmth that is comfortable for everyone.',
    detailParagraphs: [
      'The ISFJ, our Warm Guardian, naturally gravitates towards a makeup routine that feels like a quiet, comforting ritual. Your preference for low-irritant, fragrance-free products isn\'t just about sensitive skin; it reflects your desire for gentle, reliable choices that nourish from within. This isn\'t about making a statement, but about creating a soft, healing aura that makes everyone feel at ease.',
      'To achieve your signature \'soft blanket\' look, begin with a cloud skin base – think dewy, hydrated perfection, not heavy coverage. Next, gently sweep an ivory pink shadow across your lids for a subtle brightening effect. For lips, a sheer rose pink tint adds a touch of natural flush. Finish with a delicate touch of baby peach blush on the apples of your cheeks, blending seamlessly for a healthy glow.',
      'The biggest pitfall for our Warm Guardians is choosing tones so subtle they vanish on camera, losing that essential flushed warmth. While your intention is gentle, remember that a whisper of color is still important. Don\'t be afraid to lean into slightly more pigmented versions of your favorite soft pinks and peaches to ensure your comforting glow truly registers.',
      'For everyday, your routine is a serene, spa-like experience, focusing on skin texture and a hint of natural color. When a special occasion calls, simply push your rose pink lip tint one shade more saturated. This slight shift adds a touch of presence and polish, allowing your inner warmth to shine through with a bit more definition, without ever sacrificing your beloved softness.',
    ],
    hashtags: [
      '#WarmGuardianGlow',
      '#DewyComfort',
      '#SoftBlanketBeauty',
      '#HealingRoutine',
    ],
    traits: [
      { icon: 'shower', title: 'Skin texture first', desc: 'Texture matters more than color choice.' },
      { icon: 'spa', title: 'Quiet ritual', desc: 'The routine itself is your morning healing.' },
      { icon: 'healing', title: 'Gentle picks', desc: 'Low-irritation, fragrance-free formulas earn your trust.' },
    ],
    signature: { lip: 'Rose pink tint', eye: 'Ivory pink', base: 'Cloud skin', blush: 'Baby peach' },
    recommended: {
      women: {
        reason: 'Soft cloud skin visualizes ISFJ\'s "warm care" philosophy on the face.',
      },
      men: {
        reason: 'Skincare-first hybrid focuses on texture rather than color — that is ISFJ caregiving in product form.',
      },
    },
    vibes: ['cozy', 'pink latte', 'spa day', 'cozy'],
    avoidTip: 'Tones so faint that the camera blends them into the skin — keep some flushed warmth.',
    boostTip: 'For special days, push the lip one shade more saturated — softness stays, presence sharpens.',
  },

  ESTJ: {
    enPersona: 'The Director',
    tagline: 'A polished red — the canon for the boardroom',
    shortDesc:
      'ESTJ makeup is the canon of the formal moment. A polished red lip, a defined brow, a clean base — impression engineering you can trust.',
    detailParagraphs: [
      'As an ESTJ \'The Director,\' your makeup isn\'t just a routine; it\'s a strategic tool. You gravitate towards polished red lips and defined brows because they embody professionalism and competence, a visual extension of your commitment to order and efficiency. This isn\'t about trends, but about crafting an impression you can trust, a look that always delivers in any formal setting.',
      'Achieve your signature look with precision. Start with a semi-matte foundation, ensuring a flawless, long-lasting base. Next, define your eyes with a crisp brown eyeliner, creating a subtle yet authoritative gaze. Then, apply a bold blood-red lipstick – this is your power statement. Finish with a touch of rosewood blush, precisely placed to sculpt and refine your features.',
      'Your dedication to \'the right look\' can sometimes lead to an overly rigid appearance. Sticking solely to formal styles can come across as unapproachable in more casual settings. To soften your image without compromising your integrity, try swapping your bold red for a sheer, soft lip tint on weekends. This small adjustment allows your trustworthiness to shine with a more human touch.',
      'For your everyday \'Director\' face, maintain your defined brow and clean semi-matte base. When the stakes are high, elevate your blood-red lip by ensuring it\'s impeccably lined and filled for maximum impact. Keep your brown eyeliner precise, adding a subtle wing if the situation calls for an extra touch of commanding presence, ensuring your look is always on point.',
    ],
    hashtags: [
      '#TheDirectorLook',
      '#BoardroomReady',
      '#PolishedPerfection',
      '#StrategicBeauty',
    ],
    traits: [
      { icon: 'task_alt', title: 'Situation playbook', desc: 'A correct look exists for each occasion — and you know it.' },
      { icon: 'schedule', title: '15-minute precision', desc: 'A systematic, efficient routine.' },
      { icon: 'inventory', title: 'Inventory mindset', desc: 'You re-stock before you run out.' },
    ],
    signature: { lip: 'Blood red', eye: 'Brown liner', base: 'Semi-matte', blush: 'Rose wood' },
    recommended: {
      women: {
        reason: 'A polished, present red completes the trustworthy "canon" image ESTJ values.',
      },
      men: {
        reason: 'A systematic monochrome look fits the formal aesthetic naturally.',
      },
    },
    vibes: ['formal', 'executive', 'classic', 'winery'],
    avoidTip: 'Sticking only to rigid looks reads as unapproachable in informal contexts.',
    boostTip: 'On weekends, try a soft lip tint — trustworthiness gains a human face.',
  },

  ESFJ: {
    enPersona: 'The Hostess',
    tagline: 'The K-idol look that fits any room',
    shortDesc:
      'ESFJ is the center of every gathering. A trendy K-pop idol look, friendly pink blush, glossy lip — a context-tuned charm is the signature.',
    detailParagraphs: [
      'As an ESFJ, The Hostess, your makeup is your ultimate social tool! You effortlessly tune into any vibe, choosing a K-idol look that\'s always on-trend yet universally appealing. It\'s not about standing out, but rather fitting in beautifully and making everyone feel comfortable, a true master of TPO (Time, Place, Occasion) who knows just how to charm any crowd.',
      'To achieve your signature K-idol glow, begin with a luminous \'Glow\' base that creates a friendly, radiant canvas. Next, sweep \'Pink Gold\' eyeshadow across your lids for a touch of trending sparkle without being overpowering. Finish with a \'Sheer Rose\' lip that enhances your natural warmth, and a \'Peach Pink\' blush to add that iconic, approachable flush.',
      'Your natural inclination to please can sometimes lead you to prioritize what others expect, subtly overshadowing your own preferences. Don\'t let your personal style get lost! Once a month, dedicate a \'my-taste day\' to experiment with looks purely for your own joy, letting your authentic self shine through without any external influence.',
      'For your everyday look, The Hostess keeps it charming and approachable with a light hand on the sheer rose lip and a subtle hint of peach pink blush. When stepping into a high-stakes gathering, you elevate your game with a more defined pink gold eye and a slightly more saturated sheer rose lip, ensuring you\'re perfectly polished and stage-ready, yet always friendly.',
    ],
    hashtags: [
      '#ESFJHostess',
      '#KpopIdolVibe',
      '#TPOFriendly',
      '#SheerRoseLip',
    ],
    traits: [
      { icon: 'groups', title: 'TPO master', desc: 'You read the situation and tune polish to match.' },
      { icon: 'trending_up', title: 'Trend sense', desc: 'You blend trend and classic in balance.' },
      { icon: 'mood', title: 'Friendly stage', desc: 'The intersection of friendliness and stage-ready is your home.' },
    ],
    signature: { lip: 'Sheer rose', eye: 'Pink gold', base: 'Glow', blush: 'Peach pink' },
    recommended: {
      women: {
        reason: 'K-pop idol carries trend, friendliness, and stage presence in one look — ESFJ\'s three needs.',
      },
      men: {
        reason: 'The same balance of mass appeal and refined detail nails ESFJ identity.',
      },
    },
    vibes: ['K-pop', 'party', 'birthday', 'friendly'],
    avoidTip: 'Drifting toward what others expect can hide what you actually like.',
    boostTip: 'Once a month, run a "my-taste day" where your preference comes before the room\'s.',
  },

  ISTP: {
    enPersona: 'The Minimalist',
    tagline: 'Only what you need — anything more is waste',
    shortDesc:
      'ISTP makeup is engineering. A three-minute routine, function-first products, zero unnecessary steps — efficiency as aesthetic.',
    detailParagraphs: [
      'You, The Minimalist, see makeup as pure engineering. It\'s not about trends, it\'s about a sleek, functional system. Your routine is a precise equation: maximum impact with minimum effort. Every product must earn its place, delivering multiple benefits without a single wasted step. Efficiency isn\'t just a preference, it\'s your aesthetic.',
      'Your signature look is built for speed and purpose. Start with a semi-matte BB cream for a perfected, not covered, base. Eyes are either bare or a single swipe of mascara for definition. A tinted lip balm adds a touch of healthy color without fuss. Blush is omitted, keeping the focus on a clean, unfussy finish.',
      'The most common misstep for an ISTP? Falling into a purely functional void. While efficiency is key, occasions sometimes call for a touch of charm beyond the bare minimum. Resist the urge to be completely devoid of an accent for events; even one well-chosen detail can elevate your look without compromising your core philosophy.',
      'For everyday, your 3-minute ritual reigns supreme. But for high-stakes moments, you allow for one or two strong-accent experiments. This isn\'t about adding steps, but swapping a tint for a bold lip color, or incorporating a subtle liner. It\'s a calculated risk, revealing that hidden edge without betraying your minimalist roots.',
    ],
    hashtags: [
      '#ISTPMakeup',
      '#TheMinimalist',
      '#EfficiencyAesthetic',
      '#FunctionalBeauty',
    ],
    traits: [
      { icon: 'settings', title: 'Engineered', desc: 'Decompose the routine; remove the unnecessary.' },
      { icon: 'auto_fix_high', title: 'Multi-use', desc: 'Prefer products that serve two or three roles.' },
      { icon: 'timer', title: '3–5 minutes', desc: 'Under ten products total; routine under five minutes.' },
    ],
    signature: { lip: 'Tinted balm', eye: 'None or one swipe of mascara', base: 'BB-cream semi-matte', blush: 'None' },
    recommended: {
      women: {
        reason: 'Minimal-touch natural glow lines up exactly with the ISTP efficiency ethos.',
      },
      men: {
        reason: 'No-makeup makeup strips away unnecessary steps — pure function-first engineering.',
      },
    },
    vibes: ['minimal', 'functionalist', 'tour', 'urban'],
    avoidTip: 'Days that are pure function with zero charm signal — events deserve one accent.',
    boostTip: 'One or two strong-accent experiments per month let your hidden edge show.',
  },

  ISFP: {
    enPersona: 'The Soft Artist',
    tagline: 'Effortless, but full of feeling',
    shortDesc:
      'ISFP makeup is the canon of "effortful effortless." Dewy skin, blurred lip tint, natural lashes — relaxed but full of feeling.',
    detailParagraphs: [
      'Meet the Soft Artist, ISFP! Your makeup is the epitome of “effortful effortless” — an authentic expression of your delicate sensibilities. You cherish natural beauty and gravitate towards looks that feel inherently you, embracing a relaxed yet deeply emotive aesthetic that speaks volumes without saying a word. It’s all about subtle details that reveal your artistic soul.',
      'Cultivate your signature look with Cloud Skin, a dewy base that feels as light as air. Frame your gaze with Natural Mascara, emphasizing your lashes without overpowering them. For lips, a Blurred Cherry Tint, applied with a soft touch, gives that perfectly lived-in feel. Finish with a whisper of Soft Peach blush, blending seamlessly for a truly harmonious, nature-inspired glow.',
      'Sometimes, your love for “꾸안꾸” (effortless chic) can accidentally tip into looking “uninvested.” Remember, effortless doesn\'t mean unpolished! Two or three times a month, add a small accent like a slightly bolder brow or a more defined inner corner highlight to elevate your look without sacrificing your natural essence.',
      'For those special days, let your hidden artist shine! While your everyday look is soft and natural, a single pinch of subtle glitter on your eyelids or inner corners beautifully reveals your artistic flair. It’s a delicate sparkle that catches the light, transforming your gentle everyday into something truly enchanting and memorable, showcasing your inner glow.',
    ],
    hashtags: [
      '#SoftArtist',
      '#EffortlessChic',
      '#DewySkinGoals',
      '#NaturalBeauty',
    ],
    traits: [
      { icon: 'nature', title: 'Effortless', desc: 'The "did-she-or-didn\'t-she" aesthetic is the rule.' },
      { icon: 'brush', title: 'Subtle craft', desc: 'Details that only reveal themselves on a closer look.' },
      { icon: 'local_florist', title: 'Indie brands', desc: 'Affection for handmade and local lines.' },
    ],
    signature: { lip: 'Blurred cherry tint', eye: 'Natural mascara', base: 'Cloud skin', blush: 'Soft peach' },
    recommended: {
      women: {
        reason: 'Dewy skin and a blurred tint nail the effortless-but-felt aesthetic ISFP lives in.',
      },
      men: {
        reason: 'Skin-first plus a blurred lip clicks with the natural-yet-individual balance ISFP wants.',
      },
    },
    vibes: ['effortless', 'earth tones', 'café', 'local'],
    avoidTip: 'Days where "effortless" tips into "uninvested" — add an accent two or three times a month.',
    boostTip: 'For special days, a single pinch of glitter reveals the artist hiding in the soft.',
  },

  ESTP: {
    enPersona: 'The Thrillseeker',
    tagline: 'Full face today — strong accents and high speed',
    shortDesc:
      'ESTP makeup is a thrill. A strong smoky, full-coverage base, an attention-pulling lip — the energy of someone who enjoys being seen.',
    detailParagraphs: [
      'You\'re The Thrillseeker, ESTP, and your makeup is as dynamic as you are! Full face today – strong accents and high speed – perfectly captures your vibrant energy. You love being seen, and your makeup is a powerful amplifier, boosting your inherent zest for life and ensuring all eyes are on you. It\'s about bringing that inner fire to the surface, making every look a statement.',
      'To achieve your signature ESTP look, start with a full-coverage matte base, ensuring a flawless canvas. Next, dive into a strong smoky eye, building depth with rich shadows. For lips, a bold matte red or plum commands attention. Finish with a diffused coral blush, applied with a light hand to add a touch of warmth without distracting from your powerful features. This entire, impactful look is perfected in 20 minutes or less!',
      'Your passion for daily full-coverage makeup can, however, tire the skin and dull future pigment payoff. To keep your looks vibrant and your skin healthy, incorporate one or two \'rest days\' per week. This allows your skin to recover, ensuring your impactful full looks truly pop and maintain their intensity when you\'re ready to thrill again.',
      'For everyday, your ESTP face maintains its high-impact essence. The full-coverage base, smoky eyes, and bold lips remain, but perhaps with slightly less intense blending. When the stakes are high, you dial up the drama: sharper lines, more saturated color on the lips, and an even more meticulously crafted smoky eye, ensuring your energetic presence is undeniable.',
    ],
    hashtags: [
      '#ThrillseekerGlam',
      '#HighImpactBeauty',
      '#SpeedyFullFace',
      '#BoldAndSeen',
    ],
    traits: [
      { icon: 'flash_on', title: 'Energy amplifier', desc: 'Use makeup to dial up your own energy.' },
      { icon: 'speed', title: 'Fast full face', desc: 'A complete look in twenty minutes flat.' },
      { icon: 'trending_up', title: 'Result-driven', desc: 'Pigment, longevity, adhesion are the picks criteria.' },
    ],
    signature: { lip: 'Matte red or plum', eye: 'Strong smoky', base: 'Full-cover matte', blush: 'Diffused coral' },
    recommended: {
      women: {
        reason: 'Heavy smoky and a bold lip carry ESTP energy precisely.',
      },
      men: {
        reason: 'A grunge smoky eye delivers the kinetic, edged look ESTP wants.',
      },
    },
    vibes: ['street', 'club', 'festival', 'thrill'],
    avoidTip: 'Daily full-coverage makeup tires the skin and dulls future pigment payoff.',
    boostTip: 'One or two "rest days" per week so the skin recovers and full looks pop again.',
  },

  ESFP: {
    enPersona: 'The Spotlight',
    tagline: 'Anything that sparkles is yours',
    shortDesc:
      'ESFP makeup is a party. Sparkling metallic, brilliant glow, vivid blush — the instinct to shine brightest under the spotlight is the signature.',
    detailParagraphs: [
      'You, The Spotlight, are drawn to makeup that mirrors your vibrant energy. Anything that sparkles instantly captures your attention, reflecting your innate desire to shine brightest. Your ESFP makeup is a celebration, a brilliant glow and sparkling metallics that instinctively pull you towards the center of every room, making you a true magnet for all eyes.',
      'To create your signature look, start with a \'Glow Full\' base, applying a luminous primer followed by a radiant cushion foundation for that lit-from-within effect. For eyes, sweep on \'Champagne Metallic\' shadow across the lid, blending outwards. Finish with \'Glossy Cherry\' lips, a vibrant, high-shine tint, and a touch of \'Peach Glitter\' blush on the apples of your cheeks for an extra pop of playful shimmer.',
      'Your biggest makeup pitfall? The temptation to go full metallic, every day, everywhere. While your instincts are spot-on for capturing light, wearing a heavy metallic look in serious settings can sometimes read as overwhelming. Remember, your glow is powerful, so strategically choose moments to dial up the dazzling sparkle.',
      'For weekdays, embrace a more polished version of your signature: focus on \'Glow Full\' base and \'Glossy Cherry\' lips, keeping the \'Champagne Metallic\' to a subtle wash for a touch of light. When the weekend calls, unleash your true ESFP spirit: go full metallic on the eyes, layer on the \'Peach Glitter\' blush, and let your vibrant, sparkling personality shine without reservation.',
    ],
    hashtags: [
      '#TheSpotlightMakeup',
      '#SparkleMagnet',
      '#PartyReadyBeauty',
      '#GlowGetter',
    ],
    traits: [
      { icon: 'auto_awesome', title: 'Light magnet', desc: 'Drawn instinctively to anything that catches light.' },
      { icon: 'photo_camera', title: 'Camera-friendly', desc: 'Excellent at finding the combinations that pop on camera.' },
      { icon: 'celebration', title: 'Limited-edition love', desc: 'Easy mark for sets and limited drops.' },
    ],
    signature: { lip: 'Glossy cherry', eye: 'Champagne metallic', base: 'Full glow', blush: 'Peach glitter' },
    recommended: {
      women: {
        reason: 'A metallic eye that pulls light delivers the ESFP "spotlight instinct" most clearly.',
      },
      men: {
        reason: 'K-pop idol carries stage presence and friendliness together — ESFP social energy in product form.',
      },
    },
    vibes: ['glow', 'party', 'K-pop', 'spotlight'],
    avoidTip: 'Wearing full metallic every day reads heavy in serious settings.',
    boostTip: 'Weekday = glow only, weekend = full metallic. Instinct kept; polish added.',
  },
}
