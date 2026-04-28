import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";

interface Notification {
  id: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: "warning-outline",
    iconColor: colors.warning,
    iconBg: "rgba(255,184,48,0.15)",
    title: "Budget alert — Food & Drink",
    body: "You've reached 80% of your monthly food budget.",
    time: "2h ago",
    read: false,
  },
  {
    id: "2",
    icon: "checkmark-circle-outline",
    iconColor: colors.primary,
    iconBg: "rgba(0,214,143,0.15)",
    title: "Goal milestone reached!",
    body: "You've hit 50% progress on your Emergency Fund goal.",
    time: "Yesterday",
    read: false,
  },
  {
    id: "3",
    icon: "sparkles-outline",
    iconColor: colors.accent,
    iconBg: "rgba(108,99,255,0.15)",
    title: "New AI insight available",
    body: "Your spending pattern this month looks healthier than last month.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "4",
    icon: "trending-up-outline",
    iconColor: colors.info,
    iconBg: "rgba(62,207,248,0.15)",
    title: "Monthly summary ready",
    body: "Your financial summary for March 2025 is available.",
    time: "1 week ago",
    read: true,
  },
  {
    id: "5",
    icon: "card-outline",
    iconColor: colors.expense,
    iconBg: "rgba(255,71,87,0.15)",
    title: "Large expense detected",
    body: "A transaction of $450,000 COP was recorded in Electronics.",
    time: "1 week ago",
    read: true,
  },
];

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 ? (
            <Text style={styles.headerSubtitle}>{unreadCount} unread</Text>
          ) : null}
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {MOCK_NOTIFICATIONS.map((item) => (
          <Pressable key={item.id} style={[styles.notifCard, !item.read && styles.notifCardUnread]}>
            {!item.read ? <View style={styles.unreadDot} /> : null}
            <View style={[styles.notifIconWrap, { backgroundColor: item.iconBg }]}>
              <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color={item.iconColor} />
            </View>
            <View style={styles.notifBody}>
              <View style={styles.notifTopRow}>
                <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>
                  {item.title}
                </Text>
                <Text style={styles.notifTime}>{item.time}</Text>
              </View>
              <Text style={styles.notifText} numberOfLines={2}>
                {item.body}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.heading,
    fontSize: 20,
  },
  headerSubtitle: {
    color: colors.primary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  headerRight: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.sm,
  },
  notifCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 18,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    position: "relative",
  },
  notifCardUnread: {
    borderColor: "rgba(0,214,143,0.2)",
    backgroundColor: "rgba(0,214,143,0.04)",
  },
  unreadDot: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  notifIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  notifBody: {
    flex: 1,
    gap: 4,
  },
  notifTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  notifTitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    flex: 1,
  },
  notifTitleUnread: {
    color: colors.textPrimary,
  },
  notifTime: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 11,
    flexShrink: 0,
  },
  notifText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
  },
});
