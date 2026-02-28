import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import { Platform } from 'react-native';

type TeamGame = {
  opponent: string;
  date: string;
  location: string;
};

type MeetupCalendarInput = {
  postId: number;
  sport: string;
  location: string;
  time: string;
  dateKey: string;
};

const APPLE_EVENT_MAP_KEY = 'challengeu_apple_calendar_event_map';

type AppleEventMap = Record<string, string>;
type CalendarEventInput = {
  title: string;
  location?: string;
  notes?: string;
  startDate: Date;
  endDate: Date;
};

async function getEventMap(): Promise<AppleEventMap> {
  const raw = await AsyncStorage.getItem(APPLE_EVENT_MAP_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as AppleEventMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function setEventMap(map: AppleEventMap): Promise<void> {
  await AsyncStorage.setItem(APPLE_EVENT_MAP_KEY, JSON.stringify(map));
}

async function canUseAppleCalendar(): Promise<boolean> {
  if (Platform.OS !== 'ios') {
    return false;
  }

  const { status } = await Calendar.requestCalendarPermissionsAsync();
  return status === 'granted';
}

async function getWritableCalendarId(): Promise<string | null> {
  try {
    const defaultCalendar = await Calendar.getDefaultCalendarAsync();
    if (defaultCalendar?.id) {
      return defaultCalendar.id;
    }
  } catch {
    // fallback below
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.find((calendar) => calendar.allowsModifications);
  return writable?.id ?? null;
}

function parseTimeString(time: string): { hour24: number; minute: number } | null {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    return null;
  }

  const hour12 = Number(match[1]);
  const minute = Number(match[2]);
  const suffix = match[3].toUpperCase();

  let hour24 = hour12 % 12;
  if (suffix === 'PM') {
    hour24 += 12;
  }

  return { hour24, minute };
}

function buildMeetupDate(dateKey: string, time: string): Date | null {
  const parts = dateKey.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }

  const parsedTime = parseTimeString(time);
  if (!parsedTime) {
    return null;
  }

  const [year, month, day] = parts;
  return new Date(year, month - 1, day, parsedTime.hour24, parsedTime.minute, 0, 0);
}

function buildTeamGameDate(weekdayAndTime: string): Date | null {
  const match = weekdayAndTime.trim().match(/^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s+(.+)$/i);
  if (!match) {
    return null;
  }

  const weekday = match[1].slice(0, 3).toLowerCase();
  const time = match[2];
  const parsedTime = parseTimeString(time);
  if (!parsedTime) {
    return null;
  }

  const weekdayMap: Record<string, number> = {
    sun: 0,
    mon: 1,
    tue: 2,
    wed: 3,
    thu: 4,
    fri: 5,
    sat: 6,
  };

  const now = new Date();
  const currentWeekday = now.getDay();
  const targetWeekday = weekdayMap[weekday];
  let dayOffset = (targetWeekday - currentWeekday + 7) % 7;

  const candidate = new Date(now);
  candidate.setDate(now.getDate() + dayOffset);
  candidate.setHours(parsedTime.hour24, parsedTime.minute, 0, 0);

  if (candidate <= now) {
    dayOffset += 7;
    candidate.setDate(now.getDate() + dayOffset);
  }

  return candidate;
}

async function upsertCalendarEvent(mappingKey: string, details: CalendarEventInput): Promise<void> {
  const allowed = await canUseAppleCalendar();
  if (!allowed) {
    return;
  }

  const calendarId = await getWritableCalendarId();
  if (!calendarId) {
    return;
  }

  const map = await getEventMap();
  const existingEventId = map[mappingKey];

  if (existingEventId) {
    try {
      await Calendar.updateEventAsync(existingEventId, details);
      return;
    } catch {
      // If event no longer exists, fall through to create a new one.
    }
  }

  const createdEventId = await Calendar.createEventAsync(calendarId, details);
  await setEventMap({ ...map, [mappingKey]: createdEventId });
}

async function removeCalendarEvent(mappingKey: string): Promise<void> {
  const map = await getEventMap();
  const eventId = map[mappingKey];
  if (!eventId) {
    return;
  }

  try {
    await Calendar.deleteEventAsync(eventId);
  } catch {
    // If already removed, continue clearing local mapping.
  }

  const nextMap = { ...map };
  delete nextMap[mappingKey];
  await setEventMap(nextMap);
}

export async function syncLikedMeetupToAppleCalendar(input: MeetupCalendarInput): Promise<void> {
  try {
    const startDate = buildMeetupDate(input.dateKey, input.time);
    if (!startDate) {
      return;
    }

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    await upsertCalendarEvent(`meetup-${input.postId}`, {
      title: `Meetup: ${input.sport}`,
      location: input.location,
      notes: 'Added from ChallengeU Meetup likes',
      startDate,
      endDate,
    });
  } catch {
    return;
  }
}

export async function removeLikedMeetupFromAppleCalendar(postId: number): Promise<void> {
  try {
    await removeCalendarEvent(`meetup-${postId}`);
  } catch {
    return;
  }
}

export async function syncJoinedTeamGamesToAppleCalendar(
  teamName: string,
  sport: string,
  games: TeamGame[],
): Promise<void> {
  try {
    await Promise.all(
      games.map(async (game, index) => {
        const startDate = buildTeamGameDate(game.date);
        if (!startDate) {
          return;
        }

        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        await upsertCalendarEvent(`team-${teamName}-${index}`, {
          title: `${teamName} vs ${game.opponent}`,
          location: game.location,
          notes: `Sport: ${sport} (added from ChallengeU Teams)`,
          startDate,
          endDate,
        });
      }),
    );
  } catch {
    return;
  }
}

export async function removeJoinedTeamGamesFromAppleCalendar(
  teamName: string,
  gamesCount: number,
): Promise<void> {
  try {
    await Promise.all(
      Array.from({ length: gamesCount }, (_, index) => removeCalendarEvent(`team-${teamName}-${index}`)),
    );
  } catch {
    return;
  }
}
