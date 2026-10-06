import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Package, Search, Plus, Edit, Trash2, DollarSign, Box, Eye, ToggleLeft, ToggleRight, Image as ImageIcon, Tag, MoreVertical, ShoppingCart } from 'lucide-react';
import { ShopProduct } from '@/lib/supabaseEntities';

export default function AdminProductsPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category: '',
    stock: '',
    sku: '',
    images: [],
    status: 'active',
    featured: false,
    auction_enabled: false,
    auction_type: 'time',
    auction_duration_hours: 24,
    auction_end_time: '',
    auction_target_count: 1000,
    auction_participants: 0,
    currency: 'KES',
    fulfillment: 'physical',
  });

  const categories = ['Wardrobe', 'Equipment', 'Merchandise', 'Collectibles', 'Experiences'];
  const currencies = ['KES', 'USD', 'EUR', 'GBP'];
  const auctionTypes = ['time', 'count'];
  const fulfillmentTypes = ['physical', 'digital'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await ShopProduct.list('-created_at');
        setProducts(allProducts || []);
      } catch (err) {
        console.error('Error fetching products:', err);
        error('Error', 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCreateProduct = async () => {
    try {
      const newProduct = await ShopProduct.create({
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        sold: 0,
        images: productForm.images.length > 0 ? productForm.images : ['placeholder.jpg']
      });
      setProducts([...products, newProduct]);
      success('Success', 'Product created successfully');
      setShowModal(false);
      setProductForm({ name: '', description: '', price: '', discount_price: '', category: '', stock: '', sku: '', images: [], status: 'active', featured: false, auction_enabled: false, auction_type: 'time', auction_duration_hours: 24, auction_end_time: '', auction_target_count: 1000, auction_participants: 0, currency: 'KES', fulfillment: 'physical' });
    } catch (err) {
      console.error('Error creating product:', err);
      error('Failed', 'Failed to create product');
    }
  };

  const handleUpdateProduct = async (productId, updates) => {
    try {
      setProducts(products.map(p => p.id === productId ? { ...p, ...updates } : p));
      success('Success', 'Product updated successfully');
    } catch (err) {
      console.error('Error updating product:', err);
      error('Failed', 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      setProducts(products.filter(p => p.id !== productId));
      success('Deleted', 'Product deleted successfully');
    } catch (err) {
      console.error('Error deleting product:', err);
      error('Failed', 'Failed to delete product');
    }
  };

  const handleToggleStatus = async (productId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    await handleUpdateProduct(productId, { status: newStatus });
  };

  const handleToggleFeatured = async (productId, currentFeatured) => {
    await handleUpdateProduct(productId, { featured: !currentFeatured });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Active</span>;
      case 'inactive':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Inactive</span>;
      case 'out_of_stock':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Out of Stock</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || product.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
        <p className="text-gray-600 mt-1">Manage shop products and inventory</p>
      </div>

      <div>
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Products</div>
                <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Stock</div>
                <div className="text-2xl font-bold text-gray-900">{products.reduce((sum, p) => sum + p.stock, 0)}</div>
              </div>
              <Box className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Sold</div>
                <div className="text-2xl font-bold text-gray-900">{products.reduce((sum, p) => sum + p.sold, 0)}</div>
              </div>
              <ShoppingCart className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Featured Products</div>
                <div className="text-2xl font-bold text-gray-900">{products.filter(p => p.featured).length}</div>
              </div>
              <Tag className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <Button onClick={() => setShowModal(true)} className="bg-black text-white hover:bg-gray-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Auction</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {product.currency} {product.price.toLocaleString()}
                      {product.discount_price && <span className="ml-2 text-xs text-green-600">({product.currency} {product.discount_price.toLocaleString()})</span>}
                    </td>
                    <td className="px-6 py-4">
                      {product.auction_enabled ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          {product.auction_type === 'time' ? 'Time' : 'Count'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Normal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(product.id, product.featured)}
                        className="p-2"
                      >
                        {product.featured ? <Tag className="w-5 h-5 text-orange-600 fill-orange-600" /> : <Tag className="w-5 h-5 text-gray-400" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" title="View">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleToggleStatus(product.id, product.status)} title="Toggle Status">
                          {product.status === 'active' ? <ToggleLeft className="w-4 h-4 text-red-600" /> : <ToggleRight className="w-4 h-4 text-green-600" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id)} title="Delete">
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Product</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price (Optional)</label>
                  <input
                    type="number"
                    value={productForm.discount_price}
                    onChange={(e) => setProductForm({ ...productForm, discount_price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <select
                    value={productForm.currency}
                    onChange={(e) => setProductForm({ ...productForm, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    {currencies.map(curr => <option key={curr} value={curr}>{curr}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fulfillment Type</label>
                <select
                  value={productForm.fulfillment}
                  onChange={(e) => setProductForm({ ...productForm, fulfillment: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {fulfillmentTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                </select>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={productForm.auction_enabled}
                    onChange={(e) => setProductForm({ ...productForm, auction_enabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Auction</span>
                </label>
                {productForm.auction_enabled && (
                  <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Auction Type</label>
                      <select
                        value={productForm.auction_type}
                        onChange={(e) => setProductForm({ ...productForm, auction_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        {auctionTypes.map(type => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}-based</option>)}
                      </select>
                    </div>
                    {productForm.auction_type === 'time' ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                          <input
                            type="number"
                            value={productForm.auction_duration_hours}
                            onChange={(e) => setProductForm({ ...productForm, auction_duration_hours: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <input
                            type="datetime-local"
                            value={productForm.auction_end_time}
                            onChange={(e) => setProductForm({ ...productForm, auction_end_time: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Participant Count</label>
                        <input
                          type="number"
                          value={productForm.auction_target_count}
                          onChange={(e) => setProductForm({ ...productForm, auction_target_count: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={productForm.featured}
                    onChange={(e) => setProductForm({ ...productForm, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Featured Product</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleCreateProduct} className="bg-black text-white hover:bg-gray-800">Add Product</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}