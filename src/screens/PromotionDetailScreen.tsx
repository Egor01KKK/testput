import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Clipboard,
  Alert,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, PromotionDetailResource } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { promotionsApi } from '../api/promotions';

type PromotionDetailNavigationProp = StackNavigationProp<RootStackParamList, 'PromotionDetail'>;
type PromotionDetailRouteProp = RouteProp<RootStackParamList, 'PromotionDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_HEIGHT = 200;
const AVATAR_SIZE = 72;

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

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

function formatTimeRange(start: string, end: string): string {
  return `${start}–${end}`;
}

// Fallback mock data (mirrors first mock promo)
const FALLBACK_DETAIL: PromotionDetailResource = {
  id: '1',
  name: 'Скидка на тур по Камчатке',
  discount_amount: '20%',
  discount_type: 'percent',
  participant: { id: '1', name: 'Турклуб Камчатка', is_partner: true, logo: undefined },
  tourism_type: { id: 'active', name: 'Активный' },
  is_foreign: false,
  is_favorite: false,
  is_partner: true,
  description:
    'Уникальная возможность посетить полуостров Камчатка со скидкой 20% от крупнейшего туристического клуба региона. '
    + 'В программе: восхождение на вулканы, рыбалка на диких реках, горячие источники и знакомство с культурой коренных народов.',
  code: 'KAMCHATKA2026',
  contacts: '+7 (415) 241-00-00\ninfo@kamchatka-club.ru',
  event_slots: [
    { id: 's1', date: '2026-06-10', time_start: '10:00', time_end: '11:30' },
    { id: 's2', date: '2026-06-11', time_start: '14:00', time_end: '15:30' },
  ],
};

