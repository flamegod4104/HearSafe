// app/results/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { WaveBackground } from "@/components/common/Wave-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase/client"
import { onAuthStateChanged } from "firebase/auth"
import { User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

export default function ResultsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [testData, setTestData] = useState<any>(null)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [mlPrediction, setMlPrediction] = useState<string | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [nearbyClinics, setNearbyClinics] = useState<any[]>([])
  const [loadingClinics, setLoadingClinics] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login?redirect=/results")
      } else {
        setUser(user)
        await fetchTestResults(user.uid)
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  // New addition 6th feb 2025
  useEffect(() => {
    if (typeof window !== "undefined") {
      const prediction = localStorage.getItem("mlPrediction")
      setMlPrediction(prediction)
    }
  }, [])

  const fetchTestResults = async (userId: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        if (userData.latestTest) {
          setTestData(userData.latestTest)
        } else {
          // If no latest test, use mock data
          setTestData(getMockData())
        }
      } else {
        setTestData(getMockData())
      }
    } catch (error) {
      console.error("Error fetching test results:", error)
      setTestData(getMockData())
    }
  }

  // Fallback mock data if no test data found
  const getMockData = () => {
    return {
      results: [
        { level: 1, frequency: 250, volumeDb: 30, response: true },
        { level: 2, frequency: 500, volumeDb: 25, response: true },
        { level: 3, frequency: 1000, volumeDb: 20, response: true },
        { level: 4, frequency: 2000, volumeDb: 15, response: true },
        { level: 5, frequency: 4000, volumeDb: 10, response: false },
        { level: 6, frequency: 6000, volumeDb: 5, response: false },
        { level: 7, frequency: 8000, volumeDb: 2, response: false },
        { level: 8, frequency: 10000, volumeDb: 0, response: false },
      ],
      totalScore: 50,
      testDate: new Date()
    }
  }

  // Transform Firebase data to match our chart format - FIXED VERSION
  const getChartData = () => {
    if (!testData || !testData.results) {
      const mockData = getMockData().results
      return {
        levels: mockData.map((r: any) => r.level),
        responses: mockData.map((r: any) => r.response),
        frequencies: mockData.map((r: any) => r.frequency),
        volumes: mockData.map((r: any) => r.volumeDb)
      }
    }

    const results = testData.results
    return {
      levels: results.map((r: any) => r.level),
      responses: results.map((r: any) => r.response),
      frequencies: results.map((r: any) => r.frequency),
      volumes: results.map((r: any) => r.volumeDb)
    }
  }

  const chartData = getChartData()
  const results = chartData.responses || []
  const frequencies = chartData.frequencies || []
  const volumes = chartData.volumes || []
  const levels = chartData.levels || []

  // Calculate overall score
  const score = testData?.totalScore || Math.round((results.filter((r: boolean) => r).length / results.length) * 100)

  // Hearing range analysis
  // SIMPLE FIX: Match Hearing Range to ML Diagnosis
  // FIXED: Hearing range analysis based on ML Diagnosis
  const getFrequencyStatus = () => {
    // If ML Diagnosis says "Severe Loss", show limited for mid/high
    if (mlPrediction && mlPrediction.toLowerCase().includes("severe")) {
      return {
        low: "Normal",     // Low frequencies often normal in age-related loss
        mid: "Limited",    // Mid frequencies affected
        high: "Limited"    // High frequencies most affected
      }
    }

    // If ML Diagnosis says "Mild Loss"
    if (mlPrediction && mlPrediction.toLowerCase().includes("mild")) {
      return {
        low: "Normal",
        mid: "Normal",
        high: "Limited"    // Only high frequencies affected
      }
    }

    // Default: Use test results
    return {
      low: results[0] && results[1] ? "Normal" : "Limited",
      mid: results[2] && results[3] ? "Normal" : "Limited",
      high: results[4] && results[5] ? "Normal" : "Limited"
    }
  }

  const frequencyStatus = getFrequencyStatus()

  // Step 1: Figure out what kind of hearing loss this is
  const getHearingCondition = () => {
    if (score >= 80) return "normal"
    if (score >= 60) return "mild"
    if (score >= 40) return "moderate"
    if (score >= 20) return "severe"
    return "profound"
  }

  const hearingCondition = getHearingCondition()

  // Step 2: Create different recommendations for each condition
  const getRecommendations = () => {
    if (hearingCondition === "normal") {
      return [
        {
          title: "Keep Protecting Your Ears",
          description: "Use earplugs at concerts and loud events. Avoid long exposure to loud noise.",
          icon: "hearing"
        },
        {
          title: "Regular Check-ups",
          description: "Test your hearing every 6 months to catch any early changes.",
          icon: "monitoring"
        },
        {
          title: "Healthy Habits",
          description: "Avoid smoking and manage stress for better hearing health.",
          icon: "favorite"
        }
      ]
    }

    if (hearingCondition === "mild") {
      return [
        {
          title: "See a Specialist Soon",
          description: "Schedule an appointment with an audiologist in the next month.",
          icon: "medical_information"
        },
        {
          title: "Better Communication",
          description: "Face people when talking and ask them to speak clearly.",
          icon: "forum"
        },
        {
          title: "Monitor Regularly",
          description: "Test every 3 months and note any changes.",
          icon: "monitoring"
        }
      ]
    }

    if (hearingCondition === "moderate") {
      return [
        {
          title: "Urgent Professional Help",
          description: "Book an appointment with a hearing specialist within 2 weeks.",
          icon: "medical_services"
        },
        {
          title: "Consider Hearing Aids",
          description: "Discuss hearing aid options with your doctor.",
          icon: "hearing"
        },
        {
          title: "Home Adjustments",
          description: "Reduce background noise at home for better hearing.",
          icon: "home"
        }
      ]
    }

    // For severe and profound
    return [
      {
        title: "Immediate Medical Attention",
        description: "Consult an ENT specialist immediately. This requires professional care.",
        icon: "emergency"
      },
      {
        title: "Advanced Hearing Solutions",
        description: "Discuss hearing aids or cochlear implants with a specialist.",
        icon: "medical_services"
      },
      {
        title: "Support and Training",
        description: "Join support groups and learn communication strategies.",
        icon: "support_agent"
      }
    ]
  }

  // ==================== GOOGLE MAPS FUNCTION ====================

  // This function finds nearby hearing doctors
  const findNearbyDoctors = () => {
    setLoadingClinics(true)

    // Simple method - just create links to Google Maps
    setTimeout(() => {
      setNearbyClinics([
        {
          name: "Search Audiologists Near You",
          description: "Click to find hearing specialists in your area",
          link: "https://www.google.com/maps/search/audiologist+near+me"
        },
        {
          name: "Find ENT Specialists",
          description: "Click to search for ear doctors",
          link: "https://www.google.com/maps/search/ENT+specialist+near+me"
        },
        {
          name: "Hearing Clinics",
          description: "Click to find hearing clinics nearby",
          link: "https://www.google.com/maps/search/hearing+clinic+near+me"
        }
      ])
      setLoadingClinics(false)
    }, 1500) // Wait 1.5 seconds to show loading
  }

  // Auto-find doctors if score is bad
  useEffect(() => {
    if (score < 50) {
      findNearbyDoctors()
    }
  }, [score])

  const smartRecommendations = getRecommendations()

  const getHearingAssessment = () => {
    if (score >= 90) return { level: "Excellent", color: "text-green-500", bg: "bg-green-500/10" }
    if (score >= 70) return { level: "Good", color: "text-blue-500", bg: "bg-blue-500/10" }
    if (score >= 50) return { level: "Fair", color: "text-yellow-500", bg: "bg-yellow-500/10" }
    return { level: "Needs Attention", color: "text-orange-500", bg: "bg-orange-500/10" }
  }

  const assessment = getHearingAssessment()

  // Calculate positions for the line chart - FIXED VERSION
  // Calculate positions for the line chart - FOR HIGH VOLUME VALUES
  const getPointPosition = (index: number) => {
    const totalWidth = 800
    const totalHeight = 350

    // X position: Leave margins and distribute evenly
    const marginX = 60
    const chartWidth = totalWidth - (2 * marginX)
    const x = marginX + (index / (Math.max(levels.length - 1, 1))) * chartWidth

    // Y position: Scale down the volume values to fit the graph
    const marginY = 40
    const chartHeight = totalHeight - (2 * marginY)

    // Scale volume (e.g., 80dB -> 0.8 * chartHeight from the top)
    const scaledVolume = volumes[index] / 100 // Scale 100dB to full height
    const y = marginY + (scaledVolume * chartHeight)

    return { x, y }
  }

  // Generate SVG path for the line - FIXED VERSION
  const generateLinePath = () => {
    if (levels.length === 0) return ""

    const points = levels.map((_: any, index: number) => getPointPosition(index))
    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`
    }

    return path
  }

  const recommendations = [
    {
      title: "Regular Monitoring",
      description: "Take this test every 3-6 months to track changes in your hearing.",
      icon: "monitoring"
    },
    {
      title: "Hearing Protection",
      description: "Use ear protection in loud environments to prevent further damage.",
      icon: "hearing_disabled"
    },
    {
      title: "Professional Consultation",
      description: "Consider visiting an audiologist for a comprehensive evaluation.",
      icon: "medical_information"
    },
    {
      title: "Communication Strategies",
      description: "Face people when talking and reduce background noise in conversations.",
      icon: "forum"
    }
  ]

  const nextSteps = [
    "Schedule a professional hearing test",
    "Download our hearing health guide",
    "Join our hearing wellness program",
    "Explore hearing assistance technology"
  ]

  if (loading || !testData) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <WaveBackground />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <WaveBackground />
      <div ref={resultsRef} className="relative z-10 max-w-6xl mx-auto p-6">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-4xl font-bold mb-4 mt-10">Your Hearing Results</h1>
          <p className="text-xl text-muted-foreground">
            Understanding your hearing health assessment
          </p>
          {testData.testDate && (
            <p className="text-sm text-muted-foreground mt-2">
              Test taken on {new Date(testData.testDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Overall Score Card */}


        {/* Overall Score Card */}
        <Card className="p-8 mb-8 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-4">Overall Hearing Score</h2>

              {/* ML Diagnosis - Moved outside the circle */}
              {mlPrediction && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">ML Diagnosis</h3>
                </div>
              )}

              <div className="relative inline-block">
                <div className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    {/* Only show the percentage, remove "Good" text */}
                    <div className={`text-5xl font-bold ${score >= 80 ? "text-green-600" :
                      score >= 60 ? "text-blue-600" :
                        score >= 40 ? "text-yellow-600" :
                          "text-red-600"
                      }`}>
                      {score}%
                    </div>
                    {/* Optional: Add score category as small text if you want */}
                    <div className="text-sm text-muted-foreground mt-2">
                      {score >= 80 ? "Excellent" :
                        score >= 60 ? "Good" :
                          score >= 40 ? "Fair" :
                            "Needs Attention"}
                    </div>
                  </div>
                </div>
                <div
                  className="absolute top-0 left-0 w-48 h-48 rounded-full border-8 border-transparent border-t-primary border-r-primary transform -rotate-45"
                  style={{
                    clipPath: `inset(0 0 ${100 - score}% 0)`
                  }}
                ></div>
              </div>
            </div>

            <div className="flex-1 text-left space-y-4">
              <h3 className="text-xl font-semibold mb-4">Hearing Range Analysis</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Low Frequencies</span>
                  <div className={`px-3 py-1 rounded-full ${frequencyStatus.low === "Normal" ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'}`}>
                    {frequencyStatus.low}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>Mid Frequencies</span>
                  <div className={`px-3 py-1 rounded-full ${frequencyStatus.mid === "Normal" ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'}`}>
                    {frequencyStatus.mid}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span>High Frequencies</span>
                  <div className={`px-3 py-1 rounded-full ${frequencyStatus.high === "Normal" ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'}`}>
                    {frequencyStatus.high}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Main Graph - Dynamic Line Chart */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Hearing Sensitivity Curve</h2>
          <div className="relative h-96">
            {/* Graph Container */}
            <div className="absolute inset-0 flex">
              {/* Y-axis labels */}
              <div className="w-20 flex flex-col justify-between text-sm text-muted-foreground py-4">
                <span>30dB</span>
                <span>25dB</span>
                <span>20dB</span>
                <span>15dB</span>
                <span>10dB</span>
                <span>5dB</span>
                <span>0dB</span>
              </div>

              {/* Graph Area */}
              <div className="flex-1 relative ml-4">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[...Array(7)].map((_, i) => (
                    <div key={i} className="h-px bg-border/50"></div>
                  ))}
                </div>

                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex justify-between">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="w-px bg-border/50"></div>
                  ))}
                </div>

                {/* SVG Line Chart - FIXED VERSION */}
                <div className="absolute inset-0">
                  <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 800 350"
                    preserveAspectRatio="none"
                    style={{ overflow: 'visible' }}
                  >
                    {/* Gradient for the line */}
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>

                    {/* Main Line */}
                    <path
                      d={generateLinePath()}
                      fill="none"
                      stroke="url(#lineGradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Data Points */}
                    {levels.map((level: number, index: number) => {
                      const { x, y } = getPointPosition(index)
                      const isHeard = results[index]
                      const isHovered = hoveredPoint === index

                      return (
                        <g key={level}>
                          {/* Glow effect on hover */}
                          {isHovered && (
                            <circle
                              cx={x}
                              cy={y}
                              r="12"
                              fill={isHeard ? "rgba(34, 197, 94, 0.2)" : "rgba(249, 115, 22, 0.2)"}
                              className="animate-pulse"
                            />
                          )}

                          {/* Outer circle */}
                          <circle
                            cx={x}
                            cy={y}
                            r="8"
                            fill={isHeard ? "rgba(34, 197, 94, 0.3)" : "rgba(249, 115, 22, 0.3)"}
                            stroke={isHeard ? "#16a34a" : "#ea580c"}
                            strokeWidth="2"
                            className="transition-all duration-200 cursor-pointer"
                            onMouseEnter={() => setHoveredPoint(index)}
                            onMouseLeave={() => setHoveredPoint(null)}
                          />

                          {/* Inner symbol */}
                          <text
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            className="text-xs font-bold fill-white pointer-events-none"
                          >
                            {isHeard ? "✓" : "✗"}
                          </text>

                          {/* Tooltip on hover */}
                          {isHovered && (
                            <g>
                              <rect
                                x={x - 50}
                                y={y - 50}
                                width="100"
                                height="40"
                                rx="6"
                                fill="rgba(0, 0, 0, 0.8)"
                                className="shadow-lg"
                              />
                              <text
                                x={x}
                                y={y - 35}
                                textAnchor="middle"
                                dominantBaseline="central"
                                className="text-xs fill-white font-semibold"
                              >
                                {`Level ${level}: ${frequencies[index]}Hz at ${volumes[index]}dB`}
                              </text>
                              <text
                                x={x}
                                y={y - 20}
                                textAnchor="middle"
                                dominantBaseline="central"
                                className="text-xs fill-white"
                              >
                                {isHeard ? "Sound Heard" : "Sound Missed"}
                              </text>
                            </g>
                          )}
                        </g>
                      )
                    })}
                  </svg>
                </div>

                {/* X-axis labels */}
                <div className="absolute -bottom-8 left-0 right-0 flex justify-between px-4">
                  {levels.map((level: number, index: number) => (
                    <div key={level} className="text-xs text-muted-foreground text-center flex-1">
                      <div className="font-semibold">L{level}</div>
                      <div>{frequencies[index]}Hz</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Y-axis title */}
            <div className="absolute left-4 top-1/2 transform -rotate-90 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
              Volume (dB)
            </div>

            {/* X-axis title */}
            <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground font-semibold">
              Frequency (Hz)
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 mt-12">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-green-600"></div>
              <span className="text-sm">Sounds Heard</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded-full border-2 border-orange-600"></div>
              <span className="text-sm">Sounds Missed</span>
            </div>
          </div>

          {/* Interpretation Guide */}
          <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
            <h4 className="font-semibold mb-2 text-center">How to Read This Chart</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="text-center">
                <div className="font-semibold text-green-600">Lower Left</div>
                <div>Better hearing at low frequencies</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-600">Middle Area</div>
                <div>Speech frequency range</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">Upper Right</div>
                <div>High-frequency hearing ability</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Recommendations */}
        {/* Smart Recommendations */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold">Personalized Recommendations</h2>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${hearingCondition === "normal" ? "bg-green-100 text-green-800" :
                hearingCondition === "mild" ? "bg-blue-100 text-blue-800" :
                  hearingCondition === "moderate" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                }`}>
                {hearingCondition.charAt(0).toUpperCase() + hearingCondition.slice(1)}
              </div>
            </div>

            <div className="space-y-4">
              {smartRecommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">{rec.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-8">
            {/* Next Steps Card (kept the same) */}
            <Card className="p-6">
              <h2 className="text-2xl font-semibold mb-6">Next Steps</h2>
              <div className="space-y-3">
                {nextSteps.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className="text-sm">{step}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  className="w-full"
                  onClick={() => router.push('/test/instructions')}
                >
                  Retake Test
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/resources')}
                >
                  Explore Resources
                </Button>
              </div>
            </Card>

            {/* ========== NEW: Nearby Doctors Section ========== */}
            {/* This ONLY shows if score is less than 50% */}
            {score < 50 && (
              <Card className="p-6 border-2 border-orange-200 bg-orange-50/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-orange-600">emergency</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-orange-700">Find Nearby Hearing Specialists</h2>
                    <p className="text-sm text-muted-foreground">Based on your test results</p>
                  </div>
                </div>

                {/* Loading state */}
                {loadingClinics ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Searching for nearby specialists...</p>
                  </div>
                ) : (
                  /* Show doctors list */
                  <div className="space-y-3">
                    {nearbyClinics.map((clinic, index) => (
                      <div
                        key={index}
                        className="p-4 border border-orange-100 rounded-lg bg-white hover:bg-orange-50/50 cursor-pointer transition-colors"
                        onClick={() => window.open(clinic.link, '_blank')}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <span className="material-symbols-outlined text-orange-600 text-sm">location_on</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-800 mb-1">{clinic.name}</h3>
                            <p className="text-sm text-gray-600">{clinic.description}</p>
                            <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">open_in_new</span>
                              Click to search on Google Maps
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Extra help message */}
                    <div className="mt-4 p-3 bg-orange-100/50 rounded-lg">
                      <p className="text-sm text-orange-800">
                        <span className="font-semibold">Important:</span> Your test indicates significant hearing loss.
                        Please consult with a healthcare professional as soon as possible.
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* Important Notice */}
        <Card className="p-6 bg-blue-500/10 border-blue-500/20">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-blue-500">info</span>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-blue-700">Important Notice</h3>
              <p className="text-sm text-white-600">
                This is a screening test only and should not replace professional medical advice.
                If you have concerns about your hearing, please consult with a qualified audiologist
                or healthcare provider for a comprehensive evaluation.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}