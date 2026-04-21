<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

const available = computed(() =>
  (locales.value as { code: string; name: string }[]).map(l => ({
    code: l.code,
    name: l.name,
    active: l.code === locale.value,
  })),
)
</script>

<template>
  <div class="flex items-center gap-1 rounded-md border border-line-strong p-0.5">
    <NuxtLink
      v-for="l in available"
      :key="l.code"
      :to="switchLocalePath(l.code)"
      :class="[
        'px-2 py-1 text-xs font-mono uppercase tracking-wider rounded-sm transition-colors',
        l.active ? 'bg-accent text-white' : 'text-textc-dim hover:text-textc',
      ]"
      @click="setLocale(l.code as 'nl' | 'en')"
    >
      {{ l.code }}
    </NuxtLink>
  </div>
</template>
