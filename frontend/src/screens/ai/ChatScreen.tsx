import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Input from "../../components/ui/Input";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { useAccounts } from "../../hooks/useAccounts";
import { useChatMessage } from "../../hooks/useAI";
import { useCategories } from "../../hooks/useCategories";
import { useDashboard } from "../../hooks/useDashboard";
import { useCreateTransaction } from "../../hooks/useTransactions";
import { CategoryDto, ChatMessageDto, TransactionType } from "../../types/api";

type ChatUiMessage = ChatMessageDto & { id: string };

type PendingTransaction = {
  type: TransactionType;
  amount: number;
  categoryId: string;
  categoryName: string;
  date: string;
};

const FALLBACK_CATEGORIES: CategoryDto[] = [
  { id: "food", name: "Comida", icon: "\u{1F354}", color: "#FF6B6B", type: "Expense", isGlobal: false },
  { id: "transport", name: "Transporte", icon: "\u{1F697}", color: "#4ECDC4", type: "Expense", isGlobal: false },
  { id: "health", name: "Salud", icon: "\u{1F48A}", color: "#FF6B9D", type: "Expense", isGlobal: false },
  { id: "entertainment", name: "Ocio", icon: "\u{1F3AE}", color: "#A8E6CF", type: "Expense", isGlobal: false },
  { id: "housing", name: "Hogar", icon: "\u{1F3E0}", color: "#FFE66D", type: "Expense", isGlobal: false },
  { id: "salary", name: "Salario", icon: "\u{1F4BC}", color: "#00D68F", type: "Income", isGlobal: false },
  { id: "freelance", name: "Freelance", icon: "\u{1F4BB}", color: "#00B4D8", type: "Income", isGlobal: false },
  { id: "investment", name: "Inversión", icon: "\u{1F4C8}", color: "#6C63FF", type: "Income", isGlobal: false },
  { id: "other", name: "Otro", icon: "\u{1F4B3}", color: "#8080AA", type: "Expense", isGlobal: false },
];

const CATEGORY_KEYWORDS: Array<{ keyword: string; category: string; type: TransactionType }> = [
  { keyword: "comida", category: "Comida", type: "Expense" },
  { keyword: "restaurante", category: "Comida", type: "Expense" },
  { keyword: "almuerzo", category: "Comida", type: "Expense" },
  { keyword: "cena", category: "Comida", type: "Expense" },
  { keyword: "gasolina", category: "Transporte", type: "Expense" },
  { keyword: "transporte", category: "Transporte", type: "Expense" },
  { keyword: "uber", category: "Transporte", type: "Expense" },
  { keyword: "salud", category: "Salud", type: "Expense" },
  { keyword: "medicina", category: "Salud", type: "Expense" },
  { keyword: "hogar", category: "Hogar", type: "Expense" },
  { keyword: "ocio", category: "Ocio", type: "Expense" },
  { keyword: "salario", category: "Salario", type: "Income" },
  { keyword: "sueldo", category: "Salario", type: "Income" },
  { keyword: "freelance", category: "Freelance", type: "Income" },
  { keyword: "inversion", category: "Inversión", type: "Income" },
  { keyword: "inversión", category: "Inversión", type: "Income" },
];

function parseMessageParts(content: string): Array<{ text: string; style?: "moneyPositive" | "moneyNegative" | "percent" }> {
  const regex = /(\$\d[\d.,]*)|((?:\d{1,3})?%)/g;
  const parts: Array<{ text: string; style?: "moneyPositive" | "moneyNegative" | "percent" }> = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > last) {
      parts.push({ text: content.slice(last, match.index) });
    }
    const token = match[0];
    if (token.includes("%")) {
      parts.push({ text: token, style: "percent" });
    } else {
      parts.push({ text: token, style: token.startsWith("-$") ? "moneyNegative" : "moneyPositive" });
    }
    last = match.index + token.length;
  }

  if (last < content.length) {
    parts.push({ text: content.slice(last) });
  }

  return parts;
}

function createMessage(role: "user" | "assistant", content: string): ChatUiMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseAmount(text: string): number {
  const lower = text.toLowerCase();

  const millionMatch = lower.match(/(\d+[\d.,]*)\s*(millones|millon|millón)/);
  if (millionMatch) {
    const base = Number.parseFloat(millionMatch[1].replace(/\./g, "").replace(",", "."));
    return Number.isFinite(base) ? Math.round(base * 1000000) : 0;
  }

  const thousandMatch = lower.match(/(\d+[\d.,]*)\s*mil/);
  if (thousandMatch) {
    const base = Number.parseFloat(thousandMatch[1].replace(/\./g, "").replace(",", "."));
    return Number.isFinite(base) ? Math.round(base * 1000) : 0;
  }

  const numericMatch = lower.match(/\d{1,3}(?:\.\d{3})+|\d+/);
  if (!numericMatch) return 0;
  return Number.parseInt(numericMatch[0].replace(/\./g, ""), 10) || 0;
}

