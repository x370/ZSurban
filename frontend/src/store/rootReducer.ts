import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/slice';
import productsReducer from '../features/products/slice';

const rootReducer = combineReducers({
  auth: authReducer,
  products: productsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
