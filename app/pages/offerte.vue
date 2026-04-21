<script setup lang="ts">
const { t, locale } = useI18n()

const { data: products } = await useAsyncData(
  `quote-products-${locale.value}`,
  () => queryContent('/producten').where({ _locale: locale.value }).sort({ order: 1 }).find(),
)

useSeoMeta({
  title: () => `${t('quote.pageTitle')} — ${t('meta.siteName')}`,
  description: () => t('quote.pageLead'),
})
</script>

<template>
  <div class="pt-28 pb-16 lg:pt-40">
    <div class="mx-auto max-w-container px-6 lg:px-10">
      <header class="mb-12 max-w-3xl">
        <div class="label-eyebrow">— {{ t('meta.siteName') }}</div>
        <h1 class="mt-6 font-display text-h1-fluid font-bold leading-tight tracking-tight">
          {{ t('quote.pageTitle') }}
        </h1>
        <p class="mt-6 text-lead text-textc-dim text-pretty">{{ t('quote.pageLead') }}</p>
      </header>

      <ProductBulkQuoteForm :products="(products ?? []) as any[]" />
    </div>
  </div>
</template>
