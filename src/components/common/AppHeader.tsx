import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

  return (
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
          <TouchableOpacity style={styles.loginButton} onPress={onLoginPress}>
            <Text style={styles.loginText}>Войти</Text>
          </TouchableOpacity>
        )}
        {showMenu && (
          <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
            <Ionicons name="menu" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
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
