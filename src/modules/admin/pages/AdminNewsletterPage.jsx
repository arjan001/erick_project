/**
 * Admin Newsletter Page
 * Manage newsletter subscribers, campaigns, and templates
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs'
import { Mail, Users, Send, FileText, Plus, Trash2, Edit, CheckCircle, AlertCircle, Loader2, Calendar, Eye, BarChart3, Copy, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { supabase } from '@/lib/supabase'

export default function AdminNewsletterPage() {
  const { success, error: toastError } = useToast()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('subscribers')

  // Subscribers
  const [subscribers, setSubscribers] = useState([])
  const [newSubscriberEmail, setNewSubscriberEmail] = useState('')

  // Campaigns
  const [campaigns, setCampaigns] = useState([])
  const [editingCampaign, setEditingCampaign] = useState(null)
  const [showNewCampaign, setShowNewCampaign] = useState(false)

  // Templates
  const [templates, setTemplates] = useState([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [subsData, campData, tempData] = await Promise.all([
        supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false }),
        supabase.from('newsletter_campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('newsletter_templates').select('*').order('name')
      ])

      setSubscribers(subsData.data || [])
      setCampaigns(campData.data || [])
      setTemplates(tempData.data || [])
    } catch (err) {
      console.error('Failed to load newsletter data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubscriber = async () => {
    if (!newSubscriberEmail.trim()) {
      toastError('Error', 'Please enter an email address')
      return
    }

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: newSubscriberEmail.trim(),
          status: 'active',
          source: 'manual'
        })

      if (error) throw error

      success('Success', 'Subscriber added successfully')
      setNewSubscriberEmail('')
      loadData()
    } catch (err) {
      console.error('Error adding subscriber:', err)
      toastError('Error', 'Failed to add subscriber')
    }
  }

  const handleDeleteSubscriber = async (id) => {
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
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
  const totalSent = campaigns.reduce((sum, c) => sum + (c.sent_count || 0), 0)

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
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Newsletter Subscribers
              </CardTitle>
              <CardDescription>Manage your email subscriber list</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Add Subscriber */}
              <div className="flex gap-3 mb-6">
                <Input
                  placeholder="Enter email address"
                  value={newSubscriberEmail}
                  onChange={(e) => setNewSubscriberEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddSubscriber} className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subscriber
                </Button>
              </div>

              {/* Subscribers List */}
              <div className="space-y-2">
                {subscribers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Mail className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No subscribers yet</p>
                  </div>
                ) : (
                  subscribers.map((subscriber) => (
                    <div key={subscriber.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{subscriber.email}</div>
                        <div className="text-xs text-gray-500">
                          Subscribed: {new Date(subscriber.subscribed_at).toLocaleDateString()}
                          {subscriber.status !== 'active' && (
                            <span className="ml-2 text-red-500">({subscriber.status})</span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubscriber(subscriber.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
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
                <Button onClick={() => setShowNewCampaign(true)} className="bg-black text-white hover:bg-gray-800">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Send className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No campaigns yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-600">{campaign.subject}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Status: <span className={`font-medium ${
                            campaign.status === 'sent' ? 'text-green-600' :
                            campaign.status === 'scheduled' ? 'text-blue-600' :
                            'text-gray-600'
                          }`}>{campaign.status}</span>
                          {campaign.status === 'sent' && (
                            <span className="ml-3">Sent: {campaign.sent_count || 0}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Email Templates
              </CardTitle>
              <CardDescription>Reusable email templates for campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div key={template.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="font-medium text-gray-900 mb-1">{template.name}</div>
                    <div className="text-xs text-gray-500 mb-2">{template.description || template.category}</div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
