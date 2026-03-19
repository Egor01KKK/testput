import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ListRenderItemInfo,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';

type NavProp = StackNavigationProp<RootStackParamList, 'MapSearch'>;

interface SearchStand {
  id: string;
  name: string;
  number: string;
  zone_id: string;
  zoneName: string;
  zoneColor: string;
  participantName: string;
}

const zones2026 = [
  { id: 'action', name: 'Действуй!', color: '#E91E63' },
  { id: 'learn', name: 'Узнавай!', color: '#3F51B5' },
  { id: 'rest', name: 'Отдыхай!', color: '#00BCD4' },
  { id: 'russia', name: 'Путешествуй по России!', color: '#FFC107' },
  { id: 'world', name: 'Путешествуй по миру!', color: '#009688' },
  { id: 'develop', name: 'Развивай!', color: '#FF9800' },
  { id: 'b2b', name: 'B2B/B2G', color: '#9C27B0' },
];

const allStands: SearchStand[] = [
  { id: '1', name: 'Камчатка', number: 'A01', zone_id: 'action', zoneName: 'Действуй!', zoneColor: '#E91E63', participantName: 'Камчатский край' },
  { id: '2', name: 'Алтай', number: 'A02', zone_id: 'action', zoneName: 'Действуй!', zoneColor: '#E91E63', participantName: 'Алтай' },
  { id: '3', name: 'РЖД', number: 'B01', zone_id: 'learn', zoneName: 'Узнавай!', zoneColor: '#3F51B5', participantName: 'РЖД' },
  { id: '4', name: 'Япония', number: 'C01', zone_id: 'world', zoneName: 'Путешествуй по миру!', zoneColor: '#009688', participantName: 'Japan Tourism' },
  { id: '5', name: 'Турция', number: 'C02', zone_id: 'world', zoneName: 'Путешествуй по миру!', zoneColor: '#009688', participantName: 'Turkey Tourism' },
  { id: '6', name: 'Санаторий Кавказ', number: 'D01', zone_id: 'rest', zoneName: 'Отдыхай!', zoneColor: '#00BCD4', participantName: 'Санаторий' },
];

const MapSearchScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return allStands;
    const q = query.toLowerCase();
    return allStands.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.participantName.toLowerCase().includes(q) ||
        s.number.toLowerCase().includes(q)
    );
  }, [query]);

  const renderItem = ({ item }: ListRenderItemInfo<SearchStand>) => (
    <TouchableOpacity
      style={styles.resultRow}
      onPress={() => navigation.navigate('StandDetail', { standId: item.id })}
      activeOpacity={0.7}
    >
      <View style={[styles.zoneTag, { backgroundColor: item.zoneColor }]}>
        <Text style={styles.zoneTagText}>{item.number}</Text>
      </View>
      <View style={styles.resultInfo}>
        <Text style={styles.resultName}>{item.name}</Text>
        <Text style={styles.resultSub}>{item.participantName} · {item.zoneName}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.text.secondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Стенд, участник, номер..."
            placeholderTextColor={colors.text.secondary}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.emptyText}>Ничего не найдено</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  backBtn: {
    padding: spacing.xs,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    padding: 0,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  zoneTag: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneTagText: {
    ...typography.captionSmall,
    color: colors.text.white,
    fontWeight: '700',
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  resultSub: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});

export default MapSearchScreen;
