import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: windowHeight } = Dimensions.get('window');

import { RootStackParamList, UserProfile } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, shadows, borderRadius } from '../theme/spacing';

type MainMenuNavigationProp = StackNavigationProp<RootStackParamList, 'Main'>;

interface MenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: keyof RootStackParamList;
  color: string;
}

const menuItems: MenuItem[] = [
  {
    id: 'map',
    title: 'Карта фестиваля',
    icon: 'map-outline',
    screen: 'Map',
    color: colors.categoryColors.blue,
  },
  {
    id: 'program',
    title: 'Программа фестиваля',
    icon: 'calendar-outline',
    screen: 'Program',
    color: colors.categoryColors.green,
  },
  {
    id: 'offers',
    title: 'Скидки и спецпредложения',
    icon: 'gift-outline',
    screen: 'Offers',
    color: colors.categoryColors.orange,
  },
  {
    id: 'excursions',
    title: 'Экскурсии БЧП',
    icon: 'walk-outline',
    screen: 'Excursions',
    color: colors.categoryColors.teal,
  },
  {
    id: 'quest',
    title: 'Квест',
    icon: 'trophy-outline',
    screen: 'Quest',
    color: colors.categoryColors.amber,
  },
  {
    id: 'faq',
    title: 'Часто задаваемые вопросы',
    icon: 'help-circle-outline',
    screen: 'FAQ',
    color: colors.categoryColors.purple,
  },
];

const STORAGE_KEY_PROFILE = '@user_profile';

const MainMenuScreen: React.FC = () => {
  const navigation = useNavigation<MainMenuNavigationProp>();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState('Путешественник');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profileJson = await AsyncStorage.getItem(STORAGE_KEY_PROFILE);
      if (profileJson) {
        const profile: UserProfile = JSON.parse(profileJson);
        setUserName(profile.name);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleMenuPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen as any);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const bottomPadding = Platform.OS === 'web' ? 20 : insets.bottom;
  const [menuVisible, setMenuVisible] = useState(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top },
      Platform.OS === 'web' && styles.webContainer
    ]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileSection}
          onPress={handleProfilePress}
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={24} color={colors.primary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Привет, {userName}!</Text>
            <Text style={styles.status}>Путешественник</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={toggleMenu}>
          <Ionicons name={menuVisible ? "close" : "menu"} size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      {menuVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setMenuVisible(false); navigation.navigate('Profile'); }}
          >
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.dropdownText}>Профиль</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setMenuVisible(false); navigation.navigate('MySchedule'); }}
          >
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.dropdownText}>Моё расписание</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setMenuVisible(false); navigation.navigate('Suitcase'); }}
          >
            <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
            <Text style={styles.dropdownText}>Чемодан скидок</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dropdownItem}
            onPress={() => { setMenuVisible(false); navigation.navigate('Feedback'); }}
          >
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={styles.dropdownText}>Оставить отзыв</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Menu Items */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === 'web' && { paddingBottom: 20 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuCard}
            onPress={() => handleMenuPress(item.screen)}
            activeOpacity={0.7}
          >
            <View
              style={[styles.iconContainer, { backgroundColor: item.color }]}
            >
              <Ionicons name={item.icon} size={28} color={colors.text.white} />
            </View>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={[
        styles.bottomBar,
        { paddingBottom: bottomPadding },
        Platform.OS === 'web' && styles.webBottomBar
      ]}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={24} color={colors.text.secondary} />
          <Text style={styles.tabLabel}>Профиль</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('MySchedule')}
        >
          <Ionicons name="calendar-outline" size={24} color={colors.text.secondary} />
          <Text style={styles.tabLabel}>Моё</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Suitcase')}
        >
          <Ionicons name="briefcase-outline" size={24} color={colors.text.secondary} />
          <Text style={styles.tabLabel}>Чемодан</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Feedback')}
        >
          <Ionicons name="chatbubble-outline" size={24} color={colors.text.secondary} />
          <Text style={styles.tabLabel}>Отзыв</Text>
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
  webContainer: {
    height: '100%',
    maxHeight: '100dvh' as any,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 100,
    right: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
    minWidth: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    marginLeft: spacing.md,
  },
  greeting: {
    ...typography.h3,
    color: colors.text.primary,
  },
  status: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  menuButton: {
    padding: spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuTitle: {
    flex: 1,
    ...typography.body,
    color: colors.text.primary,
    fontWeight: '500',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  webBottomBar: {
    flexShrink: 0,
    paddingBottom: 'env(safe-area-inset-bottom, 20px)' as any,
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tabLabel: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
});

export default MainMenuScreen;
