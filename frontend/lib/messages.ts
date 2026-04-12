import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { CHAT_THREADS, CHAT_MESSAGES, type ChatThread, type ChatMessage } from "@/lib/mock";
import { colors } from "@/lib/theme";

// ── Types ─────────────────────────────────────────────────────────

export type DbMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_color: string;
  sender_letter: string;
  body: string;
  created_at: string;
};

// ── Current-user identity ─────────────────────────────────────────

function useCurrentUser() {
  const { user, demoSession } = useAuth();
  if (user) {
    return { id: user.id, name: "You", color: colors.purple, letter: "J" };
  }
  if (demoSession) {
    return { id: demoSession.id, name: "You", color: colors.purple, letter: "J" };
  }
  return { id: "anon", name: "You", color: colors.purple, letter: "J" };
}

// ── Seed mock data ────────────────────────────────────────────────

async function seedMockData(currentUserId: string) {
  // Check if already seeded by looking for any conversations
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .limit(1);

  if (existing && existing.length > 0) return;

  // Create conversations from mock threads
  const conversations = CHAT_THREADS.map((t) => ({
    id: t.id,
    name: t.name,
    is_group: t.isGroup ?? false,
  }));

  await supabase.from("conversations").upsert(conversations, { onConflict: "id" });

  // Seed messages from mock data
  const allMessages: {
    conversation_id: string;
    sender_id: string;
    sender_name: string;
    sender_color: string;
    sender_letter: string;
    body: string;
    created_at: string;
  }[] = [];

  const baseTime = new Date();
  baseTime.setHours(6, 0, 0, 0); // start at 6am today

  for (const [threadId, msgs] of Object.entries(CHAT_MESSAGES)) {
    msgs.forEach((msg, i) => {
      const msgTime = new Date(baseTime.getTime() + i * 60000); // 1 min apart
      allMessages.push({
        conversation_id: threadId,
        sender_id: msg.isMe ? currentUserId : msg.senderId,
        sender_name: msg.isMe ? "You" : msg.senderName,
        sender_color: msg.isMe ? colors.purple : msg.senderColor,
        sender_letter: msg.isMe ? "B" : msg.senderLetter,
        body: msg.text,
        created_at: msgTime.toISOString(),
      });
    });
  }

  if (allMessages.length > 0) {
    await supabase.from("messages").insert(allMessages);
  }
}

// ── Hooks ─────────────────────────────────────────────────────────

/** Load messages for a conversation + subscribe to realtime inserts */
export function useMessages(conversationId: string | undefined) {
  const currentUser = useCurrentUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const seededRef = useRef(false);

  // Seed on first mount
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    seedMockData(currentUser.id).catch(() => {});
  }, [currentUser.id]);

  // Fetch messages
  useEffect(() => {
    if (!conversationId) return;

    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (cancelled) return;

      if (error || !data || data.length === 0) {
        // Fallback to mock data if DB is empty for this conversation
        const mockMsgs = CHAT_MESSAGES[conversationId!] ?? [];
        setMessages(mockMsgs);
      } else {
        setMessages(
          data.map((m: DbMessage) => ({
            id: m.id,
            senderId: m.sender_id,
            senderName: m.sender_name,
            senderColor: m.sender_color,
            senderLetter: m.sender_letter,
            text: m.body,
            when: formatTime(m.created_at),
            isMe: m.sender_id === currentUser.id,
          })),
        );
      }
      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [conversationId, currentUser.id]);

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const m = payload.new as DbMessage;
          const chatMsg: ChatMessage = {
            id: m.id,
            senderId: m.sender_id,
            senderName: m.sender_name,
            senderColor: m.sender_color,
            senderLetter: m.sender_letter,
            text: m.body,
            when: formatTime(m.created_at),
            isMe: m.sender_id === currentUser.id,
          };
          setMessages((prev) => {
            // Avoid duplicates (we might already have it from optimistic insert)
            if (prev.some((p) => p.id === chatMsg.id)) return prev;
            return [...prev, chatMsg];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, currentUser.id]);

  // Send a message
  const sendMessage = useCallback(
    async (text: string) => {
      if (!conversationId || !text.trim()) return;

      const optimisticId = `opt-${Date.now()}`;
      const chatMsg: ChatMessage = {
        id: optimisticId,
        senderId: currentUser.id,
        senderName: "You",
        senderColor: currentUser.color,
        senderLetter: currentUser.letter,
        text: text.trim(),
        when: "now",
        isMe: true,
      };

      // Optimistic insert
      setMessages((prev) => [...prev, chatMsg]);

      // Ensure conversation exists
      await supabase
        .from("conversations")
        .upsert({ id: conversationId, name: null, is_group: false }, { onConflict: "id" });

      // Insert into DB
      const { data } = await supabase
        .from("messages")
        .insert({
          conversation_id: conversationId,
          sender_id: currentUser.id,
          sender_name: currentUser.name,
          sender_color: currentUser.color,
          sender_letter: currentUser.letter,
          body: text.trim(),
        })
        .select("id")
        .single();

      // Replace optimistic message with real one
      if (data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticId ? { ...m, id: data.id } : m)),
        );
      }
    },
    [conversationId, currentUser],
  );

  return { messages, loading, sendMessage };
}

/** Load thread list with latest message from Supabase */
export function useThreads() {
  const currentUser = useCurrentUser();
  const [threads, setThreads] = useState<ChatThread[]>(CHAT_THREADS);
  const [loading, setLoading] = useState(true);
  const seededRef = useRef(false);

  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    seedMockData(currentUser.id).catch(() => {});
  }, [currentUser.id]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Get latest message per conversation
      const { data: latestMessages } = await supabase
        .from("messages")
        .select("conversation_id, body, sender_name, created_at")
        .order("created_at", { ascending: false });

      if (cancelled) return;

      if (!latestMessages || latestMessages.length === 0) {
        setLoading(false);
        return;
      }

      // Group by conversation, take the latest
      const latestByConvo = new Map<string, { body: string; sender_name: string; created_at: string }>();
      for (const msg of latestMessages) {
        if (!latestByConvo.has(msg.conversation_id)) {
          latestByConvo.set(msg.conversation_id, msg);
        }
      }

      // Merge with mock thread metadata (keeping visual styling from mocks)
      const updated = CHAT_THREADS.map((thread) => {
        const latest = latestByConvo.get(thread.id);
        if (!latest) return thread;

        return {
          ...thread,
          lastMessage:
            latest.sender_name === "You"
              ? `You: ${latest.body}`
              : thread.isGroup
                ? `${latest.sender_name}: ${latest.body}`
                : latest.body,
          when: formatRelativeTime(latest.created_at),
        };
      });

      // Sort by most recent message
      updated.sort((a, b) => {
        const aLatest = latestByConvo.get(a.id);
        const bLatest = latestByConvo.get(b.id);
        if (!aLatest && !bLatest) return 0;
        if (!aLatest) return 1;
        if (!bLatest) return -1;
        return new Date(bLatest.created_at).getTime() - new Date(aLatest.created_at).getTime();
      });

      setThreads(updated);
      setLoading(false);
    }

    load();

    // Subscribe to new messages to update thread list
    const channel = supabase
      .channel("threads-latest")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => { load(); },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [currentUser.id]);

  return { threads, loading };
}

// ── Helpers ───────────────────────────────────────────────────────

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  return `${h}:${minutes} ${ampm}`;
}

function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHr < 24) return `${diffHr}h`;
  if (diffDay === 1) return "1d";
  if (diffDay < 7) return `${diffDay}d`;
  return formatTime(isoString);
}
