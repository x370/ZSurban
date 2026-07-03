'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import { logout } from '../features/auth/slice';
import { Avatar } from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Button from './Button';
import Logo from './Logo';
import Link from 'next/link';
import { getCartCount } from '../utils/cart';

interface PublicHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  cartCount?: number;
  onLoginClick?: () => void;
  activePage: 'home' | 'shop' | 'categories' | 'account';
}

export default function PublicHeader({
  searchQuery,
  setSearchQuery,
  cartCount: propCartCount = 0,
  onLoginClick,
  activePage
}: PublicHeaderProps) {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCartCount());

    const handleCartUpdate = () => {
      setCartCount(getCartCount());
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  const handleLogoutClick = () => {
    dispatch(logout());
    setMobileMenuOpen(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo Link to Home */}
        <Link href="/" className="cursor-pointer shrink-0">
          <Logo />
        </Link>

        {/* Desktop Search bar */}
        <div className="hidden md:block flex-1 max-w-md relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="text-zinc-400" fontSize="small" />
          </div>
          <input
            type="text"
            placeholder="Search products, types, categories"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-100 hover:bg-zinc-200/70 focus:bg-white text-zinc-900 text-sm rounded-full pl-9 pr-4 py-2 border border-transparent focus:border-zinc-200 focus:outline-none transition-all duration-200"
          />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-4">
          <Link href="/">
            <Button component="span" variant="nav" isActive={activePage === 'home'}>
              <HomeIcon fontSize="small" className="mr-1" />
              <span>Home</span>
            </Button>
          </Link>
          <Link href="/shop">
            <Button component="span" variant="nav" isActive={activePage === 'shop'}>
              <span>Shop</span>
            </Button>
          </Link>
          <div className="relative group">
            <Button variant="nav" isActive={activePage === 'categories'} className="flex items-center gap-1">
              <span>Categories</span>
              <svg className="w-3 h-3 text-zinc-400 group-hover:rotate-180 transition-transform duration-250" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </Button>
            
            {/* Desktop Categories Dropdown */}
            <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-zinc-200/50 rounded-2xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              {['Jeans Pants', 'Jeans Shirts', 'Kids', 'Ladies Dress'].map((cat) => (
                <Link key={cat} href={`/categories/${encodeURIComponent(cat)}`}>
                  <div className="px-4.5 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950 transition-colors cursor-pointer text-left">
                    {cat}
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Cart Button */}
          <Link href="/checkout">
            <Button component="span" variant="nav" className="relative">
              <div className="relative flex items-center">
                <ShoppingCartIcon fontSize="small" className="mr-1" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#00b884] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-4 h-4 scale-90">
                    {cartCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Button>
          </Link>

          {/* Login/User Button */}
          {user ? (
            <div className="flex items-center gap-2 ml-1">
              <Link href="/account" className="flex items-center gap-2 cursor-pointer group">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'zinc.850', fontSize: '13px' }} className="bg-zinc-900 font-semibold text-white transition-colors group-hover:bg-zinc-800">
                  {getInitials(user.name)}
                </Avatar>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-zinc-800 group-hover:text-zinc-900 leading-none">{user.name}</span>
                  <span className="text-[9px] text-zinc-400 group-hover:text-zinc-500 mt-1">My Dashboard</span>
                </div>
              </Link>
              <div className="hidden lg:flex items-center pl-2 border-l border-zinc-200 ml-1">
                <button onClick={handleLogoutClick} className="text-[10px] text-red-500 hover:text-red-700 hover:underline leading-none cursor-pointer">Logout</button>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <Button component="span" variant="nav">
                <PersonIcon fontSize="small" className="mr-1" />
                <span>Login</span>
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Action Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
              mobileSearchOpen ? 'bg-zinc-100 text-zinc-900' : 'text-zinc-650 hover:bg-zinc-50'
            }`}
          >
            {mobileSearchOpen ? <CloseIcon fontSize="small" /> : <SearchIcon fontSize="small" />}
          </button>

          {/* Cart Icon with badge */}
          <Link href="/checkout">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-650 hover:bg-zinc-50 relative cursor-pointer">
              <ShoppingCartIcon fontSize="small" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-[#00b884] text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
          </Link>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-650 hover:bg-zinc-50 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <CloseIcon fontSize="small" /> : <MenuIcon fontSize="small" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Dropdown Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden mt-3 border-t border-zinc-100 pt-3 pb-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <SearchIcon className="text-zinc-400" fontSize="small" />
            </div>
            <input
              type="text"
              placeholder="Search products, types, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-100 text-zinc-900 text-xs rounded-full pl-9.5 pr-4 py-2.5 border border-transparent focus:border-zinc-200 focus:outline-none transition-all duration-200"
            />
          </div>
        </div>
      )}

      {/* Mobile Drawer Slide-out Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 top-[57px] z-40 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 top-[57px] bg-black/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sliding Menu Panel */}
          <div className="relative ml-auto w-full max-w-[280px] bg-white h-[calc(100vh-57px)] shadow-xl flex flex-col p-6 border-l border-zinc-100 animate-slide-in-right">
            
            {/* User Profile Info Card inside drawer */}
            {user ? (
              <div className="flex items-center gap-3 p-4 bg-zinc-50 border border-zinc-200/50 rounded-2xl mb-6">
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'zinc.900', color: 'white', fontSize: '15px', fontWeight: 'bold' }}>
                  {getInitials(user.name)}
                </Avatar>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black text-zinc-900 leading-none">{user.name}</span>
                  <span className="text-[10px] text-zinc-400 font-bold mt-1">Logged In</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-6">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" fullWidth className="py-2.5 text-xs">
                    Login / Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Menu Links */}
            <nav className="flex flex-col gap-2.5 text-left">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activePage === 'home' ? 'bg-zinc-150 text-zinc-900' : 'text-zinc-550 hover:bg-zinc-50'
                }`}>
                  <HomeIcon fontSize="small" />
                  <span>Home</span>
                </div>
              </Link>

              <Link href="/shop" onClick={() => setMobileMenuOpen(false)}>
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  activePage === 'shop' ? 'bg-zinc-150 text-zinc-900' : 'text-zinc-550 hover:bg-zinc-50'
                }`}>
                  <ShoppingCartIcon fontSize="small" />
                  <span>Shop</span>
                </div>
              </Link>

              <div className="flex flex-col w-full">
                <button 
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activePage === 'categories' ? 'bg-zinc-150 text-zinc-900' : 'text-zinc-550 hover:bg-zinc-50'
                  }`}
                  onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                >
                  <div className="flex items-center gap-3">
                    <SearchIcon fontSize="small" />
                    <span>Categories</span>
                  </div>
                  <svg className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${mobileCategoriesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                
                {mobileCategoriesOpen && (
                  <div className="flex flex-col pl-10 gap-1.5 mt-1 border-l border-zinc-100 ml-6 text-left">
                    {['Jeans Pants', 'Jeans Shirts', 'Kids', 'Ladies Dress'].map((cat) => (
                      <Link key={cat} href={`/categories/${encodeURIComponent(cat)}`} onClick={() => setMobileMenuOpen(false)}>
                        <div className="py-2 text-[11px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer">
                          {cat}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              
              {user && (
                <>
                  <div className="w-full h-px bg-zinc-100 my-4"></div>
                  <button 
                    onClick={handleLogoutClick} 
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all text-left cursor-pointer w-full"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
