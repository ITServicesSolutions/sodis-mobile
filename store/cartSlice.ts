// store/cartSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { cartService } from "@/services/cartService";

// Typage
export interface CartItem {
  id: string;
  product_id?: string;
  package_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  product_image?: string;
  isPackage?: boolean;
  selected_color?: string;
  selected_size?: string;
  selected_weight?: string;
  selected_smell?: string;
  custom_options?: Record<string, any>;
}

interface CartDetail {
  total_price: number;
  total_discount: number;
  total_tax?: number;
  total_amount: number;
  promo_code?: string | null;
  promo_discount: number;
  global_discount: number;
  user_discount_type: string | number;
}

interface CartState {
  items: CartItem[];
  detail: CartDetail;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  detail: {
    total_price: 0,
    total_discount: 0,
    total_tax: 0,
    total_amount: 0,
    promo_code: null,
    promo_discount: 0,
    global_discount: 0,
    user_discount_type: "global",
  },
  loading: false,
  error: null,
};

// === ASYNC THUNKS ===
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.fetchCart();
    } catch (error: any) {
      return rejectWithValue(error?.detail || "Erreur inconnue");
    }
  }
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (data: { product_id?: string; package_id?: string; quantity?: number }, { rejectWithValue }) => {
    try {
      return await cartService.addToCart(data);
    } catch (error: any) {
      return rejectWithValue(error?.detail || "Erreur ajout au panier");
    }
  }
);

export const updateCart = createAsyncThunk(
  "cart/updateCart",
  async (data: { id: string; quantity?: number; selected_color?: string; selected_size?: string; selected_weight?: string; selected_smell?: string; custom_options?: any }, { rejectWithValue }) => {
    try {
      return await cartService.updateCart(data);
    } catch (error: any) {
      return rejectWithValue(error?.detail || "Erreur mise à jour panier");
    }
  }
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (cartItemId: string, { rejectWithValue }) => {
    try {
      return await cartService.removeFromCart(cartItemId);
    } catch (error: any) {
      return rejectWithValue(error?.detail || "Erreur suppression panier");
    }
  }
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, { rejectWithValue }) => {
    try {
      return await cartService.clearCart();
    } catch (error: any) {
      return rejectWithValue(error?.detail || "Erreur vidage panier");
    }
  }
);

// === SLICE ===
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // fetchCart
    builder.addCase(fetchCart.pending, (state) => { state.loading = true; });
    builder.addCase(fetchCart.fulfilled, (state, action: PayloadAction<{ items: CartItem[]; detail: CartDetail }>) => {
      state.loading = false;
      state.items = action.payload.items.map(item => ({
        ...item,
        isPackage: !!item.package_id,
      }));
      state.detail = action.payload.detail;
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // addToCart
    builder.addCase(addToCart.pending, (state) => { state.loading = true; });
    builder.addCase(addToCart.fulfilled, (state, action: PayloadAction<{ items: CartItem[]; detail: CartDetail }>) => {
      state.loading = false;
      state.items = action.payload.items.map(item => ({
        ...item,
        isPackage: !!item.package_id,
      }));
      state.detail = action.payload.detail;
    });
    builder.addCase(addToCart.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // updateCart
    builder.addCase(updateCart.fulfilled, (state, action: PayloadAction<{ items: CartItem[]; detail: CartDetail }>) => {
      state.items = action.payload.items.map(item => ({
        ...item,
        isPackage: !!item.package_id,
      }));
      state.detail = action.payload.detail;
    });

    // removeFromCart
    builder.addCase(removeFromCart.fulfilled, (state, action: PayloadAction<{ items: CartItem[]; detail: CartDetail }>) => {
      state.items = action.payload.items.map(item => ({
        ...item,
        isPackage: !!item.package_id,
      }));
      state.detail = action.payload.detail;
    });

    // clearCart
    builder.addCase(clearCart.fulfilled, (state) => {
      state.items = [];
      state.detail = {
        total_price: 0,
        total_discount: 0,
        total_tax: 0,
        total_amount: 0,
        promo_code: null,
        promo_discount: 0,
        global_discount: 0,
        user_discount_type: "global",
      };
    });
  },
});

export default cartSlice.reducer;
