const MOCK_PHOTO_MAP: Record<string, string> = {
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

const FALLBACK_PHOTO =
  "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=800&fit=crop&q=80";

export function resolveCircleSnapPhoto(path: string, storagePublicUrl?: string): { uri: string } {
  const unsplashId = MOCK_PHOTO_MAP[path];
  if (unsplashId) {
    return { uri: `https://images.unsplash.com/${unsplashId}?w=800&h=800&fit=crop&q=80` };
  }

  if (storagePublicUrl) {
    return { uri: storagePublicUrl };
  }

  return { uri: FALLBACK_PHOTO };
}

function makeFallbackWhenOlderThan(baseWhen: string, offset: number): string {
  const match = baseWhen.trim().match(/^(\d+)([mhd]) ago$/i);
  if (!match) {
    return `${offset}d ago`;
  }

  const value = Number(match[1]);
  const unit = match[2]?.toLowerCase();

  if (unit === "m") {
    return `${Math.max(1, Math.ceil(value / 60)) + offset - 1}h ago`;
  }

  if (unit === "h") {
    return `${value + offset * 2}h ago`;
  }

  return `${value + offset}d ago`;
}

export function mergeCircleSnapsForFeed<T extends { when: string }>(
  realSnaps: T[],
  fallbackSnaps: T[],
): T[] {
  if (realSnaps.length === 0) {
    return fallbackSnaps.slice(0, 4);
  }

  if (realSnaps.length >= 4) {
    return realSnaps;
  }

  const oldestRealWhen = realSnaps[realSnaps.length - 1]?.when ?? "1d ago";
  const appendedFallbacks = fallbackSnaps
    .slice(0, 4 - realSnaps.length)
    .map((snap, index) => ({
      ...snap,
      when: makeFallbackWhenOlderThan(oldestRealWhen, index + 1),
    }));

  return [...realSnaps, ...appendedFallbacks];
}
