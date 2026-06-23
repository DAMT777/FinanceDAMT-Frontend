import { BottomTabBarProps, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppTabParams } from "./types";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import FloatingAIButton from "../components/FloatingAIButton";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import TransactionListScreen from "../screens/transactions/TransactionListScreen";
import AddTransactionScreen from "../screens/transactions/AddTransactionScreen";
import SavingGoalsScreen from "../screens/goals/SavingGoalsScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";

const Tab = createBottomTabNavigator<AppTabParams>();

type TabItemProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
};

function TabItem({ label, icon, isActive, onPress }: TabItemProps) {
  const scale = useSharedValue(1);
  const dotScale = useSharedValue(isActive ? 1 : 0);
  const dotOpacity = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    dotScale.value = withSpring(isActive ? 1 : 0, { damping: 14, stiffness: 220 });
    dotOpacity.value = withSpring(isActive ? 1 : 0, { damping: 14 });
  }, [isActive]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
    opacity: dotOpacity.value,
  }));

  return (
    <Pressable
      onPress={() => {
        scale.value = withSpring(0.8, { damping: 10 }, () => {
          scale.value = withSpring(1.1, { damping: 10 }, () => {
            scale.value = withSpring(1, { damping: 14 });
          });
        });
        onPress();
      }}
      style={styles.tabItem}
    >
      <Animated.View style={iconStyle}>
        <Ionicons name={icon} size={22} color={isActive ? colors.primary : colors.textMuted} />
      </Animated.View>
      {isActive ? (
        <Text style={styles.tabLabelActive}>{label}</Text>
      ) : null}
      <Animated.View style={[styles.activeDot, dotStyle]} />
    </Pressable>
  );
}

function CenterFab({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(0);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 8, stiffness: 150 });
  }, []);

  const mountStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pressScale.value }],
  }));

  return (
    <Animated.View style={[styles.centerFabWrap, mountStyle]}>
      <Pressable
        onPressIn={() => { pressScale.value = withSpring(0.88, { damping: 12 }); }}
        onPressOut={() => { pressScale.value = withSpring(1, { damping: 12 }); }}
        onPress={onPress}
        style={styles.centerFabPressable}
      >
        <LinearGradient
          colors={["#00D68F", "#00B87A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.centerFab}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const routes = state.routes;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.tabBarWrap, { bottom: Math.max(insets.bottom, 12) + 8 }]}>
      <View style={styles.tabBarPill}>
        {routes.map((route, index) => {
          const isFocused = state.index === index;

          if (route.name === "AddTransaction") {
            return (
              <CenterFab
                key={route.key}
                onPress={() => navigation.navigate("AddTransaction")}
              />
            );
          }

          const config: Record<string, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
            Dashboard: { label: "Home", icon: "grid-outline" },
            Transactions: { label: "History", icon: "swap-horizontal-outline" },
            Goals: { label: "Goals", icon: "trophy-outline" },
            Profile: { label: "Profile", icon: "person-outline" },
          };

          const current = config[route.name] ?? { label: route.name, icon: "ellipse-outline" };

          return (
            <TabItem
              key={route.key}
              label={current.label}
              icon={current.icon}
              isActive={isFocused}
              onPress={() => navigation.navigate(route.name as keyof AppTabParams)}
            />
          );
        })}
      </View>
    </View>
  );
}

export default function AppNavigator() {
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false, animation: "shift" }}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Transactions" component={TransactionListScreen} />
        <Tab.Screen name="AddTransaction" component={AddTransactionScreen} />
        <Tab.Screen name="Goals" component={SavingGoalsScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <FloatingAIButton />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarWrap: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 24,
  },
  tabBarPill: {
    height: 68,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    backgroundColor: "rgba(20,20,38,0.97)",
    paddingHorizontal: spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    gap: 2,
    minHeight: 48,
  },
  tabLabelActive: {
    color: colors.primary,
    fontSize: 11,
    fontFamily: typography.fontFamily.body,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  centerFabWrap: {
    marginTop: -12,
  },
  centerFabPressable: {
    borderRadius: 28,
    overflow: "hidden",
  },
  centerFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
});
