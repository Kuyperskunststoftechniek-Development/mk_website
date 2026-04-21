import { useLocalStorage } from '@vueuse/core'

export type CartItem = {
  productSlug: string
  title: string
  material: string
  thickness: number
  color: string
  colorRal?: string
  variantSize: string
  widthMm: number
  heightMm: number
  weightKg: number         // per sheet, snapshotted at add-time
  pricePerKg: number
  pricePerSheet: number    // snapshot, excl. BTW
  quantity: number
  accentHex?: string
}

const STORAGE_KEY = 'mk.cart.v1'

/**
 * Reactive cart backed by localStorage.
 * Items are keyed by `productSlug + variantSize`.
 */
export function useCart() {
  const items = useLocalStorage<CartItem[]>(STORAGE_KEY, [], {
    listenToStorageChanges: true,
  })

  function keyOf(i: Pick<CartItem, 'productSlug' | 'variantSize'>) {
    return `${i.productSlug}::${i.variantSize}`
  }

  function addItem(item: Omit<CartItem, 'quantity'>, quantity = 1) {
    const existing = items.value.find(x => keyOf(x) === keyOf(item))
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value = [...items.value, { ...item, quantity }]
    }
  }

  function updateQuantity(productSlug: string, variantSize: string, quantity: number) {
    const next = Math.max(0, Math.floor(quantity))
    items.value = items.value
      .map(x => (x.productSlug === productSlug && x.variantSize === variantSize
        ? { ...x, quantity: next }
        : x))
      .filter(x => x.quantity > 0)
  }

  function removeItem(productSlug: string, variantSize: string) {
    items.value = items.value.filter(
      x => !(x.productSlug === productSlug && x.variantSize === variantSize),
    )
  }

  function clear() {
    items.value = []
  }

  const totalCount = computed(() =>
    items.value.reduce((n, x) => n + x.quantity, 0),
  )

  const subtotalExcl = computed(() =>
    items.value.reduce((n, x) => n + x.pricePerSheet * x.quantity, 0),
  )

  const btw = computed(() => subtotalExcl.value * BTW_RATE)

  const totalIncl = computed(() => subtotalExcl.value + btw.value)

  const totalWeight = computed(() =>
    items.value.reduce((n, x) => n + x.weightKg * x.quantity, 0),
  )

  const isEmpty = computed(() => items.value.length === 0)

  return {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clear,
    totalCount,
    subtotalExcl,
    btw,
    totalIncl,
    totalWeight,
    isEmpty,
  }
}
