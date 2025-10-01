import { Modal, StyleSheet, Pressable, TouchableWithoutFeedback } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { View, Text } from '@/components/Themed';

interface FiltreModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function FiltreModal({ visible, onClose }: FiltreModalProps) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Overlay pour fermer en appuyant à l'extérieur */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Contenu de la popup */}
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Filtres</Text>
          <Pressable onPress={onClose}>
            <FontAwesome name="close" size={22} color="#333" />
          </Pressable>
        </View>

        {/* Ici tu peux ajouter des options de filtre */}
        <View style={styles.content}>
          <Text style={styles.label}>Catégorie</Text>
          {/* ... menu ou checkbox ici ... */}

          <Text style={styles.label}>Prix</Text>
          {/* ... sliders ou input ici ... */}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    gap: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});
