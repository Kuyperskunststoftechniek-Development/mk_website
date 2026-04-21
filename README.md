# M&K Kunststoffen — website

B2B groothandel kunststof plaat-, buis- en stafmateriaal. Focus op HDPE en PP. Marketing site + doorzoekbare productcatalogus met offerte-aanvraag. Nuxt 3 (app/ compatibility v4) + Nuxt Content + Tailwind + GSAP/Lenis.

## Snelstart

```bash
pnpm install
cp .env.example .env   # vul NUXT_RESEND_API_KEY + NUXT_LEAD_RECIPIENT
pnpm dev               # http://localhost:3000
```

## Scripts

- `pnpm dev` — dev server
- `pnpm build` — productie build
- `pnpm generate` — statische export
- `pnpm preview` — preview van build
- `pnpm typecheck` — Vue-tsc type checks

## Structuur

```
app/
  components/
    global/    (AppHeader, AppFooter, LangSwitch)
    home/      (HeroKinetic, UspStrip, MaterialShowcase, CtaBlock)
    motion/    (MagneticButton, FadeInOnScroll, CountUp, Marquee, SplitText)
    product/   (ProductCard, ProductFilterBar, QuoteForm, BulkQuoteForm, ContactForm)
  composables/ (useMotion, useReducedMotion)
  layouts/     (default)
  pages/       (index, materialen/, producten/, offerte, contact, over-ons, privacy, terms)
  plugins/     (motion.client.ts — Lenis + GSAP)
content/
  nl/materialen|producten|…
  en/materialen|producten|…
server/api/    (lead.post.ts — Zod + Resend)
i18n/locales/  (nl.json, en.json)
assets/css/    (tokens.css, global.css)
```

## Animaties

- Lenis smooth scroll + GSAP ScrollTrigger (via `app/plugins/motion.client.ts`)
- Reduced-motion guard: alle animatie-primitives en Lenis/GSAP respecteren `prefers-reduced-motion: reduce`.

## E-mail

Leads komen binnen via `POST /api/lead`. Configureer:

- `NUXT_RESEND_API_KEY` — Resend API sleutel
- `NUXT_LEAD_RECIPIENT` — ontvanger(s), comma-gescheiden
- `NUXT_LEAD_FROM_ADDRESS` — afzender, bv. `M&K Kunststoffen <no-reply@mkkunststoffen.nl>`

Zonder deze env vars logt de server-route de lead naar de console (handig voor dev).

## Deploy

Vercel zero-config: forkt de repo, voeg env vars toe, push.
