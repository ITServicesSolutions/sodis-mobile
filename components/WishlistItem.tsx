import { View, StyleSheet, Image, Pressable } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { RegularText, SemiBoldText, useThemeColor } from "./Themed";
import { getActiveCurrency, formatPrice } from "@/store/currencySlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { useEffect } from "react";
import { removeFromWishlist } from "@/store/wishlistSlice";

interface WishlistItemProps {
  item: {
    id: string;
    name: string;
    image_url: string;
    sale_price: number;
  };
  onMoveToCart?: () => void;
  handleDelete?: () => void;
}

export default function WishlistItem({ item, onMoveToCart, handleDelete, }: WishlistItemProps) {
  const primary = useThemeColor({}, "primary");
  const dispatch = useDispatch<AppDispatch>();

  const activeCurrency = useSelector(
    (state: RootState) => state.currency.activeCurrency
  );
  const currencyCode = activeCurrency?.code ?? "XOF";

  // Charger la devise active si elle n'est pas définie
  useEffect(() => {
    if (!activeCurrency?.code) {
      dispatch(getActiveCurrency());
    }
  }, [activeCurrency, dispatch]);

  // Actions pour swipe
  const renderRightActions = () => (
    <Pressable style={styles.deleteAction} onPress={handleDelete}>
      <Ionicons name="trash" size={24} color="white" />
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={() => (
        <Pressable style={styles.deleteAction} onPress={handleDelete}>
          <Ionicons name="trash" size={24} color="white" />
        </Pressable>
      )}>
      <View style={styles.card}>
        {/* Image produit */}
        <Image source={{ uri: item.image_url }} style={styles.image} />

        {/* Infos produit */}
        <View style={styles.info}>
          <SemiBoldText numberOfLines={1} style={styles.name}>
            {item.name}
          </SemiBoldText>
          <RegularText style={styles.price}>
            {formatPrice(item.sale_price ?? 0, currencyCode)}
          </RegularText>
        </View>

        {/* Bouton "Ajouter au panier" si disponible */}
        {onMoveToCart && (
          <Pressable style={styles.cartButton} onPress={onMoveToCart}>
            <Ionicons name="cart" size={22} color={primary} />
          </Pressable>
        )}
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#ebebebff",
    borderRadius: 12,
    marginVertical: 8,
    padding: 16,
    marginHorizontal: 5,
    alignItems: "center",
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "cover",
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  info: {
    flex: 1,
    marginHorizontal: 12,
  },
  name: {
    fontSize: 14,
  },
  price: {
    fontSize: 16,
    marginTop: 4,
    color: "#045c9c",
    fontWeight: "bold",
  },
  cartButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "white",
    elevation: 1,
  },
  deleteAction: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 60,
    borderRadius: 12,
    marginVertical: 8,
  },
});
