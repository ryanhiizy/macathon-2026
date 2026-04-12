import test from "node:test";
import assert from "node:assert/strict";

import {
  resolveCircleDetailScreenState,
  resolveCirclesLoadState,
} from "./circle-screen-state.ts";

test("resolveCirclesLoadState treats demo sessions as a handled fallback path", () => {
  assert.deepEqual(
    resolveCirclesLoadState({
      userId: null,
      demoSessionId: "demo-user",
    }),
    { kind: "demo" },
  );
});

test("resolveCirclesLoadState returns an authenticated user when Supabase auth is present", () => {
  assert.deepEqual(
    resolveCirclesLoadState({
      userId: "user-123",
      demoSessionId: null,
    }),
    { kind: "authenticated", userId: "user-123" },
  );
});

test("resolveCirclesLoadState returns unauthenticated when no session identity exists", () => {
  assert.deepEqual(
    resolveCirclesLoadState({
      userId: null,
      demoSessionId: null,
    }),
    { kind: "unauthenticated" },
  );
});

test("resolveCircleDetailScreenState stays loading only while the request is in flight", () => {
  assert.equal(resolveCircleDetailScreenState({ loading: true, hasCircle: false }), "loading");
  assert.equal(resolveCircleDetailScreenState({ loading: false, hasCircle: true }), "ready");
});

test("resolveCircleDetailScreenState marks a missing circle as missing after load completes", () => {
  assert.equal(resolveCircleDetailScreenState({ loading: false, hasCircle: false }), "missing");
});
