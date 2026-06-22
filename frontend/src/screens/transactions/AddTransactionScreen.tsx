import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { z } from "zod";
import Input from "../../components/ui/Input";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { useAccounts } from "../../hooks/useAccounts";
import { useCategories } from "../../hooks/useCategories";
import { useCreateTransaction, useUpdateTransaction } from "../../hooks/useTransactions";
import { AppTabParams } from "../../navigation/types";
import { useUIStore } from "../../store/uiStore";
import { getApiErrorMessage } from "../../utils/apiError";
import { getCategoryDisplay } from "../../utils/categoryIcons";
import { CategoryDto, TransactionType } from "../../types/api";

const formSchema = z.object({
  amount: z.number().positive(),
  categoryId: z.string().min(1),
  accountId: z.string().min(1),
});

type FormValues = z.infer<typeof formSchema>;
type AddTransactionRoute = RouteProp<AppTabParams, "AddTransaction">;

function formatMoneyInput(value: number): string {
  if (!value) return "$0";
  return `$${new Intl.NumberFormat("es-CO", { maximumFractionDigits: 0 }).format(value)}`;
}

const DEFAULT_CATEGORIES: CategoryDto[] = [
  { id: "food", name: "Comida", icon: "\u{1F354}", color: "#FF6B6B", type: "Expense", isGlobal: false },
  { id: "transport", name: "Transporte", icon: "\u{1F697}", color: "#4ECDC4", type: "Expense", isGlobal: false },
  { id: "health", name: "Salud", icon: "\u{1F48A}", color: "#FF6B9D", type: "Expense", isGlobal: false },
  { id: "entertainment", name: "Ocio", icon: "\u{1F3AE}", color: "#A8E6CF", type: "Expense", isGlobal: false },
  { id: "housing", name: "Hogar", icon: "\u{1F3E0}", color: "#FFE66D", type: "Expense", isGlobal: false },
  { id: "education", name: "Educación", icon: "\u{1F4DA}", color: "#6C63FF", type: "Expense", isGlobal: false },
  { id: "salary", name: "Salario", icon: "\u{1F4BC}", color: "#00D68F", type: "Income", isGlobal: false },
  { id: "freelance", name: "Freelance", icon: "\u{1F4BB}", color: "#00B4D8", type: "Income", isGlobal: false },
  { id: "investment", name: "Inversión", icon: "\u{1F4C8}", color: "#6C63FF", type: "Income", isGlobal: false },
  { id: "other", name: "Otro", icon: "\u{1F4B3}", color: "#8080AA", type: "Expense", isGlobal: false },
];

