import React, { useState } from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import MaskedTextInput, { Mask } from 'react-native-mask-input';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { borderRadius, spacing } from '../../theme/spacing';

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string, rawText: string) => void;
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  placeholder?: string;
}

// Phone mask: +7 (999) 999-99-99
const phoneMask: Mask = [
  '+',
  '7',
  ' ',
  '(',
  /\d/,
  /\d/,
  /\d/,
  ')',
  ' ',
  /\d/,
  /\d/,
  /\d/,
  '-',
  /\d/,
  /\d/,
  '-',
  /\d/,
  /\d/,
];

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  label = 'Ваш номер телефона',
  error,
  containerStyle,
  placeholder = '+7 (999) 123-45-67',
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={styles.label}>
          {label}
          <Text style={styles.required}> *</Text>
        </Text>
      )}
      <MaskedTextInput
        mask={phoneMask}
        value={value}
        onChangeText={(masked: string, unmasked: string) => {
          onChangeText(masked, unmasked);
        }}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        keyboardType="phone-pad"
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.body,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text.primary,
    minHeight: 52,
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: colors.error,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default PhoneInput;
