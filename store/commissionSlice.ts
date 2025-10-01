// commissionSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { RootState } from "./index";

// 💳 Payer avec commission
export const payWithCommission = createAsyncThunk<
  { amount_used: number; remaining_commission: number },
  string,
  { rejectValue: string }
>("commission/payWithCommission", async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.post(`/api/pay/commission/order/${orderId}`);
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.detail || "Erreur paiement commission");
  }
});

// 💰 Payer avec wallet
export const payWithWallet = createAsyncThunk<
  { amount_used: number; remaining_wallet: number },
  string,
  { rejectValue: string }
>("commission/payWithWallet", async (orderId, { rejectWithValue }) => {
  try {
    const response = await api.post(`/api/wallet/pay`, { order_id: orderId });
    return response.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.detail || "Erreur paiement wallet");
  }
});

interface CommissionState {
  loading: boolean;
  error: string | null;
  remainingCommission: number;
  remainingWallet: number;
}

const initialState: CommissionState = {
  loading: false,
  error: null,
  remainingCommission: 0,
  remainingWallet: 0,
};

const commissionSlice = createSlice({
  name: "commission",
  initialState,
  reducers: {
    resetCommissionState: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Commission
    builder.addCase(payWithCommission.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(payWithCommission.fulfilled, (state, action) => {
      state.loading = false;
      state.remainingCommission = action.payload.remaining_commission;
    });
    builder.addCase(payWithCommission.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Erreur paiement commission";
    });

    // Wallet
    builder.addCase(payWithWallet.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(payWithWallet.fulfilled, (state, action) => {
      state.loading = false;
      state.remainingWallet = action.payload.remaining_wallet;
    });
    builder.addCase(payWithWallet.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Erreur paiement wallet";
    });
  },
});

export const { resetCommissionState } = commissionSlice.actions;

export const selectCommission = (state: RootState) => state.commission;

export default commissionSlice.reducer;