export default function AddTransactionScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<AddTransactionRoute>();
  const existingTransaction = route.params?.existingTransaction;
  const isEditMode = Boolean(existingTransaction);
  const [type, setType] = useState<TransactionType>(
    existingTransaction?.type ?? route.params?.preSelectedType ?? "Expense",
  );
  const [amountText, setAmountText] = useState("");
  const [description, setDescription] = useState(existingTransaction?.description ?? "");
  const { data: categories, isLoading: isLoadingCategories, isError: hasCategoryError } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const createTransaction = useCreateTransaction();
  const updateTransaction = useUpdateTransaction();
  const showToast = useUIStore((state) => state.showToast);

  const toggleSlide = useSharedValue(type === "Income" ? 108 : 0);
  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: withSpring(toggleSlide.value, { damping: 18, stiffness: 240 }) }],
  }));

  const {
    setValue,
    watch,
    handleSubmit,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      categoryId: "",
      accountId: "",
    },
  });

  useEffect(() => {
    if (accounts.length && !existingTransaction) {
      setValue("accountId", accounts[0].id);
    }
  }, [accounts, existingTransaction, setValue]);

  useEffect(() => {
    if (existingTransaction) {
      setType(existingTransaction.type);
      setAmountText(String(existingTransaction.amount));
      setValue("amount", existingTransaction.amount);
      setValue("categoryId", existingTransaction.categoryId);
      setValue("accountId", existingTransaction.accountId);
      setDescription(existingTransaction.description ?? "");
      toggleSlide.value = existingTransaction.type === "Income" ? 108 : 0;
      return;
    }

    if (!route.params?.preSelectedType) return;
    setType(route.params.preSelectedType);
    toggleSlide.value = route.params.preSelectedType === "Income" ? 108 : 0;
  }, [existingTransaction, route.params?.preSelectedType, setValue, toggleSlide]);

  const selectedCategoryId = watch("categoryId");
  const amount = watch("amount");

  const displayCategories = useMemo(
    () => (categories && categories.length ? categories : DEFAULT_CATEGORIES),
    [categories],
  );

  const filteredCategories = useMemo(
    () => displayCategories.filter((item) => item.type === type),
    [displayCategories, type],
  );

  const handleToggle = (nextType: TransactionType) => {
    setType(nextType);
    toggleSlide.value = nextType === "Income" ? 108 : 0;
  };

  const parseAmount = (raw: string) => {
    const clean = raw.replace(/[^\d]/g, "");
    setAmountText(clean);
    setValue("amount", Number(clean || 0));
  };

  const onSave = handleSubmit(async (values) => {
    try {
      if (existingTransaction) {
        await updateTransaction.mutateAsync({
          id: existingTransaction.id,
          data: {
            accountId: values.accountId,
            categoryId: values.categoryId,
            amount: values.amount,
            date: existingTransaction.date,
            type,
            description: description.trim() || undefined,
          },
        });
      } else {
        await createTransaction.mutateAsync({
          accountId: values.accountId,
          categoryId: values.categoryId,
          amount: values.amount,
          date: new Date().toISOString(),
          type,
          description: description.trim() || undefined,
        });
      }

      showToast(
        existingTransaction ? t("transactions.transactionUpdated") : t("transactions.transactionSaved"),
        "success",
      );
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } catch (error) {
      showToast(getApiErrorMessage(error, t, "transactions.couldNotSave"), "error");
    }
  });

  const handleSavePress = () => {
    if (!accounts.length) {
      showToast(t("transactions.needAccount"), "warning");
      return;
    }
    void onSave();
  };

  const isSaving = createTransaction.isPending || updateTransaction.isPending;

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.title}>{isEditMode ? t("transactions.editTransaction") : t("transactions.newTransaction")}</Text>
        <View style={styles.topSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.toggleWrap}>
          <Animated.View
            style={[
              styles.toggleIndicator,
              slideStyle,
              { backgroundColor: type === "Expense" ? colors.expense : colors.income },
            ]}
          />
          <Pressable style={styles.toggleSide} onPress={() => handleToggle("Expense")}>
            <Text style={[styles.toggleText, type === "Expense" ? styles.toggleTextActive : undefined]}>{t("transactions.expense")}</Text>
          </Pressable>
          <Pressable style={styles.toggleSide} onPress={() => handleToggle("Income")}>
            <Text style={[styles.toggleText, type === "Income" ? styles.toggleTextActive : undefined]}>{t("transactions.income")}</Text>
          </Pressable>
        </View>

        <View style={styles.amountBlock}>
          <Text style={styles.amountCurrency}>COP</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="numeric"
            value={amountText ? formatMoneyInput(Number(amountText)) : "$0"}
            onChangeText={parseAmount}
            placeholder="$0"
            placeholderTextColor={colors.textMuted}
          />
          <View style={styles.amountUnderline} />
        </View>

        <Text style={styles.sectionLabel}>{t("transactions.category").toUpperCase()}</Text>
        {isLoadingCategories ? (
          <View style={styles.categoriesLoader}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryRow}
          >
            {filteredCategories.map((category) => {
              const selected = selectedCategoryId === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryChip, selected ? styles.categoryChipSelected : undefined]}
                  onPress={() => setValue("categoryId", category.id)}
                >
                  <Text style={styles.categoryEmoji}>{getCategoryDisplay(category.name, category.color).emoji}</Text>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
        {hasCategoryError ? <Text style={styles.categoryHelp}>Mostrando categorías por defecto.</Text> : null}

        <Input
          label={t("transactions.note")}
          value={description}
          onChangeText={setDescription}
          placeholder=""
        />

        <TouchableOpacity style={styles.aiBtn} onPress={() => showToast(t("ai.unavailable"), "info")}>
          <Ionicons name="sparkles-outline" size={16} color={colors.accent} />
          <Text style={styles.aiBtnText}>{t("transactions.parseWithAI")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSavePress}
          disabled={!amount || !selectedCategoryId || isSaving}
        >
          <Text style={styles.saveText}>
            {isEditMode ? t("transactions.updateTransaction") : t("transactions.saveTransaction")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  topBar: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  topSpacer: {
    width: 36,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 17,
    fontFamily: typography.fontFamily.headingSemiBold,
  },
  toggleWrap: {
    marginTop: 20,
    alignSelf: "center",
    width: 220,
    height: 44,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    padding: 4,
    flexDirection: "row",
    position: "relative",
  },
  toggleIndicator: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 104,
    height: 34,
    borderRadius: 99,
  },
  toggleSide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  toggleText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontFamily: typography.fontFamily.headingSemiBold,
  },
  toggleTextActive: {
    color: colors.textPrimary,
  },
  amountBlock: {
    marginTop: 28,
    alignItems: "center",
  },
  amountCurrency: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
  },
  amountInput: {
    marginTop: 4,
    color: colors.textPrimary,
    fontSize: 52,
    textAlign: "center",
    fontFamily: typography.fontFamily.monoExtraBold,
    minWidth: 220,
  },
  amountUnderline: {
    marginTop: -2,
    width: 60,
    height: 2,
    borderRadius: 99,
    backgroundColor: colors.primary,
  },
  sectionLabel: {
    marginTop: 24,
    color: colors.textSecondary,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  categoryScroll: {
    height: 90,
  },
  categoryRow: {
    marginTop: 10,
    paddingRight: 8,
    gap: 10,
    alignItems: "center",
  },
  categoriesLoader: {
    marginTop: 10,
    height: 90,
    justifyContent: "center",
  },
  categoryHelp: {
    marginTop: 6,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 11,
  },
  categoryChip: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },
  categoryChipSelected: {
    borderColor: colors.primary,
    backgroundColor: "rgba(0,214,143,0.1)",
  },
  categoryEmoji: {
    fontSize: 22,
  },
  categoryName: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily.body,
  },
  aiBtn: {
    marginTop: 16,
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.25)",
    backgroundColor: "rgba(108,99,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  aiBtnText: {
    marginLeft: 6,
    color: colors.accent,
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  saveBtn: {
    marginTop: 12,
    marginBottom: 32,
    height: 54,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: colors.textInverse,
    fontSize: 16,
    fontFamily: typography.fontFamily.headingSemiBold,
  },
});

