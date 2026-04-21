<script setup lang="ts">
type CatalogueProduct = {
  slug: string
  title: string
  material: string
  thickness: number
  color: string
  colorRal?: string
  density: number
  pricePerKg: number
  variants: Array<{ size: string; widthMm: number; heightMm: number }>
  accentHex?: string
}

const props = defineProps<{
  products: CatalogueProduct[]
}>()

const { t, locale } = useI18n()
const { calcWeightKg, calcSheetPrice, formatEur, formatWeight } = usePricing()

type Row = {
  productSlug: string
  variantSize: string
  quantity: number
}

function blankRow(): Row {
  const first = props.products[0]
  return {
    productSlug: first?.slug ?? '',
    variantSize: first?.variants?.[0]?.size ?? '',
    quantity: 1,
  }
}

const rows = ref<Row[]>([blankRow()])
const state = reactive({
  name: '',
  company: '',
  email: '',
  phone: '',
  message: '',
  website: '',
  privacy: false,
})

function productFor(slug: string): CatalogueProduct | undefined {
  return props.products.find(p => p.slug === slug)
}

function variantFor(slug: string, size: string) {
  return productFor(slug)?.variants.find(v => v.size === size)
}

function weightForRow(row: Row) {
  const p = productFor(row.productSlug)
  const v = variantFor(row.productSlug, row.variantSize)
  if (!p || !v) return 0
  return calcWeightKg(v.widthMm, v.heightMm, p.thickness, p.density)
}

function priceForRow(row: Row) {
  const p = productFor(row.productSlug)
  const v = variantFor(row.productSlug, row.variantSize)
  if (!p || !v) return 0
  return calcSheetPrice(p as any, v)
}

function onProductChange(row: Row, slug: string) {
  row.productSlug = slug
  const prod = productFor(slug)
  row.variantSize = prod?.variants?.[0]?.size ?? ''
}

function addRow() {
  rows.value.push(blankRow())
}
function removeRow(i: number) {
  rows.value.splice(i, 1)
  if (!rows.value.length) rows.value.push(blankRow())
}

const estimateTotal = computed(() =>
  rows.value.reduce((sum, r) => sum + priceForRow(r) * r.quantity, 0),
)

const status = ref<'idle' | 'sending' | 'success' | 'error'>('idle')
const errorMsg = ref('')

async function submit() {
  if (status.value === 'sending') return
  status.value = 'sending'
  errorMsg.value = ''
  try {
    const payload = {
      kind: 'bulk' as const,
      locale: locale.value,
      rows: rows.value.map((r) => {
        const p = productFor(r.productSlug)
        const ralSuffix = p?.colorRal ? ` · ${p.colorRal}` : ''
        return {
          material: `${p?.material ?? ''} ${p?.color ?? ''}`.trim(),
          form: 'plaat',
          thickness: String(p?.thickness ?? ''),
          dimensions: `${r.variantSize}${ralSuffix}`,
          quantity: r.quantity,
        }
      }),
      ...state,
    }
    await $fetch('/api/lead', { method: 'POST', body: payload })
    status.value = 'success'
  } catch (e: any) {
    status.value = 'error'
    errorMsg.value = e?.data?.message || t('forms.error')
  }
}
</script>

