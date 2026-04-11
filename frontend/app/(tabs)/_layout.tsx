import { Tabs } from "expo-router";
import { View } from "react-native";
import {
  Home09Icon,
  Target02Icon,
  UserCircleIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import type { HugeiconsProps } from "@hugeicons/react-native";
import { Icon } from "@/components/icon";
import { Typography } from "@/components/typography";
import { colors, fonts } from "@/lib/theme";

type TabIconProps = {
  icon: HugeiconsProps["icon"];
  label: string;
  focused: boolean;
};

function TabIcon({ icon, label, focused }: TabIconProps) {
  return (
    <View style={{ alignItems: "center", gap: 3, width: 64, paddingTop: 4 }}>
      <Icon
        icon={icon}
        size={24}
        color={focused ? colors.fg : colors.fgDim}
        strokeWidth={focused ? 2.2 : 1.6}
      />
      <Typography
        style={{
          fontFamily: focused ? fonts.bodyBold : fonts.bodyMedium,
          fontSize: 10.5,
          lineHeight: 12,
          color: focused ? colors.fg : colors.fgDim,
        }}
      >
        {label}
      </Typography>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: colors.bgRaised,
          borderTopWidth: 0,
          elevation: 0,
          height: 78,
          paddingTop: 8,
          paddingBottom: 22,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Home09Icon} label="Home" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={Target02Icon} label="Habits" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="circles"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={UserGroupIcon} label="Circles" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={UserCircleIcon} label="Profile" focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}
