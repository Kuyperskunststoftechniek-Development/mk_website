<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const cart = useCart()
const { formatEur, formatWeight } = usePricing()

useSeoMeta({
  title: () => `${t('checkout.pageTitle')} — ${t('meta.siteName')}`,
  description: () => t('checkout.pageLead'),
})

// Redirect empty cart back to cart page
onMounted(() => {
  if (cart.isEmpty.value && status.value === 'idle') {
    router.replace(localePath('/winkelmandje'))
  }
})

const state = reactive({
  companyName: '',
  kvk: '',
  vatNumber: '',
  poNumber: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  deliveryStreet: '',
  deliveryPostal: '',
  deliveryCity: '',
  deliveryCountry: 'Nederland',
  sameBillingAddress: true,
  billingStreet: '',
  billingPostal: '',
  billingCity: '',
  billingCountry: 'Nederland',
  notes: '',
  privacy: false,
  website: '', // honeypot
})

const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')
const errorMsg = ref('')

async function submit() {
  if (status.value === 'sending') return
  status.value = 'sending'
  errorMsg.value = ''
  try {
    await $fetch('/api/order', {
      method: 'POST',
      body: {
        locale: locale.value,
        items: cart.items.value,
        totals: {
          subtotalExcl: cart.subtotalExcl.value,
          btw: cart.btw.value,
          totalIncl: cart.totalIncl.value,
          totalWeight: cart.totalWeight.value,
        },
        ...state,
      },
    })
    status.value = 'success'
    cart.clear()
  } catch (e: any) {
    status.value = 'error'
    errorMsg.value = e?.data?.message || t('forms.error')
  }
}
</script>

