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


export default function HomePage() {
    const router = useRouter();
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
                            onClick={() => router.push("/login")}   // 👈 Redirect
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