import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { getUser } from "@/store/authSlice";

SplashScreen.preventAutoHideAsync();

export default function SplashScreenCustom() {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Animation du logo
    Animated.timing(opacity, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    const initApp = async () => {
      try {
        // On essaye de récupérer l'utilisateur (optionnel)
        await dispatch(getUser());
      } catch (e) {
        console.log("Erreur getUser:", e);
      } finally {
        // Quoi qu'il arrive, on redirige vers (tabs)
        await SplashScreen.hideAsync();
        router.replace("/(tabs)");
      }
    };

    initApp();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require("../assets/images/demarrage.png")}
        style={[styles.logo, { opacity }]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  logo: { width: 500, height: 500 },
});
