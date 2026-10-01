import React, { createContext, useContext, useEffect, useState } from 'react';
import { CustomerInfo, PurchasesOffering, PurchasesPackage, PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { RevenueCat } from '@/services/billing/RevenueCat';
import { useAuth } from '@/hooks/useAuth';

export type BillingStatus = 'loading' | 'free' | 'pro' | 'unavailable' | 'error';

export interface BillingState {
  status: BillingStatus;
  customerInfo?: CustomerInfo;
  activeEntitlements: string[];
  currentOffering?: PurchasesOffering;
}

interface BillingContextType extends BillingState {
  purchase: (pkg: PurchasesPackage) => Promise<void>;
  restore: () => Promise<void>;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  
  const [state, setState] = useState<BillingState>({
    status: 'loading',
    activeEntitlements: [],
  });

  useEffect(() => {
    const initBilling = async () => {
      try {
        await RevenueCat.initialize();

        if (authLoading) return;

        if (!user) {
          await RevenueCat.logout();
          setState({ status: 'free', activeEntitlements: [] });
          return;
        }

        await RevenueCat.login(user.uid);
        
        const offerings = await RevenueCat.getOfferings();
        const currentOffering = offerings?.current || undefined;
        
        const customerInfo = await RevenueCat.getCustomerInfo();
        const activeEntitlements = Object.keys(customerInfo?.entitlements.active || {});
        const isPro = activeEntitlements.includes('pro');

        setState({
          status: isPro ? 'pro' : (currentOffering ? 'free' : 'unavailable'),
          customerInfo: customerInfo || undefined,
          activeEntitlements,
          currentOffering
        });

      } catch (error) {
        console.error("Billing initialization error:", error);
        setState((prev) => ({ ...prev, status: 'error' }));
      }
    };

    initBilling();
  }, [user, authLoading]);

  const updateCustomerInfo = (customerInfo: CustomerInfo | null) => {
    if (!customerInfo) return;
    const activeEntitlements = Object.keys(customerInfo.entitlements.active);
    const isPro = activeEntitlements.includes('pro');
    
    setState((prev) => ({
      ...prev,
      status: isPro ? 'pro' : prev.status === 'pro' ? 'free' : prev.status,
      customerInfo,
      activeEntitlements,
    }));
  };

  const purchase = async (pkg: PurchasesPackage) => {
    try {
      setState(prev => ({ ...prev, status: 'loading' }));
      const { customerInfo } = await RevenueCat.purchasePackage(pkg);
      updateCustomerInfo(customerInfo);
    } catch (error: any) {
      if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        setState(prev => ({ 
          ...prev, 
          status: prev.activeEntitlements.includes('pro') ? 'pro' : (prev.currentOffering ? 'free' : 'unavailable')
        }));
      } else {
        console.error("Purchase error:", error);
        setState(prev => ({ ...prev, status: 'error' }));
      }
    }
  };

  const restore = async () => {
    try {
      setState(prev => ({ ...prev, status: 'loading' }));
      const customerInfo = await RevenueCat.restorePurchases();
      updateCustomerInfo(customerInfo);
    } catch (error: any) {
      console.error("Restore error:", error);
      setState(prev => ({ ...prev, status: 'error' }));
    }
  };

  return (
    <BillingContext.Provider value={{ ...state, purchase, restore }}>
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (context === undefined) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};
