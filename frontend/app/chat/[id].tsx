import { useEffect, useMemo, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft02Icon,
  Camera01Icon,
  Image01Icon,
  SentIcon,
} from "@hugeicons/core-free-icons";
import { AnimatedPress } from "@/components/animated-press";
import { Avatar } from "@/components/avatar";
import { Icon } from "@/components/icon";
import { Row } from "@/components/layout";
import { Typography } from "@/components/typography";
import {
  CHAT_THREADS,
  CIRCLES,
  type ChatMessage,
} from "@/lib/mock";
import { useMessages } from "@/lib/messages";
import { setActiveConversation } from "@/lib/notifications";
import { colors, fonts, spacing } from "@/lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chat() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const thread = CHAT_THREADS.find((t) => t.id === id);
  const fallbackCircle = useMemo(() => {
    if (!id?.startsWith("circle-")) return null;
    return CIRCLES.find((circle) => circle.id === id.replace("circle-", "")) ?? null;
  }, [id]);
  const { messages, sendMessage: sendToDb } = useMessages(id);
  const [text, setText] = useState("");

  // Suppress notifications while viewing this conversation
  useEffect(() => {
    setActiveConversation(id ?? null);
    return () => setActiveConversation(null);
  }, [id]);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  const sendMessage = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    sendToDb(trimmed);
    setText("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.screen}>
      <Row style={styles.header}>
        <AnimatedPress onPress={() => router.back()} hitSlop={12} scale={0.88}>
          <Icon icon={ArrowLeft02Icon} size={24} color={colors.fg} />
        </AnimatedPress>
        {(thread || fallbackCircle) && (
          <Row gap={spacing.md} style={{ flex: 1 }}>
            <Avatar
              color={thread?.color ?? fallbackCircle?.accent ?? colors.primary}
              letter={thread?.letter ?? fallbackCircle?.name[0] ?? "C"}
              size={32}
              ring={false}
            />
            <View>
              <Typography
                style={{
                  fontFamily: fonts.bodySemibold,
                  fontSize: 15,
                  lineHeight: 20,
                  color: colors.fg,
                }}
              >
                {thread?.name ?? fallbackCircle?.name}
              </Typography>
              {thread?.online ? (
                <Typography variant="tiny" style={{ color: colors.success }}>
                  Active now
                </Typography>
              ) : fallbackCircle ? (
                <Typography variant="tiny" style={{ color: colors.fgFaint }}>
                  Circle chat
                </Typography>
              ) : null}
            </View>
          </Row>
        )}
      </Row>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble msg={item} />}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            if (messages.length > 0) {
              listRef.current?.scrollToEnd({ animated: false });
            }
          }}
        />

        <View style={styles.inputBar}>
          <AnimatedPress hitSlop={8} scale={0.88}>
            <Icon icon={Camera01Icon} size={24} color={colors.fgMuted} />
          </AnimatedPress>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Message..."
              placeholderTextColor={colors.fgFaint}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
            />
            {!text.trim() && (
              <AnimatedPress hitSlop={8} scale={0.88}>
                <Icon icon={Image01Icon} size={20} color={colors.fgMuted} />
              </AnimatedPress>
            )}
          </View>
          {text.trim() ? (
            <AnimatedPress onPress={sendMessage} hitSlop={8} scale={0.88}>
              <View style={styles.sendBtn}>
                <Icon icon={SentIcon} size={18} color={colors.onPrimary} />
              </View>
            </AnimatedPress>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MessageBubble({ msg }: { msg: ChatMessage }) {
  return (
    <View
      style={[
        styles.bubbleWrapper,
        msg.isMe ? styles.bubbleRight : styles.bubbleLeft,
      ]}
    >
      {!msg.isMe && (
        <Avatar
          color={msg.senderColor}
          letter={msg.senderLetter}
          size={28}
          ring={false}
        />
      )}
      <View
        style={[
          styles.bubble,
          msg.isMe ? styles.bubbleMe : styles.bubbleOther,
        ]}
      >
        <Typography
          variant="body"
          style={{
            color: msg.isMe ? colors.onPrimary : colors.fg,
            fontSize: 15,
            lineHeight: 21,
          }}
        >
          {msg.text}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  messageList: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  bubbleWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    marginVertical: 6,
  },
  bubbleRight: {
    justifyContent: "flex-end",
  },
  bubbleLeft: {
    justifyContent: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bubbleMe: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.bgSunk,
    borderBottomLeftRadius: 4,
  },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgSunk,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 8 : 4,
    minHeight: 40,
    gap: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 20,
    color: colors.fg,
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
