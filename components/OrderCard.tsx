import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useThemeColor } from "./Themed";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "@/store/orderSlice";
import { getActiveCurrency, formatPrice } from "@/store/currencySlice";
import { AppDispatch, RootState } from "@/store";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

interface Props {
  order: Order;
  onPress?: () => void;
}

const OrderCard: React.FC<Props> = ({ order, onPress }) => {
  const { t } = useTranslation();
  const textColor = useThemeColor({}, "text");
  const background_personalise = useThemeColor({}, 'background_personalise');
  const dispatch = useDispatch<AppDispatch>();
  const activeCurrency = useSelector(
    (state: RootState) => state.currency.activeCurrency
  );
  const currencyCode = activeCurrency?.code ?? "XOF";

  // Charger la devise active au besoin
  useEffect(() => {
    if (!activeCurrency?.code) {
      dispatch(getActiveCurrency());
    }
  }, [activeCurrency, dispatch]);

  // Mapping status → texte FR + couleur
  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "En attente", color: "#f59e0b" },
    delivered: { label: "Livrée", color: "#22c55e" },
    cancelled: { label: "Annulée", color: "#ef4444" },
    in_progress: { label: "En cours", color: "#3b82f6" },
    assigned: { label: "Assignée", color: "#2563eb" },
    awaiting: { label: "En préparation", color: "#6366f1" },
  };

  const status = statusMap[order.status] || {
    label: order.status,
    color: "#6b7280",
  };

  const firstItem = order.items?.[0];
  const extraCount = order.items?.length > 1 ? order.items.length - 1 : 0;

  const productName =
    firstItem?.product?.name ||
    firstItem?.package?.name ||
    firstItem?.product_name ||
    firstItem?.package_name;

  const productImage =
    firstItem?.product?.image_url ||
    firstItem?.package?.image_url ||
    firstItem?.product_image ||
    null;

  const isPackage = !!firstItem?.package_id || !!firstItem?.package;

  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Date inconnue";

  return (
    <TouchableOpacity onPress={onPress}
      style={[styles.card, { backgroundColor: background_personalise }]}
    >
      {/* Ligne 2 - Badge aligné à droite */}
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 10 }}>
        <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
          <Text style={styles.statusText}>{status.label}</Text>
        </View>
      </View>
      
      {/* Ligne 1 - Numéro */}
      <View style={styles.topRow}>
        <Text style={[styles.orderNumber, { color: textColor }]}>
          {t("commandes.order_number")} {order.order_number}
        </Text>
      </View>

      {/* Ligne 2 - Produit principal */}
      {firstItem && (
        <View style={styles.productRow}>
          {productImage ? (
            <Image source={{ uri: productImage }} style={styles.image} />
          ) : (
            <View style={[styles.image, { justifyContent: "center", alignItems: "center" }]}>
             <Ionicons
                name={isPackage ? "cube-outline" : "pricetag-outline"}
                size={24}
                color={isPackage ? "#045c9c" : "#9ca3af"}
              />
            </View>
          )}
          <View style={styles.details}>
            {isPackage && (
              <View style={styles.packageBadge}>
                <Text style={styles.packageText}>{t("commandes.package")}</Text>
              </View>
            )}
            <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
              {productName}
            </Text>
            <Text style={[styles.subText, { color: textColor }]}>
              x{firstItem.quantity}
              {extraCount > 0 && `  •  +${extraCount} autres articles`}
            </Text>
            <Text style={[styles.total, { color: textColor }]}>
              {formatPrice(order.total_amount ?? 0, currencyCode)}
            </Text>
          </View>
        </View>
      )}

      {/* Ligne 3 - Adresse livraison */}
      {order.shipping_info?.address && (
        <Text style={[styles.address, { color: textColor }]}>
          {t("commandes.delivery")} {order.shipping_info.address}
        </Text>
      )}

      {/* Ligne 4 - Date */}
      <View style={styles.dateRow}>
        <Ionicons
          name="calendar-outline"
          size={16}
          color={textColor}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.date, { color: textColor }]}>{orderDate}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default OrderCard;

const styles = StyleSheet.create({
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center",
  },
  orderNumber: {
    fontWeight: "700",
    fontSize: 15,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#f3f4f6",
  },
  details: {
    flex: 1,
  },
  name: {
    fontWeight: "600",
    fontSize: 15,
    marginBottom: 2,
  },
  subText: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 4,
  },
  total: {
    fontSize: 14,
    fontWeight: "600",
  },
  address: {
    fontSize: 13,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 13,
  },
  packageBadge: {
    backgroundColor: "#045c9c",
    paddingHorizontal: 26,
    paddingVertical: 2,
    flex: 1,
    marginHorizontal: 12,
    marginLeft: 6,
    color: "white", 
    fontSize: 18, 
    textAlign:'center', 
    borderRadius: 15,
    marginRight:130,
    paddingTop: 8,
    paddingBottom: 8,
    marginBottom: 5,
  },
  packageText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});
