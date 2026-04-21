<script setup lang="ts">
const props = defineProps<{
  product: Record<string, any>
}>()

const localePath = useLocalePath()
const { t, locale } = useI18n()
const { calcSheetPrice, formatEur } = usePricing()

const tintVisual = computed(() => useTintContrast(props.product.accentHex as string | undefined))

// Lowest variant price for "vanaf" display
const fromPrice = computed(() => {
  const variants = (props.product.variants ?? []) as any[]
  if (!variants.length || !props.product.pricePerKg) return null
  const prices = variants.map(v => calcSheetPrice(props.product as any, v))
  return Math.min(...prices)
})
</script>

<template>
  <article class="product-card group">
    <NuxtLink :to="localePath(`/producten/${product.slug}`)" class="block h-full">
      <div
        class="product-visual"
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
            {{ product.thickness }} mm
          </div>
        </div>
        <div v-if="product.pricePerKg" class="product-kg">
          {{ formatEur(product.pricePerKg, locale as 'nl' | 'en') }}/kg
        </div>
      </div>
      <div class="p-5">
        <h3 class="font-display text-lg font-bold tracking-tight">{{ product.title }}</h3>
        <dl class="mt-4 grid grid-cols-2 gap-y-2 text-sm">
          <dt class="text-textc-muted font-mono text-xs uppercase tracking-wider">{{ t('forms.color') }}</dt>
          <dd class="text-textc">
            {{ product.color }}<span v-if="product.colorRal" class="text-textc-muted"> · {{ product.colorRal }}</span>
          </dd>
          <dt class="text-textc-muted font-mono text-xs uppercase tracking-wider">{{ t('forms.form') }}</dt>
          <dd class="text-textc capitalize">{{ product.form }}</dd>
        </dl>
        <div class="mt-5 flex items-end justify-between">
          <div v-if="fromPrice !== null">
            <div class="font-mono text-[0.65rem] uppercase tracking-wider text-textc-muted">
              {{ t('products.fromPrice') }}
            </div>
            <div class="font-display text-xl font-bold text-accent">
              {{ formatEur(fromPrice, locale as 'nl' | 'en') }}
            </div>
            <div class="text-[0.65rem] text-textc-muted">{{ t('products.exclVat') }} · {{ t('cart.perSheet') }}</div>
          </div>
          <span v-else class="text-sm text-textc-dim">{{ t('products.price') }}</span>
          <Icon
            name="lucide:arrow-right"
            class="h-5 w-5 text-accent transition-transform group-hover:translate-x-1"
          />
        </div>
      </div>
    </NuxtLink>
  </article>
</template>

<style scoped>
.product-card {
  position: relative;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  overflow: hidden;
  background: var(--ink-soft);
  transition: border-color 250ms var(--ease-out), transform 250ms var(--ease-out);
}
.product-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
}
.product-visual {
  position: relative;
  aspect-ratio: 4 / 3;
  background: var(--tint-bg, var(--tint));
  overflow: hidden;
}
.product-sheet {
  position: absolute;
  inset: 18% 14% 14% 18%;
  background: var(--tint);
  filter: brightness(0.95);
  border-radius: 2px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(0,0,0,0.06);
  transform: rotate(-4deg);
  transition: transform 400ms var(--ease-out);
}
.product-visual.is-dark-tint .product-sheet {
  filter: brightness(1);
  box-shadow: 0 18px 40px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.08);
}
.product-card:hover .product-sheet {
  transform: rotate(-6deg) translate(2px, -2px);
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
  left: 0.75rem;
  bottom: 0.75rem;
  padding: 0.4rem 0.6rem;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(6px);
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(15,23,42,0.08);
}
.product-kg {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.3rem 0.55rem;
  background: var(--paper);
  color: #FDBA74;
  border-radius: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  font-weight: 600;
}
</style>
