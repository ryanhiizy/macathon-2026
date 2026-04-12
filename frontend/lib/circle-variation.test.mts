import test from "node:test";
import assert from "node:assert/strict";

import {
  buildCircleAnalytics,
  buildCircleCopy,
  buildCircleMemberLabel,
  buildCircleVariation,
  buildFallbackCircleFeedPosts,
  buildFallbackMemberFlavor,
  createSeededValueGenerator,
} from "./circle-variation.ts";

const runClubInput = {
  circleId: "c0000000-0000-0000-0000-000000000001",
  name: "5K Every Day",
  habit: "Run 5 kilometers",
  memberCount: 5,
};

test("buildCircleVariation is stable for the same circle id", () => {
  const first = buildCircleVariation(runClubInput);

  const second = buildCircleVariation(runClubInput);

  assert.deepEqual(second, first);
});

test("createSeededValueGenerator stays deterministic and within bounds", () => {
  const pick = createSeededValueGenerator("circle-seed-1");

  assert.equal(pick(7, 0, 10), pick(7, 0, 10));
  assert.equal(pick(9, 2, 5), pick(9, 2, 5));
  assert.ok(pick(3, 0.32, 0.92) >= 0.32);
  assert.ok(pick(3, 0.32, 0.92) <= 0.92);
});

test("buildCircleVariation produces different analytics for different circles", () => {
  const runClub = buildCircleVariation(runClubInput);

  const plungeClub = buildCircleVariation({
    circleId: "c0000000-0000-0000-0000-000000000003",
    name: "Cold Plunge Club",
    habit: "Cold plunge",
    memberCount: 3,
  });

  assert.notDeepEqual(runClub.analytics, plungeClub.analytics);
});

test("buildCircleVariation composes exported helpers including fallback member flavor", () => {
  const variation = buildCircleVariation(runClubInput);

  assert.deepEqual(variation.analytics, buildCircleAnalytics(runClubInput));
  assert.deepEqual(
    {
      description: variation.description,
      about: variation.about,
    },
    buildCircleCopy(runClubInput),
  );
  assert.equal(variation.memberLabel, buildCircleMemberLabel(runClubInput));
  assert.deepEqual(variation.fallbackMemberFlavor, buildFallbackMemberFlavor(runClubInput));
  assert.deepEqual(variation.fallbackPosts, buildFallbackCircleFeedPosts(runClubInput));
  assert.equal(variation.analytics.weekDaily.length, 7);
  assert.equal(variation.analytics.trendLine.length, 14);
  assert.equal(variation.fallbackPosts.length, 3);
  assert.equal(variation.fallbackMemberFlavor.length, 3);
  assert.ok(variation.memberLabel.length > 0);
  assert.ok(variation.analytics.todayRate >= 0.32);
  assert.ok(variation.analytics.todayRate <= 0.92);
  assert.ok(variation.analytics.weekDaily.every((value) => value >= 0.38 && value <= 0.94));
  assert.ok(variation.analytics.trendLine.every((value) => value >= 0.35 && value <= 0.96));
});

test("buildCircleVariation changes fallback post tone by habit", () => {
  const gym = buildCircleVariation({
    circleId: "c0000000-0000-0000-0000-000000000011",
    name: "Gym Rats",
    habit: "Hit the gym",
    memberCount: 4,
  });

  const reading = buildCircleVariation({
    circleId: "c0000000-0000-0000-0000-000000000004",
    name: "Page Turners",
    habit: "Read 10 pages",
    memberCount: 2,
  });

  assert.notEqual(gym.about, reading.about);
  assert.notEqual(gym.fallbackPosts[0]?.caption, reading.fallbackPosts[0]?.caption);
  assert.match(gym.fallbackPosts[0]?.promptText ?? "", /gym|rep|lift|rack/i);
  assert.match(reading.fallbackPosts[0]?.promptText ?? "", /book|page|read|chapter/i);
});

test("buildFallbackMemberFlavor adapts by habit", () => {
  const gymFlavor = buildFallbackMemberFlavor({
    circleId: "c0000000-0000-0000-0000-000000000011",
    name: "Gym Rats",
    habit: "Hit the gym",
    memberCount: 4,
  });

  const readingFlavor = buildFallbackMemberFlavor({
    circleId: "c0000000-0000-0000-0000-000000000004",
    name: "Page Turners",
    habit: "Read 10 pages",
    memberCount: 2,
  });

  assert.notDeepEqual(gymFlavor, readingFlavor);
  assert.match(gymFlavor[0]?.vibe ?? "", /rep|lift|gym|set/i);
  assert.match(readingFlavor[0]?.vibe ?? "", /page|book|read|chapter/i);
});

test("buildCircleMemberLabel varies by habit cluster", () => {
  const gymLabel = buildCircleMemberLabel({
    circleId: "c0000000-0000-0000-0000-000000000011",
    name: "Gym Rats",
    habit: "Hit the gym",
    memberCount: 4,
  });

  const readingLabel = buildCircleMemberLabel({
    circleId: "c0000000-0000-0000-0000-000000000004",
    name: "Page Turners",
    habit: "Read 10 pages",
    memberCount: 2,
  });

  assert.match(gymLabel, /rack|rep|lift/i);
  assert.match(readingLabel, /page|quiet|chapter/i);
  assert.notEqual(gymLabel, readingLabel);
});
