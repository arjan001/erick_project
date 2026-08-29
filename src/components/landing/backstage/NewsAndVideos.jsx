import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const news = [
  { thumb: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=140&fit=crop', title: "How to Get Cast on 'Holding Court'" },
  { thumb: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=140&fit=crop', title: "Now Casting: Earn $16,500 for a Fantasy-Adventure Film + 3..." },
  { thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=140&fit=crop', title: "I Spent 13 Years Watching Actors. Here's What the Best..." },
  { thumb: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=200&h=140&fit=crop', title: "Love 'Spider-Man: Brand New Day'? Apply to These Superhero..." },
];

const videos = [
  { thumb: 'https://images.unsplash.com/photo-1574732669271-a745c0e2b0e2?w=400&h=225&fit=crop', title: "In the Room With 'Love Story' Casting Directors Courtney Bright + Nicole Daniels", duration: '15:35' },
  { thumb: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400&h=225&fit=crop', title: "Backstage With: Chase Stokes on 'Stranger Things' + the Final Season of 'Outer Banks'", duration: '19:54' },
  { thumb: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=400&h=225&fit=crop', title: "Andrew Garfield + Claire Foy on Acting, Imagination, and 'The Magic Faraway Tree'", duration: '04:51' },
  { thumb: 'https://images.unsplash.com/photo-1502685104226-ee32348fef25?w=400&h=225&fit=crop', title: "Backstage with: Rufus Sewell on 'The Diplomat' + His Way into Hal Wyler", duration: '16:00' },
];

export default function NewsAndVideos() {
  return (
    <section className="bg-[#F5F3EF] py-16 md:py-24">
      <div className="mx-auto max-w-[1400px] px-4 lg:px-8">
        {/* News */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">Latest industry news &amp; advice</h2>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black/5">
            <ChevronRight className="h-4 w-4 text-black" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {news.map((n, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex cursor-pointer gap-3 rounded-2xl bg-white p-3 shadow-sm hover:shadow-md"
            >
              <img src={n.thumb} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              <p className="text-sm font-semibold leading-snug text-black">{n.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Videos */}
        <div className="mt-14 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">Latest videos</h2>
          <button className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white hover:bg-black/5">
            <ChevronRight className="h-4 w-4 text-black" />
          </button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((v, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="cursor-pointer"
            >
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
                <img src={v.thumb} alt="" className="h-full w-full object-cover opacity-80" />
                <div className="absolute left-3 top-3 text-xs font-bold uppercase tracking-wide text-white/90">
                  Backstage
                </div>
                <div className="absolute bottom-3 right-3 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
                  {v.duration}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                    <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm font-semibold leading-snug text-black">{v.title}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button className="rounded-full bg-[#4F46E5] px-8 py-3.5 text-sm font-semibold text-white hover:bg-[#4338CA]">
            View All Resources
          </button>
        </div>
      </div>
    </section>
  );
}
