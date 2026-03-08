"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { WaveBackground } from "@/components/common/Wave-background"
import { useRouter } from "next/navigation"
import PageWrapper from "@/components/ui/PageWrapper"

export default function QAPage() {
  const router = useRouter()

  const [age, setAge] = useState<number | "">("")
  const [sex, setSex] = useState("F")
  const [hoursChoice, setHoursChoice] = useState("<1")
  const [volumeLevel, setVolumeLevel] = useState("Low")
  const [environment, setEnvironment] = useState("Quiet indoor")
  const [events, setEvents] = useState(0)

  const handleSubmit = () => {
    // 🔹 Map hours
    const hoursMap: any = {
      "<1": 0.5,
      "1-2": 1.5,
      "3-4": 3.5,
      "5-6": 5.5,
      ">6": 7
    }

    // 🔹 Map volume
    const volumeMap: any = {
      Low: 1,
      Moderate: 2,
      Loud: 3
    }

    const noisyEnv = environment === "Quiet indoor" ? 0 : 1

    const qaData = {
      age: age,
      sex: sex,
      hours_per_day: hoursMap[hoursChoice],
      volume_level: volumeMap[volumeLevel],
      noisy_environment: noisyEnv,
      events_per_month: events
    }

    localStorage.setItem("qaData", JSON.stringify(qaData))

    router.push("/test")
  }

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center p-4 pt-20 md:pt-24">
        <WaveBackground />
        <Card className="w-full max-w-2xl p-8 relative z-10">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Noise Exposure Questionnaire
          </h1>
  
          <div className="space-y-6">
  
            {/* Age */}
            <div>
              <label className="block mb-2 font-semibold">Age</label>
              <input
                type="number"
                min={18}
                max={80}
                value={age}
                onChange={(e) => setAge(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </div>
  
            {/* Sex */}
            <div>
              <label className="block mb-2 font-semibold">Sex</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="w-full border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              >
                <option value="F">Female</option>
                <option value="M">Male</option>
              </select>
            </div>
  
            {/* Hours per day */}
            <div>
              <label className="block mb-2 font-semibold">
                Headphone usage per day
              </label>
              <select
                value={hoursChoice}
                onChange={(e) => setHoursChoice(e.target.value)}
                className="w-full border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              >
                <option value="<1">&lt; 1 hour</option>
                <option value="1-2">1-2 hours</option>
                <option value="3-4">3-4 hours</option>
                <option value="5-6">5-6 hours</option>
                <option value=">6">&gt; 6 hours</option>
              </select>
            </div>
  
            {/* Volume level */}
            <div>
              <label className="block mb-2 font-semibold">
                Typical Volume Level
              </label>
              <select
                value={volumeLevel}
                onChange={(e) => setVolumeLevel(e.target.value)}
                className="w-full border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              >
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="Loud">Loud</option>
              </select>
            </div>
  
            {/* Environment */}
            <div>
              <label className="block mb-2 font-semibold">
                Listening Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              >
                <option value="Quiet indoor">Quiet indoor</option>
                <option value="Noisy">
                  Noisy (traffic / gym / public places)
                </option>
              </select>
            </div>
  
            {/* Events */}
            <div>
              <label className="block mb-2 font-semibold">
                Loud events per month
              </label>
              <input
                type="number"
                min={0}
                max={20}
                value={events}
                onChange={(e) => setEvents(parseInt(e.target.value))}
                className="w-full border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              />
            </div>
  
            <Button onClick={handleSubmit} className="w-full mt-4">
              Continue to Hearing Test
            </Button>
  
          </div>
        </Card>
      </div>

    </PageWrapper>
    )

    
}
