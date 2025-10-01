// constants/Colors.ts

import { Background } from "@react-navigation/elements";

const baseColors = {
  primary: '#045c9c',
  secondary: '#f38c24',
  textColor1: '#000000',
  textColor2: '#858585',
  textColorBlanc: '#fff',
  background: '#ebebebff',
  background2: '#f5f1edff',
  background3: '#363535ff',
  background4: '#e3e2e2ff',
  none: 'transparent',
  white: '#ffffff',
  inputBackground: '#ebebebff',
  placeholder: '#000000',
  border: 'transparent',
  textSombre: '#000',
  textClair: '#fff',
  textPrimary: '#045c9c',
  backgroundSombre: '#000',
  backgroundClair: '#fff',
  backgroundClairSombre: '#ebebebff',
  backgroundPrimary: '#045c9c',
  borderSombre: '#000',
  borderClair: '#fff',
};

export default {
  light: {
    ...baseColors,
    text: baseColors.textSombre,
    border: baseColors.borderSombre,
    background: baseColors.backgroundClairSombre,
    background_personalise: baseColors.background4,
    tint: baseColors.primary,
    tabIconDefault: '#ccc',
    tabIconSelected: baseColors.primary,
    activityIndicatorColor: baseColors.backgroundSombre,
  },
  dark: {
    ...baseColors,
    text: baseColors.textClair,
    border: baseColors.borderClair,
    background: baseColors.backgroundSombre,
    background_personalise: baseColors.background3,
    tint: baseColors.primary,
    tabIconDefault: '#666',
    tabIconSelected: baseColors.primary,
    activityIndicatorColor: baseColors.backgroundClair,
  },
};
