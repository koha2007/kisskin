// Makeup MBTI — English overrides for the 16 personas.
// Mirrors `MAKEUP_MBTI_TYPES` keys in types.ts. Long-form `detailParagraphs`
// stay in Korean for now and are scheduled for human translation; the rest
// of the EN-facing UI (tagline, shortDesc, traits, signature, vibes, tips,
// and recommended-style reasoning) is translated here.

import type { MbtiCode } from './types'

export interface MakeupMbtiTypeEn {
  enPersona: string                 // Display label, e.g. "The Architect"
  tagline: string
  shortDesc: string
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
