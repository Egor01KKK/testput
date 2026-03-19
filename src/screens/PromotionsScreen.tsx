import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, PromotionListResource } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { promotionsApi } from '../api/promotions';

type PromotionsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Promotions'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing.md * 2 - spacing.sm) / 2;
const PARTNER_CARD_WIDTH = 240;

const TABS = [
  { key: 'all', label: 'Все предложения' },
  { key: 'partners', label: 'Партнёры' },
  { key: 'foreign', label: 'Иностранные' },
] as const;

type TabKey = typeof TABS[number]['key'];

const mockPromotions: PromotionListResource[] = [
  {
    id: '1',
    name: 'Скидка на тур по Камчатке',
    discount_amount: '20%',
    discount_type: 'percent',
    participant: { id: '1', name: 'Турклуб Камчатка', is_partner: true, logo: undefined },
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
    participant: { id: '2', name: 'РЖД Туризм', is_partner: true, logo: undefined },
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
    participant: { id: '3', name: 'Turkey Tourism', is_partner: false, logo: undefined },
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
    participant: { id: '4', name: 'Санаторий Кавказ', is_partner: false, logo: undefined },
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
    participant: { id: '5', name: 'Алтай Авто', is_partner: false, logo: undefined },
    tourism_type: { id: 'automotive', name: 'Автомобильный' },
    is_foreign: false,
    is_favorite: false,
    is_partner: false,
  },
  {
    id: '6',
    name: 'Культурный тур по Японии',
    discount_amount: '30%',
    discount_type: 'percent',
    participant: { id: '6', name: 'Japan Travel', is_partner: false, logo: undefined },
    tourism_type: { id: 'cultural', name: 'Культурный' },
    is_foreign: true,
    is_favorite: false,
    is_partner: false,
  },
];

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

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

