// services/authHelper.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import store from "@/store";
import { logout } from "@/store/authSlice";
import { router } from "expo-router";

export const handleAutoLogout = async () => {
  await AsyncStorage.multiRemove(["access_token", "user"]);
  store.dispatch(logout());
  router.replace("/login");
  console.warn("Token expiré ou révoqué. Déconnexion automatique.");
};
