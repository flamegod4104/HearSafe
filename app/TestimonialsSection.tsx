// components/TestimonialsSection.tsx
"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Margaret Johnson",
    age: 72,
    review:
      "The test was so easy to follow. The instructions were clear and the results helped me understand my hearing better.",
    initials: "MJ",
  },
  {
    name: "Robert Chen",
    age: 68,
    review:
      "I was nervous about taking a hearing test online, but this was gentle and straightforward. Highly recommend.",
    initials: "RC",
  },
  {
    name: "Dorothy Williams",
    age: 75,
    review:
      "Finally, a hearing test I could take at my own pace. The large buttons and clear text made it perfect for me.",
    initials: "DW",
  },
  {
    name: "James Carter",
    age: 70,
    review:
      "Quick, simple, and very easy to use. It gave me peace of mind about my hearing health.",
    initials: "JC",
  },
  {
    name: "Linda Martinez",
    age: 67,
    review:
      "The test results were easy to understand, and I felt supported every step of the way.",
    initials: "LM",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 px-6 text-center overflow-hidden">
      <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
      <p className="text-muted-foreground mb-12">
        Trusted by thousands of older adults and their families
      </p>

      <div className="relative w-full overflow-hidden">
        <motion.div
          className="flex gap-6"
          animate={{ x: ["0%", "-100%"] }}
          transition={{
            repeat: Infinity,
            duration: 20,
            ease: "linear",
          }}
        >
          {[...testimonials, ...testimonials].map((t, index) => (
            <div
              key={index}
              className="bg-card/80 rounded-xl p-6 shadow-md border border-border min-w-[300px] max-w-[350px] flex-shrink-0 text-left"
            >
              <div className="flex mb-2">{"★".repeat(5)}</div>
              <p className="text-muted-foreground mb-4">"{t.review}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold">
                  {t.initials}
                </div>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">Age {t.age}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
