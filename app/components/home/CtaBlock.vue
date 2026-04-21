<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
</script>

<template>
  <section class="relative py-24 lg:py-32">
    <div class="mx-auto max-w-container px-6 lg:px-10">
      <div class="cta-block">
        <div class="bg-grid absolute inset-0 opacity-20" aria-hidden="true" />
        <div class="relative z-10 grid items-center gap-10 lg:grid-cols-12">
          <div class="lg:col-span-7">
            <MotionFadeInOnScroll>
              <h3 class="font-display text-h2-fluid font-bold leading-tight tracking-tight text-balance">
                {{ t('home.ctaBlockTitle') }}
              </h3>
              <p class="mt-4 max-w-xl text-lead text-textc-dim text-pretty">
                {{ t('home.ctaBlockLead') }}
              </p>
            </MotionFadeInOnScroll>
          </div>
          <div class="lg:col-span-5 flex flex-wrap gap-4 lg:justify-end">
            <MotionMagneticButton as="NuxtLink" :to="localePath('/offerte')" class="btn btn-primary">
              {{ t('cta.requestQuote') }}
              <Icon name="lucide:arrow-right" class="h-4 w-4" />
            </MotionMagneticButton>
            <NuxtLink :to="localePath('/contact')" class="btn btn-ghost">
              {{ t('cta.getInTouch') }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta-block {
  position: relative;
  overflow: hidden;
  border-radius: var(--r-lg);
  border: 1px solid var(--line);
  background:
    radial-gradient(ellipse at top right, rgba(232,90,12,0.08), transparent 55%),
    linear-gradient(135deg, var(--ink-soft), var(--ink-softer));
  padding: 3rem 2rem;
  box-shadow: 0 2px 12px rgba(15,23,42,0.04);
}
@media (min-width: 1024px) {
  .cta-block { padding: 4rem 3.5rem; }
}
</style>
