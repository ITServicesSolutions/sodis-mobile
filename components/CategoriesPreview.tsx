import { ScrollView, Pressable, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { SemiBoldText, RegularText, useThemeColor, View } from './Themed';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCategories } from '@/store/categorySlice';
import { iconMap, normalizeIcon } from '../constants/iconMapper';
import { FontAwesome5 } from '@expo/vector-icons';
import { useTranslation } from "react-i18next";


export default function CategoriesPreview() {
  const { t } = useTranslation();
  const linkColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const backgroundPersonalise = useThemeColor({}, 'background_personalise');

  const router = useRouter();
  const MAX_CATEGORIES = 8;
  const screenWidth = Dimensions.get('window').width;


  const dispatch = useDispatch<AppDispatch>();
  const { categories, loading, error } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center' }]}>
        <ActivityIndicator size="small" color={linkColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <RegularText style={{ color: 'red' }}>{t("accueil.categoriespreview.error")} {error}</RegularText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SemiBoldText style={styles.title}>
          {t("accueil.categoriespreview.categories")}
        </SemiBoldText>
      </View>

      {/* Scroll horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: 'center',
          justifyContent: (categories?.length || 0) * 80 < screenWidth ? 'center' : 'flex-start',
          paddingHorizontal: 16,
        }}
      >
        {(categories || []).slice(0, MAX_CATEGORIES).map((cat) => {
          const iconKey = normalizeIcon(cat.icon);

          return (
            <Pressable key={cat.id} style={styles.category}>
              <View style={[styles.iconContainer, { backgroundColor: backgroundPersonalise }]}>
                <FontAwesome5
                  name={iconMap[iconKey] || 'question-circle'}
                  size={24}
                  color={linkColor}
                />
              </View>
              <RegularText style={[styles.label, { color: textColor }]}>
                {cat.name}
              </RegularText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 24,
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
  viewAll: {
    fontSize: 14,
  },
  category: {
    marginRight: 16,
    alignItems: 'center',
    width: 64,
  },
  iconContainer: {
    padding: 12,
    borderRadius: 32,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    textAlign: 'center',
  },
});
