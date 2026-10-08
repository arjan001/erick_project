import React from 'react'
import { Link } from 'react-router-dom'
import Navbar from '@/components/landing/backstage/Navbar'
import Footer from '@/components/landing/backstage/Footer'
import ChatWidget from '@/components/landing/backstage/ChatWidget'
import SEOMetaTags from '@/components/SEOMetaTags'

/** Shared page frame for the shop: SEO tags + navbar + footer. */
export default function ShopShell({ title, description, children }) {
  return (
    <div className="min-h-screen bg-[#F5F3EF]">
      <SEOMetaTags title={title} description={description} ogType="website" />
      <Navbar />
      {children}
      <Footer />
      <ChatWidget />
    </div>
  )
}

/** Prompt shown on cart / wishlist / checkout when nobody is signed in. */
export function SignInPrompt({ what }) {
  return (
    <div className="rounded-2xl bg-white p-10 text-center">
      <p className="text-base font-semibold text-black">Sign in to {what}</p>
      <p className="mt-1 text-sm text-black/50">Your cart and wishlist are saved against your account.</p>
      <Link
        to="/SignIn"
        className="mt-5 inline-block rounded-full bg-[#4F46E5] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#4338CA]"
      >
        Sign in
      </Link>
    </div>
  )
}
