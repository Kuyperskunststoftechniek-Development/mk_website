/**
 * Live voorraad uit een gepubliceerde Google Sheet (CSV).
 *
 * Sheet-structuur (eerste rij = headers, kolomnamen maken niet uit zolang de
 * eerste drie kolommen productSlug, variantSize en stock bevatten):
 *
 *     productSlug            | variantSize    | stock
 *     hdpe-naturel-10mm      | 2000 × 1000 mm | 45
 *     hdpe-naturel-10mm      | 3000 × 1500 mm | 18
 *
 * Gebruik in de sheet exact dezelfde `variantSize`-string als in de
 * productmarkdown (bijv. "2000 × 1000 mm").
 *
 * Publiceer de sheet via File → Share → Publish to web → sheet → CSV → Publish.
 * Zet de resulterende URL in `NUXT_STOCK_SHEET_URL`.
 *
 * De route cachet 5 minuten om herhaalde fetches te vermijden.
 */

export type StockMap = Record<string, Record<string, number>>

/**
 * Super minimale CSV parser — voldoende voor spreadsheet-export.
 * Handelt quoted strings af (incl. comma's binnen quotes).
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let field = ''
  let row: string[] = []
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ } else { inQuotes = false }
      } else {
        field += c
      }
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n') { row.push(field); field = ''; rows.push(row); row = [] }
      else if (c === '\r') { /* swallow */ }
      else field += c
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows.filter(r => r.some(cell => cell.trim() !== ''))
}

async function fetchSheet(url: string): Promise<StockMap> {
  const response = await $fetch<string>(url, {
    responseType: 'text',
    // Avoid Nitro's default JSON parsing
  })
  const rows = parseCsv(response)
  if (rows.length < 2) return {}

  const map: StockMap = {}
  for (let i = 1; i < rows.length; i++) {
    const [rawSlug, rawSize, rawStock] = rows[i]
    const slug = (rawSlug ?? '').trim()
    const size = (rawSize ?? '').trim()
    const stock = Number.parseInt((rawStock ?? '').replace(/\./g, '').trim(), 10)
    if (!slug || !size || !Number.isFinite(stock)) continue
    if (!map[slug]) map[slug] = {}
    map[slug][size] = stock
  }
  return map
}

export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const url = (config as any).stockSheetUrl as string | undefined

  if (!url) {
    // No sheet configured yet — return empty map, site falls back to
    // frontmatter `stock` values.
    return { ok: true, source: 'fallback', stock: {} as StockMap }
  }

  try {
    const stock = await fetchSheet(url)
    return { ok: true, source: 'sheet', stock }
  } catch (err: any) {
    console.error('[stock] sheet fetch failed', err)
    return { ok: false, source: 'error', error: err?.message || 'fetch failed', stock: {} as StockMap }
  }
}, {
  // Cache for 5 minutes — Google's published-CSV cache is itself ~5 min,
  // so little point asking more often.
  maxAge: 5 * 60,
  // Revalidate in the background while serving stale on high load.
  staleMaxAge: 15 * 60,
  name: 'stock-sheet',
})
