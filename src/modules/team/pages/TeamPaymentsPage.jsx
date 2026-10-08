import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Team, TeamPayment } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { CreditCard, DollarSign, TrendingUp, Check, Clock, AlertCircle, CheckCircle } from 'lucide-react'
import { createPageUrl } from '@/shared/utils/routing'
import { useToast } from '@/hooks/useToast.jsx'
import { useAuth } from '@/lib/AuthContext'

export default function TeamPaymentsPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { user: authUser, isAuthenticated } = useAuth()
  const [team, setTeam] = useState(null)
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/'
      return
    }
    loadTeamData()
  }, [isAuthenticated])

  const loadTeamData = async () => {
    try {
      let teamData = null
      if (authUser?.team_id) {
        teamData = await Team.filter({ id: authUser.team_id }, '-created_at', 1).then(r => r?.[0] || null)
      } else {
        const teams = await Team.filter({ contact_email: authUser?.email }, '-created_at', 1)
        teamData = teams?.[0] || null
      }
      setTeam(teamData)
      if (teamData) {
        fetchPayments(teamData.id)
      } else {
        setLoading(false)
      }
    } catch (err) {
      //
      toastError('Load Failed', 'Failed to load team data')
      setLoading(false)
    }
  }

  const fetchPayments = async (teamId) => {
    try {
      const teamPayments = await TeamPayment.filter({ team_id: teamId }, '-created_at', 50)
      setPayments(teamPayments || [])
    } catch (err) {
      //
      toastError('Load Failed', 'Failed to load payments. Please try again.')
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
  const pendingPayments = payments.filter(p => p.status === 'pending').length
  const completedPayments = payments.filter(p => p.status === 'completed').length

  const statusIcons = {
    completed: CheckCircle,
    pending: Clock,
    failed: AlertCircle
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Payments & Deals</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">${totalRevenue.toFixed(2)}</div>
          </div>
          <div className="text-sm text-gray-600">Total Revenue</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{pendingPayments}</div>
          </div>
          <div className="text-sm text-gray-600">Pending Payments</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{completedPayments}</div>
          </div>
          <div className="text-sm text-gray-600">Completed Deals</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Project</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Client</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => {
              const StatusIcon = statusIcons[payment.status] || AlertCircle
              return (
                <tr key={payment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900">{payment.project_name || 'N/A'}</td>
                  <td className="px-4 py-3 text-gray-600">{payment.client_name || 'N/A'}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">${payment.amount?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-2 text-sm ${payment.status === 'completed' ? 'text-green-600' :
                      payment.status === 'pending' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                      <StatusIcon className="w-4 h-4" />
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {payments.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No payments found
          </div>
        )}
      </div>
    </div>
  )
}
