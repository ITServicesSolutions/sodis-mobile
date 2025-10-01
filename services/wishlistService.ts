// services/wishlistService.ts
import api from "./api";

const handleError = (error: any) => {
  throw error?.response?.data || error?.message || "Erreur inconnue";
};

export const wishlistService = {
  // 1. Récupérer la wishlist
  fetchWishlist: async () => {
    const res = await api.get("/api/wishlist");
    return res.data || [];
  },

  // 2. Ajouter un produit à la wishlist
  addToWishlist: async (data: any) => {
    try {
      const res = await api.post("/api/wishlist/add", data);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Ajouter un package à la wishlist
  addPackageToWishlist: async (data: any) => {
    try {
      const res = await api.post("/api/wishlist/add", data);
      return res.data;
    } catch (error) {
      handleError(error);
    }
  },

  // 3. Supprimer un produit de la wishlist
  removeFromWishlist: async (wishlist_item_id: string | number) => {
    try {
      const res = await api.delete(`/api/wishlist/remove/${wishlist_item_id}`);
      return wishlist_item_id;
    } catch (error) {
      handleError(error);
    }
  },

  // 4. Vider complètement la wishlist
  clearWishlist: async () => {
    const res = await api.delete("/api/wishlist/clear");
    return res.data;
  },
};
