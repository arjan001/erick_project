import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Backer } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, CreditCard, Lock, Plus, Trash2, Check, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

export default function BackerBankingPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [backer, setBacker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  
  const [bankForm, setBankForm] = useState({
    bank_name: '',
    account_number: '',
    routing_number: '',
    account_type: 'checking',
    account_holder_name: '',
    is_primary: false
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    setUser(JSON.parse(storedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('studio22_user'));
      
      const backers = await Backer.filter({ contact_email: storedUser.email });
      if (backers.length > 0) {
        setBacker(backers[0]);
        setBankAccounts(backers[0].bank_accounts || []);
      }
    } catch (err) {
      console.error('Error fetching banking data:', err);
      toastError('Load Failed', 'Failed to load banking information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBankAccount = async () => {
    if (!backer) return;
    
    // Validate required fields
    if (!bankForm.bank_name || !bankForm.account_number || !bankForm.routing_number || !bankForm.account_holder_name) {
      toastError('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      const newAccount = {
        id: `bank_${Date.now()}`,
        ...bankForm,
        account_number: bankForm.account_number.slice(-4).padStart(bankForm.account_number.length - 4, '*'),
        created_at: new Date().toISOString()
      };

      const updatedAccounts = bankForm.is_primary 
        ? bankAccounts.map(acc => ({ ...acc, is_primary: false })).concat(newAccount)
        : [...bankAccounts, newAccount];

      await Backer.update(backer.id, { bank_accounts: updatedAccounts });
      setBankAccounts(updatedAccounts);
      setBankForm({
        bank_name: '',
        account_number: '',
        routing_number: '',
        account_type: 'checking',
        account_holder_name: '',
        is_primary: false
      });
      setShowBankForm(false);
      success('Bank Account Added', 'Your bank account has been added successfully');
    } catch (err) {
      console.error('Error adding bank account:', err);
      toastError('Add Failed', 'Failed to add bank account');
    }
  };

  const handleDeleteBankAccount = async (accountId) => {
    if (!confirm('Are you sure you want to remove this bank account?')) return;
    
    try {
      const updatedAccounts = bankAccounts.filter(acc => acc.id !== accountId);
      await Backer.update(backer.id, { bank_accounts: updatedAccounts });
      setBankAccounts(updatedAccounts);
      success('Account Removed', 'Bank account removed successfully');
    } catch (err) {
      console.error('Error deleting bank account:', err);
      toastError('Delete Failed', 'Failed to remove bank account');
    }
  };

  const handleSetPrimary = async (accountId) => {
    try {
      const updatedAccounts = bankAccounts.map(acc => ({
        ...acc,
        is_primary: acc.id === accountId
      }));
      await Backer.update(backer.id, { bank_accounts: updatedAccounts });
      setBankAccounts(updatedAccounts);
      success('Primary Updated', 'Primary bank account updated');
    } catch (err) {
      console.error('Error setting primary:', err);
      toastError('Update Failed', 'Failed to update primary account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Banking & Payments</h1>
          <p className="text-gray-600">Manage your bank accounts for investment returns and withdrawals</p>
        </div>

        {/* Security Notice */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Secure Banking Information</h3>
                <p className="text-sm text-blue-700">
                  Your banking details are encrypted and stored securely. We only use this information to process investment returns and withdrawals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bank Accounts */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Bank Accounts
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Add bank accounts to receive investment returns</p>
              </div>
              <Button onClick={() => setShowBankForm(!showBankForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showBankForm && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-4">Add New Bank Account</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Bank Name</label>
                    <Input
                      type="text"
                      value={bankForm.bank_name}
                      onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                      placeholder="e.g. Chase Bank, Bank of America"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Account Holder Name</label>
                    <Input
                      type="text"
                      value={bankForm.account_holder_name}
                      onChange={(e) => setBankForm({ ...bankForm, account_holder_name: e.target.value })}
                      placeholder="Name as it appears on your account"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Account Number</label>
                      <Input
                        type="text"
                        value={bankForm.account_number}
                        onChange={(e) => setBankForm({ ...bankForm, account_number: e.target.value })}
                        placeholder="Enter account number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Routing Number</label>
                      <Input
                        type="text"
                        value={bankForm.routing_number}
                        onChange={(e) => setBankForm({ ...bankForm, routing_number: e.target.value })}
                        placeholder="9-digit routing number"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Account Type</label>
                    <select
                      value={bankForm.account_type}
                      onChange={(e) => setBankForm({ ...bankForm, account_type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
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
                    <label htmlFor="primary" className="text-sm text-gray-700">Set as primary account</label>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleAddBankAccount} className="bg-black text-white hover:bg-gray-800">
                      Add Account
                    </Button>
                    <Button variant="outline" onClick={() => setShowBankForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {bankAccounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No bank accounts added yet</p>
                <p className="text-sm mt-2">Add a bank account to receive investment returns</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bankAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{account.bank_name}</h3>
                          {account.is_primary && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {account.account_type === 'checking' ? 'Checking' : 'Savings'} • ****{account.account_number.slice(-4)}
                        </div>
                        <div className="text-xs text-gray-500">{account.account_holder_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!account.is_primary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(account.id)}
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBankAccount(account.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Investment Funding</h4>
                  <p className="text-sm text-gray-600">
                    For making investments, you can use credit/debit cards or bank transfers. Payment methods are added during the investment process.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Returns & Withdrawals</h4>
                  <p className="text-sm text-gray-600">
                    Investment returns and withdrawals are processed to your primary bank account. Processing time is typically 3-5 business days.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}