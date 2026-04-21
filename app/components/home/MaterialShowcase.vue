<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

type Material = {
  code: string
  name: string
  slug: string
  tagline: string
  hex: string
  props: string[]
}

const materials: Material[] = [
  {
    code: 'HDPE',
    name: 'High Density Polyethyleen',
    slug: 'hdpe',
    tagline: 'Slijtvast, vochtbestendig, FDA-geschikt.',
    hex: '#E8EAEC',
    props: ['Dichtheid 0.95 g/cm³', 'Temp -50 / +80 °C', 'Lasbaar', 'FDA & EU 10/2011'],
  },
  {
    code: 'PP',
    name: 'Polypropyleen',
    slug: 'pp',
    tagline: 'Chemisch resistent, lichtgewicht.',
    hex: '#D9DADC',
    props: ['Dichtheid 0.91 g/cm³', 'Temp -10 / +100 °C', 'Zeer chemicaliënbestendig', 'Lasbaar'],
  },
  {
    code: 'PVC',
    name: 'Polyvinylchloride',
    slug: 'pvc',
    tagline: 'Stijf, chemisch bestendig, voordelig.',
    hex: '#F0E9DC',
    props: ['Dichtheid 1.38 g/cm³', 'Temp 0 / +60 °C', 'Zelfdovend', 'Goed bewerkbaar'],
  },
  {
    code: 'POM',
    name: 'Polyoxymethyleen (Acetal)',
    slug: 'pom',
    tagline: 'Vormvast, laag wrijvingscoëfficiënt.',
    hex: '#2B2E33',
    props: ['Dichtheid 1.41 g/cm³', 'Temp -40 / +100 °C', 'Maatvast', 'Ideaal voor tandwielen'],
  },
]

const root = ref<HTMLElement | null>(null)
const activeIndex = ref(0)
const reduced = useMkpeReducedMotion()

const activeTint = computed(() => useTintContrast(materials[activeIndex.value].hex))

onMounted(() => {
  if (!root.value) return
  if (reduced.value) return

  const items = root.value.querySelectorAll<HTMLElement>('.mat-item')
  if (!items.length || typeof IntersectionObserver === 'undefined') return

  const io = new IntersectionObserver((entries) => {
    // Pick the topmost visible item
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
    if (!visible) return
    const idx = Array.from(items).indexOf(visible.target as HTMLElement)
    if (idx >= 0) activeIndex.value = idx
  }, {
    rootMargin: '-40% 0px -40% 0px',
    threshold: 0,
  })
  items.forEach(el => io.observe(el))
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <section ref="root" class="relative py-24 lg:py-32">
    <div class="mx-auto max-w-container px-6 lg:px-10">
      <div class="mb-16 max-w-2xl">
        <div class="label-eyebrow">{{ t('home.materialsEyebrow') }}</div>
        <h2 class="mt-4 whitespace-pre-line font-display text-h2-fluid font-bold tracking-tight text-balance">
          {{ t('home.materialsTitle') }}
        </h2>
        <p class="mt-6 text-lead text-textc-dim text-pretty">{{ t('home.materialsLead') }}</p>
      </div>

      <div class="grid gap-12 lg:grid-cols-12">
        <!-- Visual column -->
        <div class="lg:col-span-5">
          <div class="mat-visual-sticky">
            <div
              class="mat-visual-inner"
              :class="{ 'is-dark-tint': activeTint.isDark }"
              :style="{ background: activeTint.bg }"
            >
              <div class="mat-sheet" :style="{ '--tint': activeTint.sheet }" />
              <div class="mat-badge">
                <span class="font-mono text-[0.6rem] uppercase tracking-[0.25em]">— Material</span>
                <div class="font-display text-4xl font-bold text-paper">{{ materials[activeIndex].code }}</div>
                <div class="text-sm text-paper/70">{{ materials[activeIndex].name }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- List column -->
        <div class="lg:col-span-7 space-y-4">
          <article
            v-for="(mat, i) in materials"
            :key="mat.slug"
            :class="['mat-item', { 'is-active': activeIndex === i }]"
          >
            <div class="flex items-baseline justify-between gap-4">
              <div>
                <div class="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                  — 0{{ i + 1 }} · {{ mat.code }}
                </div>
                <h3 class="mt-2 font-display text-h3-fluid font-bold tracking-tight">
                  {{ mat.name }}
                </h3>
                <p class="mt-2 text-textc-dim">{{ mat.tagline }}</p>
              </div>
              <NuxtLink
                :to="localePath(`/materialen/${mat.slug}`)"
                class="shrink-0 text-accent hover:text-accent-soft"
                :aria-label="t('materials.browseProducts', { name: mat.code })"
              >
                <Icon name="lucide:arrow-up-right" class="h-6 w-6" />
              </NuxtLink>
            </div>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="p in mat.props"
                :key="p"
                class="rounded-sm border border-line px-2 py-1 font-mono text-[0.7rem] uppercase tracking-wider text-textc-dim"
              >
                {{ p }}
              </span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mat-visual-sticky {
  position: relative;
}
@media (min-width: 1024px) {
  .mat-visual-sticky {
    position: sticky;
    top: 120px;
  }
}
.mat-visual-inner {
  position: relative;
  width: 100%;
  aspect-ratio: 4 / 5;
  min-height: 420px;
  border-radius: var(--r-lg);
  overflow: hidden;
  border: 1px solid var(--line);
  transition: background 700ms var(--ease-out);
}
.mat-sheet {
  position: absolute;
  inset: 10% 10% 10% 10%;
  background: var(--tint);
  border-radius: 4px;
  box-shadow:
    0 30px 60px rgba(0,0,0,0.45),
    inset 0 0 0 1px rgba(0,0,0,0.05);
  transform: rotate(-3deg);
  transition: transform 700ms var(--ease-out), background 700ms var(--ease-out);
}
.mat-visual-inner.is-dark-tint .mat-sheet {
  box-shadow:
    0 30px 60px rgba(0,0,0,0.35),
    inset 0 0 0 1px rgba(255,255,255,0.08);
}
.mat-sheet::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.3) 0%,
    rgba(255,255,255,0) 40%,
    rgba(0,0,0,0.08) 100%
  );
  pointer-events: none;
}
.mat-badge {
  position: absolute;
  left: 1.25rem;
  bottom: 1.25rem;
  padding: 0.75rem 1rem;
  background: rgba(255,255,255,0.94);
  backdrop-filter: blur(8px);
  border-radius: var(--r-sm);
  color: var(--text);
  box-shadow: 0 2px 8px rgba(15,23,42,0.08);
}

.mat-item {
  border-top: 1px solid var(--line);
  padding: 1.5rem 0;
  opacity: 0.45;
  transform: translateX(-0.25rem);
  transition: opacity 400ms var(--ease-out), transform 400ms var(--ease-out);
}
.mat-item.is-active {
  opacity: 1;
  transform: translateX(0);
}
.mat-item:last-child {
  border-bottom: 1px solid var(--line);
}

@media (max-width: 1023.98px) {
  .mat-item { opacity: 1; }
}
</style>
