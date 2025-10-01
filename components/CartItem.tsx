import { useEffect } from "react";
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { RegularText, SemiBoldText, useThemeColor } from './Themed';
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { getActiveCurrency, formatPrice } from "@/store/currencySlice";

interface CartItemProps {
  product: {
    id: string;
    name: string;
    image: any;
    price: number;
    quantity: number;
    isPackage?: boolean;
  };
  onIncrease: () => void;
  onDecrease: () => void;
  onDelete: () => void;
}

export default function CartItem({
  product,
  onIncrease,
  onDecrease,
  onDelete,
}: CartItemProps) {
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const background_personalise = useThemeColor({}, 'background_personalise');
  const dispatch = useDispatch<AppDispatch>();
  const activeCurrency = useSelector(
    (state: RootState) => state.currency.activeCurrency
  );
  const currencyCode = activeCurrency?.code ?? "XOF";

  // Charger la devise active au besoin
  useEffect(() => {
    if (!activeCurrency?.code) {
      dispatch(getActiveCurrency());
    }
  }, [activeCurrency, dispatch]);

  const renderRightActions = () => (
    <Pressable style={styles.deleteAction} onPress={onDelete}>
      <Ionicons name="trash" size={24} color="white" />
    </Pressable>
  );


  // Charger la devise active au besoin
  useEffect(() => {
    if (!activeCurrency?.code) {
      dispatch(getActiveCurrency());
    }
  }, [activeCurrency, dispatch]);

  return ( 
    <Swipeable renderRightActions={() => (
      <Pressable style={styles.deleteAction} onPress={onDelete}>
        <Ionicons name="trash" size={24} color="white" />
      </Pressable>
    )}>
      <View style={[styles.card,  {backgroundColor: background_personalise}]}>
        <Image source={product.image} style={styles.image} />

        <View style={styles.info}>
          {/* Optionnel : badge "[Pack]" */}
          {product.isPackage && (
            <Text style={{ color: "white", 
                          fontSize: 12, 
                          textAlign:'center', 
                          backgroundColor: primary,
                          borderRadius: 15,
                          marginLeft:30,
                          marginRight:30,
                          paddingTop: 5,
                          paddingBottom:5,
                          marginBottom: 5,}}>
                  Package
            </Text>
          )}
          <SemiBoldText numberOfLines={1} style={[
            styles.name,
            product.isPackage && { color: primary } // couleur différente pour les packages
          ]}>
            {product.name}
          </SemiBoldText>

          <RegularText style={styles.price}>
            {formatPrice(product.price ?? 0, currencyCode)}
          </RegularText>
        </View>

        <View style={[styles.quantityControls,  {backgroundColor: "transparent"}]}>
          <Pressable onPress={onDecrease} style={styles.qtyButton}>
            <Ionicons name="remove" size={18} color={text} />
          </Pressable>

          <Text style={[styles.qtyText, {color: text}]}>{product.quantity}</Text>

          <Pressable onPress={onIncrease} style={styles.qtyButton}>
            <Ionicons name="add" size={18} color={text} />
          </Pressable>
        </View>
      </View>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    marginVertical: 8,
    padding: 20,
    marginHorizontal: 5,
    alignItems: 'center',
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: 'cover',
    borderRadius: 8,
  },
  info: {
    flex: 1,
    marginHorizontal: 12,
  },
  name: {
    fontSize: 14,
    textAlign: 'center',
  },
  price: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
    color: '#045c9c',
    fontWeight: 'bold',
  },
  quantityControls: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 70,
  },
  qtyButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: 'white',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 4,
  },
  deleteAction: {
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    borderRadius: 12,
    marginVertical: 8,
  },
});
