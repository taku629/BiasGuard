import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useBilling } from '@/contexts/BillingContext';
import { useRouter } from 'expo-router';

export default function PaywallScreen() {
  const { status, currentOffering, purchase, restore } = useBilling();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.text}>Loading billing info...</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>There was an error loading subscription options.</Text>
        <TouchableOpacity style={styles.button} onPress={restore}>
          <Text style={styles.buttonText}>Try Restoring Purchases</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'pro') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You are a Pro!</Text>
        <Text style={styles.text}>Thank you for your subscription. All features are unlocked.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const pkg = currentOffering?.availablePackages[0];

  if (!pkg) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No subscription offering is currently available.</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePurchase = async () => {
    try {
      await purchase(pkg);
    } catch (e) {
      Alert.alert("Purchase Failed", "Could not complete the purchase.");
    }
  };

  const handleRestore = async () => {
    try {
      await restore();
      Alert.alert("Restore Complete", "Your purchases have been restored if they were found.");
    } catch (e) {
      Alert.alert("Restore Failed", "Could not restore purchases.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upgrade to Pro</Text>
      
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitTitle}>Free Plan</Text>
        <Text style={styles.benefitText}>• Basic portfolio tracking</Text>
        <Text style={styles.benefitText}>• Limited behavioral insights</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.benefitTitle}>Pro Plan</Text>
        <Text style={styles.benefitText}>• Unlimited portfolios</Text>
        <Text style={styles.benefitText}>• Advanced AI behavioral analysis</Text>
        <Text style={styles.benefitText}>• Priority alerts</Text>
        <Text style={styles.benefitText}>• Custom dashboards</Text>
      </View>

      <View style={styles.priceContainer}>
        <Text style={styles.price}>{pkg.product.priceString}</Text>
        <Text style={styles.priceSub}> / {pkg.packageType === 'ANNUAL' ? 'year' : pkg.packageType === 'MONTHLY' ? 'month' : 'period'}</Text>
      </View>

      <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
        <Text style={styles.purchaseButtonText}>Subscribe Now</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.restoreButton} onPress={handleRestore}>
        <Text style={styles.restoreButtonText}>Restore Purchases</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  text: {
    color: '#cccccc',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  benefitsContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 32,
  },
  benefitTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  benefitText: {
    color: '#cccccc',
    fontSize: 15,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#333333',
    marginVertical: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  price: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  priceSub: {
    fontSize: 16,
    color: '#888888',
  },
  purchaseButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  purchaseButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  restoreButton: {
    paddingVertical: 12,
  },
  restoreButtonText: {
    color: '#888888',
    fontSize: 16,
  },
});
