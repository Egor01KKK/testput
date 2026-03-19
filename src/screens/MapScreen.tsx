import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { RootStackParamList } from '../types';
import { FestivalMapSVG } from '../components/map/FestivalMapSVG';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';

type MapScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Map'>;
type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const zones2026 = [
  { id: 'action', name: 'Действуй!', color: '#E91E63' },
  { id: 'learn', name: 'Узнавай!', color: '#3F51B5' },
  { id: 'rest', name: 'Отдыхай!', color: '#00BCD4' },
  { id: 'russia', name: 'Путешествуй по России!', color: '#FFC107' },
  { id: 'world', name: 'Путешествуй по миру!', color: '#009688' },
  { id: 'develop', name: 'Развивай!', color: '#FF9800' },
  { id: 'b2b', name: 'B2B/B2G', color: '#9C27B0' },
] as const;

type ZoneId = typeof zones2026[number]['id'];

interface MockStand {
  id: string;
  name: string;
  number: string;
  zone_id: ZoneId;
  participant: { id: string; name: string; is_partner: boolean };
  tourism_types: { id: string; name: string }[];
}

const mockStands: MockStand[] = [
  {
    id: '1',
    name: 'Камчатка',
    number: 'A01',
    zone_id: 'action',
    participant: { id: '1', name: 'Камчатский край', is_partner: false },
    tourism_types: [{ id: 'active', name: 'Активный' }],
  },
  {
    id: '2',
    name: 'Алтай',
    number: 'A02',
    zone_id: 'action',
    participant: { id: '2', name: 'Алтай', is_partner: false },
    tourism_types: [{ id: 'active', name: 'Активный' }],
  },
  {
    id: '3',
    name: 'РЖД',
    number: 'B01',
    zone_id: 'learn',
    participant: { id: '3', name: 'РЖД', is_partner: true },
    tourism_types: [{ id: 'cultural', name: 'Культурный' }],
  },
  {
    id: '4',
    name: 'Япония',
    number: 'C01',
    zone_id: 'world',
    participant: { id: '4', name: 'Japan Tourism', is_partner: false },
    tourism_types: [{ id: 'cultural', name: 'Культурный' }],
  },
  {
    id: '5',
    name: 'Турция',
    number: 'C02',
    zone_id: 'world',
    participant: { id: '5', name: 'Turkey Tourism', is_partner: false },
    tourism_types: [{ id: 'beach', name: 'Пляжный' }],
  },
  {
    id: '6',
    name: 'Санаторий Кавказ',
    number: 'D01',
    zone_id: 'rest',
    participant: { id: '6', name: 'Санаторий', is_partner: true },
    tourism_types: [{ id: 'wellness', name: 'Оздоровительный' }],
  },
];

// ---------------------------------------------------------------------------
// MapScreen
// ---------------------------------------------------------------------------

