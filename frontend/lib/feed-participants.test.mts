import test from "node:test";
import assert from "node:assert/strict";

import { buildSnapParticipantMap } from "./feed-participants.ts";

function colorForUser(userId: string) {
  return `color:${userId}`;
}

test("buildSnapParticipantMap keys participants by snap id instead of circle-wide membership", () => {
  const participantMap = buildSnapParticipantMap(
    [
      {
        snapId: "snap-1",
        userId: "user-2",
        streakAfterCompletion: 11,
        displayName: "Theo",
      },
      {
        snapId: "snap-2",
        userId: "user-3",
        streakAfterCompletion: 21,
        displayName: "Mia",
      },
    ],
    [
      {
        snapId: "snap-1",
        userId: "user-1",
        streakAfterCompletion: 8,
        displayName: "Leo",
      },
      {
        snapId: "snap-2",
        userId: "user-4",
        streakAfterCompletion: 5,
        displayName: "Ryan",
      },
    ],
    colorForUser,
  );

  assert.deepEqual(
    participantMap.get("snap-1"),
    [
      { id: "user-1", name: "Leo", letter: "L", color: "color:user-1", streak: 8 },
      { id: "user-2", name: "Theo", letter: "T", color: "color:user-2", streak: 11 },
    ],
  );
  assert.deepEqual(
    participantMap.get("snap-2"),
    [
      { id: "user-4", name: "Ryan", letter: "R", color: "color:user-4", streak: 5 },
      { id: "user-3", name: "Mia", letter: "M", color: "color:user-3", streak: 21 },
    ],
  );
});

test("buildSnapParticipantMap does not duplicate the host when already present in snap_participants", () => {
  const participantMap = buildSnapParticipantMap(
    [
      {
        snapId: "snap-1",
        userId: "user-1",
        streakAfterCompletion: 8,
        displayName: "Leo",
      },
      {
        snapId: "snap-1",
        userId: "user-2",
        streakAfterCompletion: 11,
        displayName: "Theo",
      },
    ],
    [
      {
        snapId: "snap-1",
        userId: "user-1",
        streakAfterCompletion: 8,
        displayName: "Leo",
      },
    ],
    colorForUser,
  );

  assert.deepEqual(
    participantMap.get("snap-1"),
    [
      { id: "user-1", name: "Leo", letter: "L", color: "color:user-1", streak: 8 },
      { id: "user-2", name: "Theo", letter: "T", color: "color:user-2", streak: 11 },
    ],
  );
});
