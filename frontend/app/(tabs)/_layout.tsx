import { NativeTabs } from "expo-router/unstable-native-tabs";
import { colors, fonts } from "@/lib/theme";

export default function TabsLayout() {
  return (
    <NativeTabs
      tintColor={colors.primary}
      minimizeBehavior="never"
      labelStyle={{ fontFamily: fonts.bodySemibold, fontSize: 11 }}
      disableTransparentOnScrollEdge
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf={{ default: "house", selected: "house.fill" }} />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="habits">
        <NativeTabs.Trigger.Icon sf={{ default: "target", selected: "target" }} />
        <NativeTabs.Trigger.Label>Habits</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="circles">
        <NativeTabs.Trigger.Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <NativeTabs.Trigger.Label>Circles</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon sf={{ default: "person.circle", selected: "person.circle.fill" }} />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
