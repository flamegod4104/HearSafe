// app/test-history/page.tsx
"use client"

import { useState, useEffect } from "react"
import { WaveBackground } from "@/components/common/Wave-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase/client"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { User } from "firebase/auth"
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase/client"

interface TestResult {
  id: string
  testDate: Date
  totalScore: number
  levelsCompleted: number
  results: Array<{
    level: number
    frequency: number
    volumeDb: number
    response: boolean
  }>
}

export default function TestHistoryPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userDetails, setUserDetails] = useState<any>(null)
  const [testHistory, setTestHistory] = useState<TestResult[]>([])
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login?redirect=/test-history")
      } else {
        setUser(user)
        await fetchUserData(user.uid)
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [router])

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch user details
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        setUserDetails(userDoc.data())
      }

      // Fetch test history
      const testsQuery = query(
        collection(db, "users", userId, "hearingTests"),
        orderBy("testDate", "desc")
      )
      const testsSnapshot = await getDocs(testsQuery)
      const tests = testsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        testDate: doc.data().testDate.toDate()
      })) as TestResult[]

      setTestHistory(tests)
      if (tests.length > 0) {
        setSelectedTest(tests[0])
      }
    } catch (error) {
      console.error("Error fetching user data:", error)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-blue-500"
    if (score >= 50) return "text-yellow-500"
    return "text-orange-500"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: "Excellent", class: "bg-green-500/20 text-green-600" }
    if (score >= 70) return { text: "Good", class: "bg-blue-500/20 text-blue-600" }
    if (score >= 50) return { text: "Fair", class: "bg-yellow-500/20 text-yellow-600" }
    return { text: "Needs Attention", class: "bg-orange-500/20 text-orange-600" }
  }

  const calculateHearingRange = (results: any[]) => {
    const responses = results.map((r: any) => r.response)
    return {
      low: responses[0] && responses[1], // 250Hz & 500Hz
      mid: responses[2] && responses[3], // 1000Hz & 2000Hz
      high: responses[4] && responses[5] // 4000Hz & 6000Hz
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <WaveBackground />
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your test history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <WaveBackground />
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 mt-10">Test History</h1>
            <p className="text-muted-foreground">
              Review your past hearing test results and track your progress
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="mt-4 md:mt-0 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - User Info and Test List */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Profile Card */}
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">person</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </h2>
                  <p className="text-muted-foreground text-sm">{user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="font-medium">
                    {user?.metadata.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString() : 
                      'N/A'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tests taken</span>
                  <span className="font-medium">{testHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last test</span>
                  <span className="font-medium">
                    {testHistory.length > 0 ? 
                      new Date(testHistory[0].testDate).toLocaleDateString() : 
                      'No tests yet'
                    }
                  </span>
                </div>
              </div>
            </Card>

            {/* Test History List */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Test History</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {testHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50">hearing</span>
                    <p>No tests taken yet</p>
                    <Button 
                      onClick={() => router.push('/test/instructions')}
                      className="mt-4"
                    >
                      Take First Test
                    </Button>
                  </div>
                ) : (
                  testHistory.map((test, index) => (
                    <div
                      key={test.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedTest?.id === test.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-primary/5'
                      }`}
                      onClick={() => setSelectedTest(test)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">
                            Test #{testHistory.length - index}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(test.testDate).toLocaleDateString()} at{' '}
                            {new Date(test.testDate).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(test.totalScore)}`}>
                          {test.totalScore}%
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {test.levelsCompleted} levels
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs ${getScoreBadge(test.totalScore).class}`}>
                          {getScoreBadge(test.totalScore).text}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Column - Detailed Test View */}
          <div className="lg:col-span-2">
            {selectedTest ? (
              <div className="space-y-6">
                {/* Test Overview */}
                <Card className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">
                        Test Details #{testHistory.findIndex(t => t.id === selectedTest.id) + 1}
                      </h2>
                      <p className="text-muted-foreground">
                        Taken on {new Date(selectedTest.testDate).toLocaleDateString()} at{' '}
                        {new Date(selectedTest.testDate).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getScoreColor(selectedTest.totalScore)}`}>
                        {selectedTest.totalScore}%
                      </div>
                      <div className={`px-3 py-1 rounded-full text-sm ${getScoreBadge(selectedTest.totalScore).class}`}>
                        {getScoreBadge(selectedTest.totalScore).text}
                      </div>
                    </div>
                  </div>

                  {/* Hearing Range Analysis */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4">Hearing Range Analysis</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {['Low', 'Mid', 'High'].map((range, index) => {
                        const hearingRange = calculateHearingRange(selectedTest.results)
                        const isNormal = index === 0 ? hearingRange.low : 
                                        index === 1 ? hearingRange.mid : 
                                        hearingRange.high
                        return (
                          <div key={range} className="text-center p-4 rounded-lg bg-secondary/30">
                            <div className="text-sm font-semibold mb-2">{range} Frequencies</div>
                            <div className={`text-lg font-bold ${
                              isNormal ? 'text-green-600' : 'text-orange-600'
                            }`}>
                              {isNormal ? 'Normal' : 'Limited'}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Detailed Results Table */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 font-semibold">Level</th>
                            <th className="text-left py-3 font-semibold">Frequency</th>
                            <th className="text-left py-3 font-semibold">Volume</th>
                            <th className="text-left py-3 font-semibold">Result</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTest.results.map((result, index) => (
                            <tr key={index} className="border-b border-border/50">
                              <td className="py-3">L{result.level}</td>
                              <td className="py-3">{result.frequency}Hz</td>
                              <td className="py-3">{result.volumeDb}dB</td>
                              <td className="py-3">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                  result.response 
                                    ? 'bg-green-500/20 text-green-600' 
                                    : 'bg-orange-500/20 text-orange-600'
                                }`}>
                                  {result.response ? (
                                    <>
                                      <span className="material-symbols-outlined text-xs mr-1">check</span>
                                      Heard
                                    </>
                                  ) : (
                                    <>
                                      <span className="material-symbols-outlined text-xs mr-1">close</span>
                                      Missed
                                    </>
                                  )}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Button 
                    onClick={() => router.push('/test/instructions')}
                    className="flex-1"
                  >
                    <span className="material-symbols-outlined mr-2">refresh</span>
                    Take New Test
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/results')}
                    className="flex-1"
                  >
                    <span className="material-symbols-outlined mr-2">bar_chart</span>
                    View Latest Results
                  </Button>
                </div>
              </div>
            ) : (
              <Card className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-4xl">history</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4">No Test Selected</h3>
                <p className="text-muted-foreground mb-6">
                  Select a test from your history to view detailed results, or take a new test to get started.
                </p>
                <Button onClick={() => router.push('/test/instructions')}>
                  Take Your First Test
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add Material Icons stylesheet */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
      />
    </div>
  )
}