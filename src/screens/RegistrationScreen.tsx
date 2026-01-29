import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList, UserProfile } from '../types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { AppHeader } from '../components/common';

type RegistrationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Registration'
>;

// Validation schema
const registrationSchema = z.object({
  name: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .regex(/^[а-яА-ЯёЁa-zA-Z\s]+$/, 'Имя может содержать только буквы'),
  phone: z
    .string()
    .min(10, 'Введите корректный номер телефона')
    .regex(/^\d{10}$/, 'Номер телефона должен содержать 10 цифр')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Введите корректный email')
    .optional()
    .or(z.literal('')),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const STORAGE_KEY_PROFILE = '@user_profile';
const STORAGE_KEY_REGISTERED = '@user_registered';

const RegistrationScreen: React.FC = () => {
  const navigation = useNavigation<RegistrationScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [consentChecked, setConsentChecked] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
    },
    mode: 'onChange',
  });

  const watchName = watch('name');
  const watchEmail = watch('email');
  const watchPhone = watch('phone');

  const canSubmit = consentChecked && watchName && (authMethod === 'email' ? watchEmail : watchPhone);

  const onSubmit = async (data: RegistrationFormData) => {
    if (!consentChecked) {
      Alert.alert('Внимание', 'Необходимо согласие на обработку персональных данных');
      return;
    }

    setIsSubmitting(true);
    try {
      const profile: UserProfile = {
        name: data.name,
        phone: data.phone ? `+7${data.phone}` : undefined,
        email: data.email || undefined,
        createdAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
      await AsyncStorage.setItem(STORAGE_KEY_REGISTERED, 'true');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Ошибка',
        'Не удалось завершить регистрацию. Попробуйте еще раз.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        showBackButton
        onBackPress={() => navigation.goBack()}
        showLoginButton
        showMenu
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.lg },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Title section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Паспорт путешественника</Text>
            <Text style={styles.subtitle}>
              Авторизуйтесь, чтобы сохранять понравившиеся активности в избранное и получать персональные скидки от наших партнёров.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ваше имя</Text>
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[styles.input, errors.name && styles.inputError]}
                    placeholder=""
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                )}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
            </View>

            {/* Auth method toggle */}
            <View style={styles.inputGroup}>
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    authMethod === 'email' && styles.toggleButtonActive,
                  ]}
                  onPress={() => setAuthMethod('email')}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      authMethod === 'email' && styles.toggleTextActive,
                    ]}
                  >
                    Электронная почта
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleButton,
                    authMethod === 'phone' && styles.toggleButtonActive,
                  ]}
                  onPress={() => setAuthMethod('phone')}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      authMethod === 'phone' && styles.toggleTextActive,
                    ]}
                  >
                    Телефон
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Email/Phone Input */}
              {authMethod === 'email' ? (
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.email && styles.inputError]}
                      placeholder=""
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />
              ) : (
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.phone && styles.inputError]}
                      placeholder="+7 (___) ___-__-__"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="phone-pad"
                    />
                  )}
                />
              )}
            </View>

            {/* Consent checkbox */}
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setConsentChecked(!consentChecked)}
            >
              <View style={[styles.checkbox, consentChecked && styles.checkboxChecked]}>
                {consentChecked && (
                  <Ionicons name="checkmark" size={12} color={colors.text.white} />
                )}
              </View>
              <Text style={styles.checkboxLabel}>
                Согласие на обработку персональных данных
              </Text>
            </TouchableOpacity>
          </View>

          {/* Frog mascot */}
          <View style={styles.frogContainer}>
            <Image
              source={require('../../assets/images/frog-register.png')}
              style={styles.frogImage}
              resizeMode="contain"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={!canSubmit || isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {authMethod === 'email' ? 'Отправить код на почту' : 'Отправить код на телефон'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
  },
  titleSection: {
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: 'Geometria-Bold',
    fontSize: 24,
    color: colors.primary,
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: 'Geometria-Medium',
    fontSize: 16,
    color: '#797687',
    lineHeight: 22,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: 'Geometria-Medium',
    fontSize: 16,
    color: colors.primary,
  },
  input: {
    height: 65,
    borderWidth: 1,
    borderColor: '#0068B2',
    borderRadius: 99,
    paddingHorizontal: spacing.lg,
    fontFamily: 'Geometria-Regular',
    fontSize: 16,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    fontFamily: 'Geometria-Regular',
    fontSize: 12,
    color: colors.error,
    marginLeft: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  toggleButton: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 99,
    backgroundColor: 'rgba(0, 104, 178, 0.1)',
  },
  toggleButtonActive: {
    backgroundColor: '#0068B2',
  },
  toggleText: {
    fontFamily: 'Geometria-Medium',
    fontSize: 16,
    color: '#0068B2',
  },
  toggleTextActive: {
    color: colors.text.white,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    fontFamily: 'Geometria-Medium',
    fontSize: 12,
    color: colors.primary,
    flex: 1,
  },
  frogContainer: {
    alignItems: 'flex-end',
    marginVertical: spacing.md,
  },
  frogImage: {
    width: 179,
    height: 179,
  },
  submitButton: {
    backgroundColor: '#0068B2',
    height: 65,
    borderRadius: 99,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    fontFamily: 'Geometria-Medium',
    fontSize: 20,
    color: colors.text.white,
  },
});

export default RegistrationScreen;
