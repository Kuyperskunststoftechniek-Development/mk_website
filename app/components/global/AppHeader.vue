<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
const cart = useCart()

const scrolled = ref(false)
const mobileOpen = ref(false)
const cartOpen = ref(false)

function onScroll() {
  scrolled.value = window.scrollY > 12
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const nav = computed(() => [
  { label: t('nav.materials'), to: localePath('/materialen') },
  { label: t('nav.products'), to: localePath('/producten') },
  { label: t('nav.quote'), to: localePath('/offerte') },
  { label: t('nav.about'), to: localePath('/over-ons') },
  { label: t('nav.contact'), to: localePath('/contact') },
])

// Close mobile on route change
const route = useRoute()
watch(() => route.fullPath, () => { mobileOpen.value = false })
</script>

<template>
  <header
    :class="[
      'fixed inset-x-0 top-0 z-50 transition-colors duration-300',
      scrolled || mobileOpen ? 'bg-ink/90 backdrop-blur-md border-b border-line' : 'bg-transparent',
    ]"
  >
    <div class="mx-auto flex max-w-container items-center justify-between px-6 py-4 lg:px-10">
      <NuxtLink :to="localePath('/')" class="flex items-baseline gap-2 group">
        <span class="font-display text-xl font-bold tracking-tight">M&amp;K</span>
        <span class="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-textc-dim group-hover:text-accent transition-colors">
          Kunststoffen
        </span>
      </NuxtLink>

      <nav class="hidden lg:flex items-center gap-1">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="relative px-4 py-2 text-sm font-medium text-textc-dim hover:text-textc transition-colors"
          active-class="text-textc"
        >
          <span>{{ item.label }}</span>
          <span class="nav-tick" />
        </NuxtLink>
      </nav>

      <div class="hidden lg:flex items-center gap-3">
        <LangSwitch />
        <button
          type="button"
          class="cart-btn"
          :aria-label="t('nav.cart')"
          @click="cartOpen = true"
        >
          <Icon name="lucide:shopping-cart" class="h-5 w-5" />
          <span
            v-if="cart.totalCount.value > 0"
            class="cart-badge"
          >
            {{ cart.totalCount.value }}
          </span>
        </button>
        <MotionMagneticButton as="NuxtLink" :to="localePath('/offerte')" class="btn btn-primary">
          {{ t('cta.requestQuote') }}
          <Icon name="lucide:arrow-right" class="h-4 w-4" />
        </MotionMagneticButton>
      </div>

      <div class="flex items-center gap-2 lg:hidden">
        <button
          type="button"
          class="cart-btn"
          :aria-label="t('nav.cart')"
          @click="cartOpen = true"
        >
          <Icon name="lucide:shopping-cart" class="h-5 w-5" />
          <span v-if="cart.totalCount.value > 0" class="cart-badge">
            {{ cart.totalCount.value }}
          </span>
        </button>
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line-strong text-textc"
          :aria-expanded="mobileOpen"
          :aria-label="mobileOpen ? t('nav.close') : t('nav.open')"
          @click="mobileOpen = !mobileOpen"
        >
          <Icon :name="mobileOpen ? 'lucide:x' : 'lucide:menu'" class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Cart drawer -->
    <CartDrawer :open="cartOpen" @close="cartOpen = false" />

    <!-- Mobile panel -->
    <Transition name="mobile">
      <div v-if="mobileOpen" class="lg:hidden border-t border-line bg-ink">
        <div class="mx-auto max-w-container px-6 py-6 lg:px-10">
          <nav class="flex flex-col gap-1">
            <NuxtLink
              v-for="item in nav"
              :key="item.to"
              :to="item.to"
              class="rounded-md px-3 py-3 text-base font-medium text-textc-dim hover:text-textc hover:bg-ink-soft"
              active-class="text-textc bg-ink-soft"
            >
              {{ item.label }}
            </NuxtLink>
            <div class="mt-4 flex items-center justify-between gap-3">
              <LangSwitch />
              <NuxtLink :to="localePath('/offerte')" class="btn btn-primary">
                {{ t('cta.requestQuote') }}
              </NuxtLink>
            </div>
          </nav>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.nav-tick {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 0.35rem;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform var(--dur-med) var(--ease-out);
}

.cart-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem; height: 2.5rem;
  border: 1px solid var(--line-strong);
  border-radius: var(--r-md);
  color: var(--text);
  transition: border-color 180ms var(--ease-out), color 180ms var(--ease-out);
}
.cart-btn:hover { border-color: var(--accent); color: var(--accent); }
.cart-badge {
  position: absolute;
  top: -0.4rem; right: -0.4rem;
  min-width: 1.25rem; height: 1.25rem;
  padding: 0 0.3rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--accent);
  color: var(--ink);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 999px;
}
a:hover .nav-tick,
a.router-link-active .nav-tick { transform: scaleX(1); }

.mobile-enter-active,
.mobile-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.mobile-enter-from,
.mobile-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
