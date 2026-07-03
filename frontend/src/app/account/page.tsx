'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import { logout, loginSuccess } from '../../features/auth/slice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  Logout as LogoutIcon,
  Close as CloseIcon,
  Receipt as ReceiptIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { fetchOrdersByUser, ApiOrder } from '../../api/orders';
import { updateUserProfile } from '../../api/users';

type ActiveTab = 'orders' | 'settings';

function AccountDashboardContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);

  const [activeTab, setActiveTab] = useState<ActiveTab>('orders');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/');
    }
  }, [user, router]);

  // Order Detail Dialog
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Orders data
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Settings state
  const [settingsName, setSettingsName] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setSettingsName(user.name || '');
    }
  }, [user]);

  useEffect(() => {
    if (user && user.email) {
      const loadUserOrders = async () => {
        try {
          setLoadingOrders(true);
          setOrdersError(null);
          const data = await fetchOrdersByUser(user.email);
          setOrders(data);
        } catch (err: any) {
          setOrdersError(err.message || 'Failed to load your orders.');
        } finally {
          setLoadingOrders(false);
        }
      };
      loadUserOrders();
    }
  }, [user]);

  if (!user) return null;

  const handleLogoutClick = () => {
    dispatch(logout());
    router.push('/');
  };

  const handleOpenOrderDetails = (order: ApiOrder) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const getInitials = (name: string) =>
    name.split(' ').map(p => p.charAt(0)).join('').toUpperCase().substring(0, 2);

  const getStatusLabelAndClass = (status: string) => {
    switch (status) {
      case 'delivered': return { label: 'Delivered', cls: 'bg-emerald-50 text-emerald-600' };
      case 'shipped':   return { label: 'Shipped',   cls: 'bg-blue-50 text-blue-600' };
      case 'processing':return { label: 'Processing',cls: 'bg-amber-50 text-amber-600' };
      case 'placed':    return { label: 'Placed',    cls: 'bg-blue-50 text-blue-600' };
      case 'cancelled': return { label: 'Cancelled', cls: 'bg-rose-50 text-red-500' };
      default:          return { label: status,      cls: 'bg-zinc-50 text-zinc-650' };
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError(null);
    setSettingsSuccess(false);
    try {
      const payload: { name?: string; password?: string } = {};
      if (settingsName && settingsName !== user.name) payload.name = settingsName;
      if (settingsPassword) payload.password = settingsPassword;
      if (Object.keys(payload).length === 0) {
        setSettingsError('No changes made.');
        setSettingsLoading(false);
        return;
      }
      const updatedUser = await updateUserProfile(user._id, payload);
      
      dispatch(loginSuccess({
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role
        },
        token: localStorage.getItem('zs_token') || ''
      }));

      localStorage.setItem('zs_user', JSON.stringify({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role
      }));

      setSettingsSuccess(true);
      setSettingsPassword('');
    } catch (err: any) {
      setSettingsError(err.message || 'Update failed.');
    } finally {
      setSettingsLoading(false);
    }
  };

  const navItems = [
    { key: 'orders' as ActiveTab, label: 'My Orders', icon: <ReceiptIcon sx={{ fontSize: 18 }} /> },
    { key: 'settings' as ActiveTab, label: 'Settings', icon: <SettingsIcon sx={{ fontSize: 18 }} /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50 font-sans">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-zinc-150 px-4 py-3.5 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link href="/" className="cursor-pointer flex items-center gap-2 select-none">
            <div className="bg-zinc-950 text-white p-2 rounded-xl flex items-center justify-center shadow-xs">
              <ShoppingBagIcon fontSize="small" />
            </div>
            <div className="text-left">
              <span className="font-black text-zinc-900 tracking-tight text-sm leading-tight block">ZSurban</span>
              <span className="text-[9px] text-zinc-400 font-bold block mt-0.5 uppercase tracking-wide">Customer Dashboard</span>
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full pl-2.5 pr-4 py-1.5 select-none">
              <Avatar
                sx={{ width: 26, height: 26, bgcolor: '#18181b', color: 'white', fontSize: '11px', fontWeight: 900 }}
              >
                {getInitials(user.name)}
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="text-zinc-800 font-extrabold text-[10px] uppercase tracking-wider leading-none">{user.name}</span>
                <span className="text-zinc-400 font-bold text-[8px] mt-0.5 leading-none">{user.email}</span>
              </div>
            </div>
            <button
              onClick={handleLogoutClick}
              className="flex items-center gap-2 border border-red-200 hover:border-red-300 text-red-500 hover:text-red-700 bg-white hover:bg-rose-50/20 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <LogoutIcon sx={{ fontSize: 16 }} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Body — Sidebar + Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 flex gap-6 items-start">

        {/* ── Sidebar ── */}
        <aside className="hidden sm:flex flex-col gap-1 w-56 shrink-0">
          {/* User Card */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl p-4 mb-3 flex flex-col items-center gap-3 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-xl select-none shadow-md">
              {getInitials(user.name)}
            </div>
            <div className="text-center">
              <p className="text-sm font-extrabold text-zinc-900 tracking-tight leading-snug">{user.name}</p>
              <p className="text-[10px] font-bold text-zinc-400 mt-0.5 leading-none">{user.email}</p>
            </div>
            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full select-none">
              Customer
            </span>
          </div>

          {/* Nav Items */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-sm">
            {navItems.map((item, idx) => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-xs font-bold transition-all cursor-pointer text-left
                  ${idx !== 0 ? 'border-t border-zinc-100' : ''}
                  ${activeTab === item.key
                    ? 'bg-zinc-950 text-white'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {activeTab === item.key && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00b884]" />
                )}
              </button>
            ))}
          </div>

          {/* Logout in sidebar */}
          <button
            onClick={handleLogoutClick}
            className="mt-2 w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:text-red-600 hover:bg-red-50/50 border border-red-100 hover:border-red-200 rounded-2xl transition-all cursor-pointer"
          >
            <LogoutIcon sx={{ fontSize: 18 }} />
            <span>Logout</span>
          </button>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 min-w-0">

          {/* Mobile Tab Switcher */}
          <div className="flex sm:hidden gap-2 mb-5">
            {navItems.map(item => (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border
                  ${activeTab === item.key
                    ? 'bg-zinc-950 text-white border-zinc-950'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:text-zinc-900'
                  }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* ── MY ORDERS TAB ── */}
          {activeTab === 'orders' && (
            <div className="bg-white border border-zinc-200/50 rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col gap-5 text-left">
              <div className="border-b border-zinc-100 pb-4">
                <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Order History</h2>
                <p className="text-[10px] font-bold text-zinc-400 mt-0.5">Track your packages, check order statuses, and view invoices.</p>
              </div>

              <div className="overflow-x-auto">
                {loadingOrders ? (
                  <div className="flex items-center justify-center py-10 w-full">
                    <CircularProgress size={28} sx={{ color: '#00b884' }} />
                  </div>
                ) : ordersError ? (
                  <Alert severity="error" className="rounded-2xl text-xs">{ordersError}</Alert>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 flex flex-col items-center gap-4 text-zinc-450 text-xs font-semibold">
                    <span>You have not placed any orders yet.</span>
                    <Link href="/shop" className="bg-zinc-950 hover:bg-black text-white text-2xs font-extrabold px-6 py-2.5 rounded-xl transition-all shadow-sm active:scale-97 cursor-pointer">
                      Start Shopping
                    </Link>
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100 text-[10px] font-black text-zinc-400 uppercase tracking-wider select-none">
                        <th className="pb-3 pr-2">Order ID</th>
                        <th className="pb-3 px-2">Date</th>
                        <th className="pb-3 px-2">Items</th>
                        <th className="pb-3 px-2 text-right">Total (PKR)</th>
                        <th className="pb-3 px-2 text-center">Status</th>
                        <th className="pb-3 pl-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 text-xs font-semibold text-zinc-800">
                      {orders.map((order) => {
                        const statusInfo = getStatusLabelAndClass(order.orderStatus);
                        const itemsSummary = order.items.map(i => i.title).join(', ');
                        return (
                          <tr key={order._id} className="hover:bg-zinc-50/50 transition-colors">
                            <td className="py-4 pr-2 font-mono text-zinc-500 font-bold">
                              #{order._id.substring(order._id.length - 6).toUpperCase()}
                            </td>
                            <td className="py-4 px-2 text-zinc-450 font-bold">
                              {new Date(order.createdAt).toLocaleDateString(undefined, {
                                month: 'short', day: 'numeric', year: 'numeric',
                              })}
                            </td>
                            <td className="py-4 px-2 text-zinc-800 max-w-[200px] truncate">{itemsSummary}</td>
                            <td className="py-4 px-2 text-right font-black text-zinc-900">
                              {order.total.toLocaleString()}
                            </td>
                            <td className="py-4 px-2 text-center">
                              <span className={`inline-block text-[9px] font-black uppercase px-2.5 py-1 rounded-full select-none ${statusInfo.cls}`}>
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="py-4 pl-2 text-right">
                              <button
                                onClick={() => handleOpenOrderDetails(order)}
                                className="text-zinc-950 hover:text-zinc-650 hover:underline font-extrabold cursor-pointer text-2xs"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── SETTINGS TAB ── */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-zinc-200/50 rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col gap-6 text-left">
              <div className="border-b border-zinc-100 pb-4">
                <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Account Settings</h2>
                <p className="text-[10px] font-bold text-zinc-400 mt-0.5">Update your name and change your password.</p>
              </div>

              {settingsError && (
                <div className="bg-rose-50 text-red-500 border border-rose-100 rounded-2xl p-4 text-xs font-semibold">
                  {settingsError}
                </div>
              )}
              {settingsSuccess && (
                <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl p-4 text-xs font-semibold">
                  Profile updated successfully!
                </div>
              )}

              <form onSubmit={handleSettingsSubmit} className="flex flex-col gap-5">

                {/* Email (read-only) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <PersonIcon sx={{ fontSize: 13 }} />
                    Email Address (cannot change)
                  </label>
                  <div className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-xs font-bold text-zinc-400 select-none cursor-not-allowed">
                    {user.email}
                  </div>
                </div>

                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="settings-name" className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <PersonIcon sx={{ fontSize: 13 }} />
                    Full Name
                  </label>
                  <input
                    id="settings-name"
                    type="text"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    placeholder="Enter your full name"
                    className="border border-zinc-200 focus:border-zinc-400 focus:outline-none rounded-xl px-4 py-3 text-xs font-bold text-zinc-800 bg-white transition-colors"
                  />
                </div>

                {/* New Password */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="settings-password" className="text-[10px] font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                    <LockIcon sx={{ fontSize: 13 }} />
                    New Password <span className="text-zinc-300 normal-case font-semibold">(leave blank to keep current)</span>
                  </label>
                  <input
                    id="settings-password"
                    type="password"
                    value={settingsPassword}
                    onChange={(e) => setSettingsPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="border border-zinc-200 focus:border-zinc-400 focus:outline-none rounded-xl px-4 py-3 text-xs font-bold text-zinc-800 bg-white transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={settingsLoading}
                  className="bg-zinc-950 hover:bg-black text-white font-extrabold text-xs py-3.5 rounded-2xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                >
                  {settingsLoading ? (
                    <>
                      <CircularProgress size={14} sx={{ color: 'white' }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Order Details Modal */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '24px',
            padding: { xs: '16px', sm: '24px' },
            backgroundColor: '#ffffff',
          }
        }}
      >
        <DialogTitle className="flex justify-between items-center text-left p-2">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Order Invoice</span>
            <span className="text-lg font-black text-zinc-900 tracking-tight mt-1">
              {selectedOrder ? `#${selectedOrder._id.substring(selectedOrder._id.length - 6).toUpperCase()}` : ''}
            </span>
          </div>
          <IconButton onClick={() => setDialogOpen(false)} size="small" className="text-zinc-400 hover:text-zinc-700 bg-zinc-50 border border-zinc-200">
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent className="p-2 flex flex-col gap-6 text-left">
          <div className="bg-zinc-50 border border-zinc-200/40 rounded-2xl p-4 flex items-center justify-between mt-3 text-xs font-bold text-zinc-750">
            <div className="flex flex-col">
              <span className="text-zinc-400 text-3xs uppercase tracking-wider font-extrabold">Order Date</span>
              <span className="text-zinc-800 mt-0.5">
                {selectedOrder ? new Date(selectedOrder.createdAt).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                }) : ''}
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-zinc-400 text-3xs uppercase tracking-wider font-extrabold">Status</span>
              {(() => {
                if (!selectedOrder) return null;
                const statusInfo = getStatusLabelAndClass(selectedOrder.orderStatus);
                return (
                  <span className={`inline-block text-[9px] font-black uppercase px-2.5 py-1 rounded-full select-none mt-0.5 ${statusInfo.cls}`}>
                    {statusInfo.label}
                  </span>
                );
              })()}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider pl-1">Items Summary</h3>
            <div className="border border-zinc-150 rounded-2xl overflow-hidden bg-white">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-150 text-3xs font-black text-zinc-400 uppercase tracking-wider select-none">
                    <th className="px-4 py-2.5">Product Name</th>
                    <th className="px-4 py-2.5 text-center">Qty</th>
                    <th className="px-4 py-2.5 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs font-bold text-zinc-700">
                  {selectedOrder?.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-3 text-zinc-800 font-semibold">{item.title}</td>
                      <td className="px-4 py-3 text-center text-zinc-500">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-zinc-900">PKR {item.price.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-100 pt-4 text-xs font-semibold text-zinc-650">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-zinc-900">PKR {selectedOrder?.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="text-zinc-900">PKR {selectedOrder?.shippingFee.toLocaleString()}</span>
            </div>
            {selectedOrder && selectedOrder.discount > 0 && (
              <div className="flex justify-between text-[#00b884]">
                <span>Discount (Promo)</span>
                <span>-PKR {selectedOrder.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-zinc-900 border-t border-zinc-150 pt-2 font-black">
              <span className="text-sm">Total Paid Amount</span>
              <span className="text-lg text-[#00b884] tracking-tight">PKR {selectedOrder?.total.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
            <div className="border border-zinc-200 bg-zinc-50/30 rounded-2xl p-4 text-xs font-medium text-zinc-600">
              <span className="block font-extrabold text-zinc-900 uppercase text-3xs tracking-wider mb-2">Delivery Address</span>
              <p className="leading-relaxed">
                {selectedOrder?.fullName}<br />
                {selectedOrder?.address}<br />
                {selectedOrder?.city}, {selectedOrder?.province} - {selectedOrder?.postalCode}
              </p>
            </div>
            <div className="border border-zinc-200 bg-zinc-50/30 rounded-2xl p-4 text-xs font-medium text-zinc-600">
              <span className="block font-extrabold text-zinc-900 uppercase text-3xs tracking-wider mb-2">Payment Method</span>
              <div className="flex items-center gap-2 text-zinc-800 font-bold mt-1">
                <span className="w-6 h-6 rounded-md bg-[#00b884] text-white flex items-center justify-center font-black text-4xs uppercase">
                  {selectedOrder?.paymentMethod === 'cod' ? 'COD' : 'EP'}
                </span>
                <span>
                  {selectedOrder?.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'EasyPaisa Secure Gateway'}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-100 py-6 text-center text-xs text-zinc-400 mt-12 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} ZSurban Pakistan. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-600 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function AccountDashboard() {
  return <AccountDashboardContent />;
}
