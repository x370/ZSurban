import React, { useState, useEffect } from 'react';
import { fetchOrdersAdmin, updateOrderAdmin, AdminOrder } from '../api/orders';
import { CircularProgress, Alert } from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Visibility as VisibilityIcon,
  LocalShipping as ShippingIcon,
  Payment as PaymentIcon,
  Person as PersonIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import Button from './Button';
import Input from './Input';

export default function OrdersPanel() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Detail Modal state
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOrdersAdmin();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateStatus = async (
    orderId: string,
    payload: { orderStatus?: string; paymentStatus?: string }
  ) => {
    try {
      setUpdatingId(orderId);
      const updatedOrder = await updateOrderAdmin(orderId, payload);
      
      // Update local state list
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, ...updatedOrder } : o))
      );

      // Update selected order detail if it's currently open
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, ...updatedOrder } : null));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter and Search logic
  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      order._id.toLowerCase().includes(query) ||
      order.fullName.toLowerCase().includes(query) ||
      order.email.toLowerCase().includes(query) ||
      order.phone.toLowerCase().includes(query) ||
      (order.city && order.city.toLowerCase().includes(query));

    const matchesStatus =
      statusFilter === 'all' || order.orderStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Reset page when filter/search changes
  useEffect(() => { setPage(1); }, [searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const pagedOrders = filteredOrders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Get status class for Order Status
  const getOrderStatusClass = (status: string) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'processing':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'shipped':
        return 'bg-purple-50 text-purple-600 border border-purple-100';
      case 'delivered':
        return 'bg-emerald-50 text-[#00b884] border border-emerald-100';
      case 'cancelled':
        return 'bg-rose-50 text-red-500 border border-rose-100';
      default:
        return 'bg-zinc-50 text-zinc-650 border border-zinc-200';
    }
  };

  // Get status class for Payment Status
  const getPaymentStatusClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-emerald-50 text-[#00b884] border border-emerald-100';
      case 'pending':
        return 'bg-amber-50 text-amber-600 border border-amber-100';
      case 'unpaid':
        return 'bg-zinc-100 text-zinc-500 border border-zinc-200';
      case 'refunded':
        return 'bg-rose-50 text-red-500 border border-rose-100';
      default:
        return 'bg-zinc-50 text-zinc-600 border border-zinc-200';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Orders</h2>
          <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
            {orders.length} total orders placed
          </p>
        </div>
        <Button
          onClick={loadOrders}
          variant="outline"
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"
        >
          <span>Refresh</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-zinc-200/50 rounded-2xl p-4 shadow-3xs">
        <div className="w-full md:w-80">
          <Input
            id="order-search"
            placeholder="Search by ID, name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<SearchIcon className="text-zinc-400" sx={{ fontSize: 18 }} />}
          />
        </div>

        {/* Tab-like filter links */}
        <div className="flex flex-wrap gap-1.5">
          {['all', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold capitalize transition-all select-none cursor-pointer ${
                statusFilter === status
                  ? 'bg-zinc-900 text-white shadow-2xs'
                  : 'bg-zinc-50 text-zinc-400 border border-zinc-200/40 hover:bg-zinc-100 hover:text-zinc-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert severity="error" className="rounded-2xl text-xs">
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <CircularProgress size={32} sx={{ color: '#00b884' }} />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400 bg-white border border-zinc-200/50 rounded-2xl">
          <ReceiptIcon sx={{ fontSize: 44, color: '#e4e4e7' }} className="mb-3" />
          <p className="text-sm font-bold">No orders found</p>
          <p className="text-xs text-zinc-350 mt-1">Try tweaking your search or filter options</p>
        </div>
      ) : (
        <div className="bg-white border border-zinc-200/50 rounded-2xl overflow-hidden shadow-3xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-wider select-none">
                  <th className="px-5 py-3">Order ID</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Order Status</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 text-xs">
                {pagedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-zinc-500">
                      #{order._id.substring(order._id.length - 6).toUpperCase()}
                    </td>
                    <td className="px-5 py-4 text-zinc-400 font-medium">
                      {new Date(order.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-zinc-900">{order.fullName}</span>
                        <span className="text-[10px] text-zinc-400 font-medium mt-0.5">{order.phone}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-3xs font-extrabold uppercase text-zinc-400 tracking-wider">
                          {order.paymentMethod.toUpperCase()}
                        </span>
                        <select
                          value={order.paymentStatus}
                          onChange={(e) =>
                            handleUpdateStatus(order._id, { paymentStatus: e.target.value })
                          }
                          disabled={updatingId === order._id}
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full select-none cursor-pointer outline-none w-max ${getPaymentStatusClass(
                            order.paymentStatus
                          )}`}
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="pending">Pending</option>
                          <option value="paid">Paid</option>
                          <option value="refunded">Refunded</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleUpdateStatus(order._id, { orderStatus: e.target.value })
                        }
                        disabled={updatingId === order._id}
                        className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full select-none cursor-pointer outline-none w-max ${getOrderStatusClass(
                          order.orderStatus
                        )}`}
                      >
                        <option value="placed">Placed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 font-black text-zinc-900">
                      PKR {order.total.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="outline"
                        className="rounded-lg p-1.5 hover:border-zinc-400 inline-flex items-center gap-1.5"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <VisibilityIcon sx={{ fontSize: 14 }} />
                        <span className="text-2xs font-extrabold">Details</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {filteredOrders.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 bg-zinc-50/50">
              <span className="text-[10px] font-bold text-zinc-400">
                Page <span className="text-zinc-700">{page}</span> of <span className="text-zinc-700">{totalPages}</span>
                {' '}· <span className="text-zinc-700">{filteredOrders.length}</span> orders
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeftIcon sx={{ fontSize: 16 }} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                  .reduce<(number | '...')[]>((acc, n, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (n as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                    acc.push(n);
                    return acc;
                  }, [])
                  .map((n, i) =>
                    n === '...' ? (
                      <span key={`dots-${i}`} className="w-7 h-7 flex items-center justify-center text-[10px] text-zinc-400">…</span>
                    ) : (
                      <button key={n} onClick={() => setPage(n as number)}
                        className={`w-7 h-7 rounded-lg text-[10px] font-black transition-colors cursor-pointer ${
                          page === n ? 'bg-zinc-900 text-white' : 'border border-zinc-200 text-zinc-500 hover:bg-zinc-100'
                        }`}>{n}</button>
                    )
                  )}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronRightIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs transition-opacity duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 flex flex-col gap-6 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-700 bg-zinc-50 border border-zinc-100 hover:bg-zinc-100 rounded-full p-1.5 cursor-pointer transition-colors"
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </button>

            {/* Modal Title Header */}
            <div className="flex items-center gap-3.5 border-b border-zinc-100 pb-5">
              <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-150 flex items-center justify-center text-zinc-700">
                <ReceiptIcon sx={{ fontSize: 22 }} />
              </div>
              <div className="text-left">
                <h3 className="text-base font-black text-zinc-900 tracking-tight flex items-center gap-2">
                  <span>Order Details</span>
                  <span className="text-xs font-mono font-bold text-zinc-400">
                    #{selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}
                  </span>
                </h3>
                <p className="text-3xs text-zinc-400 font-extrabold uppercase mt-1 tracking-wider">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()} at{' '}
                  {new Date(selectedOrder.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Main Details Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Shipping Address */}
              <div className="bg-zinc-50/50 border border-zinc-100 rounded-2xl p-5 text-left flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-zinc-200/40 pb-2">
                  <PersonIcon sx={{ fontSize: 16, color: '#71717a' }} />
                  <span className="text-2xs font-extrabold uppercase text-zinc-400 tracking-wider">
                    Customer & Shipping
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 text-xs text-zinc-800 font-medium">
                  <div className="flex flex-col">
                    <span className="text-3xs font-extrabold text-zinc-400 uppercase tracking-widest leading-none">
                      Name
                    </span>
                    <span className="font-bold text-zinc-950 mt-1">{selectedOrder.fullName}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xs font-extrabold text-zinc-400 uppercase tracking-widest leading-none">
                      Contact details
                    </span>
                    <span className="mt-1">{selectedOrder.email}</span>
                    <span>{selectedOrder.phone}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-3xs font-extrabold text-zinc-400 uppercase tracking-widest leading-none">
                      Delivery address
                    </span>
                    <span className="mt-1 font-semibold">{selectedOrder.address}</span>
                    <span className="text-2xs text-zinc-500 mt-0.5">
                      {selectedOrder.city}, {selectedOrder.province} {selectedOrder.postalCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Change Control */}
              <div className="bg-zinc-50/50 border border-zinc-100 rounded-2xl p-5 text-left flex flex-col gap-4.5">
                <div className="flex items-center gap-2 border-b border-zinc-200/40 pb-2">
                  <ShippingIcon sx={{ fontSize: 16, color: '#71717a' }} />
                  <span className="text-2xs font-extrabold uppercase text-zinc-400 tracking-wider">
                    Operations & Logistics
                  </span>
                </div>

                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-3xs font-black text-zinc-450 uppercase tracking-wider">
                      Order Status
                    </label>
                    <select
                      value={selectedOrder.orderStatus}
                      onChange={(e) =>
                        handleUpdateStatus(selectedOrder._id, { orderStatus: e.target.value })
                      }
                      className={`text-xs font-bold px-3 py-2 rounded-xl border border-zinc-200 select-none cursor-pointer outline-none w-full bg-white`}
                    >
                      <option value="placed">Placed (Order Received)</option>
                      <option value="processing">Processing (Preparing)</option>
                      <option value="shipped">Shipped (In Transit)</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-3xs font-black text-zinc-450 uppercase tracking-wider">
                      Payment Status
                    </label>
                    <select
                      value={selectedOrder.paymentStatus}
                      onChange={(e) =>
                        handleUpdateStatus(selectedOrder._id, { paymentStatus: e.target.value })
                      }
                      className={`text-xs font-bold px-3 py-2 rounded-xl border border-zinc-200 select-none cursor-pointer outline-none w-full bg-white`}
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-3xs font-extrabold text-zinc-400 uppercase tracking-widest leading-none">
                      Payment Method
                    </span>
                    <span className="text-xs font-bold text-zinc-800 mt-1 uppercase">
                      {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : selectedOrder.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Breakdown */}
            <div className="text-left">
              <h4 className="text-xs font-extrabold uppercase text-zinc-400 tracking-wider mb-3">
                Order Items ({selectedOrder.items.length})
              </h4>
              <div className="border border-zinc-100 rounded-2xl overflow-hidden bg-white max-h-48 overflow-y-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-wider select-none">
                      <th className="px-4 py-2.5">Product</th>
                      <th className="px-4 py-2.5 text-center">Qty</th>
                      <th className="px-4 py-2.5 text-right">Price</th>
                      <th className="px-4 py-2.5 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 font-medium">
                    {selectedOrder.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/20">
                        <td className="px-4 py-3 flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-8 h-8 rounded-lg object-cover border border-zinc-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 border border-zinc-150 flex items-center justify-center text-zinc-400">
                              <ReceiptIcon sx={{ fontSize: 14 }} />
                            </div>
                          )}
                          <span className="font-bold text-zinc-900 truncate max-w-64">
                            {item.title}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-zinc-650">{item.quantity}</td>
                        <td className="px-4 py-3 text-right text-zinc-500">
                          PKR {item.price.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-zinc-900">
                          PKR {(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Calculations and Footer summary */}
            <div className="border-t border-zinc-100 pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-left">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                  Payment Status summary
                </span>
                <div className="flex gap-2 items-center mt-1.5">
                  <span
                    className={`text-2xs font-extrabold px-2.5 py-0.5 rounded-full select-none capitalize ${getPaymentStatusClass(
                      selectedOrder.paymentStatus
                    )}`}
                  >
                    Payment: {selectedOrder.paymentStatus}
                  </span>
                  <span
                    className={`text-2xs font-extrabold px-2.5 py-0.5 rounded-full select-none capitalize ${getOrderStatusClass(
                      selectedOrder.orderStatus
                    )}`}
                  >
                    Delivery: {selectedOrder.orderStatus}
                  </span>
                </div>
              </div>

              {/* Total calculations table */}
              <div className="w-full sm:w-60 text-xs font-semibold text-zinc-600 flex flex-col gap-2 text-left self-end">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-zinc-900">PKR {selectedOrder.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="text-zinc-900">PKR {selectedOrder.shippingFee.toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-[#00b884]">
                    <span>Discount</span>
                    <span>-PKR {selectedOrder.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-zinc-150 pt-2 text-sm font-black text-zinc-900">
                  <span>Total</span>
                  <span>PKR {selectedOrder.total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
