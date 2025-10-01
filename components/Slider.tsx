import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ImageBackground,
  Text,
  Pressable,
} from 'react-native';
import { View } from '@/components/Themed';

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../assets/images/slide1.png'),
    title: 'Nouveautés',
    description: 'Découvrez notre dernière collection été 2025.',
    buttonText: 'Voir plus',
  },
  {
    id: '2',
    image: require('../assets/images/slide1.png'),
    title: 'Promotions',
    description: 'Jusqu’à -50% sur une sélection d’articles.',
    buttonText: 'Profiter',
  },
  {
    id: '3',
    image: require('../assets/images/slide1.png'),
    title: 'Produits Stars',
    description: 'Les articles les plus populaires du mois.',
    buttonText: 'Explorer',
  },
];

export default function Slider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  // ✅ Auto-scroll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
      setActiveIndex(nextIndex);
    }, 3000);

    return () => clearInterval(interval); // cleanup on unmount
  }, [activeIndex]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        style={styles.scroll}
      >
        {slides.map((slide) => (
          <View style={styles.slide} key={slide.id}>
            <ImageBackground
              source={slide.image}
              style={styles.image}
              imageStyle={{ borderRadius: 12 }}
            >
              <View style={styles.overlay}>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
                <Pressable style={styles.button}>
                  <Text style={styles.buttonText}>{slide.buttonText}</Text>
                </Pressable>
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>

      <View style={styles.dotsContainer}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              activeIndex === i ? styles.activeDot : undefined,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 1,
  },
  scroll: {
    width,
  },
  slide: {
    width,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: width * 0.92,
    height: 180,
    justifyContent: 'flex-end',
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#eee',
    marginBottom: 10,
  },
  button: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#333',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f5f1edff',
  },
  activeDot: {
    backgroundColor: '#045c9c',
    width: 10,
    height: 10,
  },
});
