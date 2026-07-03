import { all, fork } from 'redux-saga/effects';
import { authSaga } from '../features/auth/saga';
import { productsSaga } from '../features/products/saga';

export default function* rootSaga() {
  yield all([
    fork(authSaga),
    fork(productsSaga),
  ]);
}
