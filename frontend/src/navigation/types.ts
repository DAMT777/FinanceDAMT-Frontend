import { NavigatorScreenParams } from "@react-navigation/native";
import { TransactionDto, TransactionType } from "../types/api";

export type AuthStackParams = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  VerifyEmail: { email: string };
  Survey: undefined;
};

export type AppTabParams = {
  Dashboard: undefined;
  Transactions: undefined;
  AddTransaction:
    | { preSelectedType?: TransactionType; existingTransaction?: TransactionDto }
    | undefined;
  Goals: undefined;
  Profile: undefined;
};

export type AppStackParams = {
  Tabs: NavigatorScreenParams<AppTabParams>;
  Accounts: undefined;
  AddAccount: undefined;
  AddGoal: undefined;
  GoalContribution: { goalId: string; goalName: string };
  TransactionDetail: { transaction: TransactionDto };
  Notifications: undefined;
  AddBudget: undefined;
  Subscriptions: undefined;
  AddSubscription: undefined;
  Chat: undefined;
  AIRecommendations: undefined;
};

export type RootStackParams = {
  Auth: NavigatorScreenParams<AuthStackParams>;
  App: NavigatorScreenParams<AppStackParams>;
};
