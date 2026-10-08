import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Backer } from '@/lib/supabaseEntities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, CreditCard, Lock, Plus, Trash2, Check, AlertCircle } from 'lucide-react'
import { createPageUrl } from '@/shared/utils/routing'
import { useToast } from '@/hooks/useToast.jsx'
import { useAuth } from '@/lib/AuthContext'

export default function BackerBankingPage() {
  const navigate = useNavigate()
  const { success, error: toastError } = useToast()
  const { user: authUser, isAuthenticated } = useAuth()
  const [backer, setBacker] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showBankForm, setShowBankForm] = useState(false)
  const [bankAccounts, setBankAccounts] = useState([])
  
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: 'checking',
    account_holder_name: '',
    is_primary: false
  })

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/'
      return
    }
    fetchData()
  }, [isAuthenticated])

  const fetchData = async () => {
    try {
      const backers = await Backer.filter({ contact_email: authUser?.email })
      if (backers.length > 0) {
        setBacker(backers[0])
        setBankAccounts(backers[0].bank_accounts || [])
      }
    } catch (err) {
      
      toastError('Load Failed', 'Failed to load banking information')
    } finally {
      setLoading(false)
    }
  }

  const handleAddBankAccount = async () => {
    if (!backer) return
    
    // Validate required fields
    if (!bankForm.bank_name || !bankForm.account_number || !bankForm.routing_number || !bankForm.account_holder_name) {
      toastError('Validation Error', 'Please fill in all required fields')
      return
    }

    try {
      const newAccount = {
        id: `bank_${Date.now()}`,
        ...bankForm,
        account_number: bankForm.account_number.slice(-4).padStart(bankForm.account_number.length - 4, '*'),
        created_at: new Date().toISOString()
      }

      const updatedAccounts = bankForm.is_primary 
        ? bankAccounts.map(acc => ({ ...acc, is_primary: false })).concat(newAccount)
        : [...bankAccounts, newAccount]

      await Backer.update(backer.id, { bank_accounts: updatedAccounts })
      setBankAccounts(updatedAccounts)
      setBankForm({
        bank_name: '',
        account_number: '',
        routing_number: '',
        account_type: 'checking',
        account_holder_name: '',
        is_primary: false
      })
      setShowBankForm(false)
      success('Bank Account Added', 'Your bank account has been added successfully')
    } catch (err) {
      
      toastError('Add Failed', 'Failed to add bank account')
    }
  }

  const handleDeleteBankAccount = async (accountId) => {
    if (!confirm('Are you sure you want to remove this bank account?')) return
    
    try {
      const updatedAccounts = bankAccounts.filter(acc => acc.id !== accountId)
      await Backer.update(backer.id, { bank_accounts: updatedAccounts })
      setBankAccounts(updatedAccounts)
      success('Account Removed', 'Bank account removed successfully')
    } catch (err) {
      
      toastError('Delete Failed', 'Failed to remove bank account')
    }
  }

  const handleSetPrimary = async (accountId) => {
    try {
      const updatedAccounts = bankAccounts.map(acc => ({
        ...acc,
        is_primary: acc.id === accountId
      }))
      await Backer.update(backer.id, { bank_accounts: updatedAccounts })
      setBankAccounts(updatedAccounts)
      success('Primary Updated', 'Primary bank account updated')
    } catch (err) {
      
      toastError('Update Failed', 'Failed to update primary account')
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Banking & Payments</h1>
          <p className="text-gray-600">Manage your bank accounts for investment returns and withdrawals</p>
        </div>

        {/* Security Notice - Gray theme */}
        <Card className="mb-6 bg-gray-50 border-gray-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lock className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 text-sm">Secure Banking Information</h3>
                <p className="text-xs text-gray-600">
                  Your banking details are encrypted and stored securely. We only use this information to process investment returns and withdrawals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Accounts - Smaller */}
        <Card className="mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Building2 className="w-4 h-4" />
                  Bank Accounts
                </CardTitle>
                <p className="text-xs text-gray-600 mt-1">Add bank accounts to receive investment returns</p>
              </div>
              <Button onClick={() => setShowBankForm(!showBankForm)} className="bg-black text-white hover:bg-gray-800 h-8 text-sm">
                <Plus className="w-3 h-3 mr-1" />
                Add Account
              </Button>
            </div>
          </div>
          <CardContent className="p-4">
            {showBankForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-3 text-sm">Add New Bank Account</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">Bank Name</label>
                    <Input
                      type="text"
                      value={bankForm.bank_name}
                      onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                      placeholder="e.g. Chase Bank, Bank of America"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">Account Holder Name</label>
                    <Input
                      type="text"
                      value={bankForm.account_holder_name}
                      onChange={(e) => setBankForm({ ...bankForm, account_holder_name: e.target.value })}
                      placeholder="Name as it appears on your account"
                      className="h-8 text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Account Number</label>
                      <Input
                        type="text"
                        value={bankForm.account_number}
                        onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                        placeholder="Enter account number"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-900 mb-1">Routing Number</label>
                      <Input
                        type="text"
                        value={bankForm.routing_number}
                        onChange={(e) => setBankForm({ ...bankForm, routing_number: e.target.value })}
                        placeholder="9-digit routing number"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-900 mb-1">Account Type</label>
                    <select
                      value={bankForm.account_type}
                      onChange={(e) => setBankForm({ ...bankForm, account_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-gray-400 text-sm h-8"
                    >
                      <option value="checking">Checking</option>
                      <option value="savings">Savings</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="primary"
                      checked={bankForm.is_primary}
                      onChange={(e) => setBankForm({ ...bankForm, is_primary: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="primary" className="text-xs text-gray-700">Set as primary account</label>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddBankAccount} className="bg-black text-white hover:bg-gray-800 h-8 text-sm">
                      Add Account
                    </Button>
                    <Button variant="outline" onClick={() => setShowBankForm(false)} className="h-8 text-sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {bankAccounts.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No bank accounts added yet</p>
                <p className="text-xs mt-1">Add a bank account to receive investment returns</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gray-900" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm text-gray-900">{account.bank_name}</h3>
                          {account.is_primary && (
                            <span className="px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600">
                          {account.account_type === 'checking' ? 'Checking' : 'Savings'} • ****{account.account_number.slice(-4)}
                        </div>
                        <div className="text-[10px] text-gray-500">{account.account_holder_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!account.is_primary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(account.id)}
                          className="h-7 text-xs"
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBankAccount(account.id)}
                        className="text-red-600 hover:text-red-700 h-7 px-2"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Info - Smaller */}
        <Card className="p-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold mb-4">
            <CreditCard className="w-4 h-4" />
            Payment Methods
          </CardTitle>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Investment Funding</h4>
                <p className="text-xs text-gray-600">
                  For making investments, you can use credit/debit cards or bank transfers. Payment methods are added during the investment process.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Check className="w-4 h-4 text-gray-900 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1 text-sm">Returns & Withdrawals</h4>
                <p className="text-xs text-gray-600">
                  Investment returns and withdrawals are processed to your primary bank account. Processing time is typically 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        </Card>
    </div>
  )
}