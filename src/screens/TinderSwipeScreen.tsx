import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions,
  ActivityIndicator,
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

type TinderSwipeNavigationProp = StackNavigationProp<RootStackParamList, 'TinderSwipe'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - spacing.xl * 2;
const SWIPE_THRESHOLD = 80;
const ROTATION_FACTOR = 0.08;

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

const mockPartnerPromos: PromotionListResource[] = [
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
    name: 'Эко-тур по Байкалу',
    discount_amount: '12%',
    discount_type: 'percent',
    participant: { id: '7', name: 'Байкал Трэвел', is_partner: true },
    tourism_type: { id: 'ecological', name: 'Экологический' },
    is_foreign: false,
    is_favorite: false,
    is_partner: true,
  },
  {
    id: '4',
    name: 'Семейный отдых в Сочи',
    discount_amount: '8000 ₽',
    discount_type: 'fixed',
    participant: { id: '8', name: 'Курорты Кубани', is_partner: true },
    tourism_type: { id: 'family', name: 'Семейный' },
    is_foreign: false,
    is_favorite: false,
    is_partner: true,
  },
  {
    id: '5',
    name: 'Горный маршрут по Кавказу',
    discount_amount: '15%',
    discount_type: 'percent',
    participant: { id: '9', name: 'Альпинист Про', is_partner: true },
    tourism_type: { id: 'active', name: 'Активный' },
    is_foreign: false,
    is_favorite: false,
    is_partner: true,
  },
];

