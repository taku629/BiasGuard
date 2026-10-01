/**
 * RevenueCat Billing Service Integration
 * This service is responsible for handling all in-app purchases and subscriptions.
 * RevenueCat serves as the single source of truth for the user's subscription status.
 */

import Purchases, { CustomerInfo, PurchasesPackage, PurchasesOfferings } from 'react-native-purchases';
import { Platform, Alert } from 'react-native';

export class RevenueCatService {
  private configured = false;

  /**
   * Initializes the RevenueCat SDK.
   * Call this early in the app lifecycle.
   */
  async initialize(): Promise<void> {
    if (this.configured) return;

    const apiKey = Platform.OS === 'ios' 
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY 
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

    if (!apiKey) {
      console.warn("No RevenueCat API key provided. Failing closed.");
      return;
    }

    try {
      Purchases.configure({ apiKey });
      this.configured = true;
    } catch (e: any) {
      console.error("RC Init Error:", e);
    }
  }

  /**
   * Logs a user into RevenueCat using their unique App UID.
   * @param uid The unique identifier for the user.
   */
  async login(uid: string): Promise<void> {
    if (!this.configured) return;
    try {
      await Purchases.logIn(uid);
    } catch (e: any) {
      console.error("RC Login Error:", e);
    }
  }

  /**
   * Logs out the user from RevenueCat.
   */
  async logout(): Promise<void> {
    if (!this.configured) return;
    try {
      await Purchases.logOut();
    } catch (e: any) {
      console.error("RC Logout Error:", e);
    }
  }

  /**
   * Retrieves the latest customer info from RevenueCat.
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!this.configured) return null;
    try {
      return await Purchases.getCustomerInfo();
    } catch (e: any) {
      console.error("RC getCustomerInfo Error:", e);
      return null;
    }
  }

  /**
   * Checks if the user has an active 'pro' entitlement.
   */
  async isPro(): Promise<boolean> {
    if (!this.configured) return false;
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return customerInfo.entitlements.active['pro'] !== undefined;
    } catch (e: any) {
      console.error("RC isPro Error:", e);
      return false;
    }
  }

  /**
   * Retrieves available offerings.
   */
  async getOfferings(): Promise<PurchasesOfferings | null> {
    if (!this.configured) return null;
    try {
      return await Purchases.getOfferings();
    } catch (e: any) {
      console.error("RC getOfferings Error:", e);
      return null;
    }
  }

  /**
   * Restores any previous purchases made by the user.
   */
  async restorePurchases(): Promise<CustomerInfo | null> {
    if (!this.configured) return null;
    try {
      return await Purchases.restorePurchases();
    } catch (e: any) {
      console.error("RC restorePurchases Error:", e);
      Alert.alert('Restore Error', e.message);
      return null;
    }
  }

  /**
   * Initiates a purchase flow for a specific package.
   * @param pkg The package to purchase.
   */
  async purchasePackage(pkg: PurchasesPackage): Promise<{ customerInfo: CustomerInfo }> {
    if (!this.configured) throw new Error("RevenueCat not configured");
    try {
      return await Purchases.purchasePackage(pkg);
    } catch (e: any) {
      console.error("RC purchasePackage Error:", e);
      if (!e.userCancelled) {
        Alert.alert('Purchase Error', e.message);
      }
      throw e;
    }
  }
}

export const RevenueCat = new RevenueCatService();
