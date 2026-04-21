<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: product } = await useAsyncData(
  `product-${locale.value}-${slug.value}`,
  () => queryContent(`/producten/${slug.value}`).where({ _locale: locale.value }).findOne(),
)
if (!product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product not found' })
}

const { calcWeightKg, calcSheetPrice, formatEur, formatWeight } = usePricing()
const cart = useCart()

const tintVisual = computed(() => useTintContrast(product.value?.accentHex as string | undefined))

const variants = computed(() => (product.value?.variants ?? []) as any[])
const selectedIdx = ref(0)
const quantity = ref(1)
const justAdded = ref(false)
const showQuoteForm = ref(false)

const selected = computed(() => variants.value[selectedIdx.value])

const weight = computed(() =>
  selected.value
    ? calcWeightKg(selected.value.widthMm, selected.value.heightMm, product.value!.thickness, product.value!.density)
    : 0,
)
const sheetPrice = computed(() => weight.value * (product.value?.pricePerKg ?? 0))
const lineTotal = computed(() => sheetPrice.value * quantity.value)

function addToCart() {
  if (!product.value || !selected.value) return
  cart.addItem({
    productSlug: product.value.slug,
    title: product.value.title,
    material: product.value.material,
    thickness: product.value.thickness,
    color: product.value.color,
    colorRal: product.value.colorRal,
    variantSize: selected.value.size,
    widthMm: selected.value.widthMm,
    heightMm: selected.value.heightMm,
    weightKg: weight.value,
    pricePerKg: product.value.pricePerKg,
    pricePerSheet: sheetPrice.value,
    accentHex: product.value.accentHex,
  }, quantity.value)
  justAdded.value = true
  setTimeout(() => (justAdded.value = false), 2000)
}

useSeoMeta({
  title: () => `${product.value?.title} — ${t('meta.siteName')}`,
  description: () => `${product.value?.material} ${product.value?.form} ${product.value?.thickness}mm ${product.value?.color} — ${formatEur(product.value?.pricePerKg ?? 0, locale.value as 'nl' | 'en')}/kg`,
})
</script>

