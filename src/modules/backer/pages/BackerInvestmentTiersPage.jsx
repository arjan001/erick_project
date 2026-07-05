import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Backer, InvestmentTier } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Layers, Plus, Edit2, Trash2, TrendingUp, Crown, Gem, Sparkles, Percent, DollarSign } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

const DEFAULT_TIERS = [
  {
    id: 'bronze',
    name: 'Bronze Tier',
    min_investment: 1000,
    max_investment: 10000,
    roi_percentage: 10,
    benefits: ['Project updates', 'Basic recognition', 'Early access to projects'],
    icon: 'bronze',
    color: 'bg-amber-100 text-amber-700'
  },
  {
    id: 'silver',
    name: 'Silver Tier',
    min_investment: 10001,
    max_investment: 50000,
    roi_percentage: 15,
    benefits: ['All Bronze benefits', 'Priority updates', 'Invitation to events', 'Logo placement'],
    icon: 'silver',
    color: 'bg-gray-200 text-gray-700'
  },
  {
    id: 'gold',
    name: 'Gold Tier',
    min_investment: 50001,
    max_investment: 100000,
    roi_percentage: 20,
    benefits: ['All Silver benefits', 'Executive producer credit', 'Private screenings', 'Direct access to creators'],
    icon: 'gold',
    color: 'bg-yellow-100 text-yellow-700'
  },
  {
    id: 'platinum',
    name: 'Platinum Tier',
    min_investment: 100001,
    max_investment: null,
    roi_percentage: 25,
    benefits: ['All Gold benefits', 'Co-production rights', 'Revenue sharing', 'Strategic partnership'],
    icon: 'platinum',
    color: 'bg-purple-100 text-purple-700'
  }
];

