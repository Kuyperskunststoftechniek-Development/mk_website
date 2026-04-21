/**
 * Decide a background color that gives enough contrast with a given plate tint.
 * Dark plates (luminance < 0.35) get a light backdrop (#ECEEF2);
 * everything else keeps the plate tint as backdrop.
 */
export function useTintContrast(hex?: string): { bg: string; sheet: string; isDark: boolean } {
  const fallback = '#94A3B8'
  const tint = hex || fallback
  const m = /^#?([a-f0-9]{6})$/i.exec(tint.trim())
  if (!m) return { bg: tint, sheet: tint, isDark: false }

  const n = parseInt(m[1], 16)
  const r = (n >> 16) & 0xFF
  const g = (n >> 8) & 0xFF
  const b = n & 0xFF
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  const isDark = luminance < 0.35
  return {
    bg: isDark ? '#ECEEF2' : tint,
    sheet: tint,
    isDark,
  }
}
