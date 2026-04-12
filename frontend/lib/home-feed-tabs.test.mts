import test from "node:test";
import assert from "node:assert/strict";

import type { DispatchPost, GroupPost, SoloPost } from "./mock.ts";
import { filterPostsForHomeTab, postAppearsInHomeTab } from "./home-feed-tabs.ts";

const soloPost: SoloPost = {
  id: "solo-1",
  kind: "solo",
  circlesEligible: true,
  name: "Solo",
  handle: "Morning walk",
  when: "1m ago",
  streak: 3,
  color: "#111111",
  letter: "S",
  caption: "Solo caption",
  likes: 0,
  comments: 0,
};

const groupPost: GroupPost = {
  id: "group-1",
  kind: "group",
  circlesEligible: true,
  name: "Circle Crew",
  handle: "5K club",
  when: "2m ago",
  caption: "Group caption",
  likes: 0,
  comments: 0,
  participants: [{ color: "#222222", letter: "G", name: "Gia", streak: 9 }],
};

const dispatchPost: DispatchPost = {
  id: "dispatch-1",
  kind: "dispatch",
  name: "Dispatch",
  handle: "Running",
  when: "3m ago",
  color: "#333333",
  letter: "D",
  streak: 12,
  value: "12",
  unit: "days",
  caption: "Dispatch caption",
};

test("group posts still appear in the friends home feed", () => {
  assert.equal(postAppearsInHomeTab(groupPost, "friends"), true);
});

test("solo posts also appear in the circles home feed", () => {
  assert.equal(postAppearsInHomeTab(soloPost, "circles"), true);
});

test("dispatch posts stay out of the circles home feed", () => {
  assert.deepEqual(filterPostsForHomeTab([soloPost, groupPost, dispatchPost], "circles"), [
    groupPost,
    soloPost,
  ]);
});

test("friends feed front-loads variety instead of stacking dispatch cards", () => {
  const groupTwo: GroupPost = {
    ...groupPost,
    id: "group-2",
    name: "Run Crew",
  };
  const soloTwo: SoloPost = {
    ...soloPost,
    id: "solo-2",
    name: "Solo Two",
  };
  const dispatchTwo: DispatchPost = {
    ...dispatchPost,
    id: "dispatch-2",
    name: "Dispatch Two",
  };

  const arranged = filterPostsForHomeTab(
    [dispatchPost, dispatchTwo, soloPost, groupPost, soloTwo, groupTwo],
    "friends",
  );

  assert.deepEqual(
    arranged.slice(0, 5).map((post) => post.kind),
    ["solo", "group", "solo", "dispatch", "group"],
  );
});

test("circles feed surfaces group posts before solo posts when both exist", () => {
  const soloTwo: SoloPost = {
    ...soloPost,
    id: "solo-2",
  };
  const groupTwo: GroupPost = {
    ...groupPost,
    id: "group-2",
  };

  const arranged = filterPostsForHomeTab([soloPost, soloTwo, groupPost, groupTwo], "circles");

  assert.deepEqual(
    arranged.slice(0, 4).map((post) => post.kind),
    ["group", "solo", "group", "solo"],
  );
});

test("circles feed excludes real solo posts that are not from a social circle", () => {
  const privateSolo = {
    ...soloPost,
    id: "solo-private",
    circlesEligible: false,
  };

  const arranged = filterPostsForHomeTab([privateSolo, groupPost], "circles");

  assert.deepEqual(arranged, [groupPost]);
});
