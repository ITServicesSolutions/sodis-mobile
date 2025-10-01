// services/cartService.ts
import api from "./api";

export const cartService = {
  // 1. Récupérer le panier
  fetchCart: async () => {
    const res = await api.get("/api/cart/items");
    return {
      items: res.data.items || [],
      detail: res.data.detail || {
        total_price: 0,
        total_discount: 0,
        total_tax: 0,
        total_amount: 0,
        promo_code: null,
        promo_discount: 0,
        global_discount: 0,
        user_discount_type: "global",
      },
    };
  },
  

  // 2. Ajouter un produit ou package au panier
  addToCart: async (data: { product_id?: string; package_id?: string; quantity?: number }) => {
    const res = await api.post("/api/add/product/to/cart", data);
    return {
      items: res.data.items || [],
      detail: res.data.detail || {
        total_price: 0,
        total_discount: 0,
        total_tax: 0,
        total_amount: 0,
        promo_code: null,
        promo_discount: 0,
        global_discount: 0,
        user_discount_type: "global",
      },
    };
  },

  // 3. Mettre à jour un item du panier
  updateCart: async (data: { id: string; quantity?: number; selected_color?: string; selected_size?: string; selected_weight?: string; selected_smell?: string; custom_options?: any }) => {
    const res = await api.put(`/api/update/cart/item/${data.id}`, data);
    // Ici ton backend retourne seulement un message, donc on renvoie juste un fetchCart pour obtenir le panier à jour
    return await cartService.fetchCart();
  },

  // 4. Supprimer un item du panier
  removeFromCart: async (cart_item_id: string | number) => {
    await api.delete(`/api/cart/item/${cart_item_id}`);
    // Retourne le panier mis à jour
    return await cartService.fetchCart();
  },

  // 5. Vider complètement le panier
  clearCart: async () => {
    await api.delete("/api/cart");
    return {
      items: [],
      detail: {
        total_price: 0,
        total_discount: 0,
        total_tax: 0,
        total_amount: 0,
        promo_code: null,
        promo_discount: 0,
        global_discount: 0,
        user_discount_type: "global",
      },
    };
  },
};
