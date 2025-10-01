import React, { useEffect } from "react";
import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { View, Text, BoldText, useThemeColor } from '@/components/Themed';
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchWalletHistory } from "@/store/walletSlice";
import { getUser } from '@/store/authSlice';
import { getActiveCurrency, formatPrice } from "@/store/currencySlice";
import Colors from "@/constants/Colors";
import { useTranslation } from "react-i18next";
import BackButton from "@/components/ui/BackButton";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";

const CreditSodisScreen: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const primaryColor = useThemeColor({}, "primary");
  const textColor = useThemeColor({}, "text");
  const bgColor = useThemeColor({}, "white");
  const borderColor = useThemeColor({}, 'border');

  const { history, loading, error } = useSelector(
    (state: RootState) => state.wallet
  );

  const activeCurrency = useSelector(
      (state: RootState) => state.currency.activeCurrency
    );

  const currencyCode = activeCurrency?.code ?? "XOF";

  const { user } = useSelector((state: RootState) => state.auth);

  const wallet = user?.wallet ?? { total_commission: 0, balance: 0 };

  // Charger la devise active au besoin
  useEffect(() => {
    if (!activeCurrency?.code) {
      dispatch(getActiveCurrency());
    }
  }, [activeCurrency, dispatch]);

  // Charger l'utilisateur si pas encore fait
  useEffect(() => {
    if (!user) dispatch(getUser());
  }, [user]);

  useEffect(() => {
    dispatch(fetchWalletHistory());
  }, [dispatch]);

  const renderTransaction = ({ item }: any) => (
    <View style={[styles.transactionItem, {borderColor: borderColor}]}>
      <Text style={[styles.transactionType, {color: textColor}]}>
        {item.transaction_type}
      </Text>
      <Text
        style={[
          styles.transactionAmount,
          { color: item.transaction_type === "recharge" ? "green" : "red" },
        ]}
      >
        {item.transaction_type === "recharge" ? "+" : "-"} {formatPrice(item.amount ?? 0, currencyCode)}
      </Text>
      <Text style={[styles.transactionDate, {color: textColor}]}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={[styles.error, {color: textColor}]}>
          {t("creditsodis.erreur_credit")} {error}
        </Text>
      </View>
    );
  }

  if (!wallet) {
    return (
      <View style={styles.center}>
        <Text style={[styles.empty, {color: textColor}]}>
          {t("creditsodis.no_credit")}
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <BackButton />
      {/* Titre */}
      <BoldText style={[styles.title, {color: textColor}]}>
        {t('creditsodis.credit_sodis')}
      </BoldText>

      {/* --- Solde & Commissions --- */}
      <View style={styles.infoCard}>
        <View style={[styles.infoItem, {backgroundColor: "transparent"}]}>
          <FontAwesome5 name="hand-holding-usd" size={24} color="#fff" />
          <Text style={[styles.infoLabel, {color: '#fff'}]}>
            {t("creditsodis.total_commissions")}
          </Text>
          <Text style={[styles.infoValue, {color: '#fff'}]}>
            {formatPrice(wallet.total_commission, currencyCode)}
          </Text>
        </View>

        <View style={[styles.divider, {backgroundColor: bgColor}]} />

        <View style={[styles.infoItem,  {backgroundColor: "transparent"}]}>
          <FontAwesome5 name="wallet" size={24} color="#fff" />
          <Text style={[styles.infoLabel, {color: '#fff'}]}>
            {t("creditsodis.solde")}
          </Text>
          <Text style={[styles.infoValue, {color: '#fff'}]}>
            {formatPrice(wallet.balance, currencyCode)}
          </Text>
        </View>
      </View>

      {/* --- Historique --- */}
      <Text style={[styles.sectionTitle, {color: textColor}]}>
        {t("creditsodis.history_transaction")}
      </Text>
      {history.length === 0 ? (
        <Text style={[styles.empty, {color: textColor}]}>
          {t("creditsodis.no_transaction")}
        </Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransaction}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </ScrollView>
  );
};

export default CreditSodisScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginTop: 50,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  balanceCard: {
    backgroundColor: Colors.light.primary,
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 16,
    textAlign: "center",
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  transactionDate: {
    fontSize: 12,
    flex: 1,
    textAlign: "right",
  },
  error: {
    color: "red",
    textAlign: "center",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    padding: 20,
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  divider: {
    width: 1,
    height: "80%",
    marginHorizontal: 10,
  },
  infoLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  infoValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
  },
});
