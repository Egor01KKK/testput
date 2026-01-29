import { Linking, Platform } from 'react-native';

export const openMaps = async (
  latitude: number,
  longitude: number,
  label?: string
): Promise<void> => {
  const encodedLabel = label ? encodeURIComponent(label) : '';

  // Try Yandex Maps first
  const yandexUrl = `yandexmaps://maps.yandex.ru/?pt=${longitude},${latitude}&z=17&l=map`;
  const yandexWebUrl = `https://maps.yandex.ru/?pt=${longitude},${latitude}&z=17&l=map`;

  try {
    const canOpenYandex = await Linking.canOpenURL(yandexUrl);
    if (canOpenYandex) {
      await Linking.openURL(yandexUrl);
      return;
    }
  } catch (error) {
    console.log('Yandex Maps not available');
  }

  // Fallback to system maps
  const scheme = Platform.select({
    ios: `maps://app?daddr=${latitude},${longitude}&q=${encodedLabel}`,
    android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
  });

  if (scheme) {
    try {
      await Linking.openURL(scheme);
    } catch (error) {
      // Final fallback to web
      await Linking.openURL(yandexWebUrl);
    }
  }
};

export const buildRoute = async (
  destinationLat: number,
  destinationLng: number,
  mode: 'walking' | 'driving' | 'transit' = 'walking'
): Promise<void> => {
  const routeTypes: Record<string, string> = {
    walking: 'pd',
    driving: 'auto',
    transit: 'mt',
  };

  const yandexUrl = `yandexmaps://maps.yandex.ru/?rtext=~${destinationLat},${destinationLng}&rtt=${routeTypes[mode]}`;
  const yandexWebUrl = `https://maps.yandex.ru/?rtext=~${destinationLat},${destinationLng}&rtt=${routeTypes[mode]}`;

  try {
    const canOpen = await Linking.canOpenURL(yandexUrl);
    if (canOpen) {
      await Linking.openURL(yandexUrl);
      return;
    }
  } catch (error) {
    console.log('Yandex Maps app not available');
  }

  await Linking.openURL(yandexWebUrl);
};

export const openUrl = async (url: string): Promise<void> => {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  } catch (error) {
    console.error('Error opening URL:', error);
  }
};

export const makeCall = (phoneNumber: string): void => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  Linking.openURL(`tel:${cleaned}`);
};

export const sendEmail = (email: string, subject?: string, body?: string): void => {
  let url = `mailto:${email}`;
  const params: string[] = [];

  if (subject) {
    params.push(`subject=${encodeURIComponent(subject)}`);
  }
  if (body) {
    params.push(`body=${encodeURIComponent(body)}`);
  }

  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }

  Linking.openURL(url);
};
