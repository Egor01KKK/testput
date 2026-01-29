import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

const { width, height } = Dimensions.get('window');

const WelcomeScreen: React.FC = () => {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const handleStart = () => {
    navigation.navigate('Registration');
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/welcome-bg.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Dark gradient overlay at bottom */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradient}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 0, y: 1 }}
        />

        {/* Content */}
        <View style={[styles.content, { paddingTop: insets.top + spacing.md }]}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoSubtitle}>МЕЖДУНАРОДНЫЙ{'\n'}ТУРИСТИЧЕСКИЙ ФОРУМ</Text>
            <Text style={styles.logoTitle}>ПУТЕШЕСТВУЙ!</Text>
          </View>

          {/* Frog mascot */}
          <Image
            source={require('../../assets/images/frog-hello.png')}
            style={styles.frogImage}
            resizeMode="contain"
          />

          {/* Main text */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>Привет, турист!</Text>
            <Text style={styles.description}>
              Хочешь путешествовать больше и узнавать о выгодных турах и незабываемых локациях?
              {'\n'}Тогда скорее начинай путешествие!
            </Text>
          </View>

          {/* CTA Button */}
          <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + spacing.xl }]}>
            <TouchableOpacity style={styles.button} onPress={handleStart}>
              <Text style={styles.buttonText}>Начать путешествие</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'flex-start',
  },
  logoSubtitle: {
    fontFamily: 'Geometria-Medium',
    fontSize: 10,
    color: colors.text.white,
    letterSpacing: 1,
    marginBottom: 4,
  },
  logoTitle: {
    fontFamily: 'Geometria-Bold',
    fontSize: 28,
    color: colors.text.white,
    letterSpacing: 2,
  },
  frogImage: {
    width: 180,
    height: 180,
    position: 'absolute',
    left: -20,
    top: height * 0.28,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.xl,
  },
  title: {
    fontFamily: 'Geometria-Bold',
    fontSize: 38,
    color: colors.text.white,
    marginBottom: spacing.md,
  },
  description: {
    fontFamily: 'Geometria-Medium',
    fontSize: 16,
    color: colors.text.white,
    lineHeight: 24,
    opacity: 0.95,
  },
  buttonContainer: {
    paddingHorizontal: spacing.sm,
  },
  button: {
    backgroundColor: colors.background,
    paddingVertical: 20,
    paddingHorizontal: spacing.xl,
    borderRadius: 99,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Geometria-Medium',
    fontSize: 20,
    color: colors.primary,
  },
});

export default WelcomeScreen;