function detectTransactionType(text: string): TransactionType | null {
  const lower = text.toLowerCase();
  const incomeWords = ["recibi", "recibí", "ingreso", "salario", "sueldo", "me pagaron", "gané", "gane"];
  const expenseWords = ["gaste", "gasté", "pague", "pagué", "compre", "compré", "pago", "gastado"];

  if (incomeWords.some((word) => lower.includes(word))) return "Income";
  if (expenseWords.some((word) => lower.includes(word))) return "Expense";
  return null;
}

function findCategoryByIntent(text: string, type: TransactionType, categories: CategoryDto[]): CategoryDto | null {
  const lower = text.toLowerCase();
  const normalizedCategories = categories.filter((c) => c.type === type);

  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.type !== type) continue;
    if (!lower.includes(entry.keyword)) continue;
    const byName = normalizedCategories.find((cat) => cat.name.toLowerCase() === entry.category.toLowerCase());
    if (byName) return byName;
  }

  return normalizedCategories.find((cat) => cat.name.toLowerCase().includes("otro")) ?? normalizedCategories[0] ?? null;
}

function isBalanceIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return [
    "cuanto gaste",
    "cuánto gasté",
    "mis finanzas",
    "como van mis finanzas",
    "cómo van mis finanzas",
    "cuanto tengo ahorrado",
    "cuánto tengo ahorrado",
  ].some((entry) => lower.includes(entry));
}

