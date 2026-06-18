// Auth
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  name: string;
  expiresIn: number;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// User / Survey
export type FinancialProfile = "Conservative" | "Balanced" | "AtRisk";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  currency: string;
  financialProfile: FinancialProfile | null;
  biometricEnabled: boolean;
  createdAt: string;
}

export interface SurveyRequest {
  employmentType: string;
  monthlyIncome: number;
  dependents: number;
  fixedExpenses: number;
  financialGoals: string;
  savingsLevel: string;
}

// Accounts
export type AccountType = "Cash" | "Bank" | "Credit";

export interface AccountDto {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  creditLimit?: number;
  cutoffDay?: number;
  paymentDay?: number;
}

export interface CreateAccountRequest {
  name: string;
  type: AccountType;
  balance: number;
  creditLimit?: number;
  cutoffDay?: number;
  paymentDay?: number;
}

export interface UpdateAccountRequest extends Partial<CreateAccountRequest> {}

export interface TransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
}

export interface NetWorthDto {
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
}

// Categories
export type TransactionType = "Income" | "Expense" | "Transfer";

export interface CategoryDto {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
  isGlobal: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// Transactions
export interface TransactionDto {
  id: string;
  accountId: string;
  accountName: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  type: TransactionType;
  amount: number;
  date: string;
  description?: string;
  receiptUrl?: string;
  isRecurring: boolean;
}

export interface CreateTransactionRequest {
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  date: string;
  description?: string;
}

export interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {
  isRecurring?: boolean;
}

export interface TransactionFilters {
  accountId?: string;
  categoryId?: string;
  type?: TransactionType;
  dateFrom?: string;
  dateTo?: string;
  searchText?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard
export interface DashboardSummaryDto {
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  monthOverMonthIncomeChange: number;
  monthOverMonthExpenseChange: number;
  expenseByCategory?: CategoryBreakdownDto[] | null;
  monthlyTrend?: MonthlyTrendDto[] | null;
  balanceEvolution?: BalancePointDto[] | null;
  spendingHeatmap?: HeatmapDayDto[] | null;
  recentTransactions?: TransactionDto[] | null;
  savingGoals?: SavingGoalDto[] | null;
  budgets?: BudgetDto[] | null;
  projectedExpenses: number;
}

export interface CategoryBreakdownDto {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrendDto {
  month: string;
  year: number;
  income: number;
  expenses: number;
}

export interface BalancePointDto {
  date: string;
  balance: number;
}

export interface HeatmapDayDto {
  day: number;
  amount: number;
  intensity: number;
}

// Budgets
export interface BudgetDto {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  monthlyLimit: number;
  spentAmount: number;
  percentage: number;
  alertSent80: boolean;
  alertSent100: boolean;
  month: number;
  year: number;
}

export interface SetBudgetRequest {
  categoryId: string;
  monthlyLimit: number;
  month?: number;
  year?: number;
}

// Saving Goals
export interface SavingGoalDto {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  isCompleted: boolean;
  progressPercentage: number;
  estimatedCompletionDate?: string;
  milestonesReached: number;
}

export interface CreateSavingGoalRequest {
  name: string;
  icon: string;
  targetAmount: number;
  deadline: string;
}

export interface AddContributionRequest {
  amount: number;
  date: string;
  note?: string;
}

export interface UpdateSavingGoalRequest extends Partial<CreateSavingGoalRequest> {}

// Subscriptions
export type BillingCycle = "Weekly" | "Monthly" | "Quarterly" | "Yearly";

export interface SubscriptionDto {
  id: string;
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  icon: string;
  isActive: boolean;
  notes?: string;
  monthlyCost: number;
}

export interface CreateSubscriptionRequest {
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  icon: string;
  notes?: string;
}

export interface UpdateSubscriptionRequest {
  name: string;
  amount: number;
  billingCycle: BillingCycle;
  nextBillingDate: string;
  icon: string;
  isActive: boolean;
  notes?: string;
}

// AI
export interface ChatMessageDto {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  history: ChatMessageDto[];
}

export interface ChatResponse {
  response: string;
  history: ChatMessageDto[];
}

export interface AIRecommendationDto {
  id: string;
  content: string;
  type: string;
  isUseful?: boolean;
  isRead: boolean;
  generatedAt: string;
}

export interface FinancialScoreDto {
  score: number;
  breakdown: ScoreBreakdownDto;
  month: number;
  year: number;
}

export interface ScoreBreakdownDto {
  savingsRatio: number;
  budgetCompliance: number;
  goalProgress: number;
  expenseDiversification: number;
}

export interface SpendingPredictionDto {
  predictedTotal: number;
  byCategory: CategoryPredictionDto[];
  confidence: number;
}

export interface CategoryPredictionDto {
  categoryName: string;
  predictedAmount: number;
}

export interface ParseExpenseResult {
  amount: number;
  categoryName: string;
}

// Debts
export interface DebtDto {
  id: string;
  description: string;
  amount: number;
  isPaid: boolean;
  creditorOrDebtor: string;
  dueDate?: string;
  type: "Given" | "Received";
}
