import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Tour, TOURISM_TYPES } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Header, Button } from '../components/common';

type TourDetailNavigationProp = StackNavigationProp<RootStackParamList, 'TourDetail'>;
type TourDetailRouteProp = RouteProp<RootStackParamList, 'TourDetail'>;

// Mock data - in real app would be fetched based on tourId
const mockTour: Tour = {
  id: '1',
  title: 'Тур на Камчатку',
  photo: 'https://example.com/kamchatka.jpg',
  description:
    'Уникальное путешествие на Камчатку! Вас ждёт посещение знаменитой Долины гейзеров, восхождение на действующие вулканы, купание в горячих термальных источниках и встреча с дикой природой. Маршрут включает вертолётные экскурсии с невероятными видами на вулканические ландшафты.',
  region: 'Камчатка',
  country: 'Россия',
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
  exhibitorLogo: undefined,
};

const TourDetailScreen: React.FC = () => {
  const navigation = useNavigation<TourDetailNavigationProp>();
  const route = useRoute<TourDetailRouteProp>();
  const insets = useSafeAreaInsets();

  const [isInSuitcase, setIsInSuitcase] = useState(false);

  const tour = mockTour; // In real app: useTour(route.params.tourId)

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ru-RU') + ' ₽';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleBooking = () => {
    Linking.openURL(tour.bookingUrl);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${tour.phone.replace(/\D/g, '')}`);
  };

  const handleAddToSuitcase = () => {
    setIsInSuitcase(!isInSuitcase);
    // TODO: Save to AsyncStorage and sync with backend
  };

  return (
    <View style={styles.container}>
      <Header
        title={tour.title}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tour Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={60} color={colors.text.secondary} />
          </View>
        </View>

        {/* Tour Info */}
        <View style={styles.content}>
          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Описание маршрута</Text>
            <Text style={styles.description}>{tour.description}</Text>
          </View>

          {/* Quick Info */}
          <View style={styles.quickInfo}>
            <View style={styles.quickInfoItem}>
              <Ionicons name="calendar-outline" size={20} color={colors.primary} />
              <Text style={styles.quickInfoText}>{tour.duration} дней</Text>
            </View>
            <View style={styles.quickInfoItem}>
              <Ionicons name="walk-outline" size={20} color={colors.primary} />
              <Text style={styles.quickInfoText}>
                {TOURISM_TYPES[tour.tourismType]}
              </Text>
            </View>
          </View>

          {/* Pricing */}
          <View style={styles.section}>
            <View style={styles.pricingRow}>
              <Text style={styles.finalPrice}>{formatPrice(tour.finalPrice)}</Text>
              <Text style={styles.originalPrice}>
                {formatPrice(tour.originalPrice)}
              </Text>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{tour.discountPercent}%</Text>
              </View>
            </View>
          </View>

          {/* Validity */}
          <View style={styles.section}>
            <View style={styles.validityRow}>
              <Ionicons name="time-outline" size={18} color={colors.text.secondary} />
              <Text style={styles.validityText}>
                Действует: {formatDate(tour.validFrom)} — {formatDate(tour.validTo)}
              </Text>
            </View>
          </View>

          {/* QR Code */}
          <View style={styles.qrSection}>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code" size={80} color={colors.text.secondary} />
            </View>
            <Text style={styles.qrHint}>Покажите QR-код для получения скидки</Text>
          </View>

          {/* Contact */}
          <TouchableOpacity style={styles.contactRow} onPress={handleCall}>
            <Ionicons name="call-outline" size={20} color={colors.primary} />
            <Text style={styles.contactText}>{tour.phone}</Text>
          </TouchableOpacity>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Забронировать тур"
              onPress={handleBooking}
              variant="secondary"
              size="large"
              fullWidth
            />
            <TouchableOpacity
              style={[
                styles.suitcaseButton,
                isInSuitcase && styles.suitcaseButtonActive,
              ]}
              onPress={handleAddToSuitcase}
            >
              <Ionicons
                name={isInSuitcase ? 'heart' : 'heart-outline'}
                size={24}
                color={isInSuitcase ? colors.error : colors.primary}
              />
              <Text
                style={[
                  styles.suitcaseButtonText,
                  isInSuitcase && styles.suitcaseButtonTextActive,
                ]}
              >
                {isInSuitcase ? 'В чемодане' : 'Добавить в чемодан'}
              </Text>
            </TouchableOpacity>
          </View>
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
  imageContainer: {
    height: 250,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  quickInfo: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    gap: spacing.lg,
  },
  quickInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quickInfoText: {
    ...typography.body,
    color: colors.text.primary,
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  finalPrice: {
    ...typography.h2,
    color: colors.text.primary,
  },
  originalPrice: {
    ...typography.body,
    color: colors.text.secondary,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: colors.secondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  discountText: {
    ...typography.caption,
    color: colors.text.white,
    fontWeight: '700',
  },
  validityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  validityText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  qrSection: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  qrPlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  qrHint: {
    ...typography.caption,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  contactText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  actions: {
    gap: spacing.md,
  },
  suitcaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.round,
    borderWidth: 2,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  suitcaseButtonActive: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  suitcaseButtonText: {
    ...typography.button,
    color: colors.primary,
  },
  suitcaseButtonTextActive: {
    color: colors.error,
  },
});

export default TourDetailScreen;