<template>
  <article v-if="product" class="pt-28 pb-16 lg:pt-36">
    <div class="mx-auto max-w-container px-6 lg:px-10">
      <NuxtLink
        :to="localePath('/producten')"
        class="inline-flex items-center gap-2 text-sm text-textc-dim hover:text-accent"
      >
        <Icon name="lucide:arrow-left" class="h-4 w-4" />
        {{ t('nav.products') }}
      </NuxtLink>

      <div class="mt-10 grid gap-12 lg:grid-cols-12">
        <!-- Visual -->
        <div class="lg:col-span-5">
          <div
            class="product-hero"
            :class="{ 'is-dark-tint': tintVisual.isDark }"
            :style="{
              '--tint': tintVisual.sheet,
              '--tint-bg': tintVisual.bg,
            }"
          >
            <div class="product-sheet" />
            <div class="product-tag">
              <div class="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-paper/70">
                — {{ product.material }}
              </div>
              <div class="mt-1 font-display text-xl font-bold text-paper">
                {{ product.thickness }} mm · {{ product.color }}{{ product.colorRal ? ` · ${product.colorRal}` : '' }}
              </div>
            </div>
          </div>
        </div>

        <!-- Info & actions -->
        <div class="lg:col-span-7">
          <div class="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent">
            — {{ product.material }} · {{ product.form }}
          </div>
          <h1 class="mt-4 font-display text-h1-fluid font-bold leading-[1.05] tracking-tight text-balance">
            {{ product.title }}
          </h1>

          <!-- Price block -->
          <div class="price-block mt-8">
            <div class="flex items-baseline justify-between gap-4">
              <div>
                <div class="label-eyebrow">{{ t('products.pricePerKgLabel') }}</div>
                <div class="mt-1 font-display text-2xl font-bold">
                  {{ formatEur(product.pricePerKg, locale as 'nl' | 'en') }}/kg
                </div>
                <div class="mt-0.5 text-xs text-textc-muted">{{ t('products.exclVat') }}</div>
              </div>
              <div class="text-right">
                <div class="label-eyebrow">{{ t('products.pricePerSheetLabel') }}</div>
                <div class="mt-1 font-display text-3xl font-bold text-accent">
                  {{ formatEur(sheetPrice, locale as 'nl' | 'en') }}
                </div>
                <div class="mt-0.5 text-xs text-textc-muted">
                  {{ formatWeight(weight, locale as 'nl' | 'en') }} · {{ t('products.exclVat') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Variant selector -->
          <div class="mt-8">
            <div class="label-eyebrow mb-3">{{ t('products.selectSize') }}</div>
            <div class="grid gap-3 sm:grid-cols-2">
              <button
                v-for="(v, i) in variants"
                :key="v.size"
                type="button"
                :class="['variant-btn', { 'is-active': i === selectedIdx }]"
                @click="selectedIdx = i"
              >
                <div class="flex items-center justify-between">
                  <div class="font-display text-lg font-bold">{{ v.size }}</div>
                  <Icon
                    :name="i === selectedIdx ? 'lucide:circle-dot' : 'lucide:circle'"
                    class="h-5 w-5"
                  />
                </div>
                <div class="mt-1 font-mono text-xs uppercase tracking-wider text-textc-muted">
                  {{ formatWeight(calcWeightKg(v.widthMm, v.heightMm, product.thickness, product.density), locale as 'nl' | 'en') }}
                  · {{ formatEur(calcSheetPrice(product as any, v), locale as 'nl' | 'en') }}
                </div>
                <div v-if="v.stock != null" class="mt-1 text-xs text-textc-dim">
                  {{ v.stock }} {{ t('products.inStock') }}
                </div>
              </button>
            </div>
          </div>

          <!-- Quantity + actions -->
          <div class="mt-8 space-y-4">
            <div class="flex items-end gap-4">
              <label class="block">
                <span class="field-label">{{ t('forms.quantity') }}</span>
                <div class="qty-control">
                  <button type="button" class="qty-btn" @click="quantity = Math.max(1, quantity - 1)">
                    <Icon name="lucide:minus" class="h-4 w-4" />
                  </button>
                  <input
                    v-model.number="quantity"
                    type="number"
                    min="1"
                    class="qty-input"
                  >
                  <button type="button" class="qty-btn" @click="quantity = quantity + 1">
                    <Icon name="lucide:plus" class="h-4 w-4" />
                  </button>
                </div>
              </label>
              <div class="grow text-right">
                <div class="label-eyebrow">{{ t('cart.lineTotal') }}</div>
                <div class="mt-1 font-display text-2xl font-bold">
                  {{ formatEur(lineTotal, locale as 'nl' | 'en') }}
                </div>
              </div>
            </div>

            <div class="flex flex-wrap gap-3">
              <button
                type="button"
                class="btn btn-primary"
                :disabled="justAdded"
                @click="addToCart"
              >
                <Icon :name="justAdded ? 'lucide:check' : 'lucide:shopping-cart'" class="h-4 w-4" />
                {{ justAdded ? t('cart.added') : t('cart.addToCart') }}
              </button>
              <button
                type="button"
                class="btn btn-ghost"
                @click="showQuoteForm = !showQuoteForm"
              >
                <Icon name="lucide:file-text" class="h-4 w-4" />
                {{ t('products.requestQuoteForThis') }}
              </button>
            </div>
          </div>

          <!-- Specs -->
          <div class="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 border-t border-line pt-6">
            <div>
              <div class="label-eyebrow">{{ t('forms.thickness') }}</div>
              <div class="mt-2 font-display text-xl font-bold">{{ product.thickness }} mm</div>
            </div>
            <div>
              <div class="label-eyebrow">{{ t('forms.color') }}</div>
              <div class="mt-2 font-display text-xl font-bold capitalize">{{ product.color }}</div>
              <div v-if="product.colorRal" class="mt-0.5 font-mono text-[0.7rem] uppercase tracking-wider text-textc-muted">
                {{ product.colorRal }}
              </div>
            </div>
            <div>
              <div class="label-eyebrow">Dichtheid</div>
              <div class="mt-2 font-display text-xl font-bold">{{ product.density }}</div>
            </div>
          </div>

          <div v-if="product.applications?.length" class="mt-6">
            <div class="label-eyebrow">{{ t('materials.applications') }}</div>
            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="a in product.applications"
                :key="a"
                class="rounded-sm bg-ink-soft border border-line px-3 py-1.5 text-sm text-textc-dim"
              >
                {{ a }}
              </span>
            </div>
          </div>

          <div class="mt-8 prose prose-invert max-w-none">
            <ContentRenderer :value="product" />
          </div>
        </div>
      </div>

      <!-- Quote form (collapsible) -->
      <section v-if="showQuoteForm" class="mt-16">
        <div class="mb-6 flex items-baseline justify-between">
          <h2 class="font-display text-h2-fluid font-bold tracking-tight">
            {{ t('products.requestQuoteForThis') }}
          </h2>
          <button
            type="button"
            class="text-sm text-textc-dim hover:text-accent"
            @click="showQuoteForm = false"
          >
            {{ t('nav.close') }}
          </button>
        </div>
        <ProductQuoteForm
          :product-slug="product.slug"
          :product-title="product.title"
          :variant-size="selected?.size"
          :quantity="quantity"
        />
      </section>
    </div>
  </article>
</template>

<style scoped>
.product-hero {
  position: relative;
  aspect-ratio: 1 / 1;
  background: var(--tint-bg, var(--tint));
  border-radius: var(--r-lg);
  overflow: hidden;
  border: 1px solid var(--line);
}
.product-sheet {
  position: absolute;
  inset: 15%;
  background: var(--tint);
  filter: brightness(0.95);
  border-radius: 4px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(0,0,0,0.05);
  transform: rotate(-3deg);
}
.product-hero.is-dark-tint .product-sheet {
  filter: brightness(1);
  box-shadow: 0 30px 60px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.08);
}
.product-sheet::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.25) 0%,
    rgba(255,255,255,0) 45%,
    rgba(0,0,0,0.06) 100%
  );
  pointer-events: none;
}
.product-tag {
  position: absolute;
  left: 1rem;
  bottom: 1rem;
  padding: 0.6rem 0.9rem;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(6px);
  border-radius: var(--r-sm);
}

