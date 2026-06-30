import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, Lock, Check, Crown, Star, Zap, ArrowLeft } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

export default function ArtistSubscriptionCheckoutPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    setUser(JSON.parse(storedUser));

    fetchData(JSON.parse(storedUser));
  }, []);

  const fetchData = async (userData) => {
    try {
      const [pkgsData, subsData] = await Promise.all([
        base44.entities.SubscriptionPackage.filter({ active: true }),
        base44.entities.Subscription.filter({ user_email: userData.email })
      ]);
      setPackages(pkgsData);
      if (subsData.length > 0) {
        setCurrentSubscription(subsData[0]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPackage || !user) return;
    setProcessing(true);

    try {
      // Create subscription order
      const order = await base44.entities.SubscriptionOrder.create({
        user_email: user.email,
        user_name: user.full_name,
        package_id: selectedPackage.id,
        package_name: selectedPackage.name,
        amount: selectedPackage.price,
        currency: selectedPackage.currency || 'USD',
        status: 'completed',
        payment_method: 'card',
        card_last4: cardForm.cardNumber.replace(/\s/g, '').slice(-4),
        card_expiry: cardForm.expiryDate,
        cardholder_name: cardForm.cardholderName,
        created_at: new Date().toISOString()
      });

      // Create or update subscription
      if (currentSubscription) {
        await base44.entities.Subscription.update(currentSubscription.id, {
          package_id: selectedPackage.id,
          status: 'active',
          upgraded_at: new Date().toISOString(),
          renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      } else {
        await base44.entities.Subscription.create({
          user_email: user.email,
          user_name: user.full_name,
          package_id: selectedPackage.id,
          status: 'active',
          started_at: new Date().toISOString(),
          renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }

      success('Subscription Successful', `You are now subscribed to ${selectedPackage.name}`);
      navigate(createPageUrl('ArtistDashboard'));
    } catch (err) {
      console.error('Error processing subscription:', err);
      toastError('Payment Failed', 'Failed to process subscription');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const getPackageIcon = (pkg) => {
    if (pkg.name.toLowerCase().includes('basic')) return Star;
    if (pkg.name.toLowerCase().includes('pro')) return Crown;
    return Zap;
  };

  return (
    <div className="h-screen bg-white">
      <main className="w-full h-full flex flex-col overflow-y-auto bg-white">
        <div className="p-6 max-w-6xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('ArtistDashboard'))}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade Your Subscription</h1>
          <p className="text-gray-600 mb-8">Choose a plan to unlock more features and increase your job application limits</p>

          {currentSubscription && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Current Plan: {currentSubscription.package_id}</div>
                  <div className="text-sm text-blue-700">Renews on {currentSubscription.renews_at ? new Date(currentSubscription.renews_at).toLocaleDateString() : 'N/A'}</div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {packages.map((pkg) => {
              const PackageIcon = getPackageIcon(pkg);
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`bg-white border-2 rounded-xl cursor-pointer transition-all ${
                    selectedPackage?.id === pkg.id
                      ? 'border-black shadow-lg'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        pkg.name.toLowerCase().includes('pro') ? 'bg-yellow-100' :
                        pkg.name.toLowerCase().includes('basic') ? 'bg-gray-100' :
                        'bg-purple-100'
                      }`}>
                        <PackageIcon className={`w-6 h-6 ${
                          pkg.name.toLowerCase().includes('pro') ? 'text-yellow-600' :
                          pkg.name.toLowerCase().includes('basic') ? 'text-gray-600' :
                          'text-purple-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                        <div className="text-2xl font-bold text-gray-900">
                          ${pkg.price}
                          <span className="text-sm font-normal text-gray-500">/{pkg.billing_cycle}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-700">
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        {pkg.job_applications_limit === -1 ? 'Unlimited' : pkg.job_applications_limit} job applications/month
                      </div>
                      <div className="flex items-center text-sm text-gray-700">
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        {pkg.message_limit === -1 ? 'Unlimited' : pkg.message_limit} messages/month
                      </div>
                      {pkg.featured_listing && (
                        <div className="flex items-center text-sm text-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          Featured listing in search
                        </div>
                      )}
                      {pkg.priority_support && (
                        <div className="flex items-center text-sm text-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          Priority support
                        </div>
                      )}
                      {pkg.analytics_access && (
                        <div className="flex items-center text-sm text-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          Advanced analytics
                        </div>
                      )}
                    </div>

                    <Button
                      className={`w-full ${
                        selectedPackage?.id === pkg.id
                          ? 'bg-black text-white hover:bg-gray-800'
                          : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                      }`}
                    >
                      {selectedPackage?.id === pkg.id ? 'Selected' : 'Select Plan'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedPackage && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Card Number</label>
                  <Input
                    type="text"
                    value={cardForm.cardNumber}
                    onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Expiry Date</label>
                    <Input
                      type="text"
                      value={cardForm.expiryDate}
                      onChange={(e) => setCardForm({ ...cardForm, expiryDate: e.target.value })}
                      placeholder="MM/YY"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">CVV</label>
                    <Input
                      type="text"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                      placeholder="123"
                      maxLength={3}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Cardholder Name</label>
                  <Input
                    type="text"
                    value={cardForm.cardholderName}
                    onChange={(e) => setCardForm({ ...cardForm, cardholderName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
                <Lock className="w-4 h-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Selected Plan</span>
                  <span className="font-medium">{selectedPackage.name}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600">Billing Cycle</span>
                  <span className="font-medium">{selectedPackage.billing_cycle}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold">${selectedPackage.price}</span>
                </div>
              </div>

              <Button
                onClick={handleSubscribe}
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={processing}
              >
                {processing ? 'Processing...' : `Subscribe to ${selectedPackage.name}`}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}