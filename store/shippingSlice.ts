import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface ShippingInfo {
  id: string;
  full_name: string;
  address: string;
  city: string;
  country: string;
  postal_code: string;
  phone_number: string;
  is_default: boolean;
}

interface ShippingState {
  shippingList: ShippingInfo[];
  loading: boolean;
  error: string | null;
}

const initialState: ShippingState = {
  shippingList: [],
  loading: false,
  error: null,
};

// Thunks async
export const fetchShippingInfo = createAsyncThunk(
  'shipping/fetchShippingInfo',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/shipping-info`);
      return response.data as ShippingInfo[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const addShippingInfo = createAsyncThunk(
  'shipping/addShippingInfo',
  async (data: Omit<ShippingInfo, 'id'>, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/shipping-info/add`, data);
      return response.data as ShippingInfo;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const updateShippingInfo = createAsyncThunk(
  'shipping/updateShippingInfo',
  async ({ id, data }: { id: string; data: Partial<ShippingInfo> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/shipping-info/update/${id}`, data);
      return { id, ...data } as ShippingInfo;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const deleteShippingInfo = createAsyncThunk(
  'shipping/deleteShippingInfo',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/api/shipping-info/delete/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

export const setDefaultShippingInfo = createAsyncThunk(
  'shipping/setDefaultShippingInfo',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/shipping-info/set-default/${id}`);
      return response.data as ShippingInfo;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message);
    }
  }
);

const shippingSlice = createSlice({
  name: 'shipping',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchShippingInfo.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchShippingInfo.fulfilled, (state, action: PayloadAction<ShippingInfo[]>) => {
        state.loading = false;
        state.shippingList = action.payload;
      })
      .addCase(fetchShippingInfo.rejected, (state, action: any) => { state.loading = false; state.error = action.payload; })

      // add
      .addCase(addShippingInfo.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(addShippingInfo.fulfilled, (state, action: PayloadAction<ShippingInfo>) => {
        state.loading = false;
        // si ajouté comme défaut, remplacer l'ancien
        if (action.payload.is_default) {
          state.shippingList = state.shippingList.map((addr) => ({ ...addr, is_default: false }));
        }
        state.shippingList.push(action.payload);
      })
      .addCase(addShippingInfo.rejected, (state, action: any) => { state.loading = false; state.error = action.payload; })

      // update
      .addCase(updateShippingInfo.fulfilled, (state, action: PayloadAction<ShippingInfo>) => {
        const index = state.shippingList.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.shippingList[index] = action.payload;
          if (action.payload.is_default) {
            state.shippingList = state.shippingList.map((s) =>
              s.id === action.payload.id ? s : { ...s, is_default: false }
            );
          }
        }
      })

      // delete
      .addCase(deleteShippingInfo.fulfilled, (state, action: PayloadAction<string>) => {
        state.shippingList = state.shippingList.filter((s) => s.id !== action.payload);
      })

      // set default
      .addCase(setDefaultShippingInfo.fulfilled, (state, action: PayloadAction<ShippingInfo>) => {
        state.shippingList = state.shippingList.map((s) =>
          s.id === action.payload.id ? { ...s, is_default: true } : { ...s, is_default: false }
        );
      });
  },
});

export default shippingSlice.reducer;