export default function BackerInvestmentTiersPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [backer, setBacker] = useState(null);
  const [tiers, setTiers] = useState(DEFAULT_TIERS);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTier, setEditingTier] = useState(null);
  const [tierForm, setTierForm] = useState({
    name: '',
    min_investment: '',
    max_investment: '',
    roi_percentage: '',
    benefits: '',
    color: 'bg-blue-100 text-blue-700'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/';
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
      }

      // Fetch custom tiers if they exist
      const customTiers = await InvestmentTier.filter({ backer_email: storedUser.email });
      if (customTiers.length > 0) {
        setTiers(customTiers);
      }
    } catch (err) {
      console.error('Error fetching tiers:', err);
      toastError('Load Failed', 'Failed to load investment tiers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTier = async () => {
    if (!backer) return;
    try {
      const benefitsArray = tierForm.benefits.split('\n').filter(b => b.trim());
      await InvestmentTier.create({
        ...tierForm,
        backer_email: user.email,
        backer_id: backer.id,
        min_investment: parseFloat(tierForm.min_investment),
        max_investment: tierForm.max_investment ? parseFloat(tierForm.max_investment) : null,
        roi_percentage: parseFloat(tierForm.roi_percentage),
        benefits: benefitsArray,
        created_at: new Date().toISOString()
      });
      success('Tier Created', 'New investment tier has been created');
      setShowModal(false);
      setTierForm({
        name: '',
        min_investment: '',
        max_investment: '',
        roi_percentage: '',
        benefits: '',
        color: 'bg-blue-100 text-blue-700'
      });
      fetchData();
    } catch (err) {
      console.error('Error creating tier:', err);
      toastError('Creation Failed', 'Failed to create tier');
    }
  };

  const handleUpdateTier = async () => {
    if (!editingTier) return;
    try {
      const benefitsArray = tierForm.benefits.split('\n').filter(b => b.trim());
      await InvestmentTier.update(editingTier.id, {
        ...tierForm,
        min_investment: parseFloat(tierForm.min_investment),
        max_investment: tierForm.max_investment ? parseFloat(tierForm.max_investment) : null,
        roi_percentage: parseFloat(tierForm.roi_percentage),
        benefits: benefitsArray
      });
      success('Tier Updated', 'Investment tier has been updated');
      setShowModal(false);
      setEditingTier(null);
      setTierForm({
        name: '',
        min_investment: '',
        max_investment: '',
        roi_percentage: '',
        benefits: '',
        color: 'bg-blue-100 text-blue-700'
      });
      fetchData();
    } catch (err) {
      console.error('Error updating tier:', err);
      toastError('Update Failed', 'Failed to update tier');
    }
  };

  const handleDeleteTier = async (tierId) => {
    if (!confirm('Are you sure you want to delete this investment tier?')) return;
    try {
      await InvestmentTier.delete(tierId);
      success('Tier Deleted', 'Investment tier has been deleted');
      fetchData();
    } catch (err) {
      console.error('Error deleting tier:', err);
      toastError('Delete Failed', 'Failed to delete tier');
    }
  };

  const openModal = (tier = null) => {
    if (tier) {
      setEditingTier(tier);
      setTierForm({
        name: tier.name,
        min_investment: tier.min_investment,
        max_investment: tier.max_investment || '',
        roi_percentage: tier.roi_percentage,
        benefits: tier.benefits ? tier.benefits.join('\n') : '',
        color: tier.color || 'bg-blue-100 text-blue-700'
      });
    } else {
      setEditingTier(null);
      setTierForm({
        name: '',
        min_investment: '',
        max_investment: '',
        roi_percentage: '',
        benefits: '',
        color: 'bg-blue-100 text-blue-700'
      });
    }
    setShowModal(true);
  };

  const getTierIcon = (icon) => {
    switch (icon) {
      case 'bronze': return <Layers className="w-6 h-6" />;
      case 'silver': return <Sparkles className="w-6 h-6" />;
      case 'gold': return <Crown className="w-6 h-6" />;
      case 'platinum': return <Gem className="w-6 h-6" />;
      default: return <TrendingUp className="w-6 h-6" />;
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Investment Tiers</h1>
            <p className="text-gray-600">Configure investment tiers with different ROI rates and benefits</p>
          </div>
          <Button onClick={() => openModal()} className="bg-black text-white hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Tier
          </Button>
        </div>

        {/* Info Card */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Investment Tiers</h3>
                <p className="text-sm text-blue-700">
                  Investment tiers allow you to offer different ROI rates and benefits based on investment amounts. 
                  Higher tiers offer better returns and exclusive benefits to incentivize larger investments.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => (
            <Card key={tier.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${tier.color} flex items-center justify-center mb-3`}>
                  {getTierIcon(tier.icon)}
                </div>
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <CardDescription>
                  ${tier.min_investment?.toLocaleString()}
                  {tier.max_investment ? ` - $${tier.max_investment.toLocaleString()}` : '+'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="w-4 h-4 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">{tier.roi_percentage}% ROI</span>
                  </div>
                  <p className="text-sm text-gray-600">Expected return on investment</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-sm mb-2">Benefits:</h4>
                  <ul className="space-y-1">
                    {tier.benefits?.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-green-500">✓</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openModal(tier)}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {tier.id !== 'bronze' && tier.id !== 'silver' && tier.id !== 'gold' && tier.id !== 'platinum' && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteTier(tier.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit Tier Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTier ? 'Edit Investment Tier' : 'Add Investment Tier'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Tier Name</label>
                  <Input
                    type="text"
                    value={tierForm.name}
                    onChange={(e) => setTierForm({ ...tierForm, name: e.target.value })}
                    placeholder="e.g. Diamond Tier"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Min Investment</label>
                    <Input
                      type="number"
                      value={tierForm.min_investment}
                      onChange={(e) => setTierForm({ ...tierForm, min_investment: e.target.value })}
                      placeholder="1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Max Investment (optional)</label>
                    <Input
                      type="number"
                      value={tierForm.max_investment}
                      onChange={(e) => setTierForm({ ...tierForm, max_investment: e.target.value })}
                      placeholder="Leave empty for no limit"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">ROI Percentage</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={tierForm.roi_percentage}
                      onChange={(e) => setTierForm({ ...tierForm, roi_percentage: e.target.value })}
                      placeholder="15"
                      className="flex-1"
                    />
                    <span className="text-gray-600">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Benefits (one per line)</label>
                  <textarea
                    value={tierForm.benefits}
                    onChange={(e) => setTierForm({ ...tierForm, benefits: e.target.value })}
                    placeholder="Project updates&#10;Priority access&#10;Exclusive events"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={editingTier ? handleUpdateTier : handleCreateTier} className="bg-black text-white hover:bg-gray-800">
                  {editingTier ? 'Update Tier' : 'Create Tier'}
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}