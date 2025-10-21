import React, { useEffect, useState, useRef } from "react";
import { 
  Alert, 
  StyleSheet, 
  Pressable, 
  FlatList, 
  TextInput, 
  ActivityIndicator 
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import store, { RootState, AppDispatch } from "@/store";
import { fetchCart, updateCart, removeFromCart, clearCart } from "@/store/cartSlice";
import CartItem from "@/components/CartItem";
import { View, useThemeColor, SemiBoldText, RegularText, BoldText } from "@/components/Themed";
import AppButton from "@/components/ui/AppButton";
import { getActiveCurrency, formatPrice } from "@/store/currencySlice";
import BackButton from "@/components/ui/BackButton";
import { applyPromo } from "@/store/promoSlice";
import { useTranslation } from "react-i18next";
import { fetchShippingInfo } from '@/store/shippingSlice';
import { useKkiapay } from '@kkiapay-org/react-native-sdk';
import { createOrder } from "@/store/orderSlice";
import { payWithCommission, payWithWallet } from "@/store/commissionSlice";
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';


export default function CartScreen() {
  const publicKey = process.env.EXPO_PUBLIC_KKIAPAY_PUBLIC_KEY;
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { items, detail, loading } = useSelector((state: RootState) => state.cart);
  const activeCurrency = useSelector((state: RootState) => state.currency.activeCurrency);
  const currencyCode = activeCurrency?.code ?? "XOF";

  // 🔐 Sécurisation wallet et commission
  const userWallet = useSelector((state: RootState) => state.auth.user?.wallet) || {};
  const totalCommission = userWallet.total_commission ?? 0;
  const solde = userWallet.balance ?? 0;

  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, 'border');
  const background_personalise = useThemeColor({}, 'background_personalise');

  const [errorMessage, setErrorMessage] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const { currentPromo, appliedDiscount, loading: promoLoading, error } = useSelector(
    (state: RootState) => state.promo
  );
  const { user, loading: userLoading } = useSelector((state: RootState) => state.auth);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'sodis'>('card');
  const { shippingList } = useSelector((state: RootState) => state.shipping);
  const defaultAddress = shippingList.find(addr => addr.is_default) || shippingList[0];
  const itemsRef = useRef(items);


  const { openKkiapayWidget, addSuccessListener, addFailedListener } =
    useKkiapay() as unknown as {
      openKkiapayWidget: (options: {
        amount: number;
        api_key: string;
        sandbox?: boolean;
        name?: string;
        email?: string;
        phone?: string;
      }) => void;
      addSuccessListener: (cb: (data: any) => void) => void;
      addFailedListener: (cb: (data: any) => void) => void;
    };

  // Vérifier l'utilisateur
  useEffect(() => {
    if (!user && !userLoading) {
      router.replace('/login'); 
    }
  }, [user, userLoading, router]);

  // Charger le panier
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  // Charger la devise
  useEffect(() => {
    if (!activeCurrency?.code) {
      dispatch(getActiveCurrency());
    }
  }, [activeCurrency, dispatch]);

  // Charger adresses
  useEffect(() => {
    dispatch(fetchShippingInfo());
  }, [dispatch]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // Kkiapay listeners (une seule fois)
  useEffect(() => {
    addSuccessListener(async (data) => {
      console.log("✅ Paiement réussi :", data);

      try {
        const orderItems = itemsRef.current.map(item => ({
          product_id: item.product_id,
          package_id: item.package_id,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          subtotal: Number(detail.total_amount),  
          selected_color: item.selected_color,
          selected_size: item.selected_size,
          selected_weight: item.selected_weight,
          selected_smell: item.selected_smell,
          custom_options: item.custom_options,
        }));

        // recalculer l'adresse par défaut
        const state = store.getState();
        const shippingList = state.shipping.shippingList;
        const defaultAddress = shippingList.find(addr => addr.is_default) || shippingList[0];

        if (!defaultAddress) {
          Alert.alert("Erreur", t('panier.no_address_found'));
          return;
        }

        const result = await dispatch(
          createOrder({
            items: orderItems,
            shipping_info_id: defaultAddress.id,
            promo_code: promoCode || undefined,
            total_price: detail!.total_price,
            status: "pending",
          })
        ).unwrap();

        
        await dispatch(clearCart());
        await dispatch(fetchCart());
        Alert.alert("Succès", t('panier.order_create_succes'));
        router.replace(`/invoice/${result.order_id}`);
      } catch (err: any) {
        console.error("Erreur création commande :", err);
        Alert.alert("Erreur", t('panier.impossible_creation_order'));
      }
    });

    addFailedListener((data) => {
      console.log("❌ Paiement échoué :", data);
      Alert.alert(t('panier.paiement_echoue'), t('panier.pay_not_validated'));
    });
  }, []);

  // Gestion des items panier
  const increaseQuantity = (itemId: string, currentQty: number) => {
    dispatch(updateCart({ id: itemId, quantity: currentQty + 1 }));
    dispatch(fetchCart());
  };

  const decreaseQuantity = (itemId: string, currentQty: number) => {
    if (currentQty > 1) {
      dispatch(updateCart({ id: itemId, quantity: currentQty - 1 }));
      dispatch(fetchCart());
    } else {
      dispatch(removeFromCart(itemId));
      dispatch(fetchCart());
    }
  };

  const removeItem = (itemId: string) => {
    Alert.alert(
      t('panier.delete_from_cart'),
      `Voulez-vous vraiment retirer l'article de votre Panier ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(removeFromCart(itemId));
              await dispatch(fetchCart());
            } catch (err: any) {
              Alert.alert("Erreur", err || "Impossible de supprimer l'article.");
            }
          },
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      "Supprimer du Panier",
      `Voulez-vous vraiment retirer les articles de votre Panier ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(clearCart());
              await dispatch(fetchCart());
            } catch (err: any) {
              Alert.alert("Erreur", err || "Impossible de supprimer l'article.");
            }
          },
        },
      ]
    );
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setErrorMessage(t("panier.enter_promocode"));
      return;
    }
    setErrorMessage("");
    try {
      await dispatch(applyPromo(promoCode)).unwrap();
      await dispatch(fetchCart());
      Alert.alert(t("panier.promocode_applied"));
    } catch (err: any) {
      Alert.alert(typeof err === "string" ? err : err?.detail || t("panier.promocode_notapplied"));
    }
  };

  const handleCardPayment = () => {
    openKkiapayWidget({
      amount: detail.total_amount,
      api_key: publicKey!,
      sandbox: __DEV__,
      name: user?.name,
      email: user?.email ?? "",
      phone: "97000000",
    });
  };

  const handleSodisPayment = async (orderId: string) => {
    if (!detail) return;
    const orderAmount = detail.total_amount;

    try {
      if (totalCommission >= orderAmount) {
        await dispatch(payWithCommission(orderId)).unwrap();
        Alert.alert("Succès", t('panier.order_commission_pay'));
        afterPayment(orderId);
      } else if (solde >= orderAmount) {
        await dispatch(payWithWallet(orderId)).unwrap();
        Alert.alert("Succès", t('panier.order_wallet_pay'));
        afterPayment(orderId);
      } else {
        Alert.alert(t('panier.solde_insuffi'), t('panier.not_enought_credit'));
      }
    } catch (err: any) {
      console.error("Erreur paiement Sodis :", err);
      Alert.alert("Erreur", err?.detail || "Impossible de payer avec Crédit Sodis.");
    }
  };

  const afterPayment = async (orderId: string) => {
    await dispatch(clearCart());
    await dispatch(fetchCart());
    router.replace(`/invoice/${orderId}`);
  };

  // Footer
  const renderFooter = () => (
    <>
      {/* Promo Code */}
      <View style={[styles.promoContainer]}>
        <View style={[styles.promoWrapper, {backgroundColor: background_personalise}]}>
          <TextInput
            value={promoCode}
            onChangeText={(text) => {
              setPromoCode(text);
              setErrorMessage("");
            }}
            placeholder={t("panier.promocode")}
            style={[styles.promoInput, {borderColor: borderColor, color: textColor}]}
            placeholderTextColor={textColor}
          />
          <Pressable
            style={[styles.promoButton, promoLoading && { opacity: 0.6 }]}
            onPress={handleApplyPromo}
            disabled={promoLoading}
          >
            <RegularText style={[styles.promoButtonText, {color: textColor}]}>
              {promoLoading ? "..." : t("panier.apply")}
            </RegularText>
          </Pressable>
        </View>

        {error && <RegularText style={{ color: "red" }}>{error}</RegularText>}
        {errorMessage ? (
          <RegularText style={{ color: "red" }}>{errorMessage}</RegularText>
        ) : null}

        {currentPromo && (
          <RegularText style={{ color: "green", marginTop: 5 }}>
            {`Promo "${currentPromo}" ${t("panier.applied")} : -${appliedDiscount}%`}
          </RegularText>
        )}
      </View>

      <View style={{ marginVertical: 16, backgroundColor: "transparent" }}>
        <BoldText style={{ marginBottom: 8, color: textColor }}>
          {t('panier.select_payment')}
        </BoldText>
        
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Pressable
            style={{
              flex: 1,
              padding: 12,
              borderWidth: 1,
              borderColor: paymentMethod === 'card' ? primaryColor : '#ccc',
              borderRadius: 8,
              backgroundColor: paymentMethod === 'card' ? primaryColor + '20' : '#fff',
            }}
            onPress={() => setPaymentMethod('card')}
          >
            <RegularText style={{ color: paymentMethod === 'card' ? primaryColor : '#000', textAlign:"center" }}>
              {t('panier.card_mobile_money')}
            </RegularText>
          </Pressable>

          <Pressable
            style={{
              flex: 1,
              padding: 12,
              borderWidth: 1,
              borderColor: paymentMethod === 'sodis' ? primaryColor : '#ccc',
              borderRadius: 8,
              backgroundColor: paymentMethod === 'sodis' ? primaryColor + '20' : '#fff',
            }}
            onPress={() => setPaymentMethod('sodis')}
          >
            <RegularText style={{ color: paymentMethod === 'sodis' ? primaryColor : '#000', textAlign:"center" }}>
              {t('panier.sodis_credit')}
            </RegularText>
          </Pressable>
        </View>
      </View>

      {/* Totals */}
      <View style={[styles.totalContainer,  {backgroundColor: "transparent"}]}>
        <View style={styles.row}>
          <RegularText style={[styles.totalLabel, {color: textColor}]}>
            {t("panier.subtotal")}
          </RegularText>
          <RegularText style={[styles.totalAmount, {color: textColor}]}>
            {formatPrice(detail?.total_price ?? 0, currencyCode)}
          </RegularText>
        </View>

        <View style={styles.row}>
          <RegularText style={[styles.totalLabel, {color: textColor}]}>
            {t("panier.reduction")}
          </RegularText>
          <RegularText style={[styles.totalAmount, { color: "green" }]}>
            -{formatPrice(detail?.total_discount ?? 0, currencyCode)}
          </RegularText>
        </View>

        <View style={styles.row}>
          <RegularText style={[styles.totalLabel, {color: textColor}]}>
            {t("panier.taxes")}
          </RegularText>
          <RegularText style={[styles.totalAmount, {color: textColor}]}>
            {formatPrice(detail?.total_tax ?? 0, currencyCode)}
          </RegularText>
        </View>

        <View style={styles.row}>
          <BoldText style={[styles.totalLabel, {color: textColor}]}>
            {t("panier.total")}
          </BoldText>
          <BoldText style={[styles.totalAmount, {color: textColor}]}>
            {formatPrice(detail?.total_amount ?? 0, currencyCode)}
          </BoldText>
        </View>
      </View>

      {!defaultAddress && (
        <RegularText style={{ color: 'red', textAlign: 'center', marginTop: 8 }}>
          {t("panier.enter_delivery_address")}
        </RegularText>
      )}

      {paymentMethod === "sodis" && (
        <View style={{ marginVertical: 12, paddingHorizontal: 16 }}>
          <SemiBoldText style={[styles.modalTitle, {color: textColor}]}>
            {t("accueil.header.creditsodis")}
          </SemiBoldText>

          <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
            <FontAwesome5
              name="project-diagram"
              size={20}
              color="green"
              style={{ marginRight: 8 }}
            />
            <RegularText style= {{color: textColor}}>
              {t("accueil.header.totalcommission")} : {formatPrice(totalCommission, currencyCode)}
            </RegularText>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", marginVertical: 6 }}>
            <FontAwesome5
              name="money-bill"
              size={20}
              color="green"
              style={{ marginRight: 8 }}
            />
            <RegularText style={{color: textColor}}>
              {t("accueil.header.amount")} : {formatPrice(solde, currencyCode)}
            </RegularText>
          </View>

          {totalCommission < detail.total_amount &&
            solde < detail.total_amount && (
              <RegularText style={{ color: "red", marginTop: 8, textAlign: "center" }}>
                {t("panier.insufficient_sodis")}
              </RegularText>
          )}
        </View>
      )}

      <AppButton
        type="primary"
        title={defaultAddress ? t("panier.buy") : t("panier.add_address")}
        onPress={async () => {
          if (!defaultAddress) {
            router.push("/profile/address");
            return;
          }

          if (paymentMethod === "card") {
            handleCardPayment();
          } else {

            // recalculer l'adresse par défaut
            const state = store.getState();
            const shippingList = state.shipping.shippingList;
            const defaultAddress = shippingList.find(addr => addr.is_default) || shippingList[0];

            if (!defaultAddress) {
              router.push("/profile/address");
              return;
            }
            const result = await dispatch(
              createOrder({
                items: itemsRef.current.map(item => ({
                  product_id: item.product_id,
                  package_id: item.package_id,
                  quantity: Number(item.quantity),
                  unit_price: Number(item.unit_price),
                  subtotal: Number(detail.total_amount),  
                  selected_color: item.selected_color,
                  selected_size: item.selected_size,
                  selected_weight: item.selected_weight,
                  selected_smell: item.selected_smell,
                  custom_options: item.custom_options,
                })),
                shipping_info_id: defaultAddress.id,
                promo_code: promoCode || undefined,
                total_price: detail!.total_price,
                status: "pending",
              })
            ).unwrap();

            await handleSodisPayment(result.order_id);
          }
        }}
        disabled={
          paymentMethod === "sodis" &&
          totalCommission < (detail?.total_amount ?? 0) &&
          solde < (detail?.total_amount ?? 0)
        }
        style={styles.buyButton}
      />
    </>
  );

  // Protection : si pas encore déterminé → afficher loader
  if (!user && !userLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  // Content
  let content: React.ReactNode = null;

  if (userLoading) {
    content = (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  } else if (loading) {
    content = (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  } else if (!items.length) {
    content = (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <RegularText style= {{color: textColor}}>
          {t("panier.panier_empty")}
        </RegularText>
      </View>
    );
  } else {
    content = (
      <View style={[styles.container,  {backgroundColor: "transparent"}]}>
        <View>
          <BackButton /> 
        </View>
        
        <View style={[styles.header, {backgroundColor: "transparent"}]}>
          <SemiBoldText style={[styles.title, {color: textColor}]}>
            {t("panier.cart")}
          </SemiBoldText>
          <Pressable onPress={handleClearCart}>
            <Ionicons name="trash-outline" size={24} color={textColor} />
          </Pressable>
        </View>

        <FlatList
          data={items}
          renderItem={({ item }) => (
            <CartItem
              product={{
                id: item.id,
                name: item.product_name,
                image: { uri: item.product_image },
                price: item.unit_price,
                quantity: item.quantity,
                isPackage: !!item.package_id,
              }}
              onIncrease={() => increaseQuantity(item.id, item.quantity)}
              onDecrease={() => decreaseQuantity(item.id, item.quantity)}
              onDelete={() => removeItem(item.id)}
            />
          )}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingBottom: 12,
    paddingTop: 20,
    marginTop: 40
  },
  title: {
    fontSize: 18,
    textAlign: 'center',
  },
  promoContainer: {
    paddingHorizontal: 16,
    marginTop: 56,
    marginBottom: 16,
  },
  promoWrapper: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  promoInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  promoButton: {
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalContainer: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 16,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  buyButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 32,
    borderRadius: 10,
  },
  modalTitle: { 
    fontSize: 18, 
    paddingBottom: 8, 
  },
});