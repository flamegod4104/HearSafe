// components/AuthForm.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Eye, EyeOff, User, Mail, Lock } from "lucide-react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase/client"

interface AuthFormProps {
  type: "sign-up" | "sign-in"
}

export default function AuthForm({ type }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
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

  const isSignUp = type === "sign-up"

  const validateForm = () => {
    const newErrors = {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: ""
    }

    let isValid = true

    // Full name validation (only for sign-up)
    if (isSignUp && !formData.fullName.trim()) {
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

    // Confirm password validation (only for sign-up)
    if (isSignUp && !formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
      isValid = false
    } else if (isSignUp && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)
      try {
        if (isSignUp) {
          // SIGN UP LOGIC
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
          )

          // Store user data in Firestore
          await setDoc(doc(db, "users", userCredential.user.uid), {
            fullName: formData.fullName,
            email: formData.email,
            createdAt: new Date(),
            uid: userCredential.user.uid
          })

          console.log("User created successfully!")
          router.push("/login") // Redirect to login after sign-up
        } else {
          // ACTUAL FIREBASE SIGN-IN LOGIC
          const userCredential = await signInWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
          )

          console.log("User signed in successfully:", userCredential.user)
          // STEP 2: Get redirect URL from query parameters
          const urlParams = new URLSearchParams(window.location.search)
          const redirect = urlParams.get('redirect') || '/' // Default to homepage

          // STEP 2: Redirect to the intended page or homepage
          router.push(redirect)// Redirect to homepage after successful login
        }
      } catch (error: any) {
        console.error(`Error ${isSignUp ? "signing up" : "signing in"}:`, error.message)

        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-in-use') {
          setErrors(prev => ({ ...prev, email: "Email is already in use" }))
        } else if (error.code === 'auth/weak-password') {
          setErrors(prev => ({ ...prev, password: "Password is too weak" }))
        } else if (error.code === 'auth/invalid-email') {
          setErrors(prev => ({ ...prev, email: "Invalid email address" }))
        } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          setErrors(prev => ({ ...prev, email: "Invalid email or password" }))
        } else if (error.code === 'auth/too-many-requests') {
          setErrors(prev => ({ ...prev, email: "Too many attempts. Try again later." }))
        } else {
          setErrors(prev => ({ ...prev, email: `${isSignUp ? "Signup" : "Signin"} failed. Please try again.` }))
        }
      } finally {
        setIsLoading(false)
      }
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
    <div className="max-w-md w-full space-y-8">
      {/* Logo */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">HearSafe</h1>
      </div>

      {/* Auth form */}
      <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-xl p-6 border border-border shadow-md">
        <h2 className="text-2xl font-semibold text-center text-foreground">
          {isSignUp ? "Create Account" : "Sign In"}
        </h2>

        <div className="space-y-4">
          {/* Full Name - Only show for sign-up */}
          {isSignUp && (
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-background text-foreground border-border pl-10"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
            </div>
          )}

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
                disabled={isLoading}
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
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          {/* Confirm Password - Only show for sign-up */}
          {isSignUp && (
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full bg-background text-foreground border-border pl-10 pr-10"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300"
          disabled={isLoading}
        >
          {isLoading ? (isSignUp ? "Creating Account..." : "Signing In...") : (isSignUp ? "Create Account" : "Sign In")}
        </Button>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Link
              href={isSignUp ? "/login" : "/sign-up"}
              className="text-primary hover:underline font-semibold"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </Link>
          </p>
        </div>
      </form>
    </div>
  )
}