<template>
  <form v-if="status !== 'success'" class="bulk-form" novalidate @submit.prevent="submit">
    <div class="hidden" aria-hidden="true">
      <label>Website <input v-model="state.website" type="text" tabindex="-1" autocomplete="off"></label>
    </div>

    <!-- Rows -->
    <div class="space-y-4">
      <div v-for="(row, idx) in rows" :key="idx" class="bulk-row">
        <div class="row-index">— {{ String(idx + 1).padStart(2, '0') }}</div>
        <div class="grid gap-3 sm:grid-cols-[1.6fr_1fr_110px]">
          <label class="block">
            <span class="field-label">{{ t('forms.product') }}</span>
            <select
              class="select"
              :value="row.productSlug"
              required
              @change="onProductChange(row, ($event.target as HTMLSelectElement).value)"
            >
              <option
                v-for="p in products"
                :key="p.slug"
                :value="p.slug"
              >
                {{ p.title }}{{ p.colorRal ? ` (${p.colorRal})` : '' }}
              </option>
            </select>
          </label>
          <label class="block">
            <span class="field-label">{{ t('forms.dimensions') }}</span>
            <select v-model="row.variantSize" class="select" required>
              <option
                v-for="v in productFor(row.productSlug)?.variants ?? []"
                :key="v.size"
                :value="v.size"
              >
                {{ v.size }}
              </option>
            </select>
          </label>
          <label class="block">
            <span class="field-label">{{ t('forms.quantity') }}</span>
            <input v-model.number="row.quantity" class="input" type="number" min="1" required>
          </label>
        </div>
        <div class="row-line-summary">
          <span>{{ formatWeight(weightForRow(row), locale as 'nl' | 'en') }} {{ t('cart.perSheet') }}</span>
          <span class="font-semibold text-accent">
            {{ formatEur(priceForRow(row) * row.quantity, locale as 'nl' | 'en') }} {{ t('products.exclVat') }}
          </span>
        </div>
        <button
          v-if="rows.length > 1"
          type="button"
          class="remove-btn"
          :aria-label="t('forms.removeRow')"
          @click="removeRow(idx)"
        >
          <Icon name="lucide:x" class="h-4 w-4" />
        </button>
      </div>

      <button type="button" class="btn btn-ghost" @click="addRow">
        <Icon name="lucide:plus" class="h-4 w-4" />
        {{ t('forms.addRow') }}
      </button>
    </div>

    <!-- Estimate total -->
    <div class="quote-total mt-6">
      <div class="label-eyebrow">{{ t('cart.subtotal') }} ({{ t('products.exclVat') }})</div>
      <div class="mt-1 font-display text-2xl font-bold text-accent">
        {{ formatEur(estimateTotal, locale as 'nl' | 'en') }}
      </div>
      <p class="mt-1 text-xs text-textc-muted">
        Indicatief — definitieve prijs in offerte.
      </p>
    </div>

    <!-- Contact block -->
    <div class="mt-10 grid gap-5 border-t border-line pt-8 md:grid-cols-2">
      <label class="block">
        <span class="field-label">{{ t('forms.name') }} *</span>
        <input v-model="state.name" class="input" type="text" required>
      </label>
      <label class="block">
        <span class="field-label">{{ t('forms.company') }} *</span>
        <input v-model="state.company" class="input" type="text" required>
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
        <span class="field-label">{{ t('forms.message') }}</span>
        <textarea v-model="state.message" class="textarea" rows="4" />
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
.bulk-form {
  border: 1px solid var(--line);
  background: var(--ink-soft);
  border-radius: var(--r-md);
  padding: 1.75rem;
}
.bulk-row {
  position: relative;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 1rem 2.5rem 1rem 2.5rem;
  background: var(--ink-softer);
}
.row-index {
  position: absolute;
  left: 0.5rem;
  top: 1.25rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.18em;
  color: var(--accent);
  writing-mode: vertical-rl;
  transform: rotate(180deg);
}
.row-line-summary {
  margin-top: 0.75rem;
  display: flex;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--text-dim);
  border-top: 1px dashed var(--line);
  padding-top: 0.75rem;
}
.quote-total {
  border-radius: var(--r-md);
  border: 1px dashed var(--accent);
  background: rgba(255,122,26,0.05);
  padding: 1rem 1.25rem;
}
.remove-btn {
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
  width: 2rem; height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  background: var(--ink-soft);
  color: var(--textc-dim);
  transition: color 0.2s, border-color 0.2s;
}
.remove-btn:hover { color: var(--err); border-color: var(--err); }
.form-success {
  border: 1px solid var(--accent);
  background: linear-gradient(180deg, rgba(255,122,26,0.08), transparent);
  border-radius: var(--r-md);
  padding: 2rem;
  text-align: center;
}
</style>
