import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { getUser } from "@/store/authSlice";
import { useRouter } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function SplashScreenCustom() {
  const opacity = useRef(new Animated.Value(0)).current;
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
 
  useEffect(() => {
    const animate = () => {
      return new Promise((resolve) => {
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }).start(() => resolve(true));
      });
    };

    const initApp = async () => {
      try {
        // Animation et tentative de récupération de l'utilisateur en parallèle
        await Promise.all([
          animate(),
          dispatch(getUser()).catch((e) => {
            console.log("Erreur getUser (non bloquante):", e);
          })
        ]);

        // Petit délai pour assurer une transition fluide
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Cacher le SplashScreen et rediriger vers tabs dans tous les cas
        await SplashScreen.hideAsync();
        console.log("Redirection vers /tabs");
        router.replace('/tabs');
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        // Même en cas d'erreur, on redirige vers tabs
        router.replace('/tabs');
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
  logo: { 
    width: 500, 
    height: 500,
    maxWidth: '90%',
    maxHeight: '90%',
  },
});