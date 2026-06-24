import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { makeStyles } from "../theme/styles";

interface CategoryBadgeProps {
  name: string;
  icon: string;
  color: string;
  selected?: boolean;
  onPress?: () => void;
}

function withOpacity(hexColor: string, alphaHex: string): string {
  return `${hexColor}${alphaHex}`;
}

export default function CategoryBadge({ name, icon, color, selected = false, onPress }: CategoryBadgeProps) {
  return (
    <Pressable
      style={[
        styles.badge,
        selected ? styles.selected : styles.unselected,
        selected ? { borderColor: colors.primary, backgroundColor: colors.primaryGlow } : null,
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconWrap, { backgroundColor: withOpacity(color, "26") }]}>
        <Text style={[styles.icon, { color }]}>{icon}</Text>
      </View>
      <Text style={styles.name}>{name}</Text>
    </Pressable>
  );
}

const styles = makeStyles((colors) => ({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
  },
  selected: {
    borderColor: colors.primary,
  },
  unselected: {
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    fontSize: 14,
  },
  name: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.xs,
  },
}));
