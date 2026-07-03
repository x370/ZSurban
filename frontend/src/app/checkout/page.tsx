'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import PublicHeader from '@/components/PublicHeader';
import { 
  LocalMall as LocalMallIcon,
  CreditCard as CreditCardIcon,
  Description as DescriptionIcon,
  ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  getCart, 
  removeFromCart, 
  updateCartQuantity, 
  clearCart, 
  CartItem 
} from '../../utils/cart';
import { createOrder } from '../../api/orders';

function CheckoutContent() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [placing, setPlacing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [fullName, setFullName] = useState('Muhammad Ali');
  const [phone, setPhone] = useState('+92 300 1234567');
  const [email, setEmail] = useState('ali@example.com');
  const [address, setAddress] = useState('House 12, Gulberg III');
  const [city, setCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [postalCode, setPostalCode] = useState('54000');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('cod');

  useEffect(() => {
    setCart(getCart());
  }, []);

  useEffect(() => {
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);


  const handleIncrement = (productId: string) => {
    const item = cart.find(i => i.productId === productId);
    if (item) {
      updateCartQuantity(productId, item.quantity + 1);
      setCart(getCart());
    }
  };

  const handleDecrement = (productId: string) => {
    const item = cart.find(i => i.productId === productId);
    if (item) {
      updateCartQuantity(productId, item.quantity - 1);
      setCart(getCart());
    }
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    setCart(getCart());
  };

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = subtotal > 0 ? 250 : 0;
  const discount = subtotal > 0 ? Math.round(subtotal * 0.05) : 0; // 5% discount
  const total = subtotal + shippingFee - discount;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('Your cart is empty! Please add some products to checkout.');
      return;
    }
    setPlacing(true);
    setErrorMessage('');

    try {
      const payload = {
        fullName,
        phone,
        email,
        address,
        city,
        province,
        postalCode,
        items: cart.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        })),
        subtotal,
        shippingFee,
        discount,
        total,
        paymentMethod
      };

      const placedOrder = await createOrder(payload);

      // Success: clear cart and redirect to success page
      clearCart();
      setCart([]);
      
      // Dispatch a cart update event to sync the header count immediately
      window.dispatchEvent(new Event('cart-updated'));

      router.push(`/checkout/success?orderId=${placedOrder._id}`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An error occurred while placing your order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Top Header */}
      <PublicHeader 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activePage="shop"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:px-6 flex flex-col gap-6">
        
        {/* Stepper Banner */}
        <div className="bg-white border border-zinc-200/50 rounded-3xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between max-w-3xl mx-auto text-2xs font-extrabold select-none">
            {/* Step 1 */}
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px]">1</span>
              <span>Cart</span>
            </div>

            {/* Line */}
            <div className="flex-1 h-0.5 bg-zinc-150 mx-4 rounded-full"></div>

            {/* Step 2 */}
            <div className="flex items-center gap-2 text-zinc-900 border-b-2 border-zinc-900 pb-1">
              <span className="w-5 h-5 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Checkout</span>
            </div>

            {/* Line */}
            <div className="flex-1 h-0.5 bg-zinc-150 mx-4 rounded-full"></div>

            {/* Step 3 */}
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center text-[10px]">3</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        {/* 2-Column Checkout Workspace */}
        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (Shipping & Payment) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Card 1: Shipping Information */}
            <div className="bg-white border border-zinc-200/50 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-zinc-50 pb-3">
                <div className="text-left">
                  <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Shipping Information</h2>
                  <p className="text-[10px] font-bold text-zinc-400 mt-0.5">Enter your delivery details</p>
                </div>
                <div className="text-zinc-400">
                  <LocalMallIcon fontSize="small" />
                </div>
              </div>

              {/* Grid Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="flex flex-col gap-1 text-left sm:col-span-1">
                  <label htmlFor="fullName" className="text-3xs font-black text-zinc-400 uppercase tracking-wider pl-1">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 text-zinc-900 text-xs font-bold rounded-xl px-4 py-2.5 outline-none transition-all placeholder-zinc-350"
                  />
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1 text-left sm:col-span-1">
                  <label htmlFor="phone" className="text-3xs font-black text-zinc-400 uppercase tracking-wider pl-1">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    placeholder="+92 300 1234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 text-zinc-900 text-xs font-bold rounded-xl px-4 py-2.5 outline-none transition-all placeholder-zinc-350"
                  />
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1 text-left sm:col-span-1">
                  <label htmlFor="email" className="text-3xs font-black text-zinc-400 uppercase tracking-wider pl-1">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="ali@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 text-zinc-900 text-xs font-bold rounded-xl px-4 py-2.5 outline-none transition-all placeholder-zinc-350"
                  />
                </div>

                {/* Street Address */}
                <div className="flex flex-col gap-1 text-left sm:col-span-1">
                  <label htmlFor="address" className="text-3xs font-black text-zinc-400 uppercase tracking-wider pl-1">
                    Street Address
                  </label>
                  <input
                    id="address"
                    type="text"
                    required
                    placeholder="House 12, Street Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 text-zinc-900 text-xs font-bold rounded-xl px-4 py-2.5 outline-none transition-all placeholder-zinc-350"
                  />
                </div>

                {/* City */}
                <div className="flex flex-col gap-1 text-left">
                  <label htmlFor="city" className="text-3xs font-black text-zinc-400 uppercase tracking-wider pl-1">
                    City
                  </label>
                  <input
                    id="city"
                    type="text"
                    required
                    placeholder="Lahore"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 text-zinc-900 text-xs font-bold rounded-xl px-4 py-2.5 outline-none transition-all placeholder-zinc-350"
                  />
                </div>

                {/* Province */}
                <div className="flex flex-col gap-1 text-left">
                  <label htmlFor="province" className="text-3xs font-black text-zinc-400 uppercase tracking-wider pl-1">
                    Province
                  </label>
                  <input
                    id="province"
                    type="text"
                    required
                    placeholder="Punjab"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 text-zinc-900 text-xs font-bold rounded-xl px-4 py-2.5 outline-none transition-all placeholder-zinc-350"
                  />
                </div>

                {/* Postal Code */}
                <div className="flex flex-col gap-1 text-left sm:col-span-1">
                  <label htmlFor="postalCode" className="text-3xs font-black text-zinc-400 uppercase tracking-wider pl-1">
                    Postal Code
                  </label>
                  <input
                    id="postalCode"
                    type="text"
                    required
                    placeholder="54000"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 focus:border-zinc-950 text-zinc-900 text-xs font-bold rounded-xl px-4 py-2.5 outline-none transition-all placeholder-zinc-350"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Payment Method */}
            <div className="bg-white border border-zinc-200/50 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-zinc-50 pb-3">
                <div className="text-left">
                  <h2 className="text-base font-extrabold text-zinc-900 tracking-tight">Payment Method</h2>
                  <p className="text-[10px] font-bold text-zinc-400 mt-0.5">Choose your preferred payment option</p>
                </div>
                <div className="text-zinc-400">
                  <CreditCardIcon fontSize="small" />
                </div>
              </div>

              {/* Vertical Radio Selectors */}
              <div className="flex flex-col gap-3">
                
                {/* Cash on Delivery (COD) Option */}
                <div 
                  onClick={() => setPaymentMethod('cod')}
                  className={`flex items-center justify-between border-2 rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'cod'
                      ? 'border-[#00b884] bg-emerald-50/10'
                      : 'border-zinc-150 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-[#00b884] flex items-center justify-center text-white font-black text-xs shadow-2xs">
                      COD
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-zinc-900">Cash on Delivery (COD)</span>
                        <span className="text-[8px] font-black text-[#00b884] bg-emerald-50 uppercase px-1.5 py-0.5 rounded select-none">Default</span>
                      </div>
                      <p className="text-3xs text-zinc-400 font-bold mt-1">Pay with cash upon delivery</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === 'cod'
                      ? 'border-[#00b884]'
                      : 'border-zinc-350'
                  }`}>
                    {paymentMethod === 'cod' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#00b884]"></div>
                    )}
                  </div>
                </div>

                {/* JazzCash Option */}
                <div 
                  onClick={() => setPaymentMethod('jazzcash')}
                  className={`flex items-center justify-between border-2 rounded-2xl p-4 transition-all duration-200 cursor-pointer ${
                    paymentMethod === 'jazzcash'
                      ? 'border-[#e11d48] bg-rose-50/10'
                      : 'border-zinc-150 hover:border-zinc-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-red-500 to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-2xs">
                      JC
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-zinc-900">JazzCash Wallet</span>
                        <span className="text-[8px] font-black text-[#e11d48] bg-rose-50 uppercase px-1.5 py-0.5 rounded select-none">Mobile Wallet</span>
                      </div>
                      <p className="text-3xs text-zinc-400 font-bold mt-1">Instant mobile wallet payment</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentMethod === 'jazzcash'
                      ? 'border-[#e11d48]'
                      : 'border-zinc-350'
                  }`}>
                    {paymentMethod === 'jazzcash' && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#e11d48]"></div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Column (Order Summary) */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-6.5 shadow-xs flex flex-col gap-6 sticky top-22">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-zinc-100/80 pb-4">
                <div className="text-left">
                  <h2 className="text-sm font-black text-zinc-950 tracking-tight uppercase">Order Summary</h2>
                  <p className="text-[10px] font-bold text-zinc-400 mt-1">
                    Review your items and checkout
                  </p>
                </div>
                <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-100 rounded-full px-2.5 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00b884] animate-pulse"></span>
                  <span className="text-[9px] font-extrabold text-zinc-650 tracking-wide uppercase select-none">
                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>

              {/* Item Rows */}
              <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-12 text-center text-zinc-400 text-xs font-bold flex flex-col gap-3 items-center">
                    <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-300">
                      <ShoppingCartIcon sx={{ fontSize: 20 }} />
                    </div>
                    <span>Your cart is empty.</span>
                    <Link href="/shop" className="text-[#00b884] hover:underline font-extrabold text-2xs">
                      Start Shopping &rarr;
                    </Link>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100/40 last:border-b-0 last:pb-0 text-left group">
                      {/* Image Thumbnail */}
                      <div className="w-12.5 h-12.5 rounded-2xl bg-zinc-50 border border-zinc-200/50 overflow-hidden shrink-0 transition-transform duration-250 group-hover:scale-[1.02]">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-300">
                            <ShoppingCartIcon fontSize="small" />
                          </div>
                        )}
                      </div>

                      {/* Product Title and Adjuster */}
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <span className="block font-extrabold text-[11px] text-zinc-900 truncate tracking-tight">
                          {item.title}
                        </span>
                        
                        <div className="flex items-center gap-2 mt-0.5">
                          {/* Compact Qty Pill */}
                          <div className="flex items-center bg-zinc-50 border border-zinc-150 rounded-full p-0.5 w-fit">
                            <button
                              type="button"
                              onClick={() => handleDecrement(item.productId)}
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black text-zinc-550 hover:bg-zinc-200 cursor-pointer transition-colors"
                            >
                              -
                            </button>
                            <span className="text-[9px] text-zinc-850 font-black min-w-4 text-center select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleIncrement(item.productId)}
                              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black text-zinc-550 hover:bg-zinc-200 cursor-pointer transition-colors"
                            >
                              +
                            </button>
                          </div>

                          <span className="text-zinc-200 text-3xs select-none">|</span>

                          {/* Delete Link */}
                          <button
                            type="button"
                            onClick={() => handleRemove(item.productId)}
                            className="text-[9px] text-zinc-400 hover:text-red-500 font-extrabold cursor-pointer transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Line Item Total Price */}
                      <span className="font-black text-[11px] text-zinc-950 shrink-0">
                        PKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Price Breakdown */}
              <div className="flex flex-col gap-3 border-t border-zinc-100/80 pt-4.5 text-[11px] font-bold">
                <div className="flex justify-between text-zinc-500">
                  <span className="font-semibold">Subtotal</span>
                  <span className="text-zinc-800 font-extrabold">PKR {subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-zinc-500">
                  <span className="font-semibold">Shipping Fee</span>
                  <span className="text-zinc-800 font-extrabold">
                    {shippingFee > 0 ? `PKR ${shippingFee.toLocaleString()}` : 'Free'}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">Discount</span>
                      <span className="bg-emerald-50 text-[#00b884] text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider scale-90">
                        5% OFF
                      </span>
                    </div>
                    <span className="text-[#00b884] font-black">- PKR {discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="h-px bg-zinc-100 my-1"></div>

                <div className="flex justify-between text-xs text-zinc-950 font-black">
                  <span>Total Amount</span>
                  <span className="text-sm">PKR {total.toLocaleString()}</span>
                </div>
              </div>

              {/* Action Submit Button */}
              <div className="flex flex-col gap-2 mt-1">
                <button
                  type="submit"
                  disabled={cart.length === 0 || placing}
                  className="w-full bg-[#00b884] hover:bg-[#00a374] text-white rounded-2xl py-3.5 font-bold text-xs shadow-md shadow-[#00b884]/15 hover:shadow-lg hover:shadow-[#00a374]/20 hover:-translate-y-0.5 transition-all duration-200 active:translate-y-0 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                >
                  <ShoppingCartIcon sx={{ fontSize: 15 }} />
                  <span>{placing ? 'Placing Order...' : 'Place Order Now'}</span>
                </button>
                
                {errorMessage && (
                  <div className="text-red-500 text-[10px] font-bold text-center mt-1 bg-red-50/50 p-2 rounded-xl border border-red-100">
                    {errorMessage}
                  </div>
                )}
                
                {/* Security and Trust Indicators */}
                <div className="flex items-center justify-center gap-1.5 text-[9px] font-extrabold text-zinc-400 tracking-wide uppercase select-none mt-1">
                  <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span>Secure Checkout Guaranteed</span>
                </div>
              </div>

            </div>
          </div>
        </form>
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

export default function CheckoutPage() {
  return <CheckoutContent />;
}
