import React, { useState } from 'react'
import { Check, MessageCircle } from 'lucide-react'
import SEOMetaTags from '@/components/SEOMetaTags'

const steps = ['Plan', 'Account', 'Payment', 'Review']

const plans = [
  {
    name: 'YEARLY',
    badge: 'WELCOME OFFER',
    oldPrice: '$16.66/mo',
    price: '$7.08/mo',
    sub: 'Billed yearly',
    borderColor: '#5a5cf2',
    btnBg: '#5a5cf2',
    checkStyle: 'faint',
  },
  {
    name: '6-MONTH',
    badge: null,
    oldPrice: null,
    price: '$19.99/mo',
    sub: 'Billed bi-annually',
    borderColor: '#000000',
    btnBg: '#000000',
    checkStyle: 'bold',
  },
  {
    name: 'MONTHLY',
    badge: null,
    oldPrice: null,
    price: '$18.95/mo',
    pricePrefix: 'First month just',
    priceSuffix: '($24.95 after the first month)',
    sub: 'Billed monthly',
    borderColor: '#D1D1D1',
    btnBg: '#8D8D8D',
    checkStyle: 'faint',
  },
]

export default function PricingPage() {
  const [selected, setSelected] = useState(0)

  return (
    <div className="min-h-screen bg-white">
      <SEOMetaTags
        title="Pricing — Eric Rabar"
        description="Select a plan to get started with Eric Rabar."
        keywords="pricing, plans, subscription, eric rabar"
        ogType="website"
        schemaType="WebPage"
        schemaData={{ name: 'Pricing', description: 'Choose your plan' }}
      />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <span className="text-lg font-extrabold uppercase tracking-tight text-black">Eric Rabar</span>
        <span className="hidden text-sm italic text-gray-500 sm:block">
          The most trusted name in casting since 1960.
        </span>
      </header>

      {/* Badge */}
      <div className="flex justify-center px-4 pt-4 pb-2">
        <span className="rounded-full bg-[#eef6fb] px-5 py-2 text-sm font-medium text-black">
          195,348 creators looking for talent
        </span>
      </div>

      {/* Title */}
      <h1 className="px-4 pt-6 text-center font-serif text-3xl font-bold text-black md:text-4xl">
        Select a plan to get started
      </h1>

      {/* Progress bar */}
      <div className="mx-auto max-w-2xl px-4 pt-10 pb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={step} className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  i === 0 ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {i === 0 ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  i === 0 ? 'font-bold text-black' : 'text-gray-400'
                }`}
              >
                {i + 1}. {step}
              </span>
              {i < steps.length - 1 && (
                <div
                  className={`absolute mt-3.5 h-0.5 ${
                    i === 0 ? 'bg-gray-300' : 'bg-gray-200'
                  }`}
                  style={{ width: '25%', marginLeft: '50%' }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pricing cards */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className="flex flex-col overflow-hidden rounded-2xl border-2 bg-white"
              style={{ borderColor: plan.borderColor }}
            >
              {/* Badge header */}
              {plan.badge ? (
                <div className="bg-[#5a5cf2] px-4 py-2 text-center text-xs font-bold uppercase tracking-wide text-white">
                  {plan.badge}
                </div>
              ) : (
                <div className="h-8" />
              )}

              {/* Check icon */}
              <div className="flex justify-center pt-6">
                {plan.checkStyle === 'bold' ? (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0d9488]">
                    <Check className="h-5 w-5 text-white" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-200">
                    <Check className="h-5 w-5 text-gray-300" />
                  </div>
                )}
              </div>

              {/* Plan name */}
              <h3 className="px-4 pt-4 text-center text-sm font-bold uppercase tracking-wide text-black">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="px-4 py-4 text-center">
                {plan.oldPrice && (
                  <p className="text-sm text-gray-400 line-through">{plan.oldPrice}</p>
                )}
                {plan.pricePrefix && (
                  <p className="text-xs text-gray-500">{plan.pricePrefix}</p>
                )}
                <p className="font-serif text-2xl font-bold text-black">{plan.price}</p>
                {plan.priceSuffix && (
                  <p className="mt-1 text-xs text-gray-400">{plan.priceSuffix}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">{plan.sub}</p>
              </div>

              {/* Button */}
              <div className="px-4 pb-6">
                <button
                  onClick={() => setSelected(i)}
                  className="w-full rounded-full py-3 text-sm font-semibold text-white transition-transform hover:scale-105"
                  style={{ backgroundColor: plan.btnBg }}
                >
                  Select Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* People who cast with us */}
      <div className="px-4 py-12 text-center">
        <p className="text-sm font-medium text-gray-500">People who cast with us</p>
        <div className="mt-6 flex items-center justify-center gap-12">
          <span className="text-2xl font-bold text-gray-300">Disney</span>
          <span className="text-2xl font-bold text-gray-300">ABC</span>
        </div>
        <p className="mt-8 text-sm text-gray-500">
          Looking to cast talent?{' '}
          <a href="#" className="font-medium text-[#5a5cf2] hover:underline">
            Click here to get started.
          </a>
        </p>
      </div>

      {/* Floating chat widget */}
      <button className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#5a5cf2] shadow-lg transition-transform hover:scale-110">
        <MessageCircle className="h-6 w-6 text-white" />
      </button>
    </div>
  )
}
