import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, StandDetailResource } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { stands2026Api } from '../api/stands2026';

type StandDetailNavigationProp = StackNavigationProp<RootStackParamList, 'StandDetail'>;
type StandDetailRouteProp = RouteProp<RootStackParamList, 'StandDetail'>;

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

const StandDetailScreen: React.FC = () => {
  const navigation = useNavigation<StandDetailNavigationProp>();
  const route = useRoute<StandDetailRouteProp>();
  const insets = useSafeAreaInsets();

  const { standId } = route.params;

  const [stand, setStand] = useState<StandDetailResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await stands2026Api.getStandById(standId);
        setStand(data);
      } catch (err) {
        setError('Не удалось загрузить информацию о стенде');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [standId]);

  const headerColor = stand?.zone?.color ?? colors.primary;

  if (loading) {
    return (
      <View style={styles.fullscreenCenter}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  if (error || !stand) {
    return (
      <View style={styles.fullscreenCenter}>
        <Ionicons name="alert-circle-outline" size={56} color={colors.error} />
        <Text style={styles.errorText}>{error ?? 'Стенд не найден'}</Text>
        <TouchableOpacity style={styles.backBtnOutline} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnOutlineText}>Назад</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Colored header */}
      <View style={[styles.coloredHeader, { backgroundColor: headerColor, paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {stand.name}
          </Text>
          <View style={styles.headerPlaceholder} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stand hero section */}
        <View style={styles.heroSection}>
          {/* Zone chip */}
          {stand.zone && (
            <View style={[styles.zoneChip, { backgroundColor: stand.zone.color + '22' }]}>
              <View style={[styles.zoneChipDot, { backgroundColor: stand.zone.color }]} />
              <Text style={[styles.zoneChipText, { color: stand.zone.color }]}>
                {stand.zone.name}
              </Text>
            </View>
          )}

          {/* Stand number */}
          {stand.number && (
            <Text style={styles.standNumber}>Стенд {stand.number}</Text>
          )}

          {/* Participant logo placeholder */}
          {stand.participant && (
            <View style={styles.participantRow}>
              <View style={[styles.logoBubble, { backgroundColor: headerColor + '22' }]}>
                {stand.participant.logo ? (
                  <Image
                    source={{ uri: stand.participant.logo }}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Text style={[styles.logoInitials, { color: headerColor }]}>
                    {getInitials(stand.participant.name)}
                  </Text>
                )}
              </View>
              <View style={styles.participantInfo}>
                <Text style={styles.participantName}>{stand.participant.name}</Text>
                {stand.participant.title && (
                  <Text style={styles.participantTitle}>{stand.participant.title}</Text>
                )}
                {stand.participant.is_partner && (
                  <View style={styles.partnerBadge}>
                    <Ionicons name="star" size={12} color={colors.secondary} />
                    <Text style={styles.partnerBadgeText}>Партнёр</Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Description */}
        {stand.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>О стенде</Text>
            <Text style={styles.descriptionText}>{stand.description}</Text>
          </View>
        )}

        {/* Promotions */}
        {stand.promotions && stand.promotions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Акции и предложения</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {stand.promotions.map((promo) => (
                <TouchableOpacity
                  key={promo.id}
                  style={styles.promoCard}
                  onPress={() => navigation.navigate('PromotionDetail', { promotionId: promo.id })}
                  activeOpacity={0.75}
                >
                  <View style={styles.promoIconContainer}>
                    <Ionicons name="pricetag-outline" size={24} color={colors.secondary} />
                  </View>
                  <Text style={styles.promoName} numberOfLines={2}>
                    {promo.name}
                  </Text>
                  {promo.discount_amount && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{promo.discount_amount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Activities */}
        {stand.activities && stand.activities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Активности</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {stand.activities.map((activity) => {
                const firstSlot = activity.event_slots?.[0];
                return (
                  <TouchableOpacity
                    key={activity.id}
                    style={styles.activityCard}
                    onPress={() =>
                      navigation.navigate('ActivityDetail2026', { activityId: activity.id })
                    }
                    activeOpacity={0.75}
                  >
                    <View style={styles.activityIconContainer}>
                      <Ionicons name="calendar-outline" size={22} color={colors.primary} />
                    </View>
                    <Text style={styles.activityName} numberOfLines={2}>
                      {activity.name}
                    </Text>
                    {firstSlot && (
                      <Text style={styles.activityTime}>
                        {firstSlot.time_start}–{firstSlot.time_end}
                      </Text>
                    )}
                    {activity.activity_type && (
                      <View style={styles.activityTypeChip}>
                        <Text style={styles.activityTypeText}>
                          {activity.activity_type.name}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Tourism types */}
        {stand.tourism_types && stand.tourism_types.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Виды туризма</Text>
            <View style={styles.chipsWrap}>
              {stand.tourism_types.map((tt) => (
                <View key={tt.id} style={styles.typeChip}>
                  <Text style={styles.typeChipText}>{tt.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Find on map button */}
        <View style={styles.mapButtonContainer}>
          <TouchableOpacity
            style={styles.mapButton}
            onPress={() => navigation.navigate('Map', { standId: stand.id })}
            activeOpacity={0.8}
          >
            <Ionicons name="map-outline" size={20} color={colors.text.white} />
            <Text style={styles.mapButtonText}>Найти на карте</Text>
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
  fullscreenCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  backBtnOutline: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  backBtnOutlineText: {
    ...typography.buttonSmall,
    color: colors.primary,
  },
  // Colored header
  coloredHeader: {
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    paddingHorizontal: spacing.md,
  },
  backButton: {
    padding: spacing.xs,
    marginRight: spacing.sm,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.white,
    flex: 1,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 32,
  },
  // Scroll content
  scrollView: {
    flex: 1,
  },
  heroSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  zoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
  },
  zoneChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  zoneChipText: {
    ...typography.captionSmall,
    fontWeight: '600',
  },
  standNumber: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  logoBubble: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
  },
  logoInitials: {
    ...typography.h3,
    fontWeight: '700',
  },
  participantInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  participantName: {
    ...typography.h3,
    color: colors.text.primary,
  },
  participantTitle: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
  },
  partnerBadgeText: {
    ...typography.captionSmall,
    color: colors.secondary,
    fontWeight: '600',
  },
  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  descriptionText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  // Horizontal lists
  horizontalList: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  promoCard: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.small,
  },
  promoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.secondary + '18',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoName: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  discountBadge: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignSelf: 'flex-start',
  },
  discountText: {
    ...typography.captionSmall,
    color: colors.text.white,
    fontWeight: '700',
  },
  activityCard: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.small,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityName: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '500',
  },
  activityTime: {
    ...typography.captionSmall,
    color: colors.text.secondary,
  },
  activityTypeChip: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
  },
  activityTypeText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '500',
  },
  // Tourism type chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  // Map button
  mapButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.small,
  },
  mapButtonText: {
    ...typography.buttonSmall,
    color: colors.text.white,
  },
});

export default StandDetailScreen;
