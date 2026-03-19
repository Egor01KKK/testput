import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, PromotionListResource } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';

type MyPicksNavigationProp = StackNavigationProp<RootStackParamList, 'MyPicks'>;
type MyPicksRouteProp = RouteProp<RootStackParamList, 'MyPicks'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 2 - spacing.sm) / 2;

const AVATAR_COLORS = [
  '#2196F3', '#4CAF50', '#FF9800', '#9C27B0',
  '#E91E63', '#00BCD4', '#3F51B5', '#F44336',
];

function avatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// Full mock list — used to resolve accepted ids to full objects
const ALL_MOCK_PROMOTIONS: PromotionListResource[] = [
  {
    id: '1',
    name: 'Скидка на тур по Камчатке',
    discount_amount: '20%',
    discount_type: 'percent',
    participant: { id: '1', name: 'Турклуб Камчатка', is_partner: true },
    tourism_type: { id: 'active', name: 'Активный' },
    is_foreign: false,
    is_favorite: false,
    is_partner: true,
  },
  {
    id: '2',
    name: 'Круиз по Волге — специальная цена',
    discount_amount: '5000 ₽',
    discount_type: 'fixed',
    participant: { id: '2', name: 'РЖД Туризм', is_partner: true },
    tourism_type: { id: 'cruise', name: 'Круизный' },
    is_foreign: false,
    is_favorite: false,
    is_partner: true,
  },
  {
    id: '3',
    name: 'Пляжный отдых в Турции',
    discount_amount: '15%',
    discount_type: 'percent',
    participant: { id: '3', name: 'Turkey Tourism', is_partner: false },
    tourism_type: { id: 'beach', name: 'Пляжный' },
    is_foreign: true,
    is_favorite: false,
    is_partner: false,
  },
  {
    id: '4',
    name: 'Оздоровительный тур на Кавказ',
    discount_amount: '10000 ₽',
    discount_type: 'fixed',
    participant: { id: '4', name: 'Санаторий Кавказ', is_partner: false },
    tourism_type: { id: 'wellness', name: 'Оздоровительный' },
    is_foreign: false,
    is_favorite: true,
    is_partner: false,
  },
  {
    id: '5',
    name: 'Автомобильное путешествие по Алтаю',
    discount_amount: '25%',
    discount_type: 'percent',
    participant: { id: '5', name: 'Алтай Авто', is_partner: false },
    tourism_type: { id: 'automotive', name: 'Автомобильный' },
    is_foreign: false,
    is_favorite: false,
    is_partner: false,
  },
  {
    id: '7',
    name: 'Эко-тур по Байкалу',
    discount_amount: '12%',
    discount_type: 'percent',
    participant: { id: '7', name: 'Байкал Трэвел', is_partner: true },
    tourism_type: { id: 'ecological', name: 'Экологический' },
    is_foreign: false,
    is_favorite: false,
    is_partner: true,
  },
];

