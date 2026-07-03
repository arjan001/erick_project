import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Backer, Partner } from '@/lib/supabaseEntities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Users, Plus, Search, Mail, Building2, Calendar, MessageSquare, Trash2, Edit2, Star } from 'lucide-react';
import { createPageUrl } from '@/shared/utils/routing';
import { useToast } from '@/hooks/useToast.jsx';

export default function BackerPartnersPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const [user, setUser] = useState(null);
  const [backer, setBacker] = useState(null);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    company: '',
    email: '',
    role: '',
    notes: '',
    partnership_type: 'strategic'
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
      }

      // Fetch partners
      const allPartners = await Partner.filter({ backer_email: storedUser.email });
      setPartners(allPartners);
    } catch (err) {
      console.error('Error fetching partners:', err);
      toastError('Load Failed', 'Failed to load partners. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePartner = async () => {
    if (!backer) return;
    try {
      await Partner.create({
        ...partnerForm,
        backer_email: user.email,
        backer_id: backer.id,
        created_at: new Date().toISOString()
      });
      success('Partner Added', 'New partner has been added successfully');
      setShowModal(false);
      setPartnerForm({
        name: '',
        company: '',
        email: '',
        role: '',
        notes: '',
        partnership_type: 'strategic'
      });
      fetchData();
    } catch (err) {
      console.error('Error creating partner:', err);
      toastError('Creation Failed', 'Failed to add partner');
    }
  };

  const handleDeletePartner = async (partnerId) => {
    if (!confirm('Are you sure you want to remove this partner?')) return;
    try {
      await Partner.delete(partnerId);
      success('Partner Removed', 'Partner removed successfully');
      fetchData();
    } catch (err) {
      console.error('Error deleting partner:', err);
      toastError('Delete Failed', 'Failed to remove partner');
    }
  };

  const filteredPartners = partners.filter(partner => 
    partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    partner.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Partners & Network</h1>
            <p className="text-gray-600">Manage your business partners and connections</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="bg-black text-white hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" />
            Add Partner
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div className="text-2xl font-bold">{partners.length}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Strategic Partners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                <div className="text-2xl font-bold">{partners.filter(p => p.partnership_type === 'strategic').length}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Collaborations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-600" />
                <div className="text-2xl font-bold">{partners.filter(p => p.status === 'active').length}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search partners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Partners Grid */}
        {filteredPartners.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">No partners yet</h3>
              <p className="text-gray-600 mb-4">Add your first business partner</p>
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Partner
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => (
              <Card key={partner.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{partner.name}</CardTitle>
                      {partner.company && (
                        <p className="text-sm text-gray-600">{partner.company}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      partner.partnership_type === 'strategic' ? 'bg-purple-100 text-purple-700' :
                      partner.partnership_type === 'investment' ? 'bg-green-100 text-green-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {partner.partnership_type}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-4">
                    {partner.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span>{partner.email}</span>
                      </div>
                    )}
                    {partner.role && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4" />
                        <span>{partner.role}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Since {new Date(partner.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {partner.notes && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">{partner.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Contact
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeletePartner(partner.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Partner Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Add New Partner</h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Contact Name</label>
                  <Input
                    type="text"
                    value={partnerForm.name}
                    onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                    placeholder="Enter contact name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Company</label>
                  <Input
                    type="text"
                    value={partnerForm.company}
                    onChange={(e) => setPartnerForm({ ...partnerForm, company: e.target.value })}
                    placeholder="Company name (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                  <Input
                    type="email"
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    placeholder="Contact email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Role</label>
                  <Input
                    type="text"
                    value={partnerForm.role}
                    onChange={(e) => setPartnerForm({ ...partnerForm, role: e.target.value })}
                    placeholder="e.g. CEO, Producer, Director"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Partnership Type</label>
                  <select
                    value={partnerForm.partnership_type}
                    onChange={(e) => setPartnerForm({ ...partnerForm, partnership_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="strategic">Strategic Partner</option>
                    <option value="investment">Investment Partner</option>
                    <option value="collaboration">Collaboration Partner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Notes</label>
                  <textarea
                    value={partnerForm.notes}
                    onChange={(e) => setPartnerForm({ ...partnerForm, notes: e.target.value })}
                    placeholder="Add notes about this partnership"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button onClick={handleCreatePartner} className="bg-black text-white hover:bg-gray-800">
                  Add Partner
                </Button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}