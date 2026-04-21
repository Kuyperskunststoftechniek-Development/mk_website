<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const cart = useCart()
const { formatEur, formatWeight } = usePricing()

useSeoMeta({
  title: () => `${t('cart.title')} — ${t('meta.siteName')}`,
})
</script>

<template>
  <div class="pt-28 pb-16 lg:pt-40">
    <div class="mx-auto max-w-container px-6 lg:px-10">
      <header class="mb-12 max-w-3xl">
        <div class="label-eyebrow">— {{ t('meta.siteName') }}</div>
        <h1 class="mt-6 font-display text-h1-fluid font-bold leading-tight tracking-tight">
          {{ t('cart.title') }}
        </h1>
      </header>

      <div v-if="cart.isEmpty.value" class="rounded-md border border-line bg-ink-soft p-16 text-center">
        <Icon name="lucide:shopping-cart" class="h-12 w-12 text-textc-muted mx-auto" />
        <p class="mt-6 text-lead text-textc-dim">{{ t('cart.empty') }}</p>
        <NuxtLink :to="localePath('/producten')" class="btn btn-primary mt-8">
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
          {{ t('cart.emptyAction') }}
        </NuxtLink>
      </div>

      <div v-else class="grid gap-10 lg:grid-cols-12">
        <!-- Items -->
        <section class="lg:col-span-8 space-y-4">
          <div
            v-for="item in cart.items.value"
            :key="`${item.productSlug}-${item.variantSize}`"
            class="cart-line"
          >
            <div
              class="cart-line-visual"
              :style="{
                background: useTintContrast(item.accentHex).bg,
                '--tint': useTintContrast(item.accentHex).sheet,
              }"
            >
              <div class="cart-line-sheet" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline justify-between gap-4">
                <NuxtLink
                  :to="localePath(`/producten/${item.productSlug}`)"
                  class="font-display text-lg font-bold tracking-tight hover:text-accent"
                >
                  {{ item.title }}
                </NuxtLink>
                <button
                  type="button"
                  class="text-sm text-textc-dim hover:text-[color:var(--err)] inline-flex items-center gap-1"
                  @click="cart.removeItem(item.productSlug, item.variantSize)"
                >
                  <Icon name="lucide:trash-2" class="h-4 w-4" />
                  {{ t('cart.remove') }}
                </button>
              </div>
              <div class="mt-1 font-mono text-xs uppercase tracking-wider text-textc-muted">
                {{ item.variantSize }} · {{ formatWeight(item.weightKg, locale as 'nl' | 'en') }}<span v-if="item.colorRal"> · {{ item.colorRal }}</span>
              </div>
              <div class="mt-4 flex flex-wrap items-center gap-6">
                <div class="qty-control">
                  <button type="button" class="qty-btn" @click="cart.updateQuantity(item.productSlug, item.variantSize, item.quantity - 1)">
                    <Icon name="lucide:minus" class="h-4 w-4" />
                  </button>
                  <span class="qty-value">{{ item.quantity }}</span>
                  <button type="button" class="qty-btn" @click="cart.updateQuantity(item.productSlug, item.variantSize, item.quantity + 1)">
                    <Icon name="lucide:plus" class="h-4 w-4" />
                  </button>
                </div>
                <div class="text-sm text-textc-dim">
                  {{ formatEur(item.pricePerSheet, locale as 'nl' | 'en') }} {{ t('cart.perSheet') }}
                </div>
                <div class="ml-auto font-display text-xl font-bold">
                  {{ formatEur(item.pricePerSheet * item.quantity, locale as 'nl' | 'en') }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Summary -->
        <aside class="lg:col-span-4">
          <div class="cart-summary">
            <h2 class="font-display text-xl font-bold mb-4">{{ t('cart.subtotal') }}</h2>
            <dl class="space-y-2">
              <div class="flex justify-between">
                <dt class="text-textc-dim">{{ t('cart.totalWeight') }}</dt>
                <dd>{{ formatWeight(cart.totalWeight.value, locale as 'nl' | 'en') }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-textc-dim">{{ t('cart.subtotal') }} ({{ t('products.exclVat') }})</dt>
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
            <NuxtLink :to="localePath('/afrekenen')" class="btn btn-primary w-full justify-center mt-6">
              <Icon name="lucide:credit-card" class="h-4 w-4" />
              {{ t('cart.checkout') }}
            </NuxtLink>
            <NuxtLink :to="localePath('/producten')" class="btn btn-ghost w-full justify-center mt-2">
              {{ t('cart.continueShopping') }}
            </NuxtLink>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-line {
  display: flex;
  gap: 1.25rem;
  padding: 1.25rem;
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  background: var(--ink-soft);
}
.cart-line-visual {
  position: relative;
  width: 6rem; height: 6rem;
  border-radius: var(--r-sm);
  overflow: hidden;
  flex-shrink: 0;
}
.cart-line-sheet {
  position: absolute;
  inset: 15%;
  background: var(--tint);
  filter: brightness(0.95);
  border-radius: 2px;
  transform: rotate(-4deg);
  box-shadow: 0 6px 14px rgba(0,0,0,0.3);
}

.qty-control {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  overflow: hidden;
  background: var(--ink-softer);
}
.qty-btn {
  width: 2rem; height: 2.25rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-dim);
}
.qty-btn:hover { color: var(--accent); }
.qty-value {
  min-width: 2.5rem;
  text-align: center;
  font-weight: 700;
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
