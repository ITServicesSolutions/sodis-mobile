import { Stack, Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useTranslation } from "react-i18next";

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text style={styles.title}>
          {t("not_found.page_not_exist")}
        </Text>

        {/* Link avec asChild pour éviter les warnings */}
        <Link href="/tabs" asChild>
          <Text style={styles.linkText}>
            {t("not_found.go_home")}
          </Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 15,
    paddingVertical: 15,
    fontSize: 14,
    color: '#2e78b7',
  },
});
