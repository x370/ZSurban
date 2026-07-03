'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchOrderById, ApiOrder } from '../../../api/orders';
import PublicHeader from '@/components/PublicHeader';
import { 
  CheckCircle as CheckCircleIcon,
  LocalShipping as LocalShippingIcon,
  ShoppingCart as ShoppingCartIcon,
  CreditCard as CreditCardIcon
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (orderId) {
      fetchOrderById(orderId)
        .then(data => {
          setOrder(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setError('Could not retrieve order details. Please verify your order ID.');
          setLoading(false);
        });
    } else {
      setError('No order ID was found in the URL.');
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <PublicHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} activePage="shop" />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <CircularProgress color="success" size={40} />
            <span className="text-xs text-zinc-500 font-bold">Loading order details...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50">
        <PublicHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} activePage="shop" />
        <main className="flex-1 max-w-xl w-full mx-auto px-4 py-16 flex flex-col items-center justify-center">
          <div className="bg-white border border-red-100 rounded-3xl p-8 shadow-sm text-center flex flex-col items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-lg">⚠️</div>
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">Error Loading Order</h2>
            <p className="text-xs text-zinc-500 leading-relaxed font-semibold">{error || 'Order not found.'}</p>
            <Link href="/" className="mt-2 w-full bg-zinc-900 hover:bg-black text-white font-bold py-3 px-6 rounded-xl text-xs transition-colors">
              Return Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      <PublicHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} activePage="shop" />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-10 flex flex-col gap-6">
        
        {/* Success Banner */}
        <div className="bg-white border border-zinc-200/50 rounded-[2rem] p-8 shadow-xs flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-[#00b884]">
            <CheckCircleIcon sx={{ fontSize: 44 }} />
          </div>
          <div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Thank you for your order</span>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mt-1.5 leading-none">Order Placed Successfully!</h1>
            <p className="text-xs text-[#00b884] font-black mt-2 bg-emerald-50/50 px-3 py-1 rounded-full w-fit mx-auto border border-emerald-100/50">
              Order ID: #{order._id}
            </p>
          </div>
          <p className="text-xs text-zinc-500 max-w-md font-semibold leading-relaxed">
            Your order has been logged in our system. If you selected Cash on Delivery (COD), our agent will contact you shortly to confirm shipment.
          </p>
        </div>

        {/* 2-Section Details Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Section 1: Customer & Delivery Info */}
          <div className="bg-white border border-zinc-200/50 rounded-[2rem] p-6 shadow-xs flex flex-col gap-4 text-left">
            <h2 className="text-xs font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-50 pb-2.5 flex items-center gap-1.5">
              <LocalShippingIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
              <span>Delivery Details</span>
            </h2>
            <div className="flex flex-col gap-2.5 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase">Contact Name</span>
                <span className="font-extrabold text-zinc-900 mt-0.5 block">{order.fullName}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase">Phone</span>
                <span className="font-extrabold text-zinc-900 mt-0.5 block">{order.phone}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase">Email</span>
                <span className="font-extrabold text-zinc-900 mt-0.5 block">{order.email}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase">Delivery Address</span>
                <span className="font-extrabold text-zinc-900 mt-0.5 block leading-relaxed">
                  {order.address}, {order.city}, {order.province} - {order.postalCode}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Payment & Cost Summary */}
          <div className="bg-white border border-zinc-200/50 rounded-[2rem] p-6 shadow-xs flex flex-col gap-4 text-left">
            <h2 className="text-xs font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-50 pb-2.5 flex items-center gap-1.5">
              <CreditCardIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
              <span>Payment Details</span>
            </h2>
            <div className="flex flex-col gap-2.5 text-xs">
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase">Method</span>
                <span className="font-extrabold text-zinc-900 mt-0.5 uppercase block flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${order.paymentMethod === 'cod' ? 'bg-[#00b884]' : 'bg-red-500'}`}></span>
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : order.paymentMethod}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase">Subtotal</span>
                <span className="font-extrabold text-zinc-800 mt-0.5 block">PKR {order.subtotal.toLocaleString()}</span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 uppercase">Shipping Fee</span>
                <span className="font-extrabold text-zinc-800 mt-0.5 block">PKR {order.shippingFee.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div>
                  <span className="block text-[10px] font-bold text-zinc-400 uppercase">Discount Applied</span>
                  <span className="font-black text-[#00b884] mt-0.5 block">- PKR {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-zinc-50 pt-2.5 mt-1 flex justify-between items-center text-sm font-black text-zinc-900">
                <span>Total Paid</span>
                <span>PKR {order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items Details Card */}
        <div className="bg-white border border-zinc-200/50 rounded-[2rem] p-6 shadow-xs flex flex-col gap-4 text-left">
          <h2 className="text-xs font-black text-zinc-900 uppercase tracking-wider border-b border-zinc-50 pb-2.5 flex items-center gap-1.5">
            <ShoppingCartIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
            <span>Items Ordered</span>
          </h2>
          <div className="flex flex-col gap-3">
            {order.items.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100 last:border-b-0 last:pb-0">
                <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200/50 overflow-hidden shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-300 text-3xs">
                      <ShoppingCartIcon fontSize="small" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block font-extrabold text-[11px] text-zinc-900 truncate tracking-tight">{item.title}</span>
                  <span className="text-[10px] text-zinc-400 font-bold mt-0.5 block">Quantity: {item.quantity}</span>
                </div>
                <span className="font-extrabold text-[11px] text-zinc-950">
                  PKR {(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Back buttons */}
        <div className="flex gap-4">
          <Link href="/shop" className="flex-1 bg-zinc-900 hover:bg-black text-white text-center font-bold py-3.5 px-6 rounded-2xl text-xs transition-colors shadow-2xs cursor-pointer">
            Continue Shopping
          </Link>
          <Link href="/" className="flex-1 bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-center font-bold py-3.5 px-6 rounded-2xl text-xs transition-colors shadow-2xs cursor-pointer">
            Go to Homepage
          </Link>
        </div>

      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen bg-slate-50/50 justify-center items-center">
        <CircularProgress color="success" size={40} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
