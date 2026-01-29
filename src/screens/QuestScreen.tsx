import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { Header, Button } from '../components/common';

type QuestScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Quest'>;

const QUEST_URL = 'https://quest.travelexpo.ru'; // Placeholder URL

const QuestScreen: React.FC = () => {
  const navigation = useNavigation<QuestScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const handleStartQuest = () => {
    Linking.openURL(QUEST_URL);
  };

  return (
    <View style={styles.container}>
      <Header
        title="Квест"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <View style={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        {/* Illustration */}
        <View style={styles.illustrationContainer}>
          <View style={styles.illustration}>
            <Ionicons name="trophy" size={80} color={colors.secondary} />
          </View>
        </View>

        {/* Text Content */}
        <View style={styles.textContent}>
          <Text style={styles.title}>Исследуй форум и выигрывай призы!</Text>
          <Text style={styles.description}>
            Пройди увлекательный квест по стендам форума, собирай баллы и участвуй
            в розыгрыше ценных призов от наших партнёров.
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>Посещай стенды участников</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>Отвечай на вопросы о регионах</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>Собирай баллы и получай награды</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color={colors.success} />
              <Text style={styles.featureText}>Участвуй в розыгрыше главного приза</Text>
            </View>
          </View>
        </View>

        {/* CTA Button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Начать квест"
            onPress={handleStartQuest}
            variant="secondary"
            size="large"
            fullWidth
            icon={<Ionicons name="arrow-forward" size={24} color={colors.text.white} />}
            iconPosition="right"
          />
        </View>
      </View>
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
    padding: spacing.lg,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  illustration: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.secondary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContent: {
    flex: 1,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  featuresList: {
    gap: spacing.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    ...typography.body,
    color: colors.text.primary,
    flex: 1,
  },
  buttonContainer: {
    marginTop: spacing.lg,
  },
});

export default QuestScreen;
