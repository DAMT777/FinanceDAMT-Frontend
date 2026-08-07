import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";
import { colors } from "../constants/colors";
import { typography } from "../constants/typography";
import { makeStyles } from "../theme/styles";

export type DeltaTone = "good" | "bad" | "neutral";

interface StatCardProps {
  /** Short uppercase caption, e.g. "GASTOS DEL MES". */
  label: string;
  /** Primary figure, already formatted (e.g. "$1.2M"). */
  value: string;
  /** Optional signed change to render as a chip, e.g. "+18%". */
  delta?: string;
  /** Semantic direction of the delta — drives the chip color, not the sign. */
  deltaTone?: DeltaTone;
  /** One-line reference frame that turns the number into an insight. */
  context?: string;
  /** When true, the value is tinted with the accent to draw the eye here. */
  emphasize?: boolean;
}

// A single KPI tile. The delta chip and context line are the whole point:
// a figure on its own ("two glasses of water") is not actionable until it
// carries a reference frame ("+50% vs your average"). Color is reserved for
// meaning — green = favorable, red = unfavorable — never decoration.
export default function StatCard({
  label,
  value,
  delta,
  deltaTone = "neutral",
  context,
  emphasize = false,
}: StatCardProps) {
  const toneColor =
    deltaTone === "good" ? colors.income : deltaTone === "bad" ? colors.expense : colors.textSecondary;
  const arrow = deltaTone === "good" ? "trending-up" : deltaTone === "bad" ? "trending-down" : "remove";

  return (
    <View style={styles.card}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>

      <View style={styles.valueRow}>
        <Text style={[styles.value, emphasize && { color: colors.accent }]} numberOfLines={1}>
          {value}
        </Text>
      </View>

      {delta ? (
        <View style={[styles.deltaChip, { backgroundColor: `${toneColor}1F`, borderColor: `${toneColor}40` }]}>
          <Ionicons name={arrow} size={11} color={toneColor} />
          <Text style={[styles.deltaText, { color: toneColor }]}>{delta}</Text>
        </View>
      ) : null}

      {context ? (
        <Text style={styles.context} numberOfLines={2}>
          {context}
        </Text>
      ) : null}
    </View>
  );
}

const styles = makeStyles((colors) => ({
  card: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 16,
    padding: 14,
    minHeight: 118,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    fontFamily: typography.fontFamily.bodyMedium,
  },
  valueRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "baseline",
  },
  value: {
    color: colors.textPrimary,
    fontSize: 20,
    fontFamily: typography.fontFamily.monoExtraBold,
  },
  deltaChip: {
    marginTop: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderWidth: 1,
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  deltaText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  context: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 10.5,
    lineHeight: 14,
    fontFamily: typography.fontFamily.body,
  },
}));
