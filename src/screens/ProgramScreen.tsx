import React from 'react';
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
import { spacing } from '../theme/spacing';
import { AppHeader } from '../components/common';

type ProgramScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Program'>;

interface ProgramCategory {
  id: string;
  title: string;
  color: string;
  subtitle?: string;
}

const programCategories: ProgramCategory[] = [
  { id: 'main-stage', title: 'Главная сцена', color: '#0068B2' },
  { id: 'lectory', title: 'Лекторий', color: '#0068B2' },
  { id: 'activities', title: 'Активности на стендах', color: '#0068B2' },
  { id: 'excursions', title: 'Экскурсии', color: '#0068B2', subtitle: 'Больше, чем путешествие' },
  { id: 'other', title: 'Другие события регионов', color: '#F93549' },
];

const ProgramScreen: React.FC = () => {
  const navigation = useNavigation<ProgramScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const handleCategoryPress = (category: ProgramCategory) => {
    // Navigate to specific program list with filter
    // For now, just show an alert or navigate to a detail screen
    console.log('Selected category:', category.id);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        showBackButton
        onBackPress={() => navigation.goBack()}
        showLoginButton
        showMenu
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>Программа фестиваля</Text>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          {programCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, { backgroundColor: category.color }]}
              onPress={() => handleCategoryPress(category)}
              activeOpacity={0.8}
            >
              <View style={styles.categoryContent}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                {category.subtitle && (
                  <Text style={styles.categorySubtitle}>{category.subtitle}</Text>
                )}
              </View>
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={13} color="rgba(255,255,255,0.8)" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer logos */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <View style={styles.footerLogos}>
            <View style={styles.footerLogoSection}>
              <Text style={styles.footerLabel}>Организатор</Text>
              <Text style={styles.footerLogoText}>РОСКОНГРЕСС</Text>
            </View>
            <View style={styles.footerLogoSection}>
              <Text style={styles.footerLabel}>Проходит в рамках</Text>
              <Text style={styles.footerLogoText}>РОССИЯ</Text>
            </View>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontFamily: 'Geometria-Bold',
    fontSize: 24,
    color: colors.primary,
    marginBottom: spacing.xl,
  },
  categoriesContainer: {
    gap: spacing.md,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 32,
    minHeight: 68,
  },
  categoryContent: {
    flex: 1,
  },
  categoryTitle: {
    fontFamily: 'Geometria-Medium',
    fontSize: 20,
    color: colors.text.white,
  },
  categorySubtitle: {
    fontFamily: 'Geometria-Regular',
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: spacing.xxl,
  },
  footerDivider: {
    height: 1,
    backgroundColor: 'rgba(0,43,119,0.1)',
    marginBottom: spacing.lg,
  },
  footerLogos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerLogoSection: {
    gap: spacing.sm,
  },
  footerLabel: {
    fontFamily: 'Geometria-Medium',
    fontSize: 10,
    color: '#797687',
  },
  footerLogoText: {
    fontFamily: 'Geometria-Bold',
    fontSize: 14,
    color: colors.primary,
  },
});

export default ProgramScreen;
