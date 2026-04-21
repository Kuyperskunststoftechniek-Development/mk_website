<script setup lang="ts">
/**
 * Button/link wrapper that tracks the cursor and gently follows it.
 * Useful on primary CTAs for that "premium" feel.
 */
const props = withDefaults(defineProps<{
  strength?: number      // px of travel at max distance
  radius?: number        // activation radius in px
  as?: 'button' | 'a' | 'NuxtLink'
  href?: string
  to?: string | object
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}>(), {
  strength: 14,
  radius: 120,
  as: 'button',
  type: 'button',
})

const root = ref<any>(null)
const reduced = useMkpeReducedMotion()

function getEl(): HTMLElement | null {
  const r = root.value as any
  if (!r) return null
  return (r as HTMLElement).getBoundingClientRect ? (r as HTMLElement) : (r.$el as HTMLElement | null)
}

let rafId = 0
let targetX = 0
let targetY = 0
let currentX = 0
let currentY = 0

function onPointerMove(e: PointerEvent) {
  const el = getEl()
  if (!el || reduced.value) return
  const rect = el.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2
  const dx = e.clientX - cx
  const dy = e.clientY - cy
  const dist = Math.hypot(dx, dy)
  if (dist > props.radius) {
    targetX = 0; targetY = 0
  } else {
    const f = 1 - dist / props.radius
    targetX = (dx / props.radius) * props.strength * f * 2
    targetY = (dy / props.radius) * props.strength * f * 2
  }
  if (!rafId) tick()
}

function onPointerLeave() {
  targetX = 0
  targetY = 0
  if (!rafId) tick()
}

function tick() {
  currentX += (targetX - currentX) * 0.18
  currentY += (targetY - currentY) * 0.18
  const el = getEl()
  if (el) {
    el.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`
  }
  if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
    rafId = requestAnimationFrame(tick)
  } else {
    rafId = 0
  }
}

onMounted(() => {
  if (reduced.value) return
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerleave', onPointerLeave, { passive: true })
})
onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerleave', onPointerLeave)
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <NuxtLink
    v-if="as === 'NuxtLink'"
    ref="root"
    :to="to as string"
    :class="['magnetic inline-flex', $attrs.class]"
  >
    <slot />
  </NuxtLink>
  <a
    v-else-if="as === 'a'"
    ref="root"
    :href="href"
    :class="['magnetic inline-flex', $attrs.class]"
  >
    <slot />
  </a>
  <button
    v-else
    ref="root"
    :type="type"
    :disabled="disabled"
    :class="['magnetic inline-flex', $attrs.class]"
  >
    <slot />
  </button>
</template>

<style scoped>
.magnetic {
  will-change: transform;
  transition: transform 0.2s var(--ease-out);
}
</style>
