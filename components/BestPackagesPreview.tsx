import React, { useEffect } from 'react';
import { StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SemiBoldText, RegularText, useThemeColor, View } from './Themed';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchRandomBestOfferPackages, selectTop6Packages } from '@/store/packageSlice';
import { getActiveCurrency, formatPrice } from '@/store/currencySlice';
import { useTranslation } from "react-i18next";

const BestPackagesPreview: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const textColorPrimary = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const dispatch = useDispatch<AppDispatch>();

  const packages = useSelector(selectTop6Packages);
  const { loading, error } = useSelector((state: any) => state.packages);
  const activeCurrency = useSelector((state: RootState) => state.currency.activeCurrency);
  const currencyCode = activeCurrency?.code ?? 'XOF';

  useEffect(() => {
    dispatch(fetchRandomBestOfferPackages());
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
        <SemiBoldText style={styles.title}>{t("accueil.bestpackages.bestpackage")}</SemiBoldText>
        <TouchableOpacity onPress={() => router.push('/packages')}>
          <RegularText style={[styles.seeAll, { color: textColorPrimary }]}>
            {t("accueil.bestpackages.seemore")}
          </RegularText>
        </TouchableOpacity>
      </View>

      {/* Loader */}
      {loading && <ActivityIndicator size="small" style={{ marginVertical: 10 }} />}

      {/* Error */}
      {error && <RegularText style={{ color: 'red' }}>{t("accueil.bestpackages.error")} {error}</RegularText>}

      {/* Empty */}
      {!loading && packages.length === 0 && !error && (
        <RegularText style={{ textAlign: 'center', marginTop: 20 }}>
          {t("accueil.bestpackages.package_not_available")}
        </RegularText>
      )}

      {/* List */}
      <FlatList
        data={packages}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/package/[id]', params: { id: item.id } })}
          >
            <Image source={{ uri: item.image_url ? item.image_url
                : `/assets/images/default_img.jpg`,
              }}
              style={styles.image}
              defaultSource={require('../assets/images/default_img.jpg')}
            />
            <RegularText style={[styles.name, { color: textColor }]} numberOfLines={1}>
              {item.name}
            </RegularText>
            <RegularText style={[styles.name, { color: textColor }]} numberOfLines={1}>
              {item.description}
            </RegularText>
            <SemiBoldText style={[styles.price, { color: textColor }]}>
              {item.price !== undefined && (
                <SemiBoldText style={[styles.price, { color: textColor }]}>
                  {formatPrice(item.price ?? 0, currencyCode)}
                </SemiBoldText>
              )}
            </SemiBoldText>
            <RegularText style={styles.productCount}>
              {(item.package_items?.length || 0) + t('accueil.bestpackages.products')}
            </RegularText>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default BestPackagesPreview;

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
  seeAll: {
    fontSize: 14,
  },
  list: {
    gap: 12,
  },
  card: {
    width: 140,
    borderRadius: 10,
    padding: 8,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    textAlign: 'center',
  },
  price: {
    fontSize: 13,
    marginTop: 2,
    textAlign: 'center',
  },
  productCount: {
    fontSize: 12,
    color: '#026d2fff',
    textAlign: 'center',
    marginTop: 4,
  },
});