const MyPicksScreen: React.FC = () => {
  const navigation = useNavigation<MyPicksNavigationProp>();
  const route = useRoute<MyPicksRouteProp>();
  const insets = useSafeAreaInsets();

  // Route params from TinderSwipe carry accepted ids
  const acceptedIdsRaw = (route.params as any)?.accepted as string[] | undefined;
  const acceptedIds: string[] = Array.isArray(acceptedIdsRaw) ? acceptedIdsRaw : [];

  // Resolve accepted ids to full promotion objects
  const acceptedPromotions: PromotionListResource[] = useMemo(() => {
    if (acceptedIds.length === 0) return [];
    const map = new Map(ALL_MOCK_PROMOTIONS.map((p) => [p.id, p]));
    return acceptedIds.map((id) => map.get(id)).filter(Boolean) as PromotionListResource[];
  }, [acceptedIds]);

  const renderCard = ({ item }: { item: PromotionListResource }) => {
    const participantName = item.participant?.name ?? '';
    const participantId = item.participant?.id ?? item.id;
    const color = avatarColor(participantId);

    return (
      <TouchableOpacity
        style={styles.promoCard}
        onPress={() => navigation.navigate('PromotionDetail', { promotionId: item.id })}
        activeOpacity={0.8}
      >
        {/* Cover placeholder */}
        <View style={styles.promoCover}>
          <Ionicons name="image-outline" size={32} color={colors.border} />
          {item.discount_amount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>-{item.discount_amount}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.promoContent}>
          {/* Participant row */}
          <View style={styles.participantRow}>
            <View style={[styles.promoAvatar, { backgroundColor: color }]}>
              <Text style={styles.promoAvatarText}>
                {participantName.trim().charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={styles.participantName} numberOfLines={1}>
              {participantName}
            </Text>
            {item.is_partner ? (
              <Ionicons name="star" size={12} color={colors.warning} style={styles.partnerStar} />
            ) : null}
          </View>

          {/* Title */}
          <Text style={styles.promoTitle} numberOfLines={2}>
            {item.name}
          </Text>

          {/* Discount */}
          {item.discount_amount ? (
            <Text style={styles.discountText}>-{item.discount_amount}</Text>
          ) : null}
        </View>

        {/* Arrow */}
        <View style={styles.cardArrow}>
          <Ionicons name="chevron-forward" size={16} color={colors.text.secondary} />
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = (
    <View style={styles.listHeader}>
      <Text style={styles.title}>Ваша подборка</Text>
      <Text style={styles.subtitle}>
        {acceptedPromotions.length === 0
          ? 'Вы не выбрали ни одного предложения'
          : `Вы выбрали ${acceptedPromotions.length} предложений${acceptedPromotions.length === 1 ? 'е' : ''}`}
      </Text>
    </View>
  );

  const ListEmpty = (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-dislike-outline" size={64} color={colors.border} />
      <Text style={styles.emptyTitle}>Ничего не выбрано</Text>
      <Text style={styles.emptySubtitle}>
        Пройдите подборку ещё раз и выберите понравившиеся предложения
      </Text>
      <TouchableOpacity
        style={styles.tinderBtn}
        onPress={() => navigation.navigate('TinderSwipe')}
        activeOpacity={0.85}
      >
        <Ionicons name="shuffle-outline" size={18} color={colors.text.white} />
        <Text style={styles.tinderBtnText}>Подобрать снова</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.screenHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.screenHeaderTitle}>Мой выбор</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={acceptedPromotions}
        renderItem={renderCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
      />

      {/* Bottom button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={styles.allPromosBtn}
          onPress={() => navigation.navigate('Promotions')}
          activeOpacity={0.85}
        >
          <Ionicons name="pricetag-outline" size={18} color={colors.text.white} />
          <Text style={styles.allPromosBtnText}>Смотреть все скидки</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenHeaderTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  // List header
  listHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  // Grid
  listContent: {
    paddingHorizontal: spacing.md,
  },
  columnWrapper: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  // Card
  promoCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.small,
    position: 'relative',
  },
  promoCover: {
    width: '100%',
    height: 110,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    minWidth: 36,
    alignItems: 'center',
  },
  discountBadgeText: {
    ...typography.captionSmall,
    color: colors.text.white,
    fontWeight: '700',
  },
  promoContent: {
    padding: spacing.sm,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  promoAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  promoAvatarText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.white,
  },
  participantName: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    flex: 1,
  },
  partnerStar: {
    flexShrink: 0,
  },
  promoTitle: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  discountText: {
    ...typography.captionSmall,
    color: colors.secondary,
    fontWeight: '700',
  },
  cardArrow: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  tinderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  tinderBtnText: {
    ...typography.buttonSmall,
    color: colors.text.white,
  },
  // Bottom bar
  bottomBar: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.medium,
  },
  allPromosBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  allPromosBtnText: {
    ...typography.button,
    color: colors.text.white,
    fontWeight: '600',
  },
});

export default MyPicksScreen;
