import React, { useEffect, useState } from 'react'
import { TickerEntry } from '@/lib/supabaseEntities'
import { features } from '@/lib/settings'

export default function TopBanner() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [marqueeEnabled, setMarqueeEnabled] = useState(true)

  useEffect(() => {
    const checkMarquee = async () => {
      const enabled = await features.isMarqueeEnabled()
      setMarqueeEnabled(enabled)
    }
    checkMarquee()
  }, [])

  useEffect(() => {
    if (!marqueeEnabled) return

    const fetchData = async () => {
      try {
        const tickerData = await TickerEntry.list('-display_order', 100)

        const liveEntries = tickerData
          .filter(e => e.active !== false)
          .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))

        setEntries(liveEntries.filter(e => e.text))
      } catch (error) {
        console.error('Error fetching ticker data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [marqueeEnabled])

  const defaultMessages = [
    '🎬 SmartGigs Kenya - Your gateway to creative talent',
    '🌟 Featured: Star in upcoming Nollywood productions!',
    '🎭 New casting calls for actors and voice artists',
    '📢 Production companies are hiring now - Apply today!',
    '🎬 Join our community of creative professionals'
  ]

  const displayEntries = entries.length > 0
    ? entries.map(e => ({
      text: e.text,
      link: e.link
    }))
    : defaultMessages.map(msg => ({ text: msg, link: null }))

  const tickerItems = [...displayEntries, ...displayEntries]

  const renderItem = (item, idx) => {
    if (item.link) {
      return (
        <a
          key={idx}
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 text-sm font-medium flex items-center h-full border-r border-gray-300 last:border-r-0 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          {item.text}
        </a>
      )
    }

    return (
      <div
        key={idx}
        className="px-8 text-sm font-medium flex items-center h-full border-r border-gray-300 last:border-r-0"
      >
        {item.text}
      </div>
    )
  }

  if (loading) {
    return null
  }

  if (!marqueeEnabled) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-[40px] bg-[#F5F5F5] text-[#4A4A4A] z-50 overflow-hidden border-b border-gray-200">
      <div className="flex items-center h-full">
        <style>{`
          @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .scroll-container {
            animation: scroll ${40 + displayEntries.length * 3}s linear infinite
          }
          .scroll-container:hover {
            animation-play-state: paused
          }
        `}</style>
        <div className="scroll-container flex whitespace-nowrap">
          {tickerItems.map((item, idx) => renderItem(item, idx))}
        </div>
      </div>
    </div>
  )
}