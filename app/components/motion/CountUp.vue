<script setup lang="ts">
/**
 * Counts from 0 to `value` when scrolled into view.
 */
const props = withDefaults(defineProps<{
  value: number
  duration?: number     // ms
  decimals?: number
  prefix?: string
  suffix?: string
  locale?: string
}>(), {
  duration: 1400,
  decimals: 0,
  prefix: '',
  suffix: '',
  locale: 'nl-NL',
})

const root = ref<HTMLElement | null>(null)
const displayed = ref(0)
const reduced = useMkpeReducedMotion()
let started = false

const formatter = computed(() =>
  new Intl.NumberFormat(props.locale, {
    minimumFractionDigits: props.decimals,
    maximumFractionDigits: props.decimals,
  }),
)

function run() {
  if (started) return
  started = true
  if (reduced.value) {
    displayed.value = props.value
    return
  }
  const start = performance.now()
  const from = 0
  const to = props.value
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / props.duration)
    const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
    displayed.value = from + (to - from) * eased
    if (t < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

onMounted(() => {
  if (!root.value || typeof IntersectionObserver === 'undefined') {
    run(); return
  }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      run()
      io.disconnect()
    }
  }, { threshold: 0.4 })
  io.observe(root.value)
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <span ref="root" class="tabular-nums">
    {{ prefix }}{{ formatter.format(displayed) }}{{ suffix }}
  </span>
</template>
