import type Lenis from 'lenis'
import type { gsap as GsapType } from 'gsap'
import type { ScrollTrigger as STType } from 'gsap/ScrollTrigger'

/**
 * Access to the shared Lenis + GSAP instances provided by the motion plugin.
 * `lenis` is null when prefers-reduced-motion is active or on the server.
 */
export function useMkpeMotion() {
  const nuxtApp = useNuxtApp()
  return {
    lenis: nuxtApp.$lenis as Lenis | null,
    gsap: nuxtApp.$gsap as typeof GsapType,
    ScrollTrigger: nuxtApp.$ScrollTrigger as typeof STType,
  }
}

/**
 * True when user prefers reduced motion (or during SSR).
 */
export function useMkpeReducedMotion() {
  if (import.meta.server) return ref(true)
  const reduced = ref(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
  const handler = (e: MediaQueryListEvent) => { reduced.value = e.matches }
  mql.addEventListener('change', handler)
  onScopeDispose(() => mql.removeEventListener('change', handler))
  return reduced
}