<template>
  <div class="pt-28 pb-16 lg:pt-40">
    <div class="mx-auto max-w-container px-6 lg:px-10">
      <!-- Success state -->
      <div v-if="status === 'success'" class="mx-auto max-w-2xl rounded-md border border-accent bg-[rgba(255,122,26,0.05)] p-10 text-center">
        <Icon name="lucide:circle-check-big" class="h-14 w-14 text-accent mx-auto" />
        <h1 class="mt-6 font-display text-h2-fluid font-bold tracking-tight">
          {{ t('checkout.successTitle') }}
        </h1>
        <p class="mt-4 text-lead text-textc-dim">{{ t('checkout.successLead') }}</p>
        <NuxtLink :to="localePath('/producten')" class="btn btn-primary mt-8">
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
          {{ t('checkout.backToProducts') }}
        </NuxtLink>
      </div>

      <div v-else>
        <header class="mb-10 max-w-3xl">
          <NuxtLink :to="localePath('/winkelmandje')" class="inline-flex items-center gap-2 text-sm text-textc-dim hover:text-accent">
            <Icon name="lucide:arrow-left" class="h-4 w-4" />
            {{ t('cart.title') }}
          </NuxtLink>
          <div class="label-eyebrow mt-6">— {{ t('meta.siteName') }}</div>
          <h1 class="mt-4 font-display text-h1-fluid font-bold leading-tight tracking-tight">
            {{ t('checkout.pageTitle') }}
          </h1>
          <p class="mt-6 text-lead text-textc-dim text-pretty">{{ t('checkout.pageLead') }}</p>
        </header>

        <form class="grid gap-10 lg:grid-cols-12" novalidate @submit.prevent="submit">
          <div class="lg:col-span-8 space-y-8">
            <div class="hidden" aria-hidden="true">
              <label>Website <input v-model="state.website" type="text" tabindex="-1" autocomplete="off"></label>
            </div>

            <!-- Company -->
            <fieldset class="checkout-section">
              <legend class="label-eyebrow">{{ t('checkout.companyDetails') }}</legend>
              <div class="mt-4 grid gap-5 md:grid-cols-2">
                <label class="block md:col-span-2">
                  <span class="field-label">{{ t('forms.company') }} *</span>
                  <input v-model="state.companyName" class="input" type="text" required>
                </label>
                <label class="block">
                  <span class="field-label">{{ t('checkout.kvk') }} *</span>
                  <input v-model="state.kvk" class="input" type="text" required>
                </label>
                <label class="block">
                  <span class="field-label">{{ t('checkout.vatNumber') }}</span>
                  <input v-model="state.vatNumber" class="input" type="text">
                </label>
                <label class="block md:col-span-2">
                  <span class="field-label">{{ t('checkout.poNumber') }}</span>
                  <input v-model="state.poNumber" class="input" type="text">
                </label>
              </div>
            </fieldset>

            <!-- Contact -->
            <fieldset class="checkout-section">
              <legend class="label-eyebrow">{{ t('checkout.contactDetails') }}</legend>
              <div class="mt-4 grid gap-5 md:grid-cols-2">
                <label class="block">
                  <span class="field-label">{{ t('forms.name') }} *</span>
                  <input v-model="state.contactName" class="input" type="text" required>
                </label>
                <label class="block">
                  <span class="field-label">{{ t('forms.phone') }}</span>
                  <input v-model="state.contactPhone" class="input" type="tel">
                </label>
                <label class="block md:col-span-2">
                  <span class="field-label">{{ t('forms.email') }} *</span>
                  <input v-model="state.contactEmail" class="input" type="email" required>
                </label>
              </div>
            </fieldset>

            <!-- Delivery -->
            <fieldset class="checkout-section">
              <legend class="label-eyebrow">{{ t('checkout.delivery') }}</legend>
              <div class="mt-4 grid gap-5 md:grid-cols-2">
                <label class="block md:col-span-2">
                  <span class="field-label">{{ t('checkout.street') }} *</span>
                  <input v-model="state.deliveryStreet" class="input" type="text" required>
                </label>
                <label class="block">
                  <span class="field-label">{{ t('checkout.postalCode') }} *</span>
                  <input v-model="state.deliveryPostal" class="input" type="text" required>
                </label>
                <label class="block">
                  <span class="field-label">{{ t('checkout.city') }} *</span>
                  <input v-model="state.deliveryCity" class="input" type="text" required>
                </label>
                <label class="block md:col-span-2">
                  <span class="field-label">{{ t('checkout.country') }} *</span>
                  <input v-model="state.deliveryCountry" class="input" type="text" required>
                </label>
              </div>
            </fieldset>

            <!-- Billing -->
            <fieldset class="checkout-section">
              <legend class="label-eyebrow">{{ t('checkout.invoice') }}</legend>
              <div class="mt-4 space-y-4">
                <label class="flex items-center gap-3">
                  <input v-model="state.sameBillingAddress" type="checkbox">
                  <span>{{ t('checkout.sameAsDelivery') }}</span>
                </label>
                <div v-if="!state.sameBillingAddress" class="grid gap-5 md:grid-cols-2">
                  <label class="block md:col-span-2">
                    <span class="field-label">{{ t('checkout.street') }} *</span>
                    <input v-model="state.billingStreet" class="input" type="text" required>
                  </label>
                  <label class="block">
                    <span class="field-label">{{ t('checkout.postalCode') }} *</span>
                    <input v-model="state.billingPostal" class="input" type="text" required>
                  </label>
                  <label class="block">
                    <span class="field-label">{{ t('checkout.city') }} *</span>
                    <input v-model="state.billingCity" class="input" type="text" required>
                  </label>
                  <label class="block md:col-span-2">
                    <span class="field-label">{{ t('checkout.country') }} *</span>
                    <input v-model="state.billingCountry" class="input" type="text" required>
                  </label>
                </div>
              </div>
            </fieldset>

            <!-- Notes + consent -->
            <fieldset class="checkout-section">
              <label class="block">
                <span class="field-label">{{ t('forms.message') }}</span>
                <textarea v-model="state.notes" class="textarea" rows="3" />
              </label>
              <label class="mt-4 flex items-start gap-3 text-sm text-textc-dim">
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
            </fieldset>
          </div>

          <!-- Review / Submit -->
          <aside class="lg:col-span-4">
            <div class="cart-summary">
              <h2 class="font-display text-xl font-bold mb-4">{{ t('checkout.review') }}</h2>
              <ul class="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                <li
                  v-for="item in cart.items.value"
                  :key="`${item.productSlug}-${item.variantSize}`"
                  class="flex items-start gap-3 text-sm"
                >
                  <div
                    class="checkout-thumb h-10 w-10 shrink-0 rounded-sm border border-line"
                    :style="{
                      background: useTintContrast(item.accentHex).bg,
                      '--tint': useTintContrast(item.accentHex).sheet,
                    }"
                  >
                    <div class="checkout-thumb-sheet" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="truncate">{{ item.title }}</div>
                    <div class="text-xs text-textc-muted">{{ item.variantSize }}<span v-if="item.colorRal"> · {{ item.colorRal }}</span> × {{ item.quantity }}</div>
                  </div>
                  <div class="font-medium">
                    {{ formatEur(item.pricePerSheet * item.quantity, locale as 'nl' | 'en') }}
                  </div>
                </li>
              </ul>
              <dl class="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                <div class="flex justify-between">
                  <dt class="text-textc-dim">{{ t('cart.totalWeight') }}</dt>
                  <dd>{{ formatWeight(cart.totalWeight.value, locale as 'nl' | 'en') }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-textc-dim">{{ t('cart.subtotal') }}</dt>
                  <dd>{{ formatEur(cart.subtotalExcl.value, locale as 'nl' | 'en') }}</dd>
                </div>
                <div class="flex justify-between">
                  <dt class="text-textc-dim">{{ t('cart.btw') }}</dt>
                  <dd>{{ formatEur(cart.btw.value, locale as 'nl' | 'en') }}</dd>
                </div>
                <div class="flex justify-between border-t border-line pt-3 font-display text-xl font-bold">
                  <dt>{{ t('cart.totalIncl') }}</dt>
                  <dd class="text-accent">{{ formatEur(cart.totalIncl.value, locale as 'nl' | 'en') }}</dd>
                </div>
              </dl>
              <button
                type="submit"
                class="btn btn-primary w-full justify-center mt-6"
                :disabled="status === 'sending'"
              >
                <Icon
                  :name="status === 'sending' ? 'lucide:loader-2' : 'lucide:check'"
                  :class="['h-4 w-4', { 'animate-spin': status === 'sending' }]"
                />
                {{ status === 'sending' ? t('forms.submitting') : t('checkout.submitOrder') }}
              </button>
              <p v-if="status === 'error'" class="mt-3 text-sm text-[color:var(--err)]">{{ errorMsg }}</p>
            </div>
          </aside>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-section {
  border: 1px solid var(--line);
  background: var(--ink-soft);
  border-radius: var(--r-md);
  padding: 1.5rem;
}
.checkout-thumb {
  position: relative;
  overflow: hidden;
}
.checkout-thumb-sheet {
  position: absolute;
  inset: 22%;
  background: var(--tint);
  border-radius: 1px;
  transform: rotate(-4deg);
  box-shadow: 0 1px 3px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(0,0,0,0.06);
}

.cart-summary {
  position: sticky;
  top: 120px;
  border: 1px solid var(--line);
  background: var(--ink-soft);
  border-radius: var(--r-md);
  padding: 1.5rem;
}
</style>
