"use client"

import { ReactNode } from "react"

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export default function PageWrapper({ children, className = "" }: PageWrapperProps) {
  return (
    <main className={`min-h-screen pt-20 md:pt-24 ${className}`}>
      {children}
    </main>
  )
}