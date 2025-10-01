// store/slices/networkSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import api from "../services/api";
import { RootState } from "@/store";
import { buildTree } from "@/constants/utils";

export interface NetworkState {
  networkTree: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: NetworkState = {
  networkTree: null,
  loading: false,
  error: null,
};

// --- Thunk pour récupérer l'arbre réseau ---
export const getUserNetworkTree = createAsyncThunk<any, string, { rejectValue: string }>(
  "network/getUserNetworkTree",
  async (user_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/users/${user_id}/network-tree`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.detail || "Erreur inconnue");
    }
  }
);

const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {
    clearNetworkTree: (state) => {
      state.networkTree = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserNetworkTree.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserNetworkTree.fulfilled,(state, action: PayloadAction<any>) => {
          state.networkTree = action.payload;
          state.loading = false;
        }
      )
      .addCase(getUserNetworkTree.rejected, (state, action) => {
        state.error = action.payload || "Erreur lors du chargement du réseau";
        state.loading = false;
      });
  },
});

export const { clearNetworkTree } = networkSlice.actions;

export const selectNetwork = (state: RootState) => state.network;

export default networkSlice.reducer;
