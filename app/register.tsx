import { 
  StyleSheet, 
  Image, 
  Pressable, 
  Alert, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform, } from 'react-native';
import { BoldText, RegularText, useThemeColor, View } from '@/components/Themed';
import AppButton from '@/components/ui/AppButton';
import { useNavigation } from '@react-navigation/native';
import { useState, useEffect } from 'react';
import TextField from '@/components/ui/TextField';
import BackButton from '@/components/ui/BackButton';
import Checkbox from '@/components/ui/Checkbox';
import Select from '@/components/ui/Select';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/store';
import { register, clearMessages } from '@/store/authSlice';
import { useTranslation } from "react-i18next";
import { useRouter } from 'expo-router';

  const countries = [
  "Afghanistan", "Afrique du Sud", "Albanie", "Algérie", "Allemagne", "Andorre", "Angola",
  "Arabie Saoudite", "Argentine", "Arménie", "Australie", "Autriche", "Belgique", "Bénin",
  "Bolivie", "Botswana", "Brésil", "Bulgarie", "Burkina Faso", "Burundi", "Cameroun",
  "Canada", "Chili", "Chine", "Chypre", "Colombie", "Congo", "Corée du Sud", "Costa Rica",
  "Côte d'Ivoire", "Croatie", "Danemark", "Djibouti", "Égypte", "Émirats Arabes Unis", 
  "Espagne", "Estonie", "États-Unis", "Éthiopie", "Finlande", "France", "Gabon", "Gambie",
  "Ghana", "Grèce", "Guinée", "Haïti", "Hongrie", "Inde", "Indonésie", "Irak", "Iran",
  "Irlande", "Islande", "Italie", "Japon", "Jordanie", "Kenya", "Koweït", "Laos", "Lettonie",
  "Liban", "Libéria", "Libye", "Lituanie", "Luxembourg", "Madagascar", "Malaisie", "Mali",
  "Malte", "Maroc", "Mauritanie", "Mexique", "Monaco", "Mongolie", "Mozambique", "Namibie",
  "Népal", "Niger", "Nigeria", "Norvège", "Nouvelle-Zélande", "Ouganda", "Ouzbékistan",
  "Pakistan", "Palestine", "Panama", "Papouasie-Nouvelle-Guinée", "Paraguay", "Pays-Bas",
  "Pérou", "Philippines", "Pologne", "Portugal", "Qatar", "République Centrafricaine",
  "République Tchèque", "Roumanie", "Royaume-Uni", "Russie", "Rwanda", "Sénégal", "Serbie",
  "Seychelles", "Singapour", "Slovaquie", "Slovénie", "Somalie", "Soudan", "Sri Lanka",
  "Suède", "Suisse", "Syrie", "Tanzanie", "Tchad", "Thaïlande", "Togo", "Tunisie", "Turquie",
  "Ukraine", "Uruguay", "Venezuela", "Vietnam", "Yémen", "Zambie", "Zimbabwe"
];

