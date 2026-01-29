import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Excursion, FESTIVAL_DATES } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Header, Chip } from '../components/common';

type ExcursionsScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Excursions'
>;

const dayLabels: Record<string, string> = {
  '2025-06-10': '10',
  '2025-06-11': '11',
  '2025-06-12': '12',
  '2025-06-13': '13',
  '2025-06-14': '14',
  '2025-06-15': '15',
};

// Mock data
const mockExcursions: Excursion[] = [
  {
    id: '1',
    title: 'Прогулка по ВДНХ',
    description:
      'Пешеходная экскурсия по главным достопримечательностям ВДНХ с профессиональным гидом',
    photo: 'https://example.com/vdnh.jpg',
    meetingPoint: 'Арка Главного входа ВДНХ',
    meetingCoordinates: { lat: 55.829, lng: 37.630 },
    slots: [
      { id: 's1', date: '2025-06-10', time: '10:00', totalSpots: 20, availableSpots: 5 },
      { id: 's2', date: '2025-06-10', time: '14:00', totalSpots: 20, availableSpots: 2 },
      { id: 's3', date: '2025-06-10', time: '18:00', totalSpots: 20, availableSpots: 0 },
      { id: 's4', date: '2025-06-11', time: '10:00', totalSpots: 20, availableSpots: 15 },
    ],
  },
  {
    id: '2',
    title: 'Секреты павильонов',
    description:
      'Узнайте об истории и архитектуре знаменитых павильонов выставки',
    photo: 'https://example.com/pavilions.jpg',
    meetingPoint: 'Павильон "Космос"',
    meetingCoordinates: { lat: 55.830, lng: 37.632 },
    slots: [
      { id: 's5', date: '2025-06-10', time: '11:00', totalSpots: 15, availableSpots: 8 },
      { id: 's6', date: '2025-06-10', time: '15:00', totalSpots: 15, availableSpots: 3 },
      { id: 's7', date: '2025-06-11', time: '11:00', totalSpots: 15, availableSpots: 10 },
    ],
  },
  {
    id: '3',
    title: 'Вечерняя Москва с ВДНХ',
    description:
      'Любуйтесь закатом над Москвой и узнайте интересные факты о выставке',
    photo: 'https://example.com/evening.jpg',
    meetingPoint: 'Фонтан "Дружба народов"',
    meetingCoordinates: { lat: 55.828, lng: 37.633 },
    slots: [
      { id: 's8', date: '2025-06-10', time: '19:00', totalSpots: 25, availableSpots: 12 },
      { id: 's9', date: '2025-06-11', time: '19:00', totalSpots: 25, availableSpots: 20 },
    ],
  },
];

const ExcursionsScreen: React.FC = () => {
  const navigation = useNavigation<ExcursionsScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState<string>(FESTIVAL_DATES[0]);

  const filteredExcursions = mockExcursions.map((excursion) => ({
    ...excursion,
    slots: excursion.slots.filter((slot) => slot.date === selectedDate),
  })).filter((excursion) => excursion.slots.length > 0);

  const renderExcursionCard = ({ item }: { item: Excursion }) => (
    <TouchableOpacity
      style={styles.excursionCard}
      onPress={() => navigation.navigate('ExcursionDetail', { excursionId: item.id })}
      activeOpacity={0.7}
    >
      <View style={styles.excursionImageContainer}>
        <View style={styles.excursionImagePlaceholder}>
          <Ionicons name="walk-outline" size={40} color={colors.text.secondary} />
        </View>
      </View>
      <View style={styles.excursionContent}>
        <Text style={styles.excursionTitle}>{item.title}</Text>
        <View style={styles.slotsContainer}>
          {item.slots.map((slot) => (
            <View
              key={slot.id}
              style={[
                styles.slotBadge,
                slot.availableSpots === 0 && styles.slotBadgeUnavailable,
              ]}
            >
              <Text
                style={[
                  styles.slotTime,
                  slot.availableSpots === 0 && styles.slotTimeUnavailable,
                ]}
              >
                {slot.time}
              </Text>
              <Text
                style={[
                  styles.slotSpots,
                  slot.availableSpots === 0 && styles.slotSpotsUnavailable,
                ]}
              >
                {slot.availableSpots > 0
                  ? `${slot.availableSpots} мест`
                  : 'Мест нет'}
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Подробнее</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Экскурсии БЧП"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {/* Logo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoPlaceholder}>
          <Ionicons name="business-outline" size={32} color={colors.primary} />
          <Text style={styles.logoText}>Больше, чем путешествие</Text>
        </View>
      </View>

      {/* Day Selector */}
      <View style={styles.daySelector}>
        {FESTIVAL_DATES.map((date) => (
          <TouchableOpacity
            key={date}
            style={[
              styles.dayButton,
              selectedDate === date && styles.dayButtonActive,
            ]}
            onPress={() => setSelectedDate(date)}
          >
            <Text
              style={[
                styles.dayText,
                selectedDate === date && styles.dayTextActive,
              ]}
            >
              {dayLabels[date]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Excursions List */}
      <FlatList
        data={filteredExcursions}
        renderItem={renderExcursionCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.excursionsList,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>Нет экскурсий в этот день</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logoPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  dayButtonActive: {
    backgroundColor: colors.primary,
  },
  dayText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  dayTextActive: {
    color: colors.text.white,
  },
  excursionsList: {
    padding: spacing.md,
  },
  excursionCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.small,
    overflow: 'hidden',
  },
  excursionImageContainer: {
    height: 150,
  },
  excursionImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  excursionContent: {
    padding: spacing.md,
  },
  excursionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  slotBadge: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  slotBadgeUnavailable: {
    backgroundColor: colors.surface,
    opacity: 0.6,
  },
  slotTime: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  slotTimeUnavailable: {
    color: colors.text.secondary,
  },
  slotSpots: {
    ...typography.captionSmall,
    color: colors.success,
  },
  slotSpotsUnavailable: {
    color: colors.error,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  detailsButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    ...typography.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
});

export default ExcursionsScreen;
