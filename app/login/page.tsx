// app/login/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Eye, EyeOff, Ear, Music, AudioWaveform } from "lucide-react"
import { useRouter } from "next/navigation"
import { WaveBackground } from "@/components/common/Wave-background"
import TextType from '@/components/ui/TextType';

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [currentIcon, setCurrentIcon] = useState(0)
  const router = useRouter()

  const icons = [
    <Ear key="ear" className="w-24 h-24 text-primary animate-pulse" />,
    <Music key="music" className="w-24 h-24 text-primary animate-pulse" />,
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % icons.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex ">
      <WaveBackground />
      {/* Left side - Sign in form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white/10 dark:bg-black/10 backdrop-blur-xs">
        <div className="max-w-md w-full space-y-8">
          {/* Logo */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary">HearSafe</h1>
            {/* <AudioWaveform/> */}
          </div>

          {/* Sign in form */}
          <div className="space-y-6 bg-card rounded-xl p-6 border border-border shadow-md">
            <h2 className="text-2xl font-semibold text-center text-foreground">Sign in</h2>

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-background text-foreground border-border"
              />

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full pr-10 bg-background text-foreground border-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary bg-background"
                />
                <label htmlFor="remember" className="text-sm text-muted-foreground">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
              onClick={() => router.push("/dashboard")}
            >
              Sign in
            </Button>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-primary hover:underline font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Dynamic icon */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-xs">
        <div className="flex flex-col items-center justify-center space-y-6">
          {icons[currentIcon]}
          <h2 className="text-2xl font-bold text-foreground">
            <TextType text={["Smart Hearing Checks. Anywhere,Anytime."]} typingSpeed={75} pauseDuration={1500} showCursor={true} cursorCharacter="|"/>
          </h2>
        </div>
      </div>
    </div>
  )
}