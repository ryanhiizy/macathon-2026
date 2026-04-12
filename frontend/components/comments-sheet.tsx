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
import { type Comment, COMMENTS } from "@/lib/mock";
import { colors, fonts, radius, spacing } from "@/lib/theme";

const { height: SCREEN_H } = Dimensions.get("window");
const SHEET_H = SCREEN_H * 0.65;
const DISMISS_THRESHOLD = 120;

type Props = {
  postId: string | null;
  onClose: () => void;
};

export function CommentsSheet({ postId, onClose }: Props) {
  const visible = postId != null;
  const [modalVisible, setModalVisible] = useState(false);
  const translateY = useSharedValue(SHEET_H);
  const backdropOpacity = useSharedValue(0);
  const startY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [inputText, setInputText] = useState("");

  const comments = postId ? COMMENTS[postId] ?? [] : [];

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
    if (!inputText.trim()) return;
    setInputText("");
    Keyboard.dismiss();
  };

  const renderComment = useCallback(({ item }: { item: Comment }) => (
    <View style={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
      <Row gap={spacing.md} style={{ alignItems: "flex-start" }}>
        <Avatar color={item.color} letter={item.letter} size={32} ring={false} />
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
              {item.name}
            </Typography>
            <Typography variant="metaItalic">{item.when}</Typography>
          </Row>
          <Typography variant="body" style={{ fontSize: 14, lineHeight: 20 }}>
            {item.text}
          </Typography>
          <Row gap={spacing.md} style={{ paddingTop: 2 }}>
            <LikeButton initialCount={item.likes} />
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
                Comments
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
                  <Typography variant="bodyMuted">No comments yet</Typography>
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
              <Avatar color={colors.purple} letter="B" size={30} ring={false} />
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
