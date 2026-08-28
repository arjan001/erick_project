import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { value: '12,000+', label: 'Creatives' },
  { value: '500+', label: 'Productions' },
  { value: '200+', label: 'Cities' },
  { value: '50+', label: 'Disciplines' },
];

export default function Stats() {
  return (
    <section className="border-b border-white/10 bg-[#0A0A0A] py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl font-bold tracking-tight text-[#C9A962] md:text-5xl">
                {stat.value}
              </div>
              <div className="mt-2 text-sm font-medium uppercase tracking-widest text-gray-500">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
