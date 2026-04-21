<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-24 border-t border-line bg-ink-soft">
    <div class="mx-auto max-w-container px-6 py-16 lg:px-10">
      <div class="grid gap-12 lg:grid-cols-12">
        <div class="lg:col-span-5 space-y-4">
          <NuxtLink :to="localePath('/')" class="inline-flex items-baseline gap-2">
            <span class="font-display text-2xl font-bold tracking-tight">M&amp;K</span>
            <span class="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-textc-dim">
              Kunststoffen
            </span>
          </NuxtLink>
          <p class="max-w-sm text-textc-dim leading-relaxed">
            {{ t('footer.tagline') }}
          </p>
          <div class="pt-4 font-mono text-xs uppercase tracking-[0.2em] text-textc-muted">
            — B2B · HDPE · PP · NL/EN
          </div>
        </div>

        <div class="lg:col-span-3">
          <h4 class="label-eyebrow mb-4">{{ t('footer.explore') }}</h4>
          <ul class="space-y-2">
            <li><NuxtLink :to="localePath('/materialen')" class="text-textc-dim hover:text-accent">{{ t('nav.materials') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/producten')" class="text-textc-dim hover:text-accent">{{ t('nav.products') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/offerte')" class="text-textc-dim hover:text-accent">{{ t('nav.quote') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/over-ons')" class="text-textc-dim hover:text-accent">{{ t('nav.about') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/contact')" class="text-textc-dim hover:text-accent">{{ t('nav.contact') }}</NuxtLink></li>
          </ul>
        </div>

        <div class="lg:col-span-4">
          <h4 class="label-eyebrow mb-4">{{ t('footer.reachUs') }}</h4>
          <address class="not-italic space-y-1 text-textc-dim">
            <div>M&amp;K Kunststoffen B.V.</div>
            <div>{{ t('footer.placeholderAddress') }}</div>
            <div class="pt-2">
              <a href="mailto:info@mkkunststoffen.example" class="hover:text-accent">info@mkkunststoffen.example</a>
            </div>
            <div>
              <a href="tel:+31000000000" class="hover:text-accent">+31 (0)00 000 00 00</a>
            </div>
          </address>
        </div>
      </div>

      <div class="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-xs text-textc-muted">
        <div>© {{ year }} M&amp;K Kunststoffen. {{ t('footer.rights') }}</div>
        <div class="flex gap-6">
          <NuxtLink :to="localePath('/privacybeleid')" class="hover:text-accent">{{ t('footer.privacy') }}</NuxtLink>
          <NuxtLink :to="localePath('/algemene-voorwaarden')" class="hover:text-accent">{{ t('footer.terms') }}</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
