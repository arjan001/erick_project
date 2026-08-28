import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/shared/utils/routing';
import {
  Film,
  Video,
  Music,
  Palette,
  Camera,
  Scissors,
  Wand2,
  Mic,
  Clapperboard,
  Monitor,
} from 'lucide-react';

const disciplines = [
  { name: 'Directing', icon: Clapperboard, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80' },
  { name: 'Cinematography', icon: Camera, image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80' },
  { name: 'Editing', icon: Scissors, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80' },
  { name: 'VFX & 3D', icon: Wand2, image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&q=80' },
  { name: 'Sound Design', icon: Mic, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80' },
  { name: 'Color Grading', icon: Monitor, image: 'https://images.unsplash.com/photo-1579547621113-c130c5abfa72?w=600&q=80' },
  { name: 'Production Design', icon: Palette, image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80' },
  { name: 'Music & Score', icon: Music, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&q=80' },
  { name: 'Commercials', icon: Film, image: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=600&q=80' },
  { name: 'Documentary', icon: Video, image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&q=80' },
];

export default function Disciplines() {
  return (
    <section className="bg-[#0F0F0F] py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
            Browse by Discipline
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            From concept to final cut — find specialists across every craft.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {disciplines.map((d, i) => {
            const Icon = d.icon;
            return (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link
                  to={createPageUrl('JobBoard')}
                  className="group relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#141414] transition-all hover:border-[#C9A962]/30"
                >
                  <Icon className="mb-3 h-7 w-7 text-gray-600 transition-colors group-hover:text-[#C9A962]" />
                  <span className="text-sm font-medium text-gray-400 transition-colors group-hover:text-white">
                    {d.name}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
