import { ScrollView, Pressable, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SemiBoldText, RegularText, useThemeColor, View } from './Themed';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchRandomBestOfferProducts, selectTop6Products } from '@/store/productsSlice';
import { getActiveCurrency, formatPrice } from '@/store/currencySlice';
import { useTranslation } from "react-i18next";

export default function BestProductsPreview() {
  const { t } = useTranslation();
  const textColorprimary = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const products = useSelector(selectTop6Products);
  const { loading, error } = useSelector((state: any) => state.products);
  const activeCurrency = useSelector((state: RootState) => state.currency.activeCurrency);
  const currencyCode = activeCurrency?.code ?? 'XOF';

  useEffect(() => {
    dispatch(fetchRandomBestOfferProducts());
  }, [dispatch]);

  useEffect(() => {
      if (!activeCurrency?.code) {
        dispatch(getActiveCurrency());
      }
    }, [activeCurrency, dispatch]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SemiBoldText style={styles.title}>
          {t("accueil.bestproducts.bestproduct")}
        </SemiBoldText>
        <Pressable onPress={() => router.push('/products')}>
          <RegularText style={[styles.viewMore, { color: textColorprimary }]}>
            {t("accueil.bestproducts.seemore")}
          </RegularText>
        </Pressable>
      </View>

      {/* Loader */}
      {loading && <ActivityIndicator size="small" style={{ marginVertical: 10 }} />}

      {/* Erreur */}
      {error && <RegularText style={{ color: 'red' }}>{t("accueil.bestproducts.error")} {error}</RegularText>}

      {/* Aucun produit */}
      {!loading && products.length === 0 && !error && (
        <RegularText style={{ textAlign: 'center', marginTop: 20 }}>
          {t("accueil.bestproducts.product_not_available")}
        </RegularText>
      )}

      {/* Produits */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {products.map((product) => (
          <Pressable
            key={product.id}
            style={styles.productCard}
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
          >
            <Image source={{ uri: product.image_url ? product.image_url
                  : `/assets/images/default_img.jpg`,
              }}
              style={styles.image}
              defaultSource={require('../assets/images/default_img.jpg')}
            />
            <RegularText style={[styles.name, {color: textColor}]} numberOfLines={1}>
              {product.name} 
            </RegularText>
            <RegularText style={[styles.name, {color: textColor}]} numberOfLines={1}>
              {product.description} 
            </RegularText>
            <SemiBoldText style={[styles.price, {color: textColor}]}>
              {formatPrice(product.sale_price ?? 0, currencyCode)}
            </SemiBoldText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
  },
  viewMore: {
    fontSize: 14,
  },
  productCard: {
    marginRight: 16,
    width: 120,
  },
  image: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 6,
  },
  name: {
    fontSize: 13,
    textAlign: 'center',
  },
  price: {
    fontSize: 14,
    marginTop: 2,
    textAlign: 'center',
  },
});
