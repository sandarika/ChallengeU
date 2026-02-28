import AsyncStorage from '@react-native-async-storage/async-storage';

export type LikedMeetupEvent = {
  postId: number;
  sport: string;
  location: string;
  time: string;
  dateKey: string;
  day: number;
  month: number;
  year: number;
};

const LIKED_MEETUP_EVENTS_KEY = 'challengeu_liked_meetup_events';

export async function getLikedMeetupEvents(): Promise<LikedMeetupEvent[]> {
  const raw = await AsyncStorage.getItem(LIKED_MEETUP_EVENTS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LikedMeetupEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addLikedMeetupEvent(event: LikedMeetupEvent): Promise<void> {
  const existing = await getLikedMeetupEvents();
  const withoutCurrent = existing.filter((item) => item.postId !== event.postId);
  await AsyncStorage.setItem(LIKED_MEETUP_EVENTS_KEY, JSON.stringify([...withoutCurrent, event]));
}

export async function removeLikedMeetupEvent(postId: number): Promise<void> {
  const existing = await getLikedMeetupEvents();
  const next = existing.filter((item) => item.postId !== postId);
  await AsyncStorage.setItem(LIKED_MEETUP_EVENTS_KEY, JSON.stringify(next));
}
