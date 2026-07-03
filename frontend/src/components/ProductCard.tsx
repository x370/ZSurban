'use client';

import React from 'react';
import {
  ShoppingCartOutlined as CartIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import Link from 'next/link';

export interface Product {
  _id?: string;
  imageUrls?: string[];
  stock?: number;
  id?: number;
  image?: string;
  rating?: number;
  title: string;
  category: string;
  price: number;
  description: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const primaryImage = product.imageUrls?.[0] ?? product.image;
  const productId = product._id ?? String(product.id);
  const isOutOfStock = typeof product.stock === 'number' && product.stock === 0;

  return (
    <div className="bg-white border border-zinc-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 flex flex-col">

      {/* Image */}
      <Link href={`/shop/${productId}`} className="block relative overflow-hidden bg-zinc-50" style={{ aspectRatio: '1/1' }}>
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-zinc-300">
            <ImageIcon sx={{ fontSize: 24 }} />
            <span className="text-[8px] font-semibold">No image</span>
          </div>
        )}

        {/* Category pill */}
        <span className="absolute top-2 left-2 text-[8px] font-black uppercase tracking-wide bg-white/90 backdrop-blur-sm text-zinc-600 px-1.5 py-0.5 rounded-full shadow-xs border border-zinc-100/80">
          {product.category}
        </span>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
            <span className="text-[9px] font-black uppercase text-red-500 bg-white px-2.5 py-0.5 rounded-full border border-red-100 shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-2.5 flex flex-col gap-2 flex-1">

        {/* Title */}
        <Link href={`/shop/${productId}`} className="block flex-1">
          <h3 className="font-bold text-zinc-900 text-[11px] leading-snug line-clamp-2 group-hover:text-zinc-600 transition-colors">
            {product.title}
          </h3>
        </Link>

        {/* Price + Stock row */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[12px] font-black text-zinc-950">
            PKR {product.price.toLocaleString()}
          </span>
          {typeof product.stock === 'number' && product.stock > 0 && (
            <span className="text-[7px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wide">
              In stock
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          disabled={isOutOfStock}
          className={`w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-extrabold transition-all duration-200
            ${isOutOfStock
              ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              : 'bg-zinc-950 hover:bg-zinc-800 text-white active:scale-95 cursor-pointer'
            }`}
        >
          <CartIcon sx={{ fontSize: 11 }} />
          {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
