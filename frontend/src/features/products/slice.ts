import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  Product,
  ProductsState,
  CreateProductPayload,
  UpdateProductPayload,
} from './types';

const initialState: ProductsState = {
  products: [],
  loading: false,
  saving: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    // ── Fetch all products (admin sees all, including inactive) ──
    fetchProductsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.loading = false;
      state.products = action.payload;
    },
    fetchProductsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // ── Create product ──
    createProductRequest: (state, _action: PayloadAction<CreateProductPayload>) => {
      state.saving = true;
      state.error = null;
    },
    createProductSuccess: (state, action: PayloadAction<Product>) => {
      state.saving = false;
      state.products.unshift(action.payload); // add to top of list
    },
    createProductFailure: (state, action: PayloadAction<string>) => {
      state.saving = false;
      state.error = action.payload;
    },

    // ── Update product ──
    updateProductRequest: (state, _action: PayloadAction<UpdateProductPayload>) => {
      state.saving = true;
      state.error = null;
    },
    updateProductSuccess: (state, action: PayloadAction<Product>) => {
      state.saving = false;
      const idx = state.products.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) state.products[idx] = action.payload;
    },
    updateProductFailure: (state, action: PayloadAction<string>) => {
      state.saving = false;
      state.error = action.payload;
    },

    // ── Delete product ──
    deleteProductRequest: (state, _action: PayloadAction<string>) => {
      state.saving = true;
      state.error = null;
    },
    deleteProductSuccess: (state, action: PayloadAction<string>) => {
      state.saving = false;
      state.products = state.products.filter((p) => p._id !== action.payload);
    },
    deleteProductFailure: (state, action: PayloadAction<string>) => {
      state.saving = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchProductsRequest,
  fetchProductsSuccess,
  fetchProductsFailure,
  createProductRequest,
  createProductSuccess,
  createProductFailure,
  updateProductRequest,
  updateProductSuccess,
  updateProductFailure,
  deleteProductRequest,
  deleteProductSuccess,
  deleteProductFailure,
} = productsSlice.actions;

export default productsSlice.reducer;
