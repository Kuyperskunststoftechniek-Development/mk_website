<script setup lang="ts">
const { t } = useI18n()

const usps = computed(() => [
  { value: 1200, suffix: ' m²', label: t('home.usp1Label'), desc: t('home.usp1Desc') },
  { value: 24,   suffix: ' h',  label: t('home.usp2Label'), desc: t('home.usp2Desc') },
  { value: 15,   suffix: '%',   label: t('home.usp3Label'), desc: t('home.usp3Desc') },
  { value: 9,    suffix: '',    label: t('home.usp4Label'), desc: t('home.usp4Desc') },
])
</script>

<template>
  <section class="relative py-24 lg:py-32">
    <div class="mx-auto max-w-container px-6 lg:px-10">
      <MotionFadeInOnScroll>
        <div class="label-eyebrow">{{ t('home.usps.title') }}</div>
        <h2 class="mt-4 max-w-xl font-display text-h2-fluid font-bold leading-tight tracking-tight text-balance">
          {{ t('home.usps.lead') }}
        </h2>
      </MotionFadeInOnScroll>

      <div class="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <MotionFadeInOnScroll
          v-for="(u, i) in usps"
          :key="i"
          :delay="i * 120"
          class="usp-card"
        >
          <div class="font-display text-5xl font-bold text-accent">
            <MotionCountUp :value="u.value" :suffix="u.suffix" />
          </div>
          <div class="mt-3 font-mono text-xs uppercase tracking-[0.18em] text-textc-muted">
            — {{ u.label }}
          </div>
          <p class="mt-2 text-textc-dim leading-relaxed">{{ u.desc }}</p>
        </MotionFadeInOnScroll>
      </div>
    </div>
  </section>
</template>

<style scoped>
.usp-card {
  position: relative;
  padding: 1.5rem;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: linear-gradient(180deg, var(--ink-soft), transparent);
}
</style>
