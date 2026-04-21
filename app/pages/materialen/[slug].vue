<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const slug = computed(() => String(route.params.slug))

const { data: material } = await useAsyncData(
  `material-${locale.value}-${slug.value}`,
  () => queryContent(`/materialen/${slug.value}`).where({ _locale: locale.value }).findOne(),
)

const { data: related } = await useAsyncData(
  `material-products-${locale.value}-${slug.value}`,
  () => queryContent('/producten')
    .where({ _locale: locale.value, materialSlug: slug.value })
    .sort({ order: 1 })
    .find(),
)

if (!material.value) {
  throw createError({ statusCode: 404, statusMessage: 'Material not found' })
}

useSeoMeta({
  title: () => `${material.value?.title} — ${t('meta.siteName')}`,
  description: () => material.value?.summary,
})
</script>

<template>
  <article v-if="material" class="pt-28 pb-16 lg:pt-36">
    <!-- Hero -->
    <header class="relative overflow-hidden border-b border-line">
      <div class="bg-grid-soft absolute inset-0 opacity-30" aria-hidden="true" />
      <div class="relative mx-auto max-w-container px-6 py-16 lg:px-10 lg:py-24">
        <NuxtLink
          :to="localePath('/materialen')"
          class="inline-flex items-center gap-2 text-sm text-textc-dim hover:text-accent"
        >
          <Icon name="lucide:arrow-left" class="h-4 w-4" />
          {{ t('nav.materials') }}
        </NuxtLink>
        <div class="mt-10 grid gap-10 lg:grid-cols-12 lg:items-end">
          <div class="lg:col-span-8">
            <div class="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-accent">
              — {{ material.code }}
            </div>
            <h1 class="mt-4 font-display text-h1-fluid font-bold leading-[1.02] tracking-tight text-balance">
              {{ material.title }}
            </h1>
            <p class="mt-6 max-w-2xl text-lead text-textc-dim text-pretty">{{ material.summary }}</p>
          </div>
          <div class="lg:col-span-4">
            <div
              class="aspect-square rounded-md border border-line"
              :style="{ background: material.accentHex }"
            />
          </div>
        </div>
      </div>
    </header>

    <!-- Specs strip -->
    <section class="border-b border-line bg-ink-soft">
      <div class="mx-auto grid max-w-container grid-cols-2 divide-x divide-line sm:grid-cols-4 px-0 lg:px-0">
        <div class="px-6 py-6">
          <div class="label-eyebrow">Dichtheid</div>
          <div class="mt-2 font-display text-2xl font-bold">{{ material.density }} g/cm³</div>
        </div>
        <div class="px-6 py-6">
          <div class="label-eyebrow">Temperatuur</div>
          <div class="mt-2 font-display text-2xl font-bold">{{ material.tempRange }}</div>
        </div>
        <div class="px-6 py-6 col-span-2 sm:col-span-2 flex items-center">
          <NuxtLink :to="localePath(`/producten?material=${material.code}`)" class="btn btn-primary">
            {{ t('materials.browseProducts', { name: material.code }) }}
            <Icon name="lucide:arrow-right" class="h-4 w-4" />
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Body -->
    <section class="mx-auto max-w-container px-6 py-16 lg:px-10 lg:py-24">
      <div class="grid gap-12 lg:grid-cols-12">
        <aside class="lg:col-span-4 space-y-8">
          <div>
            <h3 class="label-eyebrow">{{ t('materials.properties') }}</h3>
            <ul class="mt-4 space-y-2">
              <li
                v-for="p in material.properties"
                :key="p"
                class="flex gap-3 text-textc-dim"
              >
                <Icon name="lucide:check" class="h-5 w-5 text-accent shrink-0" />
                <span>{{ p }}</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="label-eyebrow">{{ t('materials.applications') }}</h3>
            <div class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="a in material.applications"
                :key="a"
                class="rounded-sm border border-line px-2 py-1 font-mono text-[0.7rem] uppercase tracking-wider text-textc-dim"
              >
                {{ a }}
              </span>
            </div>
          </div>
        </aside>
        <div class="lg:col-span-8 prose prose-invert max-w-none">
          <ContentRenderer :value="material" />
        </div>
      </div>
    </section>

    <!-- Related products -->
    <section v-if="(related ?? []).length" class="mx-auto max-w-container px-6 pb-16 lg:px-10 lg:pb-24">
      <h2 class="mb-8 font-display text-h2-fluid font-bold tracking-tight">
        {{ t('materials.browseProducts', { name: material.code }) }}
      </h2>
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ProductCard v-for="p in related" :key="p._path" :product="p" />
      </div>
    </section>
  </article>
</template>

<style>
.prose-invert {
  color: var(--text-dim);
  line-height: 1.75;
}
.prose-invert h2 {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--text);
  font-size: 1.75rem;
  letter-spacing: -0.02em;
  margin-top: 2rem;
  margin-bottom: 1rem;
}
.prose-invert h3 {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  color: var(--text);
  font-size: 1.25rem;
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
.prose-invert ul {
  list-style: none;
  padding: 0;
}
.prose-invert ul li {
  position: relative;
  padding-left: 1.25rem;
  margin-bottom: 0.25rem;
}
.prose-invert ul li::before {
  content: '—';
  color: var(--accent);
  position: absolute;
  left: 0;
}
.prose-invert strong { color: var(--text); }
.prose-invert p { margin-bottom: 1rem; }
</style>
