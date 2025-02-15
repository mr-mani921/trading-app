import { configureStore } from '@reduxjs/toolkit';
import marketReducer from './slices/marketSlice';
import tradeReducer from './slices/tradeSlice';
import financeReducer from './slices/financeSlice';
import assetsReducer from './slices/assetsSlice';
import userReducer from './slices/userSlice';
import adminReducer from './slices/adminSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    market: marketReducer,
    trade: tradeReducer,
    finance: financeReducer,
    assets: assetsReducer,
    admin: adminReducer,
  },
});

export default store;