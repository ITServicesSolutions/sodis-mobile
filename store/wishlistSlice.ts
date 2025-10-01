import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { wishlistService } from "@/services/wishlistService";

interface AddWishlistData {
  product_id?: string;
  package_id?: string;
}

// Typage (à ajuster selon ton backend)
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id?: string;
  package_id?: string;
  added_at: string;
  selected_color?: string;
  selected_size?: string;
  selected_weight?: string;
  selected_smell?: string;
  product_name: string;
  unit_price: number;
  product_image: string;
}

interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
  error: null,
};

// === ASYNC THUNKS ===

// 1. Récupérer wishlist
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchWishlist",
  async (_, { rejectWithValue }) => {
    try {
      return await wishlistService.fetchWishlist();
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

// 2. Ajouter un produit
export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async (data: AddWishlistData, { dispatch, rejectWithValue }) => {
    try {
      await wishlistService.addToWishlist(data);
      // Après ajout, on recharge la liste complète
      const updatedList = await wishlistService.fetchWishlist();
      return updatedList;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

// 3. Ajouter un package
export const addPackageToWishlist = createAsyncThunk(
  "wishlist/addPackageToWishlist",
  async (data: AddWishlistData, { dispatch, rejectWithValue }) => {
    try {
      await wishlistService.addPackageToWishlist(data);
      // Après ajout, on recharge la liste complète
      const updatedList = await wishlistService.fetchWishlist();
      return updatedList;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

// 4. Supprimer un produit
export const removeFromWishlist = createAsyncThunk(
  "wishlist/removeFromWishlist",
  async (wishlistItemId: string, { rejectWithValue }) => {
    try {
      await wishlistService.removeFromWishlist(wishlistItemId);
      return wishlistItemId;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

// 5. Vider la wishlist
export const clearWishlist = createAsyncThunk(
  "wishlist/clearWishlist",
  async (_, { rejectWithValue }) => {
    try {
      return await wishlistService.clearWishlist();
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

// === SLICE ===
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch
    builder.addCase(fetchWishlist.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchWishlist.fulfilled, (state, action: PayloadAction<WishlistItem[]>) => {
      state.loading = false;
      state.items = action.payload;
    });
    builder.addCase(fetchWishlist.rejected, (state, action) => {
      state.loading = false;
      state.error = typeof action.payload === "string" ? action.payload : "Erreur inconnue";

    });

    // Add Product
    builder.addCase(addToWishlist.fulfilled, (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
      state.error = null;
    });

    // Add Package
    builder.addCase(addPackageToWishlist.fulfilled, (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
      state.error = null;
    });

    // Remove
    builder.addCase(removeFromWishlist.fulfilled, (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      state.error = null;
    });

    // Clear
    builder.addCase(clearWishlist.fulfilled, (state) => {
      state.items = [];
    });

    // Gestion des erreurs pour gérer les rejets
    builder.addCase(removeFromWishlist.rejected, (state, action) => {
      state.error = typeof action.payload === "string" ? action.payload : "Erreur inconnue";
    });
    builder.addCase(clearWishlist.rejected, (state, action) => {
      state.error = typeof action.payload === "string" ? action.payload : "Erreur inconnue";
    });

  },
});

export default wishlistSlice.reducer;
