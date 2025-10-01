// src/services/categoryAttributeService.ts
import api from "./api";

export const categoryAttributeService = {
  // ➕ Créer un attribut produit
  async createProductAttribute(attributeData: any) {
    const response = await api.post("/api/product-attributes", attributeData);
    return response.data;
  },

  // 🔗 Associer un attribut à une catégorie
  async linkAttributeToCategory(linkData: any) {
    const response = await api.post("/api/category-attributes", linkData);
    return response.data;
  },

  // 🔍 Récupérer les attributs d'une catégorie
  async fetchAttributesByCategory(categoryId: number) {
    const response = await api.get(`/api/categories/${categoryId}/attributes`);
    return response.data;
  },

  // ❌ Supprimer un lien CategoryAttribute
  async deleteCategoryAttributeLink(linkId: number) {
    const response = await api.delete(`/api/category-attributes/${linkId}`);
    return response.data;
  },

  // ✏️ Mettre à jour un attribut produit
  async updateProductAttribute(attributeId: number, updatedData: any) {
    const response = await api.put(`/api/product-attributes/${attributeId}`, updatedData);
    return response.data;
  },
};
