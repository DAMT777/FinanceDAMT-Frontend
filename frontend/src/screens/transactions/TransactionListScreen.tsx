import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Swipeable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import TransactionItem from "../../components/TransactionItem";
import EmptyState from "../../components/ui/EmptyState";
import Input from "../../components/ui/Input";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useDeleteTransaction, useTransactions } from "../../hooks/useTransactions";
import { TransactionDto } from "../../types/api";
import { AppStackParams } from "../../navigation/types";

type SectionData = {
  title: string;
  data: TransactionDto[];
};

type FilterType = "All" | "Income" | "Expense";

function groupTransactions(items: TransactionDto[]): SectionData[] {
  const grouped = new Map<string, TransactionDto[]>();
  items.forEach((item) => {
    const key = new Date(item.date).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const current = grouped.get(key) ?? [];
    current.push(item);
    grouped.set(key, current);
  });
  return Array.from(grouped.entries()).map(([title, data]) => ({ title, data }));
}

const FILTER_CHIPS: { labelKey: string; value: FilterType }[] = [
  { labelKey: "transactions.all", value: "All" },
  { labelKey: "transactions.income", value: "Income" },
  { labelKey: "transactions.expense", value: "Expense" },
];

function getChipStyle(value: FilterType, active: boolean) {
  if (!active) return {};
  if (value === "Income") return { bg: "rgba(0,214,143,0.15)", border: colors.primary, text: colors.primary };
  if (value === "Expense") return { bg: "rgba(255,71,87,0.15)", border: colors.expense, text: colors.expense };
  return { bg: "rgba(0,214,143,0.12)", border: colors.primary, text: colors.primary };
}

export default function TransactionListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FilterType>("All");

  const { data, isLoading, refetch, isRefetching } = useTransactions({
    page: 1,
    pageSize: 60,
    searchText: search,
  });
  const removeMutation = useDeleteTransaction();
  const transactions = data?.items ?? [];

  const filtered = useMemo(() => {
    if (typeFilter === "All") return transactions;
    return transactions.filter((item) => item.type === typeFilter);
  }, [transactions, typeFilter]);

  const sections = useMemo(() => groupTransactions(filtered), [filtered]);

  // FAB entrance animation
  const fabScale = useSharedValue(0);
  useEffect(() => {
    fabScale.value = withSpring(1, { damping: 8, stiffness: 180 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  // Screen entrance
  const screenOpacity = useSharedValue(0);
  const screenY = useSharedValue(16);
  useEffect(() => {
    screenOpacity.value = withTiming(1, { duration: 280 });
    screenY.value = withSpring(0, { damping: 20 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const screenStyle = useAnimatedStyle(() => ({
    opacity: screenOpacity.value,
    transform: [{ translateY: screenY.value }],
  }));

  return (
    <Animated.View style={[styles.container, screenStyle]}>
      {/* Header */}
      <View style={styles.headerWrap}>
        <Text style={styles.title}>{t("transactions.title")}</Text>
        <Text style={styles.subtitle}>
          {t("transactions.totalMovements", { count: filtered.length })}
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <Input
          label={t("transactions.search")}
          value={search}
          onChangeText={setSearch}
          placeholder=""
          style={styles.searchInput}
        />
        {search ? (
          <Pressable onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </Pressable>
        ) : null}
        <Pressable style={styles.filterIconWrap}>
          <Ionicons name="options-outline" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Filter chips */}
      <View style={styles.filtersRow}>
        {FILTER_CHIPS.map(({ labelKey, value }) => {
          const active = typeFilter === value;
          const chipStyle = getChipStyle(value, active);
          return (
            <Pressable
              key={value}
              style={[
                styles.filterChip,
                active && {
                  backgroundColor: chipStyle.bg,
                  borderColor: chipStyle.border,
                },
              ]}
              onPress={() => setTypeFilter(value)}
            >
              <Text
                style={[
                  styles.filterText,
                  active && { color: chipStyle.text },
                ]}
              >
                {t(labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.loadingText}>{t("transactions.loading")}</Text>
        </View>
      ) : sections.length ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled={true}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={() => void refetch()}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.stickyHeader}>
              <Text style={styles.sectionHeader}>{section.title}</Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={() => (
                <Pressable
                  style={styles.deleteAction}
                  onPress={() => void removeMutation.mutateAsync(item.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.deleteText}>{t("transactions.delete")}</Text>
                </Pressable>
              )}
            >
              <TransactionItem
                transaction={item}
                onPress={() => navigation.navigate("TransactionDetail", { transaction: item })}
              />
            </Swipeable>
          )}
        />
      ) : (
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="Mov"
            title={t("transactions.noTransactions")}
            subtitle={t("transactions.addFirst")}
            actionLabel={t("transactions.addTransaction")}
            onAction={() => navigation.navigate("Tabs", { screen: "AddTransaction" })}
          />
        </View>
      )}

      {/* Floating Action Button */}
      <Animated.View style={[styles.fabWrap, fabStyle]}>
        <Pressable
          style={styles.fabPressable}
          onPressIn={() => { fabScale.value = withSpring(0.88, { damping: 12 }); }}
          onPressOut={() => { fabScale.value = withSpring(1, { damping: 12 }); }}
          onPress={() => navigation.navigate("Tabs", { screen: "AddTransaction" })}
        >
          <LinearGradient
            colors={["#00D68F", "#00B87A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fab}
          >
            <Ionicons name="add" size={30} color="#fff" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingTop: spacing.xl,
  },
  headerWrap: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontFamily: typography.fontFamily.heading,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
    marginTop: 4,
  },
  searchBar: {
    marginHorizontal: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
    minHeight: 48,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
  },
  filterIconWrap: {
    padding: 2,
  },
  filtersRow: {
    marginTop: spacing.sm,
    marginHorizontal: spacing.md,
    flexDirection: "row",
    gap: spacing.xs,
  },
  filterChip: {
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  filterText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 130,
    gap: 2,
  },
  stickyHeader: {
    backgroundColor: colors.bg,
    paddingHorizontal: spacing.xs,
    paddingVertical: 10,
  },
  sectionHeader: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.xs,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  deleteAction: {
    width: 72,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.expense,
    marginVertical: 2,
    gap: 4,
  },
  deleteText: {
    color: "#fff",
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
    textAlign: "center",
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
  },
  fabWrap: {
    position: "absolute",
    right: spacing.lg,
    bottom: 96,
  },
  fabPressable: {
    borderRadius: 28,
    overflow: "hidden",
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
});
