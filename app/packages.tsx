import { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { View, Text, useThemeColor } from '@/components/Themed';
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchPackages, selectPackages } from "@/store/packageSlice";
import { getActiveCurrency, formatPrice } from "@/store/currencySlice";
import BackButton from "@/components/ui/BackButton";
import { useTranslation } from "react-i18next";

export default function PackagesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const bgColor = useThemeColor({}, 'background'); 
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const packages = useSelector(selectPackages);
  const { loading, error, paginateOptions } = useSelector(
    (state: RootState) => state.packages
  );
  const activeCurrency = useSelector(
    (state: RootState) => state.currency.activeCurrency
  );
  const currencyCode = activeCurrency?.code ?? "XOF";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Charger la devise active au besoin
  useEffect(() => {
    if (!activeCurrency?.code) {
      dispatch(getActiveCurrency());
    }
  }, [activeCurrency, dispatch]);

  // Charger la première page (avec filtre si search actif)
  useEffect(() => {
    setPage(1);
    dispatch(fetchPackages({ page: 1, per_page: 10, search }));
  }, [dispatch, search]);

  // Charger plus de données quand on atteint le bas
  const loadMore = useCallback(() => {
    if (loading || page >= paginateOptions.total_page) return;
    const nextPage = page + 1;
    setPage(nextPage);
    dispatch(fetchPackages({ page: nextPage, per_page: 10, search }));
  }, [dispatch, page, loading, paginateOptions.total_page, search]);

  // Rendu d'un package
  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.card, {backgroundColor: bgColor}]}
      onPress={() => router.push(`/package/${item.id}`)}
    >
      <Image
        source={{
          uri: item.image_url
            ? item.image_url
            : `/assets/images/default_img.jpg`,
        }}
        style={styles.image}
      />
      <Text style={[styles.name, {color: textColor}]} numberOfLines={1}>
        {item.name}
      </Text>
      <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
        {item.description}
      </Text>
      <Text style={[styles.price, {color: textColor}]}>
        {formatPrice(item.price ?? 0, currencyCode)}
      </Text>
      <Text style={styles.productCount}>
        {(item.package_items?.length || 0) + " produits"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={[styles.title, {color: textColor}]}>
          {t("packages.all_packages")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Barre de recherche */}
      <View style={[{ backgroundColor: bgColor }]}>
        <TextInput
          style={[styles.searchInput, {borderColor: borderColor, color: textColor}]}
          placeholder={t("packages.search_package")}
          placeholderTextColor={textColor}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
      </View>

      {/* Message d'erreur */}
      {error && <Text style={styles.error}>{t("packages.error")} {error}</Text>}

      {/* Liste des packages */}
      <FlatList
        data={packages}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={renderItem}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="small" style={{ marginVertical: 10 }} />
          ) : null
        }
        ListEmptyComponent={
          !loading && !error ? (
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              {t("packages.no_packages")}
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingTop: 30 },
  title: { flex: 1, fontSize: 20, fontWeight: "bold", textAlign: "center" },
  searchInput: { width: "80%", alignSelf: "center", borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 16 },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  list: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: "48%",
    padding: 10,
    borderRadius: 10,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
  },
  price: {
    fontSize: 14,
  },
  productCount: {
    fontSize: 12,
    color: "#026d2fff",
    marginTop: 4,
  },
});
