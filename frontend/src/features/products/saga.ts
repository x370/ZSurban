import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import {
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
} from './slice';
import { CreateProductPayload, UpdateProductPayload } from './types';

import {
  fetchProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
} from '../../api/products';

// ── Saga workers ─────────────────────────────────────────────────────────────

function* handleFetchProducts(): Generator<any, void, any> {
  try {
    const products = yield call(fetchProductsAdmin);
    yield put(fetchProductsSuccess(products));
  } catch (error: any) {
    yield put(fetchProductsFailure(error.message || 'Failed to fetch products'));
  }
}

function* handleCreateProduct(action: PayloadAction<CreateProductPayload>): Generator<any, void, any> {
  try {
    const product = yield call(createProductAdmin, action.payload);
    yield put(createProductSuccess(product));
  } catch (error: any) {
    yield put(createProductFailure(error.message || 'Failed to create product'));
  }
}

function* handleUpdateProduct(action: PayloadAction<UpdateProductPayload>): Generator<any, void, any> {
  try {
    const product = yield call(updateProductAdmin, action.payload.id, action.payload.data);
    yield put(updateProductSuccess(product));
  } catch (error: any) {
    yield put(updateProductFailure(error.message || 'Failed to update product'));
  }
}

function* handleDeleteProduct(action: PayloadAction<string>): Generator<any, void, any> {
  try {
    const id = yield call(deleteProductAdmin, action.payload);
    yield put(deleteProductSuccess(id));
  } catch (error: any) {
    yield put(deleteProductFailure(error.message || 'Failed to delete product'));
  }
}

// ── Saga watcher ─────────────────────────────────────────────────────────────

export function* productsSaga() {
  yield takeLatest(fetchProductsRequest.type, handleFetchProducts);
  yield takeLatest(createProductRequest.type, handleCreateProduct);
  yield takeLatest(updateProductRequest.type, handleUpdateProduct);
  yield takeLatest(deleteProductRequest.type, handleDeleteProduct);
}
