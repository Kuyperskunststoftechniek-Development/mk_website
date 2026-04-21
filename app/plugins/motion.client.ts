import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Lenis (smooth scroll) + GSAP ScrollTrigger wiring.
 * Respects prefers-reduced-motion: skips Lenis init entirely.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) return

  gsap.registerPlugin(ScrollTrigger)

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReduced) {
    return {
      provide: {
        lenis: null as Lenis | null,
        gsap,
        ScrollTrigger,
      },
    }
  }

  const lenis = new Lenis({
    duration: 1.05,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })

  // Drive Lenis from GSAP's ticker for perfect sync with ScrollTrigger
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000)
  })
  gsap.ticker.lagSmoothing(0)

  // Tell ScrollTrigger when Lenis scrolls
  lenis.on('scroll', ScrollTrigger.update)

  // Teardown on navigation away from app (SPA safe)
  nuxtApp.hook('app:beforeMount', () => {
    // no-op: handled per component lifecycle where needed
  })

  return {
    provide: {
      lenis,
      gsap,
      ScrollTrigger,
    },
  }
})
