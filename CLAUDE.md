# Manipal Explorer: Project Brief

## What this is
A cinematic, award-level travel and food guide to everything around Manipal / Udupi, Karnataka, for exploring between 28 Nov 2026 and 31 Jan 2027. It must work perfectly on iPhone and laptop.

## About me (personalise everything)
- I live in Manipal. I ride a motorcycle and can take trains (Udupi station is on the Konkan Railway).
- Strict vegetarian. NEVER recommend seafood, meat or egg dishes, or non-veg-focused restaurants. For dishes famous in non-veg form (e.g. ghee roast), only suggest the veg/paneer/mushroom version and say so. Onion and garlic are fine.
- Hindu: temples matter a lot to me. Always include dress code, darshan timings, and annadana/prasada meal details where relevant.
- I want to explore EVERYTHING: beaches, temples, waterfalls, treks, hills, islands, forts, backwaters, culture, food.

## Hard rules
1. No fabrication. Every factual field (timings, distances, permits, prices, dates, operating status) comes from web research with source URLs stored in the data. If you can't verify something, set it to null and mark it "verify locally". Never guess.
2. Never shrink scope to save effort. If a place is in the list, it gets full treatment.
3. No lorem ipsum, no placeholder copy, no travel clichés ("hidden gem", "paradise", "nestled", "breathtaking").
4. Copy voice: a well-travelled local friend. Specific, sensory, a bit witty, short sentences.
5. Images: only downloaded, licence-checked images stored in the repo with credits. Never hotlink, never invent URLs.
6. Safety first: clearly flag ghat-road risks, night riding, slippery waterfall rocks, rip currents on beaches, and anything prohibited (e.g. walking railway tracks to Dudhsagar).

## Art direction (default; may be refined in Part 3)
- Concept: "Konkan Chronicles". The site reads like a cinematic travel film told in chapters:
  I. The Coast · II. The Gods · III. The Ghats · IV. The Table · V. The Plan
- Palette:
  ink #0B0F0E, deep sea #0E3B3A, monsoon teal #1F6F6B, saffron #F29B38, laterite #B4532A, palm #4F7A3A, sand #EDE3D1, bone #F7F3EA
- Type: one dramatic display face (high-contrast serif or condensed grotesk, self-hosted) + one clean sans for body. Fluid type scale with clamp(). Huge headlines, generous whitespace, editorial grids.
- Motion: purposeful, physical and smooth. Custom easing (no default ease-in-out). Split-text reveals, clip-path image reveals, parallax depth, pinned chapters, GSAP Flip for filtering. Nothing moves without a reason.
- Texture: subtle film grain, soft glows. Glassmorphism only where it earns its place.
- Desktop extras: custom cursor that morphs over media, magnetic buttons, subtle card tilt.
- Mobile: no custom cursor, swipe carousels, bottom-sheet details, thumb-reachable controls.
- Quality bar: Active Theory, Locomotive, Resn, Awwwards Site of the Day. Designed by someone with 20+ years of experience.

## Technical requirements
- Vite + vanilla JS modules. gsap + ScrollTrigger, lenis, three (hero shader only), leaflet.
- Mobile-first, 360px → 1920px+. Use 100dvh, env(safe-area-inset-*), Safari-safe CSS, 44px minimum tap targets, no hover-only interactions on touch, no horizontal overflow.
- Performance: responsive WebP/AVIF via <picture>, lazy loading, shader paused when off-screen or tab hidden, DPR capped at 2. Targets: 60fps on iPhone, Lighthouse mobile ≥ 90 for Performance, Accessibility and Best Practices.
- prefers-reduced-motion: disable WebGL, smooth scroll and heavy animation; content stays fully usable.
- Accessibility: semantic HTML, alt text, visible focus states, keyboard navigable, WCAG AA contrast.
- localStorage always wrapped in try/catch.
- All content lives in src/data/*.json so I can edit it without touching code.

## Workflow rules
- Work only on the current part. Commit with clear messages after each meaningful step and push.
- When a prompt says STOP, stop and wait for my review.
- Keep the "## Progress" section at the bottom of this file updated: what's done, what's pending, open questions.
- Before finishing any part, check your own output against this brief.

## Progress
- Part 0: scaffold done
