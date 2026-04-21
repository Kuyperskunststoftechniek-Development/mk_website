<script setup lang="ts">
const { locale } = useI18n()

// Reflect locale on <html lang="..."> for a11y + SEO
useHead({
  htmlAttrs: computed(() => ({ lang: locale.value })),
})
</script>

<template>
  <div class="relative min-h-dvh">
    <NuxtLoadingIndicator color="#E85A0C" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
