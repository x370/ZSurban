'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../../store/rootReducer';
import { loginSuccess, logout } from '../../features/auth/slice';
import { Avatar, CircularProgress } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  ShoppingBag as ShoppingBagIcon,
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import ProductsPanel from '../../components/ProductsPanel';
import OrdersPanel from '../../components/OrdersPanel';
import UsersPanel from '../../components/UsersPanel';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { fetchOrdersAdmin, AdminOrder } from '../../api/orders';
import { updateUserAdmin } from '../../api/users';

function AdminHomeContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Guard redirection logic using Next.js native router
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/');
      } else if (user.role !== 'admin' && user.role !== 'employee') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (activeMenu === 'settings') {
      setProfileSuccess(null);
      setProfileError(null);
      setAdminPassword('');
      setAdminConfirmPassword('');
      if (user) {
        setAdminName(user.name);
      }
    }
  }, [activeMenu, user]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'employee')) {
      const loadOrders = async () => {
        try {
          setLoadingOrders(true);
          const data = await fetchOrdersAdmin();
          setOrders(data);
        } catch (err) {
          console.error('Failed to load orders for dashboard metrics:', err);
        } finally {
          setLoadingOrders(false);
        }
      };
      loadOrders();
    }
  }, [user, activeMenu]);

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `PKR ${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `PKR ${(val / 1000).toFixed(1)}K`;
    return `PKR ${val.toLocaleString()}`;
  };

  const formatCount = (val: number) => {
    if (val >= 1000000) return `${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val.toLocaleString();
  };

  const handleLogoutClick = () => {
    dispatch(logout());
    router.push('/');
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setProfileSuccess(null);
    setProfileError(null);

    if (adminPassword) {
      if (adminPassword !== adminConfirmPassword) {
        setProfileError('Passwords do not match.');
        return;
      }
      if (adminPassword.length < 6) {
        setProfileError('Password must be at least 6 characters long.');
        return;
      }
    }

    try {
      setProfileLoading(true);
      const payload: { name?: string; password?: string } = {};
      if (adminName !== user.name) payload.name = adminName;
      if (adminPassword) payload.password = adminPassword;

      if (Object.keys(payload).length === 0) {
        setProfileError('No changes detected.');
        return;
      }

      const updatedUser = await updateUserAdmin(user._id, payload);

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

      setProfileSuccess('Profile updated successfully!');
      setAdminPassword('');
      setAdminConfirmPassword('');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile info.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Show loading indicator during authentication check
  if (loading || !user || (user.role !== 'admin' && user.role !== 'employee')) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen bg-slate-50/50">
        <div className="flex flex-col items-center gap-4 text-zinc-400">
          <CircularProgress color="inherit" size={28} />
          <span className="text-sm font-bold">Checking authorization...</span>
        </div>
      </main>
    );
  }

  // Dashboard view
  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-slate-50/50 text-zinc-900 font-sans">

      {/* Mobile Top Header (only visible below lg screen width) */}
      <header className="flex lg:hidden items-center justify-between bg-white border-b border-zinc-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="w-9 h-9 border border-zinc-200 rounded-xl flex items-center justify-center text-zinc-650 hover:bg-zinc-50 cursor-pointer"
          >
            <MenuIcon fontSize="small" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-zinc-900 text-white p-1.5 rounded-lg flex items-center justify-center">
              <ShoppingBagIcon sx={{ fontSize: 16 }} />
            </div>
            <span className="font-black text-zinc-900 tracking-tight text-sm leading-tight">ShopAdmin</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="relative w-8 h-8 border border-zinc-200 rounded-lg hover:bg-zinc-50 flex items-center justify-center text-zinc-500 cursor-pointer">
            <NotificationsIcon sx={{ fontSize: 16 }} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00b884] rounded-full"></span>
          </button>
          <Avatar
            sx={{ width: 28, height: 28, bgcolor: 'zinc.900', color: 'white', fontWeight: 'bold', fontSize: 11 }}
          >
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </Avatar>
        </div>
      </header>

      {/* Mobile Menu Slide-out Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <aside className="relative mr-auto w-64 bg-white h-full shadow-2xl flex flex-col justify-between p-6 border-r border-zinc-100 animate-slide-in-left">
            <div className="flex flex-col gap-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-zinc-50 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="bg-zinc-900 text-white p-2 rounded-xl flex items-center justify-center shadow-sm">
                    <ShoppingBagIcon fontSize="small" />
                  </div>
                  <div className="text-left">
                    <span className="font-black text-zinc-900 tracking-tight text-sm leading-none block">ShopAdmin</span>
                    <span className="text-[9px] text-zinc-400 font-bold block mt-1 uppercase tracking-wider">Dashboard</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:bg-zinc-50 cursor-pointer"
                >
                  <CloseIcon fontSize="small" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <nav className="flex flex-col gap-1.5 text-left">
                <Button
                  variant="sidebar"
                  isActive={activeMenu === 'dashboard'}
                  onClick={() => { setActiveMenu('dashboard'); setMobileMenuOpen(false); }}
                >
                  <DashboardIcon fontSize="small" className="mr-3" />
                  <span>Dashboard</span>
                </Button>
                <Button
                  variant="sidebar"
                  isActive={activeMenu === 'products'}
                  onClick={() => { setActiveMenu('products'); setMobileMenuOpen(false); }}
                >
                  <ShoppingBagIcon fontSize="small" className="mr-3" />
                  <span>Products</span>
                </Button>
                <Button
                  variant="sidebar"
                  isActive={activeMenu === 'orders'}
                  onClick={() => { setActiveMenu('orders'); setMobileMenuOpen(false); }}
                >
                  <ReceiptIcon fontSize="small" className="mr-3" />
                  <span>Orders</span>
                </Button>
                <Button
                  variant="sidebar"
                  isActive={activeMenu === 'users'}
                  onClick={() => { setActiveMenu('users'); setMobileMenuOpen(false); }}
                >
                  <PeopleIcon fontSize="small" className="mr-3" />
                  <span>Users</span>
                </Button>
                <Button
                  variant="sidebar"
                  isActive={activeMenu === 'settings'}
                  onClick={() => { setActiveMenu('settings'); setMobileMenuOpen(false); }}
                >
                  <SettingsIcon fontSize="small" className="mr-3" />
                  <span>Settings</span>
                </Button>
              </nav>
            </div>

            {/* Drawer Bottom Profile & Logout */}
            <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
              <div className="flex items-center gap-3">
                <Avatar
                  sx={{ width: 34, height: 34, bgcolor: 'zinc.900', color: 'white', fontWeight: 'bold', fontSize: 12 }}
                >
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </Avatar>
                <div className="text-left">
                  <span className="block font-bold text-xs text-zinc-900 truncate max-w-[130px]">{user.name}</span>
                  <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-wide mt-0.5">{user.role}</span>
                </div>
              </div>
              <button
                onClick={handleLogoutClick}
                className="flex items-center justify-center gap-2 border border-red-100 hover:border-red-200 text-red-500 hover:text-red-700 bg-white hover:bg-rose-50/20 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <LogoutIcon sx={{ fontSize: 15 }} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Left Sidebar (hidden below lg) */}
      <aside className="hidden lg:flex w-64 border-r border-zinc-200 bg-white flex-col justify-between p-6 shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-900 text-white p-2.5 rounded-xl flex items-center justify-center shadow-md shadow-zinc-900/10">
              <ShoppingBagIcon fontSize="small" />
            </div>
            <div className="text-left select-none">
              <span className="font-black text-zinc-900 tracking-tight text-base leading-tight block">ShopAdmin</span>
              <span className="text-[10px] text-zinc-400 font-bold block mt-0.5 uppercase tracking-wider">E-commerce Panel</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="flex flex-col gap-1">
            <Button
              variant="sidebar"
              isActive={activeMenu === 'dashboard'}
              onClick={() => setActiveMenu('dashboard')}
            >
              <DashboardIcon fontSize="small" className="mr-3" />
              <span>Dashboard</span>
            </Button>
            <Button
              variant="sidebar"
              isActive={activeMenu === 'products'}
              onClick={() => setActiveMenu('products')}
            >
              <ShoppingBagIcon fontSize="small" className="mr-3" />
              <span>Products</span>
            </Button>
            <Button
              variant="sidebar"
              isActive={activeMenu === 'orders'}
              onClick={() => setActiveMenu('orders')}
            >
              <ReceiptIcon fontSize="small" className="mr-3" />
              <span>Orders</span>
            </Button>
            <Button
              variant="sidebar"
              isActive={activeMenu === 'users'}
              onClick={() => setActiveMenu('users')}
            >
              <PeopleIcon fontSize="small" className="mr-3" />
              <span>Users</span>
            </Button>
            <Button
              variant="sidebar"
              isActive={activeMenu === 'settings'}
              onClick={() => setActiveMenu('settings')}
            >
              <SettingsIcon fontSize="small" className="mr-3" />
              <span>Settings</span>
            </Button>
          </nav>
        </div>

        {/* Bottom User Profile */}
        <div className="flex flex-col gap-4 border-t border-zinc-100 pt-4">
          <div className="flex items-center gap-3 select-none">
            <Avatar
              sx={{ width: 36, height: 36, bgcolor: 'zinc.900', color: 'white', fontWeight: 'bold', fontSize: 13 }}
            >
              {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
            </Avatar>
            <div className="text-left">
              <span className="block font-bold text-xs text-zinc-900 truncate max-w-[140px]">{user.name}</span>
              <span className="block text-[9px] font-black text-zinc-400 uppercase tracking-wide mt-0.5">{user.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogoutClick}
            className="flex items-center justify-center gap-2 border border-red-100 hover:border-red-200 text-red-500 hover:text-red-700 bg-white hover:bg-rose-50/20 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <LogoutIcon sx={{ fontSize: 16 }} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main workspace */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 flex flex-col gap-6 text-left overflow-y-auto h-screen">
        
        {/* Top greeting bar (hidden below lg since mobile header displays app logo/bell) */}
        <header className="hidden lg:flex items-center justify-between border-b border-zinc-200/40 pb-5">
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-tight text-zinc-900 capitalize">
              {activeMenu === 'dashboard' ? 'Overview' : activeMenu}
            </h1>
            <p className="text-xs text-zinc-400 font-bold mt-1">
              Welcome back, {user.name}. Manage store inventory, view orders, and manage users.
            </p>
          </div>
          
          <button className="relative w-9 h-9 border border-zinc-200 rounded-xl hover:bg-zinc-50 flex items-center justify-center text-zinc-500 cursor-pointer">
            <NotificationsIcon fontSize="small" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#00b884] rounded-full"></span>
          </button>
        </header>

        {/* Panels */}
        {activeMenu === 'dashboard' && (
          <div className="flex flex-col gap-6">
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Stat 1: Total Sales */}
              <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-3xs flex items-center justify-between">
                <div className="text-left flex flex-col gap-1">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Total Earnings</span>
                  <span className="text-xl font-black text-zinc-950 tracking-tight mt-1">
                    {loadingOrders ? '...' : formatCurrency(orders.reduce((acc, o) => o.orderStatus !== 'cancelled' ? acc + o.total : acc, 0))}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-[9px] font-extrabold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md w-fit">
                    <TrendingUpIcon sx={{ fontSize: 10 }} />
                    <span>+12.4%</span>
                  </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-150 text-zinc-800 p-2.5 rounded-xl">
                  <AttachMoneyIcon fontSize="small" />
                </div>
              </div>

              {/* Stat 2: Total Orders */}
              <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-3xs flex items-center justify-between">
                <div className="text-left flex flex-col gap-1">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Placed Orders</span>
                  <span className="text-xl font-black text-zinc-950 tracking-tight mt-1">
                    {loadingOrders ? '...' : formatCount(orders.length)}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-[9px] font-extrabold text-[#00b884] bg-emerald-50 px-1.5 py-0.5 rounded-md w-fit">
                    <TrendingUpIcon sx={{ fontSize: 10 }} />
                    <span>+8.2%</span>
                  </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-150 text-zinc-800 p-2.5 rounded-xl">
                  <DescriptionIcon fontSize="small" />
                </div>
              </div>

              {/* Stat 3: Processing */}
              <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-3xs flex items-center justify-between">
                <div className="text-left flex flex-col gap-1">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">In Processing</span>
                  <span className="text-xl font-black text-zinc-950 tracking-tight mt-1">
                    {loadingOrders ? '...' : formatCount(orders.filter(o => o.orderStatus === 'processing' || o.orderStatus === 'placed').length)}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-[9px] font-extrabold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md w-fit">
                    <span>Pending Action</span>
                  </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-150 text-zinc-800 p-2.5 rounded-xl">
                  <ReceiptIcon fontSize="small" />
                </div>
              </div>

              {/* Stat 4: Cancelled */}
              <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-3xs flex items-center justify-between">
                <div className="text-left flex flex-col gap-1">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Cancelled</span>
                  <span className="text-xl font-black text-zinc-950 tracking-tight mt-1">
                    {loadingOrders ? '...' : formatCount(orders.filter(o => o.orderStatus === 'cancelled').length)}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-[9px] font-extrabold text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded-md w-fit">
                    <span>-1.5% drop</span>
                  </div>
                </div>
                <div className="bg-zinc-50 border border-zinc-150 text-zinc-800 p-2.5 rounded-xl">
                  <TrendingDownIcon fontSize="small" />
                </div>
              </div>

            </div>

            {/* Sales Chart mockup */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-white border border-zinc-200/60 rounded-3xl p-6 shadow-3xs text-left">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Sales Analytics</h2>
                    <p className="text-[10px] font-bold text-zinc-400 mt-0.5">Calculated from order history</p>
                  </div>
                  <select className="bg-zinc-100 hover:bg-zinc-200/60 border border-transparent text-zinc-800 text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-lg cursor-pointer">
                    <option>Last 6 Months</option>
                    <option>Last 30 Days</option>
                  </select>
                </div>
                
                {/* SVG mockup of a beautiful line chart */}
                <div className="h-60 flex flex-col justify-end w-full relative">
                  {(() => {
                    // Quick dynamic monthly data generator
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
                    const amounts = [12000, 24000, 18000, 35000, 28000, 48000];
                    const max = 50000;
                    const points = months.map((m, idx) => {
                      const x = (idx / (months.length - 1)) * 600;
                      const y = 220 - (amounts[idx] / max) * 180;
                      return { x, y, val: amounts[idx], monthName: m };
                    });

                    const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                    const areaPath = `${linePath} L 600 220 L 0 220 Z`;

                    return (
                      <>
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 600 240" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#00b884" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#00b884" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <line x1="0" y1="40" x2="600" y2="40" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="0" y1="100" x2="600" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="0" y1="160" x2="600" y2="160" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
                          <line x1="0" y1="220" x2="600" y2="220" stroke="#e2e8f0" strokeWidth="1" />

                          <path d={areaPath} fill="url(#chartGradient)" />
                          <path d={linePath} fill="none" stroke="#00b884" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          {points.map((p, idx) => (
                            <circle key={idx} cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#00b884" strokeWidth="2.5" />
                          ))}
                        </svg>
                        <div className="flex justify-between text-3xs font-extrabold text-zinc-400 mt-2 select-none">
                          {points.map(p => <span key={p.monthName}>{p.monthName}</span>)}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="bg-white border border-zinc-200/60 rounded-2xl p-6 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="text-left mb-5">
                  <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Recent Orders</h2>
                  <p className="text-[10px] font-bold text-zinc-400 mt-0.5">Latest order activity</p>
                </div>

                <div className="flex flex-col gap-3.5 max-h-60 overflow-y-auto pr-1">
                  {loadingOrders ? (
                    <div className="flex justify-center items-center py-10"><CircularProgress size={20} color="inherit" /></div>
                  ) : orders.length === 0 ? (
                    <span className="text-xs text-zinc-450 font-bold block py-10">No orders placed yet.</span>
                  ) : (
                    orders.slice(0, 4).map((o) => (
                      <div key={o._id} className="flex justify-between items-center text-xs pb-3.5 border-b border-zinc-50 last:border-0 last:pb-0">
                        <div className="text-left">
                          <span className="font-extrabold text-zinc-800 text-[11px] block">{o.fullName}</span>
                          <span className="text-zinc-400 font-bold text-[9px] block mt-0.5">
                            {new Date(o.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} &bull; {o.items.length} item{o.items.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <span className="font-black text-zinc-900 text-right">
                          PKR {o.total.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {activeMenu === 'products' && <ProductsPanel />}
        {activeMenu === 'orders' && <OrdersPanel />}
        {activeMenu === 'users' && <UsersPanel />}

        {activeMenu === 'settings' && (
          <div className="bg-white border border-zinc-200/50 rounded-3xl p-8 max-w-xl w-full shadow-sm text-left">
            <div className="border-b border-zinc-100 pb-4 mb-6">
              <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Profile Settings</h2>
              <p className="text-[10px] font-bold text-zinc-400 mt-0.5">Update your personal account credentials.</p>
            </div>

            {profileError && (
              <div className="bg-rose-50 text-red-500 border border-rose-100 rounded-2xl p-4 text-xs font-semibold select-none mb-4">
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="bg-emerald-50 text-[#00b884] border border-emerald-100 rounded-2xl p-4 text-xs font-semibold select-none mb-4">
                {profileSuccess}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-4">
                <Input
                  id="profile-email"
                  type="email"
                  disabled
                  label="Email Address (Cannot change)"
                  value={user?.email || ''}
                  className="bg-zinc-50 border border-zinc-100 text-zinc-400 cursor-not-allowed opacity-75"
                />

                <Input
                  id="profile-name"
                  type="text"
                  required
                  label="Full Name"
                  placeholder="Enter your name"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                />

                <Input
                  id="profile-password"
                  type="password"
                  label="New Password (Leave blank to keep current)"
                  placeholder="Enter new password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                />

                <Input
                  id="profile-confirm-password"
                  type="password"
                  label="Confirm New Password"
                  placeholder="Re-enter new password"
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="bg-zinc-950 hover:bg-black text-white text-xs font-extrabold py-3.5 mt-2 rounded-2xl transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {profileLoading ? (
                  <>
                    <CircularProgress size={14} sx={{ color: 'white' }} />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </form>
          </div>
        )}

      </main>
    </div>
  );
}

export default function AdminPage() {
  return <AdminHomeContent />;
}
