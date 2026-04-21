<script setup lang="ts">
/**
 * Lightweight line/word splitter with GSAP stagger-in animation.
 * Splits into words (and wraps each in a mask) so lines reveal naturally.
 */
const props = withDefaults(defineProps<{
  text: string
  delay?: number
  stagger?: number
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span'
}>(), {
  delay: 0,
  stagger: 0.05,
  as: 'span',
})

const root = ref<HTMLElement | null>(null)
const reduced = useMkpeReducedMotion()
const words = computed(() => props.text.split(/\s+/))

onMounted(async () => {
  if (!root.value) return
  if (reduced.value) return
  const { gsap } = useMkpeMotion()
  const els = root.value.querySelectorAll('.split-word')
  gsap.from(els, {
    yPercent: 120,
    duration: 0.9,
    ease: 'expo.out',
    stagger: props.stagger,
    delay: props.delay,
  })
})
</script>

<template>
  <component :is="as" ref="root" class="split">
    <span v-for="(w, i) in words" :key="i" class="split-wrap">
      <span class="split-word">{{ w }}</span><span v-if="i < words.length - 1">&nbsp;</span>
    </span>
  </component>
</template>

<style scoped>
.split-wrap {
  display: inline-block;
  overflow: hidden;
  line-height: 1.1;
}
.split-word {
  display: inline-block;
  will-change: transform;
}
</style>
