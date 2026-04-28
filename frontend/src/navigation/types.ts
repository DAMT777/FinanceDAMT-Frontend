import { NavigatorScreenParams } from "@react-navigation/native";
import { TransactionDto, TransactionType } from "../types/api";

export type AuthStackParams = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
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

/** Modal and detail screens that sit on top of the tab navigator */
export type AppStackParams = {
  Tabs: NavigatorScreenParams<AppTabParams>;
  Accounts: undefined;
  AddAccount: undefined;
  AddGoal: undefined;
  GoalContribution: { goalId: string; goalName: string };
  TransactionDetail: { transaction: TransactionDto };
  Notifications: undefined;
  AddBudget: undefined;
  Chat: undefined;
  AIRecommendations: undefined;
};

export type RootStackParams = {
  Auth: NavigatorScreenParams<AuthStackParams>;
  App: NavigatorScreenParams<AppStackParams>;
};
