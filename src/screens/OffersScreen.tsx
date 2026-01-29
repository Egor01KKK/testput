import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Tour, TourismType, TOURISM_TYPES } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Header, Chip, Card } from '../components/common';

type OffersScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Offers'>;

// Mock data for tours
const mockTours: Tour[] = [
  {
    id: '1',
    title: 'Тур на Камчатку',
    photo: 'https://example.com/kamchatka.jpg',
    description: 'Посещение вулканов, гейзеров и термальных источников',
    region: 'Камчатка',
    duration: 7,
    tourismType: 'active',
    originalPrice: 106250,
    discountPercent: 20,
    finalPrice: 85000,
    validFrom: '2025-06-15',
    validTo: '2025-12-15',
    qrCodeUrl: 'https://example.com/qr/1',
    phone: '+7 (999) 123-45-67',
    bookingUrl: 'https://example.com/book/1',
    exhibitorId: 'kamchatka-1',
  },
  {
    id: '2',
    title: 'Алтайские горы',
    photo: 'https://example.com/altai.jpg',
    description: 'Треккинг по горным тропам Алтая',
    region: 'Алтай',
    duration: 10,
    tourismType: 'active',
    originalPrice: 75000,
    discountPercent: 15,
    finalPrice: 63750,
    validFrom: '2025-06-15',
    validTo: '2025-09-30',
    qrCodeUrl: 'https://example.com/qr/2',
    phone: '+7 (999) 234-56-78',
    bookingUrl: 'https://example.com/book/2',
    exhibitorId: 'altai-1',
  },
  {
    id: '3',
    title: 'Круиз по Волге',
    photo: 'https://example.com/volga.jpg',
    description: 'Речной круиз с посещением исторических городов',
    region: 'Поволжье',
    duration: 5,
    tourismType: 'cruise',
    originalPrice: 55000,
    discountPercent: 10,
    finalPrice: 49500,
    validFrom: '2025-06-15',
    validTo: '2025-08-31',
    qrCodeUrl: 'https://example.com/qr/3',
    phone: '+7 (999) 345-67-89',
    bookingUrl: 'https://example.com/book/3',
    exhibitorId: 'volga-1',
  },
  {
    id: '4',
    title: 'Санаторий на Кавказе',
    photo: 'https://example.com/kavkaz.jpg',
    description: 'Оздоровительный отдых с минеральными водами',
    region: 'Кавказ',
    duration: 14,
    tourismType: 'wellness',
    originalPrice: 120000,
    discountPercent: 25,
    finalPrice: 90000,
    validFrom: '2025-06-15',
    validTo: '2025-12-31',
    qrCodeUrl: 'https://example.com/qr/4',
    phone: '+7 (999) 456-78-90',
    bookingUrl: 'https://example.com/book/4',
    exhibitorId: 'kavkaz-1',
  },
];

const allRegions = ['Все', 'Камчатка', 'Алтай', 'Поволжье', 'Кавказ', 'Байкал'];
const tourismTypeOptions: { id: TourismType | 'all'; label: string }[] = [
  { id: 'all', label: 'Все виды' },
  { id: 'active', label: 'Активный' },
  { id: 'wellness', label: 'Оздоровительный' },
  { id: 'cruise', label: 'Круизный' },
  { id: 'cultural', label: 'Культурный' },
  { id: 'beach', label: 'Пляжный' },
];

const OffersScreen: React.FC = () => {
  const navigation = useNavigation<OffersScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [selectedType, setSelectedType] = useState<TourismType | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState('Все');

  const filteredTours = mockTours.filter((tour) => {
    if (selectedType !== 'all' && tour.tourismType !== selectedType) {
      return false;
    }
    if (selectedRegion !== 'Все' && tour.region !== selectedRegion) {
      return false;
    }
    return true;
  });

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ru-RU') + ' ₽';
  };

  const renderTourCard = ({ item }: { item: Tour }) => (
    <TouchableOpacity
      style={styles.tourCard}
      onPress={() => navigation.navigate('TourDetail', { tourId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.tourImageContainer}>
        <View style={styles.tourImagePlaceholder}>
          <Ionicons name="image-outline" size={40} color={colors.text.secondary} />
        </View>
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>-{item.discountPercent}%</Text>
        </View>
      </View>
      <View style={styles.tourContent}>
        <Text style={styles.tourTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <View style={styles.tourMeta}>
          <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
          <Text style={styles.tourMetaText}>
            {item.region}, {item.duration} дней
          </Text>
        </View>
        <View style={styles.tourPricing}>
          <Text style={styles.tourPrice}>{formatPrice(item.finalPrice)}</Text>
          <Text style={styles.tourOriginalPrice}>
            {formatPrice(item.originalPrice)}
          </Text>
        </View>
        <TouchableOpacity style={styles.suitcaseButton}>
          <Ionicons name="heart-outline" size={18} color={colors.primary} />
          <Text style={styles.suitcaseButtonText}>В чемодан</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Скидки и спецпредложения"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* Animated Header Text */}
      <View style={styles.headerTextContainer}>
        <Text style={styles.headerText}>Какой тип отдыха планируете?</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Вид туризма:</Text>
          <FlatList
            horizontal
            data={tourismTypeOptions}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Chip
                label={item.label}
                selected={selectedType === item.id}
                onPress={() => setSelectedType(item.id)}
                color={colors.primary}
                style={styles.filterChip}
              />
            )}
          />
        </View>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Регион:</Text>
          <FlatList
            horizontal
            data={allRegions}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Chip
                label={item}
                selected={selectedRegion === item}
                onPress={() => setSelectedRegion(item)}
                color={colors.secondary}
                style={styles.filterChip}
              />
            )}
          />
        </View>
      </View>

      {/* Tours List */}
      <FlatList
        data={filteredTours}
        renderItem={renderTourCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.toursList,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.toursRow}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>Туры не найдены</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTextContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerText: {
    ...typography.h3,
    color: colors.text.primary,
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.md,
  },
  filterRow: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  filterLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  filterChip: {
    marginRight: spacing.sm,
  },
  toursList: {
    padding: spacing.md,
  },
  toursRow: {
    justifyContent: 'space-between',
  },
  tourCard: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.small,
    overflow: 'hidden',
  },
  tourImageContainer: {
    position: 'relative',
    height: 120,
  },
  tourImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  discountText: {
    ...typography.captionSmall,
    color: colors.text.white,
    fontWeight: '700',
  },
  tourContent: {
    padding: spacing.md,
  },
  tourTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tourMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tourMetaText: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  tourPricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tourPrice: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  tourOriginalPrice: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
    marginLeft: spacing.sm,
  },
  suitcaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.xs,
  },
  suitcaseButtonText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});

export default OffersScreen;
