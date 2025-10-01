import { StyleSheet, Image, Pressable, ActivityIndicator, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { useSelector, useDispatch } from 'react-redux';
import { useThemeColor, View, Text } from '@/components/Themed';
import { RootState, AppDispatch } from '@/store';
import { getUser } from '@/store/authSlice';
import { useRouter } from 'expo-router';
import { getActiveCurrency, formatPrice } from '@/store/currencySlice';
import Toast from 'react-native-toast-message';
import { useTranslation } from "react-i18next";
import ThemeToggle from "@/components/ThemeToggle";

export default function AccueilHeader() {
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const textPrimary = useThemeColor({}, 'textPrimary');
  const indicatorColor = useThemeColor({}, 'activityIndicatorColor');
  const backgroundPersonalise = useThemeColor({}, 'background_personalise');

  const { user, loading } = useSelector((state: RootState) => state.auth);
  const wishlistCount = useSelector((state: RootState) => state.wishlist.items.length);
  const activeCurrency = useSelector((state: RootState) => state.currency.activeCurrency);

  const wallet = user?.wallet ?? { total_commission: 0, balance: 0 };
  const currencyCode = activeCurrency?.code ?? 'XOF';

  // Charger l'utilisateur si pas encore fait
  useEffect(() => {
    if (!user) dispatch(getUser());
  }, [user]); 

  useEffect(() => {
    if (!activeCurrency?.code) {
      dispatch(getActiveCurrency());
    }
  }, [activeCurrency, dispatch]);

  // Fallback si en loading
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color={indicatorColor} />
        <Text style={[styles.textloadi, { color: textColor }]}>{t("accueil.header.loading")}</Text>
      </View>
    );
  }


  // Fallback si user encore null
  if (!user) {
    return (
      <View style={styles.container}>
        {/* Left side : Icône utilisateur pour login */}
        <Pressable onPress={() => router.push('/login')} style={styles.left}>
          <View style={{ position: 'relative' }}>
            <FontAwesome name="user-circle-o" size={40} color={textColor} />
            {/* Badge rouge */}
            <View style={styles.notConnectedBadge}>
              <Text style={[styles.notConnectedText, {color:textColor}]}>!</Text>
            </View>
          </View>
          <View>
            <Text style={[styles.welcome, {color: textColor}]}>{t("accueil.header.welcome")},</Text>
            <Text style={[styles.username, { color: textPrimary }]}>{t("accueil.header.connect")}</Text>
          </View>
        </Pressable>

        {/* Right side : Wishlist désactivée */}
        <View style={styles.right}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <ThemeToggle />
          </View>
          <Pressable onPress={() => {
              if (!user) {
                Toast.show({
                  type: 'info',
                  text1: t("accueil.header.connexion_succes"),
                  text2: t("accueil.header.connection_see"),
                  position: 'bottom',
                });
                router.push('/login');
              } else {
                router.push('/wishlist');
              }
            }}
            style={styles.iconButton}
          >
            <FontAwesome name="heart-o" size={24} color={textColor} />
            {user && wishlistCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{wishlistCount}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  // Affichage normal
  return (
    <>
      <View style={styles.container}>
        {/* Left side */}
        <View style={styles.left}>
          <Image
            source={require('../assets/user_icon.png')}
            style={styles.avatar}
          />
          <View>
            <Text style={[styles.welcome, {color: textColor}]}>{t("accueil.header.welcome")},</Text>
            <Text style={[styles.username, {color: textColor}]}>{user.name}</Text>
          </View>
        </View>

        {/* Right side */}
        <View style={styles.right}>
          <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: backgroundPersonalise, borderRadius: 8 }}>
            <ThemeToggle />
          </View>
          <Pressable onPress={() => router.push('/wishlist')} style={[styles.iconButton, {backgroundColor: backgroundPersonalise}]}>
            <FontAwesome name="heart-o" size={24} color={textColor} />
            {wishlistCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{wishlistCount}</Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={() => setModalVisible(true)} style={[styles.iconButton, {backgroundColor: backgroundPersonalise}]}>
            <FontAwesome5 name="wallet" size={24} color={textColor} />
          </Pressable>
        </View>
      </View>

      {/* Modal Wallet */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <FontAwesome5 name="wallet" size={20} color={textColor} style={{ marginRight: 8 }} />
              <Text style={[styles.modalTitle, {color:textColor}]}>{t("accueil.header.creditsodis")}</Text>
            </View>
              <>
                <View style={styles.balanceRow}>
                  <View style={styles.balanceLeft}>
                    <FontAwesome5 name="project-diagram" size={20} color="green" />
                    <Text style={[styles.balanceType, {color:textColor}]}>{t("accueil.header.totalcommission")}</Text>
                  </View>
                  <Text style={[styles.balanceAmount, {color:textColor}]}>
                    {formatPrice(wallet.total_commission, currencyCode)}
                  </Text>
                  
                </View>
                <View style={styles.balanceRow}>
                  <View style={styles.balanceLeft}>
                    <FontAwesome5 name="money-bill" size={20} color="black" />
                    <Text style={[styles.balanceType, {color:textColor}]}>{t("accueil.header.amount")}</Text>
                  </View>
                  <Text style={[styles.balanceAmount, {color:textColor}]}>
                    {formatPrice(wallet.balance, currencyCode)}
                  </Text>
                </View>
              </>
            <Pressable style={[styles.closeButton, {borderColor: borderColor}]} onPress={() => setModalVisible(false)}>
              <Text style={[styles.closeButtonText, {color:textColor}]}>{t("accueil.header.close")}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  textloadi: { marginLeft: 8 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  welcome: { fontSize: 14 },
  username: { fontSize: 16, fontWeight: 'bold' },
  right: { flexDirection: "row", gap: 12 }, 
  iconButton: { 
    width: 40,  
    height: 40, 
    alignItems: "center", 
    justifyContent: "center",
    borderRadius: 8
  },
  badge: { position: 'absolute', top: -5, right: -10, backgroundColor: 'red', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, minWidth: 16, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 20 },
  modalContent: { borderRadius: 12, padding: 20, elevation: 5 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, paddingBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '600'},
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  balanceLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  balanceType: { fontSize: 16 },
  balanceAmount: { fontSize: 16, fontWeight: '500' },
  closeButton: { marginTop: 20, backgroundColor: '#007bff', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  closeButtonText: { fontWeight: '600' },
  notConnectedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  notConnectedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
