import React, { useEffect } from "react";
import { StyleSheet, FlatList, Button, Alert } from "react-native";
import {View, Text } from "@/components/Themed"
import { useLocalSearchParams } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchOrderById, selectSelectedOrder } from "@/store/orderSlice";
import { getActiveCurrency, formatPrice } from "@/store/currencySlice";
import { useTranslation } from "react-i18next";
import * as Print from "expo-print";
import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { useNavigation } from "@react-navigation/native";


export default function InvoicePage() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const order = useSelector(selectSelectedOrder);
  const { id } = useLocalSearchParams<{ id: string }>();
  const activeCurrency = useSelector((state: RootState) => state.currency.activeCurrency);
  const currencyCode = activeCurrency?.code ?? "XOF";

  useEffect(() => {
    if (!activeCurrency?.code) {
      dispatch(getActiveCurrency());
    }
  }, [activeCurrency, dispatch]);

  useEffect(() => {
    if (id) dispatch(fetchOrderById(id));
  }, [id, dispatch]);

  const handleDownloadInvoice = async (order: any, currencyCode: string) => {
    if (!order) return;

    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; padding: 16px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
            h1,h2,h3 { margin: 8px 0; }
          </style>
        </head>
        <body>
          <h1>Facture ${order.invoice_number}</h1>
          <p>Date : ${new Date(order.created_at).toLocaleDateString()}</p>
          <h2>Adresse de livraison</h2>
          <p>${order.shipping_info?.full_name}<br/>
            ${order.shipping_info?.address}<br/>
            ${order.shipping_info?.city}, ${order.shipping_info?.country}</p>
          <h2>Produits</h2>
          <table>
            <tr>
              <th>#</th>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix Unitaire</th>
              <th>Total</th>
            </tr>
            ${order.items.map((item: any, index: number) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.product_name}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.unit_price ?? 0, currencyCode)}</td>
                <td>${formatPrice(item.subtotal ?? 0, currencyCode)}</td>
              </tr>
            `).join('')}
          </table>
          <h3>Total : ${formatPrice(order.total_amount ?? 0, currencyCode)}</h3>
        </body>
      </html>
    `;

    try {
      // 1️⃣ Génération du PDF
      const { uri } = await Print.printToFileAsync({ html });
      console.log("PDF généré :", uri);

      const fileName = `facture_${order.invoice_number}.pdf`;
      const destPath = `${FileSystem.documentDirectory}${fileName}`;

      // 2️⃣ Déplacer le PDF dans documentDirectory
      await FileSystem.moveAsync({ from: uri, to: destPath });

      // 3️⃣ Vérifier les permissions MediaLibrary
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission refusée", "Impossible d’accéder au stockage.");
        return;
      }

      // 4️⃣ Créer l'asset et l'ajouter à l'album "Download"
      const asset = await MediaLibrary.createAssetAsync(destPath);
      await MediaLibrary.createAlbumAsync("Download", asset, false);

      Alert.alert("Succès ✅", "Facture enregistrée dans vos Téléchargements !");
      console.log("PDF enregistré :", asset.uri);

    } catch (err) {
      console.error("Erreur PDF :", err);
      Alert.alert("Erreur ❌", "Impossible de sauvegarder la facture.");
    }
  };

  if (!order) return <Text>{t("invoice.loading")}</Text>;

  return (
    <FlatList
      data={order.items}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={
        <>
          {/* Header */}
          <View style={[styles.header, {backgroundColor: "transparent"}]}>
            <Text style={styles.title}>{t("invoice.invoice")}</Text>
            <Text style={styles.logo}>{t("invoice.sodis")}</Text>
          </View>

          {/* Infos générales */}
          <View style={[styles.infoRow,  {backgroundColor: "transparent"}]}>
            <Text>{t("invoice.invoice_number")} {order.invoice_number}</Text>
            <Text>{t("invoice.invoice_date")} {new Date(order.created_at).toLocaleDateString()}</Text>
          </View>

          {/* Adresses */}
          <View style={[styles.addresses,  {backgroundColor: "transparent"}]}>
            <View style={styles.addressBlock}>
              <Text style={styles.subtitle}>{t("invoice.sell_by")}</Text>
              <Text>{t("invoice.sodis")}</Text>
              <Text>{t("invoice.adress")}</Text>
            </View>
            <View style={styles.addressBlock}>
              <Text style={styles.subtitle}>{t("invoice.client_adresse")}</Text>
              <Text>{order.shipping_info?.full_name}</Text>
              <Text>{order.shipping_info?.address}</Text>
              <Text>{order.shipping_info?.city}, {order.shipping_info?.country}</Text>
            </View>
          </View>

          {/* Table header */}
          <View style={[styles.tableRow,  {backgroundColor: "transparent"}]}>
            <Text style={[styles.cell, styles.bold]}>#</Text>
            <Text style={[styles.cell, styles.bold]}>{t("invoice.produit")}</Text>
            <Text style={[styles.cell, styles.bold]}>{t("invoice.quantity")}</Text>
            <Text style={[styles.cell, styles.bold]}>{t("invoice.prix_unitaire")}</Text>
            <Text style={[styles.cell, styles.bold]}>{t("invoice.total")}</Text>
          </View>
        </>
      }
      renderItem={({ item, index }) => (
        <View style={[styles.tableRow,  {backgroundColor: "transparent"}]}>
          <Text style={styles.cell}>{index + 1}</Text>
          <Text style={styles.cell}>{item.product_name}</Text>
          <Text style={styles.cell}>{item.quantity}</Text>
          <Text style={styles.cell}>{formatPrice(item.unit_price ?? 0, currencyCode)}</Text>
          <Text style={styles.cell}>{formatPrice(item.subtotal ?? 0, currencyCode)}</Text>
        </View>
      )}
      ListFooterComponent={
        <>
          {/* Totaux */}
          <View style={[styles.totals,  {backgroundColor: "transparent"}]}>
            <Text>{t("invoice.sous_total")} {formatPrice(order.total_price ?? 0, currencyCode)}</Text>
            <Text>{t("invoice.reduction")} -{formatPrice(order.total_discount ?? 0, currencyCode)}</Text>
            <Text>{t("invoice.taxe")} {formatPrice(order.total_tax ?? 0, currencyCode)}</Text>
            <Text style={styles.grandTotal}>{t("invoice.le_totale")} {formatPrice(order.total_amount ?? 0, currencyCode)}</Text>
          </View>

          {/* Boutons */}
          <View style={[styles.buttons,  {backgroundColor: "transparent"}]}>
            <Button title="Continuer vos achats" onPress={() => navigation.reset({
              index: 0,
              routes: [{ name: 'tabs' as never }],
            })} />
            <Button title="Télécharger facture" onPress={() => handleDownloadInvoice(order, currencyCode)} />
          </View>
        </>
      }
    />
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, paddingHorizontal: 16 },
  title: { fontSize: 24, fontWeight: "bold" },
  logo: { fontSize: 20, fontWeight: "bold", color: "blue" },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, paddingHorizontal: 16 },
  addresses: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, paddingHorizontal: 16 },
  addressBlock: { flex: 1, marginRight: 10 },
  subtitle: { fontWeight: "bold", marginBottom: 5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, paddingVertical: 6, paddingHorizontal: 16 },
  cell: { flex: 1, fontSize: 12 },
  bold: { fontWeight: "bold" },
  totals: { marginTop: 20, paddingHorizontal: 16 },
  grandTotal: { fontWeight: "bold", fontSize: 16, marginTop: 5 },
  buttons: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, paddingHorizontal: 16, marginBottom: 32 },
});
