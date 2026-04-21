<script setup lang="ts">
/**
 * Horizontal marquee. Duplicates its slot content so the loop is seamless.
 */
withDefaults(defineProps<{
  speed?: 'slow' | 'normal'
  reverse?: boolean
  gap?: string
}>(), {
  speed: 'normal',
  reverse: false,
  gap: '3rem',
})
</script>

<template>
  <div class="marquee" :class="{ 'marquee--reverse': reverse }" :style="{ '--gap': gap }">
    <div class="marquee__track" :class="speed === 'slow' ? 'animate-marquee-slow' : 'animate-marquee'">
      <div class="marquee__group">
        <slot />
      </div>
      <div class="marquee__group" aria-hidden="true">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.marquee {
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
}
.marquee__track {
  display: flex;
  width: max-content;
  gap: var(--gap);
  will-change: transform;
}
.marquee__group {
  display: flex;
  align-items: center;
  gap: var(--gap);
  flex-shrink: 0;
  padding-right: var(--gap);
}
.marquee--reverse .marquee__track { animation-direction: reverse; }

@media (prefers-reduced-motion: reduce) {
  .marquee__track { animation: none !important; }
}
</style>
