import { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { View, Text, useThemeColor } from '@/components/Themed';
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchProducts, selectProducts, selectProductsLoading, selectProductsError, selectProductsPaginate } from "@/store/productsSlice";
import { getActiveCurrency, formatPrice } from "@/store/currencySlice";
import BackButton from "@/components/ui/BackButton";
import { useTranslation } from "react-i18next";

export default function ProductsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const bgColor = useThemeColor({}, 'background'); 
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const products = useSelector(selectProducts);
  const loading = useSelector(selectProductsLoading);
  const error = useSelector(selectProductsError);
  const paginateOptions = useSelector(selectProductsPaginate);
  const activeCurrency = useSelector((state: RootState) => state.currency.activeCurrency);
  const currencyCode = activeCurrency?.code ?? "XOF";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // Charger la devise active au besoin
  useEffect(() => {
    if (!activeCurrency?.code) {
      dispatch(getActiveCurrency());
    }
  }, [activeCurrency, dispatch]);

  // Charger produits à chaque changement de page ou de recherche
  useEffect(() => {
    dispatch(fetchProducts({ page, per_page: 10, search }));
  }, [dispatch, page, search]);

  // Pagination
  const loadMore = useCallback(() => {
    if (loading || page >= paginateOptions.total_page) return;
    setPage((prev) => prev + 1);
  }, [loading, page, paginateOptions.total_page]);

  const renderItem = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.card, {backgroundColor: bgColor}]}
      onPress={() => router.push(`/product/${item.id}`)}
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
      <Text style={[styles.name, {color: textColor}]} numberOfLines={1}>
        {item.description} 
      </Text>
      <Text style={[styles.price, {color: textColor}]}>
        {formatPrice(item.sale_price ?? 0, currencyCode)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={[styles.title, {color: textColor}]}>
          {t("products.all_products")}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={[{ backgroundColor: bgColor }]}>
        <TextInput
          placeholder={t("products.search_product")}
          placeholderTextColor={textColor}
          value={search}
          onChangeText={(text) => {
            setPage(1);
            setSearch(text);
          }}
          style={[styles.searchInput, {borderColor: borderColor, color: textColor}]}
          returnKeyType="search"
        />
      </View>

      {/* Error */}
      {error && <Text style={styles.error}>{t("products.error")} {error}</Text>}

      {/* Product List */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" style={{ marginVertical: 10 }} /> : null}
        ListEmptyComponent={!loading && !error ? <Text style={{ textAlign: "center", marginTop: 20 }}>{t("products.no_product")}</Text> : null}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingTop: 30,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  searchInput: {
    width: "80%",
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 16,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  },
  list: {
    paddingBottom: 16,
  },
  card: {
    width: "48%",
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  image: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
  },
});
