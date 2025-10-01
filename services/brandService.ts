// src/services/brandService.ts
import api from "./api"; // ton axiosInstance de tout à l'heure

export const brandService = {
  fetchBrands: async (filterOptions?: Record<string, any>) => {
    try {
      const res = await api.get("/api/brands", { params: filterOptions });
      return res.data;
    } catch (error: any) {
      console.log(error);
      throw error?.response?.data;
    }
  },

  addBrand: async (brandData: Record<string, any>) => {
    try {
      const res = await api.post("/api/brands", brandData);
      return res.data;
    } catch (error: any) {
      console.log(error);
      throw error?.response?.data;
    }
  },

  updateBrand: async (updatedData: Record<string, any>) => {
    try {
      const res = await api.put(`/api/brands/${updatedData.id}`, updatedData);
      return res.data;
    } catch (error: any) {
      console.log(error);
      throw error?.response?.data;
    }
  },

  deleteBrand: async (brandId: string | number) => {
    try {
      await api.delete(`/api/brands/${brandId}`);
    } catch (error: any) {
      console.log(error);
      throw error?.response?.data;
    }
  },
};
