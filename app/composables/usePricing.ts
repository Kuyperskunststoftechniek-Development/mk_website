/**
 * Business rules
 * - weight (kg) = (width_mm × height_mm × thickness_mm × density_g_per_cm3) / 1_000_000
 * - price (€ excl. BTW) = weight × pricePerKg
 * - all prices on the site are shown excl. BTW; BTW (21%) is added at checkout summary
 */

export const BTW_RATE = 0.21

export type Variant = {
  size: string
  widthMm: number
  heightMm: number
  stock?: number
}

export type Product = {
  slug: string
  title: string
  material: string
  thickness: number
  color: string
  density: number
  pricePerKg: number
  variants: Variant[]
  accentHex?: string
}

export function calcWeightKg(
  widthMm: number,
  heightMm: number,
  thicknessMm: number,
  densityG: number,
): number {
  return (widthMm * heightMm * thicknessMm * densityG) / 1_000_000
}

export function calcSheetPrice(product: Product, variant: Variant): number {
  const weight = calcWeightKg(variant.widthMm, variant.heightMm, product.thickness, product.density)
  return weight * product.pricePerKg
}

export function formatEur(n: number, locale: 'nl' | 'en' = 'nl'): string {
  return new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatWeight(kg: number, locale: 'nl' | 'en' = 'nl'): string {
  return new Intl.NumberFormat(locale === 'nl' ? 'nl-NL' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(kg) + ' kg'
}

export function usePricing() {
  return {
    calcWeightKg,
    calcSheetPrice,
    formatEur,
    formatWeight,
    BTW_RATE,
  }
}
