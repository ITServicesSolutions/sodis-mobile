import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../Themed';

interface Props extends TextInputProps {
  label?: string;
  error?: string;
  secureTextEntry?: boolean;
}

const TextField: React.FC<Props> = ({
  label,
  error,
  secureTextEntry = false,
  style,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(!secureTextEntry);
  const textColor = useThemeColor({}, 'text');
  const themeBorderColor = useThemeColor({}, 'border');
  const borderColor = error ? '#F44336' : themeBorderColor;
  const backgroundColor = useThemeColor({}, 'background');
  const placeholderTextColor = useThemeColor({}, 'text');

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}

      <View
        style={[
          styles.inputWrapper,
          { borderColor, backgroundColor },
        ]}
      >
        <TextInput
          style={[styles.input, { color: textColor }, style]}
          placeholderTextColor={placeholderTextColor}
          secureTextEntry={!showPassword}
          {...rest}
        />

        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={20}
              color={placeholderTextColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

export default TextField;

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
    width: '100%',
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
