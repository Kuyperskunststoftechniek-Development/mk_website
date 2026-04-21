<script setup lang="ts">
const { t } = useI18n()

useSeoMeta({
  title: () => `${t('contact.pageTitle')} — ${t('meta.siteName')}`,
  description: () => t('contact.pageLead'),
})
</script>

<template>
  <div class="pt-28 pb-16 lg:pt-40">
    <div class="mx-auto max-w-container px-6 lg:px-10">
      <header class="mb-12 max-w-3xl">
        <div class="label-eyebrow">— {{ t('meta.siteName') }}</div>
        <h1 class="mt-6 font-display text-h1-fluid font-bold leading-tight tracking-tight">
          {{ t('contact.pageTitle') }}
        </h1>
        <p class="mt-6 text-lead text-textc-dim text-pretty">{{ t('contact.pageLead') }}</p>
      </header>

      <div class="grid gap-10 lg:grid-cols-12">
        <aside class="lg:col-span-4 space-y-8">
          <div>
            <h3 class="label-eyebrow">{{ t('contact.visitTitle') }}</h3>
            <address class="mt-4 not-italic space-y-1 text-textc-dim leading-relaxed">
              <div class="text-textc font-medium">M&amp;K Kunststoffen B.V.</div>
              <div>{{ t('footer.placeholderAddress') }}</div>
              <div>KvK: —</div>
            </address>
          </div>
          <div>
            <h3 class="label-eyebrow">{{ t('contact.callTitle') }}</h3>
            <div class="mt-4 space-y-1 text-textc-dim">
              <div>
                <a href="mailto:info@mkkunststoffen.example" class="hover:text-accent">info@mkkunststoffen.example</a>
              </div>
              <div>
                <a href="tel:+31000000000" class="hover:text-accent">+31 (0)00 000 00 00</a>
              </div>
            </div>
          </div>
        </aside>
        <div class="lg:col-span-8">
          <ProductContactForm />
        </div>
      </div>
    </div>
  </div>
</template>
