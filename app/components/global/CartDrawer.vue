<script setup lang="ts">
const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const cart = useCart()
const { formatEur, formatWeight } = usePricing()

const route = useRoute()
watch(() => route.fullPath, () => emit('close'))

function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.open) emit('close')
}
onMounted(() => window.addEventListener('keydown', onEsc))
onBeforeUnmount(() => window.removeEventListener('keydown', onEsc))
</script>

<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div
        v-if="open"
        class="cart-backdrop"
        aria-hidden="true"
        @click="emit('close')"
      />
    </Transition>
    <Transition name="drawer">
      <aside
        v-if="open"
        class="cart-drawer"
        role="dialog"
        :aria-label="t('cart.title')"
      >
        <header class="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 class="font-display text-xl font-bold">{{ t('cart.title') }}</h2>
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-line-strong text-textc"
            :aria-label="t('nav.close')"
            @click="emit('close')"
          >
            <Icon name="lucide:x" class="h-5 w-5" />
          </button>
        </header>

        <div v-if="cart.isEmpty.value" class="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <Icon name="lucide:shopping-cart" class="h-10 w-10 text-textc-muted" />
          <p class="text-textc-dim">{{ t('cart.empty') }}</p>
          <NuxtLink :to="localePath('/producten')" class="btn btn-primary">
            <Icon name="lucide:arrow-right" class="h-4 w-4" />
            {{ t('cart.emptyAction') }}
          </NuxtLink>
        </div>

        <div v-else class="flex flex-1 flex-col">
          <!-- Items (scrollable) -->
          <ul class="flex-1 overflow-y-auto divide-y divide-line">
            <li
              v-for="item in cart.items.value"
              :key="`${item.productSlug}-${item.variantSize}`"
              class="flex gap-3 px-6 py-4"
            >
              <div
                class="cart-thumb h-16 w-16 shrink-0 rounded-sm border border-line"
                :style="{
                  background: useTintContrast(item.accentHex).bg,
                  '--tint': useTintContrast(item.accentHex).sheet,
                }"
              >
                <div class="cart-thumb-sheet" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="font-medium text-textc truncate">{{ item.title }}</div>
                <div class="mt-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-textc-muted">
                  {{ item.variantSize }} · {{ formatWeight(item.weightKg, locale as 'nl' | 'en') }}<span v-if="item.colorRal"> · {{ item.colorRal }}</span>
                </div>
                <div class="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    class="cart-qty-btn"
                    :aria-label="`-1`"
                    @click="cart.updateQuantity(item.productSlug, item.variantSize, item.quantity - 1)"
                  >
                    <Icon name="lucide:minus" class="h-3 w-3" />
                  </button>
                  <span class="min-w-[2ch] text-center text-sm font-semibold">{{ item.quantity }}</span>
                  <button
                    type="button"
                    class="cart-qty-btn"
                    :aria-label="`+1`"
                    @click="cart.updateQuantity(item.productSlug, item.variantSize, item.quantity + 1)"
                  >
                    <Icon name="lucide:plus" class="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    class="ml-auto text-xs text-textc-dim hover:text-[color:var(--err)]"
                    :aria-label="t('cart.remove')"
                    @click="cart.removeItem(item.productSlug, item.variantSize)"
                  >
                    <Icon name="lucide:trash-2" class="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div class="shrink-0 text-right">
                <div class="font-display font-bold">
                  {{ formatEur(item.pricePerSheet * item.quantity, locale as 'nl' | 'en') }}
                </div>
                <div class="text-[0.65rem] text-textc-muted">
                  {{ formatEur(item.pricePerSheet, locale as 'nl' | 'en') }} {{ t('cart.perSheet') }}
                </div>
              </div>
            </li>
          </ul>

          <!-- Summary -->
          <footer class="border-t border-line bg-ink-softer px-6 py-5 space-y-2">
            <div class="flex justify-between text-sm text-textc-dim">
              <span>{{ t('cart.subtotal') }} ({{ t('products.exclVat') }})</span>
              <span>{{ formatEur(cart.subtotalExcl.value, locale as 'nl' | 'en') }}</span>
            </div>
            <div class="flex justify-between text-sm text-textc-dim">
              <span>{{ t('cart.btw') }}</span>
              <span>{{ formatEur(cart.btw.value, locale as 'nl' | 'en') }}</span>
            </div>
            <div class="flex justify-between border-t border-line pt-2 font-display text-lg font-bold">
              <span>{{ t('cart.totalIncl') }}</span>
              <span>{{ formatEur(cart.totalIncl.value, locale as 'nl' | 'en') }}</span>
            </div>
            <NuxtLink :to="localePath('/afrekenen')" class="btn btn-primary w-full justify-center mt-3">
              <Icon name="lucide:credit-card" class="h-4 w-4" />
              {{ t('cart.checkout') }}
            </NuxtLink>
            <button
              type="button"
              class="btn btn-ghost w-full justify-center"
              @click="emit('close')"
            >
              {{ t('cart.continueShopping') }}
            </button>
          </footer>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cart-backdrop {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(3px);
  z-index: 90;
}
.cart-drawer {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: min(480px, 100vw);
  background: var(--ink-soft);
  border-left: 1px solid var(--line);
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: -20px 0 60px rgba(0,0,0,0.5);
}
.cart-thumb {
  position: relative;
  overflow: hidden;
}
.cart-thumb-sheet {
  position: absolute;
  inset: 20%;
  background: var(--tint);
  border-radius: 2px;
  transform: rotate(-4deg);
  box-shadow: 0 2px 6px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(0,0,0,0.06);
}

.cart-qty-btn {
  width: 1.5rem; height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--line);
  border-radius: 3px;
  color: var(--text-dim);
}
.cart-qty-btn:hover { color: var(--accent); border-color: var(--accent); }

.backdrop-enter-active,
.backdrop-leave-active { transition: opacity 0.25s ease; }
.backdrop-enter-from,
.backdrop-leave-to { opacity: 0; }

.drawer-enter-active,
.drawer-leave-active { transition: transform 0.3s var(--ease-out); }
.drawer-enter-from,
.drawer-leave-to { transform: translateX(100%); }
</style>
