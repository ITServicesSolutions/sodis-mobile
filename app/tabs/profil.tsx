import { StyleSheet, ScrollView, Image, Pressable, ActivityIndicator } from 'react-native';
import { View, BoldText, RegularText, SemiBoldText, useThemeColor } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { logout, getUser } from '@/store/authSlice';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { useTranslation } from "react-i18next";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const textLangColor = useThemeColor({}, 'textPrimary');
  const background_personalise = useThemeColor({}, 'background_personalise');
  const dispatch = useDispatch<AppDispatch>();

  const { user, loading } = useSelector((state: RootState) => state.auth);
  const langCode = useSelector((state: RootState) => state.language.code);
  const activeLanguage = langCode === 'fr' ? 'Français' : 'English';

  const handleLogout = async () => {
    await dispatch(logout());
    router.replace('/login');
  };

  // Rediriger seulement quand on est sûr que le chargement est terminé
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // Charger l'utilisateur une seule fois au montage
  // Charger l'utilisateur une seule fois si non chargé
useEffect(() => {
  if (!user && !loading) {
    dispatch(getUser());
  }
}, [dispatch, user, loading]);


  if (loading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={textColor} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Titre */}
      <BoldText style={[styles.title, {color: textColor}]}>
        {t('profil.profil')}
      </BoldText>

      {/* Photo de profil */}
      <View style={[styles.centered, {borderRadius: 20, backgroundColor: background_personalise}]}>
        <Image source={ require('../../assets/user_icon.png')}
                    style={styles.avatar}
        />
        <SemiBoldText style={[styles.name, {color: textColor}]}>
          {user.name}
        </SemiBoldText>
      </View>

      {/* Section Mon Compte */}
      <View style={styles.section}>
        <SemiBoldText style={[styles.sectionTitle, {color: textColor}]}>
          {t('profil.myaccount')}
        </SemiBoldText>

        <Pressable
          onPress={() => router.push('/profile/network')}
          style={[styles.row, { borderColor: borderColor }]}
        >
          <Ionicons name="people-outline" size={20} color={textColor} />
          <RegularText style={[styles.rowText, {color: textColor}]}>
            {t('profil.mynetwork')}
          </RegularText>
          <Ionicons name="chevron-forward" size={20} color={textColor} />
        </Pressable>

        <Pressable
          onPress={() => router.push('/profile/creditsodis')}
          style={[styles.row, { borderColor: borderColor }]}
        >
          <Ionicons name="card-outline" size={20} color={textColor} />
          <RegularText style={[styles.rowText, {color: textColor}]}>
            {t('profil.creditsodis')}
          </RegularText>
          <Ionicons name="chevron-forward" size={20} color={textColor} />
        </Pressable>

        <Pressable
          onPress={() => router.push('/profile/account')}
          style={[styles.row, { borderColor: borderColor }]}
        >
          <Ionicons name="person-outline" size={20} color={textColor} />
          <RegularText style={[styles.rowText, {color: textColor}]}>
            {t('profil.myaccount')}
          </RegularText>
          <Ionicons name="chevron-forward" size={20} color={textColor} />
        </Pressable>

        <Pressable
          onPress={() => router.push('/profile/address')}
          style={[styles.row, { borderColor: borderColor }]}
        >
          <Ionicons name="location-outline" size={20} color={textColor} />
          <RegularText style={[styles.rowText, {color: textColor}]}>
            {t('profil.myaddress')}
          </RegularText>
          <Ionicons name="chevron-forward" size={20} color={textColor} />
        </Pressable>
      </View>

      {/* Section Plus d'informations */}
      <View style={styles.section}>
        <SemiBoldText style={[styles.sectionTitle, {color: textColor}]}>
          {t('profil.moreinfo')}
        </SemiBoldText>

        <Pressable
          onPress={() => router.push('/profile/about')}
          style={[styles.row, { borderColor: borderColor }]}
        >
          <Ionicons name="information-circle-outline" size={20} color={textColor} />
          <RegularText style={[styles.rowText, {color: textColor}]}>
            {t('profil.about')}
          </RegularText>
          <Ionicons name="chevron-forward" size={20} color={textColor} />
        </Pressable>

        <Pressable
          style={[styles.row, { borderColor: borderColor }]}
        >
          <Ionicons name="document-text-outline" size={20} color={textColor} />
          <RegularText style={[styles.rowText, {color: textColor}]}>
            {t('profil.terms')}
          </RegularText>
          <Ionicons name="chevron-forward" size={20} color={textColor} />
        </Pressable>

        <Pressable
          onPress={() => router.push('/profile/language')}
          style={[styles.row, { borderColor: borderColor }]}
        >
          <Ionicons name="language-outline" size={20} color={textColor} />
          <RegularText style={[styles.rowText, {color: textColor}]}>
            {t('profil.language')}
          </RegularText>
          <SemiBoldText style={[styles.langText, { color: textLangColor }]}>
            {activeLanguage}
          </SemiBoldText>
          <Ionicons name="chevron-forward" size={20} color={textColor} />
        </Pressable>

        {/* BOUTON DECONNEXION */}
        <Pressable style={[styles.logoutBtn, {borderColor: borderColor}]} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="red" />
          <RegularText style={styles.logoutText}>
            {t('profil.logout')}
          </RegularText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingTop: 30,
    paddingHorizontal: 20 
  },
  title: {
    fontSize: 24,
    marginTop: 40,
    marginBottom: 20,
    textAlign: "center",
  },
  centered: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
  },
  langText: {
    marginRight: 10,
    fontSize: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 30,
  },
  logoutText: {
    color: 'red',
    marginLeft: 8,
    fontSize: 16,
  },
});
