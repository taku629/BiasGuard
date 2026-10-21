import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { useRouter } from 'expo-router';
import AuthScreen, { authLinkStyles } from '@/components/auth/AuthScreen';

export default function SignupScreen() {
  const router = useRouter();

  const handleSignup = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  return (
    <AuthScreen
      title="Create Account"
      submitLabel="Sign Up"
      submitAccessibilityLabel="Sign Up button"
      errorTitle="Signup Error"
      onSubmit={handleSignup}
      footer={
        <TouchableOpacity style={authLinkStyles.linkButton} onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Go back to login">
          <Text style={authLinkStyles.linkText}>Already have an account? Login</Text>
        </TouchableOpacity>
      }
    />
  );
}
