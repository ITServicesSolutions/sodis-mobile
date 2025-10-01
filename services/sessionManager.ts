// services/sessionManager.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

let isLoggingOut = false;

/**
 * Déconnexion automatique
 * Ne dépend pas du store pour éviter les cycles
 */
export const handleAutoLogout = async () => {
  if (isLoggingOut) return;
  isLoggingOut = true;

  await AsyncStorage.multiRemove(["access_token", "user"]);
  router.replace("/login");
  console.warn("Token expiré ou révoqué. Déconnexion automatique.");

  isLoggingOut = false;
};
