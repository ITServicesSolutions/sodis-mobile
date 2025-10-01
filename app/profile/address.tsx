import { useState, useEffect } from 'react';
import { StyleSheet, Pressable, ScrollView, Alert, LayoutAnimation} from 'react-native';
import { View, Text, BoldText, RegularText, useThemeColor } from '@/components/Themed';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '@/components/ui/AppButton';
import BackButton from '@/components/ui/BackButton';
import TextField from '@/components/ui/TextField';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import {
  fetchShippingInfo,
  addShippingInfo,
  updateShippingInfo,
  setDefaultShippingInfo,
  deleteShippingInfo,
  ShippingInfo,
} from '@/store/shippingSlice';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from "react-i18next";

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

export default function AdresseScreen() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();

  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const secondaryColor = useThemeColor({}, 'textColor2');
  const borderColor = useThemeColor({}, 'border');
  const bgColor = useThemeColor({}, 'background'); 

  const { shippingList, loading } = useSelector((state: RootState) => state.shipping);

  const [form, setForm] = useState<Omit<ShippingInfo, 'id'>>({
    full_name: '',
    address: '',
    city: '',
    country: '',
    postal_code: '',
    phone_number: '',
    is_default: false,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchShippingInfo());
  }, []);

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm({ ...form, [field]: value });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await dispatch(updateShippingInfo({ id: editingId, data: form })).unwrap();
        Alert.alert('Succès', t('address.adresse_update_success'));
      } else {
        await dispatch(addShippingInfo(form)).unwrap();
        Alert.alert('Succès', t('address.adresse_add_success'));
      }
      setForm({
        full_name: '',
        address: '',
        city: '',
        country: '',
        postal_code: '',
        phone_number: '',
        is_default: false,
      });
      setEditingId(null);
      dispatch(fetchShippingInfo());
    } catch (err: any) {
      Alert.alert('Erreur', err.toString());
    }
  };

  const handleEdit = (addr: ShippingInfo) => {
    setForm({ ...addr });
    setEditingId(addr.id);
  };

  const handleSetDefault = async (id: string) => {
    try {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      await dispatch(setDefaultShippingInfo(id)).unwrap();
      dispatch(fetchShippingInfo());
    } catch (err: any) {
      Alert.alert('Erreur', err.toString());
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('address.confirm'), t('address.confirm_delete'), [
      { text: t('address.cancel'), style: 'cancel' },
      {
        text: t('address.delete_'),
        style: 'destructive',
        onPress: async () => {
          try {
            await dispatch(deleteShippingInfo(id)).unwrap();
            dispatch(fetchShippingInfo());
          } catch (err: any) {
            // Si l'API renvoie un message clair
            const message =
              err?.data?.detail || // RTK Query / FastAPI renvoie detail
              err?.message ||       // fallback JS
              t('address.delete_error'); // message générique i18n
            
            Alert.alert(t('address.error'), message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <BackButton />
      <BoldText style={[styles.title, { color: textColor }]}>
        {t("address.title")}
      </BoldText>
      

      {loading && <Text>{t('address.loading')}</Text>}

      {shippingList.map((addr, index) => (
        <View key={addr.id || index} style={[styles.addressBox, { borderColor: secondaryColor }]}>
          <BoldText style={{ color: textColor }}>
            {addr.full_name}
          </BoldText>
          <RegularText style={{ color: textColor }}>
            {addr.phone_number}
          </RegularText>
          <RegularText style={{ color: textColor }}>
            {addr.address}
          </RegularText>
          <RegularText style={{ color: textColor }}>
            {addr.city}, {addr.postal_code}, {addr.country}
          </RegularText>

          {addr.is_default && (
            <View style={[styles.badge, { backgroundColor: primaryColor }]}>
              <Text style={{ color: 'white', fontSize: 12 }}>
                {t('address.default_address')}
              </Text>
            </View>
          )}

          <View style={styles.actionRow}>
            {!addr.is_default && (
              <Pressable onPress={() => handleSetDefault(addr.id)}>
                <Text style={{ color: primaryColor }}>
                  {t('address.make_default')}
                </Text>
              </Pressable>
            )}
            <Pressable onPress={() => handleEdit(addr)}>
              <Text style={{ color: primaryColor }}>
                {t('address.edit')}
              </Text>
            </Pressable>
            <Pressable onPress={() => handleDelete(addr.id)}>
              <Text style={{ color: 'red' }}>
                {t('address.delete')}
              </Text>
            </Pressable>
          </View>
        </View>
      ))}

      <BoldText style={[styles.formTitle, { color: textColor }]}>
        {editingId ? t('address.edit_address') :  t('address.add_address')}
      </BoldText>

      <View style={{backgroundColor: bgColor }}>
        <TextField
          style={{ 
              borderColor: borderColor, 
              color: textColor,
            }}
          label="Nom"
          value={form.full_name}
          onChangeText={(text) => handleChange('full_name', text)}
          placeholder={t('address.fields.fullName')}
          placeholderTextColor={textColor}
        />
        <TextField
          style={{ 
                borderColor: borderColor, 
                color: textColor,
              }}
          label="Téléphone"
          value={form.phone_number}
          onChangeText={(text) => handleChange('phone_number', text)}
          placeholder={t('address.fields.phone')}
          placeholderTextColor={textColor}
          keyboardType="phone-pad"
        />
        <TextField
          style={{ 
                  borderColor: borderColor, 
                  color: textColor,
                }}
          label="Adresse"
          value={form.address}
          onChangeText={(text) => handleChange('address', text)}
          placeholder={t('address.fields.address')}
          placeholderTextColor={textColor}
        />
        <TextField
          style={{ 
                  borderColor: borderColor, 
                  color: textColor,
                }}
          label="Ville"
          value={form.city}
          onChangeText={(text) => handleChange('city', text)}
          placeholder={t('address.fields.city')}
          placeholderTextColor={textColor}
        />
        <TextField
          label="Code postal"
          value={form.postal_code}
          onChangeText={(text) => handleChange('postal_code', text)}
          placeholder={t('address.fields.postalCode')}
          keyboardType="numeric"
        />
      </View>
      {/* Pays */}
      <BoldText style={{ marginBottom: 5, color: textColor }}>
        {t('address.fields.country')}
      </BoldText>
      <View style={[styles.pickerContainer, { borderColor: secondaryColor, backgroundColor: bgColor }]}>
        <Picker
          style={{ color: textColor }}
          selectedValue={form.country}
          onValueChange={(value) => handleChange('country', value)}
          mode="dropdown"
        >
          {countries.map((country, index) => (
            <Picker.Item key={`${country}-${index}`} label={country} value={country} color={textColor} />
          ))}
        </Picker>
      </View>

      <Pressable
        style={styles.checkboxRow}
        onPress={() => handleChange('is_default', !form.is_default)}
      >
        <Ionicons
          name={form.is_default ? 'checkmark-circle' : 'ellipse-outline'}
          size={24}
          color={primaryColor}
        />
        <RegularText style={{ marginLeft: 8, color: textColor }}>
          {t('address.fields.setDefault')}
        </RegularText>
      </Pressable>

      <AppButton
        type="primary"
        title={editingId ? t('address.save_update') : t('address.add_address_')}
        onPress={handleSave}
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
    marginTop: 50,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center'
  },
  addressBox: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  formTitle: {
    fontSize: 18,
    marginBottom: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: 'white',
  },
});
