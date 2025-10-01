import api from "./api";

export const walletService = {
  async fetchWalletHistory() {
    const response = await api.get("/api/wallet/history");
    return response.data;
  },
};
