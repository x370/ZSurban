import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { loginRequest, loginSuccess, loginFailure, logout } from './slice';
import { getApiBaseUrl } from '../../api/config';

// Real API Call
const realLoginApi = async (credentials: any) => {
  const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Invalid credentials');
  }
  const data = await res.json();

  return {
    user: data.user,
    token: data.access_token,
  };
};

function* handleLogin(action: PayloadAction<any>): Generator<any, void, any> {
  try {
    const response = yield call(realLoginApi, action.payload);
    yield put(loginSuccess(response));
  } catch (error: any) {
    yield put(loginFailure(error.message || 'Login failed'));
  }
}


function* handleLoginSuccess(action: PayloadAction<any>) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('zs_user', JSON.stringify(action.payload.user));
      localStorage.setItem('zs_token', action.payload.token);
    } catch (e) {
      console.error('Failed to save admin session to localStorage', e);
    }
  }
}

function* handleLogout() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('zs_user');
      localStorage.removeItem('zs_token');
    } catch (e) {
      console.error('Failed to clear admin session from localStorage', e);
    }
  }
}

export function* authSaga() {
  console.log('[AuthSaga] authSaga watcher initialized.');
  yield takeLatest(loginRequest.type, handleLogin);
  yield takeLatest(loginSuccess.type, handleLoginSuccess);
  yield takeLatest(logout.type, handleLogout);
}
