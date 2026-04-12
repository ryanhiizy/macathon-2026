import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SentIcon } from "@hugeicons/core-free-icons";
import { Avatar } from "@/components/avatar";
import { AnimatedPress } from "@/components/animated-press";
import { Icon } from "@/components/icon";
import { Typography } from "@/components/typography";
import { Row, Stack } from "@/components/layout";
import { LikeButton } from "@/components/like-button";
import { fetchComments, postComment, type CommentRow } from "@/lib/comments";
import { useAuth } from "@/lib/auth-context";
import { DEMO_USERS } from "@/lib/demo-users";
import { colors, fonts, radius, spacing } from "@/lib/theme";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_H = SCREEN_H * 0.65;
const DISMISS_THRESHOLD = 120;

type Props = {
  postId: string | null;
  onClose: () => void;
  onCommentPosted?: (postId: string) => void;
};

function formatWhen(timestamp: string) {
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.max(1, Math.floor(diffMs / (60 * 1000)));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function CommentsSheet({ postId, onClose, onCommentPosted }: Props) {
  const visible = postId != null;
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useSharedValue(SHEET_H);
  const backdropOpacity = useSharedValue(0);
  const startY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [inputText, setInputText] = useState("");
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Resolve current user info from demo users
  const demoUser = DEMO_USERS.find((u) => u.id === user?.id);
  const currentUser = {
    id: user?.id ?? "anon",
    name: demoUser?.name ?? "You",
    handle: `@${(demoUser?.name ?? "you").toLowerCase()}`,
    color: demoUser?.color ?? colors.purple,
    letter: (demoUser?.name ?? "Y")[0],
  };

  // Fetch comments from DB when sheet opens
  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    fetchComments(postId)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [postId]);

  const dismiss = useCallback(() => {
    Keyboard.dismiss();
    translateY.value = withTiming(SHEET_H, { duration: 260, easing: Easing.in(Easing.cubic) });
    backdropOpacity.value = withTiming(0, { duration: 220 }, () => {
      runOnJS(setModalVisible)(false);
      runOnJS(onClose)();
    });
  }, [backdropOpacity, onClose, translateY]);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      translateY.value = SHEET_H;
      backdropOpacity.value = 0;
      requestAnimationFrame(() => {
        translateY.value = withTiming(0, { duration: 320, easing: Easing.out(Easing.cubic) });
        backdropOpacity.value = withTiming(1, { duration: 280 });
      });
    }
  }, [visible, backdropOpacity, translateY]);

  const pan = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      const next = startY.value + e.translationY;
      translateY.value = Math.max(0, next);
      backdropOpacity.value = Math.max(0, 1 - next / SHEET_H);
    })
    .onEnd((e) => {
      if (translateY.value > DISMISS_THRESHOLD || e.velocityY > 600) {
        runOnJS(dismiss)();
      } else {
        translateY.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.cubic) });
        backdropOpacity.value = withTiming(1, { duration: 180 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const handleSend = () => {
    const body = inputText.trim();
    if (!body || !postId) return;
    setInputText("");
    Keyboard.dismiss();

    // Optimistic: add to local list immediately
    const optimistic: CommentRow = {
      id: `temp-${Date.now()}`,
      post_id: postId,
      user_id: currentUser.id,
      display_name: currentUser.name,
      handle: currentUser.handle,
      avatar_color: currentUser.color,
      avatar_letter: currentUser.letter,
      body,
      created_at: new Date().toISOString(),
    };
    setComments((prev) => [...prev, optimistic]);
    onCommentPosted?.(postId);

    // Persist to Supabase
    postComment(postId, body, currentUser)
      .then((saved) => {
        // Replace optimistic with real row
        setComments((prev) =>
          prev.map((c) => (c.id === optimistic.id ? saved : c)),
        );
      })
      .catch(() => {
        // Remove optimistic on failure
        setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      });
  };

  const renderComment = useCallback(({ item }: { item: CommentRow }) => (
    <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
      <Row gap={spacing.md} style={{ alignItems: "flex-start" }}>
        <Avatar color={item.avatar_color} letter={item.avatar_letter} size={32} ring={false} />
        <Stack gap={2} style={{ flex: 1 }}>
          <Row gap={spacing.sm}>
            <Typography
              style={{
                fontFamily: fonts.bodySemibold,
                fontSize: 13,
                lineHeight: 18,
                color: colors.fg,
              }}
            >
              {item.display_name}
            </Typography>
            <Typography variant="metaItalic">{formatWhen(item.created_at)}</Typography>
          </Row>
          <Typography variant="body" style={{ fontSize: 14, lineHeight: 20 }}>
            {item.body}
          </Typography>
          <Row gap={spacing.md} style={{ paddingTop: 2 }}>
            <LikeButton initialCount={0} />
            <AnimatedPress haptic={false} scale={0.95}>
              <Typography variant="metaItalic" style={{ fontFamily: fonts.bodySemibold, fontSize: 11.5 }}>
                Reply
              </Typography>
            </AnimatedPress>
          </Row>
        </Stack>
      </Row>
    </View>
  ), []);

  return (
    <Modal visible={modalVisible} transparent animationType="none" statusBarTranslucent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={{ flex: 1 }} onPress={dismiss}>
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0,0,0,0.45)",
              },
              backdropStyle,
            ]}
          />
        </Pressable>

        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              {
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: SHEET_H + insets.bottom,
                backgroundColor: colors.bg,
                borderTopLeftRadius: radius.lg,
                borderTopRightRadius: radius.lg,
                overflow: "hidden",
              },
              sheetStyle,
            ]}
          >
            {/* Handle + Header */}
            <View style={{ alignItems: "center", paddingTop: spacing.sm }}>
              <View
                style={{
                  width: 36,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: colors.border,
                }}
              />
            </View>
            <View
              style={{
                paddingVertical: spacing.md,
                alignItems: "center",
                borderBottomWidth: 0.5,
                borderBottomColor: colors.border,
              }}
            >
              <Typography
                style={{
                  fontFamily: fonts.bodySemibold,
                  fontSize: 15,
                  lineHeight: 20,
                  color: colors.fg,
                }}
              >
                Comments{comments.length > 0 ? ` (${comments.length})` : ""}
              </Typography>
            </View>

            {/* Comments list */}
            <FlatList
              data={comments}
              keyExtractor={(c) => c.id}
              renderItem={renderComment}
              contentContainerStyle={{ paddingVertical: spacing.sm }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              ListEmptyComponent={
                <View style={{ alignItems: "center", paddingTop: spacing.xxl }}>
                  <Typography variant="bodyMuted">
                    {loading ? "Loading..." : "No comments yet"}
                  </Typography>
                </View>
              }
            />

            {/* Input bar */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: spacing.sm,
                paddingHorizontal: spacing.lg,
                paddingTop: spacing.sm,
                paddingBottom: spacing.sm + insets.bottom,
                borderTopWidth: 0.5,
                borderTopColor: colors.border,
                backgroundColor: colors.bg,
              }}
            >
              <Avatar color={currentUser.color} letter={currentUser.letter} size={30} ring={false} />
              <TextInput
                ref={inputRef}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Add a comment..."
                placeholderTextColor={colors.fgFaint}
                style={{
                  flex: 1,
                  fontFamily: fonts.body,
                  fontSize: 14,
                  color: colors.fg,
                  paddingVertical: Platform.OS === "ios" ? 10 : 8,
                  paddingHorizontal: spacing.md,
                  backgroundColor: colors.bgRaised,
                  borderRadius: radius.pill,
                }}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              {inputText.trim().length > 0 && (
                <AnimatedPress onPress={handleSend} scale={0.9}>
                  <Icon icon={SentIcon} size={22} color={colors.primary} strokeWidth={1.8} />
                </AnimatedPress>
              )}
            </View>
          </Animated.View>
        </GestureDetector>
      </KeyboardAvoidingView>
    </Modal>
  );
}
