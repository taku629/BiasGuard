import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEYS = {
  ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '',
  android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '',
};

export const setupRevenueCat = async () => {
  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  }

  try {
    if (Platform.OS === 'ios' && API_KEYS.ios) {
      Purchases.configure({ apiKey: API_KEYS.ios });
    } else if (Platform.OS === 'android' && API_KEYS.android) {
      Purchases.configure({ apiKey: API_KEYS.android });
    }
  } catch (error) {
    console.error('Failed to configure RevenueCat:', error);
  }
};