.price-block {
  border: 1px solid var(--line);
  background: linear-gradient(180deg, var(--ink-soft), transparent);
  border-radius: var(--r-md);
  padding: 1.25rem 1.5rem;
}

.variant-btn {
  text-align: left;
  padding: 1rem 1.25rem;
  border-radius: var(--r-md);
  border: 1px solid var(--line);
  background: var(--ink-soft);
  color: var(--text);
  cursor: pointer;
  transition: border-color 180ms var(--ease-out), background 180ms var(--ease-out);
}
.variant-btn:hover { border-color: var(--line-strong); }
.variant-btn.is-active {
  border-color: var(--accent);
  background: linear-gradient(180deg, rgba(255,122,26,0.08), transparent);
}

.qty-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--ink-soft);
  overflow: hidden;
}
.qty-btn {
  width: 2.5rem; height: 2.75rem;
  display: inline-flex; align-items: center; justify-content: center;
  color: var(--text-dim);
}
.qty-btn:hover { color: var(--accent); }
.qty-input {
  width: 3.5rem;
  height: 2.75rem;
  text-align: center;
  background: transparent;
  color: var(--text);
  border: none;
  font-weight: 700;
  font-size: 1rem;
}
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none; margin: 0;
}
.qty-input { -moz-appearance: textfield; }
</style>
