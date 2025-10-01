import { Image, StyleSheet, ScrollView, Pressable, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RegularText, SemiBoldText, BoldText, useThemeColor, Text, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchProductById } from '@/store/productsSlice';
import BackButton from '@/components/ui/BackButton';
import { addToWishlist } from '@/store/wishlistSlice';
import { addToCart, fetchCart } from '@/store/cartSlice';
import { getActiveCurrency, formatPrice } from "@/store/currencySlice";
import { useTranslation } from "react-i18next";

export default function ProductDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const wishlistLoading = useSelector((state: RootState) => state.wishlist.loading);
  const cartLoading = useSelector((state: RootState) => state.cart.loading);

  const [quantity, setQuantity] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error'>('success');

  const { currentProduct: product, loading, error } = useSelector(
    (state: RootState) => state.products
  );
  const activeCurrency = useSelector((state: RootState) => state.currency.activeCurrency);
  const currencyCode = activeCurrency?.code ?? "XOF";

  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const bgColor = useThemeColor({}, 'background'); 

  const { id } = useLocalSearchParams<{ id: string }>();

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [id]);

  useEffect(() => {
    if (!activeCurrency?.code) {
      dispatch(getActiveCurrency());
    }
  }, [activeCurrency, dispatch]);

  const images = useMemo(() => {
    if (!product) return [];
    const mainImage = product.image_url ? [product.image_url] : [];
    const galleryImages = product.gallery_images || [];
    return [...mainImage, ...galleryImages];
  }, [product]);

  const [mainImage, setMainImage] = useState<string | null>(null);

  useEffect(() => {
    if (images.length > 0) {
      setMainImage(images[0]);
    }
  }, [images]);

  const increment = () => setQuantity((q) => q + 1);
  const decrement = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={primaryColor} />
        <RegularText style= {{color: textColor}}>
          {t("products_id.loading_products")}
        </RegularText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <RegularText style={{ color: 'red' }}>
          {t("products_id.error_comming")} {error}
        </RegularText>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <RegularText style={{color: textColor}}>
          {t("products_id.product_not_found")}
        </RegularText>
      </View>
    );
  }

  // --- Ajouter à la wishlist ---
  const handleAddToWishlist = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await dispatch(addToWishlist({ product_id: id })).unwrap();
      setFeedbackMessage(t("products_id.wishlist_product_add"));
      setFeedbackType('success');
    } catch (error: any) {
      setFeedbackMessage(error?.message || t("products_id.wishlist_product_add_error"));
      setFeedbackType('error');
    }
  };

  // --- Ajouter au panier ---
  const handleAddToCart = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      await dispatch(addToCart({ product_id: id, quantity })).unwrap();
      await dispatch(fetchCart());
      setFeedbackMessage(t("products_id.cart_product_add"));
      setFeedbackType('success');
    } catch (error: any) {
      setFeedbackMessage(error?.message || t("products_id.cart_product_add_error"));
      setFeedbackType('error');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <BackButton />

      {/* Image principale */}
      {mainImage && (
        <Image
          source={{ uri: mainImage }}
          style={styles.mainImage}
        />
      )}

      {/* Galerie d'images */}
      {images.length > 1 && (
        <FlatList
          data={images}
          keyExtractor={(_, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.extraImagesContainer}
          renderItem={({ item }) => (
            <Pressable onPress={() => setMainImage(item)}>
              <Image
                source={{ uri: item }}
                style={[
                  styles.extraImage,
                  mainImage === item && { borderColor: primaryColor, borderWidth: 2 },
                ]}
              />
            </Pressable>
          )}
        />
      )}

      <View style={styles.content}>
        {/* Nom et prix */}
        <View style={styles.headerRow}>
          <SemiBoldText style={[styles.name, {color: textColor}]}>
            {product.name}
          </SemiBoldText>
          <BoldText style={[styles.price, {color: textColor}]}>
            {formatPrice(product.sale_price ?? 0, currencyCode)}
          </BoldText>
        </View>

        {/* Description */}
        <RegularText style={[styles.sectionTitle, {color: textColor}]}>
          {t("products_id.description")}
        </RegularText>
        <RegularText style={[styles.description, { color: textColor }]}>
          {product.description}
        </RegularText>

        {/* Informations supplémentaires */}
        {product.additional_info && (
          <>
            <RegularText style={[styles.sectionTitle, {color: textColor}]}>
              {t("products_id.more_infos")}
            </RegularText>
            <RegularText style={[styles.additionalInfo, { color: textColor }]}>
              {product.additional_info}
            </RegularText>
          </>
        )}

        {/* Quantité */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={decrement} style={[styles.qtyButton, {backgroundColor: bgColor}]}>
            <Text style={[styles.qtySymbol, {color: textColor}]}>-</Text>
          </TouchableOpacity>
          <Text style={[styles.qtyValue, {color: textColor}]}>
            {quantity}
          </Text>
          <TouchableOpacity onPress={increment} style={[styles.qtyButton, {backgroundColor: bgColor}]}>
            <Text style={[styles.qtySymbol, {color: textColor}]}>+</Text>
          </TouchableOpacity>
        </View>

        {feedbackMessage && (
          <Text
            style={{
              color: feedbackType === 'success' ? 'green' : 'red',
              textAlign: 'center',
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
          {/* Wishlist */}
          <Pressable
            onPress={handleAddToWishlist}
            disabled={wishlistLoading}
            android_ripple={{ color: '#ddd' }}
            style={({ pressed }) => [
              styles.button,
              styles.wishlistButton,
              pressed && { opacity: 0.8 },
              wishlistLoading && { opacity: 0.5 },
            ]}
          >
            <View style={[styles.buttonContent, {backgroundColor: "transparent"}]}>
              <Ionicons name="heart-outline" size={18} color={primaryColor} />
              <Text style={[styles.buttonText, { color: primaryColor }]}>
                {wishlistLoading ? t("products_id.add") : t("products_id.wishlist")}
              </Text>
            </View>
          </Pressable>

          {/* Ajouter au panier */}
          <Pressable
            onPress={handleAddToCart}
            disabled={cartLoading}
            android_ripple={{ color: '#ddd' }}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: primaryColor },
              pressed && { opacity: 0.8 },
              cartLoading && { opacity: 0.5 },
            ]}
          >
            <View style={[styles.buttonContent, {backgroundColor: "transparent"}]}>
              <Ionicons name="cart-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>
                {cartLoading ? t("products_id.add") : t("products_id.add_cart")}
              </Text>
            </View>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mainImage: { width: '100%', height: 320, resizeMode: 'cover' },
  extraImagesContainer: { paddingVertical: 12, paddingHorizontal: 16, gap: 12 },
  extraImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  content: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  name: { fontSize: 18, flex: 1 },
  price: { fontSize: 18, marginLeft: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4, marginTop: 16 },
  description: { fontSize: 14, lineHeight: 20 },
  additionalInfo: { fontSize: 13, lineHeight: 18 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'center' },
  qtyButton: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  qtySymbol: { fontSize: 20 },
  qtyValue: { marginHorizontal: 20, fontSize: 18 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5, marginVertical: 16, gap: 8 },
  buttonContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  button: { flex: 1, paddingVertical: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  wishlistButton: { backgroundColor: '#f3f3f3', borderWidth: 1, borderColor: '#ccc' },
  buttonText: { color: '#fff', fontSize: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