const PromotionDetailScreen: React.FC = () => {
  const navigation = useNavigation<PromotionDetailNavigationProp>();
  const route = useRoute<PromotionDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const { promotionId } = route.params;

  const [promotion, setPromotion] = useState<PromotionDetailResource | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await promotionsApi.getPromotionById(promotionId);
        if (!cancelled) {
          setPromotion(data);
          setIsFavorite(data.is_favorite ?? false);
        }
      } catch {
        if (!cancelled) {
          // Use fallback data for demo
          setPromotion({ ...FALLBACK_DETAIL, id: promotionId });
          setIsFavorite(FALLBACK_DETAIL.is_favorite ?? false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [promotionId]);

  const handleFavorite = useCallback(async () => {
    if (!promotion || favLoading) return;
    setFavLoading(true);
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      await promotionsApi.toggleFavorite(promotion.id, next);
    } catch {
      setIsFavorite(!next);
    } finally {
      setFavLoading(false);
    }
  }, [promotion, isFavorite, favLoading]);

  const handleCopyCode = useCallback((code: string) => {
    Clipboard.setString(code);
    Alert.alert('Скопировано', 'Промокод скопирован в буфер обмена');
  }, []);

  const handleClaim = useCallback(() => {
    if (!promotion) return;
    navigation.navigate('PromotionClaim', {
      promotionId: promotion.id,
      promotionName: promotion.name,
    });
  }, [navigation, promotion]);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </View>
    );
  }

  if (error || !promotion) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingHeader}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
          <Text style={styles.errorText}>Не удалось загрузить предложение</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => {}}>
            <Text style={styles.retryText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const participantName = promotion.participant?.name ?? 'Участник';
  const participantId = promotion.participant?.id ?? promotion.id;
  const accentColor = promotion.is_partner ? colors.secondary : colors.primary;
  const bgColor = avatarColor(participantId);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Colored header */}
      <View style={[styles.colorHeader, { backgroundColor: accentColor }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.white} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.favHeaderBtn} onPress={handleFavorite} disabled={favLoading}>
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={colors.text.white}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar overlapping header */}
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatarCircle, { backgroundColor: bgColor }]}>
            <Text style={styles.avatarInitial}>{getInitial(participantName)}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Partner badge */}
          {promotion.is_partner && (
            <View style={styles.partnerBadge}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={styles.partnerBadgeText}>Официальный партнёр</Text>
            </View>
          )}

          {/* Participant name */}
          <Text style={styles.participantName}>{participantName}</Text>

          {/* Promotion name */}
          <Text style={styles.promoName}>{promotion.name}</Text>

          {/* Discount amount */}
          {promotion.discount_amount ? (
            <Text style={[styles.discountAmount, { color: accentColor }]}>
              -{promotion.discount_amount}
            </Text>
          ) : null}

          {/* Promo code */}
          {promotion.code ? (
            <View style={styles.codeBox}>
              <View style={styles.codeBoxLeft}>
                <Text style={styles.codeLabel}>Промокод</Text>
                <Text style={styles.codeValue}>{promotion.code}</Text>
              </View>
              <TouchableOpacity
                style={styles.copyBtn}
                onPress={() => handleCopyCode(promotion.code!)}
              >
                <Ionicons name="copy-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Description */}
          {promotion.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Описание</Text>
              <Text style={styles.descriptionText}>{promotion.description}</Text>
            </View>
          ) : null}

          {/* Event slots */}
          {promotion.event_slots && promotion.event_slots.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Расписание</Text>
              {promotion.event_slots.map((slot) => (
                <View key={slot.id} style={styles.slotRow}>
                  <View style={styles.slotDateBadge}>
                    <Ionicons name="calendar-outline" size={14} color={colors.primary} />
                    <Text style={styles.slotDate}>{formatDate(slot.date)}</Text>
                  </View>
                  <Text style={styles.slotTime}>
                    {formatTimeRange(slot.time_start, slot.time_end)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Photos gallery placeholder */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Фотографии</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photosRow}
            >
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.photoPlaceholder}>
                  <Ionicons name="image-outline" size={28} color={colors.border} />
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Info rows */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Информация</Text>
            {promotion.tourism_type ? (
              <View style={styles.infoRow}>
                <Ionicons name="compass-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.infoLabel}>Вид туризма:</Text>
                <Text style={styles.infoValue}>{promotion.tourism_type.name}</Text>
              </View>
            ) : null}
            {promotion.region ? (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.infoLabel}>Регион:</Text>
                <Text style={styles.infoValue}>{promotion.region.name}</Text>
              </View>
            ) : null}
            {promotion.country ? (
              <View style={styles.infoRow}>
                <Ionicons name="flag-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.infoLabel}>Страна:</Text>
                <Text style={styles.infoValue}>{promotion.country.name}</Text>
              </View>
            ) : null}
            {promotion.contacts ? (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={16} color={colors.text.secondary} />
                <Text style={styles.infoLabel}>Контакты:</Text>
                <Text style={styles.infoValue}>{promotion.contacts}</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[styles.claimButton, { backgroundColor: colors.secondary }]}
          onPress={handleClaim}
          activeOpacity={0.85}
        >
          <Text style={styles.claimButtonText}>Получить скидку</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.favBottomBtn}
          onPress={handleFavorite}
          disabled={favLoading}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={26}
            color={isFavorite ? colors.error : colors.text.secondary}
          />
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  loadingHeader: {
    height: HEADER_HEIGHT,
    backgroundColor: colors.primary,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
  },
  retryText: {
    ...typography.buttonSmall,
    color: colors.text.white,
  },
  // Header
  colorHeader: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Avatar overlap
  avatarWrapper: {
    alignItems: 'center',
    marginTop: -(AVATAR_SIZE / 2),
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.background,
    ...shadows.medium,
  },
  avatarInitial: {
    ...typography.h2,
    color: colors.text.white,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
    marginTop: -HEADER_HEIGHT + spacing.md,
  },
  body: {
    paddingHorizontal: spacing.md,
  },
  // Partner badge
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
    backgroundColor: '#FFF8E1',
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  partnerBadgeText: {
    ...typography.captionSmall,
    color: colors.warning,
    fontWeight: '700',
  },
  participantName: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  promoName: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  discountAmount: {
    fontSize: 40,
    lineHeight: 48,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  // Promo code
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  codeBoxLeft: {
    flex: 1,
  },
  codeLabel: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  codeValue: {
    ...typography.h3,
    color: colors.primary,
    fontWeight: '700',
    letterSpacing: 2,
  },
  copyBtn: {
    padding: spacing.sm,
  },
  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  // Slots
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.md,
  },
  slotDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  slotDate: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  slotTime: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  // Photos
  photosRow: {
    gap: spacing.sm,
  },
  photoPlaceholder: {
    width: 120,
    height: 90,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    width: 100,
    flexShrink: 0,
  },
  infoValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
    flex: 1,
    fontWeight: '500',
  },
  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.medium,
  },
  claimButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimButtonText: {
    ...typography.button,
    color: colors.text.white,
    fontWeight: '600',
  },
  favBottomBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PromotionDetailScreen;
