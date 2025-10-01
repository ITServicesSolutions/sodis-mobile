import { StyleSheet, Image, ScrollView } from 'react-native';
import { View, BoldText, RegularText, useThemeColor } from '@/components/Themed';
import BackButton from '@/components/ui/BackButton';
import { useTranslation } from 'react-i18next';

export default function AboutScreen() {
  const textColor = useThemeColor({}, 'text');
  const { t } = useTranslation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      {/* Logo */}
      <Image
        source={require('../../assets/images/adaptive-icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Title */}
      <BoldText style={[styles.title, { color: textColor }]}>
        {t('about.aboutTitle')}
      </BoldText>

      {/* Description */}
      <RegularText style={[styles.description, { color: textColor }]}>
        {t('about.aboutDescription')}
      </RegularText>

      {/* Informations */}
      <View style={styles.infoBox}>
        <View style={styles.infoColumn}>
          <BoldText style={{ color: textColor, textAlign: "center", fontWeight: '900' }}>
            {t('about.appVersion')}
          </BoldText>
          <RegularText style={{ color: textColor, textAlign: "center" }}>
            1.0.0
          </RegularText>
        </View>

        <View style={styles.infoColumn}>
          <BoldText style={{ color: textColor, textAlign: "center", fontWeight: '900' }}>
            {t('about.contactEmail')}
          </BoldText>
          <RegularText style={{ color: textColor, textAlign: "center" }}>
            support@sodis.bj
          </RegularText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 100,
    alignItems: 'center'
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20
  },
  title: {
    fontSize: 22,
    marginBottom: 15
  },
  description: {
    fontSize: 16,
    textAlign: 'justify',
    marginBottom: 20
  },
  infoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  infoColumn: {
    flex: 1,
  },
});
