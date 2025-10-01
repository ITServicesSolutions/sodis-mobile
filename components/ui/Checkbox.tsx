import React, { useState, useEffect } from 'react';
import { Pressable, View, StyleSheet, Text, Animated } from 'react-native';
import { useThemeColor } from '../Themed';
import { Ionicons } from '@expo/vector-icons';

interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  error?: string;
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

export default function Checkbox({
  checked = false,
  indeterminate = false,
  label,
  size = 'medium',
  error,
  disabled = false,
  onChange
}: CheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(checked);
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  const themeBorderColor = useThemeColor({}, 'border');
  const borderColor = error ? 'red' : themeBorderColor;

  const animatedScale = new Animated.Value(checked || indeterminate ? 1 : 0);
  const animatedOpacity = new Animated.Value(checked || indeterminate ? 1 : 0);

  const sizes = { small: 18, medium: 24, large: 32 };
  const boxSize = sizes[size];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(animatedScale, { toValue: internalChecked || indeterminate ? 1 : 0, useNativeDriver: true }),
      Animated.timing(animatedOpacity, { toValue: internalChecked || indeterminate ? 1 : 0, duration: 150, useNativeDriver: true })
    ]).start();
  }, [internalChecked, indeterminate]);

  const toggle = () => {
    if (disabled) return;
    const newValue = !internalChecked;
    setInternalChecked(newValue);
    onChange?.(newValue);
  };

  return (
    <View style={{ marginBottom: error ? 4 : 0 }}>
      <Pressable
        onPress={toggle}
        style={styles.row}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: internalChecked, disabled }}
      >
        <View
          style={[
            styles.box,
            {
              width: boxSize,
              height: boxSize,
              borderColor,
              backgroundColor: internalChecked || indeterminate ? primaryColor : 'transparent',
              opacity: disabled ? 0.5 : 1
            }
          ]}
        >
          <Animated.View style={{ transform: [{ scale: animatedScale }], opacity: animatedOpacity }}>
            {indeterminate ? (
              <View style={[styles.indeterminate, { backgroundColor: '#fff' }]} />
            ) : (
              <Ionicons name="checkmark" size={boxSize - 8} color="#fff" />
            )}
          </Animated.View>
        </View>
        {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  box: { borderWidth: 2, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  label: { marginLeft: 8, fontSize: 16 },
  indeterminate: { width: '60%', height: 2, borderRadius: 1 },
  error: { color: 'red', fontSize: 12, marginTop: 2 }
});
