import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useCategories } from "../../hooks/useCategories";
import { useSetBudget } from "../../hooks/useBudgets";
import { useUIStore } from "../../store/uiStore";
import { getApiErrorMessage } from "../../utils/apiError";
import { CategoryDto } from "../../types/api";

const DEFAULT_EXPENSE_CATEGORIES: CategoryDto[] = [
  { id: "food", name: "Comida", icon: "\u{1F354}", color: "#FF6B6B", type: "Expense", isGlobal: false },
  { id: "transport", name: "Transporte", icon: "\u{1F697}", color: "#4ECDC4", type: "Expense", isGlobal: false },
  { id: "health", name: "Salud", icon: "\u{1F48A}", color: "#FF6B9D", type: "Expense", isGlobal: false },
  { id: "entertainment", name: "Ocio", icon: "\u{1F3AE}", color: "#A8E6CF", type: "Expense", isGlobal: false },
  { id: "housing", name: "Hogar", icon: "\u{1F3E0}", color: "#FFE66D", type: "Expense", isGlobal: false },
  { id: "education", name: "Educación", icon: "\u{1F4DA}", color: "#6C63FF", type: "Expense", isGlobal: false },
  { id: "other", name: "Otro", icon: "\u{1F4B3}", color: "#8080AA", type: "Expense", isGlobal: false },
];

function formatInputAmount(text: string): string {
  const numbers = text.replace(/\D/g, "");
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export default function AddBudgetScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { data: categories, isLoading: isLoadingCategories, isError: hasCategoryError } = useCategories();
  const setBudget = useSetBudget();
  const showToast = useUIStore((state) => state.showToast);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [limit, setLimit] = useState("");

  const expenseCategories = useMemo(() => {
    const list = categories?.length ? categories : DEFAULT_EXPENSE_CATEGORIES;
    return list.filter((c) => c.type === "Expense");
  }, [categories]);

  const selectedCategory = expenseCategories.find((cat) => cat.id === selectedCategoryId) ?? null;
  const limitValue = Number.parseFloat(limit.replace(/\./g, "")) || 0;
  const isValid = selectedCategory !== null && limitValue > 0;

  const handleSave = async () => {
    if (!isValid || !selectedCategory) return;
    try {
      await setBudget.mutateAsync({
        categoryId: selectedCategory.id,
        monthlyLimit: limitValue,
      });
      showToast(t("budgets.budgetSet"), "success");
      navigation.goBack();
    } catch (error) {
      showToast(getApiErrorMessage(error, t, "budgets.couldNotSet"), "error");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dragHandle} />

        <View style={styles.headerRow}>
          <Text style={styles.title}>{t("budgets.setBudget")}</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("transactions.category")}</Text>
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
              {expenseCategories.map((cat) => {
                const active = selectedCategory?.id === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      active && { borderColor: cat.color, backgroundColor: `${cat.color}18` },
                    ]}
                    onPress={() => setSelectedCategoryId(cat.id)}
                  >
                    <Text style={styles.catIcon}>{cat.icon || "•"}</Text>
                    <Text style={[styles.catName, active && { color: cat.color }]} numberOfLines={1}>
                      {cat.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
          {hasCategoryError ? <Text style={styles.categoryHelp}>Mostrando categorías por defecto.</Text> : null}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("budgets.monthlyLimit")}</Text>
          <TextInput
            style={styles.amountInput}
            value={limit}
            onChangeText={(text) => setLimit(formatInputAmount(text))}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />
          {selectedCategory ? (
            <Text style={styles.categoryHint}>
              {t("budgets.budgetForMonth", { name: `${selectedCategory.icon} ${selectedCategory.name}` })}
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={() => void handleSave()}
          disabled={!isValid || setBudget.isPending}
          style={styles.savePressable}
        >
          <LinearGradient
            colors={isValid ? ["#00D68F", "#00B87A"] : [colors.bgCard, colors.bgCard]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
          >
            <Text style={[styles.saveBtnText, !isValid && styles.saveBtnTextDisabled]}>
              {setBudget.isPending ? t("budgets.saving") : t("budgets.setBudgetCta")}
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.lg,
  },
  dragHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.bgCardBorder,
    marginTop: spacing.xs,
    marginBottom: -spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.heading,
    fontSize: 22,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldGroup: {
    gap: spacing.xs,
  },
  label: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    letterSpacing: 0.5,
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
    minWidth: 90,
    alignItems: "center",
  },
  catIcon: {
    fontSize: 22,
  },
  catName: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  amountInput: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.md,
  },
  categoryHint: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
  },
  savePressable: {
    borderRadius: 16,
    overflow: "hidden",
    marginTop: spacing.sm,
  },
  saveBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: {
    opacity: 0.45,
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 16,
  },
  saveBtnTextDisabled: {
    color: colors.textMuted,
  },
});

