declare module "react-native-country-flag-select" {
  import React from "react";
  import { ViewStyle, TextStyle } from "react-native";

  export interface Country {
    name: string;
    code: string;
    dial_code: string;
    emoji: string;
  }

  export interface CountryFlagSelectProps {
    placeholder?: string;
    searchPlaceholder?: string;
    selected?: string;
    onSelect: (country: Country) => void;
    primaryColor?: string;
    style?: ViewStyle | TextStyle;
  }

  const CountryFlagSelect: React.FC<CountryFlagSelectProps>;
  export default CountryFlagSelect;
}
