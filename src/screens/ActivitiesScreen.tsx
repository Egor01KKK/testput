import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, ActivityListResource, FESTIVAL_DATES } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { activities2026Api } from '../api/activities2026';
import { Header } from '../components/common';

type ActivitiesNavigationProp = StackNavigationProp<RootStackParamList, 'Activities'>;

const FESTIVAL_DATES_2026 = [...FESTIVAL_DATES] as string[];

const mockActivities: ActivityListResource[] = [
  {
    id: '1',
    name: 'Мастер-класс по горному треккингу',
    activity_type: { id: '1', name: 'Мастер-класс' },
    event_slots: [{ id: '1', date: '2026-06-10', time_start: '10:00', time_end: '11:30' }],
    participant: { id: '1', name: 'Камчатский край', is_partner: false },
    is_favorite: false,
  },
  {
    id: '2',
    name: 'Лекция «Круизный туризм 2026»',
    activity_type: { id: '2', name: 'Лекция' },
    event_slots: [{ id: '2', date: '2026-06-10', time_start: '12:00', time_end: '13:00' }],
    participant: { id: '2', name: 'РЖД', is_partner: true },
    is_favorite: false,
  },
  {
    id: '3',
    name: 'Дегустация региональной кухни',
    activity_type: { id: '3', name: 'Дегустация' },
    event_slots: [{ id: '3', date: '2026-06-11', time_start: '14:00', time_end: '15:00' }],
    participant: { id: '3', name: 'Алтай', is_partner: false },
    is_favorite: false,
  },
];

const TYPE_COLORS: Record<string, string> = {
  'Мастер-класс': '#9C27B0',
  'Лекция': '#2196F3',
  'Дегустация': '#FF9800',
  'Шоу': '#E91E63',
  'Экскурсия': '#4CAF50',
};

const getTypeColor = (typeName?: string): string => {
  if (!typeName) return colors.primary;
  return TYPE_COLORS[typeName] ?? colors.primary;
};

const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

const formatDateLabel = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  });
};

interface ActivityCardProps {
  item: ActivityListResource;
  onPress: () => void;
  onFavoriteToggle: (id: string, current: boolean) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ item, onPress, onFavoriteToggle }) => {
  const firstSlot = item.event_slots?.[0];
  const typeColor = getTypeColor(item.activity_type?.name);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.75}>
      <View style={styles.cardLeft}>
        {/* Time */}
        {firstSlot && (
          <View style={styles.timeBlock}>
            <Text style={styles.timeStart}>{firstSlot.time_start}</Text>
            <Text style={styles.timeEnd}>{firstSlot.time_end}</Text>
          </View>
        )}
        <View style={[styles.timeLine, { backgroundColor: typeColor }]} />
      </View>

      <View style={styles.cardBody}>
        {/* Type chip */}
        {item.activity_type && (
          <View style={[styles.typeChip, { backgroundColor: typeColor + '18' }]}>
            <Text style={[styles.typeChipText, { color: typeColor }]}>
              {item.activity_type.name}
            </Text>
          </View>
        )}

        <Text style={styles.activityName} numberOfLines={2}>
          {item.name}
        </Text>

        {item.participant && (
          <View style={styles.participantRow}>
            <Ionicons name="business-outline" size={13} color={colors.text.secondary} />
            <Text style={styles.participantName} numberOfLines={1}>
              {item.participant.name}
            </Text>
            {item.participant.is_partner && (
              <View style={styles.partnerDot} />
            )}
          </View>
        )}
      </View>

      {/* Favorite button */}
      <TouchableOpacity
        style={styles.favoriteBtn}
        onPress={() => onFavoriteToggle(item.id, !!item.is_favorite)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name={item.is_favorite ? 'heart' : 'heart-outline'}
          size={22}
          color={item.is_favorite ? colors.error : colors.text.secondary}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const ActivitiesScreen: React.FC = () => {
  const navigation = useNavigation<ActivitiesNavigationProp>();
  const insets = useSafeAreaInsets();

  const [activities, setActivities] = useState<ActivityListResource[]>(mockActivities);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>(FESTIVAL_DATES_2026[0]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await activities2026Api.getActivities();
        if (data.length > 0) {
          setActivities(data);
        }
      } catch {
        // keep mock data
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) =>
      activity.event_slots?.some((slot) => slot.date === selectedDate)
    );
  }, [activities, selectedDate]);

  const handleFavoriteToggle = useCallback(async (id: string, current: boolean) => {
    // Optimistic update
    setActivities((prev) =>
      prev.map((a) => (a.id === id ? { ...a, is_favorite: !current } : a))
    );
    try {
      await activities2026Api.toggleFavorite(id, !current);
    } catch {
      // Revert on error
      setActivities((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_favorite: current } : a))
      );
    }
  }, []);

  return (
    <View style={styles.container}>
      <Header
        title="Активности"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* Date filter chips */}
      <View style={styles.dateFilterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateFilterContent}
        >
          {FESTIVAL_DATES_2026.map((date) => (
            <TouchableOpacity
              key={date}
              style={[styles.dateChip, selectedDate === date && styles.dateChipActive]}
              onPress={() => setSelectedDate(date)}
            >
              <Text
                style={[
                  styles.dateChipText,
                  selectedDate === date && styles.dateChipTextActive,
                ]}
              >
                {formatDateShort(date)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Date label */}
      <View style={styles.dateLabelRow}>
        <Ionicons name="calendar-outline" size={16} color={colors.text.secondary} />
        <Text style={styles.dateLabelText}>{formatDateLabel(selectedDate)}</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка активностей...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredActivities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ActivityCard
              item={item}
              onPress={() =>
                navigation.navigate('ActivityDetail2026', { activityId: item.id })
              }
              onFavoriteToggle={handleFavoriteToggle}
            />
          )}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={52} color={colors.text.secondary} />
              <Text style={styles.emptyText}>Нет активностей в этот день</Text>
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
  dateFilterWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dateFilterContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  dateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateChipText: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '500',
  },
  dateChipTextActive: {
    color: colors.text.white,
  },
  dateLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  dateLabelText: {
    ...typography.caption,
    color: colors.text.secondary,
    textTransform: 'capitalize',
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
    paddingTop: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadows.small,
  },
  cardLeft: {
    width: 64,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingLeft: spacing.sm,
    gap: spacing.xs,
  },
  timeBlock: {
    alignItems: 'center',
  },
  timeStart: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '700',
  },
  timeEnd: {
    ...typography.captionSmall,
    color: colors.text.secondary,
  },
  timeLine: {
    flex: 1,
    width: 3,
    borderRadius: 2,
    minHeight: 16,
    marginTop: spacing.xs,
  },
  cardBody: {
    flex: 1,
    padding: spacing.md,
    paddingLeft: spacing.sm,
    gap: spacing.xs,
  },
  typeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
  },
  typeChipText: {
    ...typography.captionSmall,
    fontWeight: '600',
  },
  activityName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
    lineHeight: 22,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  participantName: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    flex: 1,
  },
  partnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.secondary,
  },
  favoriteBtn: {
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
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
});

export default ActivitiesScreen;
