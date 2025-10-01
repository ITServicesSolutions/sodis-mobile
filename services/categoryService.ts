import api from "./api";

export const categoryService = {
  // 1. Récupérer toutes les catégories
  fetchCategories: async (filterOptions?: any) => {
    const res = await api.get("/api/categories", { params: filterOptions });
    return res.data;
  },

  // 2. Ajouter une catégorie
  addCategory: async (categoryData: any) => {
    const res = await api.post("/api/categories", categoryData);
    return res.data;
  },

  // 3. Mettre à jour une catégorie
  updateCategory: async (updatedData: any) => {
    const res = await api.put(`/api/categories/${updatedData.id}`, updatedData);
    return res.data;
  },

  // 4. Supprimer une catégorie
  deleteCategory: async (categoryId: number | string) => {
    const res = await api.delete(`/api/categories/${categoryId}`);
    return res.data;
  },
};
