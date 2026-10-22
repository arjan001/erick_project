/**
 * Admin Newsletter Page
 * Manage newsletter subscribers, campaigns, and templates
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Mail, Users, Send, FileText, Plus, Trash2, Edit, CheckCircle, AlertCircle, Loader2, Calendar, Eye, BarChart3, Copy, RefreshCw, X } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { supabase } from '@/lib/supabase'
import DataTable from '@/components/admin/DataTable'

export default function AdminNewsletterPage() {
  const { success, error: toastError } = useToast()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('subscribers')

  // Subscribers
  const [subscribers, setSubscribers] = useState([])
  const [showSubscriberModal, setShowSubscriberModal] = useState(false)
  const [editingSubscriber, setEditingSubscriber] = useState(null)
  const [subscriberForm, setSubscriberForm] = useState({ email: '', status: 'active', source: 'manual' })

  // Campaigns
  const [campaigns, setCampaigns] = useState([])
  const [showCampaignModal, setShowCampaignModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [campaignForm, setCampaignForm] = useState({ subject: '', content: '' })

  // Templates
  const [templates, setTemplates] = useState([])
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [templateForm, setTemplateForm] = useState({ name: '', description: '', category: 'general', subject: '', html_content: '', text_content: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [subsData, campData, tempData] = await Promise.all([
        supabase.from('mailing_list').select('*').order('created_at', { ascending: false }),
        supabase.from('newsletter_campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('newsletter_templates').select('*').order('name')
      ])

      setSubscribers(subsData.data || [])
      setCampaigns(campData.data || [])
      setTemplates(tempData.data || [])
    } catch (err) {
      console.error('Failed to load newsletter data:', err)
      toastError('Error', 'Failed to load newsletter data')
    } finally {
      setLoading(false)
    }
  }

  // Subscriber CRUD
  const handleSaveSubscriber = async () => {
    if (!subscriberForm.email.trim()) {
      toastError('Error', 'Email is required')
      return
    }
    try {
      if (editingSubscriber) {
        const { error } = await supabase
          .from('mailing_list')
          .update(subscriberForm)
          .eq('id', editingSubscriber.id)
        if (error) throw error
        success('Success', 'Subscriber updated')
      } else {
        const { error } = await supabase
          .from('mailing_list')
          .insert({ ...subscriberForm, subscribed_at: new Date().toISOString() })
        if (error) throw error
        success('Success', 'Subscriber added')
      }
      setShowSubscriberModal(false)
      setEditingSubscriber(null)
      setSubscriberForm({ email: '', status: 'active', source: 'manual' })
      loadData()
    } catch (err) {
      console.error('Error saving subscriber:', err)
      toastError('Error', 'Failed to save subscriber')
    }
  }

  const handleDeleteSubscriber = async (id) => {
    if (!confirm('Delete this subscriber?')) return
    try {
      const { error } = await supabase
        .from('mailing_list')
        .delete()
        .eq('id', id)
      if (error) throw error
      success('Success', 'Subscriber removed')
      loadData()
    } catch (err) {
      console.error('Error deleting subscriber:', err)
      toastError('Error', 'Failed to remove subscriber')
    }
  }

  // Campaign CRUD
  const handleSaveCampaign = async () => {
    if (!campaignForm.subject.trim()) {
      toastError('Error', 'Subject is required')
      return
    }
    try {
      const data = campaignForm
      if (editingCampaign) {
        const { error } = await supabase
          .from('newsletter_campaigns')
          .update(data)
          .eq('id', editingCampaign.id)
        if (error) throw error
        success('Success', 'Campaign updated')
      } else {
        const { error } = await supabase
          .from('newsletter_campaigns')
          .insert(data)
        if (error) throw error
        success('Success', 'Campaign created')
      }
      setShowCampaignModal(false)
      setEditingCampaign(null)
      setCampaignForm({ subject: '', content: '' })
      loadData()
    } catch (err) {
      console.error('Error saving campaign:', err)
      toastError('Error', 'Failed to save campaign')
    }
  }

  const handleDeleteCampaign = async (id) => {
    if (!confirm('Delete this campaign?')) return
    try {
      const { error } = await supabase
        .from('newsletter_campaigns')
        .delete()
        .eq('id', id)
      if (error) throw error
      success('Success', 'Campaign removed')
      loadData()
    } catch (err) {
      console.error('Error deleting campaign:', err)
      toastError('Error', 'Failed to remove campaign')
    }
  }

  // Template CRUD
  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim()) {
      toastError('Error', 'Template name is required')
      return
    }
    try {
      if (editingTemplate) {
        const { error } = await supabase
          .from('newsletter_templates')
          .update(templateForm)
          .eq('id', editingTemplate.id)
        if (error) throw error
        success('Success', 'Template updated')
      } else {
        const { error } = await supabase
          .from('newsletter_templates')
          .insert(templateForm)
        if (error) throw error
        success('Success', 'Template created')
      }
      setShowTemplateModal(false)
      setEditingTemplate(null)
      setTemplateForm({ name: '', description: '', category: 'general', subject: '', html_content: '', text_content: '' })
      loadData()
    } catch (err) {
      console.error('Error saving template:', err)
      toastError('Error', 'Failed to save template')
    }
  }

  const handleDeleteTemplate = async (id) => {
    if (!confirm('Delete this template?')) return
    try {
      const { error } = await supabase
        .from('newsletter_templates')
        .delete()
        .eq('id', id)
      if (error) throw error
      success('Success', 'Template removed')
      loadData()
    } catch (err) {
      console.error('Error deleting template:', err)
      toastError('Error', 'Failed to remove template')
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  const activeSubscribers = subscribers.filter(s => s.status === 'active').length
  const totalSent = campaigns.reduce((sum, c) => sum + (c.total_recipients || 0), 0)

  const subscriberColumns = [
    { key: 'email', label: 'Email', sortable: true, filterable: true },
    {
      key: 'status', label: 'Status', sortable: true, filterable: true, render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {value}
        </span>
      )
    },
    { key: 'source', label: 'Source', sortable: true, filterable: true },
    { key: 'subscribed_at', label: 'Subscribed', sortable: true, filterable: false, render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
  ]

  const campaignColumns = [
    { key: 'subject', label: 'Subject', sortable: true, filterable: true },
    { key: 'total_recipients', label: 'Recipients', sortable: true, filterable: false },
    { key: 'opened', label: 'Opened', sortable: true, filterable: false },
    { key: 'clicked', label: 'Clicked', sortable: true, filterable: false },
    { key: 'sent_at', label: 'Sent', sortable: true, filterable: false, render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
    { key: 'created_at', label: 'Created', sortable: true, filterable: false, render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
  ]

  const templateColumns = [
    { key: 'name', label: 'Name', sortable: true, filterable: true },
    { key: 'category', label: 'Category', sortable: true, filterable: true },
    { key: 'description', label: 'Description', sortable: false, filterable: false },
    { key: 'subject', label: 'Subject', sortable: true, filterable: false },
    { key: 'created_at', label: 'Created', sortable: true, filterable: false, render: (value) => value ? new Date(value).toLocaleDateString() : '-' },
  ]

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Newsletter Management</h1>
        <p className="text-gray-600 text-sm mt-1">Manage subscribers, campaigns, and email templates</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeSubscribers}</div>
                <div className="text-xs text-gray-500">Active Subscribers</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Send className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalSent}</div>
                <div className="text-xs text-gray-500">Emails Sent</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
                <div className="text-xs text-gray-500">Templates</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 rounded-lg">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{campaigns.length}</div>
                <div className="text-xs text-gray-500">Campaigns</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Newsletter Subscribers
                  </CardTitle>
                  <CardDescription>Manage your email subscriber list</CardDescription>
                </div>
                <Button onClick={() => { setEditingSubscriber(null); setSubscriberForm({ email: '', status: 'active', source: 'manual' }); setShowSubscriberModal(true); }} className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" /> Add Subscriber
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={subscribers}
                columns={subscriberColumns}
                searchable={true}
                exportable={true}
                pagination={true}
                pageSize={10}
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingSubscriber(row); setSubscriberForm(row); setShowSubscriberModal(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteSubscriber(row.id); }}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Email Campaigns
                  </CardTitle>
                  <CardDescription>Create and manage email campaigns</CardDescription>
                </div>
                <Button onClick={() => { setEditingCampaign(null); setCampaignForm({ subject: '', content: '' }); setShowCampaignModal(true); }} className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" /> New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={campaigns}
                columns={campaignColumns}
                searchable={true}
                exportable={true}
                pagination={true}
                pageSize={10}
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingCampaign(row); setCampaignForm(row); setShowCampaignModal(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(row.id); }}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Email Templates
                  </CardTitle>
                  <CardDescription>Reusable email templates for campaigns</CardDescription>
                </div>
                <Button onClick={() => { setEditingTemplate(null); setTemplateForm({ name: '', description: '', category: 'general', subject: '', html_content: '', text_content: '' }); setShowTemplateModal(true); }} className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" /> New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                data={templates}
                columns={templateColumns}
                searchable={true}
                exportable={true}
                pagination={true}
                pageSize={10}
                actions={(row) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setEditingTemplate(row); setTemplateForm(row); setShowTemplateModal(true); }}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteTemplate(row.id); }}>
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Subscriber Modal */}
      {showSubscriberModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingSubscriber ? 'Edit Subscriber' : 'Add Subscriber'}</h2>
              <button onClick={() => setShowSubscriberModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Email</Label>
                <Input value={subscriberForm.email} onChange={(e) => setSubscriberForm({ ...subscriberForm, email: e.target.value })} />
              </div>
              <div>
                <Label>Status</Label>
                <select value={subscriberForm.status} onChange={(e) => setSubscriberForm({ ...subscriberForm, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="active">Active</option>
                  <option value="unsubscribed">Unsubscribed</option>
                  <option value="bounced">Bounced</option>
                </select>
              </div>
              <div>
                <Label>Source</Label>
                <select value={subscriberForm.source} onChange={(e) => setSubscriberForm({ ...subscriberForm, source: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="manual">Manual</option>
                  <option value="landing">Landing Page</option>
                  <option value="footer">Footer</option>
                  <option value="import">Import</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowSubscriberModal(false)}>Cancel</Button>
              <Button onClick={handleSaveSubscriber} className="bg-black text-white hover:bg-gray-800">{editingSubscriber ? 'Update' : 'Add'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingCampaign ? 'Edit Campaign' : 'New Campaign'}</h2>
              <button onClick={() => setShowCampaignModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Subject</Label>
                <Input value={campaignForm.subject} onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })} />
              </div>
              <div>
                <Label>Content</Label>
                <textarea
                  value={campaignForm.content}
                  onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowCampaignModal(false)}>Cancel</Button>
              <Button onClick={handleSaveCampaign} className="bg-black text-white hover:bg-gray-800">{editingCampaign ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingTemplate ? 'Edit Template' : 'New Template'}</h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Template Name</Label>
                <Input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={templateForm.description} onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <select value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="general">General</option>
                  <option value="welcome">Welcome</option>
                  <option value="update">Update</option>
                  <option value="promotion">Promotion</option>
                  <option value="announcement">Announcement</option>
                </select>
              </div>
              <div>
                <Label>Subject</Label>
                <Input value={templateForm.subject} onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })} />
              </div>
              <div>
                <Label>HTML Content</Label>
                <textarea
                  value={templateForm.html_content}
                  onChange={(e) => setTemplateForm({ ...templateForm, html_content: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
              <div>
                <Label>Text Content</Label>
                <textarea
                  value={templateForm.text_content}
                  onChange={(e) => setTemplateForm({ ...templateForm, text_content: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowTemplateModal(false)}>Cancel</Button>
              <Button onClick={handleSaveTemplate} className="bg-black text-white hover:bg-gray-800">{editingTemplate ? 'Update' : 'Create'}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
