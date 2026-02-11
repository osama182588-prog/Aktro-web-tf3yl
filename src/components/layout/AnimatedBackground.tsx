"use client";

// الخلفية المتحركة - Animated Background
// =======================================

import { useEffect, useState } from "react";

interface Particle {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
}

export default function AnimatedBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // إنشاء الجسيمات
    const newParticles: Particle[] = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 15,
        duration: 15 + Math.random() * 20,
        size: 2 + Math.random() * 4,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="animated-background">
      {/* الخلفية المتدرجة */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      
      {/* طبقة التوهج الأولى */}
      <div 
        className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)",
          animation: "float1 20s ease-in-out infinite",
        }}
      />
      
      {/* طبقة التوهج الثانية */}
      <div 
        className="absolute bottom-0 right-0 w-[800px] h-[800px] rounded-full opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(107,114,128,0.3) 0%, transparent 70%)",
          animation: "float2 25s ease-in-out infinite",
        }}
      />

      {/* خطوط ضوئية */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(59,130,246,0.5)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* الجسيمات */}
      <div className="particles">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="particle"
            style={{
              left: `${particle.left}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float1 {
          0%, 100% { transform: translate(-30%, -30%); }
          50% { transform: translate(-20%, -20%); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(30%, 30%); }
          50% { transform: translate(20%, 20%); }
        }
      `}</style>
    </div>
  );
}
