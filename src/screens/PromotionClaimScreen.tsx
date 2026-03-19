import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, borderRadius } from '../theme/spacing';
import { promotionsApi } from '../api/promotions';

type PromotionClaimNavigationProp = StackNavigationProp<RootStackParamList, 'PromotionClaim'>;
type PromotionClaimRouteProp = RouteProp<RootStackParamList, 'PromotionClaim'>;

type SubmitStatus = 'idle' | 'loading' | 'success' | 'error';

function isValidEmail(email: string): boolean {
  return email.includes('@') && email.includes('.') && email.trim().length > 4;
}

const PromotionClaimScreen: React.FC = () => {
  const navigation = useNavigation<PromotionClaimNavigationProp>();
  const route = useRoute<PromotionClaimRouteProp>();
  const insets = useSafeAreaInsets();

  const { promotionId, promotionName } = route.params;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validate = useCallback((): boolean => {
    let valid = true;

    if (!name.trim()) {
      setNameError('Введите ваше имя');
      valid = false;
    } else {
      setNameError('');
    }

    if (!email.trim()) {
      setEmailError('Введите email');
      valid = false;
    } else if (!isValidEmail(email.trim())) {
      setEmailError('Введите корректный email');
      valid = false;
    } else {
      setEmailError('');
    }

    return valid;
  }, [name, email]);

  const handleSubmit = useCallback(async () => {
    if (!validate()) return;

    setSubmitStatus('loading');
    setErrorMessage('');

    try {
      await promotionsApi.claimPromotion(promotionId, {
        name: name.trim(),
        email: email.trim(),
      });
      setSubmitStatus('success');
    } catch (err: any) {
      setSubmitStatus('error');
      setErrorMessage(
        err?.response?.data?.detail
        ?? err?.message
        ?? 'Не удалось отправить запрос. Попробуйте позже.',
      );
    }
  }, [validate, promotionId, name, email]);

  const handleGoBack = useCallback(() => {
    // Pop back to Promotions (not just one screen)
    navigation.navigate('Promotions');
  }, [navigation]);

  if (submitStatus === 'success') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Получить скидку</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={72} color={colors.success} />
          </View>
          <Text style={styles.successTitle}>Скидка отправлена!</Text>
          <Text style={styles.successSubtitle}>
            Информация о скидке и промокод отправлены на{'\n'}
            <Text style={styles.successEmail}>{email}</Text>
          </Text>
          <Text style={styles.successHint}>
            Проверьте папку «Спам», если письмо не пришло в течение нескольких минут.
          </Text>

          <TouchableOpacity
            style={styles.backToPromoBtn}
            onPress={handleGoBack}
            activeOpacity={0.85}
          >
            <Text style={styles.backToPromoBtnText}>Вернуться к скидкам</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Получить скидку</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + spacing.xxl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Promotion name card */}
        <View style={styles.promoCard}>
          <View style={styles.promoCardIcon}>
            <Ionicons name="pricetag" size={20} color={colors.text.white} />
          </View>
          <Text style={styles.promoCardName} numberOfLines={3}>
            {promotionName}
          </Text>
        </View>

        {/* Info text */}
        <Text style={styles.infoText}>
          Заполните форму — мы пришлём промокод и условия получения скидки на указанный email.
        </Text>

        {/* Form */}
        <View style={styles.form}>
          {/* Name field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Имя</Text>
            <View style={[styles.inputWrapper, nameError ? styles.inputWrapperError : null]}>
              <Ionicons
                name="person-outline"
                size={18}
                color={nameError ? colors.error : colors.text.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  if (nameError) setNameError('');
                }}
                placeholder="Ваше имя"
                placeholderTextColor={colors.text.secondary}
                returnKeyType="next"
                autoCapitalize="words"
                autoCorrect={false}
                editable={submitStatus !== 'loading'}
              />
            </View>
            {nameError ? <Text style={styles.fieldError}>{nameError}</Text> : null}
          </View>

          {/* Email field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <View style={[styles.inputWrapper, emailError ? styles.inputWrapperError : null]}>
              <Ionicons
                name="mail-outline"
                size={18}
                color={emailError ? colors.error : colors.text.secondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                placeholder="your@email.com"
                placeholderTextColor={colors.text.secondary}
                keyboardType="email-address"
                returnKeyType="done"
                autoCapitalize="none"
                autoCorrect={false}
                onSubmitEditing={handleSubmit}
                editable={submitStatus !== 'loading'}
              />
            </View>
            {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
          </View>

          {/* API error */}
          {submitStatus === 'error' && errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={18} color={colors.error} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Submit button */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              submitStatus === 'loading' && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitStatus === 'loading'}
            activeOpacity={0.85}
          >
            {submitStatus === 'loading' ? (
              <ActivityIndicator size="small" color={colors.text.white} />
            ) : (
              <>
                <Ionicons name="send-outline" size={18} color={colors.text.white} />
                <Text style={styles.submitBtnText}>Отправить</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Privacy note */}
          <Text style={styles.privacyNote}>
            Нажимая «Отправить», вы соглашаетесь на обработку персональных данных
            в соответствии с политикой конфиденциальности.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  // Promo card
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  promoCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  promoCardName: {
    ...typography.body,
    color: colors.text.white,
    fontWeight: '600',
    flex: 1,
  },
  // Info text
  infoText: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  // Form
  form: {
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.bodySmall,
    color: colors.text.primary,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
  },
  inputWrapperError: {
    borderColor: colors.error,
    backgroundColor: '#FFF5F5',
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    ...typography.body,
    color: colors.text.primary,
  },
  fieldError: {
    ...typography.captionSmall,
    color: colors.error,
    marginTop: 2,
  },
  // Error banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: '#FFEBEE',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  errorBannerText: {
    ...typography.bodySmall,
    color: colors.error,
    flex: 1,
  },
  // Submit button
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md + 2,
    marginTop: spacing.sm,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    ...typography.button,
    color: colors.text.white,
    fontWeight: '600',
  },
  privacyNote: {
    ...typography.captionSmall,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Success screen
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successSubtitle: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  successEmail: {
    color: colors.primary,
    fontWeight: '600',
  },
  successHint: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  backToPromoBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    minWidth: 220,
  },
  backToPromoBtnText: {
    ...typography.buttonSmall,
    color: colors.text.white,
    fontWeight: '600',
  },
});

export default PromotionClaimScreen;
