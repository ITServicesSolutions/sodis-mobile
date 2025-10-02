import FontAwesome from '@expo/vector-icons/FontAwesome';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import store from '@/store';
import { initI18n } from '../i18n';
import { KkiapayProvider } from '@kkiapay-org/react-native-sdk';
import { ThemeProvider, useTheme, getNavigationTheme } from '@/theme/ThemeContext';
import LogRocket from '@logrocket/react-native';
import { setJSExceptionHandler } from 'react-native-exception-handler';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'SplashScreen',
};

// Ce composant gère uniquement la navigation
function RootNavigation() {
  const { theme } = useTheme();

  return (
    <NavigationThemeProvider value={getNavigationTheme(theme)}>
      <Stack>
        <Stack.Screen name="SplashScreen" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="categories" options={{ title: 'Catégories', headerShown: false }} />
        <Stack.Screen name="products" options={{ title: 'Produits', headerShown: false }} />
        <Stack.Screen name="product/[id]" options={{ title: 'Détails du produit', headerShown: false }} />
        <Stack.Screen name="packages" options={{ title: 'Tous les Packages', headerShown: false }} />
        <Stack.Screen name="package/[id]" options={{ title: 'Détails du Package', headerShown: false }} />
        <Stack.Screen name="profile/account" options={{ title: 'Mon Compte', headerShown: false }} />
        <Stack.Screen name="profile/address" options={{ title: 'Mon Adresse', headerShown: false }} />
        <Stack.Screen name="profile/about" options={{ title: 'À propos de nous', headerShown: false }} />
        <Stack.Screen name="profile/terms" options={{ title: "Conditions d'utilisation", headerShown: false }} />
        <Stack.Screen name="profile/language" options={{ title: 'Langue', headerShown: false }} />
        <Stack.Screen name="profile/network" options={{ title: 'Mon Réseaux', headerShown: false }} />
        <Stack.Screen name="profile/creditsodis" options={{ title: 'Crédits Sodis', headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Connexion', headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Inscription', headerShown: false }} />
        <Stack.Screen name="forgetPassword" options={{ title: 'Mot de passe oublié', headerShown: false }} />
        <Stack.Screen name="wishlist" options={{ title: 'Liste de souhaits', headerShown: false }} />
        <Stack.Screen name="invoice/[id]" options={{ title: 'Facture', headerShown: false }} />
      </Stack>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PoppinsLight: require('../assets/fonts/Poppins-Light.ttf'),
    PoppinsRegular: require('../assets/fonts/Poppins-Regular.ttf'),
    PoppinsSemiBold: require('../assets/fonts/Poppins-SemiBold.ttf'),
    PoppinsBold: require('../assets/fonts/Poppins-Bold.ttf'),
    ...((FontAwesome.font as object) || {}),
  });

  const [i18nReady, setI18nReady] = useState(false);

  // Splash
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
  }, []);

  useEffect(() => {
    if (fontError) throw fontError;
  }, [fontError]);

  useEffect(() => {
    const prepareI18n = async () => {
      await initI18n();
      setI18nReady(true);
    };
    prepareI18n();
  }, []);

  useEffect(() => {
    if (fontsLoaded && i18nReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, i18nReady]);

  useEffect(() => {
    try {
      LogRocket.init('xeuzjm/sodis')
      console.log("LogRocket initialisé ✅");
    } catch (e) {
      console.log("Erreur LogRocket:", e);
    }
  }, []);

  useEffect(() => {
    setJSExceptionHandler((error, isFatal) => {
      LogRocket.captureException(error);
      console.log("Erreur capturée:", error);
    }, true);
  }, []);

  if (!fontsLoaded || !i18nReady) return null;

  return (
    <KkiapayProvider>
      <Provider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <ThemeProvider>
            <RootNavigation />
          </ThemeProvider>
        </GestureHandlerRootView>
      </Provider>
    </KkiapayProvider>
  );
}
