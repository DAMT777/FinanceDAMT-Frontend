import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import EmptyState from "../../components/ui/EmptyState";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useFinancialScore, useRecommendations } from "../../hooks/useAI";
import { makeStyles } from "../../theme/styles";

function getScoreColor(score: number): string {
  if (score < 40) return colors.expense;
  if (score < 70) return colors.warning;
  return colors.income;
}

export default function RecommendationsScreen() {
  const { t } = useTranslation();
  const scoreQuery = useFinancialScore();
  const recommendationsQuery = useRecommendations();

  const score = scoreQuery.data?.score ?? 0;
  const recommendations = recommendationsQuery.data ?? [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("ai.recommendations")}</Text>

      <View style={[styles.scoreRing, { borderColor: getScoreColor(score) }]}>
        <Text style={styles.scoreValue}>{score}</Text>
        <Text style={styles.scoreLabel}>{t("ai.financialHealth")}</Text>
      </View>

      {recommendations.length ? (
        <View style={styles.list}>
          {recommendations.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.type}</Text>
              <Text style={styles.cardText}>{item.content}</Text>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState icon="IA" title={t("ai.noRecommendations")} subtitle={t("ai.generateFirst")} />
      )}
    </View>
  );
}

const styles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.heading,
    fontSize: 24,
  },
  scoreRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 10,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgCard,
  },
  scoreValue: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.mono,
    fontSize: 36,
  },
  scoreLabel: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
  },
  list: {
    gap: spacing.sm,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    padding: spacing.md,
    gap: spacing.xs,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: typography.fontSize.md,
  },
  cardText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
  },
}));
