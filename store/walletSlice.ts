import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { walletService } from "@/services/walletService";

// Typage (ajuste selon ton backend)
export interface WalletTransaction {
  id: string;
  transaction_type: "recharge" | "achat";
  amount: number;
  created_at: string;
}


interface WalletState {
  history: WalletTransaction[];
  loading: boolean;
  error: string | null;
}

const initialState: WalletState = {
  history: [],
  loading: false,
  error: null,
};

// === ASYNC THUNK ===
export const fetchWalletHistory = createAsyncThunk(
  "wallet/fetchWalletHistory",
  async (_, { rejectWithValue }) => {
    try {
      return await walletService.fetchWalletHistory();
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

// === SLICE ===
const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchWalletHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchWalletHistory.fulfilled,
        (state, action: PayloadAction<WalletTransaction[]>) => {
          state.loading = false;
          state.history = action.payload;
        }
      )
      .addCase(fetchWalletHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default walletSlice.reducer;
