import React, { useState } from 'react';
import {
  View, Text, Modal, Pressable, FlatList, StyleSheet, TextInput
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '../Themed';

interface SelectProps {
  label?: string;
  options: string[];
  value?: string;
  placeholder?: string;
  onSelect: (value: string) => void;
  clearable?: boolean;
  error?: string;
}

export default function Select({ options, value, placeholder = 'Choisir...', onSelect, clearable = true }: SelectProps) {
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const bgColor = useThemeColor({}, "white");

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  return (
    <View>
      <Pressable
        style={[styles.selectBox, { borderColor: borderColor }]}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
      >
        <Text style={{ color: value ? textColor : '#aaa' }}>
          {value || placeholder}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {clearable && value && (
            <Pressable onPress={() => onSelect('')} style={{ marginRight: 8 }}>
              <Ionicons name="close-circle" size={18} color={textColor} />
            </Pressable>
          )}
          <Ionicons name="chevron-down" size={18} color={textColor} />
        </View>
      </Pressable>

      <Modal visible={visible} animationType="slide" transparent>
        <View style={[styles.overlay, { backgroundColor: bgColor }]}>
          <View style={[styles.modal, { backgroundColor: bgColor }]}>
            <View style={styles.header}>
              <TextInput
                placeholder="Rechercher..."
                placeholderTextColor={textColor}
                value={search}
                onChangeText={setSearch}
                style={[styles.search, { borderColor: borderColor, color: textColor }]}
              />
              <Pressable onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color={primaryColor} />
              </Pressable>
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    setVisible(false);
                  }}
                  style={styles.option}
                >
                  <Text style={{ color: textColor }}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  selectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center'
  },
  overlay: { flex: 1, justifyContent: 'flex-end' },
  modal: { maxHeight: '70%', borderTopLeftRadius: 12, borderTopRightRadius: 12, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  search: { flex: 1, borderWidth: 1, borderRadius: 6, padding: 8, marginRight: 8 },
  option: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#ccc' }
});
