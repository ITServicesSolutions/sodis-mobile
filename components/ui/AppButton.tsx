import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  StyleProp,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor, Text, View } from '../Themed';

type ButtonType = 'primary' | 'secondary' | 'text';

interface AppButtonProps {
  title?: string;
  type?: ButtonType;
  onPress?: () => void;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>; 
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  type = 'primary',
  onPress,
  iconName,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const primaryColor = useThemeColor({}, 'primary');
  const backgroundColor =
    type === 'primary' ? primaryColor : type === 'secondary' ? '#fff' : 'transparent';
  const textColor =
    type === 'primary' ? '#fff' : primaryColor;
  const borderColor =
    type === 'secondary' ? primaryColor : 'transparent';

  const renderIcon = () =>
    iconName ? (
      <Ionicons
        name={iconName}
        size={18}
        color={textColor}
        style={iconPosition === 'left' ? styles.iconLeft : styles.iconRight}
      />
    ) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
        type === 'text' && styles.textOnly,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={[styles.content, {backgroundColor: "transparent"}]}>
          {iconPosition === 'left' && renderIcon()}
          {title && (
            <Text style={[styles.text, { color: textColor }, textStyle]}>
              {title}
            </Text>
          )}
          {iconPosition === 'right' && renderIcon()}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 45,
  },
  textOnly: {
    borderWidth: 0,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  text: {
    fontSize: 15,
    fontWeight: '500',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