const PromotionsScreen: React.FC = () => {
  const navigation = useNavigation<PromotionsScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [promotions, setPromotions] = useState<PromotionListResource[]>(mockPromotions);
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(mockPromotions.filter((p) => p.is_favorite).map((p) => p.id)),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: { is_foreign?: boolean; partner_only?: boolean } = {};
      if (activeTab === 'foreign') params.is_foreign = true;
      if (activeTab === 'partners') params.partner_only = true;
      const data = await promotionsApi.getPromotions(params);
      if (data && data.length > 0) {
        setPromotions(data);
      }
    } catch {
      // fall back to mock data silently
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  const filtered = promotions.filter((p) => {
    if (activeTab === 'foreign') return p.is_foreign;
    if (activeTab === 'partners') return p.is_partner;
    return true;
  }).filter((p) => {
    if (selectedType === 'all') return true;
    return p.tourism_type?.name === selectedType;
  });

  const partners = promotions.filter((p) => p.is_partner);

  const typeNames = Array.from(
    new Set(promotions.map((p) => p.tourism_type?.name).filter(Boolean) as string[]),
  );

  const handleFavoriteToggle = useCallback(async (id: string) => {
    const nowFav = !favorites.has(id);
    setFavorites((prev) => {
      const next = new Set(prev);
      if (nowFav) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
    try {
      await promotionsApi.toggleFavorite(id, nowFav);
    } catch {
      // revert on error
      setFavorites((prev) => {
        const next = new Set(prev);
        if (nowFav) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    }
  }, [favorites]);

  const renderPartnerCard = ({ item }: { item: PromotionListResource }) => {
    const name = item.participant?.name ?? 'Партнёр';
    const color = avatarColor(item.participant?.id ?? item.id);
    return (
      <TouchableOpacity
        style={styles.partnerCard}
        onPress={() => navigation.navigate('PromotionDetail', { promotionId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.partnerCardInner}>
          <View style={[styles.partnerAvatar, { backgroundColor: color }]}>
            <Text style={styles.partnerAvatarText}>{getInitial(name)}</Text>
          </View>
          <View style={styles.partnerInfo}>
            <View style={styles.partnerBadgeRow}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={styles.partnerBadgeText}>Партнёр форума</Text>
            </View>
            <Text style={styles.partnerName} numberOfLines={2}>{name}</Text>
            {item.discount_amount ? (
              <View style={styles.partnerDiscountBadge}>
                <Text style={styles.partnerDiscountText}>-{item.discount_amount}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPromoCard = ({ item }: { item: PromotionListResource }) => {
    const isFav = favorites.has(item.id);
    const name = item.participant?.name ?? '';
    const color = avatarColor(item.participant?.id ?? item.id);
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
          <View style={styles.promoParticipantRow}>
            <View style={[styles.promoAvatar, { backgroundColor: color }]}>
              <Text style={styles.promoAvatarText}>{getInitial(name)}</Text>
            </View>
            <Text style={styles.promoParticipantName} numberOfLines={1}>
              {name}
            </Text>
            {item.is_partner ? (
              <Ionicons name="star" size={12} color={colors.warning} style={styles.partnerStar} />
            ) : null}
          </View>

          {/* Title */}
          <Text style={styles.promoTitle} numberOfLines={2}>
            {item.name}
          </Text>
        </View>

        {/* Favorite button */}
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={() => handleFavoriteToggle(item.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={20}
            color={isFav ? colors.error : colors.text.secondary}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const showPartnerCarousel = activeTab === 'all' || activeTab === 'partners';

  const ListHeader = (
    <View>
      {/* Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsScroll}
        contentContainerStyle={styles.tabsContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab.key);
              setSelectedType('all');
            }}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Partner carousel */}
      {showPartnerCarousel && partners.length > 0 && (
        <View>
          <Text style={styles.sectionTitle}>Партнёры форума</Text>
          <FlatList
            horizontal
            data={partners}
            renderItem={renderPartnerCard}
            keyExtractor={(item) => `partner-${item.id}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.partnerCarousel}
          />
        </View>
      )}

      {/* Подобрать предложения button */}
      <TouchableOpacity
        style={styles.tinderButton}
        onPress={() => navigation.navigate('TinderSwipe')}
        activeOpacity={0.85}
      >
        <Ionicons name="shuffle-outline" size={20} color={colors.text.white} />
        <Text style={styles.tinderButtonText}>Подобрать предложения</Text>
      </TouchableOpacity>

      {/* Tourism type filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        <TouchableOpacity
          style={[styles.chip, selectedType === 'all' && styles.chipActive]}
          onPress={() => setSelectedType('all')}
        >
          <Text style={[styles.chipText, selectedType === 'all' && styles.chipTextActive]}>
            Все
          </Text>
        </TouchableOpacity>
        {typeNames.map((name) => (
          <TouchableOpacity
            key={name}
            style={[styles.chip, selectedType === name && styles.chipActive]}
            onPress={() => setSelectedType(name)}
          >
            <Text style={[styles.chipText, selectedType === name && styles.chipTextActive]}>
              {name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Акции и скидки</Text>
      </View>

      {loading && promotions.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderPromoCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing.lg }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="pricetag-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyText}>Нет предложений по выбранным фильтрам</Text>
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
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Tabs
  tabsScroll: {
    marginTop: spacing.md,
  },
  tabsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.text.white,
    fontWeight: '600',
  },
  // Partner carousel
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  partnerCarousel: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  partnerCard: {
    width: PARTNER_CARD_WIDTH,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.small,
  },
  partnerCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  partnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  partnerAvatarText: {
    ...typography.h3,
    color: colors.text.white,
    fontWeight: '700',
  },
  partnerInfo: {
    flex: 1,
  },
  partnerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: spacing.xs,
  },
  partnerBadgeText: {
    ...typography.captionSmall,
    color: colors.warning,
    fontWeight: '600',
  },
  partnerName: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  partnerDiscountBadge: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  partnerDiscountText: {
    ...typography.captionSmall,
    color: colors.text.white,
    fontWeight: '700',
  },
  // Tinder button
  tinderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
  },
  tinderButtonText: {
    ...typography.button,
    color: colors.text.white,
    fontWeight: '600',
  },
  // Filter chips
  chipsScroll: {
    marginTop: spacing.md,
  },
  chipsContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.text.white,
    fontWeight: '600',
  },
  // Grid list
  listContent: {
    paddingHorizontal: spacing.md,
  },
  columnWrapper: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  // Promo card
  promoCard: {
    width: CARD_WIDTH,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.small,
  },
  promoCover: {
    width: '100%',
    height: 110,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
    paddingTop: spacing.xs,
  },
  promoParticipantRow: {
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
  promoParticipantName: {
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
  favoriteBtn: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
  // Empty
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});

export default PromotionsScreen;
