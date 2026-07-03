import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/rootReducer';
import {
  fetchProductsRequest,
  createProductRequest,
  updateProductRequest,
  deleteProductRequest,
} from '../features/products/slice';
import { Product, CreateProductPayload } from '../features/products/types';
import { CircularProgress, Alert } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import ProductFormModal from './ProductFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import Button from './Button';

export default function ProductsPanel() {
  const dispatch = useDispatch();
  const { products, loading, saving, error } = useSelector((state: RootState) => state.products);

  const [formOpen, setFormOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  useEffect(() => {
    dispatch(fetchProductsRequest());
  }, [dispatch]);

  const handleOpenAdd = () => {
    setEditProduct(null);
    setFormOpen(true);
  };
  const handleOpenEdit = (p: Product) => {
    setEditProduct(p);
    setFormOpen(true);
  };
  const handleCloseForm = () => {
    setFormOpen(false);
    setEditProduct(null);
  };

  const handleFormSubmit = (data: CreateProductPayload) => {
    if (editProduct) {
      dispatch(updateProductRequest({ id: editProduct._id, data }));
    } else {
      dispatch(createProductRequest(data));
    }
    setFormOpen(false);
    setEditProduct(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      dispatch(deleteProductRequest(deleteTarget._id));
      setDeleteTarget(null);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-zinc-900 tracking-tight">Products</h2>
          <p className="text-[10px] text-zinc-400 font-bold mt-0.5">{products.length} total products in store</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"
        >
          <AddIcon sx={{ fontSize: 16 }} />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Error */}
      {error && <Alert severity="error" className="rounded-2xl text-xs">{error}</Alert>}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <CircularProgress size={32} sx={{ color: '#00b884' }} />
        </div>
      )}

      {/* Products Table */}
      {!loading && (
        <div className="bg-white border border-zinc-200/50 rounded-2xl overflow-hidden shadow-2xs">
          {/* Table header */}
          <div className="grid grid-cols-[56px_1fr_100px_120px_80px_80px_100px] items-center px-5 py-3 border-b border-zinc-100 text-[9px] font-black text-zinc-400 uppercase tracking-wider select-none text-left">
            <span>Image</span>
            <span>Title</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          {products.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 text-sm font-semibold">
              No products yet. Click "Add Product" to create one.
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product._id}
                className="grid grid-cols-[56px_1fr_100px_120px_80px_80px_100px] items-center px-5 py-3.5 border-b border-zinc-50 hover:bg-zinc-50/60 transition-colors last:border-b-0"
              >
                {/* Thumbnail — imageUrls[0] */}
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200/60 shrink-0">
                  {product.imageUrls?.[0] ? (
                    <img
                      src={product.imageUrls[0]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon sx={{ fontSize: 18, color: '#d4d4d8' }} />
                    </div>
                  )}
                </div>

                {/* Title + description */}
                <div className="min-w-0 pr-4 text-left">
                  <p className="text-sm font-bold text-zinc-900 truncate">{product.title}</p>
                  {product.description && (
                    <p className="text-[10px] text-zinc-400 font-medium truncate mt-0.5">{product.description}</p>
                  )}
                  {product.imageUrls?.length > 1 && (
                    <span className="text-[9px] font-black text-zinc-400 mt-0.5 inline-block">
                      {product.imageUrls.length} images
                    </span>
                  )}
                </div>

                {/* Category */}
                <span className="text-xs text-zinc-500 font-semibold truncate text-left">{product.category || '—'}</span>

                {/* Price */}
                <span className="text-sm font-black text-zinc-900 text-left">
                  PKR {product.price.toLocaleString()}
                </span>

                {/* Stock */}
                <span className={`text-xs font-bold text-left ${product.stock === 0 ? 'text-red-500' : 'text-zinc-700'}`}>
                  {product.stock}
                </span>

                {/* Status badge */}
                <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full w-fit ${
                  product.isActive
                    ? 'bg-emerald-50 text-[#00b884]'
                    : 'bg-zinc-100 text-zinc-400'
                }`}>
                  {product.isActive ? <CheckCircleIcon sx={{ fontSize: 10 }} /> : <CancelIcon sx={{ fontSize: 10 }} />}
                  {product.isActive ? 'Active' : 'Hidden'}
                </span>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={() => handleOpenEdit(product)}
                    className="rounded-lg"
                    title="Edit product"
                  >
                    <EditIcon sx={{ fontSize: 13 }} />
                  </Button>
                  <Button
                    variant="icon"
                    size="sm"
                    onClick={() => setDeleteTarget(product)}
                    className="rounded-lg border-red-100 hover:bg-red-50 text-red-400 hover:text-red-650"
                    title="Delete product"
                  >
                    <DeleteIcon sx={{ fontSize: 13 }} />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <ProductFormModal
        open={formOpen}
        saving={saving}
        initialData={editProduct}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />
      <DeleteConfirmModal
        open={!!deleteTarget}
        saving={saving}
        productTitle={deleteTarget?.title || ''}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
