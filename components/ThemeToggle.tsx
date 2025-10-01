import { Pressable } from "react-native";
import { useTheme } from "@/theme/ThemeContext";
import { Feather } from "@expo/vector-icons";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Pressable
      onPress={toggleTheme}
      style={{
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isDark ? (
        <Feather name="sun" size={24} color="#f1c40f" />
      ) : (
        <Feather name="moon" size={24} color="#2c3e50" />
      )}
    </Pressable>
  );
}
