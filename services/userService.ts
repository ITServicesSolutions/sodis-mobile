import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const userService = {
  login: async (body: any) => {
    try {
      const res = await api.post("api/login", body);
      const { access_token, user } = res.data;

      if (!access_token || !user) throw new Error("Invalid response from server");

      await AsyncStorage.setItem("access_token", access_token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      return res.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || error.message);
    }
  },


  getUser: async () => {
    const res = await api.get("api/users/me");
    await AsyncStorage.setItem("user", JSON.stringify(res.data));
    return res.data;
  },

  fetchUsers: async () => {
    const res = await api.get("api/users");
    return res.data;
  },

  fetchUserList: async (params: Record<string, any> = {}) => {
    const res = await api.get("api/list/users", { params });
    return res.data;
  },

  register: async (body: any) => {
    const res = await api.post("api/register_customer", body);
    if (res.data?.access_token) {
      await AsyncStorage.setItem("access_token", res.data.access_token);
    }
    return res.data;
  },

  registerMember: async (body: any) => {
    const res = await api.post("api/register", body);
    return res.data;
  },

  updateUser: async (data: any) => {
    const res = await api.put(`api/users/${data.user_id}`, data);
    return res.data;
  },

  changePassword: async (data: any) => {
    const res = await api.put(`api/users/${data.user_id}/change-password`, data);
    return res.data;
  },

  verifyEmail: async (token: string) => {
    const res = await api.get(`api/verify-email/${token}`);
    return res.data;
  },

  resendConfirmationEmail: async (email: string) => {
    const res = await api.post("api/resend-confirmation", { email });
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post("api/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (body: any) => {
    const res = await api.post("api/reset-password", body);
    return res.data;
  },

  logOut: async () => {
    await api.post("api/logout");
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("user");
  },

  activeOrDeactiveUser: async (id: number | string) => {
    const res = await api.put(`api/users/${id}/toggle-active`);
    return res.data;
  },

  deleteUser: async (id: number | string) => {
    const res = await api.delete(`api/users/${id}`);
    return res.data;
  },

  refreshWallet: async () => {
    const res = await api.get("api/users/me");
    await AsyncStorage.setItem("user", JSON.stringify(res.data));
    return res.data;
  },

  fetchUserCountries: async () => {
    const res = await api.get("api/user-countries");
    return res.data;
  },
};
