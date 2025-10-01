import { StyleSheet, Pressable, Image } from 'react-native';
import { BoldText, RegularText, useThemeColor, View } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AppButton from '@/components/ui/AppButton';
import BackButton from '@/components/ui/BackButton';
import { changeLanguage } from '@/i18n';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { setLanguage } from '@/store/languageSlice';

export default function LanguageScreen() {
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');

  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const currentLang = useSelector((state: RootState) => state.language.code);
  const defaultLang = currentLang || 'fr';
  const [selectedLang, setSelectedLang] = useState<string>(defaultLang);
  const languages = [
    { code: 'fr', label: t('français') },
    { code: 'en', label: t('anglais') },
  ];

  // LanguageScreen.tsx
  useEffect(() => {
    if (i18n.language !== defaultLang) {
      i18n.changeLanguage(defaultLang);
    }
  }, [defaultLang, i18n]);

  const handleSave = async () => {
    await changeLanguage(selectedLang);
    dispatch(setLanguage(selectedLang));
  };

  return (
    <View style={styles.container}>
      <BackButton />
      {/* Logo */}
      <Image
        source={require('../../assets/images/adaptive-icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Titre */}
      <BoldText style={[styles.title, { color: textColor }]}>
        {t('languageSettings')}
      </BoldText>

      {/* Liste des langues */}
      <View style={styles.list}>
        {languages.map((lang) => (
          <Pressable
            key={lang.code}
            style={[styles.langItem, {borderColor: borderColor}]}
            onPress={() => setSelectedLang(lang.code)}
          >
            <RegularText style={[styles.langText, { color: textColor }]}>
              {lang.label}
            </RegularText>
            {selectedLang === lang.code && (
              <Ionicons name="checkmark-circle" size={24} color={primaryColor} />
            )}
          </Pressable>
        ))}
      </View>

      {/* Bouton Enregistrer */}
      <AppButton
        type="primary"
        title={t('save')}
        onPress={handleSave}
        style={styles.saveButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 100, alignItems: 'center' },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  list: { marginBottom: 30, alignSelf: 'stretch' },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  langText: {
    fontSize: 16,
  },
  saveButton: {
    marginTop: 'auto',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
});
