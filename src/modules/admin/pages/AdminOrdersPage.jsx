import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Search, Filter, Eye, Package, Truck, CheckCircle, XCircle, Clock, DollarSign, User, Calendar, MoreVertical } from 'lucide-react';

export default function AdminOrdersPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const mockOrders = [
          { id: 1, orderNumber: 'ORD-2026-001', customer: 'john@example.com', customerName: 'John Smith', total: 2999, status: 'completed', items: 3, paymentMethod: 'Stripe', shippingAddress: '123 Main St, Los Angeles, CA', orderDate: '2026-06-28T10:30:00', shippedDate: '2026-06-29T14:00:00' },
          { id: 2, orderNumber: 'ORD-2026-002', customer: 'jane@example.com', customerName: 'Jane Doe', total: 849, status: 'processing', items: 2, paymentMethod: 'PayPal', shippingAddress: '456 Oak Ave, New York, NY', orderDate: '2026-06-28T15:45:00', shippedDate: null },
          { id: 3, orderNumber: 'ORD-2026-003', customer: 'mike@example.com', customerName: 'Mike Johnson', total: 199, status: 'shipped', items: 1, paymentMethod: 'Stripe', shippingAddress: '789 Pine Rd, Chicago, IL', orderDate: '2026-06-27T09:15:00', shippedDate: '2026-06-28T11:00:00' },
          { id: 4, orderNumber: 'ORD-2026-004', customer: 'sarah@example.com', customerName: 'Sarah Williams', total: 598, status: 'pending', items: 2, paymentMethod: 'PayPal', shippingAddress: '321 Elm St, Miami, FL', orderDate: '2026-06-27T14:20:00', shippedDate: null },
          { id: 5, orderNumber: 'ORD-2026-005', customer: 'tom@example.com', customerName: 'Tom Brown', total: 1299, status: 'completed', items: 4, paymentMethod: 'Stripe', shippingAddress: '654 Maple Dr, Seattle, WA', orderDate: '2026-06-26T08:30:00', shippedDate: '2026-06-27T16:00:00' },
          { id: 6, orderNumber: 'ORD-2026-006', customer: 'lisa@example.com', customerName: 'Lisa Anderson', total: 349, status: 'cancelled', items: 1, paymentMethod: 'Stripe', shippingAddress: '987 Cedar Ln, Austin, TX', orderDate: '2026-06-26T11:45:00', shippedDate: null }
        ];
        setOrders(mockOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
        error('Error', 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      success('Updated', 'Order status updated successfully');
    } catch (err) {
      console.error('Error updating order status:', err);
      error('Failed', 'Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      setOrders(orders.filter(o => o.id !== orderId));
      success('Deleted', 'Order deleted successfully');
    } catch (err) {
      console.error('Error deleting order:', err);
      error('Failed', 'Failed to delete order');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'processing':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Processing</span>;
      case 'shipped':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Shipped</span>;
      case 'completed':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'cancelled':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Cancelled</span>;
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing':
        return <Package className="w-4 h-4 text-blue-600" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-purple-600" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
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
        <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-1">View and manage shop orders</p>
      </div>

      <div>
          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Orders</div>
                  <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Pending</div>
                  <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'pending').length}</div>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Processing</div>
                  <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'processing').length}</div>
                </div>
                <Package className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Shipped</div>
                  <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.status === 'shipped').length}</div>
                </div>
                <Truck className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Total Revenue</div>
                  <div className="text-2xl font-bold text-gray-900">${orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + o.total, 0).toLocaleString()}</div>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
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
                    placeholder="Search orders..."
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
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="text-sm text-gray-500">
                Total Orders: {filteredOrders.length}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                          <div className="text-xs text-gray-500">{order.shippingAddress}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                            <div className="text-sm text-gray-500">{order.customer}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.items}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {order.paymentMethod}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          {getStatusBadge(order.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteOrder(order.id)} title="Delete">
                            <XCircle className="w-4 h-4 text-red-600" />
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
    </div>
  );
}