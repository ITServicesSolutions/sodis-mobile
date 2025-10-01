// store/packageSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "@/services/api";
import { createSelector } from "reselect";
import { RootState } from "./index";

interface ProductItem {
  name: string;
}

interface PackageItem {
  product_id?: string;
  product?: ProductItem;
  image_url?: string;
  price?: number;
  quantity?: number | string;
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  price: number;
  currency?: string;
  status?: string;
  package_items: PackageItem[];
}

interface PaginateOptions {
  current_page: number;
  total_page: number;
  per_page: number;
  total: number;
}

interface PackageState {
  packages: Package[];
  package: Package | null;
  paginateOptions: PaginateOptions;
  loading: boolean;
  error: string | null;
}

const initialState: PackageState = {
  packages: [],
  package: null,
  paginateOptions: {
    current_page: 1,
    total_page: 0,
    per_page: 10,
    total: 0,
  },
  loading: false,
  error: null,
};

// 🔹 1. Lister les packages
export const fetchPackages = createAsyncThunk(
  "packages/fetchAll",
  async (params: { page?: number; per_page?: number; search?: string; status?: string }, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/packages", {
        params: {
          page: params.page || 1,
          per_page: params.per_page || 10,
          name_filter: params.search || "",
          status_filter: params.status || undefined,
        },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// 🔹 2. Récupérer un package par ID
export const fetchPackageById = createAsyncThunk(
  "packages/fetchById",
  async (package_id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/packages/${package_id}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// 🔹 3. Créer un package
export const createPackage = createAsyncThunk(
  "packages/create",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await api.post("/api/packages", payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// 🔹 4. Mettre à jour un package
export const updatePackage = createAsyncThunk(
  "packages/update",
  async ({ package_id, payload }: { package_id: string; payload: any }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/packages/${package_id}`, payload);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// 🔹 5. Supprimer un package
export const deletePackage = createAsyncThunk(
  "packages/delete",
  async (package_id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/packages/${package_id}`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// 🔹 6 & 7. Activer / Désactiver
export const activatePackage = createAsyncThunk(
  "packages/activate",
  async (package_id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/packages/${package_id}/activate`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: "Erreur inconnue" });
    }
  }
);

export const deactivatePackage = createAsyncThunk(
  "packages/deactivate",
  async (package_id: string, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/packages/${package_id}/deactivate`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// 🔹 8. Package avec détails
export const fetchPackageDetailById = createAsyncThunk(
  "packages/fetchDetail",
  async (package_id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/packages/${package_id}/detail`);
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// 🔹 9. Best offers
export const fetchPublicBestOfferPackages = createAsyncThunk(
  "packages/fetchBestOffers",
  async (params: { country: string; search?: string; page?: number; per_page?: number }, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/public/product-packages/best-offers", { params });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: "Erreur inconnue" });
    }
  }
);

// 🔹 10. Random best offers
export const fetchRandomBestOfferPackages = createAsyncThunk(
  "packages/fetchRandomBestOffers",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/api/public/product-packages/best-offers/sample");
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || { message: "Erreur inconnue" });
    }
  }
);

const packageSlice = createSlice({
  name: "packages",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Lister packages
      .addCase(fetchPackages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPackages.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.packages = action.payload.items || action.payload;
        if (action.payload.current_page) {
          state.paginateOptions = {
            current_page: action.payload.current_page,
            total_page: action.payload.total_page,
            per_page: action.payload.per_page,
            total: action.payload.total,
          };
        }
      })
      .addCase(fetchPackages.rejected, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.error = action.payload?.message || "Erreur lors de la récupération";
      })

      // Package by ID
      .addCase(fetchPackageById.fulfilled, (state, action) => {
        state.package = action.payload;
      })

      // Package détail
      .addCase(fetchPackageDetailById.fulfilled, (state, action) => {
        state.package = action.payload;
      })

      // Best offers
      .addCase(fetchPublicBestOfferPackages.fulfilled, (state, action) => {
        state.packages = action.payload.items;
        state.paginateOptions = {
          current_page: action.payload.current_page,
          total_page: action.payload.total_page,
          per_page: action.payload.per_page,
          total: action.payload.total,
        };
      })

      // Random best offers
      .addCase(fetchRandomBestOfferPackages.fulfilled, (state, action) => {
        state.packages = action.payload;
      });
  },
});

export default packageSlice.reducer;

// Sélecteurs simples
export const selectPackages = (state: RootState) => state.packages.packages;
export const selectPackage = (state: RootState) => state.packages.package;
export const selectPaginateOptions = (state: RootState) => state.packages.paginateOptions;

// Sélecteur top 6 packages (mémorisé)
export const selectTop6Packages = createSelector(
  [selectPackages],
  (packages) => packages.slice(0, 6)
);

// Exemple : top 9 packages
export const selectTop9Packages = createSelector(
  [selectPackages],
  (packages) => packages.slice(0, 9)
);
