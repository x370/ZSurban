'use client';

import React from 'react';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import Button from './Button';

/**
 * Unified Product interface used across the user frontend.
 * Supports both legacy mock products (id + image) and
 * API products from backend (_id + imageUrls[]).
 */
export interface Product {
  // API product fields (from backend)
  _id?: string;
  imageUrls?: string[];
  stock?: number;

  // Legacy / mock product fields (kept for backward compatibility)
  id?: number;
  image?: string;
  rating?: number;

  // Common fields
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
  // Resolve primary image: prefer imageUrls[0] from API, fallback to legacy image
  const primaryImage = product.imageUrls?.[0] ?? product.image;

  // Resolve link ID: prefer MongoDB _id, fallback to numeric id
  const productId = product._id ?? String(product.id);

  const rating = product.rating ?? 0;

  const renderStars = (r: number) => {
    const stars = [];
    const floor = Math.floor(r);
    const hasHalf = r - floor >= 0.3 && r - floor <= 0.7;
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<StarIcon key={i} className="text-amber-400" sx={{ fontSize: 16 }} />);
      } else if (i === floor + 1 && hasHalf) {
        stars.push(<StarHalfIcon key={i} className="text-amber-400" sx={{ fontSize: 16 }} />);
      } else {
        stars.push(<StarBorderIcon key={i} className="text-zinc-300" sx={{ fontSize: 16 }} />);
      }
    }
    return stars;
  };

  return (
    <div className="bg-white border border-zinc-200/50 hover:border-zinc-300/80 rounded-3xl p-4 flex flex-col gap-4 shadow-sm hover:shadow-lg transition-all duration-300 group hover:-translate-y-1">
      <Link href={`/shop/${productId}`} className="cursor-pointer block flex flex-col gap-4 flex-1">
        {/* Product Image — shows imageUrls[0] (primary thumbnail) */}
        <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden bg-zinc-50 relative">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-zinc-300">
              <ImageIcon sx={{ fontSize: 36 }} />
              <span className="text-[10px] font-semibold">No image</span>
            </div>
          )}

          {/* Multi-image indicator badge */}
          {(product.imageUrls?.length ?? 0) > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-full">
              +{(product.imageUrls?.length ?? 1) - 1} more
            </div>
          )}
        </div>

        {/* Title & Price Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="text-left flex-1 min-w-0">
            <h3 className="font-bold text-zinc-900 text-sm truncate group-hover:text-zinc-950 transition-colors">
              {product.title}
            </h3>
            <p className="text-zinc-400 text-2xs mt-0.5 font-medium line-clamp-1">{product.description}</p>
          </div>
          <span className="inline-block shrink-0 bg-zinc-100 text-zinc-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full">
            PKR {product.price.toLocaleString()}
          </span>
        </div>
      </Link>

      {/* Rating Stars (shown only for products with ratings) */}
      {rating > 0 && (
        <div className="flex items-center gap-1 text-left">
          <div className="flex">{renderStars(rating)}</div>
          <span className="text-[10px] text-zinc-500 font-semibold ml-1">{rating}</span>
        </div>
      )}

      {/* Stock info */}
      {typeof product.stock === 'number' && (
        <p className={`text-[10px] font-bold ${product.stock === 0 ? 'text-red-400' : 'text-zinc-400'}`}>
          {product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}
        </p>
      )}

      {/* Add To Cart Button */}
      <Button
        variant="secondary"
        size="md"
        fullWidth
        onClick={onAddToCart}
        className={product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}
      >
        {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
      </Button>
    </div>
  );
}
