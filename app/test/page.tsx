// app/test/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WaveIcon } from "@/components/ui/wave-icon"
import { WaveBackground } from "@/components/common/Wave-background"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase/client"
import { onAuthStateChanged } from "firebase/auth"
import { User } from "firebase/auth"


const TOTAL_LEVELS = 8

export default function HearingTestPage() {
  const router = useRouter()
  const [currentLevel, setCurrentLevel] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [testComplete, setTestComplete] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // User not logged in, redirect to login with return URL
        router.push("/login?redirect=/test")
      } else {
        setUser(user)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    // Auto-play sound when level changes (only if user is authenticated)
    if (user && !loading) {
      playSound()
    }
  }, [currentLevel, user, loading])

  const playSound = () => {
    setIsPlaying(true)

    // Create audio context for generating test tones
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // Different frequencies for different levels (decreasing volume)
    const frequency = 440 + currentLevel * 100 // Varying frequency
    const volume = 0.3 - currentLevel * 0.03 // Decreasing volume

    oscillator.type = "sine"
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime)

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.start()

    // Play for 2 seconds
    setTimeout(() => {
      oscillator.stop()
      audioContext.close()
      setIsPlaying(false)
    }, 2000)
  }

  const handleResponse = (canHear: boolean) => {
    console.log(`[v0] Level ${currentLevel}: User ${canHear ? "can" : "cannot"} hear the sound`)

    if (currentLevel < TOTAL_LEVELS) {
      setCurrentLevel(currentLevel + 1)
    } else {
      setTestComplete(true)
    }
  }

  const resetTest = () => {
    setCurrentLevel(1)
    setTestComplete(false)
  }

  // STEP 4: Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <WaveBackground />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (testComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <WaveBackground />
        <Card className="w-full max-w-2xl p-8 md:p-12 text-center relative z-10">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-balance">Test Complete!</h1>
            <p className="text-lg text-muted-foreground mb-8 text-pretty">
              You've completed all {TOTAL_LEVELS} levels of the hearing test. Thank you for participating.
            </p>
          </div>
          <Button onClick={resetTest} size="lg" className="min-w-40">
            Restart Test
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <WaveBackground />
      <Card className="w-full max-w-2xl p-8 md:p-12 relative z-10">
        {/* Level indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">
              Level {currentLevel} of {TOTAL_LEVELS}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {Math.round((currentLevel / TOTAL_LEVELS) * 100)}%
            </span>
          </div>
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${(currentLevel / TOTAL_LEVELS) * 100}%` }}
            />
          </div>
        </div>

        {/* Wave icon */}
        <div className="flex justify-center mb-12">
          <WaveIcon isPlaying={isPlaying} />
        </div>

        {/* Question */}
        <h1 className="text-2xl md:text-3xl font-semibold text-center mb-12 text-balance">Can you hear this sound?</h1>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => handleResponse(true)} size="lg" className="min-w-32 text-lg" disabled={isPlaying}>
            Yes
          </Button>
          <Button
            onClick={() => handleResponse(false)}
            variant="outline"
            size="lg"
            className="min-w-32 text-lg"
            disabled={isPlaying}
          >
            No
          </Button>
        </div>

        {/* Replay button */}
        <div className="mt-8 text-center">
          <Button
            onClick={playSound}
            variant="ghost"
            size="sm"
            disabled={isPlaying}
            className="text-muted-foreground hover:text-foreground"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Replay Sound
          </Button>
        </div>
      </Card>
    </div>
  )
}