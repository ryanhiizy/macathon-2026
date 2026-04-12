import test from "node:test";
import assert from "node:assert/strict";

// @ts-ignore Node's strip-types test runner needs the explicit .ts specifier here.
import { mergeCircleSnapsForFeed, resolveCircleSnapPhoto } from "./circle-snap-utils.ts";

type CircleSnapView = {
  id: string;
  userId: string;
  name: string;
  letter: string;
  color: string;
  streak: number;
  promptText: string;
  caption: string | null;
  photos: { uri: string }[];
  when: string;
  isGroup: boolean;
};

test("resolveCircleSnapPhoto preserves real uploaded media URLs for non-mock snaps", () => {
  assert.deepEqual(
    resolveCircleSnapPhoto(
      "c123/u456/real-upload.jpg",
      "https://example.supabase.co/storage/v1/object/public/snaps/c123/u456/real-upload.jpg",
    ),
    { uri: "https://example.supabase.co/storage/v1/object/public/snaps/c123/u456/real-upload.jpg" },
  );
});

test("mergeCircleSnapsForFeed makes appended fallback posts older than real snaps", () => {
  const realSnaps: CircleSnapView[] = [
    {
      id: "real-1",
      userId: "user-1",
      name: "Theo",
      letter: "T",
      color: "#111111",
      streak: 8,
      promptText: "Proof.",
      caption: "Real post",
      photos: [{ uri: "https://example.com/real-1.jpg" }],
      when: "32m ago",
      isGroup: false,
    },
    {
      id: "real-2",
      userId: "user-2",
      name: "Mia",
      letter: "M",
      color: "#222222",
      streak: 5,
      promptText: "Proof.",
      caption: "Older real post",
      photos: [{ uri: "https://example.com/real-2.jpg" }],
      when: "4h ago",
      isGroup: true,
    },
  ];

  const fallbackSnaps: CircleSnapView[] = [
    {
      id: "fallback-1",
      userId: "seed-1",
      name: "Seeded One",
      letter: "S",
      color: "#333333",
      streak: 4,
      promptText: "Fallback prompt",
      caption: "Fallback 1",
      photos: [{ uri: "https://example.com/fallback-1.jpg" }],
      when: "12m ago",
      isGroup: false,
    },
    {
      id: "fallback-2",
      userId: "seed-2",
      name: "Seeded Two",
      letter: "S",
      color: "#444444",
      streak: 3,
      promptText: "Fallback prompt",
      caption: "Fallback 2",
      photos: [{ uri: "https://example.com/fallback-2.jpg" }],
      when: "28m ago",
      isGroup: true,
    },
    {
      id: "fallback-3",
      userId: "seed-3",
      name: "Seeded Three",
      letter: "S",
      color: "#555555",
      streak: 2,
      promptText: "Fallback prompt",
      caption: "Fallback 3",
      photos: [{ uri: "https://example.com/fallback-3.jpg" }],
      when: "1h ago",
      isGroup: false,
    },
  ];

  const merged = mergeCircleSnapsForFeed(realSnaps, fallbackSnaps);

  assert.deepEqual(
    merged.map((snap) => snap.id),
    ["real-1", "real-2", "fallback-1", "fallback-2"],
  );
  assert.deepEqual(
    merged.slice(2).map((snap) => snap.when),
    ["6h ago", "8h ago"],
  );
});
