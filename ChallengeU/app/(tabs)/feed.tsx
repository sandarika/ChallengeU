import { StyleSheet, FlatList, View, TouchableOpacity, Modal, TextInput, Alert, Platform, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Activity, Heart, Plus, Camera } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Workout = {
  _id: string;
  username: string;
  calories: number;
  date: string;
  likes: number;
  imageUrl?: string;
};

// Demo Herbie Husker post
const DEMO_WORKOUT: Workout = {
  _id: 'demo-herbie',
  username: 'Herbie Husker',
  calories: 670,
  date: new Date().toISOString(),
  likes: 3,
  imageUrl: require('../../assets/images/workout0img.png'),
};

export default function FeedScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  type WorkoutState = { likes: number; liked: boolean };
  const [feedState, setFeedState] = useState<Record<string, WorkoutState>>({});
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState('');
  const [calories, setCalories] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const backgroundColor = useThemeColor({}, 'background');
  const colorScheme = useColorScheme() ?? 'light';
  const headerBackgroundColor = { light: '#f4f3ef', dark: '#1D3D47' };

  const getBaseUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;
    if (Platform.OS === 'android') {
      // Android emulator listens on 10.0.2.2 for host machine
      return 'http://10.0.2.2:5000/api';
    }
    return 'http://localhost:5000/api';
  };

  const fetchWorkouts = async () => {
    try {
      const base = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:5000/api';
      const res = await fetch(`${base}/workouts`);
      if (!res.ok) return;
      const data: Workout[] = await res.json();
      setWorkouts(data);
      // initialize local state for each workout
      const state: Record<string, WorkoutState> = {};
      data.forEach((w) => {
        state[w._id] = { likes: w.likes, liked: false };
      });
      // include demo post state as well
      state[DEMO_WORKOUT._id] = { likes: DEMO_WORKOUT.likes, liked: false };
      setFeedState(state);
    } catch (e) {
      // ignore network errors for now
    }
  };

  useEffect(() => {
    fetchWorkouts();
    const id = setInterval(fetchWorkouts, 5000);
    return () => clearInterval(id);
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need permission to access your photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const postWorkout = () => {
    if (!username.trim() || !calories.trim()) {
      Alert.alert('Error', 'Please enter username and calories');
      return;
    }

    const calorieNum = parseInt(calories, 10);
    if (isNaN(calorieNum) || calorieNum <= 0) {
      Alert.alert('Error', 'Please enter a valid calorie amount');
      return;
    }

    // Create new workout object
    const newWorkout: Workout = {
      _id: `${Date.now()}`,
      username: username.trim(),
      calories: calorieNum,
      date: new Date().toISOString(),
      likes: 0,
      imageUrl: photoUri || undefined,
    };

    // Add to feed immediately (at the beginning for newest first)
    setWorkouts([newWorkout, ...workouts]);
    setFeedState((prev) => ({ ...prev, [newWorkout._id]: { likes: 0, liked: false } }));
    
    // Reset form and close modal
    setUsername('');
    setCalories('');
    setPhotoUri(null);
    setShowModal(false);
  };

  const celebrateWorkout = (workoutId: string) => {
    // Get current state or initialize it
    const existing = feedState[workoutId] || { likes: 0, liked: false };
    const isCelebrated = existing.liked;
    
    // Calculate new state
    const newState: WorkoutState = {
      likes: isCelebrated ? existing.likes - 1 : existing.likes + 1,
      liked: !isCelebrated,
    };

    // Update state immediately
    setFeedState((prev) => ({ ...prev, [workoutId]: newState }));
  };

  const renderItem = ({ item }: { item: Workout }) => {
    const date = new Date(item.date);
    const itemState = feedState[item._id] || { likes: item.likes, liked: false };
    const likes = itemState.likes;
    const isCelebrated = itemState.liked;
    return (
      <ThemedView style={styles.item}>
        {item.imageUrl && (
          <Image source={typeof item.imageUrl === 'string' ? { uri: item.imageUrl } : item.imageUrl} style={styles.workoutImage} />
        )}
        <ThemedText type="subtitle">{item.username} completed a workout!</ThemedText>
        <View style={styles.row}>
          <ThemedText>{item.calories} Calories</ThemedText>
          <ThemedText style={styles.date}>{date.toLocaleString()}</ThemedText>
        </View>
        <TouchableOpacity
          style={[styles.celebrateBtn, isCelebrated && styles.celebrateBtnActive]}
          onPress={() => celebrateWorkout(item._id)}
        >
          <Heart
            size={18}
            color="#e80e0e"
            fill={isCelebrated ? '#e80e0e' : 'none'}
          />
          <ThemedText style={styles.celebrateText}>
            {isCelebrated ? 'Celebrated' : 'Celebrate'}
          </ThemedText>
          <ThemedText style={styles.likeCount}>{likes}</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  };

  const HeaderComponent = () => (
    <View style={[styles.headerContainer, { backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: headerBackgroundColor[colorScheme] }]}>
        <Activity size={178} color="#e80e0e" style={styles.headerIcon} />
      </View>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Activity Feed</ThemedText>
      </ThemedView>
    </View>
  );

  return (
    <ThemedView style={{ flex: 1, position: 'relative' }}>
      <FlatList
        data={[DEMO_WORKOUT, ...workouts]}
        keyExtractor={(i) => i._id}
        renderItem={renderItem}
        ListHeaderComponent={<HeaderComponent />}
        ListEmptyComponent={<ThemedText style={styles.emptyText}>Users will share workouts and updates here.</ThemedText>}
        contentContainerStyle={workouts.length === 0 ? styles.emptyContainer : undefined}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setShowModal(true)}>
        <Plus size={28} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText type="title">Post Workout</ThemedText>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <ThemedText style={styles.closeBtn}>✕</ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Username</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#999"
                value={username}
                onChangeText={setUsername}
                editable={!posting}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.label}>Calories Burned</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Enter calories"
                placeholderTextColor="#999"
                value={calories}
                onChangeText={setCalories}
                keyboardType="number-pad"
                editable={!posting}
              />
            </View>

            <ThemedText style={styles.label}>Photo (optional)</ThemedText>
            <TouchableOpacity style={styles.photoPickerBtn} onPress={pickImage}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.previewPhoto} />
              ) : (
                <View style={styles.photoPickerContent}>
                  <Camera size={32} color="#e80e0e" />
                  <ThemedText style={styles.photoPickerText}>Tap to add photo</ThemedText>
                </View>
              )}
            </TouchableOpacity>
            {photoUri && (
              <TouchableOpacity onPress={() => setPhotoUri(null)} style={styles.removePhotoBtn}>
                <ThemedText style={styles.removePhotoText}>Remove photo</ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.postBtn, posting && styles.postBtnDisabled]}
              onPress={postWorkout}
              disabled={posting}
            >
              <ThemedText style={styles.postBtnText}>
                {posting ? 'Posting...' : 'Post Workout'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 32,
    gap: 16,
  },
  header: {
    height: 250,
    overflow: 'hidden',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e80e0e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#e6e6e6',
    paddingHorizontal: 32,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 12,
  },
  date: {
    opacity: 0.7,
  },
  celebrateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e80e0e',
    alignSelf: 'flex-start',
  },
  celebrateBtnActive: {
    backgroundColor: 'rgba(232, 14, 14, 0.1)',
  },
  workoutImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  celebrateText: {
    fontSize: 14,
    fontWeight: '600',
  },
  likeCount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e80e0e',
  },
  emptyContainer: {
    paddingTop: 16,
  },
  emptyText: {
    padding: 32,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeBtn: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e80e0e',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#000',
  },
  photoPickerBtn: {
    borderWidth: 2,
    borderColor: '#e80e0e',
    borderRadius: 12,
    borderStyle: 'dashed',
    paddingVertical: 32,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoPickerContent: {
    alignItems: 'center',
    gap: 12,
  },
  photoPickerText: {
    color: '#e80e0e',
    fontWeight: '600',
    fontSize: 14,
  },
  previewPhoto: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removePhotoBtn: {
    paddingVertical: 8,
    marginBottom: 12,
  },
  removePhotoText: {
    color: '#e80e0e',
    fontSize: 12,
    fontWeight: '600',
  },
  postBtn: {
    backgroundColor: '#e80e0e',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  postBtnDisabled: {
    opacity: 0.6,
  },
  postBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});