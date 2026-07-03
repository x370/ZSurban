'use client';

import React, { useState, useEffect } from 'react';
import { CircularProgress } from '@mui/material';
import Link from 'next/link';
import PublicHeader from '@/components/PublicHeader';
import ProductCard, { Product } from '@/components/ProductCard';
import { fetchProducts } from '@/api/products';
import { addToCart } from '@/utils/cart';

interface PageProps {
  params: Promise<{ category: string }>;
}

export default function CategoryPage({ params }: PageProps) {
  const { category } = React.use(params);
  const decodedCategory = decodeURIComponent(category);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchProducts(decodedCategory)
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [decodedCategory]);

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Header */}
      <PublicHeader
        searchQuery=""
        setSearchQuery={() => {}}
        cartCount={cartCount}
        activePage="categories"
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6 flex flex-col gap-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold text-left">
          <Link href="/" className="hover:text-zinc-650 transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href="/shop" className="hover:text-zinc-650 transition-colors">Shop</Link>
          <span>&gt;</span>
          <span className="text-zinc-800">{decodedCategory}</span>
        </div>

        {/* Category Header Title */}
        <div className="text-left bg-white border border-zinc-200/40 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
              {decodedCategory}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-medium">
              Browse our premium collection of {decodedCategory.toLowerCase()} garments.
            </p>
          </div>
          <span className="inline-block self-start sm:self-center bg-zinc-950 text-white text-xs font-black px-4 py-2 rounded-full">
            {products.length} {products.length === 1 ? 'Product' : 'Products'} Available
          </span>
        </div>

        {/* Loading / Error / Grid Section */}
        {loading ? (
          <div className="flex justify-center items-center py-24 text-zinc-900">
            <CircularProgress color="inherit" />
          </div>
        ) : error ? (
          <div className="bg-red-50/50 border border-red-200 text-red-700 p-8 rounded-3xl text-center text-sm font-semibold max-w-md mx-auto w-full shadow-sm mt-8">
            {error}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id ?? product.title}
                product={product}
                onAddToCart={() => handleAddToCart(product)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200/40 rounded-3xl p-16 text-center text-zinc-500 shadow-sm font-semibold flex flex-col items-center gap-4 max-w-lg mx-auto w-full mt-8">
            <span className="text-lg text-zinc-800">No Products Found</span>
            <p className="text-xs text-zinc-400 font-medium">
              We couldn't find any products in the "{decodedCategory}" category right now.
            </p>
            <Link href="/shop" className="mt-2">
              <span className="inline-block bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-6 py-3 rounded-full transition-all cursor-pointer">
                Go to Shop
              </span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
