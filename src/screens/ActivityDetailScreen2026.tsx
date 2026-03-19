import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, ActivityDetailResource, EventSlot } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { activities2026Api } from '../api/activities2026';
import { Header } from '../components/common';

type ActivityDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ActivityDetail2026'>;
type ActivityDetailRouteProp = RouteProp<RootStackParamList, 'ActivityDetail2026'>;

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

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'short',
  });
};

const SlotRow: React.FC<{ slot: EventSlot }> = ({ slot }) => (
  <View style={styles.slotRow}>
    <View style={styles.slotIconContainer}>
      <Ionicons name="time-outline" size={18} color={colors.primary} />
    </View>
    <View style={styles.slotInfo}>
      <Text style={styles.slotDate}>{formatDate(slot.date)}</Text>
      <Text style={styles.slotTime}>
        {slot.time_start} — {slot.time_end}
      </Text>
    </View>
  </View>
);

const ActivityDetailScreen2026: React.FC = () => {
  const navigation = useNavigation<ActivityDetailNavigationProp>();
  const route = useRoute<ActivityDetailRouteProp>();
  const insets = useSafeAreaInsets();

  const { activityId } = route.params;

  const [activity, setActivity] = useState<ActivityDetailResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await activities2026Api.getActivityById(activityId);
        setActivity(data);
        setIsFavorite(!!data.is_favorite);
      } catch {
        setError('Не удалось загрузить информацию об активности');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activityId]);

  const handleFavoriteToggle = useCallback(async () => {
    if (!activity || favoriteLoading) return;
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    setFavoriteLoading(true);
    try {
      await activities2026Api.toggleFavorite(activity.id, newValue);
    } catch {
      setIsFavorite(!newValue);
    } finally {
      setFavoriteLoading(false);
    }
  }, [activity, isFavorite, favoriteLoading]);

  const handleRegister = async () => {
    if (!activity?.registration_link) return;
    try {
      const supported = await Linking.canOpenURL(activity.registration_link);
      if (supported) {
        await Linking.openURL(activity.registration_link);
      } else {
        Alert.alert('Ошибка', 'Не удалось открыть ссылку для регистрации');
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось открыть ссылку для регистрации');
    }
  };

  const handleFindOnMap = () => {
    if (!activity) return;
    navigation.navigate('Map', { standId: activity.participant?.id ?? activity.id });
  };

  const typeColor = getTypeColor(activity?.activity_type?.name);

  const FavoriteButton = (
    <TouchableOpacity
      onPress={handleFavoriteToggle}
      style={styles.headerFavoriteBtn}
      disabled={favoriteLoading}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons
        name={isFavorite ? 'heart' : 'heart-outline'}
        size={24}
        color={isFavorite ? colors.error : colors.primary}
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Активность"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </View>
    );
  }

  if (error || !activity) {
    return (
      <View style={styles.container}>
        <Header
          title="Активность"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={56} color={colors.error} />
          <Text style={styles.errorText}>{error ?? 'Активность не найдена'}</Text>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.outlineBtnText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const participantAvatarColor = activity.participant
    ? getAvatarColor(activity.participant.id)
    : colors.primary;

  return (
    <View style={styles.container}>
      <Header
        title={activity.name}
        showBackButton
        onBackPress={() => navigation.goBack()}
        rightComponent={FavoriteButton}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero section */}
        <View style={[styles.heroSection, { borderLeftColor: typeColor }]}>
          {/* Type chip */}
          {activity.activity_type && (
            <View style={[styles.typeChip, { backgroundColor: typeColor + '18' }]}>
              <Text style={[styles.typeChipText, { color: typeColor }]}>
                {activity.activity_type.name}
              </Text>
            </View>
          )}

          {/* Title */}
          <Text style={styles.activityTitle}>{activity.name}</Text>
        </View>

        {/* Schedule section */}
        {activity.event_slots && activity.event_slots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Расписание</Text>
            <View style={styles.slotsContainer}>
              {activity.event_slots.map((slot) => (
                <SlotRow key={slot.id} slot={slot} />
              ))}
            </View>
          </View>
        )}

        {/* Participant section */}
        {activity.participant && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Организатор</Text>
            <TouchableOpacity
              style={styles.participantCard}
              onPress={() =>
                navigation.navigate('ParticipantDetail', {
                  participantId: activity.participant!.id,
                })
              }
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.participantAvatar,
                  { backgroundColor: participantAvatarColor + '22' },
                ]}
              >
                {activity.participant.logo ? (
                  <Image
                    source={{ uri: activity.participant.logo }}
                    style={styles.participantLogoImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text
                    style={[styles.participantAvatarText, { color: participantAvatarColor }]}
                  >
                    {getInitials(activity.participant.name)}
                  </Text>
                )}
              </View>
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{activity.participant.name}</Text>
                {activity.participant.title && (
                  <Text style={styles.participantTitle}>{activity.participant.title}</Text>
                )}
                {activity.participant.is_partner && (
                  <View style={styles.partnerBadge}>
                    <Ionicons name="star" size={11} color={colors.secondary} />
                    <Text style={styles.partnerBadgeText}>Партнёр</Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Description */}
        {activity.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Описание</Text>
            <Text style={styles.descriptionText}>{activity.description}</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionsSection}>
          {activity.registration_link && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add-outline" size={20} color={colors.text.white} />
              <Text style={styles.primaryBtnText}>Зарегистрироваться</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleFindOnMap}
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={20} color={colors.primary} />
            <Text style={styles.secondaryBtnText}>Найти на карте</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.favoriteActionBtn, isFavorite && styles.favoriteActionBtnActive]}
            onPress={handleFavoriteToggle}
            activeOpacity={0.8}
            disabled={favoriteLoading}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.text.white : colors.error}
            />
            <Text
              style={[
                styles.favoriteActionBtnText,
                isFavorite && styles.favoriteActionBtnTextActive,
              ]}
            >
              {isFavorite ? 'В избранном' : 'Добавить в избранное'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  outlineBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginTop: spacing.sm,
  },
  outlineBtnText: {
    ...typography.buttonSmall,
    color: colors.primary,
  },
  headerFavoriteBtn: {
    padding: spacing.xs,
  },
  // Hero
  heroSection: {
    padding: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  typeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  typeChipText: {
    ...typography.caption,
    fontWeight: '700',
  },
  activityTitle: {
    ...typography.h2,
    color: colors.text.primary,
    lineHeight: 38,
  },
  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  // Slots
  slotsContainer: {
    gap: spacing.sm,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  slotInfo: {
    flex: 1,
    gap: 2,
  },
  slotDate: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  slotTime: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
  },
  // Participant card
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  participantAvatar: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  participantLogoImage: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
  },
  participantAvatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  participantInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  participantName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '600',
  },
  participantTitle: {
    ...typography.captionSmall,
    color: colors.text.secondary,
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
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
  // Description
  descriptionText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  // Actions
  actionsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.small,
  },
  primaryBtnText: {
    ...typography.buttonSmall,
    color: colors.text.white,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  secondaryBtnText: {
    ...typography.buttonSmall,
    color: colors.primary,
  },
  favoriteActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.error,
  },
  favoriteActionBtnActive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  favoriteActionBtnText: {
    ...typography.buttonSmall,
    color: colors.error,
  },
  favoriteActionBtnTextActive: {
    color: colors.text.white,
  },
});

export default ActivityDetailScreen2026;
