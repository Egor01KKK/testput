import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList, UserProfile } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius, shadows } from '../theme/spacing';
import { Header, Button, Input } from '../components/common';

type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>;

const STORAGE_KEY_PROFILE = '@user_profile';

interface ProfileMenuItem {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  screen: keyof RootStackParamList;
}

const menuItems: ProfileMenuItem[] = [
  {
    id: 'schedule',
    icon: 'calendar-outline',
    title: 'Мои активности',
    subtitle: 'Запланированные мероприятия',
    screen: 'MySchedule',
  },
  {
    id: 'favorites',
    icon: 'heart-outline',
    title: 'Любимые локации',
    subtitle: 'Сохранённые стенды',
    screen: 'Favorites',
  },
  {
    id: 'suitcase',
    icon: 'briefcase-outline',
    title: 'Чемодан скидок',
    subtitle: 'Ваши спецпредложения',
    screen: 'Suitcase',
  },
  {
    id: 'feedback',
    icon: 'chatbubble-outline',
    title: 'Мои впечатления',
    subtitle: 'Оставить отзыв',
    screen: 'Feedback',
  },
];

const getUserStatus = (activitiesCount: number): string => {
  if (activitiesCount >= 11) return 'Исследователь';
  if (activitiesCount >= 4) return 'Путешественник';
  return 'Новичок';
};

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profileJson = await AsyncStorage.getItem(STORAGE_KEY_PROFILE);
      if (profileJson) {
        const loadedProfile: UserProfile = JSON.parse(profileJson);
        setProfile(loadedProfile);
        setEditName(loadedProfile.name);
        setEditEmail(loadedProfile.email || '');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (profile) {
      const updatedProfile: UserProfile = {
        ...profile,
        name: editName,
        email: editEmail || undefined,
      };
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY_PROFILE,
          JSON.stringify(updatedProfile)
        );
        setProfile(updatedProfile);
        setEditModalVisible(false);
      } catch (error) {
        console.error('Error saving profile:', error);
      }
    }
  };

  const handleMenuPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as any);
  };

  const activitiesCount = 5; // TODO: Get from actual data
  const userStatus = getUserStatus(activitiesCount);

  return (
    <View style={styles.container}>
      <Header
        title="Личный кабинет"
        showBackButton
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color={colors.primary} />
            </View>
          </View>
          <Text style={styles.userName}>{profile?.name || 'Гость'}</Text>
          <View style={styles.statusBadge}>
            <Ionicons name="trophy" size={16} color={colors.secondary} />
            <Text style={styles.statusText}>{userStatus}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
            <Text style={styles.editButtonText}>Редактировать профиль</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => handleMenuPress(item.screen)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon} size={24} color={colors.primary} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top + spacing.md }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <Text style={styles.modalCancel}>Отмена</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Редактировать</Text>
            <TouchableOpacity onPress={handleSaveProfile}>
              <Text style={styles.modalSave}>Сохранить</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Input
              label="Имя"
              value={editName}
              onChangeText={setEditName}
              placeholder="Введите имя"
            />
            <View style={styles.phoneContainer}>
              <Text style={styles.phoneLabel}>Телефон</Text>
              <Text style={styles.phoneValue}>{profile?.phone || '-'}</Text>
              <Text style={styles.phoneHint}>
                Номер телефона изменить нельзя
              </Text>
            </View>
            <Input
              label="Email"
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
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
  profileCard: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  userName: {
    ...typography.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  statusText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '600',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  editButtonText: {
    ...typography.body,
    color: colors.primary,
  },
  menuContainer: {
    padding: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text.primary,
  },
  menuSubtitle: {
    ...typography.caption,
    color: colors.text.secondary,
    marginTop: spacing.xs,
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
  modalCancel: {
    ...typography.body,
    color: colors.text.secondary,
  },
  modalSave: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    padding: spacing.lg,
  },
  phoneContainer: {
    marginBottom: spacing.md,
  },
  phoneLabel: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  phoneValue: {
    ...typography.body,
    color: colors.text.secondary,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  phoneHint: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});

export default ProfileScreen;
