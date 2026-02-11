"use client"

import { useEffect, useRef } from "react"

export function ParticleBackground() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const particleCount = 50

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"
      particle.style.left = `${Math.random() * 100}%`
      particle.style.animationDelay = `${Math.random() * 20}s`
      particle.style.animationDuration = `${15 + Math.random() * 10}s`
      container.appendChild(particle)
    }

    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
    }
  }, [])

  return <div ref={containerRef} className="particles" />
}

export function GridBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-10">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  )
}

export function GlowOrb({ position = "top-left" }: { position?: "top-left" | "top-right" | "bottom-left" | "bottom-right" }) {
  const positions = {
    "top-left": "-top-40 -left-40",
    "top-right": "-top-40 -right-40",
    "bottom-left": "-bottom-40 -left-40",
    "bottom-right": "-bottom-40 -right-40",
  }

  return (
    <div 
      className={`absolute w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none ${positions[position]}`}
      style={{
        background: "radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%)",
      }}
    />
  )
}
