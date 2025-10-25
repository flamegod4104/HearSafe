"use client"

interface WaveIconProps {
  isPlaying: boolean
}

export function WaveIcon({ isPlaying }: WaveIconProps) {
  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Outer pulse ring */}
      <div
        className={`absolute inset-0 rounded-full bg-primary/20 transition-all duration-300 ${
          isPlaying ? "animate-ping" : "opacity-0"
        }`}
      />

      {/* Middle ring */}
      <div
        className={`absolute inset-4 rounded-full bg-primary/30 transition-all duration-500 ${
          isPlaying ? "scale-110 opacity-100" : "scale-100 opacity-0"
        }`}
      />

      {/* Main circle */}
      <div className="relative w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
        {/* Wave bars */}
        <div className="flex items-center justify-center gap-1.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 bg-primary rounded-full transition-all duration-300 ${
                isPlaying ? "animate-wave" : "h-4"
              }`}
              style={{
                height: isPlaying ? "100%" : "16px",
                animationDelay: `${i * 0.1}s`,
                animationDuration: "0.8s",
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% {
            height: 16px;
          }
          50% {
            height: 40px;
          }
        }
        
        .animate-wave {
          animation: wave 0.8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
