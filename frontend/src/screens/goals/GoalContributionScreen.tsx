import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import ProgressRing from "../../components/ProgressRing";
import Input from "../../components/ui/Input";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useGoals, useAddContribution } from "../../hooks/useGoals";
import { AppStackParams } from "../../navigation/types";
import { useUIStore } from "../../store/uiStore";

type ContributionRoute = RouteProp<AppStackParams, "GoalContribution">;

function formatInputAmount(text: string): string {
  const numbers = text.replace(/\D/g, "");
  return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseCOPToNumber(text: string): number {
  const normalized = text.replace(/\./g, "").replace(",", ".");
  return Number.parseFloat(normalized) || 0;
}

export default function GoalContributionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<ContributionRoute>();
  const { goalId, goalName } = route.params;

  const { data: goals = [] } = useGoals();
  const addContribution = useAddContribution();
  const showToast = useUIStore((state) => state.showToast);

  const goal = goals.find((g) => g.id === goalId);

  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const amountValue = parseCOPToNumber(amount);
  const isValid = amountValue > 0;

  const currentAmount = goal?.currentAmount ?? 0;
  const targetAmount = goal?.targetAmount && goal.targetAmount > 0 ? goal.targetAmount : 1;
  const progress = Math.min(100, Math.max(0, Math.round((currentAmount / targetAmount) * 100)));

  const handleSave = async () => {
    if (!isValid) return;
    try {
      await addContribution.mutateAsync({
        goalId,
        data: {
          amount: amountValue,
          date: new Date().toISOString(),
          note: note.trim() || undefined,
        },
      });
      showToast(t("goals.contributionAdded"), "success");
      navigation.goBack();
    } catch {
      showToast(t("goals.couldNotAddContribution"), "error");
    }
  };

  const formatCOP = (n: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);

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
          <View style={styles.headerLeft}>
            <View style={styles.goalEmojiWrap}>
              <Ionicons name="trophy-outline" size={16} color={colors.warning} />
            </View>
            <View>
              <Text style={styles.goalName}>{goalName}</Text>
              <Text style={styles.goalSubtitle}>{t("goals.addContributionTitle")}</Text>
            </View>
          </View>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {goal ? (
          <View style={styles.progressSection}>
            <ProgressRing
              size={80}
              strokeWidth={8}
              progress={progress}
              color={colors.primary}
              label={`${progress}%`}
            />
            <View style={styles.progressDetails}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>{t("goals.saved")}</Text>
                <Text style={styles.progressValue}>{formatCOP(goal.currentAmount)}</Text>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>{t("goals.target")}</Text>
                <Text style={styles.progressValue}>{formatCOP(goal.targetAmount)}</Text>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>{t("goals.remaining")}</Text>
                <Text style={[styles.progressValue, { color: colors.warning }]}>
                  {formatCOP(Math.max(0, goal.targetAmount - goal.currentAmount))}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("goals.contributionAmount")}</Text>
          <Input
            label={t("goals.contributionAmount")}
            style={styles.amountInput}
            value={amount}
            onChangeText={(text) => setAmount(formatInputAmount(text))}
            keyboardType="numeric"
            placeholder="0"
            autoFocus
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("goals.noteOptional")}</Text>
          <Input
            label={t("goals.noteOptional")}
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder=""
          />
        </View>

        <Pressable
          onPress={() => void handleSave()}
          disabled={!isValid || addContribution.isPending}
          style={styles.savePressable}
        >
          <LinearGradient
            colors={isValid ? ["#00D68F", "#00B87A"] : [colors.bgCard, colors.bgCard]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
          >
            <Text style={[styles.saveBtnText, !isValid && styles.saveBtnTextDisabled]}>
              {addContribution.isPending ? t("transactions.saving") : t("goals.addContributionCta")}
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
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  goalEmojiWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,184,48,0.14)",
  },
  goalName: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 18,
  },
  goalSubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
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
  progressSection: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 20,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  progressDetails: {
    flex: 1,
    gap: spacing.xs,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressLabel: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
  },
  progressValue: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.xs,
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
  amountInput: {
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.md,
  },
  input: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.md,
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

