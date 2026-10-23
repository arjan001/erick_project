import React, { useState, useEffect } from 'react'
import { Plus, Search, Trash2, Download, Mail, Users, TrendingUp, X, Edit } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase'
import DataTable from '@/components/admin/DataTable'

export default function AdminMailingListPage() {
  const { success, error: toastError } = useToast()
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [editingSubscriber, setEditingSubscriber] = useState(null)
  const [form, setForm] = useState({ email: '', name: '', status: 'active', source: 'admin' })

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('mailing_list_subscribers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubscribers(data || [])
    } catch (err) {
      console.error('Error fetching subscribers:', err)
      toastError('Error', 'Failed to load subscribers')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!form.email.trim()) {
      toastError('Error', 'Email is required')
      return
    }
    try {
      if (editingSubscriber) {
        const { error } = await supabase
          .from('mailing_list_subscribers')
          .update(form)
          .eq('id', editingSubscriber.id)
        if (error) throw error
        success('Success', 'Subscriber updated')
      } else {
        const { error } = await supabase
          .from('mailing_list_subscribers')
          .insert(form)
        if (error) throw error
        success('Success', 'Subscriber added')
      }
      setShowAdd(false)
      setEditingSubscriber(null)
      setForm({ email: '', name: '', status: 'active', source: 'admin' })
      fetchSubscribers()
    } catch (err) {
      console.error('Error saving subscriber:', err)
      toastError('Error', 'Failed to save subscriber')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this subscriber?')) return
    try {
      const { error } = await supabase
        .from('mailing_list_subscribers')
        .delete()
        .eq('id', id)
      if (error) throw error
      success('Success', 'Subscriber removed')
      fetchSubscribers()
    } catch (err) {
      console.error('Error deleting subscriber:', err)
      toastError('Error', 'Failed to remove subscriber')
    }
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

  const stats = [
    { label: 'Total Subscribers', value: subscribers.length, icon: Users, color: 'text-indigo-600' },
    { label: 'Active', value: subscribers.filter(s => s.status === 'active').length, icon: Mail, color: 'text-green-600' },
    {
      label: 'This Month', value: subscribers.filter(s => {
        const d = new Date(s.created_at)
        const now = new Date()
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }).length, icon: TrendingUp, color: 'text-blue-600'
    },
  ]

  const columns = [
    { key: 'email', label: 'Email', sortable: true, filterable: true },
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'source', label: 'Source', sortable: true, filterable: true },
    {
      key: 'status', label: 'Status', sortable: true, filterable: true, render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {value || 'active'}
        </span>
      )
    },
    { key: 'created_at', label: 'Date', sortable: true, filterable: false, render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
  ]

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mailing List</h1>
          <p className="text-sm text-gray-500">Manage email subscribers captured from the website</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={() => { setEditingSubscriber(null); setForm({ email: '', name: '', status: 'active', source: 'admin' }); setShowAdd(true); }} className="bg-black text-white hover:bg-gray-800">
            <Plus className="h-4 w-4 mr-2" /> Add Subscriber
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-50">
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-6">
          <DataTable
            data={subscribers}
            columns={columns}
            searchable={true}
            exportable={true}
            pagination={true}
            pageSize={10}
            actions={(row) => (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingSubscriber(row); setForm(row); setShowAdd(true); }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingSubscriber ? 'Edit Subscriber' : 'Add Subscriber'}</h2>
              <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label>Name (optional)</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="active">Active</option>
                  <option value="unsubscribed">Unsubscribed</option>
                  <option value="bounced">Bounced</option>
                </select>
              </div>
              <div>
                <Label>Source</Label>
                <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="admin">Admin</option>
                  <option value="website">Website</option>
                  <option value="landing">Landing Page</option>
                  <option value="footer">Footer</option>
                  <option value="import">Import</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800">{editingSubscriber ? 'Update' : 'Add'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
