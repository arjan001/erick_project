import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import RoleToggle from './RoleToggle'

const cards = [
  { title: "Rufus Sewell on 'The Diplomat,' Delivering...", img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop' },
  { title: "Harrison Ford Doesn't Want to Think About It", img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&h=400&fit=crop' },
  { title: "Sarah Pidgeon's Hollywood 'Love Story' Is Just...", img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=400&fit=crop' },
  { title: "Riz Ahmed Talks 'Bait,' 'Digger,' and the...", img: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=600&h=400&fit=crop' },
]

export default function InspiringPerformers() {
  const [role, setRole] = useState('talent')
  const [scrollIdx, setScrollIdx] = useState(0)

  const scroll = (dir) => {
    const container = document.getElementById('performers-scroll')
    if (!container) return
    container.scrollBy({ left: dir * 360, behavior: 'smooth' })
    setScrollIdx((s) => Math.max(0, Math.min(cards.length - 1, s + dir)))
  }

  return (
    <section className="bg-[#F5F3EF] py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        <div className="flex justify-center">
          <RoleToggle active={role} onChange={setRole} />
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-black/70">Fuel your ambition. Sharpen your skills.</p>
          <h2 className="mt-2 font-serif text-3xl font-bold text-black md:text-5xl">
            Inspiring <span className="text-[#4F46E5]">performers</span> since 1960
          </h2>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black">Exclusive celebrity interviews</h3>
          <div className="flex gap-2">
            <button
              onClick={() => scroll(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black/5"
            >
              <ChevronLeft className="h-4 w-4 text-black" />
            </button>
            <button
              onClick={() => scroll(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black/5"
            >
              <ChevronRight className="h-4 w-4 text-black" />
            </button>
          </div>
        </div>

        {/* Cards */}
        <div
          id="performers-scroll"
          className="mt-6 flex gap-5 overflow-x-auto pb-4 [scrollbar-width:thin]"
        >
          {cards.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative h-64 w-[300px] shrink-0 overflow-hidden rounded-2xl"
            >
              <img src={c.img} alt={c.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 p-4">
                <p className="text-sm font-semibold leading-snug text-white">{c.title}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
