<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useSeoMeta({
  title: () => `${t('about.pageTitle')} — ${t('meta.siteName')}`,
  description: () => t('about.pageLead'),
})
</script>

<template>
  <div class="pt-28 pb-16 lg:pt-40">
    <div class="mx-auto max-w-container px-6 lg:px-10">
      <header class="mb-16 max-w-3xl">
        <div class="label-eyebrow">— {{ t('meta.siteName') }}</div>
        <h1 class="mt-6 font-display text-h1-fluid font-bold leading-tight tracking-tight">
          {{ t('about.pageTitle') }}
        </h1>
        <p class="mt-6 text-lead text-textc-dim text-pretty">{{ t('about.pageLead') }}</p>
      </header>

      <section class="grid gap-12 lg:grid-cols-12">
        <MotionFadeInOnScroll class="lg:col-span-5">
          <div class="story-visual" aria-hidden="true">
            <div class="story-stack">
              <div class="story-sheet" style="--tint: #E8EAEC" />
              <div class="story-sheet" style="--tint: #D9DADC; transform: translate(12px, 12px) rotate(-2deg)" />
              <div class="story-sheet" style="--tint: #F0E9DC; transform: translate(24px, 24px) rotate(-4deg)" />
            </div>
          </div>
        </MotionFadeInOnScroll>

        <MotionFadeInOnScroll class="lg:col-span-7" :delay="150">
          <div class="label-eyebrow">{{ t('about.storyTitle') }}</div>
          <p class="mt-4 text-lead leading-relaxed text-textc">
            {{ t('about.storyBody') }}
          </p>

          <div class="mt-10 flex flex-wrap gap-3">
            <NuxtLink :to="localePath('/materialen')" class="btn btn-ghost">
              {{ t('cta.exploreMaterials') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/offerte')" class="btn btn-primary">
              {{ t('cta.requestQuote') }}
              <Icon name="lucide:arrow-right" class="h-4 w-4" />
            </NuxtLink>
          </div>
        </MotionFadeInOnScroll>
      </section>
    </div>
  </div>
</template>

<style scoped>
.story-visual {
  position: relative;
  aspect-ratio: 4 / 5;
  background: var(--ink-soft);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  overflow: hidden;
}
.story-stack {
  position: absolute;
  inset: 20%;
}
.story-sheet {
  position: absolute;
  inset: 0;
  background: var(--tint);
  border-radius: 4px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.3);
}
.story-sheet::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.28) 0%,
    rgba(255,255,255,0) 45%,
    rgba(0,0,0,0.07) 100%
  );
  pointer-events: none;
}
</style>
