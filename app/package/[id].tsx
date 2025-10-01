// app/packages/[id].tsx
import { useEffect, useState } from "react";
import {
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchPackageById, selectPackage } from "@/store/packageSlice";
import { SemiBoldText, RegularText, useThemeColor, View, Text } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import BackButton from "@/components/ui/BackButton";
import { wishlistService } from "@/services/wishlistService";
import { addToCart, fetchCart } from "@/store/cartSlice";
import { getActiveCurrency, formatPrice } from "@/store/currencySlice";
import Toast from "react-native-toast-message";
import { getUser } from '@/store/authSlice';
import { useTranslation } from "react-i18next";

export default function PackageDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const pkg = useSelector(selectPackage);
  const loading = useSelector((state: RootState) => state.packages.loading);
  const [cartLoading, setCartLoading] = useState(false);
  const activeCurrency = useSelector(
      (state: RootState) => state.currency.activeCurrency
    );
  const user = useSelector((state: RootState) => state.auth.user);
  const currencyCode = activeCurrency?.code ?? "XOF";

  const primaryColor = useThemeColor({}, "primary");
  const bgColor = useThemeColor({}, 'background'); 
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    if (id) dispatch(fetchPackageById(id));
  }, [id]);

  // Charger la devise active au besoin
  useEffect(() => {
    if (!activeCurrency?.code) {
      dispatch(getActiveCurrency());
    }
  }, [activeCurrency, dispatch]);

  // Charger l'utilisateur si pas encore fait
    useEffect(() => {
      if (!user) dispatch(getUser());
    }, [user]);

  // --- Ajouter à la wishlist ---
  const handleAddToWishlist = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!id) return;

    try {
      setWishlistLoading(true);
      await wishlistService.addPackageToWishlist({
        package_id: id,
        selected_color: null,
        selected_size: null,
        selected_weight: 0,
        selected_smell: null
      });

      setFeedbackMessage(t("packages_id.wishlist_package_add"));
      setFeedbackType("success");
    } catch (error: any) {
      console.error("Erreur wishlist:", error);
      setFeedbackMessage(error?.response?.data?.detail || t("packages_id.wishlist_package_add_eror"));
      setFeedbackType("error");
    } finally {
      setWishlistLoading(false);
    }
  };

  // --- Ajouter au panier ---
  const handleAddToCart = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!id) return;

    try {
      setCartLoading(true);
      await dispatch(addToCart({ package_id: id, quantity: 1 })).unwrap();
      await dispatch(fetchCart());

      setFeedbackMessage(t("packages_id.cart_package_add"));
      setFeedbackType("success");
    } catch (error: any) {
      console.error("Erreur ajout panier:", error);
      setFeedbackMessage(error?.message || t("packages_id.cart_package_add_error"));
      setFeedbackType("error");
    } finally {
      setCartLoading(false);
    }
  };

  if (loading || !pkg) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Bouton retour */}
      <BackButton />

      {/* Image principale */}
      <Image
        source={{ uri: pkg.image_url }}
        style={styles.mainImage}
        resizeMode="cover"
      />

      <View style={styles.content}>
        {/* Nom et prix */}
        <SemiBoldText style={[styles.packageName, {color: textColor}]}>
          {pkg.name}
        </SemiBoldText>
        <SemiBoldText style={[styles.packagePrice, {color: textColor}]}>
          {formatPrice(pkg.price ?? 0, currencyCode)}
        </SemiBoldText>

        {/* Description */}
        {pkg.description ? (
          <RegularText style={[styles.description, {color: textColor}]}>
            {pkg.description}
          </RegularText>
        ) : null}

        {/* Liste des produits */}
        <View style={[styles.itemsContainer, {backgroundColor: bgColor}]}>
          <SemiBoldText style={[styles.itemsTitle, {color: textColor}]}>
            {t("packages_id.products_involve")}
          </SemiBoldText>
          {pkg.package_items?.map((item, index) => (
            <View key={index} style={[styles.itemRow, {borderBottomColor: borderColor}]}>
              <RegularText style={[styles.itemName, {color: textColor}]}>
                {item.product?.name}
              </RegularText>
              <RegularText style={[styles.itemQuantity, {color: textColor}]}>
                x{item.quantity}
              </RegularText>
            </View>
          ))}
        </View>

        {/* Message feedback */}
        {feedbackMessage && (
          <Text
            style={{
              color: feedbackType === "success" ? "green" : "red",
              textAlign: "center",
              marginBottom: 12,
              fontSize: 14,
              borderColor: feedbackType === 'success' ? 'green' : 'red',
              borderWidth: 1,
              padding: 8,
              borderRadius: 6,
            }}
          >
            {feedbackMessage}
          </Text>
        )}

        {/* Boutons actions */}
        <View style={styles.buttonRow}>
          {/* Liste de souhaits */}
          <Pressable
            onPress={handleAddToWishlist}
            disabled={wishlistLoading}
            android_ripple={{ color: "#ddd" }}
            style={({ pressed }) => [
              styles.button,
              styles.wishlistButton,
              pressed && { opacity: 0.8 },
              wishlistLoading && { opacity: 0.5 },
            ]}
          >
            <View style={[styles.buttonContent, {backgroundColor: "transparent"}]}>
              {wishlistLoading ? (
                <ActivityIndicator size="small" color={primaryColor} />
              ) : (
                <Ionicons name="heart-outline" size={18} color={primaryColor} />
              )}
              <Text style={[styles.buttonText, { color: primaryColor }]}>
                {wishlistLoading ? "Ajout..." : "Liste de souhaits"}
              </Text>
            </View>
          </Pressable>

          {/* Ajouter au panier */}
          <Pressable
            onPress={handleAddToCart}
            disabled={cartLoading}
            android_ripple={{ color: "#ddd" }}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: primaryColor },
              pressed && { opacity: 0.8 },
              cartLoading && { opacity: 0.5 },
            ]}
          >
            <View style={[styles.buttonContent, {backgroundColor: "transparent"}]}>
              {cartLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="cart-outline" size={18} color="#fff" />
              )}
              <Text style={[styles.buttonText, { color: "#fff" }]}>
                {cartLoading ? "Ajout..." : "Ajouter au panier"}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
      <Toast />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  mainImage: {
    width: "100%",
    height: 250,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  content: {
    padding: 16,
  },
  packageName: {
    fontSize: 20,
    marginBottom: 4,
  },
  packagePrice: {
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    marginBottom: 16,
  },
  itemsContainer: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  itemsTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  itemName: {
  },
  itemQuantity: {
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  wishlistButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
