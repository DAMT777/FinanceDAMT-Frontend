import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";

interface AIInsightCardProps {
  insight: string;
  onAskAI?: () => void;
}

export default function AIInsightCard({ insight, onAskAI }: AIInsightCardProps) {
  const { t } = useTranslation();
  return (
    <LinearGradient colors={["#130D2B", "#0D0820"]} style={styles.card}>
      {/* Decorative glow top-right */}
      <View style={styles.glow} />

      <View style={styles.labelRow}>
        <Ionicons name="sparkles-outline" size={14} color={colors.accent} />
        <Text style={styles.label}>{t("dashboard.aiInsight")}</Text>
      </View>

      <Text style={styles.text}>{insight}</Text>

      <View style={styles.footer}>
        <Text style={styles.updatedText}>{t("ai.updatedNow")}</Text>
        {onAskAI ? (
          <Pressable onPress={onAskAI}>
            <Text style={styles.askLink}>{t("dashboard.askAI")}</Text>
          </Pressable>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(108,99,255,0.3)",
    padding: spacing.lg,
    overflow: "hidden",
  },
  glow: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(108,99,255,0.1)",
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    color: colors.accent,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: typography.fontSize.xs,
    letterSpacing: 1.2,
  },
  text: {
    marginTop: spacing.sm,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    lineHeight: 22,
  },
  footer: {
    marginTop: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  updatedText: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 11,
  },
  askLink: {
    color: colors.accent,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 12,
  },
});
