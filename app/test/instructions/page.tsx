// app/test/instructions/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Headphones, Volume2, Clock, Shield } from "lucide-react"
import { WaveBackground } from "@/components/common/Wave-background"
import { useRouter } from "next/navigation"
import { User } from "firebase/auth"

export default function InstructionsPage() {
  const router = useRouter()
  const [accepted, setAccepted] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const instructions = [
    {
      icon: Headphones,
      title: "Use Headphones",
      description: "For accurate results, please use good quality headphones or earphones."
    },
    {
      icon: Volume2,
      title: "Quiet Environment",
      description: "Find a quiet space without background noise or distractions."
    },
    {
      icon: Clock,
      title: "5-7 Minutes",
      description: "The test takes about 5-7 minutes to complete. Please don't rush."
    },
    {
      icon: Shield,
      title: "Medical Disclaimer",
      description: "This is a screening test only. Consult a professional for medical diagnosis."
    }
  ]

  const handleStartTest = () => {
    router.push("/test")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      <WaveBackground />
      
      <Card className="w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 md:p-8 relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-3">Hearing Test Instructions</h1>
          <p className="text-lg text-muted-foreground">
            Please follow these instructions for accurate results
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {instructions.map((instruction, index) => (
            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-border">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <instruction.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">{instruction.title}</h3>
                <p className="text-sm text-muted-foreground">{instruction.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-primary" />
            <label htmlFor="accept" className="text-sm cursor-pointer">
              <span className="font-medium">I understand these instructions</span>
              <span className="text-muted-foreground ml-1">and am ready to begin the test</span>
            </label>
            <input
              id="accept"
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-4 h-4 rounded border-border"
            />
          </div>

          <Button
            onClick={handleStartTest}
            size="lg"
            className="w-full text-lg"
            disabled={!accepted}
          >
            Start Hearing Test
          </Button>
        </div>
      </Card>
    </div>
  )
}