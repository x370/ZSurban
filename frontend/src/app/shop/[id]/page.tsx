'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../store/rootReducer';
import { loginRequest, logout } from '../../../features/auth/slice';
import Button from '@/components/Button';
import PublicHeader from '@/components/PublicHeader';
import Link from 'next/link';
import { addToCart } from '@/utils/cart';
import {
  Avatar,
  Alert,
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Image as ImageIcon,
  Inventory as InventoryIcon,
  RateReview as RateReviewIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { fetchProductById, ApiProduct, fetchProductReviews, submitReview, ApiReview } from '@/api/products';

interface PageProps {
  params: Promise<{ id: string }>;
}

function ProductDetailContent({ params }: PageProps) {
  const { id } = React.use(params);

  // ── State ─────────────────────────────────────────────────────────────────
  const [apiProduct, setApiProduct] = useState<ApiProduct | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [cartCount, setCartCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [searchQuery, setSearchQuery] = useState('');

  // Active image index for API product gallery
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // ── Reviews State ─────────────────────────────────────────────────────────
  const [reviews, setReviews] = useState<ApiReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: '', comment: '', rating: 0 });
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // ── Try fetching from API ─────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setApiLoading(true);
    fetchProductById(id)
      .then((data: ApiProduct) => {
        setApiProduct(data);
        setApiLoading(false);
      })
      .catch((err) => {
        setApiError(err.message);
        setApiLoading(false);
      });
  }, [id]);

  // ── Fetch reviews ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    fetchProductReviews(id)
      .then((data) => {
        setReviews(data);
        setReviewsLoading(false);
      })
      .catch(() => setReviewsLoading(false));
  }, [id]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    if (apiProduct) {
      addToCart(apiProduct, quantity);
    }
  };

  const handlePrevImage = () => {
    if (!apiProduct) return;
    setActiveImageIdx((prev) => (prev === 0 ? apiProduct.imageUrls.length - 1 : prev - 1));
  };
  const handleNextImage = () => {
    if (!apiProduct) return;
    setActiveImageIdx((prev) => (prev === apiProduct.imageUrls.length - 1 ? 0 : prev + 1));
  };

  const renderStars = (rating: number, size: number = 16) => {
    const stars = [];
    const floor = Math.floor(rating);
    const hasHalf = rating - floor >= 0.3 && rating - floor <= 0.7;
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) stars.push(<StarIcon key={i} className="text-amber-400" sx={{ fontSize: size }} />);
      else if (i === floor + 1 && hasHalf) stars.push(<StarHalfIcon key={i} className="text-amber-400" sx={{ fontSize: size }} />);
      else stars.push(<StarBorderIcon key={i} className="text-zinc-300" sx={{ fontSize: size }} />);
    }
    return stars;
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.name.trim() || !reviewForm.comment.trim() || reviewForm.rating === 0) {
      setSubmitError('Please fill all fields and select a rating.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await submitReview(id, reviewForm);
      setReviews(updated);
      setReviewForm({ name: '', comment: '', rating: 0 });
      setHoverRating(0);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch {
      setSubmitError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name: string) =>
    name.trim().split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  const avatarColors = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6',
  ];
  const getAvatarColor = (name: string) =>
    avatarColors[name.charCodeAt(0) % avatarColors.length];

  // ── Loading State ─────────────────────────────────────────────────────────
  if (apiLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <PublicHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} cartCount={cartCount} activePage="shop" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
            <p className="text-sm font-semibold text-zinc-400">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────
  if (apiError || !apiProduct) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <PublicHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} cartCount={cartCount} activePage="shop" />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
              <ImageIcon sx={{ fontSize: 28, color: '#fca5a5' }} />
            </div>
            <p className="text-lg font-black text-zinc-900">Product not found</p>
            <p className="text-sm text-zinc-400 font-medium">{apiError || 'The product does not exist'}</p>
            <Link href="/shop"><Button component="span" variant="storefront">Back to Shop</Button></Link>
          </div>
        </div>
      </div>
    );
  }

  const hasImages = apiProduct.imageUrls?.length > 0;
  const hasMultipleImages = apiProduct.imageUrls?.length > 1;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <PublicHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} cartCount={cartCount} activePage="shop" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:px-6 flex flex-col gap-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold text-left">
          <Link href="/" className="hover:text-zinc-650 transition-colors">Home</Link>
          <span>&gt;</span>
          <Link href="/shop" className="hover:text-zinc-650 transition-colors">Shop</Link>
          <span>&gt;</span>
          <span className="text-zinc-800 truncate max-w-xs">{apiProduct.title}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8 items-start bg-white border border-zinc-200/50 rounded-3xl p-6 sm:p-8 shadow-sm">

          {/* ── LEFT: Image Gallery ── */}
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            {/* Main large image */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100">
              {hasImages ? (
                <>
                  <img
                    src={apiProduct.imageUrls[activeImageIdx]}
                    alt={`${apiProduct.title} — image ${activeImageIdx + 1}`}
                    className="w-full h-full object-cover transition-all duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />

                  {hasMultipleImages && (
                    <>
                      {/* Prev arrow */}
                      <button onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm border border-white/60 rounded-full flex items-center justify-center text-zinc-700 hover:bg-white shadow-md transition-all cursor-pointer hover:scale-105">
                        <ChevronLeftIcon />
                      </button>
                      {/* Next arrow */}
                      <button onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm border border-white/60 rounded-full flex items-center justify-center text-zinc-700 hover:bg-white shadow-md transition-all cursor-pointer hover:scale-105">
                        <ChevronRightIcon />
                      </button>
                      {/* Counter badge */}
                      <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                        {activeImageIdx + 1} / {apiProduct.imageUrls.length}
                      </div>
                      {/* Dot indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                        {apiProduct.imageUrls.map((_, idx) => (
                          <button key={idx} onClick={() => setActiveImageIdx(idx)}
                            className={`rounded-full transition-all duration-200 cursor-pointer ${idx === activeImageIdx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/50 hover:bg-white/80'}`} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-300">
                  <ImageIcon sx={{ fontSize: 56 }} />
                  <span className="text-sm font-semibold">No images available</span>
                </div>
              )}
            </div>

            {/* Thumbnail strip — only shown if multiple images */}
            {hasMultipleImages && (
              <div className="grid grid-cols-4 gap-3">
                {apiProduct.imageUrls.map((url, idx) => (
                  <button key={idx} onClick={() => setActiveImageIdx(idx)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-zinc-50 ${idx === activeImageIdx ? 'border-zinc-900 shadow-sm scale-[0.98]' : 'border-zinc-100 hover:border-zinc-300'}`}>
                    <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="w-full md:w-1/2 flex flex-col gap-5 text-left">
            {/* Meta */}
            <div>
              <span className="text-2xs font-extrabold text-zinc-400 uppercase tracking-widest">
                ZSurban &bull; {apiProduct.category || 'General'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight mt-1 leading-tight">
                {apiProduct.title}
              </h1>
              {/* Average Rating badge */}
              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {renderStars(avgRating, 14)}
                  </div>
                  <span className="text-xs font-bold text-zinc-700">{avgRating.toFixed(1)}</span>
                  <span className="text-xs text-zinc-400 font-medium">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="text-2xl sm:text-3xl font-black text-[#00b884] tracking-tight">
              PKR {apiProduct.price.toLocaleString()}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-zinc-500 font-normal leading-relaxed border-t border-zinc-100 pt-4">
              {apiProduct.description || 'No description provided.'}
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center bg-zinc-100/80 p-1 rounded-full border border-zinc-200/20">
                <Button variant="ghost"
                  className="w-8 h-8 rounded-full p-0 flex items-center justify-center min-w-8 text-zinc-600 hover:text-zinc-950 bg-white shadow-2xs hover:shadow-xs transition-shadow"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))} disabled={quantity === 1}>
                  <RemoveIcon fontSize="small" />
                </Button>
                <span className="w-8 text-center text-xs font-bold text-zinc-800">{quantity}</span>
                <Button variant="ghost"
                  className="w-8 h-8 rounded-full p-0 flex items-center justify-center min-w-8 text-zinc-600 hover:text-zinc-950 bg-white shadow-2xs hover:shadow-xs transition-shadow"
                  onClick={() => setQuantity((prev) => prev + 1)}>
                  <AddIcon fontSize="small" />
                </Button>
              </div>
              <button onClick={() => setIsWishlisted(!isWishlisted)}
                className={`flex items-center gap-1.5 border px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${isWishlisted ? 'border-red-500 bg-red-50 text-red-500' : 'border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900'}`}>
                {isWishlisted ? <><FavoriteIcon fontSize="small" /><span>Wishlisted</span></> : <><FavoriteBorderIcon fontSize="small" /><span>Wishlist</span></>}
              </button>
            </div>

            {/* Order Buttons */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <Button variant="storefront" size="lg" onClick={() => alert('Order Placed! Thank you for buying from ZSurban.')} className="py-3">
                Buy Now
              </Button>
              <Button variant="secondary" size="lg" onClick={handleAddToCart} className="py-3"
                disabled={apiProduct.stock === 0}>
                Add to Cart
              </Button>
            </div>

            {/* Stock details */}
            <div className="bg-zinc-50 border border-zinc-200/20 rounded-2xl p-4 mt-2 flex justify-between gap-4 text-xs font-bold">
              <div className="flex flex-col text-left">
                <span className="text-zinc-400 text-3xs uppercase tracking-wider font-extrabold">SKU</span>
                <span className="text-zinc-700 mt-0.5">ZS-{apiProduct._id.slice(-6).toUpperCase()}</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-zinc-400 text-3xs uppercase tracking-wider font-extrabold">Availability</span>
                <span className={`mt-0.5 ${apiProduct.stock > 0 ? 'text-[#00b884]' : 'text-red-500'}`}>
                  {apiProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-zinc-400 text-3xs uppercase tracking-wider font-extrabold">Images</span>
                <span className="text-zinc-700 mt-0.5">{apiProduct.imageUrls?.length || 0} photo{(apiProduct.imageUrls?.length || 0) !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── REVIEWS SECTION ─────────────────────────────────────────────────── */}
        <div className="bg-white border border-zinc-200/50 rounded-3xl shadow-sm overflow-hidden">
          {/* Section Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
                <RateReviewIcon sx={{ fontSize: 18, color: '#f59e0b' }} />
              </div>
              <div>
                <h2 className="text-sm font-black text-zinc-900">Customer Reviews</h2>
                <p className="text-xs text-zinc-400 font-medium mt-0.5">
                  {reviews.length > 0
                    ? `${reviews.length} review${reviews.length !== 1 ? 's' : ''} · ${avgRating.toFixed(1)} avg`
                    : 'Be the first to review this product'}
                </p>
              </div>
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-1.5">
                <StarIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                <span className="text-sm font-black text-zinc-800">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-zinc-400 font-medium">/5</span>
              </div>
            )}
          </div>

          <div className="p-6 flex flex-col gap-6">
            {/* Reviews List */}
            {reviewsLoading ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-3 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                  <RateReviewIcon sx={{ fontSize: 26, color: '#d4d4d8' }} />
                </div>
                <p className="text-sm font-bold text-zinc-500">No reviews yet</p>
                <p className="text-xs text-zinc-400 font-medium">Share your thoughts below!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.slice().reverse().map((review, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-zinc-50/60 rounded-2xl border border-zinc-100/80">
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 select-none"
                      style={{ backgroundColor: getAvatarColor(review.name) }}
                    >
                      {getInitials(review.name)}
                    </div>
                    {/* Content */}
                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between flex-wrap gap-1">
                        <span className="text-xs font-black text-zinc-900">{review.name}</span>
                        <span className="text-[10px] text-zinc-400 font-medium">
                          {new Date(review.createdAt).toLocaleDateString(undefined, {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {renderStars(review.rating, 13)}
                      </div>
                      <p className="text-xs text-zinc-600 font-normal leading-relaxed mt-1">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Write a Review Form */}
            <div className="border-t border-zinc-100 pt-6">
              <h3 className="text-xs font-black text-zinc-700 uppercase tracking-wider mb-4">Write a Review</h3>
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="review-name" className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Your Name</label>
                  <input
                    id="review-name"
                    type="text"
                    placeholder="e.g. Ahmed Khan"
                    value={reviewForm.name}
                    onChange={(e) => setReviewForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-medium text-zinc-800 placeholder-zinc-300 outline-none focus:border-zinc-400 transition-colors bg-white"
                  />
                </div>

                {/* Star Rating Picker */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Rating</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewForm((f) => ({ ...f, rating: star }))}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                        aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                      >
                        {star <= (hoverRating || reviewForm.rating)
                          ? <StarIcon sx={{ fontSize: 26, color: '#f59e0b' }} />
                          : <StarBorderIcon sx={{ fontSize: 26, color: '#d4d4d8' }} />}
                      </button>
                    ))}
                    {(hoverRating || reviewForm.rating) > 0 && (
                      <span className="ml-2 text-xs font-bold text-zinc-500">
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoverRating || reviewForm.rating]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comment */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="review-comment" className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">Comment</label>
                  <textarea
                    id="review-comment"
                    rows={3}
                    placeholder="Tell others what you think about this product..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                    className="w-full border border-zinc-200 rounded-xl px-4 py-2.5 text-xs font-medium text-zinc-800 placeholder-zinc-300 outline-none focus:border-zinc-400 transition-colors bg-white resize-none"
                  />
                </div>

                {/* Errors / Success */}
                {submitError && (
                  <p className="text-xs font-semibold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{submitError}</p>
                )}
                {submitSuccess && (
                  <p className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                    ✓ Review submitted! Thank you for your feedback.
                  </p>
                )}

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-700 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <SendIcon sx={{ fontSize: 14 }} />
                        Submit Review
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-zinc-100 py-6 text-center text-xs text-zinc-400 mt-12 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} ZSurban Pakistan. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-650 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-650 transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ProductDetailPage({ params }: PageProps) {
  return <ProductDetailContent params={params} />;
}
