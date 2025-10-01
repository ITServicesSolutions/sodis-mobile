import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';
import { RootState } from './index';

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  icon: string;
}

interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}


const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

// --- Thunks ---
export const fetchCategories = createAsyncThunk<Category[], Record<string, any> | void>(
  'categories/fetchCategories',
  async (filterOptions, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/categories', { params: filterOptions });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || 'Erreur lors du chargement des catégories');
    }
  }
);

export const addCategory = createAsyncThunk<Category, Partial<Category>>(
  'categories/addCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/categories', categoryData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || 'Erreur lors de l’ajout');
    }
  }
);

export const updateCategory = createAsyncThunk<Category, Category>(
  'categories/updateCategory',
  async (updatedData, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/categories/${updatedData.id}`, updatedData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || 'Erreur lors de la mise à jour');
    }
  }
);

export const deleteCategory = createAsyncThunk<string, string>(
  'categories/deleteCategory',
  async (categoryId, { rejectWithValue }) => {
    try {
      await api.delete(`/api/categories/${categoryId}`);
      return categoryId;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data || 'Erreur lors de la suppression');
    }
  }
);

// --- Slice ---
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch categories
    builder.addCase(fetchCategories.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
      state.loading = false;
      state.categories = action.payload;
    });
    builder.addCase(fetchCategories.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Add category
    builder.addCase(addCategory.fulfilled, (state, action: PayloadAction<Category>) => {
      state.categories.push(action.payload);
    });

    // Update category
    builder.addCase(updateCategory.fulfilled, (state, action: PayloadAction<Category>) => {
      const index = state.categories.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) {
        state.categories[index] = action.payload;
      }
    });

    // Delete category
    builder.addCase(deleteCategory.fulfilled, (state, action: PayloadAction<string>) => {
      state.categories = state.categories.filter((c) => c.id !== action.payload);
    });
  },
});

export default categorySlice.reducer;

// --- Selectors ---
export const selectCategories = (state: RootState) => state.categories.categories;
export const selectCategoriesLoading = (state: RootState) => state.categories.loading;
export const selectCategoriesError = (state: RootState) => state.categories.error;
