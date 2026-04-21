<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()

const { data: materials } = await useAsyncData(
  `materials-${locale.value}`,
  () => queryContent('/materialen').where({ _locale: locale.value }).sort({ order: 1 }).find(),
)

useSeoMeta({
  title: () => `${t('materials.pageTitle')} — ${t('meta.siteName')}`,
  description: () => t('materials.pageLead'),
})
</script>

<template>
  <div class="pt-28 pb-16 lg:pt-40">
    <div class="mx-auto max-w-container px-6 lg:px-10">
      <header class="mb-16 max-w-3xl">
        <div class="label-eyebrow">— {{ t('meta.siteName') }}</div>
        <h1 class="mt-6 font-display text-h1-fluid font-bold leading-tight tracking-tight">
          {{ t('materials.pageTitle') }}
        </h1>
        <p class="mt-6 text-lead text-textc-dim text-pretty">{{ t('materials.pageLead') }}</p>
      </header>

      <div class="grid gap-6 md:grid-cols-2">
        <MotionFadeInOnScroll
          v-for="(mat, i) in materials ?? []"
          :key="mat._path"
          :delay="i * 80"
          as="article"
          class="mat-card"
        >
          <NuxtLink :to="localePath(`/materialen/${mat.slug}`)" class="block h-full p-8">
            <div class="flex items-start justify-between gap-4">
              <div>
                <div class="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent">
                  — {{ mat.code }}
                </div>
                <h2 class="mt-3 font-display text-h3-fluid font-bold tracking-tight">{{ mat.title }}</h2>
              </div>
              <div
                class="hidden h-16 w-16 shrink-0 rounded-sm sm:block"
                :style="{ background: mat.accentHex }"
              />
            </div>
            <p class="mt-4 text-textc-dim leading-relaxed">{{ mat.tagline }}</p>
            <div class="mt-6 inline-flex items-center gap-2 text-accent text-sm font-medium">
              {{ t('cta.readMore') }}
              <Icon name="lucide:arrow-right" class="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </NuxtLink>
        </MotionFadeInOnScroll>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mat-card {
  border: 1px solid var(--line);
  background: linear-gradient(180deg, var(--ink-soft), transparent 80%);
  border-radius: var(--r-md);
  transition: border-color 300ms var(--ease-out), transform 300ms var(--ease-out);
}
.mat-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}
</style>
