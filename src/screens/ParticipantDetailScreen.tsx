import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Participant2026 } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { participantsApi } from '../api/participants';
import { Header } from '../components/common';

type ParticipantDetailNavigationProp = StackNavigationProp<RootStackParamList, 'ParticipantDetail'>;
type ParticipantDetailRouteProp = RouteProp<RootStackParamList, 'ParticipantDetail'>;

const AVATAR_COLORS = [
  '#2196F3', '#4CAF50', '#9C27B0', '#FF9800', '#E91E63',
  '#3F51B5', '#00BCD4', '#009688', '#FFC107', '#F44336',
];

const getAvatarColor = (id: string): string => {
  const index = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
};

const InfoRow: React.FC<{
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconContainer}>
      <Ionicons name={icon} size={20} color={colors.primary} />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const ParticipantDetailScreen: React.FC = () => {
  const navigation = useNavigation<ParticipantDetailNavigationProp>();
  const route = useRoute<ParticipantDetailRouteProp>();
  const insets = useSafeAreaInsets();

  const { participantId } = route.params;

  const [participant, setParticipant] = useState<Participant2026 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await participantsApi.getParticipantById(participantId);
        setParticipant(data);
      } catch {
        setError('Не удалось загрузить информацию об участнике');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [participantId]);

  const handleOpenLink = async () => {
    if (!participant?.link) return;
    try {
      const supported = await Linking.canOpenURL(participant.link);
      if (supported) {
        await Linking.openURL(participant.link);
      } else {
        Alert.alert('Ошибка', 'Не удалось открыть ссылку');
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось открыть ссылку');
    }
  };

  const handleFindOnMap = () => {
    if (!participant) return;
    navigation.navigate('Map', { standId: participant.id });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header
          title="Участник"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </View>
    );
  }

  if (error || !participant) {
    return (
      <View style={styles.container}>
        <Header
          title="Участник"
          showBackButton
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.centered}>
          <Ionicons name="alert-circle-outline" size={56} color={colors.error} />
          <Text style={styles.errorText}>{error ?? 'Участник не найден'}</Text>
          <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.outlineBtnText}>Назад</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const avatarColor = getAvatarColor(participant.id);

  return (
    <View style={styles.container}>
      <Header
        title={participant.name}
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          {/* Logo / Avatar */}
          <View style={[styles.logoBubble, { backgroundColor: avatarColor + '22' }]}>
            {participant.logo ? (
              <Image
                source={{ uri: participant.logo }}
                style={styles.logoImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={[styles.logoInitials, { color: avatarColor }]}>
                {getInitials(participant.name)}
              </Text>
            )}
          </View>

          {/* Name and title */}
          <Text style={styles.participantName}>{participant.name}</Text>
          {participant.title && (
            <Text style={styles.participantTitle}>{participant.title}</Text>
          )}

          {/* Partner badge */}
          {participant.is_partner && (
            <View style={styles.partnerBadge}>
              <Ionicons name="star" size={14} color={colors.secondary} />
              <Text style={styles.partnerBadgeText}>Официальный партнёр</Text>
            </View>
          )}
        </View>

        {/* Info rows */}
        <View style={styles.infoSection}>
          {participant.country && (
            <InfoRow
              icon="globe-outline"
              label="Страна"
              value={participant.country.name}
            />
          )}
          {participant.macro_territory && (
            <InfoRow
              icon="map-outline"
              label="Макротерритория"
              value={participant.macro_territory.name}
            />
          )}
        </View>

        {/* Description */}
        {participant.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Об участнике</Text>
            <Text style={styles.descriptionText}>{participant.description}</Text>
          </View>
        )}

        {/* Tourism types */}
        {participant.tourism_types && participant.tourism_types.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Виды туризма</Text>
            <View style={styles.chipsWrap}>
              {participant.tourism_types.map((tt) => (
                <View key={tt.id} style={styles.typeChip}>
                  <Text style={styles.typeChipText}>{tt.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Activity areas */}
        {participant.activity_areas && participant.activity_areas.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Направления деятельности</Text>
            <View style={styles.chipsWrap}>
              {participant.activity_areas.map((area) => (
                <View key={area.id} style={[styles.typeChip, styles.areaChip]}>
                  <Text style={[styles.typeChipText, styles.areaChipText]}>{area.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.primaryBtn} onPress={handleFindOnMap} activeOpacity={0.8}>
            <Ionicons name="map-outline" size={20} color={colors.text.white} />
            <Text style={styles.primaryBtnText}>Найти на карте</Text>
          </TouchableOpacity>

          {participant.link && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleOpenLink}
              activeOpacity={0.8}
            >
              <Ionicons name="open-outline" size={20} color={colors.primary} />
              <Text style={styles.secondaryBtnText}>Открыть сайт</Text>
            </TouchableOpacity>
          )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.text.secondary,
  },
  errorText: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  outlineBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginTop: spacing.sm,
  },
  outlineBtnText: {
    ...typography.buttonSmall,
    color: colors.primary,
  },
  // Hero
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  logoBubble: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.md,
  },
  logoInitials: {
    fontSize: 36,
    fontWeight: '700',
  },
  participantName: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
  },
  participantTitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  partnerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.secondary + '18',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    marginTop: spacing.xs,
  },
  partnerBadgeText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
  },
  // Info rows
  infoSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  descriptionText: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
  },
  // Chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChip: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.round,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipText: {
    ...typography.caption,
    color: colors.text.primary,
  },
  areaChip: {
    backgroundColor: colors.primary + '12',
    borderColor: colors.primary + '30',
  },
  areaChipText: {
    color: colors.primary,
  },
  // Action buttons
  actionsSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    ...shadows.small,
  },
  primaryBtnText: {
    ...typography.buttonSmall,
    color: colors.text.white,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  secondaryBtnText: {
    ...typography.buttonSmall,
    color: colors.primary,
  },
});

export default ParticipantDetailScreen;
