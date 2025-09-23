"use client"

import { motion } from "framer-motion"
import { CheckCircle, Headphones, FileText, Share2 } from "lucide-react"

export function HowItWorksSection() {
  const steps = [
    {
      step: "Step 1",
      title: "Simple Setup",
      description: "Find a quiet room and put on headphones. We'll guide you through a quick volume check to ensure everything is working properly.",
      icon: <CheckCircle className="w-8 h-8" />,
    },
    {
      step: "Step 2",
      title: "Take the Test",
      description: "Listen for tones and follow simple instructions. The test adapts to your responses and takes just 5-10 minutes to complete.",
      icon: <Headphones className="w-8 h-8" />,
    },
    {
      step: "Step 3",
      title: "Get Your Results",
      description: "Receive an easy-to-understand report with your hearing screening results and personalized recommendations.",
      icon: <FileText className="w-8 h-8" />,
    },
    {
      step: "Step 4",
      title: "Share with Care Team",
      description: "Print or email your results to share with family members, doctors, or hearing care professionals.",
      icon: <Share2 className="w-8 h-8" />,
    },
  ]

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">How It Works</h2>
        <p className="text-lg text-muted-foreground mb-12">
          Four simple steps to check your hearing from the comfort of your home
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-6 p-6 bg-card/80 rounded-xl shadow-lg hover:shadow-xl hover:shadow-primary/40 transition-all"
            >
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                {step.icon}
              </div>
              <div className="text-left">
                <span className="text-sm font-semibold text-primary">{step.step}</span>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground mt-2">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
