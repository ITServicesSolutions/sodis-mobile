import React, { useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useFonts } from 'expo-font';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useRouter, Tabs } from 'expo-router';

import Colors from '../../constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { RootState } from '@/store';

function CartIconWithBadge({ color }: { color: string }) {
  const cartCount = useSelector((state: RootState) => state.cart.items.length);

  return (
    <View style={{ width: 28, height: 28 }}>
      <FontAwesome5 name="shopping-cart" size={24} color={color} />
      {cartCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {cartCount > 9 ? '9+' : cartCount}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    PoppinsLight: require('../../assets/fonts/Poppins-Light.ttf'),
    PoppinsRegular: require('../../assets/fonts/Poppins-Regular.ttf'),
    PoppinsSemiBold: require('../../assets/fonts/Poppins-SemiBold.ttf'),
    PoppinsBold: require('../../assets/fonts/Poppins-Bold.ttf'),
    ...((FontAwesome.font as object) || {}),
  });

  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // fonction helper pour bloquer l'accès si non connecté
  const requireAuth = (callback?: () => void) => {
    if (!user) {
      router.push('/login');
      return false;
    }
    if (callback) callback();
    return true;
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="home" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="panier"
        options={{
          title: 'Panier',
          headerShown: false,
          tabBarIcon: ({ color }) => <CartIconWithBadge color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (!requireAuth()) e.preventDefault();
          },
        }}
      />

      <Tabs.Screen
        name="commandes"
        options={{
          title: 'Commandes',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="clipboard-list" size={24} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!requireAuth()) e.preventDefault();
          },
        }}
      />

      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="user" size={24} color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!requireAuth()) e.preventDefault();
          },
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: 'tomato',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
