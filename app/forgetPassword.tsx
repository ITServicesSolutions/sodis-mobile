import { StyleSheet, Image } from "react-native";
import { BoldText, RegularText, useThemeColor, View } from "@/components/Themed";
import AppButton from "@/components/ui/AppButton";
import { useState, useEffect } from "react";
import TextField from "@/components/ui/TextField";
import BackButton from "@/components/ui/BackButton";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { forgotPassword, clearMessages } from "@/store/authSlice";
import { useTranslation } from "react-i18next";

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const textColor = useThemeColor({}, "text");

  const [email, setEmail] = useState("");
  const [localError, setLocalError] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    if (successMessage || error) {
      // nettoyage automatique
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const handleSendLink = () => {
    // Validation côté client
    if (!email.trim()) {
      setLocalError("L’email est requis");
      return;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      setLocalError("Email invalide");
      return;
    }

    setLocalError("");
    dispatch(forgotPassword(email));
  };

  return (
    <View style={styles.container}>
      <BackButton />
      <Image
        source={require("../assets/images/adaptive-icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <BoldText style={[styles.title, { color: textColor }]}>
        {t("forgetpassword.forget_password")}
      </BoldText>

      <RegularText style={[styles.subtitle, { color: textColor }]}>
        {t("forgetpassword.forget_password")}
      </RegularText>

      <TextField
        label="Email"
        placeholder={t("forgetpassword.email_enter")}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={localError || error || undefined}
      />

      <AppButton
        type="primary"
        title={loading ? t("forgetpassword.sending") : t("forgetpassword.send_link")}
        onPress={handleSendLink}
        disabled={loading}
        style={styles.button}
      />

      {successMessage ? (
        <RegularText style={{ color: "green", marginTop: 10 }}>
          {successMessage}
        </RegularText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  logo: { width: 120, height: 120, marginBottom: 30 },
  title: { fontSize: 26, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  button: { marginTop: 10 },
});
