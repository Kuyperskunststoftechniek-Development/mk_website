/**
 * Fetches live stock data from the Google Sheet backed `/api/stock` route.
 * Falls back to frontmatter `stock` values when the API returns empty
 * (e.g. when the sheet URL isn't configured yet).
 *
 * Usage:
 *   const { getStock, loaded } = await useStock()
 *   getStock('hdpe-naturel-10mm', '2000 × 1000 mm')   // → number or undefined
 */

export type StockSource = 'sheet' | 'fallback' | 'error'

export type StockLookup = {
  loaded: Ref<boolean>
  source: Ref<StockSource>
  getStock: (productSlug: string, variantSize: string) => number | undefined
}

export async function useStock(): Promise<StockLookup> {
  type ApiResponse = { ok: boolean; source: StockSource; stock: Record<string, Record<string, number>> }

  const { data } = await useFetch<ApiResponse>('/api/stock', {
    key: 'stock-sheet',
    default: () => ({ ok: true, source: 'fallback' as StockSource, stock: {} }),
  })

  const stock = computed(() => data.value?.stock ?? {})
  const source = computed<StockSource>(() => data.value?.source ?? 'fallback')
  const loaded = computed(() => data.value != null)

  function getStock(productSlug: string, variantSize: string): number | undefined {
    return stock.value[productSlug]?.[variantSize]
  }

  return { loaded, source, getStock }
}
