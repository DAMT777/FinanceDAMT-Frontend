import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useDeleteTransaction } from "../../hooks/useTransactions";
import { useUIStore } from "../../store/uiStore";
import { getApiErrorMessage } from "../../utils/apiError";
import { AppStackParams } from "../../navigation/types";
import { makeStyles } from "../../theme/styles";

type DetailRoute = RouteProp<AppStackParams, "TransactionDetail">;

const TYPE_CONFIG = {
  Income: { color: colors.income, icon: "arrow-down-circle-outline", label: "Income", prefix: "+" },
  Expense: { color: colors.expense, icon: "arrow-up-circle-outline", label: "Expense", prefix: "-" },
  Transfer: { color: colors.info, icon: "swap-horizontal-outline", label: "Transfer", prefix: "" },
} as const;

function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) +
    "  ·  " + d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
}

export default function TransactionDetailScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const route = useRoute<DetailRoute>();
  const { transaction } = route.params;

  const deleteTransaction = useDeleteTransaction();
  const showToast = useUIStore((state) => state.showToast);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const config = TYPE_CONFIG[transaction.type];
  const typeLabelMap: Record<keyof typeof TYPE_CONFIG, string> = {
    Income: t("transactions.income"),
    Expense: t("transactions.expense"),
    Transfer: t("dashboard.transfer"),
  };

  const handleDelete = async () => {
    try {
      await deleteTransaction.mutateAsync(transaction.id);
      showToast(t("transactions.deleted"), "success");
      navigation.goBack();
    } catch (error) {
      showToast(getApiErrorMessage(error, t, "transactions.couldNotDelete"), "error");
    }
  };

  return (
    <>
      <ScrollView style={styles.root} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.dragHandle} />

        <View style={styles.headerRow}>
          <Text style={styles.title}>{t("transactions.title")}</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <LinearGradient
          colors={transaction.type === "Income" ? ["#0D2818", "#0D1228"] : transaction.type === "Expense" ? ["#200D0D", "#0D1228"] : ["#0D1520", "#0D1228"]}
          style={styles.heroCard}
        >
          <View style={[styles.typeIconCircle, { backgroundColor: `${config.color}20`, borderColor: `${config.color}40` }]}>
            <Ionicons name={config.icon as keyof typeof Ionicons.glyphMap} size={28} color={config.color} />
          </View>
          <Text style={[styles.heroAmount, { color: config.color }]}>
            {config.prefix}{formatCOP(transaction.amount)}
          </Text>
          <Text style={styles.heroDate}>{formatDateTime(transaction.date)}</Text>
        </LinearGradient>

        <View style={styles.detailCard}>
          <DetailRow label={t("transactions.type")} value={typeLabelMap[transaction.type]} />
          <Divider />
          <DetailRow label={t("transactions.category")} value={`${transaction.categoryIcon}  ${transaction.categoryName}`} />
          <Divider />
          <DetailRow label={t("transactions.account")} value={transaction.accountName} />
          {transaction.description ? (
            <>
              <Divider />
              <DetailRow label={t("transactions.note")} value={transaction.description} />
            </>
          ) : null}
          <Divider />
          <DetailRow label={t("transactions.recurring")} value={transaction.isRecurring ? t("common.yes") : t("common.no")} />
        </View>

        <Pressable
          onPress={() =>
            navigation.navigate("Tabs", {
              screen: "AddTransaction",
              params: { existingTransaction: transaction },
            })
          }
          style={styles.editBtn}
        >
          <Ionicons name="create-outline" size={18} color={colors.primary} />
          <Text style={styles.editBtnText}>{t("common.edit")}</Text>
        </Pressable>

        <Pressable
          onPress={() => setShowDeleteDialog(true)}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={18} color={colors.expense} />
          <Text style={styles.deleteBtnText}>{t("transactions.deleteTransaction")}</Text>
        </Pressable>
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteDialog}
        title={t("transactions.deleteTransaction")}
        message={t("transactions.deleteConfirm")}
        confirmLabel={t("transactions.delete")}
        cancelLabel={t("transactions.cancel")}
        destructive
        onConfirm={() => {
          setShowDeleteDialog(false);
          void handleDelete();
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = makeStyles((colors) => ({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 80,
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
  heroCard: {
    borderRadius: 24,
    padding: spacing.xl,
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
  },
  typeIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  heroAmount: {
    fontFamily: typography.fontFamily.mono,
    fontSize: 36,
    fontWeight: "800",
  },
  heroDate: {
    color: "rgba(255,255,255,0.6)",
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
    textAlign: "center",
    textTransform: "capitalize",
  },
  detailCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 20,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  detailLabel: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.sm,
  },
  detailValue: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
    maxWidth: "55%",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: colors.bgCardBorder,
    marginHorizontal: spacing.lg,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,71,87,0.35)",
    backgroundColor: "rgba(255,71,87,0.08)",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.35)",
    backgroundColor: "rgba(0,214,143,0.08)",
  },
  editBtnText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 15,
  },
  deleteBtnText: {
    color: colors.expense,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 15,
  },
}));
