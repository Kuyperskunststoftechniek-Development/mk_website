<script setup lang="ts">
const props = defineProps<{
  error: { statusCode: number; message: string }
}>()

const { t } = useI18n()

function handleClear() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="min-h-dvh flex items-center justify-center bg-ink px-6">
    <div class="max-w-xl text-center">
      <div class="label-eyebrow">— {{ props.error.statusCode }}</div>
      <h1 class="mt-6 font-display text-h1-fluid font-bold tracking-tight">
        {{ props.error.statusCode === 404 ? t('errors.notFoundTitle') : 'Error' }}
      </h1>
      <p class="mt-6 text-lead text-textc-dim">
        {{ props.error.statusCode === 404 ? t('errors.notFoundLead') : props.error.message }}
      </p>
      <button class="btn btn-primary mt-10" @click="handleClear">
        <Icon name="lucide:home" class="h-4 w-4" />
        {{ t('errors.backHome') }}
      </button>
    </div>
  </div>
</template>
