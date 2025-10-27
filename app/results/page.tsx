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
  const resultsRef = useRef<HTMLDivElement>(null)

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
  const hearingRange = {
    low: results[0] && results[1], // 250Hz & 500Hz
    mid: results[2] && results[3], // 1000Hz & 2000Hz
    high: results[4] && results[5] // 4000Hz & 6000Hz
  }

  const getHearingAssessment = () => {
    if (score >= 90) return { level: "Excellent", color: "text-green-500", bg: "bg-green-500/10" }
    if (score >= 70) return { level: "Good", color: "text-blue-500", bg: "bg-blue-500/10" }
    if (score >= 50) return { level: "Fair", color: "text-yellow-500", bg: "bg-yellow-500/10" }
    return { level: "Needs Attention", color: "text-orange-500", bg: "bg-orange-500/10" }
  }

  const assessment = getHearingAssessment()

  // Calculate positions for the line chart - FIXED VERSION
  const getPointPosition = (index: number) => {
    const totalWidth = 800 // Approximate width of chart area
    const totalHeight = 350 // Approximate height of chart area
    
    const x = (index / (Math.max(levels.length - 1, 1))) * totalWidth
    const y = totalHeight - (volumes[index] / 30) * totalHeight // Invert Y axis (0dB at top, 30dB at bottom)
    
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

  // PDF Download Function
  // const downloadPDF = async () => {
  //   if (!resultsRef.current) return
    
  //   setGeneratingPDF(true)
  //   try {
  //     const canvas = await html2canvas(resultsRef.current, {
  //       scale: 2,
  //       useCORS: true,
  //       logging: false,
  //       backgroundColor: "#ffffff"
  //     })

  //     const imgData = canvas.toDataURL('image/png')
  //     const pdf = new jsPDF('p', 'mm', 'a4')
  //     const pdfWidth = pdf.internal.pageSize.getWidth()
  //     const pdfHeight = pdf.internal.pageSize.getHeight()
      
  //     // Calculate dimensions to maintain aspect ratio
  //     const imgWidth = canvas.width
  //     const imgHeight = canvas.height
  //     const ratio = imgWidth / imgHeight
  //     let width = pdfWidth - 20 // Margin
  //     let height = width / ratio
      
  //     // If content is too tall, adjust height
  //     if (height > pdfHeight - 20) {
  //       height = pdfHeight - 20
  //       width = height * ratio
  //     }

  //     const x = (pdfWidth - width) / 2
  //     const y = (pdfHeight - height) / 2

  //     pdf.addImage(imgData, 'PNG', x, y, width, height)
      
  //     // Add header with test date
  //     if (testData?.testDate) {
  //       const testDate = new Date(testData.testDate).toLocaleDateString()
  //       pdf.setFontSize(10)
  //       pdf.setTextColor(100)
  //       pdf.text(`Hearing Test Results - ${testDate}`, 15, 15)
  //     }
      
  //     pdf.save(`hearing-test-results-${new Date().toISOString().split('T')[0]}.pdf`)
  //   } catch (error) {
  //     console.error('Error generating PDF:', error)
  //     alert('Error generating PDF. Please try again.')
  //   } finally {
  //     setGeneratingPDF(false)
  //   }
  // }

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
        <Card className="p-8 mb-8 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-4">Overall Hearing Score</h2>
              <div className="relative inline-block">
                <div className="w-48 h-48 rounded-full border-8 border-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-5xl font-bold ${assessment.color}`}>{score}%</div>
                    <div className={`text-lg font-semibold mt-2 ${assessment.color}`}>
                      {assessment.level}
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
                  <div className={`px-3 py-1 rounded-full ${hearingRange.low ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'}`}>
                    {hearingRange.low ? 'Normal' : 'Limited'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Mid Frequencies</span>
                  <div className={`px-3 py-1 rounded-full ${hearingRange.mid ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'}`}>
                    {hearingRange.mid ? 'Normal' : 'Limited'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>High Frequencies</span>
                  <div className={`px-3 py-1 rounded-full ${hearingRange.high ? 'bg-green-500/20 text-green-600' : 'bg-orange-500/20 text-orange-600'}`}>
                    {hearingRange.high ? 'Normal' : 'Limited'}
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
                    className="overflow-visible"
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
            <div className="absolute -left-4 top-1/2 transform -rotate-90 -translate-y-1/2 text-sm text-muted-foreground font-semibold">
              Volume (dB)
            </div>

            {/* X-axis title */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground font-semibold">
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
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-6">Recommendations</h2>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
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
              {/* NEW: Download PDF Button */}
              {/* <Button 
                variant="outline" 
                className="w-full"
                onClick={downloadPDF}
                disabled={generatingPDF}
              >
                {generatingPDF ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Results (PDF)
                  </>
                )}
              </Button> */}
            </div>
          </Card>
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