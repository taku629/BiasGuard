import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking, ScrollView } from 'react-native';
import { auth } from '@/config/firebase';
import { deleteAccount } from '@/services/auth/deletion';

export default function SettingsScreen() {
  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAccountDeletion = () => {
    Alert.alert(
      "Delete Account",
      "This permanently deletes your portfolios, transactions and behavioral assessment data. Disclaimer: Deleting your BiasGuard account does not automatically cancel an App Store or Google Play subscription.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
            } catch (error: any) {
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  "Re-authentication Required",
                  "For security reasons, please sign out and sign in again before deleting your account.",
                  [
                    { text: "Cancel", style: "cancel" },
                    { text: "Log Out", onPress: handleLogout }
                  ]
                );
              } else {
                Alert.alert("Error", error.message || "Failed to delete account.");
              }
            }
          }
        }
      ]
    );
  };

  const handleLink = (url: string | null, name: string) => {
    if (!url) {
      Alert.alert(`${name} Unavailable`, `The ${name} is not available yet.`);
      return;
    }
    Linking.openURL(url);
  };

  const handleRestorePurchases = () => {
    Alert.alert("Restore Purchases", "Functionality not yet implemented.");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteBtn]} onPress={handleAccountDeletion}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Subscription</Text>
        <View style={styles.row}>
          <Text style={styles.labelText}>Status:</Text>
          <Text style={styles.valueText}>Free</Text>
        </View>
        <TouchableOpacity style={styles.button} onPress={() => handleLink(null, "Manage Subscription")}>
          <Text style={styles.buttonText}>Manage Subscription</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleRestorePurchases}>
          <Text style={styles.buttonText}>Restore Purchases</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About & Legal</Text>
        <TouchableOpacity style={styles.button} onPress={() => handleLink(null, "Privacy Policy")}>
          <Text style={styles.buttonText}>Privacy Policy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleLink(null, "Terms of Service")}>
          <Text style={styles.buttonText}>Terms of Service</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleLink(null, "Support")}>
          <Text style={styles.buttonText}>Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 16,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    marginTop: 32,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  button: {
    backgroundColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  deleteText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 12,
  },
  labelText: {
    color: '#fff',
    fontSize: 16,
  },
  valueText: {
    color: '#4caf50',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
