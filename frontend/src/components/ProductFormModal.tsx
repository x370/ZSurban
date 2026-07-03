import React, { useState, useEffect } from 'react';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { Product, CreateProductPayload } from '../features/products/types';
import Button from './Button';
import Input from './Input';

interface ProductFormModalProps {
  open: boolean;
  saving: boolean;
  initialData?: Product | null;
  onClose: () => void;
  onSubmit: (data: CreateProductPayload) => void;
}

export default function ProductFormModal({ open, saving, initialData, onClose, onSubmit }: ProductFormModalProps) {
  const isEdit = !!initialData;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [wearType, setWearType] = useState('Casual');
  const [stock, setStock] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setPrice(String(initialData.price));
      setCategory(initialData.category || '');
      setWearType(initialData.wearType || 'Casual');
      setStock(String(initialData.stock));
      setIsActive(initialData.isActive);
      setImageUrls(initialData.imageUrls?.length ? initialData.imageUrls : ['']);
    } else {
      setTitle('');
      setDescription('');
      setPrice('');
      setCategory('');
      setWearType('Casual');
      setStock('0');
      setIsActive(true);
      setImageUrls(['']);
    }
  }, [initialData, open]);

  const handleAddImageUrl = () => setImageUrls((prev) => [...prev, '']);
  const handleRemoveImageUrl = (idx: number) =>
    setImageUrls((prev) => prev.filter((_, i) => i !== idx));
  const handleImageUrlChange = (idx: number, val: string) =>
    setImageUrls((prev) => prev.map((url, i) => (i === idx ? val : url)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filteredUrls = imageUrls.filter((u) => u.trim() !== '');
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      price: parseFloat(price) || 0,
      category: category.trim(),
      stock: parseInt(stock) || 0,
      isActive,
      wearType,
      imageUrls: filteredUrls,
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 pt-7 pb-5 border-b border-zinc-100">
          <div>
            <h2 className="text-lg font-black text-zinc-900 tracking-tight">
              {isEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-[10px] text-zinc-400 font-bold mt-0.5">
              {isEdit ? 'Update product details below' : 'Fill in the details to create a new product'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-500 transition-colors cursor-pointer"
          >
            <CloseIcon sx={{ fontSize: 16 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-5">
          {/* Title */}
          <Input
            required
            type="text"
            label="Product Title *"
            placeholder="e.g. Samsung Galaxy S24"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Description */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider pl-1 select-none">Description</label>
            <textarea
              rows={3}
              placeholder="Short product description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-zinc-900 font-medium outline-none transition-colors resize-none"
            />
          </div>

          {/* Price & Stock row */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              required
              type="number"
              min="0"
              label="Price (PKR) *"
              placeholder="e.g. 45000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
            <Input
              type="number"
              min="0"
              label="Stock"
              placeholder="e.g. 100"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider pl-1 select-none">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-zinc-900 font-medium outline-none transition-colors bg-white"
            >
              <option value="">Select category</option>
              <option value="Jeans Pants">Jeans Pants</option>
              <option value="Jeans Shirts">Jeans Shirts</option>
              <option value="Kids">Kids</option>
              <option value="Ladies Dress">Ladies Dress</option>
            </select>
          </div>

          {/* Wear Type */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider pl-1 select-none">Wear Type</label>
            <select
              value={wearType}
              onChange={(e) => setWearType(e.target.value)}
              className="border border-zinc-200 focus:border-zinc-900 rounded-xl px-4 py-2.5 text-sm text-zinc-900 font-medium outline-none transition-colors bg-white"
            >
              <option value="Casual">Casual</option>
              <option value="Office">Office</option>
              <option value="School">School</option>
              <option value="Party">Party</option>
            </select>
          </div>

          {/* Image URLs — dynamic list */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider pl-1">
                Image URLs
              </label>
              <span className="text-[9px] text-zinc-400 font-bold">First URL = primary thumbnail</span>
            </div>
            <div className="flex flex-col gap-2">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    type="url"
                    placeholder={idx === 0 ? 'Primary image URL (shown on cards)' : `Additional image URL ${idx + 1}`}
                    value={url}
                    onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                    icon={<ImageIcon sx={{ fontSize: 15, color: '#a1a1aa' }} />}
                    rightElement={
                      idx === 0 ? (
                        <span className="text-[8px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full shrink-0 select-none">
                          Primary
                        </span>
                      ) : undefined
                    }
                  />
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(idx)}
                      className="w-7 h-7 rounded-full border border-red-200 hover:bg-red-50 flex items-center justify-center text-red-400 transition-colors cursor-pointer shrink-0"
                    >
                      <CloseIcon sx={{ fontSize: 12 }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors mt-1 cursor-pointer w-fit"
            >
              <AddIcon sx={{ fontSize: 14 }} />
              <span>Add another image URL</span>
            </button>
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between border border-zinc-100 rounded-xl px-4 py-3">
            <div>
              <span className="text-sm font-bold text-zinc-800">Active / Visible</span>
              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Product will be shown publicly</p>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`relative rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${isActive ? 'bg-[#00b884]' : 'bg-zinc-200'}`}
              style={{ width: '44px', height: '24px' }}
            >
              <span
                className="absolute left-0 bg-white rounded-full shadow-sm transition-transform duration-200"
                style={{
                  width: '20px',
                  height: '20px',
                  top: '2px',
                  transform: `translateX(${isActive ? '22px' : '2px'})`
                }}
              />
            </button>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              fullWidth
            >
              {isEdit ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
