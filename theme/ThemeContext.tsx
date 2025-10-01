// theme/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme } from "react-native";
import Colors from "@/constants/Colors";
import { DarkTheme, DefaultTheme, Theme } from "@react-navigation/native";

type ThemeType = "light" | "dark";

interface ThemeContextProps {
  theme: ThemeType;
  colors: typeof Colors.light;
  setTheme: (t: ThemeType) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const STORAGE_KEY = "APP_THEME";

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const system = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>(() =>
    system === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark") {
          setThemeState(saved);
        } else {
          // si pas de stockage, respecter le système au démarrage
          setThemeState(system === "dark" ? "dark" : "light");
        }
      } catch (e) {
        console.log("Erreur", e)
      }
    })();
  }, [system]);

  const setTheme = async (t: ThemeType) => {
    try {
      setThemeState(t);
      await AsyncStorage.setItem(STORAGE_KEY, t);
    } catch (e) {
      console.log("Erreur", e)
    }
  };

  const toggleTheme = async () => {
    await setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, colors: Colors[theme], setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
};

export const getNavigationTheme = (theme: ThemeType): Theme =>
  theme === "dark" ? DarkTheme : DefaultTheme;
