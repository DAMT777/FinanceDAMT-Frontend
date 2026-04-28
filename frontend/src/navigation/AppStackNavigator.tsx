import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppStackParams } from "./types";
import AppNavigator from "./AppNavigator";
import AccountsScreen from "../screens/accounts/AccountsScreen";
import AddAccountScreen from "../screens/accounts/AddAccountScreen";
import AddGoalScreen from "../screens/goals/AddGoalScreen";
import GoalContributionScreen from "../screens/goals/GoalContributionScreen";
import TransactionDetailScreen from "../screens/transactions/TransactionDetailScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import AddBudgetScreen from "../screens/budgets/AddBudgetScreen";
import ChatScreen from "../screens/ai/ChatScreen";
import RecommendationsScreen from "../screens/ai/RecommendationsScreen";

const AppStack = createNativeStackNavigator<AppStackParams>();

export default function AppStackNavigator() {
  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
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
        name="Chat"
        component={ChatScreen}
        options={{ presentation: "card" }}
      />
      <AppStack.Screen
        name="AIRecommendations"
        component={RecommendationsScreen}
        options={{ presentation: "card" }}
      />
    </AppStack.Navigator>
  );
}
