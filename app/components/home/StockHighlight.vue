<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { calcWeightKg } = usePricing()

const { data: products } = await useAsyncData(
  `stock-highlight-${locale.value}`,
  () => queryContent('/producten').where({ _locale: locale.value }).find(),
)

const { getStock } = await useStock()

type MaterialSummary = {
  code: string
  slug: string
  tagline: string
  accentHex: string
  sheetCount: number
  totalWeight: number
  thicknesses: number[]
  colors: string[]
}

const summaries = computed<MaterialSummary[]>(() => {
  const featuredMaterials: Array<Pick<MaterialSummary, 'code' | 'slug' | 'tagline' | 'accentHex'>> = [
    {
      code: 'HDPE',
      slug: 'hdpe',
      tagline: t('home.stockHdpeTagline'),
      accentHex: '#E8EAEC',
    },
    {
      code: 'PP',
      slug: 'pp',
      tagline: t('home.stockPpTagline'),
      accentHex: '#D9DADC',
    },
  ]

  return featuredMaterials.map((m) => {
    const items = (products.value ?? []).filter(p => p.material === m.code)
    let sheetCount = 0
    let totalWeight = 0
    const thicknesses = new Set<number>()
    const colors = new Set<string>()

    for (const p of items) {
      const variants = (p.variants ?? []) as Array<{ widthMm: number; heightMm: number; size: string; stock?: number }>
      thicknesses.add(p.thickness as number)
      if (p.color) colors.add(p.color as string)
      for (const v of variants) {
        // Live stock from sheet wins, fallback to frontmatter
        const live = getStock(p.slug as string, v.size)
        const stock = live ?? v.stock ?? 0
        sheetCount += stock
        if (stock > 0) {
          totalWeight += stock * calcWeightKg(v.widthMm, v.heightMm, p.thickness as number, p.density as number)
        }
      }
    }

    return {
      ...m,
      sheetCount,
      totalWeight,
      thicknesses: Array.from(thicknesses).sort((a, b) => a - b),
      colors: Array.from(colors),
    }
  })
})
</script>

<template>
  <section class="relative py-24 lg:py-32">
    <div class="mx-auto max-w-container px-6 lg:px-10">
      <div class="mb-14 max-w-2xl">
        <div class="label-eyebrow">{{ t('home.materialsEyebrow') }}</div>
        <h2 class="mt-4 font-display text-h2-fluid font-bold leading-tight tracking-tight text-balance">
          {{ t('home.stockTitle') }}
        </h2>
        <p class="mt-6 text-lead text-textc-dim text-pretty">{{ t('home.stockLead') }}</p>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <MotionFadeInOnScroll
          v-for="(m, i) in summaries"
          :key="m.slug"
          :delay="i * 140"
          as="article"
          class="stock-card"
        >
          <div class="stock-body">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                  — {{ m.code }}
                </div>
                <h3 class="mt-3 font-display text-3xl font-bold tracking-tight">
                  {{ m.code === 'HDPE' ? t('home.stockHdpeName') : t('home.stockPpName') }}
                </h3>
                <p class="mt-3 max-w-sm text-textc-dim">{{ m.tagline }}</p>
              </div>
            </div>

            <div class="stock-figures">
              <div>
                <div class="label-eyebrow">{{ t('home.stockSheetsLabel') }}</div>
                <div class="mt-1 font-display text-4xl font-bold text-accent">
                  <MotionCountUp :value="m.sheetCount" />
                </div>
                <div class="text-xs text-textc-muted">{{ t('home.stockSheetsSub') }}</div>
              </div>
              <div>
                <div class="label-eyebrow">{{ t('home.stockThicknessesLabel') }}</div>
                <div class="mt-1 flex flex-wrap gap-1.5">
                  <span
                    v-for="th in m.thicknesses"
                    :key="th"
                    class="rounded-sm border border-line px-2 py-1 font-mono text-[0.7rem] uppercase tracking-wider text-textc"
                  >
                    {{ th }} mm
                  </span>
                </div>
              </div>
              <div>
                <div class="label-eyebrow">{{ t('home.stockColorsLabel') }}</div>
                <div class="mt-1 flex flex-wrap gap-1.5 capitalize">
                  <span
                    v-for="c in m.colors"
                    :key="c"
                    class="rounded-sm border border-line px-2 py-1 font-mono text-[0.7rem] uppercase tracking-wider text-textc-dim"
                  >
                    {{ c }}
                  </span>
                </div>
              </div>
            </div>

            <div class="mt-8 flex flex-wrap gap-3">
              <NuxtLink
                :to="localePath(`/materialen/${m.slug}`)"
                class="btn btn-ghost"
              >
                {{ t('cta.readMore') }}
              </NuxtLink>
              <NuxtLink
                :to="localePath(`/producten?material=${m.code}`)"
                class="btn btn-primary"
              >
                {{ t('home.stockBrowse', { code: m.code }) }}
                <Icon name="lucide:arrow-right" class="h-4 w-4" />
              </NuxtLink>
            </div>
          </div>

          <div
            class="stock-visual"
            :style="{ background: m.accentHex }"
          >
            <div class="stock-sheet" :style="{ '--tint': m.accentHex }" />
            <div class="stock-badge">
              <div class="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-paper/70">— {{ t('home.stockInStock') }}</div>
              <div class="mt-0.5 font-display text-2xl font-bold text-paper">
                {{ m.code }}
              </div>
            </div>
          </div>
        </MotionFadeInOnScroll>
      </div>

      <p class="mt-8 text-sm text-textc-muted">{{ t('home.stockFootnote') }}</p>
    </div>
  </section>
</template>

<style scoped>
.stock-card {
  display: grid;
  grid-template-columns: 1fr;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  background: var(--ink-soft);
  transition: border-color 200ms var(--ease-out), transform 200ms var(--ease-out);
}
.stock-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

@media (min-width: 768px) {
  .stock-card {
    grid-template-columns: 1fr 280px;
  }
}

.stock-body {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stock-figures {
  margin-top: 2rem;
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
}
@media (min-width: 640px) {
  .stock-figures { grid-template-columns: auto 1fr 1fr; }
}

.stock-visual {
  position: relative;
  min-height: 260px;
  overflow: hidden;
  border-top: 1px solid var(--line);
}
@media (min-width: 768px) {
  .stock-visual {
    border-top: none;
    border-left: 1px solid var(--line);
    min-height: unset;
  }
}
.stock-sheet {
  position: absolute;
  inset: 18%;
  background: var(--tint);
  filter: brightness(0.95);
  border-radius: 4px;
  transform: rotate(-4deg);
  box-shadow: 0 20px 45px rgba(0,0,0,0.22), inset 0 0 0 1px rgba(0,0,0,0.06);
}
.stock-sheet::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 45%, rgba(0,0,0,0.08) 100%);
  pointer-events: none;
}
.stock-badge {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  padding: 0.6rem 0.9rem;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(8px);
  border-radius: var(--r-sm);
  box-shadow: 0 2px 8px rgba(15,23,42,0.08);
}
</style>
