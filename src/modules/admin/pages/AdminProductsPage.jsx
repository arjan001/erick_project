import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import AdminSidebar from '@/components/AdminSidebar';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Package, Search, Plus, Edit, Trash2, DollarSign, Box, Eye, ToggleLeft, ToggleRight, Image as ImageIcon, Tag, MoreVertical, ShoppingCart } from 'lucide-react';

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [user, setUser] = useState(null);
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
    category: '',
    stock: '',
    sku: '',
    images: [],
    status: 'active',
    featured: false
  });

  const categories = ['Video Equipment', 'Lighting', 'Audio', 'Accessories', 'Software', 'Studio Gear', 'Merchandise'];

  useEffect(() => {
    const storedUser = localStorage.getItem('studio22_user');
    if (!storedUser) {
      window.location.href = '/signin';
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'artist_admin') {
      window.location.href = '/';
      return;
    }
    setUser(parsedUser);
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchProducts = async () => {
      try {
        const mockProducts = [
          { id: 1, name: 'Professional Camera Kit', description: 'High-end camera with lens kit for professional video production', price: 2999, category: 'Video Equipment', stock: 15, sku: 'CAM-001', status: 'active', featured: true, images: ['camera1.jpg'], sold: 45 },
          { id: 2, name: 'LED Lighting Panel', description: 'Adjustable LED lighting panel for studio and field use', price: 499, category: 'Lighting', stock: 30, sku: 'LGT-001', status: 'active', featured: false, images: ['light1.jpg'], sold: 120 },
          { id: 3, name: 'Wireless Microphone System', description: 'Professional wireless microphone system with 4 channels', price: 899, category: 'Audio', stock: 20, sku: 'AUD-001', status: 'active', featured: true, images: ['mic1.jpg'], sold: 67 },
          { id: 4, name: 'Camera Stabilizer', description: '3-axis gimbal stabilizer for smooth camera movement', price: 349, category: 'Accessories', stock: 25, sku: 'ACC-001', status: 'active', featured: false, images: ['gimbal1.jpg'], sold: 89 },
          { id: 5, name: 'Video Editing Software License', description: 'Annual license for professional video editing software', price: 199, category: 'Software', stock: 999, sku: 'SFT-001', status: 'active', featured: false, images: ['soft1.jpg'], sold: 234 },
          { id: 6, name: 'Studio Backdrop Kit', description: 'Complete backdrop kit with stands and multiple colors', price: 249, category: 'Studio Gear', stock: 18, sku: 'STU-001', status: 'inactive', featured: false, images: ['backdrop1.jpg'], sold: 56 },
          { id: 7, name: 'Studio22 T-Shirt', description: 'Official Studio22 branded merchandise', price: 29, category: 'Merchandise', stock: 100, sku: 'MER-001', status: 'active', featured: false, images: ['shirt1.jpg'], sold: 312 },
          { id: 8, name: 'Tripod Kit', description: 'Heavy-duty tripod with fluid head for professional cameras', price: 599, category: 'Accessories', stock: 12, sku: 'ACC-002', status: 'active', featured: true, images: ['tripod1.jpg'], sold: 78 }
        ];
        setProducts(mockProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        error('Error', 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const handleCreateProduct = async () => {
    try {
      const newProduct = {
        id: Date.now(),
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock),
        sold: 0,
        images: productForm.images.length > 0 ? productForm.images : ['placeholder.jpg']
      };
      setProducts([...products, newProduct]);
      success('Success', 'Product created successfully');
      setShowModal(false);
      setProductForm({ name: '', description: '', price: '', category: '', stock: '', sku: '', images: [], status: 'active', featured: false });
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

  if (!user || loading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white">
      <AdminSidebar />
      <main className="fixed inset-0 flex flex-col bg-white pl-20">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600 mt-1">Manage shop products and inventory</p>
        </div>

        <div className="flex-1 overflow-auto p-6">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sold</th>
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
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {product.sold}
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
      </main>

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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
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