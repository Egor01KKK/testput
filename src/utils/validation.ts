import { z } from 'zod';

export const nameSchema = z
  .string()
  .min(2, 'Имя должно содержать минимум 2 символа')
  .regex(/^[а-яА-ЯёЁa-zA-Z\s]+$/, 'Имя может содержать только буквы');

export const phoneSchema = z
  .string()
  .min(10, 'Введите корректный номер телефона')
  .regex(/^\d{10}$/, 'Номер телефона должен содержать 10 цифр');

export const emailSchema = z
  .string()
  .email('Введите корректный email')
  .optional()
  .or(z.literal(''));

export const registrationSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema,
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const validateName = (name: string): string | null => {
  const result = nameSchema.safeParse(name);
  return result.success ? null : result.error.issues[0]?.message || 'Ошибка валидации';
};

export const validatePhone = (phone: string): string | null => {
  const result = phoneSchema.safeParse(phone);
  return result.success ? null : result.error.issues[0]?.message || 'Ошибка валидации';
};

export const validateEmail = (email: string): string | null => {
  if (!email) return null;
  const result = z.string().email().safeParse(email);
  return result.success ? null : 'Введите корректный email';
};
