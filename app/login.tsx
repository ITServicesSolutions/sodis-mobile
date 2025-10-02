import { StyleSheet, Image, Pressable, Alert, ActivityIndicator } from "react-native";
import { BoldText, RegularText, useThemeColor, View } from "@/components/Themed";
import AppButton from "@/components/ui/AppButton";
import { useNavigation } from "@react-navigation/native";
import { useState, useEffect } from "react";
import TextField from "@/components/ui/TextField";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { login } from "@/store/authSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

export default function LoginScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const textColor = useThemeColor({}, "text");
  const primaryColor = useThemeColor({}, "primary");
  const dispatch = useDispatch<AppDispatch>();
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<any>({});

  // 1️⃣ Redirection si déjà connecté
  useEffect(() => {
    if (user) {
      navigation.reset({
        index: 0,
        routes: [{ name: "tabs" as never }],
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      Alert.alert("Erreur", error.toString());
    }
  }, [error]);

  const handleChange = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  const validate = () => {
    let valid = true;
    let newErrors: any = {};
    const emailTrimmed = form.email.trim();
    const passwordTrimmed = form.password.trim();

    if (!emailTrimmed) {
      newErrors.email = t("login.enter_mail");
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = t("login.invalid_mail");
      valid = false;
    }

    if (!passwordTrimmed) {
      newErrors.password = t("login.enter_password");
      valid = false;
    } else if (passwordTrimmed.length < 6) {
      newErrors.password = t("login.password_length");
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

const handleLogin = async () => {
  if (!validate()) return;

  try {
    // Préparer le payload selon FastAPI
    const payload = {
      identifier: form.email,
      password: form.password,
    };

    const resultAction = await dispatch(login(payload));

    if (login.fulfilled.match(resultAction)) {
      // ✅ Login réussi
      const { access_token, user } = resultAction.payload;

      if (access_token) {
        await AsyncStorage.setItem("access_token", access_token);
      }
      if (user) {
        await AsyncStorage.setItem("user", JSON.stringify(user));
      }

      // Redirection vers la page principale
      navigation.reset({
        index: 0,
        routes: [{ name: "tabs" as never }],
      });
    } else if (login.rejected.match(resultAction)) {
      // ⚠️ Login échoué : afficher message exact
      Alert.alert(
        "Erreur",
        typeof resultAction.payload === "string"
          ? resultAction.payload
          : "Connexion échouée"
      );
    }
  } catch (err: any) {
    // Erreurs réseau ou inattendues
    console.error("Erreur login :", err);
    Alert.alert("Erreur", err.message || "Connexion échouée");
  }
};

  return (
    <View style={styles.container}>
      <Pressable onPress={() => navigation.reset({
          index: 0,
          routes: [{ name: 'tabs' as never }], 
        })}>
        <Image
          source={require("../assets/images/adaptive-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Pressable>

      <BoldText style={[styles.title, { color: textColor }]}>
        {t("login.login_text")}
      </BoldText>
      <RegularText style={[styles.subtitle, { color: textColor }]}>
        {t("login.welcome_sodis")}
      </RegularText>

      <TextField
        label={t("login.adress_mail")}
        placeholder={t("login.adress_mail")}
        value={form.email}
        onChangeText={(text) => handleChange("email", text)}
        keyboardType="email-address"
        autoCapitalize="none"
        error={errors.email}
      />

      <TextField
        label={t("login.password")}
        placeholder={t("login.password")}
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange("password", text)}
        error={errors.password}
      />

      <AppButton
        type="primary"
        title={loading ? t("login.login") : t("login.login_")}
        onPress={handleLogin}
        style={styles.button}
        disabled={loading}
      />

      {loading && <ActivityIndicator size="small" color={primaryColor} />}

      <Pressable onPress={() => navigation.navigate("forgetPassword" as never)}>
        <RegularText style={[styles.forgotText, { color: primaryColor }]}>
          {t("login.forget_password")}
        </RegularText>
      </Pressable>

      <View style={styles.signupContainer}>
        <Pressable onPress={() => navigation.navigate("register" as never)}>
          <RegularText style={[styles.signupText, { color: primaryColor }]}>
            {t("login.to_register")}
          </RegularText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center" },
  logo: { width: 120, height: 120, marginBottom: 30 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 5 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  button: { width: "100%", marginBottom: 15 },
  forgotText: { fontSize: 14, textAlign: "center", marginBottom: 20 },
  signupContainer: { flexDirection: "row", marginTop: 10, textAlign: "center" },
  signupText: { fontWeight: "bold" },
});
