// src/store/slices/categoryAttributeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { categoryAttributeService } from "@/services/categoryAttributeService";

export interface ProductAttribute {
  id: number;
  name: string;
  [key: string]: any;
}

export interface CategoryAttribute {
  id: number;
  categoryId: number;
  attributeId: number;
  [key: string]: any;
}

interface CategoryAttributeState {
  productAttributes: ProductAttribute[];
  categoryAttributes: CategoryAttribute[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryAttributeState = {
  productAttributes: [],
  categoryAttributes: [],
  loading: false,
  error: null,
};

// === ASYNC THUNKS ===

// ➕ Créer un attribut produit
export const createProductAttribute = createAsyncThunk<
  ProductAttribute,
  any,
  { rejectValue: string }
>("categoryAttribute/createProductAttribute", async (attributeData, { rejectWithValue }) => {
  try {
    return await categoryAttributeService.createProductAttribute(attributeData);
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || error.message);
  }
});

// 🔗 Associer un attribut à une catégorie
export const linkAttributeToCategory = createAsyncThunk<
  CategoryAttribute,
  any,
  { rejectValue: string }
>("categoryAttribute/linkAttributeToCategory", async (linkData, { rejectWithValue }) => {
  try {
    return await categoryAttributeService.linkAttributeToCategory(linkData);
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || error.message);
  }
});

// 🔍 Récupérer les attributs d'une catégorie
export const fetchAttributesByCategory = createAsyncThunk<
  ProductAttribute[],
  number,
  { rejectValue: string }
>("categoryAttribute/fetchAttributesByCategory", async (categoryId, { rejectWithValue }) => {
  try {
    return await categoryAttributeService.fetchAttributesByCategory(categoryId);
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || error.message);
  }
});

// ❌ Supprimer un lien CategoryAttribute
export const deleteCategoryAttributeLink = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("categoryAttribute/deleteCategoryAttributeLink", async (linkId, { rejectWithValue }) => {
  try {
    await categoryAttributeService.deleteCategoryAttributeLink(linkId);
    return linkId;
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || error.message);
  }
});

// ✏️ Mettre à jour un attribut produit
export const updateProductAttribute = createAsyncThunk<
  ProductAttribute,
  { id: number; data: any },
  { rejectValue: string }
>("categoryAttribute/updateProductAttribute", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await categoryAttributeService.updateProductAttribute(id, data);
  } catch (error: any) {
    return rejectWithValue(error?.response?.data || error.message);
  }
});

// === SLICE ===
const categoryAttributeSlice = createSlice({
  name: "categoryAttribute",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Create Product Attribute
    builder.addCase(createProductAttribute.fulfilled, (state, action: PayloadAction<ProductAttribute>) => {
      state.productAttributes.push(action.payload);
    });

    // Link Attribute to Category
    builder.addCase(linkAttributeToCategory.fulfilled, (state, action: PayloadAction<CategoryAttribute>) => {
      state.categoryAttributes.push(action.payload);
    });

    // Fetch Attributes By Category
    builder.addCase(fetchAttributesByCategory.fulfilled, (state, action: PayloadAction<ProductAttribute[]>) => {
      state.productAttributes = action.payload;
    });

    // Delete Category Attribute Link
    builder.addCase(deleteCategoryAttributeLink.fulfilled, (state, action: PayloadAction<number>) => {
      state.categoryAttributes = state.categoryAttributes.filter((ca) => ca.id !== action.payload);
    });

    // Update Product Attribute
    builder.addCase(updateProductAttribute.fulfilled, (state, action: PayloadAction<ProductAttribute>) => {
      state.productAttributes = state.productAttributes.map((pa) =>
        pa.id === action.payload.id ? action.payload : pa
      );
    });

    // Gestion loading / error
    builder.addMatcher((action) => action.type.startsWith("categoryAttribute/") && action.type.endsWith("/pending"), (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addMatcher((action) => action.type.startsWith("categoryAttribute/") && action.type.endsWith("/fulfilled"), (state) => {
      state.loading = false;
    });
    builder.addMatcher((action) => action.type.startsWith("categoryAttribute/") && action.type.endsWith("/rejected"), (state, action: any) => {
      state.loading = false;
      state.error = action.payload || "Une erreur est survenue";
    });
  },
});

export default categoryAttributeSlice.reducer;
