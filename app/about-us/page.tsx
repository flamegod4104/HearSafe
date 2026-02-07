// app/about-us/page.tsx
"use client"

import { WaveBackground } from "@/components/common/Wave-background"
import { Card } from "@/components/ui/card"
import { useState, useEffect, useRef } from "react"

export default function AboutUsPage() {
  const [testCount, setTestCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const storyRef = useRef<HTMLDivElement>(null)

  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "Audiologist & Founder",
      description: "15+ years of experience in audiology and hearing health research.",
      icon: "hearing"
    },
    {
      name: "Michael Rodriguez",
      role: "Software Engineer",
      description: "Specialized in accessible technology and user experience design.",
      icon: "code"
    },
    {
      name: "Dr. Emily Watson",
      role: "Medical Advisor",
      description: "ENT specialist with focus on geriatric hearing health.",
      icon: "medical_services"
    },
    {
      name: "David Kim",
      role: "Product Designer",
      description: "Passionate about creating inclusive designs for older adults.",
      icon: "palette"
    }
  ]

  const values = [
    {
      title: "Accessibility",
      description: "Making hearing health screening available to everyone, everywhere.",
      icon: "accessibility"
    },
    {
      title: "Accuracy",
      description: "Providing reliable screening tools backed by audiological research.",
      icon: "verified"
    },
    {
      title: "Empathy",
      description: "Understanding the challenges faced by those with hearing difficulties.",
      icon: "psychology"
    },
    {
      title: "Innovation",
      description: "Continuously improving our technology to serve you better.",
      icon: "auto_awesome"
    }
  ]

  // Counter animation for test count
  useEffect(() => {
    const duration = 3000 // 3 seconds
    const steps = 100
    const stepDuration = duration / steps
    const targetCount = 10000

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      // Ease out function for smooth animation
      const easeOutProgress = 1 - Math.pow(1 - progress, 3)
      const currentCount = Math.floor(targetCount * easeOutProgress)
      
      setTestCount(currentCount)
      
      if (currentStep >= steps) {
        setTestCount(targetCount)
        clearInterval(timer)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [])

  // Intersection Observer for story section animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    if (storyRef.current) {
      observer.observe(storyRef.current)
    }

    return () => {
      if (storyRef.current) {
        observer.unobserve(storyRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen">
      <WaveBackground />
      <div className="relative z-10 max-w-6xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 mt-10">About HearSafe</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering individuals to take control of their hearing health through accessible, 
            reliable screening tools and comprehensive educational resources.
          </p>
        </div>

        {/* Mission Section */}
        <Card className="p-8 mb-12 text-center bg-primary/5 border-primary/20 transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 cursor-pointer group">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
            <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform duration-500">flag</span>
          </div>
          <h2 className="text-3xl font-semibold mb-4 group-hover:text-primary transition-colors duration-500">Our Mission</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto group-hover:text-foreground transition-colors duration-500">
            To make hearing health screening accessible, understandable, and actionable for older adults 
            and their families. We believe everyone deserves the opportunity to monitor their hearing health 
            conveniently from home.
          </p>
        </Card>

        {/* Story Section */}
        <div ref={storyRef} className="grid md:grid-cols-2 gap-12 mb-16">
          <div className={`transition-all duration-1000 ease-out transform ${
            isVisible 
              ? 'translate-y-0 opacity-100' 
              : 'translate-y-10 opacity-0'
          }`}>
            <h2 className="text-3xl font-semibold mb-6">Our Story</h2>
            <div className="space-y-4 text-muted-foreground">
              <p className="transition-all duration-700 delay-100">
                HearSafe was founded when our team noticed a significant gap in 
                accessible hearing health screening for older adults. Many individuals were delaying 
                professional care due to barriers like transportation, cost, and fear.
              </p>
              <p className="transition-all duration-700 delay-200">
                Our team of audiologists, engineers, and designers came together to create a solution 
                that combines medical expertise with user-friendly technology. We've helped thousands 
                of users take the first step toward better hearing health.
              </p>
              <p className="transition-all duration-700 delay-300">
                Today, we continue to innovate and expand our services while maintaining our core 
                commitment to accessibility and accuracy.
              </p>
            </div>
          </div>
          <Card className="p-6 flex items-center justify-center transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 cursor-pointer group">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                <span className="material-symbols-outlined text-primary text-4xl group-hover:scale-110 transition-transform duration-500">group</span>
              </div>
              <h3 className="text-2xl font-semibold mb-2 transition-all duration-500 group-hover:text-primary">
                {testCount.toLocaleString()}+
              </h3>
              <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-500">Tests Completed</p>
            </div>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Card 
                key={index} 
                className="p-6 text-center transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 cursor-pointer group"
              >
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform duration-500">{value.icon}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-500">{value.title}</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-500">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <Card 
                key={index} 
                className="p-6 text-center transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 cursor-pointer group"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform duration-500">{member.icon}</span>
                </div>
                <h3 className="text-lg font-semibold mb-1 group-hover:text-primary transition-colors duration-500">{member.name}</h3>
                <p className="text-primary font-medium mb-3 group-hover:text-primary/80 transition-colors duration-500">{member.role}</p>
                <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-500">{member.description}</p>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Section */}
        <Card className="p-8 text-center bg-secondary/50 transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/40 cursor-pointer group">
          <h2 className="text-2xl font-semibold mb-4 group-hover:text-primary transition-colors duration-500">Get In Touch</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto group-hover:text-foreground transition-colors duration-500">
            Have questions about HearSafe or want to learn more about our mission? 
            We'd love to hear from you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
              Contact Us
            </button>
            <button className="px-6 py-3 border border-primary text-primary rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-primary-foreground">
              Join Our Newsletter
            </button>
          </div>
        </Card>
      </div>

      {/* Add Material Icons stylesheet */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
      />
    </div>
  )
}