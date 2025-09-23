// components/AboutSection.tsx
"use client";

import { Mouse, Clock, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      staggerChildren: 0.2, // ✅ keep this
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }, // ✅ removed invalid ease
  },
};


const AboutSection = () => {
  return (
    <motion.section
      className="py-16 px-6 text-center"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <h2 className="text-4xl font-bold mb-4">How We Help You Hear Better</h2>
      <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
        Our hearing screening is designed with older adults in mind, providing clear guidance every step of the way.
      </p>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <motion.div
          variants={cardVariants}
          className="bg-card/80 rounded-xl p-6 border border-border shadow-md flex flex-col items-center text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-white/30 hover:border-white/50"
        >
          <div className="mb-4 transition-all duration-300 ease-in-out hover:scale-125 hover:shadow-lg hover:shadow-white/30">
            <Mouse className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Quick Hearing Screen</h3>
          <p className="text-muted-foreground mb-4">
            A gentle 5-10 minute test designed specifically for older adults
            with clear, simple instructions.
          </p>
          <Button variant="outline" className="hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-black">
            Start Test
          </Button>
        </motion.div>

        {/* Card 2 - Clock */}
        <motion.div
          variants={cardVariants}
          className="bg-card/80 rounded-xl p-6 border border-border shadow-md flex flex-col items-center text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-white/30 hover:border-white/50"
        >
          <div className="mb-4 transition-all duration-300 ease-in-out hover:scale-125 hover:shadow-lg hover:shadow-white/30">
            <Clock className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Time Efficient</h3>
          <p className="text-muted-foreground mb-4">
            Get results in minutes without lengthy appointments or complex procedures.
          </p>
          <Button variant="outline" className="hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-black">
            Learn More
          </Button>
        </motion.div>

        {/* Card 3 - Shield */}
        <motion.div
          variants={cardVariants}
          className="bg-card/80 rounded-xl p-6 border border-border shadow-md flex flex-col items-center text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-white/30 hover:border-white/50"
        >
          <div className="mb-4 transition-all duration-300 ease-in-out hover:scale-125 hover:shadow-lg hover:shadow-white/30">
            <Shield className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
          <p className="text-muted-foreground mb-4">
            Your hearing data is kept confidential with enterprise-grade security measures.
          </p>
          <Button variant="outline" className="hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-black">
            View Privacy
          </Button>
        </motion.div>

        {/* Card 4 - Users */}
        <motion.div
          variants={cardVariants}
          className="bg-card/80 rounded-xl p-6 border border-border shadow-md flex flex-col items-center text-center transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-white/30 hover:border-white/50"
        >
          <div className="mb-4 transition-all duration-300 ease-in-out hover:scale-125 hover:shadow-lg hover:shadow-white/30">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
          <p className="text-muted-foreground mb-4">
            Connect with hearing professionals for guidance and next steps after your screening.
          </p>
          <Button variant="outline" className="hover:bg-primary hover:text-white dark:hover:bg-white dark:hover:text-black">
            Get Support
          </Button>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default AboutSection;