export default function ChatScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [pendingTransaction, setPendingTransaction] = useState<PendingTransaction | null>(null);
  const chatMutation = useChatMessage();
  const createTransaction = useCreateTransaction();
  const { data: categories } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const { data: dashboard } = useDashboard();

  const suggestions = [t("ai.suggestion1"), t("ai.suggestion2"), t("ai.suggestion3")];
  const displayCategories = useMemo(
    () => (categories && categories.length ? categories : FALLBACK_CATEGORIES),
    [categories],
  );

  const confirmTransaction = async () => {
    if (!pendingTransaction || !accounts.length) return;

    try {
      await createTransaction.mutateAsync({
        accountId: accounts[0].id,
        categoryId: pendingTransaction.categoryId,
        type: pendingTransaction.type,
        amount: pendingTransaction.amount,
        date: pendingTransaction.date,
      });

      const typeLabel = pendingTransaction.type === "Expense" ? "Gasto" : "Ingreso";
      setMessages((prev) => [
        ...prev,
        createMessage("assistant", `\u2713 ${typeLabel} de ${formatCOP(pendingTransaction.amount)} registrado en ${pendingTransaction.categoryName}.`),
      ]);
      setPendingTransaction(null);
    } catch {
      setMessages((prev) => [
        ...prev,
        createMessage("assistant", "No pude registrar la transacción. Intenta nuevamente."),
      ]);
    }
  };

  const cancelTransaction = () => {
    setPendingTransaction(null);
    setMessages((prev) => [...prev, createMessage("assistant", "Operación cancelada.")]);
  };

  const onSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) return;

    const userMessage = createMessage("user", trimmed);
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const intentType = detectTransactionType(trimmed);
    const parsedAmount = parseAmount(trimmed);

    if (intentType && parsedAmount > 0) {
      if (!accounts.length) {
        setMessages((prev) => [...prev, createMessage("assistant", "Necesitas crear una cuenta antes de registrar transacciones.")]);
        return;
      }

      const category = findCategoryByIntent(trimmed, intentType, displayCategories);
      if (!category) {
        setMessages((prev) => [...prev, createMessage("assistant", "No encontré una categoría válida para esta transacción.")]);
        return;
      }

      const preview: PendingTransaction = {
        type: intentType,
        amount: parsedAmount,
        categoryId: category.id,
        categoryName: category.name,
        date: new Date().toISOString(),
      };

      setPendingTransaction(preview);

      setMessages((prev) => [
        ...prev,
        createMessage(
          "assistant",
          `Entendido, registraré este ${intentType === "Expense" ? "gasto" : "ingreso"}:\nTipo: ${intentType === "Expense" ? "Gasto" : "Ingreso"}\nMonto: ${formatCOP(parsedAmount)}\nCategoría: ${category.name}\nFecha: Hoy`,
        ),
      ]);
      return;
    }

    if (isBalanceIntent(trimmed) && dashboard) {
      const answer = `Este mes llevas ${formatCOP(dashboard.totalExpenses)} en gastos, ${formatCOP(dashboard.totalIncome)} en ingresos y un balance actual de ${formatCOP(dashboard.currentBalance)}.`;
      setMessages((prev) => [...prev, createMessage("assistant", answer)]);
      return;
    }

    try {
      const response = await chatMutation.mutateAsync({
        message: userMessage.content,
        history: messages.map(({ role, content, timestamp }) => ({ role, content, timestamp })),
      });

      setMessages((prev) => [
        ...prev,
        {
          ...createMessage("assistant", response.response),
          timestamp: response.history[response.history.length - 1]?.timestamp ?? new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        createMessage("assistant", t("ai.couldNotReach")),
      ]);
    }
  };

  const hasText = input.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}> 
        <View style={styles.headerRow}>
          <LinearGradient colors={[colors.accent, "#FF6B9D"]} style={styles.avatar}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          </LinearGradient>

          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.headerTitle}>{t("ai.title")}</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSubtitle}>{t("ai.poweredBy")} · {t("ai.updatedNow")}</Text>
            </View>
          </View>

          <Pressable>
            <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <FlatList
        style={{ flex: 1 }}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesWrap}
        renderItem={({ item }) => {
          if (item.role === "user") {
            return (
              <View style={styles.userRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.messageText}>{item.content}</Text>
                </View>
              </View>
            );
          }

          return (
            <View style={styles.aiRow}>
              <View style={styles.aiMiniAvatar}>
                <Ionicons name="sparkles" size={12} color="#FFFFFF" />
              </View>
              <View style={styles.aiBubble}>
                <Text style={styles.messageText}>
                  {parseMessageParts(item.content).map((part, index) => (
                    <Text
                      key={`${part.text}-${index}`}
                      style={
                        part.style === "moneyPositive"
                          ? styles.moneyPositive
                          : part.style === "moneyNegative"
                            ? styles.moneyNegative
                            : part.style === "percent"
                              ? styles.percent
                              : undefined
                      }
                    >
                      {part.text}
                    </Text>
                  ))}
                </Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>{t("ai.typeMessage")}</Text>
            <Text style={styles.emptySub}>{t("ai.unavailable")}</Text>
          </View>
        }
      />

      {pendingTransaction ? (
        <View style={styles.previewCard}>
          <Text style={styles.previewTitle}>Previsualización</Text>
          <Text style={styles.previewLine}>Tipo: {pendingTransaction.type === "Expense" ? "Gasto" : "Ingreso"}</Text>
          <Text style={styles.previewLine}>Monto: {formatCOP(pendingTransaction.amount)}</Text>
          <Text style={styles.previewLine}>Categoría: {pendingTransaction.categoryName}</Text>
          <Text style={styles.previewLine}>Fecha: Hoy</Text>

          <View style={styles.previewActions}>
            <Pressable style={[styles.previewBtn, styles.confirmBtn]} onPress={() => void confirmTransaction()}>
              <Text style={styles.confirmBtnText}>{"\u2713 Confirmar"}</Text>
            </Pressable>
            <Pressable style={[styles.previewBtn, styles.cancelBtn]} onPress={cancelTransaction}>
              <Text style={styles.cancelBtnText}>{"\u2717 Cancelar"}</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      <View style={{ height: 48 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          style={{ height: 48 }}
        >
          {suggestions.map((s) => (
            <TouchableChip key={s} text={s} onPress={() => setInput(s)} />
          ))}
        </ScrollView>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.inputBar}>
          <View style={styles.inputWrap}>
            <Input
              label={t("ai.typeMessage")}
              value={input}
              onChangeText={setInput}
              style={styles.input}
              placeholder=""
            />
            <Ionicons name="mic-outline" size={18} color={colors.textSecondary} />
          </View>

          <Pressable
            style={[styles.sendBtn, hasText ? styles.sendBtnActive : styles.sendBtnEmpty]}
            onPress={() => void onSend()}
            disabled={!hasText || chatMutation.isPending}
          >
            <Ionicons
              name="send"
              size={16}
              color={hasText ? colors.textInverse : colors.textSecondary}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function TouchableChip({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.chipText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: typography.fontFamily.headingBold,
  },
  onlineRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 4,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
  },
  messagesWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  userRow: {
    alignItems: "flex-end",
  },
  userBubble: {
    maxWidth: "72%",
    backgroundColor: "#0D2818",
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.2)",
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aiRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  aiMiniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  aiBubble: {
    maxWidth: "82%",
    backgroundColor: colors.bgCard,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    fontFamily: typography.fontFamily.body,
  },
  moneyPositive: {
    color: colors.income,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  moneyNegative: {
    color: colors.expense,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  percent: {
    color: colors.warning,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  emptyWrap: {
    marginTop: 36,
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  emptySub: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
  },
  previewCard: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  previewTitle: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 14,
    marginBottom: 4,
  },
  previewLine: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
  },
  previewActions: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  previewBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtn: {
    backgroundColor: "rgba(0,214,143,0.15)",
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.45)",
  },
  cancelBtn: {
    backgroundColor: "rgba(255,107,107,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.35)",
  },
  confirmBtnText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 12,
  },
  cancelBtnText: {
    color: colors.expense,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 12,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
  },
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  chipText: {
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
    color: colors.textSecondary,
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.bgCardBorder,
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    marginRight: 8,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
  },
  sendBtn: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: {
    backgroundColor: colors.primary,
  },
  sendBtnEmpty: {
    backgroundColor: colors.bgCardAlt,
  },
});

