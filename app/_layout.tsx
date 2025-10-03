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

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'SplashScreen',
};

// Ce composant gère uniquement la navigation
function RootNavigation() {
  const { theme } = useTheme();

  return (
    <NavigationThemeProvider value={getNavigationTheme(theme)}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen name="categories" />
        <Stack.Screen name="products" />
        <Stack.Screen name="product/[id]" />
        <Stack.Screen name="packages" />
        <Stack.Screen name="package/[id]" />
        <Stack.Screen name="profile/account" />
        <Stack.Screen name="profile/address" />
        <Stack.Screen name="profile/about" />
        <Stack.Screen name="profile/terms" />
        <Stack.Screen name="profile/language" />
        <Stack.Screen name="profile/network" />
        <Stack.Screen name="profile/creditsodis" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgetPassword" />
        <Stack.Screen name="wishlist" />
        <Stack.Screen name="invoice/[id]" />
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
