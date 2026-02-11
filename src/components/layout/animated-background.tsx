"use client"

import { useEffect, useRef } from "react"

export function AnimatedBackground() {
  const particlesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = particlesRef.current
    if (!container) return

    // Create particles
    const particleCount = 30
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"
      particle.style.left = `${Math.random() * 100}%`
      particle.style.animationDelay = `${Math.random() * 15}s`
      particle.style.animationDuration = `${15 + Math.random() * 10}s`
      container.appendChild(particle)
    }

    return () => {
      while (container.firstChild) {
        container.removeChild(container.firstChild)
      }
    }
  }, [])

  return (
    <div className="animated-bg">
      <div ref={particlesRef} className="particles" />
      
      {/* Light rays */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div 
          className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-r from-primary/30 to-transparent blur-3xl"
          style={{ top: '10%', right: '10%' }}
        />
        <div 
          className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-accent/20 to-transparent blur-3xl"
          style={{ bottom: '20%', left: '5%' }}
        />
      </div>
    </div>
  )
}
