// components/NavbarWrapper.tsx
"use client"

import { usePathname } from "next/navigation"
import { Navbar } from "@/components/common/Navbar"

export function NavbarWrapper() {
  const pathname = usePathname()
  const hideNavbar = pathname === '/login' || pathname === '/sign-up'
  
  return !hideNavbar ? <Navbar /> : null
}