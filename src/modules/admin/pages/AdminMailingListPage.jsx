import React, { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Download, Mail, Users, TrendingUp, X } from 'lucide-react'
import { MailingListSubscriber } from '@/lib/supabaseEntities'

const STORAGE_KEY = 'smartgigs_mailing_list'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return []; }
}

function saveToStorage(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export default function AdminMailingListPage() {
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      const rows = await MailingListSubscriber.list('-created_at', 500)
      if (rows && rows.length > 0) {
        setSubscribers(rows)
      } else {
        setSubscribers(loadFromStorage())
      }
    } catch {
      setSubscribers(loadFromStorage())
    }
    setLoading(false)
  }

  const handleAdd = async () => {
    if (!newEmail) return
    const sub = {
      id: Date.now().toString(),
      email: newEmail,
      name: newName || '',
      source: 'admin',
      status: 'active',
      created_at: new Date().toISOString(),
    }
    try {
      await MailingListSubscriber.create({ email: newEmail, name: newName, source: 'admin', status: 'active' })
    } catch { /* fallback to local */ }
    const updated = [sub, ...subscribers]
    setSubscribers(updated)
    saveToStorage(updated)
    setNewEmail('')
    setNewName('')
    setShowAdd(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this subscriber?')) return
    try { await MailingListSubscriber.delete(id); } catch { /* ignore */ }
    const updated = subscribers.filter(s => s.id !== id)
    setSubscribers(updated)
    saveToStorage(updated)
  }

  const handleExport = () => {
    const csv = ['Email,Name,Source,Status,Date']
    subscribers.forEach(s => {
      csv.push(`${s.email},${s.name || ''},${s.source || ''},${s.status || ''},${s.created_at || ''}`)
    })
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mailing-list.csv'
    a.click()
  }

  const filtered = subscribers.filter(s =>
    (s.email || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  )

  const stats = [
    { label: 'Total Subscribers', value: subscribers.length, icon: Users, color: 'text-indigo-600' },
    { label: 'Active', value: subscribers.filter(s => s.status === 'active').length, icon: Mail, color: 'text-green-600' },
    { label: 'This Month', value: subscribers.filter(s => {
      const d = new Date(s.created_at)
      const now = new Date()
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length, icon: TrendingUp, color: 'text-blue-600' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900 md:text-2xl">Mailing List</h1>
          <p className="text-sm text-gray-500">Manage email subscribers captured from the website</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> Add Subscriber
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search subscribers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-100 bg-gray-50">
            <tr>
              <th className="px-4 py-3 font-semibold text-gray-600">Email</th>
              <th className="hidden px-4 py-3 font-semibold text-gray-600 sm:table-cell">Name</th>
              <th className="hidden px-4 py-3 font-semibold text-gray-600 md:table-cell">Source</th>
              <th className="hidden px-4 py-3 font-semibold text-gray-600 md:table-cell">Status</th>
              <th className="hidden px-4 py-3 font-semibold text-gray-600 lg:table-cell">Date</th>
              <th className="px-4 py-3 font-semibold text-gray-600 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No subscribers found</td></tr>
            ) : (
              filtered.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{sub.email}</td>
                  <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">{sub.name || '—'}</td>
                  <td className="hidden px-4 py-3 text-gray-500 md:table-cell">
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{sub.source || 'website'}</span>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {sub.status || 'active'}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 lg:table-cell">
                    {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(sub.id)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Add Subscriber</h2>
              <button onClick={() => setShowAdd(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Name (optional)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
              />
              <button onClick={handleAdd} className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                Add Subscriber
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
