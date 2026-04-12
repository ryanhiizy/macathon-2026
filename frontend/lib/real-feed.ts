const PRIMARY_COLOR = "#DA702C";

type SoloPost = {
  id: string;
  kind: "solo";
  circlesEligible?: boolean;
  name: string;
  handle: string;
  when: string;
  streak: number;
  color: string;
  letter: string;
  photos: { uri: string }[];
  promptText?: string;
  caption: string;
  likes: number;
  comments: number;
};

type GroupParticipant = {
  color: string;
  letter: string;
  name: string;
  streak: number;
};

type GroupPost = {
  id: string;
  kind: "group";
  circlesEligible?: boolean;
  name: string;
  handle: string;
  when: string;
  photos: { uri: string }[];
  promptText?: string;
  caption: string;
  likes: number;
  comments: number;
  participants: GroupParticipant[];
};

type FeedPost = SoloPost | GroupPost;

export type RealFeedSnap = {
  id: string;
  userId: string;
  storagePath: string;
  promptText: string | null;
  caption: string | null;
  streakAfterCompletion: number;
  createdAt: string;
  isGroupPost: boolean;
};

export type RealFeedParticipant = {
  id: string;
  name: string;
  letter: string;
  color: string;
  streak: number;
};

type BuildRealFeedPostInput = {
  snap: RealFeedSnap;
  authorName: string;
  authorLetter?: string;
  authorColor?: string;
  habitName: string;
  participants: RealFeedParticipant[];
  when: string;
  circlesEligible: boolean;
  storagePublicUrl?: string;
};

const PHOTO_MAP: Record<string, string> = {
  "mock/sarah-walk.jpg": "photo-1551632811-561732d1e306",
  "mock/mia-yoga.jpg": "photo-1544367567-0f2fcb009e0b",
  "mock/water-group.jpg": "photo-1553531384-cc64ac80f931",
  "mock/nina-meditate.jpg": "photo-1506126613408-eca07ce68773",
  "mock/jae-book.jpg": "photo-1544947950-fa07a98d237f",
  "mock/theo-plunge.jpg": "photo-1504309092620-4d0ec726efa4",
  "mock/ava-sketch.jpg": "photo-1513364776144-60967b0f800f",
  "mock/leo-run.jpg": "photo-1542291026-7eec264c27ff",
  "mock/zoe-run.jpg": "photo-1483721310020-03333e577078",
  "mock/omar-nophone.jpg": "photo-1507842217343-583bb7270b66",
  "mock/kai-guitar.jpg": "photo-1510915361894-db8b60106cb1",
  "mock/ravi-cook.jpg": "photo-1556910103-1c02745aae4d",
  "mock/ella-journal.jpg": "photo-1517842645767-c639042777db",
  "mock/group-yoga.jpg": "photo-1599901860904-17e6ed7083a0",
  "mock/group-run.jpg": "photo-1552674605-db6ffd4facb5",
};

export function resolveSnapPhoto(path: string, storagePublicUrl?: string): { uri: string } {
  const unsplashId = PHOTO_MAP[path];
  if (unsplashId) {
    return { uri: `https://images.unsplash.com/${unsplashId}?w=800&h=800&fit=crop&q=80` };
  }

  if (storagePublicUrl) {
    return { uri: storagePublicUrl };
  }

  return { uri: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=800&fit=crop&q=80" };
}

export function buildRealFeedPost(input: BuildRealFeedPostInput): FeedPost {
  if (input.snap.isGroupPost) {
    const participants = normalizeParticipants(input.participants, input.authorName);
    const groupPost: GroupPost = {
      id: input.snap.id,
      kind: "group",
      name: formatGroupName(participants, input.authorName),
      handle: input.habitName || "Habit check-in",
      when: input.when,
      circlesEligible: input.circlesEligible,
      promptText: input.snap.promptText || undefined,
      caption: input.snap.caption || `Checked in for ${input.habitName || "your habit"}.`,
      likes: 0,
      comments: 0,
      photos: [resolveSnapPhoto(input.snap.storagePath, input.storagePublicUrl)],
      participants,
    };
    return groupPost;
  }

  const soloLetter = input.authorLetter
    ? input.authorLetter
    : input.authorName.slice(0, 1).toUpperCase() || "P";

  const soloPost: SoloPost = {
    id: input.snap.id,
    kind: "solo",
    name: input.authorName,
    handle: input.habitName || "Habit check-in",
    when: input.when,
    circlesEligible: input.circlesEligible,
    streak: input.snap.streakAfterCompletion,
    color: input.authorColor ?? PRIMARY_COLOR,
    letter: soloLetter,
    photos: [resolveSnapPhoto(input.snap.storagePath, input.storagePublicUrl)],
    promptText: input.snap.promptText || undefined,
    caption: input.snap.caption || `Checked in for ${input.habitName || "your habit"}.`,
    likes: 0,
    comments: 0,
  };
  return soloPost;
}

function normalizeParticipants(
  participants: RealFeedParticipant[],
  authorName: string,
): GroupParticipant[] {
  if (participants.length > 0) {
    return participants.slice(0, 4).map((participant) => ({
      color: participant.color,
      letter: participant.letter,
      name: participant.name,
      streak: participant.streak,
    }));
  }

  return [
    {
      color: PRIMARY_COLOR,
      letter: authorName.slice(0, 1).toUpperCase() || "P",
      name: authorName,
      streak: 0,
    },
  ];
}

function formatGroupName(participants: GroupParticipant[], fallbackName: string): string {
  if (participants.length === 0) {
    return fallbackName;
  }

  if (participants.length === 1) {
    return participants[0]?.name ?? fallbackName;
  }

  if (participants.length === 2) {
    return `${participants[0]?.name}, ${participants[1]?.name}`;
  }

  return `${participants[0]?.name}, ${participants[1]?.name} + ${participants.length - 2}`;
}
