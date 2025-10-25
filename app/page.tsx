"use client";
import { Button } from "@/components/ui/button"
import { WaveBackground } from "../components/common/Wave-background"
import { HowItWorksSection } from "./HowItWork"
import AboutSection from "./AboutSection"
import TestimonialsSection from "./TestimonialsSection"
import FooterSection from "./FooterSection"
import ShinyText from '../components/ui/ShinyText';
import BlurText from "../components/ui/BlurText";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { User } from "firebase/auth"


export default function HomePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    // Step 1: Check if user is logged in
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Step 2: Handle button click
    const handleTakeTest = () => {
        if (user) {
            // User is signed in - go to instructions
            router.push("/test/instructions")
        } else {
            // User is not signed in - go to login with redirect info
            router.push("/login?redirect=/test/instructions")
        }
    }

    // Show loading while checking auth status
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        )
    }
    return (
        <div className="w-full pt-16" >
            {/* ===== Hero Section ===== */}
            <section className="relative min-h-screen flex items-center justify-center animate-fadeInUp">
                <WaveBackground />
                <main className="p-6 relative z-10 text-center max-w-4xl mx-auto">
                    {/* Main Heading with ShinyText */}
                    <div className="flex justify-center text-5xl md:text-7xl mb-8 font-bold">
                        <ShinyText
                            text="Welcome to HearSafe"
                            disabled={false}
                            speed={3}
                            className='text-4xl md:text-6xl font-bold text-primary dark:[--shiny-color-start:#fff] dark:[--shiny-color-mid:#ccc] dark:[--shiny-color-end:#fff]'
                        />
                    </div>


                    {/* Subheading with BlurText and Icon */}
                    <div className="flex justify-center items-center gap-3 mb-6">
                        <BlurText
                            text="Quick Hearing Check from Home"
                            delay={150}
                            animateBy="words"
                            direction="top"
                            className="text-3xl md:text-4xl font-bold text-foreground"
                            animationFrom={undefined}
                            animationTo={undefined}
                            onAnimationComplete={undefined}
                        />

                    </div>

                    {/* Description */}
                    <div className="space-y-3 mb-8">
                        <p className="text-xl text-muted-foreground">
                            A gentle 5–10 minute hearing screen designed for older adults.
                        </p>
                        <p className="text-lg text-muted-foreground">
                            Clear instructions, large controls.
                        </p>
                    </div>

                    {/* CTA Button */}
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            className="px-8 py-4 text-lg hover:bg-primary hover:text-white transition-all duration-300"
                            onClick={handleTakeTest}   // 👈 Redirect
                        >
                            Take a Test
                        </Button>

                    </div>
                </main>
            </section>

            {/* ===== About Section ===== */}
            <section>
                <AboutSection />
            </section>
            {/* ===== How it works section ===== */}
            <section>
                <HowItWorksSection />
            </section>
            {/* ===== Testimonials ===== */}
            <section>
                <TestimonialsSection />
            </section>
            {/* ===== footer ===== */}
            <section>
                <FooterSection />
            </section>
        </div>
    )
}