const TinderSwipeScreen: React.FC = () => {
  const navigation = useNavigation<TinderSwipeNavigationProp>();
  const insets = useSafeAreaInsets();

  const [cards, setCards] = useState<PromotionListResource[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [acceptedIds, setAcceptedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Animated values for the top card
  const position = useRef(new Animated.ValueXY()).current;
  const nextCardScale = useRef(new Animated.Value(0.95)).current;
  const nextCardOpacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await promotionsApi.getPromotions({ partner_only: true, limit: 10 });
        if (!cancelled && data && data.length > 0) {
          setCards(data);
        } else if (!cancelled) {
          setCards(mockPartnerPromos);
        }
      } catch {
        if (!cancelled) setCards(mockPartnerPromos);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
    Animated.spring(nextCardScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
    Animated.spring(nextCardOpacity, {
      toValue: 0.7,
      useNativeDriver: true,
    }).start();
  }, [position, nextCardScale, nextCardOpacity]);

  const finishSwipe = useCallback(
    async (direction: 'left' | 'right', card: PromotionListResource) => {
      const toX = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
      const action = direction === 'right' ? 'accept' : 'skip';

      Animated.parallel([
        Animated.timing(position, {
          toValue: { x: toX, y: 0 },
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(nextCardScale, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(nextCardOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (direction === 'right') {
          setAcceptedIds((prev) => [...prev, card.id]);
        }
        position.setValue({ x: 0, y: 0 });
        nextCardScale.setValue(0.95);
        nextCardOpacity.setValue(0.7);
        setCurrentIndex((prev) => {
          const next = prev + 1;
          return next;
        });
      });

      setActionLoading(true);
      try {
        await promotionsApi.swipePromotion(card.id, action);
      } catch {
        // silently ignore API errors
      } finally {
        setActionLoading(false);
      }
    },
    [position, nextCardScale, nextCardOpacity],
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy * 0.3 });
        const progress = Math.min(Math.abs(gestureState.dx) / SWIPE_THRESHOLD, 1);
        nextCardScale.setValue(0.95 + progress * 0.05);
        nextCardOpacity.setValue(0.7 + progress * 0.3);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > SWIPE_THRESHOLD) {
          // Will be handled after ref check — store gesture for callback
          // We need to call finishSwipe but we need current card
          // Emit custom event instead
          (panResponder as any).__onSwipeRight?.();
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          (panResponder as any).__onSwipeLeft?.();
        } else {
          (panResponder as any).__onReset?.();
        }
      },
    }),
  ).current;

  // Attach callbacks after every render since currentIndex changes
  const currentCard = cards[currentIndex];
  (panResponder as any).__onSwipeRight = currentCard
    ? () => finishSwipe('right', currentCard)
    : null;
  (panResponder as any).__onSwipeLeft = currentCard
    ? () => finishSwipe('left', currentCard)
    : null;
  (panResponder as any).__onReset = resetPosition;

  const handleSkip = useCallback(() => {
    if (!currentCard || actionLoading) return;
    finishSwipe('left', currentCard);
  }, [currentCard, actionLoading, finishSwipe]);

  const handleAccept = useCallback(() => {
    if (!currentCard || actionLoading) return;
    finishSwipe('right', currentCard);
  }, [currentCard, actionLoading, finishSwipe]);

  const handleSave = useCallback(() => {
    // Save is a softer "accept" — same direction but different visual cue
    if (!currentCard || actionLoading) return;
    finishSwipe('right', currentCard);
  }, [currentCard, actionLoading, finishSwipe]);

  const handleSkipAll = useCallback(() => {
    navigation.navigate('Promotions');
  }, [navigation]);

  // Navigate to MyPicks when all cards are done
  useEffect(() => {
    if (!loading && cards.length > 0 && currentIndex >= cards.length) {
      navigation.replace('MyPicks', { accepted: acceptedIds });
    }
  }, [currentIndex, cards.length, loading, navigation, acceptedIds]);

  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: [`-${SCREEN_WIDTH * ROTATION_FACTOR}deg`, '0deg', `${SCREEN_WIDTH * ROTATION_FACTOR}deg`],
    extrapolate: 'clamp',
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderCard = (item: PromotionListResource, index: number) => {
    const isTop = index === currentIndex;
    const isNext = index === currentIndex + 1;

    if (!isTop && !isNext) return null;

    const participantName = item.participant?.name ?? 'Участник';
    const participantId = item.participant?.id ?? item.id;
    const color = avatarColor(participantId);

    if (isTop) {
      const cardStyle = [
        styles.card,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { rotate },
          ],
        },
      ];

      return (
        <Animated.View key={item.id} style={cardStyle} {...panResponder.panHandlers}>
          {/* Like overlay */}
          <Animated.View style={[styles.stampOverlay, styles.likeStamp, { opacity: likeOpacity }]}>
            <Text style={styles.likeStampText}>БЕРУ!</Text>
          </Animated.View>
          {/* Nope overlay */}
          <Animated.View style={[styles.stampOverlay, styles.nopeStamp, { opacity: nopeOpacity }]}>
            <Text style={styles.nopeStampText}>ПРОПУСК</Text>
          </Animated.View>

          <CardContent item={item} participantName={participantName} color={color} />
        </Animated.View>
      );
    }

    // Next card (underneath)
    return (
      <Animated.View
        key={item.id}
        style={[
          styles.card,
          styles.nextCard,
          {
            transform: [{ scale: nextCardScale }],
            opacity: nextCardOpacity,
          },
        ]}
      >
        <CardContent item={item} participantName={participantName} color={color} />
      </Animated.View>
    );
  };

  const total = cards.length;
  const current = Math.min(currentIndex + 1, total);

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Подборка для вас</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Подбираем предложения...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Подборка для вас</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {current} из {total}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${total > 0 ? (current / total) * 100 : 0}%` },
            ]}
          />
        </View>
      </View>

      {/* Card stack */}
      <View style={styles.cardStack}>
        {cards
          .slice(0, currentIndex + 2)
          .reverse()
          .map((item, reversedIndex) => {
            const realIndex = currentIndex + 1 - reversedIndex;
            return renderCard(item, realIndex);
          })}
      </View>

      {/* Action buttons */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.skipBtn]}
          onPress={handleSkip}
          disabled={actionLoading || !currentCard}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={28} color={colors.error} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.saveBtn]}
          onPress={handleSave}
          disabled={actionLoading || !currentCard}
          activeOpacity={0.8}
        >
          <Ionicons name="bookmark-outline" size={24} color={colors.text.secondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.acceptBtn]}
          onPress={handleAccept}
          disabled={actionLoading || !currentCard}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={28} color={colors.success} />
        </TouchableOpacity>
      </View>

      {/* Skip all */}
      <TouchableOpacity
        style={[styles.skipAllBtn, { paddingBottom: insets.bottom + spacing.sm }]}
        onPress={handleSkipAll}
      >
        <Text style={styles.skipAllText}>Пропустить всё</Text>
      </TouchableOpacity>
    </View>
  );
};

interface CardContentProps {
  item: PromotionListResource;
  participantName: string;
  color: string;
}

const CardContent: React.FC<CardContentProps> = ({ item, participantName, color }) => (
  <View style={styles.cardContent}>
    {/* Cover placeholder */}
    <View style={styles.cardCover}>
      <Ionicons name="image-outline" size={48} color={colors.border} />
      <View style={styles.partnerForumBadge}>
        <Ionicons name="star" size={12} color={colors.warning} />
        <Text style={styles.partnerForumText}>Партнёр форума</Text>
      </View>
    </View>

    <View style={styles.cardBody}>
      {/* Participant row */}
      <View style={styles.participantRow}>
        <View style={[styles.avatarCircle, { backgroundColor: color }]}>
          <Text style={styles.avatarInitial}>
            {participantName.trim().charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.participantName} numberOfLines={1}>
          {participantName}
        </Text>
      </View>

      {/* Tourism type chip */}
      {item.tourism_type ? (
        <View style={styles.typeChip}>
          <Text style={styles.typeChipText}>{item.tourism_type.name}</Text>
        </View>
      ) : null}

      {/* Discount */}
      {item.discount_amount ? (
        <Text style={styles.discountText}>-{item.discount_amount}</Text>
      ) : null}

      {/* Name */}
      <Text style={styles.cardTitle} numberOfLines={2}>
        {item.name}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  header: {
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
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  // Progress
  progressContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  // Card stack
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  nextCard: {
    zIndex: 0,
  },
  stampOverlay: {
    position: 'absolute',
    top: spacing.xl,
    zIndex: 10,
    borderWidth: 3,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  likeStamp: {
    right: spacing.md,
    borderColor: colors.success,
    transform: [{ rotate: '15deg' }],
  },
  nopeStamp: {
    left: spacing.md,
    borderColor: colors.error,
    transform: [{ rotate: '-15deg' }],
  },
  likeStampText: {
    ...typography.h3,
    color: colors.success,
    fontWeight: '800',
  },
  nopeStampText: {
    ...typography.h3,
    color: colors.error,
    fontWeight: '800',
  },
  cardContent: {
    flex: 1,
  },
  cardCover: {
    height: 200,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  partnerForumBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  partnerForumText: {
    ...typography.captionSmall,
    color: colors.text.white,
    fontWeight: '600',
  },
  cardBody: {
    padding: spacing.md,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  avatarInitial: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.text.white,
  },
  participantName: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    flex: 1,
  },
  typeChip: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipText: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  discountText: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    color: colors.secondary,
    marginBottom: spacing.xs,
  },
  cardTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  // Action buttons
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  skipBtn: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.error,
  },
  saveBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  acceptBtn: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.success,
  },
  // Skip all
  skipAllBtn: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  skipAllText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },
});

export default TinderSwipeScreen;
