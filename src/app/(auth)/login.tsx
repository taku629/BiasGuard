import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { Link } from 'expo-router';
import AuthScreen, { authLinkStyles } from '@/components/auth/AuthScreen';

export default function LoginScreen() {
  const handleLogin = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  return (
    <AuthScreen
      title="BiasGuard"
      submitLabel="Login"
      submitAccessibilityLabel="Login button"
      errorTitle="Login Error"
      onSubmit={handleLogin}
      footer={
        <Link href="/(auth)/signup" asChild>
          <TouchableOpacity style={authLinkStyles.linkButton} accessibilityRole="button" accessibilityLabel="Go to sign up">
            <Text style={authLinkStyles.linkText}>Don't have an account? Sign up</Text>
          </TouchableOpacity>
        </Link>
      }
    />
  );
}
