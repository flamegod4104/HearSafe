// app/signup/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Eye, EyeOff, Ear, User, Mail, Lock, Waves, Volume2, Stethoscope, Activity, BarChart3, Scan, AudioLines} from "lucide-react"
import { useRouter } from "next/navigation"
import { WaveBackground } from "@/components/common/Wave-background"
import TextType from '@/components/ui/TextType';

export default function SignUpPage() {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [currentIcon, setCurrentIcon] = useState(0)
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [errors, setErrors] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const router = useRouter()

    const icons = [
        <Ear key="ear" className="w-24 h-24 text-primary animate-pulse" />,
        <Volume2 key="volume" className="w-24 h-24 text-primary animate-pulse" />,
        <Stethoscope key="stethoscope" className="w-24 h-24 text-primary animate-pulse" />,
    ]
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIcon((prev) => (prev + 1) % icons.length)
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    const validateForm = () => {
        const newErrors = {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: ""
        }

        let isValid = true

        // Full name validation
        if (!formData.fullName.trim()) {
            newErrors.fullName = "Full name is required"
            isValid = false
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
            isValid = false
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid"
            isValid = false
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = "Password is required"
            isValid = false
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters"
            isValid = false
        }

        // Confirm password validation
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password"
            isValid = false
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match"
            isValid = false
        }

        setErrors(newErrors)
        return isValid
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (validateForm()) {
            // Form is valid, proceed with signup
            router.push("/dashboard")
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [field]: "" }))
        }
    }

    return (
        <div className="min-h-screen flex">
            <WaveBackground />

            {/* Left side - Dynamic icon */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-white/20 dark:bg-black/20 backdrop-blur-xs">
                <div className="flex flex-col items-center justify-center space-y-6">
                    <span>
                        <AudioLines className="w-14 h-14"/>
                    </span>
                    <h2 className="text-2xl font-bold text-foreground text-center max-w-xs">
                        <TextType
                            text={["Join HearSafe and take the first step towards better hearing."]}
                            typingSpeed={75}
                            pauseDuration={1500}
                            showCursor={true}
                            cursorCharacter="|"
                        />
                    </h2>
                </div>
            </div>

            {/* Right side - Sign up form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white/10 dark:bg-black/10 backdrop-blur-xs">
                <div className="max-w-md w-full space-y-8">
                    {/* Logo */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-primary">HearSafe</h1>
                    </div>

                    {/* Sign up form */}
                    <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-xl p-6 border border-border shadow-md">
                        <h2 className="text-2xl font-semibold text-center text-foreground">Create Account</h2>

                        <div className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full bg-background text-foreground border-border pl-10"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                                    />
                                </div>
                                {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="Email"
                                        className="w-full bg-background text-foreground border-border pl-10"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange("email", e.target.value)}
                                    />
                                </div>
                                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="w-full bg-background text-foreground border-border pl-10 pr-10"
                                        value={formData.password}
                                        onChange={(e) => handleInputChange("password", e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        className="w-full bg-background text-foreground border-border pl-10 pr-10"
                                        value={formData.confirmPassword}
                                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
                        >
                            Create Account
                        </Button>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Already have an account?{" "}
                                <Link href="/login" className="text-primary hover:underline font-semibold">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}