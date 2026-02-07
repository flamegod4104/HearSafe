"use client"

import * as React from "react"
import Link from "next/link"
import { LogIn, UserPlus } from "lucide-react"
import Image from "next/image" 
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ThemeToggle } from "../common/theme-provider"
import { AudioWaveform } from 'lucide-react';

export function Navbar() {
  return (
    <div className="flex items-center justify-between h-16 px-8 border-b fixed top-0 left-0 w-full">
      {/* Left: Logo + App name */}
      <div className="flex items-center gap-2">
        <AudioWaveform/>
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

          <NavigationMenuItem>
            <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
              <Link href="/contact-support">Contact Support</Link>
            </NavigationMenuLink>
          </NavigationMenuItem>
          
        </NavigationMenuList>
      </NavigationMenu>

      {/* Right: Auth actions */}
      <div className="flex items-center gap-4">
        <Link href="/signup" className="flex items-center gap-1 hover:underline">
          <UserPlus className="h-4 w-4" />
          Sign Up
        </Link>
        <Link href="/login" className="flex items-center gap-1 hover:underline">
          <LogIn className="h-4 w-4" />
          Login
        </Link>
        <ThemeToggle/>
      </div>
    </div>
  )
}
