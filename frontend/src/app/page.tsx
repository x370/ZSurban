'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import { loginRequest, logout } from '../features/auth/slice';
import { fetchProductsRequest } from '../features/products/slice';
import ProductCard from '../components/ProductCard';
import Button from '@/components/Button';
import Logo from '@/components/Logo';
import PublicHeader from '@/components/PublicHeader';
import { categoriesData } from '@/data/categories';
import Link from 'next/link';
import { addToCart } from '../utils/cart';
import { 
  Container, 
  Box, 
  Typography, 
  TextField, 
  Card, 
  CardContent, 
  CircularProgress, 
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon
} from '@mui/icons-material';



function HomeContent() {
  const dispatch = useDispatch();
  const { user, loading: authLoading, error: authError } = useSelector((state: RootState) => state.auth);
  const { products: apiProducts, loading: productsLoading } = useSelector((state: RootState) => state.products);
  
  // Dashboard states
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  
  // Newsletter states
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Fetch products from backend on mount
  useEffect(() => {
    dispatch(fetchProductsRequest());
  }, [dispatch]);

  const handleLogoutClick = () => {
    dispatch(logout());
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail.trim()) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setSubscribedEmail('');
      }, 3000);
    }
  };

  // Use API products directly
  const displayProducts = apiProducts;

  // Filter products by search query
  const filteredProducts = displayProducts.filter(product => 
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Top Header */}
      <PublicHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
        activePage="home"
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 flex flex-col gap-10">
        
        {/* Hero Banner Section */}
        <section className="relative w-full aspect-[21/9] min-h-[260px] md:min-h-[360px] rounded-3xl overflow-hidden bg-zinc-900 shadow-lg border border-zinc-200/50">
          {/* Background Image */}
          <img 
            src="/images/hero_banner.png" 
            alt="Discover Premium Products"
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />
          
          {/* Hero Content */}
          <div className="absolute inset-0 flex flex-col justify-center items-start px-8 sm:px-16 md:px-20 max-w-2xl text-left gap-3 md:gap-4">
            <span className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-white text-2xs md:text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-full">
              Trusted by shoppers across Pakistan
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight tracking-tight">
              Discover Premium Products
            </h1>
            <p className="text-xs md:text-sm text-slate-200 font-normal leading-relaxed">
              Shop curated essentials, trending gadgets, and lifestyle favorites with fast delivery and a seamless checkout experience.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link href="/shop">
                <Button component="span" variant="storefront" size="lg" className="active:scale-95 py-2.5 md:py-3">
                  Shop Now
                </Button>
              </Link>
              <Link href="/shop">
                <Button component="span" variant="outline" size="lg" className="active:scale-95 py-2.5 md:py-3">
                  Explore Deals
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Categories Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight">Featured Categories</h2>
              <p className="text-xs md:text-sm text-zinc-500 mt-0.5">Browse popular collections for everyday shopping.</p>
            </div>
            <Button variant="ghost" className="text-xs text-zinc-500 hover:text-zinc-900 px-3 py-1.5 font-bold">
              View all
            </Button>
          </div>

          {/* Grid of Categories */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categoriesData.map((category) => (
              <div 
                key={category.id}
                className="flex items-center gap-3 p-4 bg-white border border-zinc-200/50 hover:border-zinc-300 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
              >
                <div className="bg-zinc-100 group-hover:bg-zinc-200/80 p-2.5 rounded-xl transition-colors duration-200">
                  {category.icon}
                </div>
                <div className="text-left">
                  <span className="block text-sm font-bold text-zinc-900">{category.title}</span>
                  <span className="block text-[10px] text-zinc-400 mt-0.5 font-medium">{category.subtitle}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <div className="text-left">
              <h2 className="text-xl md:text-2xl font-bold text-zinc-900 tracking-tight">Featured Products</h2>
              <p className="text-xs md:text-sm text-zinc-500 mt-0.5">Handpicked items with great value and ratings.</p>
            </div>
            <Button variant="ghost" className="text-xs text-zinc-500 hover:text-zinc-900 px-3 py-1.5 font-bold">
              Shop all products
            </Button>
          </div>

          {/* Grid of Products */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard 
                  key={('_id' in product ? product._id : undefined) ?? ('id' in product ? String((product as any).id) : Math.random().toString())} 
                  product={product} 
                  onAddToCart={() => handleAddToCart(product)} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-zinc-200/40 rounded-2xl p-12 text-center text-zinc-500">
              No products found matching "{searchQuery}"
            </div>
          )}
        </section>

        {/* Newsletter Section */}
        <section className="bg-zinc-50 border border-zinc-200/30 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 text-left">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-zinc-900 tracking-tight">Stay in the loop</h2>
            <p className="text-xs md:text-sm text-zinc-500 mt-1">Subscribe for new arrivals, offers, and exclusive drops.</p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:max-w-md flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              required
              placeholder="Enter your email" 
              value={subscribedEmail}
              onChange={(e) => setSubscribedEmail(e.target.value)}
              className="flex-1 bg-white border border-zinc-200 hover:border-zinc-300 focus:border-zinc-400 focus:outline-none rounded-full px-5 py-2.5 text-zinc-900 text-sm transition-colors duration-200"
            />
            <Button 
              type="submit"
              variant="storefront"
              className="shrink-0 py-3 px-6"
            >
              {isSubscribed ? 'Subscribed!' : 'Subscribe'}
            </Button>
          </form>
        </section>

      </main>

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

export default function Home() {
  return <HomeContent />;
}
