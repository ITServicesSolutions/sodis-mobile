// store/slices/orderSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/services/api";
import { RootState } from "@/store";

// --- Types ---
export interface Product {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
  sale_price: number;
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  price: number;
}

export interface OrderItem {
  id: string;
  product_id?: string | null;
  package_id?: string | null;
  quantity: number;
   price: number;
  unit_price: number;
  subtotal: number; 
  product_name?: string | null;
  package_name?: string | null;
  product?: Product;
  package?: Package;
  product_image?: string | null;
}

export interface ShippingInfo {
  id: string;
  full_name: string;
  address: string;
  city?: string;
  country?: string;
  is_default?: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  created_at: string;
  status: string;
  order_number: string;
  invoice_number?: string | null;
  delivery_status?: string | null;
  delivery_person_id?: string | null;
  delivery_person_name?: string | null;
  user_name?: string | null;
  total_price: number;
  total_discount: number;
  total_tax: number;
  total_amount: number;
  promo_code?: string | null;
  discount_type?: string | null;
  payment_method?: string | null;
  tax_percent?: number;
  promo_discount?: number;
  user_discount?: number;
  items: OrderItem[];
  shipping_info?: ShippingInfo;
}

export interface OrdersResponse {
  orders: Order[];
  current_page: number;
  total_page: number;
  per_page: number;
  total: number;
}

// --- Thunk pour créer une commande ---
export interface CreateOrderPayload {
  items: {
    product_id?: string;
    package_id?: string;
    quantity: number;
    selected_color?: string;
    selected_size?: string;
    selected_weight?: string;
    selected_smell?: string;
    custom_options?: Record<string, any>;
  }[];
  shipping_info_id: string;
  promo_code?: string;
  total_price: number;
  status?: string;
}

export interface CreateOrderResponse {
  message: string;
  order_id: string;
  total_price: number;
  total_discount: number;
  total_tax: number;
  total_amount: number;
  promo_code?: string | null;
  promo_discount?: number;
  global_discount?: number;
  tax_percent?: number;
  user_discount_type?: string;
}

// --- State ---
interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  currentPage: number;
  totalPage: number;
  perPage: number;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  currentPage: 1,
  totalPage: 1,
  perPage: 10,
  total: 0,
  loading: false,
  error: null,
};

// --- Thunk pour récupérer les commandes ---
export const fetchOrders = createAsyncThunk<
  OrdersResponse,
  { page?: number; perPage?: number; search?: string },
  { rejectValue: string }
>(
  "orders/fetchOrders",
  async ({ page = 1, perPage = 10, search }, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/orders/my", {
        params: { page, per_page: perPage, search },
      });
      return response.data as OrdersResponse;
    } catch (error: any) {
      console.error("Erreur lors du chargement des commandes:", error);
      return rejectWithValue(error.response?.data?.detail || "Erreur inconnue");
    }
  }
);

// --- Thunk pour créer les commandes ---
export const createOrder = createAsyncThunk<
  CreateOrderResponse,
  CreateOrderPayload,
  { rejectValue: string }
>("orders/createOrder", async (orderData, { rejectWithValue }) => {
  try {
    const response = await api.post("/api/order/create", orderData);
    return response.data as CreateOrderResponse;
  } catch (error: any) {
    console.error("Erreur lors de la création de la commande:", error);
    return rejectWithValue(
      error.response?.data?.detail || "Erreur lors de la création"
    );
  }
});

// --- Thunk pour récupérer une commande par ID ---
export const fetchOrderById = createAsyncThunk<
  Order,
  string,
  { rejectValue: string }
>("orders/fetchOrderById", async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.get(`/api/order/${orderId}`);
    return response.data as Order;
  } catch (error: any) {
    console.error("Erreur lors du chargement de la commande:", error);
    return rejectWithValue(error.response?.data?.detail || "Erreur inconnue");
  }
});

// --- Slice ---
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.currentPage = 1;
      state.totalPage = 1;
      state.perPage = 10;
      state.total = 0;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchOrders.fulfilled,
        (state, action: PayloadAction<OrdersResponse>) => {
          state.orders = action.payload.orders;
          state.currentPage = action.payload.current_page;
          state.totalPage = action.payload.total_page;
          state.perPage = action.payload.per_page;
          state.total = action.payload.total;
          state.loading = false;
        }
      )
      .addCase(fetchOrders.rejected, (state, action) => {
        state.error =
          (action.payload as string) ||
          "Erreur lors du chargement des commandes";
        state.loading = false;
      })

      // gestion de createOrder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createOrder.fulfilled,
        (state, action: PayloadAction<CreateOrderResponse>) => {
          // Ici tu peux soit refetch les commandes, soit pousser une commande vide temporaire
          state.loading = false;
          state.error = null;
        }
      )
      .addCase(createOrder.rejected, (state, action) => {
        state.error =
          (action.payload as string) ||
          "Erreur lors de la création de la commande";
        state.loading = false;
      })

      // fetchOrderById
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedOrder = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
        state.selectedOrder = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.error = action.payload || "Erreur lors du chargement de la commande";
        state.loading = false;
      });
  },
});

export const { clearOrders } = orderSlice.actions;

export const selectOrders = (state: RootState) => state.orders;
export const selectSelectedOrder = (state: RootState) => state.orders.selectedOrder;

export default orderSlice.reducer;
