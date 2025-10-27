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
import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

const TOTAL_LEVELS = 8

// Test configuration - different frequencies and volumes for each level
const testConfig = [
  { level: 1, frequency: 250, volume: 30, volumeDb: 30 },   // Low frequency, loud
  { level: 2, frequency: 500, volume: 25, volumeDb: 25 },
  { level: 3, frequency: 1000, volume: 20, volumeDb: 20 },  // Mid frequency
  { level: 4, frequency: 2000, volume: 15, volumeDb: 15 },
  { level: 5, frequency: 4000, volume: 10, volumeDb: 10 },  // High frequency
  { level: 6, frequency: 6000, volume: 5, volumeDb: 5 },
  { level: 7, frequency: 8000, volume: 2, volumeDb: 2 },
  { level: 8, frequency: 10000, volume: 0, volumeDb: 0 },   // Very high frequency, very quiet
]

export default function HearingTestPage() {
  const router = useRouter()
  const [currentLevel, setCurrentLevel] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [testComplete, setTestComplete] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<Array<{
    level: number
    frequency: number
    volumeDb: number
    response: boolean
    timestamp: Date
  }>>([])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login?redirect=/test")
      } else {
        setUser(user)
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (user && !loading) {
      playSound()
    }
  }, [currentLevel, user, loading])

  const playSound = () => {
    if (isPlaying) return
    
    setIsPlaying(true)
    const currentConfig = testConfig[currentLevel - 1]

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(currentConfig.frequency, audioContext.currentTime)
      gainNode.gain.setValueAtTime(currentConfig.volume, audioContext.currentTime)

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.start()

      setTimeout(() => {
        oscillator.stop()
        audioContext.close()
        setIsPlaying(false)
      }, 2000)
    } catch (error) {
      console.error("Error playing sound:", error)
      setIsPlaying(false)
    }
  }

  const handleResponse = async (canHear: boolean) => {
    const currentConfig = testConfig[currentLevel - 1]
    
    // Store the response
    const newResult = {
      level: currentConfig.level,
      frequency: currentConfig.frequency,
      volumeDb: currentConfig.volumeDb,
      response: canHear,
      timestamp: new Date()
    }

    const updatedResults = [...testResults, newResult]
    setTestResults(updatedResults)

    console.log(`Level ${currentLevel}: User ${canHear ? "can" : "cannot"} hear ${currentConfig.frequency}Hz at ${currentConfig.volumeDb}dB`)

    if (currentLevel < TOTAL_LEVELS) {
      setCurrentLevel(currentLevel + 1)
    } else {
      // Test complete - save to Firebase
      await saveResultsToFirebase(updatedResults)
      setTestComplete(true)
    }
  }

  const saveResultsToFirebase = async (results: typeof testResults) => {
    if (!user) return

    try {
      const testData = {
        userId: user.uid,
        testDate: new Date(),
        results: results,
        totalScore: Math.round((results.filter(r => r.response).length / results.length) * 100),
        levelsCompleted: results.length
      }

      // Save to user's test history
      const testId = `test_${Date.now()}`
      await setDoc(doc(db, "users", user.uid, "hearingTests", testId), testData)

      // Also save as latest test for quick access
      await setDoc(doc(db, "users", user.uid), {
        latestTest: testData,
        lastTestDate: new Date()
      }, { merge: true })

      console.log("Test results saved to Firebase")
    } catch (error) {
      console.error("Error saving test results:", error)
    }
  }

  const resetTest = () => {
    setCurrentLevel(1)
    setTestComplete(false)
    setTestResults([])
  }

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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => router.push('/results')} size="lg" className="min-w-40">
              See Results
            </Button>
            <Button onClick={resetTest} variant="outline" size="lg" className="min-w-40">
              Restart Test
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const currentConfig = testConfig[currentLevel - 1]

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

        {/* Current test info */}
        <div className="text-center mb-4">
          <p className="text-sm text-muted-foreground">
            Frequency: {currentConfig.frequency}Hz • Volume: {currentConfig.volumeDb}dB
          </p>
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