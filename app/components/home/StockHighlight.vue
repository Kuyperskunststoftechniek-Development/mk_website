<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: products } = await useAsyncData(
  `stock-highlight-${locale.value}`,
  () => queryContent('/producten').where({ _locale: locale.value }).find(),
)

const { getStock } = await useStock()

type OrderRow = {
  code: string
  slug: string
  name: string
  squareMeters: number
  sheetCount: number
}

const rows = computed<OrderRow[]>(() => {
  const featured = [
    { code: 'HDPE', slug: 'hdpe', name: t('home.stockHdpeName') },
    { code: 'PP',   slug: 'pp',   name: t('home.stockPpName') },
  ]

  return featured.map((m) => {
    const items = (products.value ?? []).filter(p => p.material === m.code)
    let squareMeters = 0
    let sheetCount = 0
    for (const p of items) {
      const variants = (p.variants ?? []) as Array<{ size: string; widthMm: number; heightMm: number; stock?: number }>
      for (const v of variants) {
        const live = getStock(p.slug as string, v.size)
        const stock = live ?? v.stock ?? 0
        sheetCount += stock
        squareMeters += stock * (v.widthMm * v.heightMm) / 1_000_000
      }
    }
    return { ...m, squareMeters, sheetCount }
  })
})
</script>

<template>
  <section class="relative py-16 lg:py-20 border-y border-line">
    <div class="mx-auto max-w-container px-6 lg:px-10">
      <div class="mb-10">
        <div class="label-eyebrow">{{ t('home.orderDirectEyebrow') }}</div>
      </div>

      <div class="grid gap-px bg-line border border-line rounded-md overflow-hidden">
        <div
          v-for="row in rows"
          :key="row.slug"
          class="order-row"
        >
          <div class="order-meta">
            <div class="font-display text-2xl font-bold">{{ row.name }}</div>
            <div class="mt-1 text-sm text-textc-dim">{{ t('home.orderDirectSub') }}</div>
          </div>
          <div class="order-figure">
            <div class="font-display text-4xl lg:text-5xl font-bold text-accent tabular-nums">
              <MotionCountUp :value="Math.round(row.squareMeters)" suffix=" m²" />
            </div>
            <div class="mt-1 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-textc-muted">
              {{ row.sheetCount }} {{ t('home.stockSheetsLabel').toLowerCase() }}
            </div>
          </div>
          <div class="order-cta">
            <NuxtLink
              :to="localePath(`/producten?material=${row.code}`)"
              class="btn btn-primary w-full justify-center"
            >
              {{ t('home.orderDirectCta', { code: row.code }) }}
              <Icon name="lucide:arrow-right" class="h-4 w-4" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.order-row {
  display: grid;
  gap: 1.5rem;
  padding: 1.5rem 1.75rem;
  background: var(--ink-soft);
  grid-template-columns: 1fr;
  align-items: center;
}
@media (min-width: 768px) {
  .order-row {
    grid-template-columns: 1fr auto auto;
    gap: 2.5rem;
    padding: 1.75rem 2rem;
  }
}

.order-meta { min-width: 0; }
.order-figure { text-align: left; }
@media (min-width: 768px) {
  .order-figure { text-align: right; }
}
.order-cta { width: 100%; }
@media (min-width: 768px) {
  .order-cta { width: auto; min-width: 200px; }
}
</style>
