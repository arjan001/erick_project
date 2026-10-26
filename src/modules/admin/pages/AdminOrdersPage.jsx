import React, { useState, useEffect } from 'react'
import { useToast } from '@/hooks/useToast'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ShoppingCart, Search, Eye, Package, Truck, CheckCircle, XCircle, Clock, DollarSign, User, Calendar, Download, FileText } from 'lucide-react'
import DataTable from '@/components/admin/DataTable'
import { auditService } from '@/services/auditService'

export default function AdminOrdersPage() {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [orderItems, setOrderItems] = useState([])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/shop_orders?select=*&order=created_at.desc`, {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setOrders(data || [])
        
        await auditService.log({
          action: 'read',
          entity_type: 'shop_orders',
          module_name: 'admin',
          metadata: { count: data?.length || 0 }
        })
      } catch (err) {
        await auditService.logError(err, 'admin', { action: 'read_orders' })
        console.error('Error fetching orders:', err)
        error('Failed', 'Failed to load orders')
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const fetchOrderItems = async (orderId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/shop_order_items?order_id=eq.${orderId}&select=*`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setOrderItems(data || [])
    } catch (err) {
      console.error('Error fetching order items:', err)
      setOrderItems([])
    }
  }

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/shop_orders?id=eq.${orderId}`, {
        method: 'PATCH',
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({ order_status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setOrders(orders.map(o => o.id === orderId ? { ...o, order_status: newStatus } : o))
      success('Updated', 'Order status updated successfully')
    } catch (err) {
      console.error('Error updating order status:', err)
      error('Failed', 'Failed to update order status')
    }
  }

  const handleViewOrder = async (order) => {
    setSelectedOrder(order)
    await fetchOrderItems(order.id)
    setShowModal(true)
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>
      case 'processing':
      case 'confirmed':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Processing</span>
      case 'shipped':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Shipped</span>
      case 'completed':
      case 'delivered':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completed</span>
      case 'cancelled':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Cancelled</span>
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status || 'Unknown'}</span>
    }
  }

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Paid</span>
      case 'pending':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>
      case 'failed':
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Failed</span>
      default:
        return <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status || 'Unknown'}</span>
    }
  }

  const columns = [
    { key: 'order_number', label: 'Order #', sortable: true, filterable: true },
    { key: 'customer_name', label: 'Customer', sortable: true, filterable: true },
    { key: 'customer_email', label: 'Email', sortable: true, filterable: true },
    { key: 'total', label: 'Total', sortable: true, filterable: false, render: (value) => `${value?.toLocaleString() || 0} KES` },
    { key: 'payment_status', label: 'Payment', sortable: true, filterable: true, render: (value) => getPaymentStatusBadge(value) },
    { key: 'order_status', label: 'Status', sortable: true, filterable: true, render: (value) => getStatusBadge(value) },
    { key: 'created_at', label: 'Order Date', sortable: true, filterable: false, render: (value) => value ? new Date(value).toLocaleDateString() : '-' }
  ]

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Total Orders</div>
                <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Pending</div>
                <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.order_status === 'pending').length}</div>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Processing</div>
                <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.order_status === 'processing' || o.order_status === 'confirmed').length}</div>
              </div>
              <Package className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Shipped</div>
                <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.order_status === 'shipped').length}</div>
              </div>
              <Truck className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Revenue</div>
                <div className="text-2xl font-bold text-gray-900">{orders.filter(o => o.order_status !== 'cancelled' && o.payment_status === 'paid').reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()} KES</div>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p className="mb-4">No orders yet</p>
              <p className="text-sm">Orders will appear here when customers make purchases</p>
            </div>
          ) : (
            <DataTable
              data={orders}
              columns={columns}
              searchable={true}
              exportable={true}
              pagination={true}
              pageSize={10}
              onRowClick={(row) => handleViewOrder(row)}
              actions={(row) => (
                <div className="flex items-center gap-2">
                  <select
                    value={row.order_status}
                    onChange={(e) => handleUpdateOrderStatus(row.id, e.target.value)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            />
          )}
        </CardContent>
      </Card>

      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <p className="text-sm text-gray-500">Order #{selectedOrder.order_number}</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Information</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900"><span className="font-medium">Name:</span> {selectedOrder.customer_name}</p>
                    <p className="text-sm text-gray-900"><span className="font-medium">Email:</span> {selectedOrder.customer_email}</p>
                    <p className="text-sm text-gray-900"><span className="font-medium">Phone:</span> {selectedOrder.customer_phone || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Order Information</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-900"><span className="font-medium">Status:</span> {getStatusBadge(selectedOrder.order_status)}</p>
                    <p className="text-sm text-gray-900"><span className="font-medium">Payment:</span> {getPaymentStatusBadge(selectedOrder.payment_status)}</p>
                    <p className="text-sm text-gray-900"><span className="font-medium">Payment Method:</span> {selectedOrder.payment_method || 'N/A'}</p>
                    <p className="text-sm text-gray-900"><span className="font-medium">Order Date:</span> {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Delivery Address</h3>
                <p className="text-sm text-gray-900">{selectedOrder.delivery_address || 'N/A'}</p>
                {selectedOrder.city && <p className="text-sm text-gray-900">{selectedOrder.city}, {selectedOrder.county || 'N/A'}</p>}
                {selectedOrder.delivery_notes && <p className="text-sm text-gray-500 mt-1">Notes: {selectedOrder.delivery_notes}</p>}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
                {orderItems.length === 0 ? (
                  <p className="text-sm text-gray-500">No items found</p>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orderItems.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.product_name}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.unit_price?.toLocaleString()} KES</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{(item.unit_price * item.quantity)?.toLocaleString()} KES</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal:</span>
                  <span className="text-gray-900">{selectedOrder.subtotal?.toLocaleString()} KES</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Shipping:</span>
                  <span className="text-gray-900">{selectedOrder.shipping_cost?.toLocaleString()} KES</span>
                </div>
                <div className="flex justify-between text-lg font-bold mt-2">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">{selectedOrder.total?.toLocaleString()} KES</span>
                </div>
              </div>

              {selectedOrder.mpesa_receipt && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">M-Pesa Transaction</h3>
                  <p className="text-sm text-gray-900">Receipt: {selectedOrder.mpesa_receipt}</p>
                  {selectedOrder.checkout_request_id && <p className="text-sm text-gray-900">Checkout ID: {selectedOrder.checkout_request_id}</p>}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowModal(false)}>Close</Button>
              <Button className="bg-black text-white hover:bg-gray-800">
                <Download className="w-4 h-4 mr-2" /> Download Invoice
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
