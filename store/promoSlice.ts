import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

interface Promo {
  id: string;
  code: string;
  discount_percent: number;
  active: boolean;
  expires_at: string;
  user_id?: string | null;
}

interface PromoState {
  currentPromo: string | null;
  appliedDiscount: number;
  promoList: Promo[];
  loading: boolean;
  error: string | null;
}

const initialState: PromoState = {
  currentPromo: null,
  appliedDiscount: 0,
  promoList: [],
  loading: false,
  error: null,
};

// =======================
// THUNKS
// =======================

// ✅ Appliquer un code promo (utilisateur)
export const applyPromo = createAsyncThunk(
  'promo/applyPromo',
  async (code: string, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/apply-promo/${code}`);
      return { code, discount: res.data.discount_percent };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Créer un code promo (admin)
export const createPromo = createAsyncThunk(
  'promo/createPromo',
  async (
    { discount_percent, expires_in_days = 7, user_id = null }: { discount_percent: number; expires_in_days?: number; user_id?: number | null },
    { rejectWithValue }
  ) => {
    try {
      const payload: Record<string, any> = { discount_percent, expires_in_days };
      if (user_id) payload.user_id = user_id;

      const res = await api.post(`/api/admin/create-promo`, payload);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Récupérer tous les codes promo (admin)
export const fetchPromos = createAsyncThunk(
  'promo/fetchPromos',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/admin/promos`);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Activer/Désactiver un code promo
export const togglePromoStatus = createAsyncThunk(
  'promo/togglePromoStatus',
  async (promoId: string, { rejectWithValue }) => {
    try {
      const res = await api.put(`/api/admin/promos/${promoId}/toggle`);
      return { promoId, active: res.data.active };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// ✅ Supprimer un code promo
export const deletePromo = createAsyncThunk(
  'promo/deletePromo',
  async (promoId: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/api/admin/promos/${promoId}`);
      return promoId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// =======================
// SLICE
// =======================
const promoSlice = createSlice({
  name: 'promo',
  initialState,
  reducers: {
    resetPromo: (state) => {
      state.currentPromo = null;
      state.appliedDiscount = 0;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Appliquer un promo
    builder
      .addCase(applyPromo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyPromo.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPromo = action.payload.code;
        state.appliedDiscount = action.payload.discount;
      })
      .addCase(applyPromo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentPromo = null;
        state.appliedDiscount = 0;
      });

    // Créer un promo
    builder
      .addCase(createPromo.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPromo.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createPromo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Récupérer promos
    builder
      .addCase(fetchPromos.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPromos.fulfilled, (state, action: PayloadAction<Promo[]>) => {
        state.loading = false;
        state.promoList = action.payload;
      })
      .addCase(fetchPromos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle promo status
    builder
      .addCase(togglePromoStatus.fulfilled, (state, action) => {
        const index = state.promoList.findIndex((p) => p.id === action.payload.promoId);
        if (index !== -1) {
          state.promoList[index].active = action.payload.active;
        }
      });

    // Delete promo
    builder
      .addCase(deletePromo.fulfilled, (state, action) => {
        state.promoList = state.promoList.filter((p) => p.id !== action.payload);
      });
  },
});

export const { resetPromo } = promoSlice.actions;
export default promoSlice.reducer;
