import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Users, Clapperboard } from 'lucide-react'

const steps = [
  {
    icon: FileText,
    title: 'Post a Project',
    description: 'Describe your production — budget, timeline, discipline. We match you with vetted talent.',
  },
  {
    icon: Users,
    title: 'Get Matched',
    description: 'Browse curated profiles, review portfolios, and connect with creators who fit your vision.',
  },
  {
    icon: Clapperboard,
    title: 'Start Creating',
    description: 'Hire, collaborate, and manage your production — all in one place. From brief to final cut.',
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-[#0A0A0A] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            How It Works
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            Three steps from idea to execution.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#C9A962]/20 bg-[#C9A962]/5">
                  <Icon className="h-7 w-7 text-[#C9A962]" />
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-widest text-[#C9A962]">
                  Step {i + 1}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-white">{step.title}</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-gray-500">
                  {step.description}
                </p>
                {i < steps.length - 1 && (
                  <div className="absolute top-8 -right-4 hidden h-px w-8 bg-white/10 md:block" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
