import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';

type NavProp = StackNavigationProp<RootStackParamList, 'MapFilters'>;

interface TourismTypeFilter {
  id: string;
  name: string;
}

interface ZoneGroup {
  id: string;
  name: string;
  color: string;
  types: TourismTypeFilter[];
}

const zoneGroups: ZoneGroup[] = [
  {
    id: 'action',
    name: 'Действуй!',
    color: '#E91E63',
    types: [
      { id: 'active', name: 'Активный' },
      { id: 'patriotic', name: 'Патриотический' },
    ],
  },
  {
    id: 'rest',
    name: 'Отдыхай!',
    color: '#00BCD4',
    types: [
      { id: 'wellness', name: 'Оздоровительный' },
      { id: 'beach', name: 'Пляжный' },
    ],
  },
  {
    id: 'learn',
    name: 'Узнавай!',
    color: '#3F51B5',
    types: [
      { id: 'cultural', name: 'Культурный' },
      { id: 'industrial', name: 'Промышленный' },
    ],
  },
  {
    id: 'develop',
    name: 'Развивай!',
    color: '#FF9800',
    types: [
      { id: 'youth', name: 'Молодёжный' },
      { id: 'family', name: 'Семейный' },
      { id: 'ecological', name: 'Экологический' },
    ],
  },
];

const MapFiltersScreen: React.FC = () => {
  const navigation = useNavigation<NavProp>();
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleApply = () => {
    navigation.navigate('Map', { filters: Array.from(selected) });
  };

  const handleReset = () => {
    setSelected(new Set());
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Фильтры</Text>
        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.resetText}>Сбросить</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Вид туризма</Text>
        {zoneGroups.map((group) => (
          <View key={group.id} style={styles.groupBlock}>
            <View style={[styles.groupHeader, { borderLeftColor: group.color }]}>
              <Text style={styles.groupName}>{group.name}</Text>
            </View>
            {group.types.map((type) => {
              const isSelected = selected.has(type.id);
              return (
                <TouchableOpacity
                  key={type.id}
                  style={styles.typeRow}
                  onPress={() => toggle(type.id)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && { backgroundColor: group.color, borderColor: group.color },
                    ]}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={14} color={colors.text.white} />
                    )}
                  </View>
                  <Text style={styles.typeName}>{type.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Apply button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
          <Text style={styles.applyBtnText}>
            Показать стенды
            {selected.size > 0 ? ` (${selected.size})` : ''}
          </Text>
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
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  resetText: {
    ...typography.body,
    color: colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  groupBlock: {
    marginBottom: spacing.lg,
  },
  groupHeader: {
    borderLeftWidth: 4,
    paddingLeft: spacing.sm,
    marginBottom: spacing.sm,
  },
  groupName: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '700',
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    gap: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeName: {
    ...typography.body,
    color: colors.text.primary,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  applyBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  applyBtnText: {
    ...typography.button,
    color: colors.text.white,
  },
});

export default MapFiltersScreen;
