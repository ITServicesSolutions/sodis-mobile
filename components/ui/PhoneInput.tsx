import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useThemeColor } from '../Themed';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  countryCode?: string; // par défaut +229
}

const PhoneInput: React.FC<Props> = ({
  label,
  error,
  countryCode = '+229',
  style,
  ...rest
}) => {
  const textColor = useThemeColor({}, 'text');
  const themeBorderColor = useThemeColor({}, 'border');
  const borderColor = error ? '#F44336' : themeBorderColor;
  const backgroundColor = useThemeColor({}, 'inputBackground');
  const placeholderTextColor = useThemeColor({}, 'placeholder');

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}

      <View style={[styles.inputWrapper, { borderColor, backgroundColor }]}>
        <Text style={[styles.code, { color: textColor }]}>
          {countryCode}
        </Text>
        <TextInput
          style={[styles.input, { color: textColor }, style]}
          keyboardType="phone-pad"
          placeholder="00 00 00 00"
          placeholderTextColor={placeholderTextColor}
          {...rest}
        />
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default PhoneInput;

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  code: {
    marginRight: 8,
    fontSize: 15,
  },
  input: {
    flex: 1,
    fontSize: 15,
  },
  error: {
    marginTop: 4,
    color: '#F44336',
    fontSize: 12,
  },
});
