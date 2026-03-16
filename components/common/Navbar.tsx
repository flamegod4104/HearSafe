"use client"

import * as React from "react"
import Link from "next/link"
import { LogIn, UserPlus, LogOut } from "lucide-react"
import { AudioWaveform } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { onAuthStateChanged, signOut, User } from "firebase/auth"
import { auth } from "@/lib/firebase/client"  // ← update this path to match yours
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
// import { ThemeToggle } from "../common/theme-provider"
import { ThemeToggle } from "@/components/common/theme-provider"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ─── Listen for auth state changes ──────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // ─── Sign out handler ────────────────────────────────────────────────────────
  const handleSignOut = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem("qaData")
      localStorage.removeItem("analysisResult")
      router.push("/login")
    } catch (err) {
      console.error("Sign out error:", err)
    }
  }

  return (
    <div className="flex items-center justify-between h-16 px-8 border-b fixed top-0 left-0 w-full z-50">
      
      {/* Left: Logo + App name */}
      <div className="flex items-center gap-2">
        <AudioWaveform />
        <span className="text-xl font-bold">HearSafe</span>
      </div>

      {/* Center: Navigation links */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/">Home</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/about-us">About Us</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>

          {/* Only show these links when logged in */}
          {user && (
            <>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/results">Results</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/test-history">History</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </>
          )}

          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/contact-support">Contact Support</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Right: Auth actions */}
      <div className="flex items-center gap-4">
        {/* Show nothing while Firebase is checking auth state */}
        {!loading && (
          <>
            {user ? (
              // ─── Logged in: show user email + sign out ──────────────────────
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden md:block">
                  {user.displayName ?? user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 hover:underline text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              // ─── Not logged in: show sign up + login ────────────────────────
              <>
                <Link href="/signup" className="flex items-center gap-1 hover:underline text-sm">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Link>
                <Link href="/login" className="flex items-center gap-1 hover:underline text-sm">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </>
            )}
          </>
        )}
        <ThemeToggle />
      </div>
    </div>
  )
}