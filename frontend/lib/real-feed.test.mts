import test from "node:test";
import assert from "node:assert/strict";

import { buildRealFeedPost, resolveSnapPhoto } from "./real-feed.ts";

test("resolveSnapPhoto maps known mock storage paths to stable unsplash URLs", () => {
  assert.match(
    resolveSnapPhoto("mock/group-run.jpg").uri,
    /images\.unsplash\.com\/photo-1552674605-db6ffd4facb5/,
  );
});

test("resolveSnapPhoto falls back to a working image for unknown paths", () => {
  assert.match(
    resolveSnapPhoto("mock/unknown.jpg").uri,
    /images\.unsplash\.com\/photo-1552674605-db6ffd4facb5/,
  );
});

test("resolveSnapPhoto keeps the uploaded storage image for real snaps", () => {
  assert.equal(
    resolveSnapPhoto(
      "c123/u456/789.jpg",
      "https://example.supabase.co/storage/v1/object/public/snaps/c123/u456/789.jpg",
    ).uri,
    "https://example.supabase.co/storage/v1/object/public/snaps/c123/u456/789.jpg",
  );
});

test("buildRealFeedPost preserves group snaps as group cards with participants", () => {
  const post = buildRealFeedPost({
    snap: {
      id: "snap-1",
      userId: "user-1",
      storagePath: "mock/group-run.jpg",
      promptText: "Hands up at the finish line.",
      caption: "We all made it.",
      streakAfterCompletion: 12,
      createdAt: new Date("2026-04-12T10:00:00Z").toISOString(),
      isGroupPost: true,
    },
    authorName: "Leo",
    habitName: "Run 5K",
    participants: [
      { id: "user-1", name: "Leo", letter: "L", color: "#111111", streak: 12 },
      { id: "user-2", name: "Theo", letter: "T", color: "#222222", streak: 17 },
      { id: "user-3", name: "Ryan", letter: "R", color: "#333333", streak: 31 },
    ],
    when: "5m ago",
    storagePublicUrl: "https://example.supabase.co/storage/v1/object/public/snaps/mock/group-run.jpg",
    circlesEligible: true,
  });

  assert.equal(post.kind, "group");
  assert.equal(post.handle, "Run 5K");
  assert.equal(post.participants.length, 3);
  assert.equal(post.circlesEligible, true);
  assert.match(post.photos[0]?.uri ?? "", /images\.unsplash\.com/);
});

test("buildRealFeedPost keeps solo snaps as solo cards", () => {
  const post = buildRealFeedPost({
    snap: {
      id: "snap-2",
      userId: "user-1",
      storagePath: "c123/u456/solo.jpg",
      promptText: "Peace sign mid-stride.",
      caption: "Solo walk.",
      streakAfterCompletion: 7,
      createdAt: new Date("2026-04-12T10:00:00Z").toISOString(),
      isGroupPost: false,
    },
    authorName: "Sarah",
    authorLetter: "S",
    authorColor: "#444444",
    habitName: "Morning walk",
    participants: [],
    when: "2m ago",
    storagePublicUrl: "https://example.supabase.co/storage/v1/object/public/snaps/solo.jpg",
    circlesEligible: false,
  });

  assert.equal(post.kind, "solo");
  assert.equal(post.name, "Sarah");
  assert.equal(post.circlesEligible, false);
  assert.equal(post.photos[0]?.uri ?? "", "https://example.supabase.co/storage/v1/object/public/snaps/solo.jpg");
});
