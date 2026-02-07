// app/test/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WaveIcon } from "@/components/ui/wave-icon"
import { WaveBackground } from "@/components/common/Wave-background"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase/client"
import { onAuthStateChanged, User } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

const testConfig = [
  { frequency: 250, volumeDb: 80 },
  { frequency: 500, volumeDb: 70 },
  { frequency: 1000, volumeDb: 60 },
  { frequency: 2000, volumeDb: 50 },
  { frequency: 4000, volumeDb: 40 },
  { frequency: 8000, volumeDb: 30 },
]

export default function HearingTestPage() {
  const router = useRouter()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [testComplete, setTestComplete] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [testResults, setTestResults] = useState<Array<{
    frequency: number
    volumeDb: number
    response: boolean
    timestamp: Date
  }>>([])

  const TOTAL_LEVELS = testConfig.length
  const currentConfig = testConfig[currentIndex]

  // 🔐 Auth Check
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

  // ▶️ Play sound on level change
  useEffect(() => {
    if (user && !loading && currentConfig) {
      playSound()
    }
  }, [currentIndex, user, loading])

  const playSound = () => {
    if (!currentConfig || isPlaying) return

    setIsPlaying(true)

    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)()

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.type = "sine"
      oscillator.frequency.setValueAtTime(
        currentConfig.frequency,
        audioContext.currentTime
      )

      // Convert dB to small gain value (important!)
      gainNode.gain.setValueAtTime(
        currentConfig.volumeDb / 100,
        audioContext.currentTime
      )

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

  // 🤖 ML Prediction
  const getPrediction = async (results: typeof testResults) => {
    const formattedData: any = {}

    results.forEach((r) => {
      formattedData[`${r.frequency}Hz`] = r.response ? r.volumeDb : 40
    })

    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedData),
    })

    const data = await response.json()
    return data.classification
  }

  const handleResponse = async (canHear: boolean) => {
    if (!currentConfig) return

    const newResult = {
      frequency: currentConfig.frequency,
      volumeDb: currentConfig.volumeDb,
      response: canHear,
      timestamp: new Date(),
    }

    const updatedResults = [...testResults, newResult]
    setTestResults(updatedResults)

    if (currentIndex < TOTAL_LEVELS - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      await saveResultsToFirebase(updatedResults)

      const prediction = await getPrediction(updatedResults)
      localStorage.setItem("mlPrediction", prediction)

      setTestComplete(true)
    }
  }

  const saveResultsToFirebase = async (results: typeof testResults) => {
    if (!user) return

    try {
      const testData = {
        userId: user.uid,
        testDate: new Date(),
        results,
        totalScore: Math.round(
          (results.filter((r) => r.response).length / results.length) * 100
        ),
      }

      const testId = `test_${Date.now()}`
      await setDoc(doc(db, "users", user.uid, "hearingTests", testId), testData)

      await setDoc(
        doc(db, "users", user.uid),
        {
          latestTest: testData,
          lastTestDate: new Date(),
        },
        { merge: true }
      )
    } catch (error) {
      console.error("Error saving test results:", error)
    }
  }

  const resetTest = () => {
    setCurrentIndex(0)
    setTestResults([])
    setTestComplete(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <WaveBackground />
        <p>Checking authentication...</p>
      </div>
    )
  }

  if (testComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <WaveBackground />
        <Card className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Test Complete!</h1>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => router.push("/results")}>
              See Results
            </Button>
            <Button onClick={resetTest} variant="outline">
              Restart Test
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <WaveBackground />

      <Card className="w-full max-w-2xl p-8 text-center">
        <div className="mb-6">
          <p>
            Level {currentIndex + 1} of {TOTAL_LEVELS}
          </p>
          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
            <div
              className="h-full bg-primary"
              style={{
                width: `${((currentIndex + 1) / TOTAL_LEVELS) * 100}%`,
              }}
            />
          </div>
        </div>
        
        {/* Wave Icon */}
        <div className="flex justify-center my-6">
          <div className="relative">
            <WaveIcon isPlaying={isPlaying} /> 
          </div>
        </div>

        {currentConfig && (
          <p className="mt-4 text-sm text-muted-foreground">
            Frequency: {currentConfig.frequency}Hz • Volume:{" "}
            {currentConfig.volumeDb}dB
          </p>
        )}

        <h2 className="text-2xl font-semibold mt-8 mb-6">
          Can you hear this sound?
        </h2>

        <div className="flex gap-4 justify-center">
          <Button onClick={() => handleResponse(true)} disabled={isPlaying}>
            Yes
          </Button>
          <Button
            onClick={() => handleResponse(false)}
            variant="outline"
            disabled={isPlaying}
          >
            No
          </Button>
        </div>

        <Button
          onClick={playSound}
          variant="ghost"
          className="mt-6"
          disabled={isPlaying}
        >
          Replay Sound
        </Button>
      </Card>
    </div>
  )
}