export default function RegisterScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const navigation = useNavigation();
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error, successMessage  } = useSelector((state: RootState) => state.auth);

  type RegisterForm = {
    name: string;
    email: string;
    phone_number: string;
    sexe: string;
    country: string;
    parranage_code: string;
    password: string;
    confirmPassword: string;
    acceptedTerms: boolean;
  };

  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    phone_number: '',
    sexe: '',
    country: '',
    parranage_code: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof typeof form, string>>>({});

  const handleChange = <K extends keyof RegisterForm>(field: K, value: RegisterForm[K]) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: '' });
  };

  const validate = () => {
    let valid = true;
    let newErrors: any = {};

    if (!form.name.trim()) {
      newErrors.name = t("register.name_needed");
      valid = false;
    }

    if (!form.email.trim()) {
      newErrors.email = t("register.email_needed");
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = t("register.invalid_mail");
      valid = false;
    }

    if (!form.phone_number.trim()) {
      newErrors.phone_number = t("register.phone_needed");
      valid = false;
    } else if (!/^\+?[0-9]{7,15}$/.test(form.phone_number)) {
      newErrors.phone_number = t("register.invalid_phone");
      valid = false;
    }

    if (!form.sexe) {
      newErrors.sexe = t("register.sexe_needed");
      valid = false;
    }

    if (!form.country) {
      newErrors.country = t("register.country_needed");
      valid = false;
    }

    if (!form.password) {
      newErrors.password = t("register.password_needed");
      valid = false;
    } else if (form.password.length < 6) {
      newErrors.password = t("register.password_length");
      valid = false;
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = t("register.confirm_password_needed");
      valid = false;
    } else if (form.confirmPassword !== form.password) {
      newErrors.confirmPassword = t("register.password_mismatch");
      valid = false;
    }

    if (!form.acceptedTerms) {
      newErrors.acceptedTerms = t("register.terms_needed");
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = () => {
    if (validate()) {
      dispatch(register(form));
    }
  };

  // ✅ Navigation après inscription réussie
  useEffect(() => {
    if (successMessage === "Inscription réussie.") {
      navigation.reset({
        index: 0,
        routes: [{ name: 'login' as never }],
      });
      dispatch(clearMessages());
    }
  }, [successMessage]);

  // ✅ Affichage erreur API
  useEffect(() => {
    if (error) {
      Alert.alert("Erreur", error.toString());
    }
  }, [error]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.container}>
      <BackButton />
      <Pressable onPress={() => router.push('/tabs')}>
        <Image
          source={require('../assets/images/adaptive-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Pressable>

      <BoldText style={[styles.title, { color: textColor }]}>
        {t("register.register")}
      </BoldText>
      <RegularText style={[styles.subtitle, { color: textColor }]}>
        {t("register.register_text")}
      </RegularText>

      <TextField 
        label= {t("register.fields.name")}
        placeholder={t("register.fields.name")}
        value={form.name} 
        onChangeText={(t) => handleChange('name', t)} 
        error={errors.name} 
      />

      <TextField 
        label={t("register.fields.email")} 
        placeholder={t("register.fields.email")} 
        value={form.email} 
        onChangeText={(t) => handleChange('email', t)}
        keyboardType="email-address" 
        autoCapitalize="none" 
        error={errors.email} 
      />

      <TextField 
        label={t("register.fields.phone")} 
        placeholder={t("register.fields.enter_phone")} 
        value={form.phone_number} 
        onChangeText={(t) => handleChange('phone_number', t)}
        keyboardType="phone-pad" 
        error={errors.phone_number} 
      />

      <Select 
        label={t("register.fields.sexe")} 
        value={form.sexe}
        onSelect={(v) => handleChange('sexe', v)} 
        options={['M', 'F']} 
        error={errors.sexe} 
      />

      <Select 
        label={t("register.fields.country")}
        value={form.country}
        onSelect={(v) => handleChange('country', v)} 
        options={countries} 
        error={errors.country} 
      />

      <TextField 
        label={t("register.fields.parrainage_code")}
        placeholder={t("register.fields.enter_code")}
        value={form.parranage_code} 
        onChangeText={(t) => handleChange('parranage_code', t)} 
      />

      <TextField 
        label={t("register.fields.password")}
        placeholder={t("register.fields.password")}
        secureTextEntry 
        value={form.password} 
        onChangeText={(t) => handleChange('password', t)} 
        error={errors.password} 
      />

      <TextField 
        label={t("register.fields.confirm_password")}
        placeholder={t("register.fields.confirm_your_password")}
        secureTextEntry 
        value={form.confirmPassword} 
        onChangeText={(t) => handleChange('confirmPassword', t)} 
        error={errors.confirmPassword} 
      />

      <Checkbox 
        checked={form.acceptedTerms} 
        onChange={(v) => handleChange('acceptedTerms', v)}
        label={t("register.fields.accept_terms")} 
        error={errors.acceptedTerms} 
      />

      <AppButton 
        type="primary" 
        title={loading ? t("register.fields.register_") : t("register.fields.register__")}
        onPress={handleRegister} 
        style={styles.button} 
        disabled={loading} 
      />

      {loading && <ActivityIndicator size="small" color={primaryColor} />}

      <View style={styles.loginContainer}>
        <Pressable onPress={() => navigation.navigate('Login' as never)}>
          <RegularText style={[styles.loginText, { color: primaryColor }]}>
            {t("register.fields.already_account")} 
          </RegularText>
        </Pressable>
      </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 60,
  },
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: { width: 120, height: 120, marginBottom: 30 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  button: { width: '100%', marginTop: 10, marginBottom: 20 },
  loginContainer: {
    marginTop: 'auto',
    marginBottom: 20,
    alignItems: 'center',
  },
  loginText: { fontWeight: 'bold', textAlign: 'center' },
});
