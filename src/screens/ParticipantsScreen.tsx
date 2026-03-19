import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Participant2026 } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { participantsApi } from '../api/participants';
import { Header } from '../components/common';

type ParticipantsNavigationProp = StackNavigationProp<RootStackParamList, 'Participants'>;

type FilterType = 'all' | 'partners';

const mockParticipants: Participant2026[] = [
  { id: '1', name: 'Роскосмос', title: 'Государственная корпорация', is_partner: true, logo: undefined },
  { id: '2', name: 'РЖД', title: 'Железные дороги России', is_partner: true, logo: undefined },
  { id: '3', name: 'Камчатский край', title: 'Региональный стенд', is_partner: false, logo: undefined },
  { id: '4', name: 'Алтай', title: 'Региональный стенд', is_partner: false, logo: undefined },
  { id: '5', name: 'Сочи', title: 'Курорт', is_partner: false, logo: undefined },
];

const AVATAR_COLORS = [
  '#2196F3', '#4CAF50', '#9C27B0', '#FF9800', '#E91E63',
  '#3F51B5', '#00BCD4', '#009688', '#FFC107', '#F44336',
];

const getAvatarColor = (id: string): string => {
  const index = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
};

const ParticipantCard: React.FC<{
  item: Participant2026;
  onPress: () => void;
}> = ({ item, onPress }) => {
  const avatarColor = getAvatarColor(item.id);
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.avatarCircle, { backgroundColor: avatarColor + '22' }]}>
        <Text style={[styles.avatarInitials, { color: avatarColor }]}>
          {getInitials(item.name)}
        </Text>
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardNameRow}>
          <Text style={styles.cardName} numberOfLines={1}>
            {item.name}
          </Text>
          {item.is_partner && (
            <View style={styles.partnerBadge}>
              <Ionicons name="star" size={11} color={colors.secondary} />
              <Text style={styles.partnerBadgeText}>Партнёр</Text>
            </View>
          )}
        </View>
        {item.title && (
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
    </TouchableOpacity>
  );
};

const ParticipantsScreen: React.FC = () => {
  const navigation = useNavigation<ParticipantsNavigationProp>();
  const insets = useSafeAreaInsets();

  const [participants, setParticipants] = useState<Participant2026[]>(mockParticipants);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await participantsApi.getParticipants();
        setParticipants(data);
      } catch {
        // keep mock data on error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = participants;
    if (filter === 'partners') {
      result = result.filter((p) => p.is_partner);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [participants, filter, search]);

  const filterChips: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'Все' },
    { key: 'partners', label: 'Партнёры' },
  ];

  return (
    <View style={styles.container}>
      <Header
        title="Участники"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск участника..."
            placeholderTextColor={colors.text.secondary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {filterChips.map((chip) => (
          <TouchableOpacity
            key={chip.key}
            style={[styles.filterChip, filter === chip.key && styles.filterChipActive]}
            onPress={() => setFilter(chip.key)}
          >
            <Text
              style={[
                styles.filterChipText,
                filter === chip.key && styles.filterChipTextActive,
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка участников...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ParticipantCard
              item={item}
              onPress={() =>
                navigation.navigate('ParticipantDetail', { participantId: item.id })
              }
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={52} color={colors.text.secondary} />
              <Text style={styles.emptyText}>Участники не найдены</Text>
              {search.trim() !== '' && (
                <TouchableOpacity onPress={() => setSearch('')} style={styles.clearSearchBtn}>
                  <Text style={styles.clearSearchText}>Сбросить поиск</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: colors.text.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
    ...shadows.small,
    marginVertical: 2,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarInitials: {
    ...typography.h3,
    fontWeight: '700',
    fontSize: 18,
  },
  cardContent: {
    flex: 1,
    gap: spacing.xs,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  cardName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    flex: 1,
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.secondary + '18',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
  },
  partnerBadgeText: {
    ...typography.captionSmall,
    color: colors.secondary,
    fontWeight: '600',
  },
  cardTitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  separator: {
    height: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  clearSearchBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  clearSearchText: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '500',
  },
});

export default ParticipantsScreen;
