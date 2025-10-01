import {TextInput, StyleSheet, Pressable } from 'react-native';
import { useThemeColor, View } from '@/components/Themed';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useTranslation } from "react-i18next";

interface SearchBarWithFilterProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  placeholder?: string;
}

export default function SearchBarWithFilter({
  value,
  onChangeText,
  onFilterPress,
  placeholder,
}: SearchBarWithFilterProps) {

    const { t } = useTranslation();
    const primaryColor = useThemeColor({}, 'primary');
    const textColor = useThemeColor({}, 'text');
    const borderColor = useThemeColor({}, 'border');
    const backgroundPersonalise = useThemeColor({}, 'background_personalise');


  return (
    <View style={styles.wrapper}>
      {/* Search input */}
      <View style={[styles.inputContainer, { backgroundColor: backgroundPersonalise }]}>
        <FontAwesome name="search" size={16} color="#888" style={[styles.searchIcon, {color: textColor}]} />
        <TextInput
          style={[styles.input, { color: textColor, backgroundColor: backgroundPersonalise}]}
          placeholder={t("recherche.search")}
          placeholderTextColor={textColor}
          value={value}
          onChangeText={onChangeText}
        />
      </View>

      {/* Filter button */}
      <Pressable onPress={onFilterPress} 
                style={[styles.filterButton, { backgroundColor: primaryColor }]} 
        >
            <FontAwesome6 name="sliders" size={18} color="#fff" />
        </Pressable>

    </View>
  );
}

const RADIUS = 12;

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: RADIUS,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  filterButton: {
    marginLeft: 12,
    backgroundColor: '#f2f2f2',
    padding: 18,
    borderRadius: RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
