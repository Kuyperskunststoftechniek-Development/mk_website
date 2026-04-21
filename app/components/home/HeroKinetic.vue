<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

const marqueeItems = computed(() =>
  t('home.marqueeItems').split('·').map(s => s.trim()).filter(Boolean),
)
const heroLines = computed(() => t('home.heroTitle').split('\n'))
</script>

<template>
  <section class="hero relative overflow-hidden pb-16 pt-32 lg:pb-28 lg:pt-44">
    <div class="hero-grid bg-grid-soft" aria-hidden="true" />

    <div class="mx-auto max-w-container px-6 lg:px-10">
      <div class="relative z-10 max-w-4xl">
        <div class="label-eyebrow mb-6">{{ t('home.eyebrow') }}</div>

        <h1 class="font-display font-bold leading-[0.95] tracking-tight text-balance">
          <span class="block text-h1-fluid">
            <MotionSplitText :text="heroLines[0] ?? ''" as="span" :stagger="0.06" />
          </span>
          <span class="block text-h1-fluid text-accent">
            <MotionSplitText :text="heroLines[1] ?? ''" as="span" :stagger="0.06" :delay="0.35" />
          </span>
        </h1>

        <MotionFadeInOnScroll :delay="900" :y="16">
          <p class="mt-8 max-w-2xl text-lead text-textc-dim text-pretty">
            {{ t('home.heroLead') }}
          </p>
        </MotionFadeInOnScroll>

        <MotionFadeInOnScroll :delay="1100" :y="16">
          <div class="mt-10 flex flex-wrap items-center gap-4">
            <MotionMagneticButton as="NuxtLink" :to="localePath('/offerte')" class="btn btn-primary">
              {{ t('cta.requestQuote') }}
              <Icon name="lucide:arrow-right" class="h-4 w-4" />
            </MotionMagneticButton>
            <NuxtLink :to="localePath('/producten')" class="btn btn-ghost">
              {{ t('cta.viewProducts') }}
            </NuxtLink>
          </div>
        </MotionFadeInOnScroll>
      </div>
    </div>

    <!-- Bottom marquee: materiaal-namen -->
    <div class="hero-marquee mt-24 border-y border-line py-6">
      <MotionMarquee gap="3.5rem">
        <div
          v-for="(item, i) in marqueeItems.concat(marqueeItems)"
          :key="`m-${i}`"
          class="flex items-center gap-6 font-display text-4xl sm:text-5xl font-bold text-textc-muted"
        >
          <Icon name="lucide:dot" class="h-5 w-5 text-accent" />
          <span>{{ item }}</span>
        </div>
      </MotionMarquee>
    </div>

    <!-- Floating accent (decor) -->
    <div class="hero-accent" aria-hidden="true" />
  </section>
</template>

<style scoped>
.hero {
  background:
    radial-gradient(ellipse at 20% -10%, rgba(232,90,12,0.12), transparent 55%),
    radial-gradient(ellipse at 110% 20%, rgba(232,90,12,0.06), transparent 60%),
    var(--ink);
}
.hero-grid {
  position: absolute;
  inset: 0;
  opacity: 0.6;
  pointer-events: none;
}
.hero-accent {
  position: absolute;
  right: -6rem;
  top: 8rem;
  width: 22rem;
  height: 22rem;
  border: 1px solid var(--accent);
  border-radius: 50%;
  filter: blur(0.5px);
  opacity: 0.25;
  animation: slowspin 28s linear infinite;
}
.hero-accent::after {
  content: '';
  position: absolute;
  inset: 18%;
  border: 1px dashed var(--accent);
  border-radius: 50%;
  animation: slowspin 20s linear infinite reverse;
}
@keyframes slowspin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@media (prefers-reduced-motion: reduce) {
  .hero-accent { animation: none; }
  .hero-accent::after { animation: none; }
}
</style>
