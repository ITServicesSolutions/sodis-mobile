import React, { useEffect } from "react";
import {
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";

import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
} from "@/store/wishlistSlice";
import { addToCart, fetchCart } from "@/store/cartSlice";

import WishlistItem from "@/components/WishlistItem";
import { useThemeColor, SemiBoldText, RegularText, View } from "@/components/Themed";
import AppButton from "@/components/ui/AppButton";
import { useTranslation } from "react-i18next";

export default function WishlistScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");

  const { items, loading, error } = useSelector(
    (state: RootState) => state.wishlist
  );

  // Charger la liste au montage
  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  /** Vider la wishlist */
  const handleClearWishlist = () => {
    if (items.length === 0) return;
    Alert.alert(
      "Vider la liste",
      "Voulez-vous vraiment supprimer tous les articles ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Oui, vider",
          style: "destructive",
          onPress: () => dispatch(clearWishlist()),
        },
      ]
    );
  };

  /** Ajouter un article au panier */
  const handleAddToCart = (item: any) => {
    dispatch(
      addToCart({
        product_id: item.product_id || item.package_id,
        quantity: 1,
      })
    );
    dispatch(fetchWishlist())
    dispatch(fetchCart())
    Alert.alert("Succès", `${item.name} a été ajouté au panier !`);
  };

  /** Ajouter toute la wishlist au panier */
  const handleAddAllToCart = () => {
    if (items.length === 0) return;
    items.forEach((item) => {
      dispatch(
        addToCart({
          product_id: item.product_id || item.package_id,
          quantity: 1,
        })
      );
    });
    dispatch(fetchWishlist())
    dispatch(fetchCart())
    Alert.alert("Succès", "Tous les articles ont été ajoutés au panier !");
  };

  // Gestion de la suppression
  const handleDelete = async (item: any) => {
    Alert.alert(
      "Supprimer de la wishlist",
      `Voulez-vous vraiment retirer "${item.product_name}" de votre liste de souhaits ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await dispatch(removeFromWishlist(item.id)).unwrap();
              await dispatch(fetchWishlist());
            } catch (err: any) {
              Alert.alert("Erreur", err || "Impossible de supprimer l'article.");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: "transparent" }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={textColor} />
        </Pressable>
        <SemiBoldText style={[styles.title, {color: textColor}]}>
          {t("wishlist.wishlist")}
        </SemiBoldText>
        <Pressable onPress={handleClearWishlist}>
          <Ionicons name="trash-outline" size={24} color={textColor} />
        </Pressable>
      </View>

      {/* Loading */}
      {loading && <ActivityIndicator size="large" color={primaryColor} />}

      {/* Erreur */}
      {error && (
        <RegularText
          style={{ color: "red", textAlign: "center", marginTop: 10 }}
        >
          {error}
        </RegularText>
      )}

      {/* Liste des articles */}
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <WishlistItem
            item={{
              id: item.id,
              name: item.product_name,
              image_url: item.product_image,
              sale_price: item.unit_price,
            }}
            onMoveToCart={() => handleAddToCart(item)}
            handleDelete={() => handleDelete(item)}
          />
        )}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 16,
          flexGrow: items.length === 0 ? 1 : 0,
        }}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <RegularText style={{ color: textColor }}>
              {t("wishlist.wishlist_empty")}
            </RegularText>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Bouton "Tout ajouter au panier" */}
      {items.length > 0 && (
        <AppButton
          type="primary"
          title={t("wishlist.add_all_to_cart")}
          onPress={handleAddAllToCart}
          style={styles.buyButton}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buyButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
});
