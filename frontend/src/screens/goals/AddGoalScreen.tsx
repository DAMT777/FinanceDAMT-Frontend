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
import { useCreateGoal } from "../../hooks/useGoals";
import { useUIStore } from "../../store/uiStore";
import { getApiErrorMessage } from "../../utils/apiError";
import DatePickerField from "../../components/ui/DatePickerField";

const GOAL_EMOJIS = [
  "🏠", "🚗", "✈️", "📱", "💻", "🎓", "💍",
  "🏖️", "🎮", "👶", "🐕", "🏋️", "💊", "🛒",
  "🎵", "📚", "🌍", "🍕", "👗", "💰",
];

export default function AddGoalScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const createGoal = useCreateGoal();
  const showToast = useUIStore((state) => state.showToast);

  const [name, setName] = useState("");
  const [icon, setIcon] = useState("💰");
  const [targetAmount, setTargetAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const isValid = name.trim().length > 0 && parseFloat(targetAmount) > 0 && deadline.trim().length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    try {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        showToast(t("goals.invalidDate"), "warning");
        return;
      }
      await createGoal.mutateAsync({
        name: name.trim(),
        icon,
        targetAmount: parseFloat(targetAmount.replace(/\./g, "")) || 0,
        deadline: deadlineDate.toISOString(),
      });
      showToast(t("goals.goalCreated"), "success");
      navigation.goBack();
    } catch (error) {
      showToast(getApiErrorMessage(error, t, "goals.couldNotCreateGoal"), "error");
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
          <Text style={styles.title}>{t("goals.newGoal")}</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("goals.selectEmoji")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
            {GOAL_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                style={[
                  styles.emojiCell,
                  icon === emoji && styles.emojiCellActive,
                ]}
                onPress={() => setIcon(emoji)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("goals.goalName")}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Ej. Viaje, moto, fondo…"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoFocus
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("goals.targetAmount")}</Text>
          <TextInput
            style={[styles.input, styles.amountInput]}
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("goals.deadlineFormat")}</Text>
          <DatePickerField
            value={deadline}
            onChange={setDeadline}
            minimumDate={new Date()}
          />
        </View>

        <Pressable
          onPress={() => void handleSave()}
          disabled={!isValid || createGoal.isPending}
          style={styles.savePressable}
        >
          <LinearGradient
            colors={isValid ? ["#00D68F", "#00B87A"] : [colors.bgCard, colors.bgCard]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
          >
            <Text style={[styles.saveBtnText, !isValid && styles.saveBtnTextDisabled]}>
              {createGoal.isPending ? t("goals.creating") : t("goals.createGoal")}
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
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
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
