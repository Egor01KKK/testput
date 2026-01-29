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

import { RootStackParamList, FAQItem } from '../types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { AppHeader } from '../components/common';

type FAQScreenNavigationProp = StackNavigationProp<RootStackParamList, 'FAQ'>;

// FAQ data from Figma
const mockFAQ: FAQItem[] = [
  {
    id: '1',
    question: 'Сколько дней длится форум «Путешествуй!»?',
    answer:
      'Форум «Путешествуй!» проходит 6 дней: с 10 по 15 июня 2025 года. Ежедневно с 10:00 до 21:00 на территории ВДНХ.',
    order: 1,
  },
  {
    id: '2',
    question: 'Что означают Уровни в личном кабинете?',
    answer:
      'Уровни — это активность твоего участия на форуме. За каждый уровень ты получаешь дополнительный лотерейный билет на ежедневный розыгрыш.\nУровень 0 = от 0 до 4 баллов\nУровень 1 = от 5 до 9 баллов\nУровень 2 = от 10 до 14 баллов\nУровень 3 = от 15 и более баллов.',
    order: 2,
  },
  {
    id: '3',
    question: 'Можно ли изменить имя и почту?',
    answer:
      'Да, при нажатии на меню в правом верхнем углу экрана ты попадёшь в личный кабинет. При нажатии на имя и почту ты попадёшь в «Паспорт путешественника», где сможешь заново зарегистрироваться.',
    order: 3,
  },
  {
    id: '4',
    question: 'Как будет проходить розыгрыш?',
    answer:
      'Среди всей базы авторизованных путешественников генератор случайных чисел выберет почты победителей и выведет их на экран. Нужно узнать свою почту на экране, показать её же в мобильной платформе и забрать свой приз.',
    order: 4,
  },
  {
    id: '5',
    question: 'Где можно перекусить на территории?',
    answer:
      'На территории форума работает Гастрофестиваль с блюдами российских регионов, а также множество кафе и фудкортов ВДНХ.',
    order: 5,
  },
  {
    id: '6',
    question: 'Как работает система скидок?',
    answer:
      'Экспоненты форума предлагают эксклюзивные скидки на туры и услуги. Для получения скидки покажите QR-код из раздела «Чемодан скидок» на стенде партнёра.',
    order: 6,
  },
];

interface FAQItemComponentProps {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}

const FAQItemComponent: React.FC<FAQItemComponentProps> = ({
  item,
  isExpanded,
  onToggle,
}) => {
  return (
    <View style={styles.faqItem}>
      <TouchableOpacity
        style={styles.faqQuestion}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <Text style={styles.questionText}>{item.question}</Text>
        <View style={styles.arrowIcon}>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.primary}
          />
        </View>
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.faqAnswer}>
          <Text style={styles.answerText}>{item.answer}</Text>
        </View>
      )}
      <View style={styles.divider} />
    </View>
  );
};

const FAQScreen: React.FC = () => {
  const navigation = useNavigation<FAQScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  // Multiple FAQs can be expanded at once
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleFAQ = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
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
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={styles.title}>Часто задаваемые вопросы</Text>

        {/* FAQ Items */}
        {mockFAQ.sort((a, b) => a.order - b.order).map((item) => (
          <FAQItemComponent
            key={item.id}
            item={item}
            isExpanded={expandedIds.has(item.id)}
            onToggle={() => toggleFAQ(item.id)}
          />
        ))}

        {/* Footer */}
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
  scrollView: {
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
  faqItem: {
    marginBottom: spacing.sm,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  questionText: {
    fontFamily: 'Geometria-Medium',
    fontSize: 20,
    color: colors.primary,
    flex: 1,
    marginRight: spacing.md,
    lineHeight: 26,
  },
  arrowIcon: {
    marginTop: 4,
  },
  faqAnswer: {
    paddingBottom: spacing.md,
  },
  answerText: {
    fontFamily: 'Geometria-Medium',
    fontSize: 16,
    color: '#797687',
    lineHeight: 24,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
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

export default FAQScreen;
