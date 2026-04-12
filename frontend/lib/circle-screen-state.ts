export type CirclesLoadState =
  | { kind: "demo" }
  | { kind: "authenticated"; userId: string }
  | { kind: "unauthenticated" };

export function resolveCirclesLoadState({
  userId,
  demoSessionId,
}: {
  userId: string | null | undefined;
  demoSessionId: string | null | undefined;
}): CirclesLoadState {
  if (demoSessionId) {
    return { kind: "demo" };
  }

  if (userId) {
    return { kind: "authenticated", userId };
  }

  return { kind: "unauthenticated" };
}

export function resolveCircleDetailScreenState({
  loading,
  hasCircle,
}: {
  loading: boolean;
  hasCircle: boolean;
}): "loading" | "missing" | "ready" {
  if (loading) {
    return "loading";
  }

  if (hasCircle) {
    return "ready";
  }

  return "missing";
}
