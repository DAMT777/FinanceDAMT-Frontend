import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppStackParams } from "./types";
import { colors } from "../constants/colors";
import AppNavigator from "./AppNavigator";
import AccountsScreen from "../screens/accounts/AccountsScreen";
import AddAccountScreen from "../screens/accounts/AddAccountScreen";
import AddGoalScreen from "../screens/goals/AddGoalScreen";
import GoalContributionScreen from "../screens/goals/GoalContributionScreen";
import TransactionDetailScreen from "../screens/transactions/TransactionDetailScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import AddBudgetScreen from "../screens/budgets/AddBudgetScreen";
import SubscriptionsScreen from "../screens/subscriptions/SubscriptionsScreen";
import AddSubscriptionScreen from "../screens/subscriptions/AddSubscriptionScreen";
import ChatScreen from "../screens/ai/ChatScreen";
import RecommendationsScreen from "../screens/ai/RecommendationsScreen";
import VenturesScreen from "../screens/ventures/VenturesScreen";
import AddVentureScreen from "../screens/ventures/AddVentureScreen";
import VentureDetailScreen from "../screens/ventures/VentureDetailScreen";
import AddBatchScreen from "../screens/ventures/AddBatchScreen";

const AppStack = createNativeStackNavigator<AppStackParams>();

export default function AppStackNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        animationDuration: 280,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <AppStack.Screen name="Tabs" component={AppNavigator} />
      <AppStack.Screen
        name="Accounts"
        component={AccountsScreen}
        options={{ presentation: "card" }}
      />
      <AppStack.Screen
        name="AddAccount"
        component={AddAccountScreen}
        options={{ presentation: "modal" }}
      />
      <AppStack.Screen
        name="AddGoal"
        component={AddGoalScreen}
        options={{ presentation: "modal" }}
      />
      <AppStack.Screen
        name="GoalContribution"
        component={GoalContributionScreen}
        options={{ presentation: "modal" }}
      />
      <AppStack.Screen
        name="TransactionDetail"
        component={TransactionDetailScreen}
        options={{ presentation: "modal" }}
      />
      <AppStack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ presentation: "card" }}
      />
      <AppStack.Screen
        name="AddBudget"
        component={AddBudgetScreen}
        options={{ presentation: "modal" }}
      />
      <AppStack.Screen
        name="Subscriptions"
        component={SubscriptionsScreen}
        options={{ presentation: "card" }}
      />
      <AppStack.Screen
        name="AddSubscription"
        component={AddSubscriptionScreen}
        options={{ presentation: "modal" }}
      />
      <AppStack.Screen
        name="Chat"
        component={ChatScreen}
        options={{ presentation: "card" }}
      />
      <AppStack.Screen
        name="AIRecommendations"
        component={RecommendationsScreen}
        options={{ presentation: "card" }}
      />
      <AppStack.Screen
        name="Ventures"
        component={VenturesScreen}
        options={{ presentation: "card" }}
      />
      <AppStack.Screen
        name="AddVenture"
        component={AddVentureScreen}
        options={{ presentation: "modal" }}
      />
      <AppStack.Screen
        name="VentureDetail"
        component={VentureDetailScreen}
        options={{ presentation: "card" }}
      />
      <AppStack.Screen
        name="AddBatch"
        component={AddBatchScreen}
        options={{ presentation: "modal" }}
      />
    </AppStack.Navigator>
  );
}
