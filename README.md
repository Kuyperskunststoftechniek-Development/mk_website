# M&K Kunststoffen — website

B2B groothandel kunststof plaat-, buis- en stafmateriaal. Focus op HDPE en PP. Marketing site + doorzoekbare productcatalogus met winkelmandje, offerte-aanvraag en factuurbestelling. Nuxt 3 (app/ compatibility v4) + Nuxt Content + Tailwind + GSAP/Lenis.

## Snelstart

```bash
npm install
cp .env.example .env
npm run dev            # http://localhost:3000
```

## Scripts

- `npm run dev` — dev server
- `npm run build` — productie build
- `npm run generate` — statische export
- `npm run preview` — preview van build
- `npm run typecheck` — Vue-tsc type checks

## Environment variables

Alle env vars zijn optioneel — zonder worden aanvragen naar de console gelogd en voorraad komt uit product-markdown.

| Var | Beschrijving |
|---|---|
| `NUXT_RESEND_API_KEY` | Resend API-key voor transactionele e-mails |
| `NUXT_LEAD_RECIPIENT` | Intern ontvangstadres voor leads/orders (comma-gescheiden) |
| `NUXT_LEAD_FROM_ADDRESS` | Afzender, bv. `M&K Kunststoffen <no-reply@mkkunststoffen.nl>` |
| `NUXT_STOCK_SHEET_URL` | Gepubliceerde CSV-URL van Google Sheet met voorraad (zie onder) |

## Structuur

```
app/
  components/
    global/    (AppHeader, AppFooter, LangSwitch, CartDrawer)
    home/      (HeroKinetic, UspStrip, StockHighlight, CtaBlock)
    motion/    (MagneticButton, FadeInOnScroll, CountUp, Marquee, SplitText)
    product/   (ProductCard, ProductFilterBar, QuoteForm, BulkQuoteForm, ContactForm)
  composables/ (useMkpeMotion, usePricing, useCart, useStock, useTintContrast)
  layouts/     (default)
  pages/       (index, materialen/, producten/, offerte, winkelmandje, afrekenen, contact, over-ons)
  plugins/     (motion.client.ts — Lenis + GSAP)
content/
  nl/materialen|producten/…     (markdown met frontmatter)
  en/materialen|producten/…
server/api/    (lead.post.ts, order.post.ts, stock.get.ts)
i18n/locales/  (nl.json, en.json)
assets/css/    (tokens.css, global.css)
```

## Producten beheren

Elk product is een markdown-bestand in [content/nl/producten/](content/nl/producten/) (en optioneel een vertaling in `content/en/`). Velden in de frontmatter:

| Veld | Verplicht | Beschrijving |
|---|---|---|
| `title`, `slug` | ✓ | URL-slug moet uniek zijn |
| `material`, `materialSlug` | ✓ | Voor filters + koppeling aan materiaal-pagina |
| `form` | ✓ | `plaat` \| `buis` \| `staf` |
| `thickness` | ✓ | In mm |
| `color` | ✓ | Vrije tekst |
| `colorRal` |   | Bv. `RAL 1013` — verschijnt naast kleur |
| `density` | ✓ | g/cm³ |
| `pricePerKg` | ✓ | Prijs excl. BTW |
| `variants` | ✓ | Lijst met `size`, `widthMm`, `heightMm`, `stock` |
| `accentHex` |   | Hex-kleur voor de plaat-visual |

Prijs per plaat wordt live berekend: `(widthMm × heightMm × thickness × density) / 1.000.000 × pricePerKg`.

## Voorraad via Google Sheets

De website toont voorraadcijfers op de homepage (HDPE/PP totals) en op elke productpagina (per variant). Drie opties voor de datastroom:

1. **Frontmatter** (default) — vul `stock` in de variants in de markdown. Handmatig updaten.
2. **Google Sheets** (aanbevolen) — live voorraad zonder site te redeployen.
3. **Python-integratie** — Python-script dat de Sheet bijwerkt vanuit je ERP/Excel.

Volledige handleiding met stap-voor-stap setup, Python-voorbeelden en troubleshooting:
**[docs/voorraad-google-sheets.md](docs/voorraad-google-sheets.md)**

### Sheet opzetten

1. Maak een nieuwe Google Sheet met deze kolommen (eerste rij = headers):

   | productSlug | variantSize | stock |
   |---|---|---|
   | hdpe-naturel-10mm | 2000 × 1000 mm | 45 |
   | hdpe-naturel-10mm | 3000 × 1500 mm | 18 |
   | hdpe-zwart-20mm | 2000 × 1000 mm | 32 |
   | ... | ... | ... |

   **Belangrijk:** `variantSize` moet exact matchen met de `size` in de productmarkdown (inclusief spaties en `×`-teken).

2. **Bestand → Delen → Publiceren op web** → selecteer het juiste tabblad → formaat **Door komma's gescheiden (.csv)** → **Publiceren**

3. Kopieer de URL (iets als `https://docs.google.com/spreadsheets/d/e/XXXXX/pub?output=csv`)

4. Zet als env var:
   ```
   NUXT_STOCK_SHEET_URL=https://docs.google.com/spreadsheets/d/e/XXXXX/pub?output=csv
   ```
   Op Vercel: Project Settings → Environment Variables.

De site cacht het resultaat 5 min (matcht de cache die Google zelf op gepubliceerde sheets heeft). Vernieuwen na een bulk-update kan via Vercel redeploy.

### Python-script voorbeeld

Vanuit Python kun je de Sheet vullen via de [Google Sheets API](https://developers.google.com/sheets/api/quickstart/python) of de [gspread](https://docs.gspread.org/) library. Ruwe flow:

```python
import gspread
gc = gspread.service_account(filename='credentials.json')
sheet = gc.open_by_key('YOUR_SHEET_ID').sheet1
sheet.update('A2:C', [
    ['hdpe-naturel-10mm', '2000 × 1000 mm', 45],
    ['hdpe-naturel-10mm', '3000 × 1500 mm', 18],
    # …
])
```

Runtime opties: draai het script lokaal, via een cron-job, of als scheduled GitHub Action.

## Animaties

- Lenis smooth scroll + GSAP ScrollTrigger (via `app/plugins/motion.client.ts`)
- Reduced-motion guard: alle animatie-primitives en Lenis/GSAP respecteren `prefers-reduced-motion: reduce`.

## Lead- en order-flow

- `POST /api/lead` — offerte-aanvragen (per product + bulk) en contactformulier
- `POST /api/order` — bestellingen op factuur vanuit het winkelmandje

Zonder Resend-config loggen beide routes de payload naar de console.

## Deploy

Vercel: importeer de repo, voeg eventuele env vars toe, push naar `main` voor auto-deploy.
