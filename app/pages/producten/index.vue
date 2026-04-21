<script setup lang="ts">
const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const filters = reactive({
  material: (route.query.material as string) ?? '',
  form: (route.query.form as string) ?? '',
  color: (route.query.color as string) ?? '',
})

const { data: products } = await useAsyncData(
  `products-${locale.value}`,
  () => queryContent('/producten').where({ _locale: locale.value }).sort({ order: 1 }).find(),
)

const available = computed(() => {
  const all = products.value ?? []
  return {
    materials: [...new Set(all.map(p => p.material as string))].filter(Boolean).sort(),
    forms: [...new Set(all.map(p => p.form as string))].filter(Boolean).sort(),
    colors: [...new Set(all.map(p => p.color as string))].filter(Boolean).sort(),
  }
})

const filtered = computed(() => {
  return (products.value ?? []).filter((p) => {
    if (filters.material && p.material !== filters.material) return false
    if (filters.form && p.form !== filters.form) return false
    if (filters.color && p.color !== filters.color) return false
    return true
  })
})

function onUpdateFilters(v: typeof filters) {
  Object.assign(filters, v)
}
function resetFilters() {
  filters.material = ''
  filters.form = ''
  filters.color = ''
}

// Sync filters to URL for shareable links
watch(filters, (v) => {
  router.replace({ query: { ...v } })
}, { deep: true })

useSeoMeta({
  title: () => `${t('products.pageTitle')} — ${t('meta.siteName')}`,
  description: () => t('products.pageLead'),
})
</script>

<template>
  <div class="pt-28 pb-16 lg:pt-40">
    <div class="mx-auto max-w-container px-6 lg:px-10">
      <header class="mb-12 max-w-3xl">
        <div class="label-eyebrow">— {{ t('meta.siteName') }}</div>
        <h1 class="mt-6 font-display text-h1-fluid font-bold leading-tight tracking-tight">
          {{ t('products.pageTitle') }}
        </h1>
        <p class="mt-6 text-lead text-textc-dim text-pretty">{{ t('products.pageLead') }}</p>
      </header>

      <ProductFilterBar
        :model-value="filters"
        :materials="available.materials"
        :forms="available.forms"
        :colors="available.colors"
        @update:model-value="onUpdateFilters"
        @reset="resetFilters"
      />

      <div class="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-textc-muted">
        — {{ filtered.length }} {{ t('products.filters.results') }}
      </div>

      <div v-if="filtered.length" class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MotionFadeInOnScroll
          v-for="(p, i) in filtered"
          :key="p._path"
          :delay="Math.min(i, 6) * 60"
        >
          <ProductCard :product="p" />
        </MotionFadeInOnScroll>
      </div>

      <div v-else class="mt-16 rounded-md border border-line bg-ink-soft p-8 text-center text-textc-dim">
        {{ t('products.empty') }}
      </div>
    </div>
  </div>
</template>
