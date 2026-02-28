import React, { useEffect, useState } from 'react';
import { View, Text, Button, Platform, StyleSheet, Image, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts, Colors } from '@/constants/theme';
import { User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { signOut } from '@/utils/auth';

let AppleHealthKit: any = null;
try {
  // optional native module; will be undefined in Expo managed without dev client / native install
  // npm: react-native-health (requires native setup and HealthKit entitlement)
  // This file only requests read permissions (no write).
  // If not installed the UI will show not available.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AppleHealthKit = require('react-native-health');
} catch (e) {
  AppleHealthKit = null;
}

export default function AccountScreen() {
  const [name, setName] = useState<string>('Student');
  const [healthStatus, setHealthStatus] = useState<string>('Not connected');
  const [connected, setConnected] = useState<boolean>(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('studentName');
      if (stored) setName(stored);
      const storedPhoto = await AsyncStorage.getItem('profilePicture');
      if (storedPhoto) setPhotoUri(storedPhoto);
    })();
  }, []);

  const connectToHealth = async () => {
    if (Platform.OS !== 'ios') {
      setHealthStatus('HealthKit only available on iOS');
      return;
    }
    if (!AppleHealthKit || !AppleHealthKit.initHealthKit) {
      setHealthStatus('Health module not installed / native setup required');
      return;
    }

    const permissions = {
      permissions: {
        read: [
          'StepCount',
          'DistanceWalkingRunning',
          'HeartRate',
          // add other read types as needed
        ],
        // no write permissions requested
      },
    };

    AppleHealthKit.initHealthKit(permissions, (err: any) => {
      if (err) {
        setHealthStatus('Permission denied or init error');
        setConnected(false);
        return;
      }
      setHealthStatus('Connected (read permissions granted)');
      setConnected(true);
    });
  };

  const pickImage = async () => {
    // ask for permission first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access images is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* profile picture centered with padding above */}
      <View style={styles.photoSection}>
        <TouchableOpacity onPress={pickImage} style={styles.photoWrapper}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photoLarge} />
          ) : (
            <View style={styles.photoPlaceholderLarge}>
              <User size={80} color={Colors.light.tint} />
            </View>
          )}
        </TouchableOpacity>
        <ThemedText
          type="title"
          style={[styles.title, { color: Colors.light.tint, marginTop: 8 }]}
        >
          Account
        </ThemedText>
      </View>

      <ThemedView style={styles.row}>
        <ThemedText style={styles.label}>Student:</ThemedText>
        <ThemedText style={styles.value}>{name}</ThemedText>
      </ThemedView>

      <View style={{ height: 20 }} />

      <ThemedText style={styles.statusLabel}>Health:</ThemedText>
      <ThemedText style={styles.status}>{healthStatus}</ThemedText>
      <View style={{ height: 12 }} />
      <Button title="Connect to Health" onPress={connectToHealth} disabled={connected} />
      <ThemedText style={styles.note}>
        Note: this requests read-only HealthKit permissions. Native HealthKit setup and entitlements are required on iOS.
      </ThemedText>
      <View style={{ height: 24 }} />
      <Button
        title="Logout"
        color={Colors.light.tint}
        onPress={() => {
          signOut();
          router.replace('/login');
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    backgroundColor: Colors.light.background,
  },
  photoSection: {
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.rounded,
    fontSize: 28,
    fontWeight: '700',
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginRight: 8 },
  value: { fontSize: 16 },
  statusLabel: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  status: { fontSize: 14, color: '#333', marginBottom: 8 },
  note: { marginTop: 12, fontSize: 12, color: '#666' },
  photoWrapper: {
    marginRight: 12,
  },
  photoLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoPlaceholderLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    borderColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoLabel: {
    textAlign: 'center',
    color: Colors.light.tint,
    marginBottom: 10,
  },
});