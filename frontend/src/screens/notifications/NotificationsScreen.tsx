import { Ionicons } from "@expo/vector-icons";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from "../../hooks/useNotifications";
import { NotificationType } from "../../types/api";

const TYPE_STYLE: Record<NotificationType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
  BudgetAlert: { icon: "warning-outline", color: colors.warning, bg: "rgba(255,184,48,0.15)" },
  GoalMilestone: { icon: "trophy-outline", color: colors.primary, bg: "rgba(0,214,143,0.15)" },
  LargeExpense: { icon: "card-outline", color: colors.expense, bg: "rgba(255,71,87,0.15)" },
  MonthlySummary: { icon: "trending-up-outline", color: colors.info, bg: "rgba(62,207,248,0.15)" },
  AIInsight: { icon: "sparkles-outline", color: colors.accent, bg: "rgba(108,99,255,0.15)" },
  General: { icon: "notifications-outline", color: colors.textSecondary, bg: "rgba(255,255,255,0.06)" },
};

function useRelativeTime() {
  const { t } = useTranslation();
  return (iso: string): string => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return t("notifications.justNow");
    if (minutes < 60) return t("notifications.minutesAgo", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("notifications.hoursAgo", { count: hours });
    const days = Math.floor(hours / 24);
    return t("notifications.daysAgo", { count: days });
  };
}

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const relativeTime = useRelativeTime();
  const { data: notifications = [], refetch, isRefetching } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityRole="button">
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t("notifications.title")}</Text>
          {unreadCount > 0 ? (
            <Text style={styles.headerSubtitle}>{t("notifications.unread", { count: unreadCount })}</Text>
          ) : null}
        </View>
        {unreadCount > 0 ? (
          <Pressable
            onPress={() => markAllAsRead.mutate()}
            style={styles.markAllBtn}
            accessibilityRole="button"
          >
            <Text style={styles.markAllText}>{t("notifications.markAllRead")}</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {notifications.length ? (
          notifications.map((item) => {
            const style = TYPE_STYLE[item.type] ?? TYPE_STYLE.General;
            return (
              <Pressable
                key={item.id}
                style={[styles.notifCard, !item.isRead && styles.notifCardUnread]}
                onPress={() => {
                  if (!item.isRead) markAsRead.mutate(item.id);
                }}
              >
                {!item.isRead ? <View style={styles.unreadDot} /> : null}
                <View style={[styles.notifIconWrap, { backgroundColor: style.bg }]}>
                  <Ionicons name={style.icon} size={20} color={style.color} />
                </View>
                <View style={styles.notifBody}>
                  <View style={styles.notifTopRow}>
                    <Text style={[styles.notifTitle, !item.isRead && styles.notifTitleUnread]}>
                      {item.title}
                    </Text>
                    <Text style={styles.notifTime}>{relativeTime(item.createdAt)}</Text>
                  </View>
                  <Text style={styles.notifText}>{item.message}</Text>
                </View>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={styles.emptyTitle}>{t("notifications.empty")}</Text>
            <Text style={styles.emptySubtitle}>{t("notifications.emptySubtitle")}</Text>
          </View>
        )}
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
  headerCenter: {
    flex: 1,
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
  markAllBtn: {
    height: 36,
    paddingHorizontal: spacing.md,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.3)",
    backgroundColor: "rgba(0,214,143,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  markAllText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.xs,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 40,
    gap: spacing.sm,
    flexGrow: 1,
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
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 18,
    textAlign: "center",
  },
  emptySubtitle: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    textAlign: "center",
  },
});
