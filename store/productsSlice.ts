import { createSlice, createAsyncThunk, PayloadAction, createSelector } from "@reduxjs/toolkit";
import api from "@/services/api";
import { RootState } from "./index";

// ====================
// Types
// ====================
interface PaginateOptions {
  current_page: number;
  total_page: number;
  per_page: number;
  total: number;
}

export interface Product {
  id: string;
  name: string;
  image_url?: string;
  description?: string;
  sale_price: number;
  gallery_images?: string[];
  custom_attributes?: Record<string, any>;
  [key: string]: any;
}

interface ProductsState {
  products: Product[];
  product: Product | null;
  similar_products: Product[];
  colors: string[];
  paginateOptions: PaginateOptions;
  loading: boolean;
  error: string | null;
  currentProduct: Product | null;
}

const initialState: ProductsState = {
  products: [],
  product: null,
  similar_products: [],
  colors: [],
  paginateOptions: {
    current_page: 1,
    total_page: 0,
    per_page: 10,
    total: 0,
  },
  currentProduct: null,
  loading: false,
  error: null,
};

// ====================
// Thunks
// ====================

// ✅ Fetch products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params: { page: number; per_page: number; search?: string }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("page", params.page.toString());
      formData.append("per_page", params.per_page.toString());
      if (params.search && params.search.trim() !== "") {
        formData.append("search", params.search.trim());
      }

      const response = await api.post("/api/list/products", formData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// ✅ Fetch product by ID
export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/products/${id}`);
      let product = response.data.product;

      if (typeof product.custom_attributes === "string") {
        try {
          product.custom_attributes = JSON.parse(product.custom_attributes);
        } catch {
          product.custom_attributes = {};
        }
      }

      return { product, similar_products: response.data.similar_products };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// ✅ Create product
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/products", productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// ✅ Update product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ productId, formData }: { productId: number; formData: FormData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/products/${productId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// ✅ Delete product
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/products/${productId}`);
      return { productId, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// ✅ Activate / Deactivate
export const activateProduct = createAsyncThunk(
  "products/activateProduct",
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/products/${productId}/activate`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || { message: "Erreur d'activation" });
    }
  }
);

export const deactivateProduct = createAsyncThunk(
  "products/deactivateProduct",
  async (productId: number, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/products/${productId}/deactivate`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || { message: "Erreur de désactivation" });
    }
  }
);

// ✅ Fetch colors
export const fetchColors = createAsyncThunk(
  "products/fetchColors",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/colors");
      return response.data.colors || [];
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// ✅ Public best offer products
export const fetchPublicBestOfferProducts = createAsyncThunk(
  "products/fetchPublicBestOfferProducts",
  async (params: any, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/products/best-offers", {
        params: {
          country: params.country,
          search: params.search || "",
          page: params.page || 1,
          per_page: params.per_page || 10,
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// ✅ Random best offer products
export const fetchRandomBestOfferProducts = createAsyncThunk(
  "products/fetchRandomBestOfferProducts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/public/products/best-offers/sample");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// ====================
// Slice
// ====================
const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch products
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = false;
      const requestedPage = action.meta.arg.page ?? 1;
      const isFirstPage = requestedPage === 1;

      state.products = isFirstPage
        ? action.payload.items || []
        : [...state.products, ...(action.payload.items || [])];

      state.paginateOptions = {
        current_page: action.payload.current_page ?? requestedPage,
        total_page: action.payload.total_page,
        per_page: action.payload.per_page,
        total: action.payload.total,
      };
    });

    builder.addCase(fetchProducts.rejected, (state, action: any) => {
      state.loading = false;
      state.error = action.payload?.message || "Erreur lors du chargement des produits";
    });

    // Fetch product by ID
    builder.addCase(fetchProductById.fulfilled, (state, action: PayloadAction<{ product: Product; similar_products: Product[] }>) => {
      state.loading = false;
      state.currentProduct = action.payload.product;
      state.similar_products = action.payload.similar_products || [];
    });

    // Update product
    builder.addCase(updateProduct.fulfilled, (state, action: PayloadAction<any>) => {
      const updated = action.payload;
      const index = state.products.findIndex((p) => p.id === updated.id);
      if (index !== -1) {
        state.products[index] = { ...updated, image_url: updated.image_url + `?t=${Date.now()}` };
      }
      if (state.product && state.product.id === updated.id) {
        state.product = { ...updated, image_url: updated.image_url + `?t=${Date.now()}` };
      }
    });

    // Delete product
    builder.addCase(deleteProduct.fulfilled, (state, action: PayloadAction<any>) => {
      state.products = state.products.filter((p) => p.id !== action.payload.productId);
    });

    // Fetch colors
    builder.addCase(fetchColors.fulfilled, (state, action: PayloadAction<string[]>) => {
      state.colors = action.payload;
    });

    // Fetch public best offers
    builder.addCase(fetchPublicBestOfferProducts.fulfilled, (state, action: PayloadAction<any>) => {
      state.products = action.payload.items || [];
      state.paginateOptions = {
        current_page: action.payload.current_page,
        total_page: action.payload.total_page,
        per_page: action.payload.per_page,
        total: action.payload.total,
      };
    });

    // Fetch random best offers
    builder.addCase(fetchRandomBestOfferProducts.fulfilled, (state, action: PayloadAction<any>) => {
      state.products = action.payload;
    });
  },
});

export default productsSlice.reducer;

// ====================
// Selectors
// ====================

// Base selector
export const selectProductsState = (state: RootState) => state.products;

// Liste complète des produits
export const selectProducts = createSelector(
  [selectProductsState],
  (productsState) => productsState.products
);

// Les 6 premiers produits
export const selectTop6Products = createSelector(
  [selectProducts],
  (products) => products.slice(0, 6)
);

// Produit sélectionné
export const selectCurrentProduct = createSelector(
  [selectProductsState],
  (productsState) => productsState.currentProduct
);


// Produits similaires
export const selectSimilarProducts = createSelector(
  [selectProductsState],
  (productsState) => productsState.similar_products
);

export const selectProductsLoading = (state: RootState) => state.products.loading;
export const selectProductsError = (state: RootState) => state.products.error;
export const selectProductsPaginate = (state: RootState) => state.products.paginateOptions;