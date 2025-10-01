import { FlatList, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SemiBoldText, RegularText, useThemeColor, View } from '@/components/Themed';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { fetchCategories } from '@/store/categorySlice';
import { iconMap, normalizeIcon } from '@/constants/iconMapper';
import { FontAwesome5 } from '@expo/vector-icons';
import BackButton from '@/components/ui/BackButton';
import { useTranslation } from "react-i18next";

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const textColor = useThemeColor({}, 'text');
  const linkColor = useThemeColor({}, 'primary');
  const backgroundPersonalise = useThemeColor({}, 'background_personalise');
  const dispatch = useDispatch<AppDispatch>();

  const { categories, loading, error } = useSelector((state: RootState) => state.categories);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={linkColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <RegularText style={{ color: 'red' }}>{t("categories.error")}: {error}</RegularText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton />
      <SemiBoldText style={[styles.title, {color: textColor}]}>
        {t("categories.all_categories")}
      </SemiBoldText>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const iconKey = normalizeIcon(item.icon);

          return (
            <Pressable style={styles.item}>
              <View style={[styles.iconContainer, { backgroundColor: backgroundPersonalise }]}>
                <FontAwesome5
                  name={iconMap[iconKey] || 'question-circle'}
                  size={28}
                  color={linkColor}
                />
              </View>
              <RegularText style={[styles.label, { color: textColor }]}>
                {item.name}
              </RegularText>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 80,
  },
  title: {
    fontSize: 20,
    marginBottom: 16,
    textAlign: "center"
  },
  grid: {
    gap: 16,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  item: {
    alignItems: 'center',
    width: '48%',
  },
  iconContainer: {
    padding: 16,
    borderRadius: 40,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    textAlign: 'center',
  },
});
