import { View, StyleSheet } from 'react-native';
import { BoldText } from '@/components/Themed';

export default function TermesScreen() {
  return (
    <View style={styles.container}>
      <BoldText style={styles.title}>Termes et Conditions</BoldText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, marginTop: 40 },
});