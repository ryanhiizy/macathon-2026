import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { colors, fonts } from "@/lib/theme";

export default function TabsLayout() {
  return (
    <NativeTabs
      tintColor={colors.primary}
      minimizeBehavior="never"
      labelStyle={{ fontFamily: fonts.bodySemibold, fontSize: 11 }}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="habits">
        <Icon sf={{ default: "target", selected: "target" }} />
        <Label>Habits</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="circles">
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <Label>Circles</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person.circle", selected: "person.circle.fill" }} />
        <Label>Profile</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
