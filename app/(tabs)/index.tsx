import { StyleSheet, ScrollView } from 'react-native';
import { View } from '@/components/Themed';
import AccueilHeader from '@/components/AccueilHeader';
import SearchBarWithFilter from '@/components/SearchBarWithFilter';
import FiltreModal from '@/components/FiltreModal';
import Slider from '@/components/Slider';
import CategoriesPreview from '@/components/CategoriesPreview';
import BestProductsPreview from '@/components/BestProductsPreview';
import BestPackagesPreview from '@/components/BestPackagesPreview';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUser } from '@/store/authSlice';
import { RootState, AppDispatch } from '@/store';


export default function AccueilScreen() {

  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(getUser());
  }, []);


  return (
    <ScrollView>
      <View style={styles.container}>

        {/* Header avec le nom de l'utilisateur et les boutons de wishlist et wallet */}
        <AccueilHeader/>

        {/* Recherche avec Filtre */}
        <SearchBarWithFilter
          value={search}
          onChangeText={setSearch}
          onFilterPress={() => setShowFilters(false)}
        />
        <FiltreModal visible={showFilters} onClose={() => setShowFilters(false)} />

        {/* Slider */}
        <Slider />
        
        {/* Catégories des produits */}
        <CategoriesPreview />

        {/* Meilleurs produits */}
        <BestProductsPreview />
        
        {/* Meilleurs packages */}
        <BestPackagesPreview />
        
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});