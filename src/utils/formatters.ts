import { format, parseISO, isToday, isTomorrow, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatPrice = (price: number): string => {
  return price.toLocaleString('ru-RU') + ' ₽';
};

export const formatDate = (dateString: string, formatStr: string = 'd MMMM'): string => {
  try {
    const date = parseISO(dateString);
    return format(date, formatStr, { locale: ru });
  } catch {
    return dateString;
  }
};

export const formatDateShort = (dateString: string): string => {
  return formatDate(dateString, 'dd.MM');
};

export const formatDateFull = (dateString: string): string => {
  return formatDate(dateString, 'd MMMM yyyy');
};

export const formatTime = (time: string): string => {
  return time;
};

export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${startTime} — ${endTime}`;
};

export const getRelativeDate = (dateString: string): string => {
  const date = parseISO(dateString);

  if (isToday(date)) {
    return 'Сегодня';
  }

  if (isTomorrow(date)) {
    return 'Завтра';
  }

  const days = differenceInDays(date, new Date());
  if (days > 0 && days <= 7) {
    return `Через ${days} ${getDaysWord(days)}`;
  }

  return formatDate(dateString);
};

const getDaysWord = (days: number): string => {
  if (days === 1) return 'день';
  if (days >= 2 && days <= 4) return 'дня';
  return 'дней';
};

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9, 11)}`;
  }
  return phone;
};

export const formatDiscount = (percent: number): string => {
  return `-${percent}%`;
};
