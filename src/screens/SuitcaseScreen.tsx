import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Tour } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Header, Chip, EmptyState } from '../components/common';

type SuitcaseScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Suitcase'>;

type FilterType = 'all' | 'active' | 'expiring' | 'archive';

// Mock data
const mockSuitcase: Tour[] = [
  {
    id: '1',
    title: 'Тур на Камчатку',
    photo: '',
    description: 'Посещение вулканов',
    region: 'Камчатка',
    duration: 7,
    tourismType: 'active',
    originalPrice: 106250,
    discountPercent: 20,
    finalPrice: 85000,
    validFrom: '2025-06-15',
    validTo: '2025-12-15',
    qrCodeUrl: 'https://example.com/qr/1',
    phone: '+7 (999) 123-45-67',
    bookingUrl: 'https://example.com/book/1',
    exhibitorId: 'kamchatka-1',
  },
  {
    id: '2',
    title: 'Алтайские горы',
    photo: '',
    description: 'Треккинг по горным тропам',
    region: 'Алтай',
    duration: 10,
    tourismType: 'active',
    originalPrice: 75000,
    discountPercent: 15,
    finalPrice: 63750,
    validFrom: '2025-06-15',
    validTo: '2025-06-22', // Expiring soon
    qrCodeUrl: 'https://example.com/qr/2',
    phone: '+7 (999) 234-56-78',
    bookingUrl: 'https://example.com/book/2',
    exhibitorId: 'altai-1',
  },
];

const filters: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'active', label: 'Действующие' },
  { id: 'expiring', label: 'Скоро истекает' },
  { id: 'archive', label: 'Архив' },
];

const SuitcaseScreen: React.FC = () => {
  const navigation = useNavigation<SuitcaseScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [suitcase, setSuitcase] = useState(mockSuitcase);

  const today = new Date();
  const sevenDaysLater = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  const getFilteredItems = () => {
    return suitcase.filter((item) => {
      const validTo = new Date(item.validTo);

      switch (activeFilter) {
        case 'active':
          return validTo >= today;
        case 'expiring':
          return validTo >= today && validTo <= sevenDaysLater;
        case 'archive':
          return validTo < today;
        default:
          return true;
      }
    });
  };

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ru-RU') + ' ₽';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const isExpiringSoon = (validTo: string): boolean => {
    const date = new Date(validTo);
    return date >= today && date <= sevenDaysLater;
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\D/g, '')}`);
  };

  const handleBook = (url: string) => {
    Linking.openURL(url);
  };

  const handleShare = async (item: Tour) => {
    try {
      await Share.share({
        message: `Посмотри этот тур: ${item.title}\nСкидка ${item.discountPercent}%\nЦена: ${formatPrice(item.finalPrice)}\n${item.bookingUrl}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRemove = (itemId: string) => {
    Alert.alert(
      'Удалить из чемодана?',
      'Предложение будет удалено из вашего чемодана',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            setSuitcase(suitcase.filter((item) => item.id !== itemId));
          },
        },
      ]
    );
  };

  const renderSuitcaseCard = ({ item }: { item: Tour }) => (
    <View style={styles.suitcaseCard}>
      {isExpiringSoon(item.validTo) && (
        <View style={styles.expiringBadge}>
          <Ionicons name="warning" size={14} color={colors.warning} />
          <Text style={styles.expiringText}>
            Действует до: {formatDate(item.validTo)}
          </Text>
        </View>
      )}

      <View style={styles.cardHeader}>
        <View style={styles.logoPlaceholder}>
          <Ionicons name="business" size={24} color={colors.text.secondary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.tourTitle}>{item.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.discountBadge}>-{item.discountPercent}%</Text>
            <Text style={styles.price}>{formatPrice(item.finalPrice)}</Text>
          </View>
        </View>
      </View>

      {/* QR Code */}
      <View style={styles.qrContainer}>
        <View style={styles.qrPlaceholder}>
          <Ionicons name="qr-code" size={60} color={colors.text.secondary} />
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleCall(item.phone)}
        >
          <Ionicons name="call-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Контакты</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => handleBook(item.bookingUrl)}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.text.white} />
          <Text style={[styles.actionText, styles.actionTextPrimary]}>Бронь</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(item)}
        >
          <Ionicons name="share-outline" size={20} color={colors.primary} />
          <Text style={styles.actionText}>Поделиться</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRemove(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color={colors.error} />
          <Text style={[styles.actionText, { color: colors.error }]}>Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const filteredItems = getFilteredItems();

  return (
    <View style={styles.container}>
      <Header
        title="Чемодан скидок"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((filter) => (
          <Chip
            key={filter.id}
            label={filter.label}
            selected={activeFilter === filter.id}
            onPress={() => setActiveFilter(filter.id)}
            color={colors.primary}
            style={styles.filterChip}
          />
        ))}
      </View>

      {/* Suitcase Visual */}
      <View style={styles.suitcaseVisual}>
        <Ionicons name="briefcase" size={48} color={colors.primary} />
        <Text style={styles.suitcaseCount}>
          {filteredItems.length} предложений
        </Text>
      </View>

      {/* List */}
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={renderSuitcaseCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="Чемодан пуст"
          description="Добавляйте понравившиеся туры из раздела скидок"
          actionTitle="Смотреть скидки"
          onAction={() => navigation.navigate('Offers')}
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
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterChip: {
    marginBottom: spacing.xs,
  },
  suitcaseVisual: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suitcaseCount: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.md,
  },
  suitcaseCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  expiringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  expiringText: {
    ...typography.captionSmall,
    color: colors.warning,
    fontWeight: '500',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  tourTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  discountBadge: {
    ...typography.captionSmall,
    color: colors.text.white,
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    fontWeight: '700',
  },
  price: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.primary,
  },
  qrContainer: {
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  qrPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.xs,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionText: {
    ...typography.captionSmall,
    color: colors.primary,
    fontWeight: '500',
  },
  actionTextPrimary: {
    color: colors.text.white,
  },
});

export default SuitcaseScreen;
