import { useEffect, useState } from "react";
import {
  StyleSheet,
  Image,
  Alert,
  Text,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getUser, updateUser, clearMessages, changePassword } from "@/store/authSlice";
import { View, BoldText, useThemeColor } from "@/components/Themed";
import Colors from "@/constants/Colors";
import TextField from "@/components/ui/TextField";
import AppButton from "@/components/ui/AppButton";
import BackButton from "@/components/ui/BackButton";
import { useTranslation } from "react-i18next";
import { formatMessage } from "@/constants/utils";
import { TabView, TabBar } from "react-native-tab-view";
import DropDownPicker from "react-native-dropdown-picker";

export default function AccountScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, error, successMessage } = useSelector((state: RootState) => state.auth);
  const theme = Colors.light;
  const layout = useWindowDimensions();
  
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background'); 

  // --- FORM state ---
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone_number: "",
    sexe: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  // DropDownPicker state
  const [open, setOpen] = useState(false);
  const [sexeValue, setSexeValue] = useState<string>("");
  const [items, setItems] = useState([
    { label: "Masculin", value: "M" },
    { label: "Féminin", value: "F" },
  ]);

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "info", title: t("account.tabs.info") },
    { key: "password", title: t("account.tabs.password") },
  ]);

  // Charger le user au montage uniquement
  useEffect(() => {
    dispatch(getUser());
  }, []);

  // Hydrater le formulaire quand le user est dispo (une fois)
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number  || "",
        sexe: user.sexe || "",
      });
      setSexeValue(user.sexe || "");
    }
  }, [user?.id]); // évite les ré-exécutions inutiles

  // Feedbacks
  useEffect(() => {
    if (successMessage) {
      Alert.alert("Succès", formatMessage(successMessage));
      dispatch(clearMessages());
    }
    if (error) {
      Alert.alert("Erreur", formatMessage(error));
      dispatch(clearMessages());
    }
  }, [successMessage, error]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    
    const data = {
      user_id: user.id,
      name: form.name,
      email: form.email,
      phone_number: form.phone_number,
      sexe: form.sexe,
    };

    if (Object.keys(data).length === 0) {
      Alert.alert("Info", "Veuillez remplir au moins un champ à modifier.");
      return;
    }
    
    console.log("Payload envoyé:", data);
    dispatch(updateUser(data))
      .unwrap()
      .then((res) => console.log("Réponse:", res))
      .catch((err) => console.error("Erreur:", err));

  };

  const handleChangePassword = () => {
    if (!passwordForm.current_password || !passwordForm.new_password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      Alert.alert("Erreur", "Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    dispatch(
      changePassword({
        user_id: user.id,
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
        confirm_password: passwordForm.confirm_password,
      })
    );
  };

  // --- Scenes (NE PAS utiliser SceneMap ici) ---
  const renderScene = ({ route }: { route: { key: string } }) => {
    switch (route.key) {
      case "info":
        return (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
          >
            <View style={{ backgroundColor: bgColor }}>
              <TextField
                style={{ 
                    borderColor: borderColor, 
                    color: textColor,
                    borderWidth: 1, 
                    borderRadius: 5,
                    marginTop: 10, 
                    padding: 10 
                  }}
                value={form.name}
                onChangeText={(text) => handleChange("name", text)}
                placeholder={t("account.fields.fullName")}
                placeholderTextColor={textColor}
              />
              <TextField
                style={{ 
                    borderColor: borderColor, 
                    color: textColor,
                    borderWidth: 1, 
                    borderRadius: 5, 
                    padding: 10 
                  }}
                value={form.email}
                onChangeText={(text) => handleChange("email", text)}
                placeholder={t("account.fields.email")}
                keyboardType="email-address"
                placeholderTextColor={textColor}
              />
              <TextField
                style={{ 
                    borderColor: borderColor, 
                    color: textColor,
                    borderWidth: 1, 
                    borderRadius: 5, 
                    padding: 10 
                  }}
                value={form.phone_number}
                onChangeText={(text) => handleChange("phone_number", text)}
                placeholder={t("account.fields.phone")}
                keyboardType="phone-pad"
                placeholderTextColor={textColor}
              />

              <Text style={{ fontWeight: "600", marginBottom: 5, paddingLeft: 10, color: textColor }}>
                {t("account.fields.sexe")}
              </Text>

              {/* Conteneur avec zIndex élevé */}
              <View style={{ marginHorizontal: 10, marginTop: 10, zIndex: 5000, elevation: 5000, backgroundColor: bgColor }}>
                <DropDownPicker
                  open={open}
                  value={sexeValue}
                  items={items}
                  setOpen={setOpen}
                  setValue={setSexeValue}
                  setItems={setItems}
                  onChangeValue={(value) => handleChange("sexe", (value as string) || "")}
                  placeholder="--"
                  listMode="MODAL"
                  style={{
                    borderColor: borderColor,
                    borderWidth: 1,
                    borderRadius: 5,
                    height: 50,
                    paddingHorizontal: 10,
                    backgroundColor: "transparent",
                  }}
                  textStyle={{ fontSize: 14, color: textColor }}
                  dropDownContainerStyle={{
                    borderColor: borderColor,
                    borderWidth: 1,
                    borderRadius: 5,
                    backgroundColor: bgColor,
                    zIndex: 6000,
                    elevation: 6000,
                  }}
                />
              </View>

              <AppButton
                title={t("account.save")}
                type="primary"
                onPress={handleSave}
                style={{ marginTop: 20 }}
              />
            </View>
          </ScrollView>
        );
      case "password":
        return (
          <ScrollView keyboardShouldPersistTaps="handled">
            <View style={{marginTop: 10, backgroundColor: bgColor }}>
              <TextField
                style={{ 
                    borderColor: borderColor, 
                    color: textColor,
                    borderWidth: 1, 
                    borderRadius: 5, 
                    padding: 10 
                  }}
                value={passwordForm.current_password}
                placeholder={t("account.fields.currentPassword")}
                placeholderTextColor={textColor}
                onChangeText={(text) => handlePasswordChange("current_password", text)}
                secureTextEntry
              />
              <TextField
                style={{ 
                    borderColor: borderColor, 
                    color: textColor,
                    borderWidth: 1, 
                    borderRadius: 5, 
                    padding: 10 
                  }}
                value={passwordForm.new_password}
                placeholder={t("account.fields.newPassword")}
                placeholderTextColor={textColor}
                onChangeText={(text) => handlePasswordChange("new_password", text)}
                secureTextEntry
              />
              <TextField
                style={{ 
                    borderColor: borderColor, 
                    color: textColor,
                    borderWidth: 1, 
                    borderRadius: 5, 
                    padding: 10 
                  }}
                value={passwordForm.confirm_password}
                placeholder={t("account.fields.confirmPassword")}
                placeholderTextColor={textColor}
                onChangeText={(text) => handlePasswordChange("confirm_password", text)}
                secureTextEntry
              />
              <AppButton
                title={t("account.updatePassword")}
                type="primary"
                onPress={handleChangePassword}
                style={{ marginTop: 20 }}
              />
            </View>
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <BackButton />
      <BoldText style={[styles.title, { color: textColor }]}>
        {t("account.accountTitle")}
      </BoldText>

      {/* Section avatar visible sur tous les tabs */}
      <View style={styles.profileSection}>
        <Image source={require("../../assets/user_icon.png")} style={styles.avatar} />
        {user && (
          <View style={[styles.infoCard, {backgroundColor: bgColor}]}>
            <View style={styles.infoColumn}>
              <Text style={[styles.infoLabel, { color: textColor }]}>
                {t("account.fields.fullName")}
              </Text>
              <Text style={[styles.infoValue, {color: textColor}]}>
                {user.name || t("account.fields.fullName")}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={[styles.infoLabel, { color: textColor }]}>
                {t("account.fields.email")}
              </Text>
              <Text style={[styles.infoValue, {color: textColor}]}>
                {user.email}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={[styles.infoLabel, { color: textColor }]}>
                {t("account.fields.phone")}
              </Text>
              <Text style={[styles.infoValue, {color: textColor}]}>
                {user.phone_number }
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Tabs */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}         // <- plus de SceneMap
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        style={{ zIndex: 0 }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={{ backgroundColor: theme.primary }}
            style={{ backgroundColor: bgColor }}
            activeColor={theme.primary}
            inactiveColor="#999"
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 50 },
  title: { fontSize: 22, marginBottom: 10, textAlign: "center" },
  profileSection: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  infoCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoColumn: { flex: 1, alignItems: "center", paddingHorizontal: 5 },
  infoLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4, textAlign: "center" },
  infoValue: { fontSize: 12, textAlign: "center" },
});
