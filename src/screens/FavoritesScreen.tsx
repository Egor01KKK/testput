import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
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

type FavoritesScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Favorites'
>;

const dayLabels: Record<string, { short: string; full: string }> = {
  '2025-06-10': { short: '10', full: '10 июня' },
  '2025-06-11': { short: '11', full: '11 июня' },
  '2025-06-12': { short: '12', full: '12 июня' },
  '2025-06-13': { short: '13', full: '13 июня' },
  '2025-06-14': { short: '14', full: '14 июня' },
  '2025-06-15': { short: '15', full: '15 июня' },
};

// Mock data
const mockFavorites: Activity[] = [
  {
    id: '1',
    title: 'Открытие форума',
    description: 'Торжественная церемония',
    date: '2025-06-10',
    startTime: '10:00',
    endTime: '11:30',
    zone: 'Главная сцена',
    zoneId: 'main-stage',
    coordinates: { lat: 55.829, lng: 37.630 },
    type: 'show',
  },
  {
    id: '2',
    title: 'Мастер-класс по фотографии',
    description: 'Научитесь делать потрясающие фото',
    date: '2025-06-10',
    startTime: '12:00',
    endTime: '13:30',
    zone: 'Большой Лекторий',
    zoneId: 'lectory',
    coordinates: { lat: 55.830, lng: 37.632 },
    type: 'masterclass',
  },
  {
    id: '5',
    title: 'Йога на рассвете',
    description: 'Практика йоги на свежем воздухе',
    date: '2025-06-11',
    startTime: '07:00',
    endTime: '08:00',
    zone: 'Ретрит-зона',
    zoneId: 'retreat',
    coordinates: { lat: 55.828, lng: 37.633 },
    type: 'other',
  },
];

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<FavoritesScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [favorites, setFavorites] = useState(mockFavorites);

  const getZoneColor = (zoneId: string): string => {
    const zone = ZONES.find((z) => z.id === zoneId);
    return zone?.color || colors.primary;
  };

  const removeFavorite = (activityId: string) => {
    setFavorites(favorites.filter((item) => item.id !== activityId));
  };

  // Group by date
  const groupedFavorites = favorites.reduce((groups, activity) => {
    const date = activity.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
    return groups;
  }, {} as Record<string, Activity[]>);

  // Sort by time within each group
  Object.keys(groupedFavorites).forEach((date) => {
    groupedFavorites[date].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  const renderFavoriteItem = (item: Activity) => (
    <View key={item.id} style={styles.favoriteCard}>
      <View style={styles.timeColumn}>
        <Text style={styles.timeText}>{item.startTime}</Text>
      </View>
      <View style={styles.contentColumn}>
        <View style={styles.cardHeader}>
          <View
            style={[styles.zoneIndicator, { backgroundColor: getZoneColor(item.zoneId) }]}
          />
          <Text style={styles.zoneName}>{item.zone}</Text>
        </View>
        <Text style={styles.activityTitle}>{item.title}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFavorite(item.id)}
      >
        <Ionicons name="heart" size={22} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderDateGroup = ([date, activities]: [string, Activity[]]) => (
    <View key={date} style={styles.dateGroup}>
      <Text style={styles.dateHeader}>{dayLabels[date]?.full || date}</Text>
      {activities.map(renderFavoriteItem)}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header
        title="Мой маршрут"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      {favorites.length > 0 ? (
        <FlatList
          data={Object.entries(groupedFavorites).sort((a, b) =>
            a[0].localeCompare(b[0])
          )}
          renderItem={({ item }) => renderDateGroup(item)}
          keyExtractor={([date]) => date}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          title="Пока ничего нет"
          description="Добавьте мероприятия из программы, нажав на сердечко"
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
  listContent: {
    padding: spacing.md,
  },
  dateGroup: {
    marginBottom: spacing.lg,
  },
  dateHeader: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  favoriteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  timeColumn: {
    width: 50,
  },
  timeText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  contentColumn: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  zoneIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  zoneName: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  activityTitle: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  removeButton: {
    padding: spacing.sm,
  },
});

export default FavoritesScreen;
