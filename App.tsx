import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
};

export default function App(): React.ReactElement {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const userData = await AsyncStorage.getItem('userData');
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#C41E3A" />
      </View>
    );
  }

  return isLoggedIn ? <HomeScreen user={user} onLogout={logout} /> : <LoginScreen onLogin={login} />;

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      // Demo user login
      if (email === 'demo@unl.edu' && password === 'demo123') {
        const demoUser = {
          id: '1',
          name: 'Demo User',
          email: 'demo@unl.edu',
          role: 'user',
        };
        const demoToken = 'demo-token-12345';
        await AsyncStorage.setItem('authToken', demoToken);
        await AsyncStorage.setItem('userData', JSON.stringify(demoUser));
        setUser(demoUser);
        setIsLoggedIn(true);
        return;
      }

      // Real backend login
      const response = await fetch('http://your-backend-url/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      await AsyncStorage.setItem('authToken', data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      setUser(data.user);
      setIsLoggedIn(true);
    } catch (err) {
      alert(`Login error: ${err}`);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userData');
    setUser(null);
    setIsLoggedIn(false);
  }
}

function LoginScreen({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('demo@unl.edu');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await onLogin(email, password);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ChallengeU</Text>
      <Text style={styles.subtitle}>UNL Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        editable={!loading}
        placeholderTextColor="#999"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading}
        placeholderTextColor="#999"
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      <Text style={styles.demoText}>Demo: demo@unl.edu / demo123</Text>

      <StatusBar style="auto" />
    </View>
  );
}

function HomeScreen({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user.name}!</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{user.email}</Text>
        <Text style={styles.label}>Role:</Text>
        <Text style={styles.value}>{user.role}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={onLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C41E3A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#C41E3A',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  demoText: {
    marginTop: 20,
    color: '#999',
    fontSize: 12,
  },
  card: {
    width: '100%',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 8,
  },
  value: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
});
