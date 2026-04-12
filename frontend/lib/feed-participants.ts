export type FeedParticipant = {
  id: string;
  name: string;
  letter: string;
  color: string;
  streak: number;
};

export type SnapParticipantSource = {
  snapId: string;
  userId: string;
  streakAfterCompletion: number;
  displayName: string | null;
};

export type SnapHostSource = {
  snapId: string;
  userId: string;
  streakAfterCompletion: number;
  displayName: string | null;
};

function participantFromSource(
  source: {
    userId: string;
    streakAfterCompletion: number;
    displayName: string | null;
  },
  colorForUser: (userId: string) => string,
): FeedParticipant {
  const name = source.displayName || "Presence User";
  return {
    id: source.userId,
    name,
    letter: name.slice(0, 1).toUpperCase() || "P",
    color: colorForUser(source.userId),
    streak: source.streakAfterCompletion,
  };
}

export function buildSnapParticipantMap(
  participantRows: SnapParticipantSource[],
  hostRows: SnapHostSource[],
  colorForUser: (userId: string) => string,
): Map<string, FeedParticipant[]> {
  const participantMap = new Map<string, FeedParticipant[]>();

  for (const row of participantRows) {
    const existing = participantMap.get(row.snapId) ?? [];
    existing.push(participantFromSource(row, colorForUser));
    participantMap.set(row.snapId, existing);
  }

  for (const row of hostRows) {
    const existing = participantMap.get(row.snapId) ?? [];
    if (existing.some((participant) => participant.id === row.userId)) {
      continue;
    }

    participantMap.set(row.snapId, [
      participantFromSource(row, colorForUser),
      ...existing,
    ]);
  }

  return participantMap;
}
