import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, Activity, FESTIVAL_DATES, ZONES } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Header, EmptyState } from '../components/common';

type MyScheduleScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'MySchedule'
>;

const dayLabels: Record<string, string> = {
  '2025-06-10': '10',
  '2025-06-11': '11',
  '2025-06-12': '12',
  '2025-06-13': '13',
  '2025-06-14': '14',
  '2025-06-15': '15',
};

// Mock data - In real app would come from AsyncStorage/context
const mockSchedule: Activity[] = [
  {
    id: '1',
    title: 'Открытие форума',
    description: 'Торжественная церемония открытия',
    date: '2025-06-10',
    startTime: '10:00',
    endTime: '11:30',
    zone: 'Главная сцена',
    zoneId: 'main-stage',
    coordinates: { lat: 55.829, lng: 37.630 },
    type: 'show',
  },
  {
    id: '3',
    title: 'Лекция: Путешествия по России',
    description: 'Узнайте о самых интересных маршрутах',
    date: '2025-06-10',
    startTime: '14:00',
    endTime: '15:00',
    zone: 'Большой Лекторий',
    zoneId: 'lectory',
    coordinates: { lat: 55.830, lng: 37.632 },
    type: 'lecture',
  },
];

const MyScheduleScreen: React.FC = () => {
  const navigation = useNavigation<MyScheduleScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState<string>(FESTIVAL_DATES[0]);
  const [schedule, setSchedule] = useState(mockSchedule);
  const [reminders, setReminders] = useState<Set<string>>(new Set(['1']));

  const filteredSchedule = schedule.filter((item) => item.date === selectedDate);

  const getZoneColor = (zoneId: string): string => {
    const zone = ZONES.find((z) => z.id === zoneId);
    return zone?.color || colors.primary;
  };

  const getActivityIcon = (type: Activity['type']): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'lecture':
        return 'school';
      case 'masterclass':
        return 'color-palette';
      case 'show':
        return 'musical-notes';
      case 'excursion':
        return 'walk';
      default:
        return 'star';
    }
  };

  const toggleReminder = (activityId: string) => {
    const newReminders = new Set(reminders);
    if (newReminders.has(activityId)) {
      newReminders.delete(activityId);
    } else {
      newReminders.add(activityId);
    }
    setReminders(newReminders);
    // TODO: Schedule/cancel local notification
  };

  const handleRemoveFromSchedule = (activityId: string) => {
    Alert.alert(
      'Удалить из расписания?',
      'Мероприятие будет удалено из вашего расписания',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            setSchedule(schedule.filter((item) => item.id !== activityId));
          },
        },
      ]
    );
  };

  const handleShowOnMap = (activity: Activity) => {
    navigation.navigate('Map', { standId: activity.zoneId });
  };

  const renderScheduleCard = ({ item }: { item: Activity }) => (
    <View style={styles.scheduleCard}>
      <View
        style={[styles.timeSection, { backgroundColor: getZoneColor(item.zoneId) }]}
      >
        <Text style={styles.timeText}>{item.startTime}</Text>
        <Ionicons
          name={getActivityIcon(item.type)}
          size={24}
          color={colors.text.white}
        />
      </View>
      <View style={styles.contentSection}>
        <Text style={styles.zoneName}>{item.zone}</Text>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              reminders.has(item.id) && styles.actionButtonActive,
            ]}
            onPress={() => toggleReminder(item.id)}
          >
            <Ionicons
              name={reminders.has(item.id) ? 'notifications' : 'notifications-outline'}
              size={18}
              color={reminders.has(item.id) ? colors.primary : colors.text.secondary}
            />
            <Text
              style={[
                styles.actionButtonText,
                reminders.has(item.id) && styles.actionButtonTextActive,
              ]}
            >
              {reminders.has(item.id) ? 'Вкл' : 'Напомнить'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShowOnMap(item)}
          >
            <Ionicons name="location-outline" size={18} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleRemoveFromSchedule(item.id)}
          >
            <Ionicons name="close-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Моё расписание"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

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

      {/* Schedule List */}
      {filteredSchedule.length > 0 ? (
        <FlatList
          data={filteredSchedule}
          renderItem={renderScheduleCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="У вас свободный день!"
          description="Исследуйте карту или программу, чтобы найти что-то интересное."
          actionTitle="Открыть программу"
          onAction={() => navigation.navigate('Program')}
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
  listContent: {
    padding: spacing.md,
  },
  scheduleCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.small,
    overflow: 'hidden',
  },
  timeSection: {
    width: 70,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text.white,
    marginBottom: spacing.xs,
  },
  contentSection: {
    flex: 1,
    padding: spacing.md,
  },
  zoneName: {
    ...typography.caption,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  activityTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  actionButtonActive: {
    backgroundColor: colors.primary + '20',
  },
  actionButtonText: {
    ...typography.captionSmall,
    color: colors.text.secondary,
  },
  actionButtonTextActive: {
    color: colors.primary,
  },
});

export default MyScheduleScreen;
