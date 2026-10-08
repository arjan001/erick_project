import React from 'react'
import { CreditCard, Lock } from 'lucide-react'

export const emptyCard = {
  name: '',
  number: '',
  expiry: '',
  cvv: '',
}

export function validateCard(card) {
  if (!card.name.trim()) return 'Enter the cardholder name.'
  const digits = card.number.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return 'Enter a valid card number.'
  if (!/^\d{2}\/\d{2}$/.test(card.expiry)) return 'Enter expiry as MM/YY.'
  if (!card.cvv || card.cvv.length < 3) return 'Enter the CVV.'
  return null
}

export function detectCardBrand(number) {
  const digits = number.replace(/\D/g, '')
  if (/^4/.test(digits)) return 'Visa'
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) return 'Mastercard'
  if (/^3[47]/.test(digits)) return 'American Express'
  if (/^6(?:011|5)/.test(digits)) return 'Discover'
  return 'Unknown'
}

export default function CardForm({ value, onChange }) {
  const formatNumber = (v) => {
    const digits = v.replace(/\D/g, '')
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
  }

  const formatExpiry = (v) => {
    const digits = v.replace(/\D/g, '')
    if (digits.length >= 2) {
      return digits.slice(0, 2) + '/' + digits.slice(2, 4)
    }
    return digits
  }

  const inputCls =
    'w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black/35 focus:border-[#6366f1] focus:outline-none focus:ring-2 focus:ring-[#6366f1]/20'

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-semibold text-black/60">Cardholder name</label>
        <input
          type="text"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="Name on card"
          className={inputCls}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-semibold text-black/60">Card number</label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
          <input
            type="text"
            value={formatNumber(value.number)}
            onChange={(e) => onChange({ ...value, number: e.target.value })}
            placeholder="1234 5678 9012 3456"
            className={inputCls + ' pl-9'}
            maxLength={19}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">Expiry (MM/YY)</label>
          <input
            type="text"
            value={formatExpiry(value.expiry)}
            onChange={(e) => onChange({ ...value, expiry: e.target.value })}
            placeholder="MM/YY"
            className={inputCls}
            maxLength={5}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-black/60">CVV</label>
          <div className="relative">
            <input
              type="password"
              value={value.cvv}
              onChange={(e) => onChange({ ...value, cvv: e.target.value })}
              placeholder="•••"
              className={inputCls}
              maxLength={4}
            />
            <Lock className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/30" />
          </div>
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-[10px] text-black/40">
        <Lock className="h-3 w-3" />
        Your card details are encrypted and secure.
      </p>
    </div>
  )
}
