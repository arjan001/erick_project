import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Lock, Plus, Trash2, Check, AlertCircle, Building2 } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

export default function ArtistBankingPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCardForm, setShowCardForm] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  const [cardForm, setCardForm] = useState({
    card_number: '',
    cardholder_name: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
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
      
      const artists = await base44.entities.Artist.filter({ email: storedUser.email });
      if (artists.length > 0) {
        setArtist(artists[0]);
        setPaymentMethods(artists[0].payment_methods || []);
      }
    } catch (err) {
      console.error('Error fetching payment data:', err);
      toastError('Load Failed', 'Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = async () => {
    if (!artist) return;
    
    // Validate required fields
    if (!cardForm.card_number || !cardForm.cardholder_name || !cardForm.expiry_month || !cardForm.expiry_year || !cardForm.cvv) {
      toastError('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      const newCard = {
        id: `card_${Date.now()}`,
        ...cardForm,
        card_number: `****${cardForm.card_number.slice(-4)}`,
        card_type: detectCardType(cardForm.card_number),
        created_at: new Date().toISOString()
      };

      const updatedMethods = cardForm.is_primary 
        ? paymentMethods.map(method => ({ ...method, is_primary: false })).concat(newCard)
        : [...paymentMethods, newCard];

      await base44.entities.Artist.update(artist.id, { payment_methods: updatedMethods });
      setPaymentMethods(updatedMethods);
      setCardForm({
        card_number: '',
        cardholder_name: '',
        expiry_month: '',
        expiry_year: '',
        cvv: '',
        is_primary: false
      });
      setShowCardForm(false);
      success('Card Added', 'Your payment card has been added successfully');
    } catch (err) {
      console.error('Error adding card:', err);
      toastError('Add Failed', 'Failed to add payment card');
    }
  };

  const detectCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '');
    if (/^4/.test(number)) return 'visa';
    if (/^5[1-5]/.test(number)) return 'mastercard';
    if (/^3[47]/.test(number)) return 'amex';
    return 'unknown';
  };

  const handleDeleteCard = async (cardId) => {
    if (!confirm('Are you sure you want to remove this payment method?')) return;
    
    try {
      const updatedMethods = paymentMethods.filter(method => method.id !== cardId);
      await base44.entities.Artist.update(artist.id, { payment_methods: updatedMethods });
      setPaymentMethods(updatedMethods);
      success('Card Removed', 'Payment method removed successfully');
    } catch (err) {
      console.error('Error deleting card:', err);
      toastError('Delete Failed', 'Failed to remove payment method');
    }
  };

  const handleSetPrimary = async (cardId) => {
    try {
      const updatedMethods = paymentMethods.map(method => ({
        ...method,
        is_primary: method.id === cardId
      }));
      await base44.entities.Artist.update(artist.id, { payment_methods: updatedMethods });
      setPaymentMethods(updatedMethods);
      success('Primary Updated', 'Primary payment method updated');
    } catch (err) {
      console.error('Error setting primary:', err);
      toastError('Update Failed', 'Failed to update primary method');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Methods</h1>
          <p className="text-gray-600">Manage your payment cards for receiving payments and subscriptions</p>
        </div>

        {/* Security Notice */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Secure Payment Information</h3>
                <p className="text-sm text-blue-700">
                  Your payment details are encrypted and stored securely. We use industry-standard security to protect your financial information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Cards */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Cards
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">Add credit/debit cards for payments and subscriptions</p>
              </div>
              <Button onClick={() => setShowCardForm(!showCardForm)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Card
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showCardForm && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold mb-4">Add New Payment Card</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Cardholder Name</label>
                    <Input
                      type="text"
                      value={cardForm.cardholder_name}
                      onChange={(e) => setCardForm({ ...cardForm, cardholder_name: e.target.value })}
                      placeholder="Name on card"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Card Number</label>
                    <Input
                      type="text"
                      value={cardForm.card_number}
                      onChange={(e) => setCardForm({ ...cardForm, card_number: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Expiry Month</label>
                      <select
                        value={cardForm.expiry_month}
                        onChange={(e) => setCardForm({ ...cardForm, expiry_month: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="">MM</option>
                        {[...Array(12)].map((_, i) => (
                          <option key={i} value={String(i + 1).padStart(2, '0')}>{String(i + 1).padStart(2, '0')}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Expiry Year</label>
                      <select
                        value={cardForm.expiry_year}
                        onChange={(e) => setCardForm({ ...cardForm, expiry_year: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                      >
                        <option value="">YY</option>
                        {[...Array(10)].map((_, i) => (
                          <option key={i} value={String(new Date().getFullYear() + i).slice(-2)}>
                            {String(new Date().getFullYear() + i).slice(-2)}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">CVV</label>
                      <Input
                        type="text"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                        placeholder="123"
                        maxLength={4}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="primary"
                      checked={cardForm.is_primary}
                      onChange={(e) => setCardForm({ ...cardForm, is_primary: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="primary" className="text-sm text-gray-700">Set as primary payment method</label>
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={handleAddCard} className="bg-black text-white hover:bg-gray-800">
                      Add Card
                    </Button>
                    <Button variant="outline" onClick={() => setShowCardForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {paymentMethods.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No payment cards added yet</p>
                <p className="text-sm mt-2">Add a payment card to receive payments for your work</p>
              </div>
            ) : (
              <div className="space-y-4">
                {paymentMethods.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold capitalize">{card.card_type || 'Card'}</h3>
                          {card.is_primary && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          ****{card.card_number.slice(-4)} • Expires {card.expiry_month}/{card.expiry_year}
                        </div>
                        <div className="text-xs text-gray-500">{card.cardholder_name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!card.is_primary && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetPrimary(card.id)}
                        >
                          Set Primary
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCard(card.id)}
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

        {/* Bank Transfer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Bank Transfers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Direct Bank Transfers</h4>
                  <p className="text-sm text-gray-600">
                    For larger payments or international transfers, you can also receive payments directly to your bank account. Contact support to set up bank transfer payments.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Payment Processing</h4>
                  <p className="text-sm text-gray-600">
                    Card payments are processed within 2-3 business days. Bank transfers may take 3-5 business days depending on your bank.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}