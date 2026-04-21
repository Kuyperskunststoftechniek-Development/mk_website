<script setup lang="ts">
const { t } = useI18n()
useSeoMeta({
  title: () => `${t('footer.terms')} — ${t('meta.siteName')}`,
})
</script>

<template>
  <div class="pt-28 pb-16 lg:pt-40">
    <div class="mx-auto max-w-3xl px-6 lg:px-10">
      <h1 class="font-display text-h1-fluid font-bold tracking-tight">{{ t('footer.terms') }}</h1>
      <p class="mt-8 text-lead text-textc-dim">
        Placeholder. Juridische tekst volgt zodra de definitieve versie beschikbaar is.
      </p>
    </div>
  </div>
</template>
