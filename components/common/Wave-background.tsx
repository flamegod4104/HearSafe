"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function WaveBackground() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Base gradient background */}
      <div
        className={`absolute inset-0 ${
          isDark
            ? "bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-800"
            : "bg-gradient-to-br from-pink-50 via-purple-50 to-cyan-50"
        }`}
      />

      {/* Animated wave layers */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Light theme gradients */}
          <linearGradient id="wave1-light" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(236, 72, 153, 0.3)" />
            <stop offset="50%" stopColor="rgba(147, 51, 234, 0.4)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.3)" />
          </linearGradient>
          <linearGradient id="wave2-light" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(219, 39, 119, 0.2)" />
            <stop offset="50%" stopColor="rgba(124, 58, 237, 0.3)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.2)" />
          </linearGradient>
          <linearGradient id="wave3-light" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(244, 114, 182, 0.15)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.2)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0.15)" />
          </linearGradient>

          {/* Dark theme gradients */}
          <linearGradient id="wave1-dark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(236, 72, 153, 0.4)" />
            <stop offset="50%" stopColor="rgba(147, 51, 234, 0.5)" />
            <stop offset="100%" stopColor="rgba(59, 130, 246, 0.4)" />
          </linearGradient>
          <linearGradient id="wave2-dark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(219, 39, 119, 0.3)" />
            <stop offset="50%" stopColor="rgba(124, 58, 237, 0.4)" />
            <stop offset="100%" stopColor="rgba(6, 182, 212, 0.3)" />
          </linearGradient>
          <linearGradient id="wave3-dark" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(244, 114, 182, 0.2)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.3)" />
            <stop offset="100%" stopColor="rgba(34, 211, 238, 0.2)" />
          </linearGradient>

          {/* Line patterns for texture */}
          <pattern id="lines" patternUnits="userSpaceOnUse" width="2" height="1">
            <line
              x1="0"
              y1="0.5"
              x2="2"
              y2="0.5"
              stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
              strokeWidth="0.5"
            />
          </pattern>
        </defs>

        {/* Wave layer 1 - Bottom */}
        <path
          d="M0,400 C300,300 600,500 1200,350 L1200,800 L0,800 Z"
          fill={`url(#wave1-${isDark ? "dark" : "light"})`}
          className="animate-pulse"
          style={{
            animation: "wave1 20s ease-in-out infinite",
          }}
        />

        {/* Wave layer 2 - Middle */}
        <path
          d="M0,450 C400,350 800,550 1200,400 L1200,800 L0,800 Z"
          fill={`url(#wave2-${isDark ? "dark" : "light"})`}
          style={{
            animation: "wave2 25s ease-in-out infinite reverse",
          }}
        />

        {/* Wave layer 3 - Top */}
        <path
          d="M0,500 C350,400 650,600 1200,450 L1200,800 L0,800 Z"
          fill={`url(#wave3-${isDark ? "dark" : "light"})`}
          style={{
            animation: "wave3 30s ease-in-out infinite",
          }}
        />

        {/* Texture overlay */}
        <rect width="100%" height="100%" fill="url(#lines)" opacity="0.3" />
      </svg>

      {/* CSS animations */}
      <style jsx>{`
        @keyframes wave1 {
          0%, 100% {
            d: path("M0,400 C300,300 600,500 1200,350 L1200,800 L0,800 Z");
          }
          50% {
            d: path("M0,350 C350,250 650,450 1200,300 L1200,800 L0,800 Z");
          }
        }
        
        @keyframes wave2 {
          0%, 100% {
            d: path("M0,450 C400,350 800,550 1200,400 L1200,800 L0,800 Z");
          }
          50% {
            d: path("M0,500 C450,400 750,600 1200,450 L1200,800 L0,800 Z");
          }
        }
        
        @keyframes wave3 {
          0%, 100% {
            d: path("M0,500 C350,400 650,600 1200,450 L1200,800 L0,800 Z");
          }
          50% {
            d: path("M0,450 C400,350 700,550 1200,400 L1200,800 L0,800 Z");
          }
        }
      `}</style>
    </div>
  )
}
