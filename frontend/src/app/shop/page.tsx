'use client';

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/rootReducer';
import { logout } from '../../features/auth/slice';
import ProductCard from '../../components/ProductCard';
import Button from '@/components/Button';
import PublicHeader from '@/components/PublicHeader';
import { fetchProductsRequest } from '../../features/products/slice';
import Link from 'next/link';
import { CircularProgress, Slider } from '@mui/material';
import { addToCart } from '../../utils/cart';
import {
  Close as CloseIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';

function ShopContent() {
  const dispatch = useDispatch();
  const { user, loading: authLoading, error } = useSelector((state: RootState) => state.auth);
  const { products: apiProducts, loading: productsLoading } = useSelector((state: RootState) => state.products);

  // Fetch products from backend on mount
  useEffect(() => {
    dispatch(fetchProductsRequest());
  }, [dispatch]);

  // Search & Cart states
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number[]>([0, 60000]);
  const [minRating, setMinRating] = useState<number | null>(null);

  // Catalog view options
  const [sortBy, setSortBy] = useState('Newest');
  const [isGridView, setIsGridView] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;



  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedTypes, priceRange, minRating, sortBy, searchQuery]);


  const handleLogoutClick = () => {
    dispatch(logout());
  };

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  // Checkbox handlers
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Classifier logic for dynamic Wear Type
  const classifyProductType = (product: any): string => {
    if (product.wearType) {
      return product.wearType;
    }
    const title = (product.title || '').toLowerCase();
    const desc = (product.description || '').toLowerCase();
    const cat = (product.category || '').toLowerCase();

    if (title.includes('school') || desc.includes('school') || cat === 'kids') {
      return 'School';
    }
    if (title.includes('office') || desc.includes('office') || title.includes('formal') || title.includes('shirt')) {
      return 'Office';
    }
    if (title.includes('party') || desc.includes('party') || title.includes('wedding') || title.includes('dress')) {
      return 'Party';
    }
    return 'Casual';
  };

  // Filtering Logic
  const filteredProducts = apiProducts.filter(product => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }
    const productType = classifyProductType(product);
    if (selectedTypes.length > 0 && !selectedTypes.includes(productType)) {
      return false;
    }
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    if (minRating !== null && ((product as any).rating ?? 0) < minRating) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchTitle = product.title.toLowerCase().includes(query);
      const matchDesc = product.description.toLowerCase().includes(query);
      const matchCat = product.category.toLowerCase().includes(query);
      if (!matchTitle && !matchDesc && !matchCat) {
        return false;
      }
    }
    return true;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'Price: Low to High') {
      return a.price - b.price;
    }
    if (sortBy === 'Price: High to Low') {
      return b.price - a.price;
    }
    if (sortBy === 'Rating') {
      return ((b as any).rating ?? 0) - ((a as any).rating ?? 0);
    }
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    return timeB - timeA; // Newest
  });

  // Pagination Calculations
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + itemsPerPage);

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedTypes([]);
    setPriceRange([0, 60000]);
    setMinRating(null);
    setSearchQuery('');
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Top Header */}
      <PublicHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cartCount={cartCount}
        activePage="shop"
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-4 sm:px-6 flex flex-col gap-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-semibold text-left">
          <Link href="/" className="hover:text-zinc-650 transition-colors">Home</Link>
          <span>&gt;</span>
          <span className="text-zinc-800">Shop</span>
        </div>

        {/* 2-Column Workspace Grid */}
        <div className="flex flex-col md:flex-row gap-6 items-start">

          {/* Left Column: Sidebar Filters */}
          <aside className="w-full md:w-64 shrink-0 bg-white border border-zinc-200/50 rounded-3xl p-6 flex flex-col gap-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <span className="font-bold text-zinc-900 text-sm">Filters</span>
              <button
                onClick={clearAllFilters}
                className="text-2xs font-extrabold text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
              >
                Clear all
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col gap-2 text-left">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Category</span>
              <div className="flex flex-col gap-1.5 mt-1">
                {['Jeans Pants', 'Jeans Shirts', 'Kids', 'Ladies Dress'].map((cat) => (
                  <label key={cat} className="flex items-center gap-2.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat)}
                      onChange={() => handleCategoryChange(cat)}
                      className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 focus:ring-1 accent-zinc-900"
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="flex flex-col gap-2 text-left">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Price Range</span>
              <div className="px-2 mt-1">
                <Slider
                  value={priceRange}
                  onChange={(e, newValue) => setPriceRange(newValue as number[])}
                  valueLabelDisplay="auto"
                  min={0}
                  max={60000}
                  step={500}
                  size="small"
                  sx={{
                    color: 'zinc.900',
                    '& .MuiSlider-thumb': {
                      width: 14,
                      height: 14,
                      backgroundColor: '#fff',
                      border: '2px solid currentColor',
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0px 0px 0px 6px rgba(0, 0, 0, 0.08)',
                      },
                    },
                    '& .MuiSlider-rail': {
                      opacity: 0.28,
                    },
                  }}
                />
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold mt-1">
                  <span>Rs {priceRange[0].toLocaleString()}</span>
                  <span>Rs {priceRange[1].toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Type Filter */}
            <div className="flex flex-col gap-2 text-left">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Type</span>
              <div className="flex flex-col gap-1.5 mt-1">
                {['Casual', 'Office', 'School', 'Party'].map((type) => (
                  <label key={type} className="flex items-center gap-2.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => handleTypeChange(type)}
                      className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 focus:ring-1 accent-zinc-900"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="flex flex-col gap-2 text-left">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Rating</span>
              <div className="flex flex-col gap-2 mt-1">
                <button
                  onClick={() => setMinRating(5)}
                  className={`flex items-center gap-1.5 text-xs font-medium text-left p-1.5 rounded-xl transition-all ${minRating === 5 ? 'bg-zinc-150 font-bold text-zinc-950' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'}`}
                >
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarIcon key={s} className="text-amber-400" sx={{ fontSize: 13 }} />
                    ))}
                  </div>
                  <span>5 stars</span>
                </button>
                <button
                  onClick={() => setMinRating(4)}
                  className={`flex items-center gap-1.5 text-xs font-medium text-left p-1.5 rounded-xl transition-all ${minRating === 4 ? 'bg-zinc-150 font-bold text-zinc-950' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800'}`}
                >
                  <div className="flex">
                    {[1, 2, 3, 4].map((s) => (
                      <StarIcon key={s} className="text-amber-400" sx={{ fontSize: 13 }} />
                    ))}
                    <StarBorderIcon className="text-zinc-300" sx={{ fontSize: 13 }} />
                  </div>
                  <span>4+ stars</span>
                </button>
              </div>
            </div>
          </aside>

          {/* Right Column: Catalog Listing */}
          <section className="flex-1 w-full flex flex-col gap-6">

            {/* Top Bar Sort and Toggles */}
            <div className="bg-white border border-zinc-200/50 rounded-3xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <span className="text-xs text-zinc-500 font-bold">
                Showing <span className="text-zinc-900 font-black">{filteredProducts.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> of <span className="text-zinc-900 font-black">{filteredProducts.length}</span> products
              </span>

              <div className="flex items-center gap-4">
                {/* Sort dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-extrabold text-zinc-400 uppercase tracking-wide">Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-zinc-100 hover:bg-zinc-200/60 text-zinc-900 text-xs font-bold py-1.5 px-3 rounded-xl focus:outline-none border border-transparent focus:border-zinc-200 cursor-pointer"
                  >
                    <option value="Newest">Newest</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    <option value="Rating">Rating</option>
                  </select>
                </div>

                {/* View toggles */}
                <div className="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/10">
                  <button
                    onClick={() => setIsGridView(true)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isGridView ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-700'}`}
                  >
                    <GridViewIcon fontSize="small" />
                  </button>
                  <button
                    onClick={() => setIsGridView(false)}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${!isGridView ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-700'}`}
                  >
                    <ViewListIcon fontSize="small" />
                  </button>
                </div>
              </div>
            </div>

            {/* Catalog Grid/List */}
            {productsLoading ? (
              <div className="flex justify-center items-center py-20 text-zinc-900">
                <CircularProgress color="inherit" />
              </div>
            ) : paginatedProducts.length > 0 ? (
              <div className={isGridView ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-zinc-200/40 rounded-3xl p-16 text-center text-zinc-500 shadow-sm font-medium">
                No products found matching the filters or search query.
              </div>
            )}

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  variant="ghost"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-2 min-w-10 h-10 rounded-full"
                >
                  <ChevronLeftIcon fontSize="small" />
                </Button>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <Button
                    key={idx}
                    variant={currentPage === idx + 1 ? 'secondary' : 'ghost'}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${currentPage === idx + 1 ? 'bg-zinc-900 text-white' : 'text-zinc-550'}`}
                  >
                    {idx + 1}
                  </Button>
                ))}
                <Button
                  variant="ghost"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-2 min-w-10 h-10 rounded-full"
                >
                  <ChevronRightIcon fontSize="small" />
                </Button>
              </div>
            )}
          </section>
        </div>
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

export default function Shop() {
  return <ShopContent />;
}
