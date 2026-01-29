import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { RootStackParamList, Stand } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Header, Button, Input } from '../components/common';

type FeedbackScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Feedback'>;

const likedAspects = [
  'Организация',
  'Программа мероприятий',
  'Экспоненты/стенды',
  'Спецпредложения',
  'Квест',
  'Экскурсии',
  'Карта и навигация',
];

// Mock stands for voting
const mockStands: { id: string; name: string }[] = [
  { id: '1', name: 'Камчатка' },
  { id: '2', name: 'Алтай' },
  { id: '3', name: 'Байкал' },
  { id: '4', name: 'Турция' },
  { id: '5', name: 'Ozon Travel' },
  { id: '6', name: 'Тинькофф Путешествия' },
  { id: '7', name: 'Сахалин' },
  { id: '8', name: 'Карелия' },
];

const FeedbackScreen: React.FC = () => {
  const navigation = useNavigation<FeedbackScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [rating, setRating] = useState(0);
  const [selectedAspects, setSelectedAspects] = useState<Set<string>>(new Set());
  const [customAspect, setCustomAspect] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [participateInRaffle, setParticipateInRaffle] = useState(false);
  const [votingModalVisible, setVotingModalVisible] = useState(false);
  const [selectedStand, setSelectedStand] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const starScale = [
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
    useSharedValue(1),
  ];

  const handleStarPress = (starIndex: number) => {
    setRating(starIndex + 1);
    starScale[starIndex].value = withSequence(
      withSpring(1.3, { damping: 4 }),
      withSpring(1, { damping: 4 })
    );
  };

  const toggleAspect = (aspect: string) => {
    const newAspects = new Set(selectedAspects);
    if (newAspects.has(aspect)) {
      newAspects.delete(aspect);
    } else {
      newAspects.add(aspect);
    }
    setSelectedAspects(newAspects);
  };

  const handleVote = () => {
    if (selectedStand) {
      setHasVoted(true);
      setVotingModalVisible(false);
      Alert.alert('Спасибо!', `Вы проголосовали за "${mockStands.find(s => s.id === selectedStand)?.name}"`);
    }
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Ошибка', 'Пожалуйста, оцените форум');
      return;
    }

    // TODO: Submit to backend
    setShowThankYou(true);
  };

  const filteredStands = mockStands.filter((stand) =>
    stand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (showThankYou) {
    return (
      <View style={[styles.container, styles.thankYouContainer]}>
        <View style={styles.thankYouContent}>
          <View style={styles.checkmarkCircle}>
            <Ionicons name="checkmark" size={60} color={colors.success} />
          </View>
          <Text style={styles.thankYouTitle}>Спасибо, что делитесь с нами!</Text>
          <Text style={styles.thankYouText}>
            Ваше мнение сделает следующее путешествие еще лучше.
          </Text>
          <Text style={styles.thankYouText}>До новых встреч!</Text>
          {participateInRaffle && (
            <View style={styles.raffleInfo}>
              <Ionicons name="gift" size={24} color={colors.secondary} />
              <Text style={styles.raffleText}>
                Вы участвуете в розыгрыше! Результаты будут объявлены 16 июня.
              </Text>
            </View>
          )}
          <Button
            title="На главную"
            onPress={() => navigation.navigate('Main')}
            variant="secondary"
            size="large"
            style={{ marginTop: spacing.xl }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title="Мои впечатления"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Voting Banner */}
        <TouchableOpacity
          style={styles.votingBanner}
          onPress={() => setVotingModalVisible(true)}
          disabled={hasVoted}
        >
          <Ionicons
            name={hasVoted ? 'checkmark-circle' : 'megaphone'}
            size={24}
            color={hasVoted ? colors.success : colors.primary}
          />
          <Text style={styles.votingBannerText}>
            {hasVoted ? 'Вы проголосовали!' : 'Голосование активно!'}
          </Text>
          {!hasVoted && (
            <Ionicons name="chevron-forward" size={20} color={colors.primary} />
          )}
        </TouchableOpacity>

        {/* Introduction */}
        <Text style={styles.sectionTitle}>
          Расскажите о вашем путешествии на форуме!
        </Text>

        {/* Star Rating */}
        <View style={styles.section}>
          <Text style={styles.questionLabel}>Как вам форум в целом?</Text>
          <View style={styles.starsContainer}>
            {[0, 1, 2, 3, 4].map((index) => {
              const animatedStyle = useAnimatedStyle(() => ({
                transform: [{ scale: starScale[index].value }],
              }));
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleStarPress(index)}
                >
                  <Animated.View style={animatedStyle}>
                    <Ionicons
                      name={index < rating ? 'star' : 'star-outline'}
                      size={40}
                      color={index < rating ? colors.secondary : colors.text.secondary}
                    />
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Liked Aspects */}
        <View style={styles.section}>
          <Text style={styles.questionLabel}>Что понравилось больше?</Text>
          <View style={styles.aspectsGrid}>
            {likedAspects.map((aspect) => (
              <TouchableOpacity
                key={aspect}
                style={[
                  styles.aspectItem,
                  selectedAspects.has(aspect) && styles.aspectItemSelected,
                ]}
                onPress={() => toggleAspect(aspect)}
              >
                <Ionicons
                  name={selectedAspects.has(aspect) ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={
                    selectedAspects.has(aspect) ? colors.primary : colors.text.secondary
                  }
                />
                <Text
                  style={[
                    styles.aspectText,
                    selectedAspects.has(aspect) && styles.aspectTextSelected,
                  ]}
                >
                  {aspect}
                </Text>
              </TouchableOpacity>
            ))}
            <View style={styles.customAspect}>
              <Ionicons
                name={customAspect ? 'checkbox' : 'square-outline'}
                size={20}
                color={customAspect ? colors.primary : colors.text.secondary}
              />
              <TextInput
                style={styles.customAspectInput}
                placeholder="Другое..."
                value={customAspect}
                onChangeText={setCustomAspect}
                placeholderTextColor={colors.text.secondary}
              />
            </View>
          </View>
        </View>

        {/* Suggestions */}
        <View style={styles.section}>
          <Text style={styles.questionLabel}>Ваши пожелания:</Text>
          <TextInput
            style={styles.suggestionsInput}
            placeholder="Напишите ваши впечатления и пожелания..."
            value={suggestions}
            onChangeText={setSuggestions}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        {/* Raffle Participation */}
        <TouchableOpacity
          style={styles.raffleOption}
          onPress={() => setParticipateInRaffle(!participateInRaffle)}
        >
          <Ionicons
            name={participateInRaffle ? 'checkbox' : 'square-outline'}
            size={24}
            color={participateInRaffle ? colors.primary : colors.text.secondary}
          />
          <Text style={styles.raffleOptionText}>Участвовать в розыгрыше</Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <Button
          title="Отправить впечатления"
          onPress={handleSubmit}
          variant="secondary"
          size="large"
          fullWidth
        />
      </ScrollView>

      {/* Voting Modal */}
      <Modal
        visible={votingModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVotingModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Народное голосование</Text>
            <TouchableOpacity onPress={() => setVotingModalVisible(false)}>
              <Ionicons name="close" size={28} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.votingInstruction}>Выберите лучший стенд:</Text>

            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.text.secondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Поиск стенда..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.text.secondary}
              />
            </View>

            <ScrollView style={styles.standsList}>
              {filteredStands.map((stand) => (
                <TouchableOpacity
                  key={stand.id}
                  style={[
                    styles.standItem,
                    selectedStand === stand.id && styles.standItemSelected,
                  ]}
                  onPress={() => setSelectedStand(stand.id)}
                >
                  <View style={styles.standRadio}>
                    {selectedStand === stand.id && (
                      <View style={styles.standRadioInner} />
                    )}
                  </View>
                  <Text style={styles.standName}>{stand.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.votingNote}>
              <Ionicons name="information-circle" size={18} color={colors.text.secondary} />
              <Text style={styles.votingNoteText}>
                Один голос на телефон
              </Text>
            </View>

            <Button
              title="Проголосовать"
              onPress={handleVote}
              variant="secondary"
              size="large"
              fullWidth
              disabled={!selectedStand}
            />
          </View>
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
  scrollContent: {
    padding: spacing.lg,
  },
  votingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  votingBannerText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  questionLabel: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  aspectsGrid: {
    gap: spacing.sm,
  },
  aspectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  aspectItemSelected: {},
  aspectText: {
    ...typography.body,
    color: colors.text.primary,
  },
  aspectTextSelected: {
    color: colors.primary,
    fontWeight: '500',
  },
  customAspect: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  customAspectInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  suggestionsInput: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
  },
  raffleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  raffleOptionText: {
    ...typography.body,
    color: colors.text.primary,
  },
  // Thank You Screen
  thankYouContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  thankYouContent: {
    alignItems: 'center',
  },
  checkmarkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  thankYouTitle: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  thankYouText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  raffleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  raffleText: {
    ...typography.body,
    color: colors.secondary,
    flex: 1,
  },
  // Modal
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
  votingInstruction: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    paddingVertical: spacing.md,
  },
  standsList: {
    flex: 1,
    marginBottom: spacing.md,
  },
  standItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  standItemSelected: {
    backgroundColor: colors.primary + '10',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  standRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  standRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  standName: {
    ...typography.body,
    color: colors.text.primary,
  },
  votingNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  votingNoteText: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});

export default FeedbackScreen;
