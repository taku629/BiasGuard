import { Platform } from 'react-native';

export const MARKET_DATA_MODE: 'mock' | 'production' = __DEV__ ? 'mock' : 'production';

if (!__DEV__ && MARKET_DATA_MODE !== 'production') {
    throw new Error('FATAL: MockMarketDataProvider is prohibited in production.');
}

export const REVENUECAT_IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || '';
export const REVENUECAT_ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || '';

if (!__DEV__) {
    if (REVENUECAT_IOS_API_KEY.includes('test_') || REVENUECAT_ANDROID_API_KEY.includes('test_')) {
        throw new Error('FATAL: RevenueCat Test Store keys are prohibited in production.');
    }
}

export const getRevenueCatApiKey = () => {
    if (Platform.OS === 'ios') {
        if (!__DEV__ && !REVENUECAT_IOS_API_KEY) throw new Error('Missing iOS RevenueCat API Key');
        return REVENUECAT_IOS_API_KEY;
    } else if (Platform.OS === 'android') {
        if (!__DEV__ && !REVENUECAT_ANDROID_API_KEY) throw new Error('Missing Android RevenueCat API Key');
        return REVENUECAT_ANDROID_API_KEY;
    }
    return '';
};

export const FEATURE_MATRIX = {
  FREE: [
    "1 Portfolio",
    "Basic risk metrics",
    "Overconfidence assessment",
    "Basic Behavioral Insights"
  ],
  PRO: [
    "Multiple Portfolios",
    "Full 5-signal Behavioral Dashboard",
    "Portfolio comparison",
    "Advanced risk metrics",
    "Detailed behavioral explanations"
  ]
};