const MapScreen: React.FC = () => {
  const navigation = useNavigation<MapScreenNavigationProp>();
  const route = useRoute<MapScreenRouteProp>();
  const insets = useSafeAreaInsets();

  const zoneSheetRef = useRef<BottomSheet>(null);
  const allSheetRef = useRef<BottomSheet>(null);

  const [selectedZoneId, setSelectedZoneId] = useState<ZoneId | null>(null);
  const [activeTourismFilter, setActiveTourismFilter] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());

  // Handle filters param from MapFiltersScreen
  useEffect(() => {
    const filters = route.params?.filters;
    if (filters !== undefined) {
      setActiveFilters(new Set(filters));
    }
  }, [route.params?.filters]);

  // Handle deep-link / route param: open the zone that contains the given stand
  useEffect(() => {
    const standId = route.params?.standId;
    if (standId) {
      const stand = mockStands.find((s) => s.id === standId);
      if (stand) {
        setSelectedZoneId(stand.zone_id);
        setActiveTourismFilter(null);
        // Small delay so the sheet mounts after initial render
        setTimeout(() => {
          zoneSheetRef.current?.expand();
        }, 300);
      }
    }
  }, [route.params?.standId]);

  const selectedZone = zones2026.find((z) => z.id === selectedZoneId) ?? null;

  const standsForZone = selectedZoneId
    ? mockStands.filter((s) => s.zone_id === selectedZoneId)
    : [];

  const tourismTypesForZone: { id: string; name: string }[] = [];
  standsForZone.forEach((s) => {
    s.tourism_types.forEach((t) => {
      if (!tourismTypesForZone.find((x) => x.id === t.id)) {
        tourismTypesForZone.push(t);
      }
    });
  });

  const filteredStands =
    activeTourismFilter
      ? standsForZone.filter((s) =>
          s.tourism_types.some((t) => t.id === activeTourismFilter)
        )
      : standsForZone;

  const handleZonePress = useCallback((zoneId: ZoneId) => {
    setSelectedZoneId(zoneId);
    setActiveTourismFilter(null);
    allSheetRef.current?.close();
    zoneSheetRef.current?.expand();
  }, []);

  const handleZoneSheetClose = useCallback(() => {
    setSelectedZoneId(null);
    setActiveTourismFilter(null);
  }, []);

  const handleShowAllList = useCallback(() => {
    zoneSheetRef.current?.close();
    allSheetRef.current?.expand();
  }, []);

  const handleStandPress = useCallback(
    (standId: string) => {
      zoneSheetRef.current?.close();
      allSheetRef.current?.close();
      navigation.navigate('StandDetail', { standId });
    },
    [navigation]
  );

  const zoneSnapPoints = ['55%'];
  const allSnapPoints = ['70%'];

  // ---------------------------------------------------------------------------
  // Sub-components
  // ---------------------------------------------------------------------------

  const StandRow: React.FC<{ stand: MockStand }> = ({ stand }) => (
    <TouchableOpacity
      style={styles.standRow}
      onPress={() => handleStandPress(stand.id)}
      activeOpacity={0.7}
    >
      <View style={styles.standRowLeft}>
        <View style={styles.standNumber}>
          <Text style={styles.standNumberText}>{stand.number}</Text>
        </View>
        <View style={styles.standRowInfo}>
          <Text style={styles.standRowName}>{stand.name}</Text>
          <Text style={styles.standRowParticipant} numberOfLines={1}>
            {stand.participant.name}
          </Text>
        </View>
      </View>
      <View style={styles.standRowRight}>
        {stand.participant.is_partner && (
          <View style={styles.partnerBadge}>
            <Text style={styles.partnerBadgeText}>Партнёр</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ---- Header ---- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Карта ВДНХ</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('MapSearch')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="search-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => navigation.navigate('MapFilters')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="options-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.listBtn}
            onPress={handleShowAllList}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.listBtnText}>Список</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ---- Map Placeholder + Zone Cards ---- */}
      <ScrollView
        style={styles.mapScroll}
        contentContainerStyle={styles.mapScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Festival map SVG */}
        <View style={styles.mapContainer}>
          <FestivalMapSVG
            onZonePress={(id) => handleZonePress(id as ZoneId)}
            standCounts={Object.fromEntries(
              zones2026.map((z) => [
                z.id,
                mockStands.filter((s) => s.zone_id === z.id).length,
              ])
            )}
          />
        </View>

        {/* Active filters banner */}
        {activeFilters.size > 0 && (
          <View style={styles.filtersBanner}>
            <Ionicons name="options-outline" size={14} color={colors.primary} />
            <Text style={styles.filtersBannerText}>
              Фильтр: {Array.from(activeFilters).join(', ')}
            </Text>
            <TouchableOpacity onPress={() => setActiveFilters(new Set())}>
              <Ionicons name="close-circle" size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Zone cards grid */}
        <Text style={styles.sectionLabel}>Зоны выставки</Text>
        <View style={styles.zonesGrid}>
          {zones2026.map((zone) => {
            const zoneStands = mockStands.filter((s) => s.zone_id === zone.id);
            const standCount = activeFilters.size > 0
              ? zoneStands.filter((s) => s.tourism_types.some((t) => activeFilters.has(t.id))).length
              : zoneStands.length;
            if (activeFilters.size > 0 && standCount === 0) return null;
            return (
              <TouchableOpacity
                key={zone.id}
                style={[styles.zoneCard, { backgroundColor: zone.color }]}
                onPress={() => handleZonePress(zone.id)}
                activeOpacity={0.82}
              >
                <Text style={styles.zoneCardName}>{zone.name}</Text>
                {standCount > 0 && (
                  <Text style={styles.zoneCardCount}>
                    {standCount} {standCount === 1 ? 'стенд' : 'стенда/стендов'}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bottom padding so content clears the sheets */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ---- Frog Mascot ---- */}
      <View style={[styles.mascot, { bottom: insets.bottom + 16 }]}>
        <Text style={styles.mascotEmoji}>🐸</Text>
      </View>

      {/* ---- Zone Bottom Sheet ---- */}
      <BottomSheet
        ref={zoneSheetRef}
        index={-1}
        snapPoints={zoneSnapPoints}
        enablePanDownToClose
        onClose={handleZoneSheetClose}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
      >
        {selectedZone && (
          <BottomSheetScrollView
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Zone header */}
            <View style={[styles.zoneSheetHeader, { backgroundColor: selectedZone.color }]}>
              <Text style={styles.zoneSheetTitle}>{selectedZone.name}</Text>
              <Text style={styles.zoneSheetCount}>
                {standsForZone.length}{' '}
                {standsForZone.length === 1 ? 'стенд' : 'стендов'}
              </Text>
            </View>

            {/* Tourism type filter chips */}
            {tourismTypesForZone.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.chipsRow}
              >
                <TouchableOpacity
                  style={[
                    styles.chip,
                    activeTourismFilter === null && {
                      backgroundColor: selectedZone.color,
                      borderColor: selectedZone.color,
                    },
                  ]}
                  onPress={() => setActiveTourismFilter(null)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      activeTourismFilter === null && styles.chipTextActive,
                    ]}
                  >
                    Все
                  </Text>
                </TouchableOpacity>
                {tourismTypesForZone.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.chip,
                      activeTourismFilter === t.id && {
                        backgroundColor: selectedZone.color,
                        borderColor: selectedZone.color,
                      },
                    ]}
                    onPress={() =>
                      setActiveTourismFilter(activeTourismFilter === t.id ? null : t.id)
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        activeTourismFilter === t.id && styles.chipTextActive,
                      ]}
                    >
                      {t.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            {/* Stand list */}
            {filteredStands.length === 0 ? (
              <Text style={styles.emptyText}>Стенды не найдены</Text>
            ) : (
              filteredStands.map((stand) => (
                <StandRow key={stand.id} stand={stand} />
              ))
            )}
          </BottomSheetScrollView>
        )}
      </BottomSheet>

      {/* ---- All Stands Bottom Sheet ---- */}
      <BottomSheet
        ref={allSheetRef}
        index={-1}
        snapPoints={allSnapPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.allSheetTitle}>Все стенды</Text>
          <Text style={styles.allSheetCount}>
            {mockStands.length} стендов
          </Text>
          {mockStands.map((stand) => {
            const zone = zones2026.find((z) => z.id === stand.zone_id);
            return (
              <View key={stand.id}>
                {/* Show zone separator when zone changes */}
                <StandRow stand={stand} />
              </View>
            );
          })}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIconBtn: {
    padding: spacing.xs,
  },
  listBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  listBtnText: {
    ...typography.buttonSmall,
    color: colors.primary,
  },

  // Map area
  mapScroll: {
    flex: 1,
  },
  mapScrollContent: {
    paddingBottom: spacing.xl,
  },
  mapContainer: {
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  // Filters banner
  filtersBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: '#EEF2FF',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  filtersBannerText: {
    ...typography.captionSmall,
    color: colors.primary,
    flex: 1,
    fontWeight: '500',
  },

  // Zone cards
  sectionLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  zonesGrid: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  zoneCard: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  zoneCardName: {
    ...typography.h3,
    color: colors.text.white,
    marginBottom: 2,
  },
  zoneCardCount: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.8)',
  },

  // Frog mascot
  mascot: {
    position: 'absolute',
    right: spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.medium,
  },
  mascotEmoji: {
    fontSize: 24,
  },

  // Bottom sheets shared
  sheetBackground: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.large,
  },
  sheetHandle: {
    backgroundColor: colors.border,
    width: 40,
  },
  sheetContent: {
    paddingBottom: spacing.xxl,
  },

  // Zone sheet
  zoneSheetHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  zoneSheetTitle: {
    ...typography.h2,
    color: colors.text.white,
    marginBottom: 2,
  },
  zoneSheetCount: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.85)',
  },

  // Filter chips
  chipsRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.text.white,
    fontWeight: '600',
  },

  // Stand row
  standRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  standRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  standNumber: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  standNumberText: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    fontWeight: '700',
  },
  standRowInfo: {
    flex: 1,
  },
  standRowName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  standRowParticipant: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  standRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.sm,
  },
  partnerBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  partnerBadgeText: {
    ...typography.captionSmall,
    color: colors.warning,
    fontWeight: '600',
  },

  // All stands sheet
  allSheetTitle: {
    ...typography.h2,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  allSheetCount: {
    ...typography.caption,
    color: colors.text.secondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },

  // Empty state
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
});

export default MapScreen;
