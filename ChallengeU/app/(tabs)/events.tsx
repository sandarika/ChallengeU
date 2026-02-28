import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar } from 'lucide-react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function EventsScreen() {
  // fake social posts
  const [posts, setPosts] = React.useState(
    [
      { id: 1, sport: 'Basketball', location: 'Rec Center Courts', likes: 2, liked: false },
      { id: 2, sport: 'Soccer', location: 'Outdoor Fields', likes: 5, liked: false },
      { id: 3, sport: 'Tennis', location: 'East Campus Courts', likes: 1, liked: false },
    ],
  );

  const toggleLike = (id: number) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const liked = !p.liked;
          return { ...p, liked, likes: p.likes + (liked ? 1 : -1) };
        }
        return p;
      }),
    );
  };

  const sportEmoji: Record<string, string> = {
    Basketball: '🏀',
    Soccer: '⚽️',
    Tennis: '🎾',
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#f4f3ef', dark: '#353636' }}
      headerImage={
        <Calendar
          size={310}
          color="#808080"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Events
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.postList}>
        {posts.map((post) => (
          <ThemedView key={post.id} style={styles.postCard}>
            <ThemedText style={styles.postText}>
              {sportEmoji[post.sport] ?? '🏅'} {post.sport} pickup at {post.location}
            </ThemedText>
            <TouchableOpacity onPress={() => toggleLike(post.id)} style={styles.likeButton}>
              <ThemedText style={styles.likeText}>
                {post.liked ? '❤️' : '🤍'} {post.likes}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  postList: {
    marginTop: 16,
    gap: 12,
  },
  postCard: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postText: {
    fontSize: 16,
  },
  likeButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  likeText: {
    fontSize: 16,
    color: '#e80e0e',
  },
});
