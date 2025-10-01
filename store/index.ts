import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import wishlistReducer from "./wishlistSlice";
import packageReducer from "./packageSlice";
import productsReducer from "./productsSlice";
import categoryReducer from "./categorySlice";
import currencyReducer from "./currencySlice";
import promoReducer from "./promoSlice"
import languageReducer from './languageSlice';
import shippingReducer from './shippingSlice';
import networkReducer from './networkSlice';
import walletReducer from './walletSlice';
import orderReducer from './orderSlice';
import commissionReducer from './commissionSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    packages: packageReducer,
    products: productsReducer,
    categories: categoryReducer,
    currency: currencyReducer,
    promo: promoReducer,
    language: languageReducer,
    shipping: shippingReducer,
    network: networkReducer,
    wallet: walletReducer,
    orders: orderReducer,
    commission: commissionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
