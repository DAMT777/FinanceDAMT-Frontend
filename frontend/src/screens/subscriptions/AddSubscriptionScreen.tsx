import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
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
import { useCreateSubscription } from "../../hooks/useSubscriptions";
import { useUIStore } from "../../store/uiStore";
import { getApiErrorMessage } from "../../utils/apiError";
import DatePickerField from "../../components/ui/DatePickerField";
import { BillingCycle } from "../../types/api";

const SUB_EMOJIS = [
  "💳", "📺", "🎵", "🎮", "☁️", "📱", "🎬",
  "📰", "🏋️", "🍿", "🚗", "🌐", "📦", "🔒",
  "✏️", "🎨", "📚", "🧠", "💡", "⚡",
];

const CYCLES: BillingCycle[] = ["Weekly", "Monthly", "Quarterly", "Yearly"];

export default function AddSubscriptionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const createSubscription = useCreateSubscription();
  const showToast = useUIStore((state) => state.showToast);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💳");
  const [amount, setAmount] = useState("");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("Monthly");
  const [nextBillingDate, setNextBillingDate] = useState("");

  const isValid =
    name.trim().length > 0 &&
    parseFloat(amount.replace(/\./g, "")) > 0 &&
    nextBillingDate.trim().length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    const billingDate = new Date(nextBillingDate);
    if (isNaN(billingDate.getTime())) {
      showToast(t("subscriptions.invalidDate"), "warning");
      return;
    }
    try {
      await createSubscription.mutateAsync({
        name: name.trim(),
        icon,
        amount: parseFloat(amount.replace(/\./g, "")) || 0,
        billingCycle,
        nextBillingDate: billingDate.toISOString(),
      });
      showToast(t("subscriptions.created"), "success");
      navigation.goBack();
    } catch (error) {
      showToast(getApiErrorMessage(error, t, "subscriptions.couldNotCreate"), "error");
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
          <Text style={styles.title}>{t("subscriptions.newSubscription")}</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Emoji picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("subscriptions.selectIcon")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
            {SUB_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                style={[styles.emojiCell, icon === emoji && styles.emojiCellActive]}
                onPress={() => setIcon(emoji)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("subscriptions.name")}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Netflix, Spotify…"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoFocus
          />
        </View>

        {/* Amount */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("subscriptions.amount")}</Text>
          <TextInput
            style={[styles.input, styles.amountInput]}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {/* Billing cycle */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("subscriptions.billingCycle")}</Text>
          <View style={styles.cycleRow}>
            {CYCLES.map((cycle) => {
              const active = billingCycle === cycle;
              return (
                <Pressable
                  key={cycle}
                  style={[styles.cycleChip, active && styles.cycleChipActive]}
                  onPress={() => setBillingCycle(cycle)}
                >
                  <Text style={[styles.cycleLabel, active && styles.cycleLabelActive]}>
                    {t(`subscriptions.cycle.${cycle.toLowerCase()}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Next billing date */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("subscriptions.nextBillingDate")}</Text>
          <DatePickerField
            value={nextBillingDate}
            onChange={setNextBillingDate}
            minimumDate={new Date()}
          />
        </View>

        {/* Save button */}
        <Pressable
          onPress={() => void handleSave()}
          disabled={!isValid || createSubscription.isPending}
          style={styles.savePressable}
        >
          <LinearGradient
            colors={isValid ? ["#6C63FF", "#8A7CFF"] : [colors.bgCard, colors.bgCard]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
          >
            <Text style={[styles.saveBtnText, !isValid && styles.saveBtnTextDisabled]}>
              {createSubscription.isPending ? t("subscriptions.creating") : t("subscriptions.create")}
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
  emojiRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  emojiCell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiCellActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow,
  },
  emoji: {
    fontSize: 20,
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
  amountInput: {
    fontFamily: typography.fontFamily.mono,
  },
  cycleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  cycleChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
  },
  cycleChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow,
  },
  cycleLabel: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
  },
  cycleLabelActive: {
    color: colors.accent,
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
