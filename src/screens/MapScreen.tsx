import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

import { RootStackParamList, Stand, StandCategory } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Header, Chip } from '../components/common';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;
type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Filter {
  id: StandCategory | 'all';
  label: string;
}

const filters: Filter[] = [
  { id: 'all', label: 'Все' },
  { id: 'world', label: 'По миру' },
  { id: 'russia', label: 'По России' },
  { id: 'services', label: 'Сервисы' },
];

// Mock data for stands
const mockStands: Stand[] = [
  {
    id: '1',
    name: 'Камчатка',
    description: 'Туристический регион с уникальными вулканами и гейзерами',
    category: 'russia',
    coordinates: { lat: 55.829, lng: 37.630 },
    logo: undefined,
  },
  {
    id: '2',
    name: 'Алтай',
    description: 'Горный край с чистейшими озерами и нетронутой природой',
    category: 'russia',
    coordinates: { lat: 55.830, lng: 37.632 },
    logo: undefined,
  },
  {
    id: '3',
    name: 'Турция',
    description: 'Популярное направление для пляжного отдыха',
    category: 'world',
    coordinates: { lat: 55.828, lng: 37.634 },
    logo: undefined,
  },
  {
    id: '4',
    name: 'Ozon Travel',
    description: 'Сервис бронирования туров и билетов',
    category: 'services',
    coordinates: { lat: 55.831, lng: 37.628 },
    logo: undefined,
  },
  {
    id: '5',
    name: 'Байкал',
    description: 'Самое глубокое озеро в мире',
    category: 'russia',
    coordinates: { lat: 55.827, lng: 37.631 },
    logo: undefined,
  },
];

const MapScreen: React.FC = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const route = useRoute<MapScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const [activeFilter, setActiveFilter] = useState<StandCategory | 'all'>('all');
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);

  const filteredStands = mockStands.filter(
    (stand) => activeFilter === 'all' || stand.category === activeFilter
  );

  const handleStandPress = useCallback((stand: Stand) => {
    setSelectedStand(stand);
    bottomSheetRef.current?.expand();
  }, []);

  const handleBuildRoute = () => {
    if (selectedStand) {
      const { lat, lng } = selectedStand.coordinates;
      // Open Yandex Maps or system maps
      const url = `yandexmaps://maps.yandex.ru/?rtext=~${lat},${lng}&rtt=pd`;
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          // Fallback to web version
          Linking.openURL(
            `https://maps.yandex.ru/?rtext=~${lat},${lng}&rtt=pd`
          );
        }
      });
    }
  };

  const getCategoryColor = (category: StandCategory): string => {
    switch (category) {
      case 'world':
        return colors.categoryColors.teal;
      case 'russia':
        return colors.categoryColors.blue;
      case 'services':
        return colors.categoryColors.orange;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Карта фестиваля"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <Chip
              key={filter.id}
              label={filter.label}
              selected={activeFilter === filter.id}
              onPress={() => setActiveFilter(filter.id)}
              color={colors.primary}
              style={styles.filterChip}
            />
          ))}
        </ScrollView>
      </View>

      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapPlaceholderText}>
            Карта ВДНХ
          </Text>
          <Text style={styles.mapPlaceholderSubtext}>
            Интерактивная карта с Яндекс Картами
          </Text>

          {/* Stand markers as list for now */}
          <ScrollView
            style={styles.standsList}
            contentContainerStyle={styles.standsListContent}
          >
            {filteredStands.map((stand) => (
              <TouchableOpacity
                key={stand.id}
                style={styles.standMarker}
                onPress={() => handleStandPress(stand)}
              >
                <View
                  style={[
                    styles.markerIcon,
                    { backgroundColor: getCategoryColor(stand.category) },
                  ]}
                >
                  <Ionicons name="location" size={20} color={colors.text.white} />
                </View>
                <Text style={styles.markerText}>{stand.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['35%']}
        enablePanDownToClose
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetHandle}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          {selectedStand && (
            <>
              <View style={styles.standHeader}>
                <View
                  style={[
                    styles.standIcon,
                    { backgroundColor: getCategoryColor(selectedStand.category) },
                  ]}
                >
                  <Ionicons name="business" size={28} color={colors.text.white} />
                </View>
                <View style={styles.standInfo}>
                  <Text style={styles.standName}>{selectedStand.name}</Text>
                  <Chip
                    label={
                      selectedStand.category === 'russia'
                        ? 'Россия'
                        : selectedStand.category === 'world'
                        ? 'Мир'
                        : 'Сервис'
                    }
                    color={getCategoryColor(selectedStand.category)}
                    selected
                    style={styles.categoryChip}
                  />
                </View>
              </View>

              <Text style={styles.standDescription}>
                {selectedStand.description}
              </Text>

              <View style={styles.standActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                  <Text style={styles.actionText}>Программа</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.routeButton]}
                  onPress={handleBuildRoute}
                >
                  <Ionicons name="navigate" size={20} color={colors.text.white} />
                  <Text style={[styles.actionText, styles.routeText]}>
                    Маршрут
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  filterChip: {
    marginRight: spacing.sm,
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: spacing.xl,
  },
  mapPlaceholderText: {
    ...typography.h2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  mapPlaceholderSubtext: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  standsList: {
    flex: 1,
    width: '100%',
  },
  standsListContent: {
    padding: spacing.md,
  },
  standMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  markerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  markerText: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  bottomSheetBackground: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.large,
  },
  bottomSheetHandle: {
    backgroundColor: colors.border,
    width: 40,
  },
  bottomSheetContent: {
    padding: spacing.lg,
  },
  standHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  standIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  standInfo: {
    flex: 1,
  },
  standName: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  categoryChip: {
    alignSelf: 'flex-start',
  },
  standDescription: {
    ...typography.body,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  standActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  routeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionText: {
    ...typography.buttonSmall,
    color: colors.primary,
  },
  routeText: {
    color: colors.text.white,
  },
});

export default MapScreen;
