<script setup lang="ts">
const { t, locale } = useI18n()

const state = reactive({
  name: '',
  company: '',
  email: '',
  phone: '',
  message: '',
  website: '', // honeypot
  privacy: false,
})

const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')
const errorMsg = ref('')

async function submit() {
  if (status.value === 'sending') return
  status.value = 'sending'
  errorMsg.value = ''
  try {
    await $fetch('/api/lead', {
      method: 'POST',
      body: { kind: 'contact', locale: locale.value, ...state },
    })
    status.value = 'success'
  } catch (e: any) {
    status.value = 'error'
    errorMsg.value = e?.data?.message || t('forms.error')
  }
}
</script>

<template>
  <form v-if="status !== 'success'" class="contact-form" novalidate @submit.prevent="submit">
    <div class="hidden" aria-hidden="true">
      <label>Website <input v-model="state.website" type="text" tabindex="-1" autocomplete="off"></label>
    </div>

    <div class="grid gap-5 md:grid-cols-2">
      <label class="block">
        <span class="field-label">{{ t('forms.name') }} *</span>
        <input v-model="state.name" class="input" type="text" required>
      </label>
      <label class="block">
        <span class="field-label">{{ t('forms.company') }}</span>
        <input v-model="state.company" class="input" type="text">
      </label>
      <label class="block">
        <span class="field-label">{{ t('forms.email') }} *</span>
        <input v-model="state.email" class="input" type="email" required>
      </label>
      <label class="block">
        <span class="field-label">{{ t('forms.phone') }}</span>
        <input v-model="state.phone" class="input" type="tel">
      </label>
      <label class="block md:col-span-2">
        <span class="field-label">{{ t('forms.message') }} *</span>
        <textarea v-model="state.message" class="textarea" rows="5" required />
      </label>
      <label class="md:col-span-2 flex items-start gap-3 text-sm text-textc-dim">
        <input v-model="state.privacy" type="checkbox" required class="mt-1">
        <span>
          <i18n-t keypath="forms.privacy" tag="span">
            <template #link>
              <NuxtLink to="/privacybeleid" class="text-accent hover:text-accent-soft">
                {{ t('forms.privacyLink') }}
              </NuxtLink>
            </template>
          </i18n-t>
        </span>
      </label>
      <div class="md:col-span-2 flex flex-wrap items-center gap-4">
        <button type="submit" class="btn btn-primary" :disabled="status === 'sending'">
          <Icon v-if="status === 'sending'" name="lucide:loader-2" class="h-4 w-4 animate-spin" />
          <Icon v-else name="lucide:send" class="h-4 w-4" />
          {{ status === 'sending' ? t('forms.submitting') : t('forms.submit') }}
        </button>
        <p v-if="status === 'error'" class="text-sm text-[color:var(--err)]">{{ errorMsg }}</p>
      </div>
    </div>
  </form>

  <div v-else class="form-success">
    <Icon name="lucide:circle-check-big" class="h-10 w-10 text-accent" />
    <h3 class="mt-4 font-display text-2xl font-bold">{{ t('forms.success') }}</h3>
  </div>
</template>

<style scoped>
.contact-form {
  border: 1px solid var(--line);
  background: var(--ink-soft);
  border-radius: var(--r-md);
  padding: 1.75rem;
}
.form-success {
  border: 1px solid var(--accent);
  background: linear-gradient(180deg, rgba(255,122,26,0.08), transparent);
  border-radius: var(--r-md);
  padding: 2rem;
  text-align: center;
}
</style>
