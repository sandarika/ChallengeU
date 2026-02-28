import { StyleSheet, View, TextInput, Button } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { User, Lock } from 'lucide-react-native';
import { authenticate, isAuthenticated } from '@/utils/auth';

export default function LoginScreen() {
  const router = useRouter();
  // pre-populate with demo credentials
  const [email, setEmail] = useState('herbie@nebraska.edu');
  const [password, setPassword] = useState('password123');

  if (isAuthenticated()) {
    return <Redirect href="/" />;
  }


  const handleLogin = async () => {
    // stub: replace with real authentication
    authenticate();

    // if using demo account, store a demo student name locally
    if (email.toLowerCase() === 'herbie@nebraska.edu') {
      try {
        await AsyncStorage.setItem('studentName', 'Herbie Husker');
      } catch (e) {
        console.warn('Failed to store student name', e);
      }
    }

    router.replace('/');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Welcome to ChallengeU
      </ThemedText>
      <View style={styles.inputWrapper}>
        <User size={24} color="#e80e0e" />
        <TextInput
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.inputWrapper}>
        <Lock size={24} color="#e80e0e" />
        <TextInput
          placeholder="Password"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Login" color="#e80e0e" onPress={handleLogin} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 4,
  },
  buttonContainer: {
    marginTop: 24,
  },
});