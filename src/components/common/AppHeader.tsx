import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

interface AppHeaderProps {
  onBackPress?: () => void;
  showBackButton?: boolean;
  showLoginButton?: boolean;
  showMenu?: boolean;
  onLoginPress?: () => void;
  onMenuPress?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  onBackPress,
  showBackButton = true,
  showLoginButton = true,
  showMenu = true,
  onLoginPress,
  onMenuPress,
}) => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleMenuPress = () => {
    if (onMenuPress) {
      onMenuPress();
    } else {
      setMenuVisible(!menuVisible);
    }
  };

  const navigateTo = (screen: string) => {
    setMenuVisible(false);
    navigation.navigate(screen);
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top + spacing.sm }]}>
        {/* Left side - Back button */}
        <View style={styles.leftSection}>
          {showBackButton && onBackPress && (
            <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
              <View style={styles.backCircle}>
                <Ionicons name="arrow-back" size={18} color={colors.text.white} />
              </View>
              <Text style={styles.backText}>Назад</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Right side - Login and Menu */}
        <View style={styles.rightSection}>
          {showLoginButton && (
            <TouchableOpacity style={styles.loginButton} onPress={onLoginPress || (() => navigateTo('Registration'))}>
              <Text style={styles.loginText}>Войти</Text>
            </TouchableOpacity>
          )}
          {showMenu && (
            <TouchableOpacity style={styles.menuButton} onPress={handleMenuPress}>
              <Ionicons name={menuVisible ? "close" : "menu"} size={24} color={colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Dropdown Menu */}
      {menuVisible && (
        <View style={styles.dropdownMenu}>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => navigateTo('Main')}>
            <Ionicons name="home-outline" size={20} color={colors.primary} />
            <Text style={styles.dropdownText}>Главная</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => navigateTo('Profile')}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.dropdownText}>Профиль</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => navigateTo('MySchedule')}>
            <Ionicons name="calendar-outline" size={20} color={colors.primary} />
            <Text style={styles.dropdownText}>Моё расписание</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => navigateTo('Suitcase')}>
            <Ionicons name="briefcase-outline" size={20} color={colors.primary} />
            <Text style={styles.dropdownText}>Чемодан скидок</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownItem} onPress={() => navigateTo('Feedback')}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.primary} />
            <Text style={styles.dropdownText}>Оставить отзыв</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    zIndex: 100,
  },
  dropdownMenu: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 80 : 100,
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
    borderWidth: 1,
    borderColor: colors.border,
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
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0068B2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontFamily: 'Geometria-Medium',
    fontSize: 12,
    color: '#0068B2',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  loginButton: {
    backgroundColor: '#0068B2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  loginText: {
    fontFamily: 'Geometria-Medium',
    fontSize: 12,
    color: colors.text.white,
  },
  menuButton: {
    padding: 4,
  },
});

export default AppHeader;
