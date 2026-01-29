import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Excursion, ExcursionSlot } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Header, Button, Input } from '../components/common';

type ExcursionDetailNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ExcursionDetail'
>;
type ExcursionDetailRouteProp = RouteProp<RootStackParamList, 'ExcursionDetail'>;

// Mock data
const mockExcursion: Excursion = {
  id: '1',
  title: 'Прогулка по ВДНХ',
  description:
    'Увлекательная пешеходная экскурсия по главным достопримечательностям ВДНХ с профессиональным гидом. Вы узнаете об истории создания выставки, увидите легендарные фонтаны "Дружба народов" и "Каменный цветок", познакомитесь с архитектурой павильонов разных эпох.\n\nДлительность экскурсии: 2 часа.\nРекомендуется удобная обувь для прогулки.',
  photo: 'https://example.com/vdnh.jpg',
  meetingPoint: 'Арка Главного входа ВДНХ',
  meetingCoordinates: { lat: 55.829, lng: 37.630 },
  slots: [
    { id: 's1', date: '2025-06-10', time: '10:00', totalSpots: 20, availableSpots: 5 },
    { id: 's2', date: '2025-06-10', time: '14:00', totalSpots: 20, availableSpots: 2 },
    { id: 's3', date: '2025-06-10', time: '18:00', totalSpots: 20, availableSpots: 0 },
  ],
};

const ExcursionDetailScreen: React.FC = () => {
  const navigation = useNavigation<ExcursionDetailNavigationProp>();
  const route = useRoute<ExcursionDetailRouteProp>();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<'description' | 'location'>('description');
  const [selectedSlot, setSelectedSlot] = useState<ExcursionSlot | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [numberOfPeople, setNumberOfPeople] = useState(1);

  const excursion = mockExcursion; // In real app: useExcursion(route.params.excursionId)

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
    });
  };

  const handleSlotSelect = (slot: ExcursionSlot) => {
    if (slot.availableSpots > 0) {
      setSelectedSlot(slot);
    }
  };

  const handleBooking = () => {
    if (selectedSlot) {
      setBookingModalVisible(true);
    }
  };

  const handleConfirmBooking = () => {
    // TODO: Submit booking to backend
    setBookingModalVisible(false);
    Alert.alert(
      'Успешно!',
      'Вы зарегистрированы на экскурсию. Напоминание придёт за 30 минут до начала.',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleShowOnMap = () => {
    navigation.navigate('Map', { standId: excursion.id });
  };

  return (
    <View style={styles.container}>
      <Header
        title={excursion.title}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image */}
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <Ionicons name="walk-outline" size={60} color={colors.text.secondary} />
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'description' && styles.tabActive]}
            onPress={() => setActiveTab('description')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'description' && styles.tabTextActive,
              ]}
            >
              Описание
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'location' && styles.tabActive]}
            onPress={() => setActiveTab('location')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'location' && styles.tabTextActive,
              ]}
            >
              Где и когда
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {activeTab === 'description' ? (
            <Text style={styles.description}>{excursion.description}</Text>
          ) : (
            <View>
              <View style={styles.meetingPointRow}>
                <Ionicons name="location" size={24} color={colors.primary} />
                <View style={styles.meetingPointInfo}>
                  <Text style={styles.meetingPointLabel}>Место встречи</Text>
                  <Text style={styles.meetingPointText}>
                    {excursion.meetingPoint}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={handleShowOnMap}
              >
                <Ionicons name="map-outline" size={20} color={colors.primary} />
                <Text style={styles.mapButtonText}>Показать на карте</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Available Slots */}
          <View style={styles.slotsSection}>
            <Text style={styles.sectionTitle}>Доступные слоты</Text>
            {excursion.slots.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.slotItem,
                  selectedSlot?.id === slot.id && styles.slotItemSelected,
                  slot.availableSpots === 0 && styles.slotItemDisabled,
                ]}
                onPress={() => handleSlotSelect(slot)}
                disabled={slot.availableSpots === 0}
              >
                <View style={styles.slotRadio}>
                  {selectedSlot?.id === slot.id && (
                    <View style={styles.slotRadioInner} />
                  )}
                </View>
                <View style={styles.slotInfo}>
                  <Text
                    style={[
                      styles.slotTime,
                      slot.availableSpots === 0 && styles.slotTextDisabled,
                    ]}
                  >
                    {slot.time}
                  </Text>
                  <Text
                    style={[
                      styles.slotAvailability,
                      slot.availableSpots === 0 && styles.slotTextDisabled,
                      slot.availableSpots > 0 && slot.availableSpots <= 3 && styles.slotLimited,
                    ]}
                  >
                    {slot.availableSpots > 0
                      ? `${slot.availableSpots} мест`
                      : 'Мест нет'}
                  </Text>
                </View>
                {slot.availableSpots === 0 && (
                  <Ionicons name="close-circle" size={20} color={colors.error} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Register Button */}
        <View style={styles.registerContainer}>
          <Button
            title="Зарегистрироваться"
            onPress={handleBooking}
            variant="secondary"
            size="large"
            fullWidth
            disabled={!selectedSlot}
          />
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Регистрация на экскурсию</Text>
            <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>Экскурсия:</Text>
              <Text style={styles.bookingValue}>{excursion.title}</Text>
            </View>
            {selectedSlot && (
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingLabel}>Дата и время:</Text>
                <Text style={styles.bookingValue}>
                  {formatDate(selectedSlot.date)}, {selectedSlot.time}
                </Text>
              </View>
            )}

            <View style={styles.peopleSelector}>
              <Text style={styles.peopleSelectorLabel}>Количество человек:</Text>
              <View style={styles.peopleSelectorControls}>
                <TouchableOpacity
                  style={styles.peopleButton}
                  onPress={() => setNumberOfPeople(Math.max(1, numberOfPeople - 1))}
                >
                  <Ionicons name="remove" size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.peopleCount}>{numberOfPeople}</Text>
                <TouchableOpacity
                  style={styles.peopleButton}
                  onPress={() =>
                    setNumberOfPeople(
                      Math.min(selectedSlot?.availableSpots || 1, numberOfPeople + 1)
                    )
                  }
                >
                  <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Подтвердить"
              onPress={handleConfirmBooking}
              variant="secondary"
              size="large"
              fullWidth
            />
          </ScrollView>
        </View>
      </Modal>
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
    height: 200,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
  },
  description: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  meetingPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  meetingPointInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  meetingPointLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  meetingPointText: {
    ...typography.body,
    color: colors.text.primary,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: spacing.sm,
  },
  mapButtonText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500',
  },
  slotsSection: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  slotItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  slotItemDisabled: {
    opacity: 0.5,
  },
  slotRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  slotInfo: {
    flex: 1,
  },
  slotTime: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  slotAvailability: {
    ...typography.caption,
    color: colors.success,
  },
  slotTextDisabled: {
    color: colors.text.secondary,
  },
  slotLimited: {
    color: colors.warning,
  },
  registerContainer: {
    padding: spacing.lg,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  bookingInfo: {
    marginBottom: spacing.md,
  },
  bookingLabel: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  bookingValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  peopleSelector: {
    marginVertical: spacing.lg,
  },
  peopleSelectorLabel: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  peopleSelectorControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  peopleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  peopleCount: {
    ...typography.h2,
    color: colors.text.primary,
    minWidth: 48,
    textAlign: 'center',
  },
});

export default ExcursionDetailScreen;
