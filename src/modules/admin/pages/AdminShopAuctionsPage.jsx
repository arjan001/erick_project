import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Plus, Edit2, Trash2, Upload, X, Gavel, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/hooks/useToast';
import { ShopAuction, ShopProduct, AuctionBid } from '@/lib/supabaseEntities';

export default function AdminShopAuctionsPage() {
  const { success, error: toastError } = useToast();
  const [auctions, setAuctions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAuction, setEditingAuction] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    product_id: '',
    title: '',
    description: '',
    starting_price: '',
    current_price: '',
    reserve_price: '',
    buy_now_price: '',
    images: [],
    auction_start: '',
    auction_end: '',
    status: 'upcoming',
    is_featured: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [auctionsData, productsData] = await Promise.all([
        ShopAuction.filter({}, '-created_at', 100),
        ShopProduct.filter({}, 'name', 500),
      ]);
      setAuctions(auctionsData || []);
      setProducts(productsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const response = await base44.integrations.Core.UploadFile({ file });
      const fileUrl = response.file_url || response.url;
      setFormData({ ...formData, images: [...formData.images, fileUrl] });
    } catch (err) {
      console.error('Error uploading image:', err);
      toastError('Upload Failed', 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        ...formData,
        starting_price: parseFloat(formData.starting_price),
        current_price: formData.current_price ? parseFloat(formData.current_price) : parseFloat(formData.starting_price),
        reserve_price: formData.reserve_price ? parseFloat(formData.reserve_price) : null,
        buy_now_price: formData.buy_now_price ? parseFloat(formData.buy_now_price) : null,
        images: JSON.stringify(formData.images),
        auction_start: new Date(formData.auction_start).toISOString(),
        auction_end: new Date(formData.auction_end).toISOString(),
      };

      if (editingAuction) {
        await ShopAuction.update(editingAuction.id, dataToSave);
        success('Auction Updated', 'Auction has been updated');
      } else {
        await ShopAuction.create(dataToSave);
        success('Auction Created', 'Auction has been created');
      }

      setShowModal(false);
      setEditingAuction(null);
      resetForm();
      loadData();
    } catch (err) {
      console.error('Error saving auction:', err);
      toastError('Save Failed', 'Failed to save auction');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;

    try {
      await ShopAuction.delete(id);
      success('Auction Deleted', 'Auction has been deleted');
      loadData();
    } catch (err) {
      console.error('Error deleting auction:', err);
      toastError('Delete Failed', 'Failed to delete auction');
    }
  };

  const handleEdit = (auction) => {
    setEditingAuction(auction);
    setFormData({
      product_id: auction.product_id || '',
      title: auction.title || '',
      description: auction.description || '',
      starting_price: auction.starting_price || '',
      current_price: auction.current_price || auction.starting_price || '',
      reserve_price: auction.reserve_price || '',
      buy_now_price: auction.buy_now_price || '',
      images: Array.isArray(auction.images) ? auction.images : JSON.parse(auction.images || '[]'),
      auction_start: auction.auction_start ? new Date(auction.auction_start).toISOString().slice(0, 16) : '',
      auction_end: auction.auction_end ? new Date(auction.auction_end).toISOString().slice(0, 16) : '',
      status: auction.status || 'upcoming',
      is_featured: auction.is_featured || false,
    });
    setShowModal(true);
  };

  const handleViewBids = async (auctionId) => {
    try {
      const bids = await AuctionBid.filter({ auction_id: auctionId }, '-created_at', 50);
      alert(`Total bids: ${bids.length}\n\nBids:\n${bids.map(b => `$${b.bid_amount} - ${b.created_at}`).join('\n')}`);
    } catch (err) {
      console.error('Error loading bids:', err);
      toastError('Error', 'Failed to load bids');
    }
  };

  const resetForm = () => {
    setFormData({
      product_id: '',
      title: '',
      description: '',
      starting_price: '',
      current_price: '',
      reserve_price: '',
      buy_now_price: '',
      images: [],
      auction_start: '',
      auction_end: '',
      status: 'upcoming',
      is_featured: false,
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'upcoming': return <Clock className="w-4 h-4 text-gray-500" />;
      case 'active': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'ended': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shop Auctions</h1>
              <p className="text-gray-600 mt-1">Manage auction listings and bids</p>
            </div>
            <Button
              onClick={() => {
                resetForm();
                setEditingAuction(null);
                setShowModal(true);
              }}
              className="bg-gray-900 text-white hover:bg-gray-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Auction
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid gap-4">
          {auctions.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">No auctions created yet. Click "Create Auction" to get started.</p>
              </CardContent>
            </Card>
          ) : (
            auctions.map((auction) => (
              <Card key={auction.id} className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {auction.images && auction.images.length > 0 && (
                        <img
                          src={Array.isArray(auction.images) ? auction.images[0] : JSON.parse(auction.images)[0]}
                          alt={auction.title}
                          className="w-24 h-24 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{auction.title}</h3>
                          {getStatusIcon(auction.status)}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                            auction.status === 'active' ? 'bg-green-100 text-green-700' :
                            auction.status === 'ended' ? 'bg-blue-100 text-blue-700' :
                            auction.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {auction.status}
                          </span>
                          {auction.is_featured && (
                            <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Starting: ${auction.starting_price} | Current: ${auction.current_price}
                        </p>
                        {auction.reserve_price && (
                          <p className="text-xs text-gray-500">Reserve: ${auction.reserve_price}</p>
                        )}
                        {auction.buy_now_price && (
                          <p className="text-xs text-gray-500">Buy Now: ${auction.buy_now_price}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(auction.auction_start).toLocaleDateString()} - {new Date(auction.auction_end).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBids(auction.id)}
                      >
                        <Gavel className="w-4 h-4 mr-1" />
                        View Bids
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(auction)}
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(auction.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAuction ? 'Edit Auction' : 'Create Auction'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <Label>Link to Product (Optional)</Label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="">-- Select Product --</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Auction Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Vintage Camera Lens"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the item being auctioned"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Starting Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.starting_price}
                    onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Current Price ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.current_price}
                    onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Reserve Price ($) - Optional</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.reserve_price}
                    onChange={(e) => setFormData({ ...formData, reserve_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Buy Now Price ($) - Optional</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.buy_now_price}
                    onChange={(e) => setFormData({ ...formData, buy_now_price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Auction Start</Label>
                  <Input
                    type="datetime-local"
                    value={formData.auction_start}
                    onChange={(e) => setFormData({ ...formData, auction_start: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Auction End</Label>
                  <Input
                    type="datetime-local"
                    value={formData.auction_end}
                    onChange={(e) => setFormData({ ...formData, auction_end: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Images</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                    id="auction-image-upload"
                  />
                  <label
                    htmlFor="auction-image-upload"
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400"
                  >
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Uploading...' : 'Add Image'}
                  </label>
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="relative">
                          <img src={img} alt={`Auction ${idx}`} className="w-full h-20 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="ended">Ended</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label>Featured</Label>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-gray-900 text-white hover:bg-gray-800">
                {editingAuction ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
