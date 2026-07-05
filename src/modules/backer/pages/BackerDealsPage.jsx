import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Backer, Deal } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, Plus, Search, Calendar, DollarSign, Check, X, Clock, Eye, Pen } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';
import ESignatureModal from '@/modules/backer/components/ESignatureModal';

export default function BackerDealsPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [backer, setBacker] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signingDealId, setSigningDealId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dealForm, setDealForm] = useState({
    title: '',
    description: '',
    amount: '',
    counterparty: '',
    status: 'pending',
    start_date: '',
    end_date: ''
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
      
      // Fetch backer profile
      const backers = await Backer.filter({ contact_email: storedUser.email });
      if (backers.length > 0) {
        setBacker(backers[0]);
      }

      // Fetch deals
      const allDeals = await Deal.filter({ backer_email: storedUser.email });
      setDeals(allDeals);
    } catch (err) {
      console.error('Error fetching deals:', err);
      toastError('Load Failed', 'Failed to load deals. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeal = async () => {
    if (!backer) return;
    try {
      await Deal.create({
        ...dealForm,
        backer_email: user.email,
        backer_id: backer.id,
        amount: parseFloat(dealForm.amount),
        created_at: new Date().toISOString()
      });
      success('Deal Created', 'New deal has been created successfully');
      setShowModal(false);
      setDealForm({ title: '', description: '', amount: '', counterparty: '', status: 'pending', start_date: '', end_date: '' });
      fetchData();
    } catch (err) {
      console.error('Error creating deal:', err);
      toastError('Creation Failed', 'Failed to create deal');
    }
  };

  const handleUpdateDealStatus = async (dealId, status) => {
    try {
      await Deal.update(dealId, { status });
      success('Status Updated', `Deal status updated to ${status}`);
      fetchData();
    } catch (err) {
      console.error('Error updating deal:', err);
      toastError('Update Failed', 'Failed to update deal status');
    }
  };

  const handleSignDeal = (dealId) => {
    setSigningDealId(dealId);
    setShowSignatureModal(true);
  };

  const handleSignatureSave = async (signatureData) => {
    try {
      await Deal.update(signingDealId, { 
        signature: signatureData,
        signed_at: new Date().toISOString(),
        status: 'active'
      });
      success('Deal Signed', 'Your signature has been recorded and the deal is now active');
      setShowSignatureModal(false);
      setSigningDealId(null);
      fetchData();
    } catch (err) {
      console.error('Error saving signature:', err);
      toastError('Signature Failed', 'Failed to save signature');
    }
  };

  const filteredDeals = deals.filter(deal => 
    deal.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.counterparty?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusIcons = {
    pending: Clock,
    active: Check,
    completed: Check,
    cancelled: X
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Deals & Agreements</h1>
            <p className="text-gray-600">Manage your investment deals and partnerships</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-black text-white hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" />
            New Deal
          </Button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search deals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Deals Grid */}
        {filteredDeals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No deals yet</h3>
              <p className="text-gray-600 mb-4">Create your first investment deal</p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Deal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => {
              const StatusIcon = statusIcons[deal.status] || Clock;
              return (
                <Card key={deal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{deal.title}</CardTitle>
                      <div className={`p-2 rounded-lg ${
                        deal.status === 'active' ? 'bg-green-100 text-green-600' :
                        deal.status === 'completed' ? 'bg-blue-100 text-blue-600' :
                        deal.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        <StatusIcon className="w-5 h-5" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{deal.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Counterparty</span>
                        <span className="font-medium">{deal.counterparty || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Amount</span>
                        <span className="font-semibold">${deal.amount?.toLocaleString()}</span>
                      </div>
                      {deal.start_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(deal.start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {deal.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSignDeal(deal.id)}
                            className="flex-1"
                          >
                            <Pen className="w-4 h-4 mr-1" />
                            Sign Deal
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdateDealStatus(deal.id, 'cancelled')}
                            className="text-red-600 border-red-300"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {deal.status === 'active' && (
                        <Button 
                          size="sm"
                          onClick={() => handleUpdateDealStatus(deal.id, 'completed')}
                          className="flex-1"
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Create Deal Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Create New Deal</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Deal Title</label>
                  <Input
                    type="text"
                    value={dealForm.title}
                    onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                    placeholder="Enter deal title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                  <textarea
                    value={dealForm.description}
                    onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                    placeholder="Describe the deal"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Amount</label>
                  <Input
                    type="number"
                    value={dealForm.amount}
                    onChange={(e) => setDealForm({ ...dealForm, amount: e.target.value })}
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Counterparty</label>
                  <Input
                    type="text"
                    value={dealForm.counterparty}
                    onChange={(e) => setDealForm({ ...dealForm, counterparty: e.target.value })}
                    placeholder="Company or individual name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">Start Date</label>
                    <Input
                      type="date"
                      value={dealForm.start_date}
                      onChange={(e) => setDealForm({ ...dealForm, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">End Date</label>
                    <Input
                      type="date"
                      value={dealForm.end_date}
                      onChange={(e) => setDealForm({ ...dealForm, end_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleCreateDeal} className="bg-black text-white hover:bg-gray-800">
                  Create Deal
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* E-Signature Modal */}
        <ESignatureModal
          isOpen={showSignatureModal}
          onClose={() => {
            setShowSignatureModal(false);
            setSigningDealId(null);
          }}
          onSign={handleSignatureSave}
          title="Sign Investment Deal"
        />
    </div>
  );
}