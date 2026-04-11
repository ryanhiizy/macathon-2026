import { useState } from "react";
import {
  Button,
  CircularProgress,
  DateTimePicker,
  Form,
  Host,
  HStack,
  Image,
  Label,
  LabeledContent,
  LinearProgress,
  Picker,
  Section,
  Slider,
  Spacer,
  Switch,
  Text,
  TextField,
  VStack,
} from "@expo/ui/swift-ui";
import Constants from "expo-constants";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text as RNText, View } from "react-native";

const PROMPT_MODES = ["Gentle", "Chaotic", "Competitive"];

function formatReminderTime(date: Date) {
  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Index() {
  const isExpoGo = Constants.executionEnvironment === "storeClient";
  const [consistencyScore, setConsistencyScore] = useState(0.72);
  const [promptModeIndex, setPromptModeIndex] = useState(1);
  const [streakProtection, setStreakProtection] = useState(true);
  const [circleOnlyFeed, setCircleOnlyFeed] = useState(false);
  const [habitTitle, setHabitTitle] = useState("Sunrise walk");
  const [reminderTime, setReminderTime] = useState("8:15 AM");

  if (isExpoGo) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.fallbackCard}>
          <RNText style={styles.fallbackEyebrow}>presence</RNText>
          <RNText style={styles.fallbackTitle}>Expo Go fallback is running</RNText>
          <RNText style={styles.fallbackBody}>
            Expo UI SwiftUI is already installed, but the native SwiftUI controls only render inside the
            built iPhone app. Expo Go stays usable with this fallback while the Xcode build shows the full
            SwiftUI showcase.
          </RNText>
          <Pressable
            onPress={() =>
              Alert.alert("Expo Go", "Open the built macathon-2026 app to see the full Expo UI SwiftUI demo.")
            }
            style={styles.fallbackButton}
          >
            <RNText style={styles.fallbackButtonText}>Show Expo Go Status</RNText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Host style={styles.host}>
        <Form scrollEnabled>
          <Section title="Expo UI SwiftUI">
            <VStack spacing={16}>
              <HStack spacing={12}>
                <Image systemName="sparkles" size={30} color="#2563eb" />
                <VStack spacing={6}>
                  <Text>presence native showcase</Text>
                  <Text>SwiftUI controls are rendering inside the iPhone build.</Text>
                </VStack>
                <Spacer />
                <CircularProgress progress={consistencyScore} color="#2563eb" />
              </HStack>
              <LinearProgress color="#2563eb" progress={consistencyScore} />
              <LabeledContent label="Today's confidence">
                <Text>{`${Math.round(consistencyScore * 100)}%`}</Text>
              </LabeledContent>
            </VStack>
          </Section>

          <Section title="Check-in setup">
            <TextField
              defaultValue={habitTitle}
              key={habitTitle}
              onChangeText={setHabitTitle}
              placeholder="Habit title"
            />
            <Picker
              options={PROMPT_MODES}
              selectedIndex={promptModeIndex}
              onOptionSelected={(event) => setPromptModeIndex(event.nativeEvent.index)}
              variant="segmented"
            />
            <Slider
              color="#2563eb"
              max={1}
              min={0}
              onValueChange={setConsistencyScore}
              steps={10}
              value={consistencyScore}
            />
            <DateTimePicker
              displayedComponents="hourAndMinute"
              initialDate={new Date().toISOString()}
              onDateSelected={(date) => setReminderTime(formatReminderTime(date))}
              title="Reminder"
              variant="compact"
            />
            <LabeledContent label="Reminder time">
              <Text>{reminderTime}</Text>
            </LabeledContent>
          </Section>

          <Section title="Demo toggles">
            <Switch
              label="Streak protection"
              onValueChange={setStreakProtection}
              value={streakProtection}
            />
            <Switch
              label="Circle-only feed"
              onValueChange={setCircleOnlyFeed}
              value={circleOnlyFeed}
            />
            <Label color="#2563eb" systemImage="bell.badge" title="Local notifications only" />
            <LabeledContent label="Prompt mode">
              <Text>{PROMPT_MODES[promptModeIndex]}</Text>
            </LabeledContent>
            <LabeledContent label="Current habit">
              <Text>{habitTitle}</Text>
            </LabeledContent>
          </Section>

          <Section title="Action">
            <Button
              onPress={() =>
                Alert.alert(
                  "SwiftUI demo",
                  `${habitTitle} is set for ${reminderTime} with ${PROMPT_MODES[promptModeIndex]} prompts.`
                )
              }
            >
              <Text>Launch demo check-in</Text>
            </Button>
          </Section>
        </Form>
      </Host>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },
  fallbackCard: {
    margin: 24,
    marginTop: 96,
    borderRadius: 28,
    backgroundColor: "#ffffff",
    padding: 24,
    gap: 16,
    shadowColor: "#111827",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  fallbackEyebrow: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  fallbackTitle: {
    color: "#111827",
    fontSize: 32,
    fontWeight: "800",
  },
  fallbackBody: {
    color: "#4b5563",
    fontSize: 17,
    lineHeight: 26,
  },
  fallbackButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  fallbackButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  host: {
    flex: 1,
  },
});
