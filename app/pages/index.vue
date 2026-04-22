<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => `${t('meta.siteName')} — ${t('meta.tagline')}`,
  description: () => t('meta.tagline'),
  ogTitle: () => `${t('meta.siteName')} — ${t('meta.tagline')}`,
  ogDescription: () => t('meta.tagline'),
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <div>
    <HomeHeroKinetic />
    <HomeUspStrip />
    <HomeStockHighlight />
    <HomeCtaBlock />
  </div>
</template>
