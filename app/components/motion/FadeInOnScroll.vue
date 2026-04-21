<script setup lang="ts">
/**
 * Reveals its content with a fade + translate on scroll into view.
 * Uses IntersectionObserver (no GSAP dependency needed for something this small).
 */
const props = withDefaults(defineProps<{
  delay?: number       // ms
  y?: number           // initial translateY in px
  duration?: number    // ms
  once?: boolean
  threshold?: number
  as?: string
}>(), {
  delay: 0,
  y: 24,
  duration: 720,
  once: true,
  threshold: 0.15,
  as: 'div',
})

const root = ref<HTMLElement | null>(null)
const visible = ref(false)
const reduced = useMkpeReducedMotion()

onMounted(() => {
  if (reduced.value) {
    visible.value = true
    return
  }
  if (!root.value || typeof IntersectionObserver === 'undefined') {
    visible.value = true
    return
  }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        visible.value = true
        if (props.once) io.disconnect()
      } else if (!props.once) {
        visible.value = false
      }
    }
  }, { threshold: props.threshold })
  io.observe(root.value)
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <component
    :is="as"
    ref="root"
    class="fade-in"
    :class="{ 'is-visible': visible }"
    :style="{
      '--fade-y': `${y}px`,
      '--fade-duration': `${duration}ms`,
      '--fade-delay': `${delay}ms`,
    }"
  >
    <slot />
  </component>
</template>

<style scoped>
.fade-in {
  opacity: 0;
  transform: translateY(var(--fade-y, 24px));
  transition:
    opacity var(--fade-duration, 720ms) var(--ease-out) var(--fade-delay, 0ms),
    transform var(--fade-duration, 720ms) var(--ease-out) var(--fade-delay, 0ms);
  will-change: opacity, transform;
}
.fade-in.is-visible {
  opacity: 1;
  transform: translateY(0);
}
</style>
