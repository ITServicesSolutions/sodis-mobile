// store/currencySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api'; 

interface Currency {
  id?: number;
  code: string;
  name: string;
  symbol?: string;
  is_active?: boolean;
}

interface CurrencyState {
  currencies: Currency[];
  activeCurrency: Currency | null;
  loading: boolean;
  error: string | null;
}

const initialState: CurrencyState = {
  currencies: [],
  activeCurrency: null,
  loading: false,
  error: null,
};

// 1️⃣ Récupérer toutes les devises
export const getAllCurrencies = createAsyncThunk(
  'currency/getAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('api/currencies');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

// 2️⃣ Récupérer la devise active
export const getActiveCurrency = createAsyncThunk(
  'currency/getActive',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('api/currencies/active');
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    clearCurrencyError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // getAllCurrencies
      .addCase(getAllCurrencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCurrencies.fulfilled, (state, action: PayloadAction<Currency[]>) => {
        state.loading = false;
        state.currencies = action.payload;
      })
      .addCase(getAllCurrencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // getActiveCurrency
      .addCase(getActiveCurrency.fulfilled, (state, action: PayloadAction<Currency>) => {
        state.activeCurrency = action.payload;
      })
  },
});

export const { clearCurrencyError } = currencySlice.actions;

export const formatPrice = (amount: number | string, currencyCode: string | undefined) => {
  const currency = currencyCode || 'EUR';

  if (typeof amount === 'string') amount = parseFloat(amount as string);
  if (typeof amount !== 'number' || isNaN(amount)) return '';

  if (currency === 'XOF') {
    return `${amount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} ${currency}`;
  }

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default currencySlice.reducer;
