import type { FeedPost } from "@/lib/mock";

export type HomeFeedTab = "friends" | "circles";
type HomeFeedPost = FeedPost & { circlesEligible?: boolean };
type PostKind = HomeFeedPost["kind"];

export function postAppearsInHomeTab(post: HomeFeedPost, tab: HomeFeedTab): boolean {
  if (post.kind === "dispatch") {
    return tab === "friends";
  }

  if (tab === "circles" && post.circlesEligible === false) {
    return false;
  }

  return true;
}

export function filterPostsForHomeTab(posts: HomeFeedPost[], tab: HomeFeedTab): HomeFeedPost[] {
  const eligible = posts.filter((post) => postAppearsInHomeTab(post, tab));
  const queues = {
    solo: eligible.filter(
      (post): post is Extract<HomeFeedPost, { kind: "solo" }> => post.kind === "solo",
    ),
    group: eligible.filter(
      (post): post is Extract<HomeFeedPost, { kind: "group" }> => post.kind === "group",
    ),
    dispatch: eligible.filter(
      (post): post is Extract<HomeFeedPost, { kind: "dispatch" }> => post.kind === "dispatch",
    ),
  };

  const pattern: PostKind[] =
    tab === "friends" ? ["solo", "group", "solo", "dispatch", "group"] : ["group", "solo"];

  const fallback: PostKind[] =
    tab === "friends" ? ["solo", "group", "dispatch"] : ["group", "solo"];
  const arranged: HomeFeedPost[] = [];

  while (arranged.length < eligible.length) {
    const requestedKind = pattern[arranged.length % pattern.length];
    const next = takeNextPost(queues, requestedKind) ?? takeFirstAvailablePost(queues, fallback);

    if (!next) {
      break;
    }

    arranged.push(next);
  }

  return arranged;
}

function takeNextPost(
  queues: Record<PostKind, HomeFeedPost[]>,
  kind: PostKind,
): HomeFeedPost | null {
  return queues[kind].shift() ?? null;
}

function takeFirstAvailablePost(
  queues: Record<PostKind, HomeFeedPost[]>,
  fallbackOrder: PostKind[],
): HomeFeedPost | null {
  for (const kind of fallbackOrder) {
    const next = takeNextPost(queues, kind);
    if (next) {
      return next;
    }
  }

  return null;
}
