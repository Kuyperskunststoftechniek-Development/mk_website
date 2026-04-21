<script setup lang="ts">
const props = defineProps<{
  modelValue: {
    material: string
    form: string
    color: string
  }
  materials: string[]
  forms: string[]
  colors: string[]
}>()
const emit = defineEmits<{
  'update:modelValue': [value: typeof props.modelValue]
  reset: []
}>()

const { t } = useI18n()

function setValue<K extends keyof typeof props.modelValue>(key: K, value: string) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<template>
  <div class="filter-bar">
    <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
      <label class="block">
        <span class="field-label">{{ t('forms.material') }}</span>
        <select
          class="select"
          :value="modelValue.material"
          @change="setValue('material', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">{{ t('products.filters.all') }}</option>
          <option v-for="m in materials" :key="m" :value="m">{{ m }}</option>
        </select>
      </label>
      <label class="block">
        <span class="field-label">{{ t('forms.form') }}</span>
        <select
          class="select"
          :value="modelValue.form"
          @change="setValue('form', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">{{ t('products.filters.all') }}</option>
          <option v-for="f in forms" :key="f" :value="f">{{ f }}</option>
        </select>
      </label>
      <label class="block">
        <span class="field-label">{{ t('forms.color') }}</span>
        <select
          class="select"
          :value="modelValue.color"
          @change="setValue('color', ($event.target as HTMLSelectElement).value)"
        >
          <option value="">{{ t('products.filters.all') }}</option>
          <option v-for="c in colors" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <div class="flex items-end">
        <button
          type="button"
          class="btn btn-ghost w-full lg:w-auto"
          @click="emit('reset')"
        >
          <Icon name="lucide:rotate-ccw" class="h-4 w-4" />
          {{ t('products.filters.reset') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.filter-bar {
  background: var(--ink-soft);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 1.25rem;
}
</style>
