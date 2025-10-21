import { BoldText, useThemeColor, View } from '@/components/Themed';
import OrderCard from '@/components/OrderCard';
import { Order, fetchOrders, selectOrders } from '@/store/orderSlice';
import { useWindowDimensions, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SceneMap, TabView, TabBar } from 'react-native-tab-view';
import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { useRouter } from 'expo-router';
import { useTranslation } from "react-i18next";

export default function OrdersScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading: userLoading } = useSelector((state: RootState) => state.auth);
  const { orders, loading: ordersLoading } = useSelector(selectOrders);

  const layout = useWindowDimensions();
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');

  const [index, setIndex] = useState(0);
  const routes = useMemo(() => [
    { key: 'pending', title: t("commandes.en_attente") },
    { key: 'delivered', title: t("commandes.delivered") },
    { key: 'cancelled', title: t("commandes.cancelled") },
  ], [t]);

  // Charger les commandes si connecté
  useEffect(() => {
    if (user?.id) {
      dispatch(fetchOrders({ page: 1, perPage: 20 }));
    }
  }, [dispatch, user?.id]);

  // Redirection si non connecté
  useEffect(() => {
    if (!user && !userLoading) {
      router.replace('/login');
    }
  }, [user, userLoading, router]);

  const pendingOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
  const deliveredOrders = useMemo(() => orders.filter(o => o.status === 'delivered'), [orders]);
  const cancelledOrders = useMemo(() => orders.filter(o => o.status === 'cancelled'), [orders]);

  // Attente pendant le chargement de l’état utilisateur
  if (userLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  // Si pas connecté → on ne rend rien, le useEffect fait la redirection
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  const renderTab = (orderList: Order[]) => (
    <ScrollView contentContainerStyle={styles.scroll}>
      {ordersLoading ? (
        <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 50 }} />
      ) : orderList.length > 0 ? (
        orderList.map(order => <OrderCard key={order.id} order={order} />)
      ) : (
        <View style={{ padding: 20 }}>
          <BoldText style={{ textAlign: 'center', color: textColor }}>
            {t("commandes.no_orders")}
          </BoldText>
        </View>
      )}
    </ScrollView>
  );

  const renderScene = SceneMap({
    pending: () => renderTab(pendingOrders),
    delivered: () => renderTab(deliveredOrders),
    cancelled: () => renderTab(cancelledOrders),
  });

  return (
    <View style={{ flex: 1 }}>
      <BoldText style={[styles.title, { color: textColor }]}>
        {t("commandes.orders")}
      </BoldText>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: primaryColor }}
            style={{ backgroundColor: 'transparent' }}
            activeColor={primaryColor}
            inactiveColor={textColor}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
});
