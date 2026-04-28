import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useAccounts, useNetWorth } from "../../hooks/useAccounts";
import { AppStackParams } from "../../navigation/types";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function AccountsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const accountsQuery = useAccounts();
  const { data: netWorth } = useNetWorth();
  const accounts = accountsQuery.data ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t("accounts.title")}</Text>

      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>{t("accounts.netWorth")}</Text>
        <Text style={styles.heroValue}>{formatCurrency(netWorth?.netWorth ?? 0)}</Text>
        <Text style={styles.heroMeta}>
          {t("accounts.assets")} {formatCurrency(netWorth?.totalAssets ?? 0)} · {t("accounts.debts")} {formatCurrency(netWorth?.totalDebts ?? 0)}
        </Text>
      </View>

      {accounts.length ? (
        <View style={styles.list}>
          {accounts.map((account) => (
            <View key={account.id} style={styles.accountCard}>
              <View style={styles.accountIconWrap}>
                <Ionicons name="wallet-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{account.name}</Text>
                <Text style={styles.accountType}>{account.type}</Text>
              </View>
              <Text style={styles.accountBalance}>{formatCurrency(account.balance)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <EmptyState icon="Cuenta" title={t("accounts.noAccountsYet")} subtitle={t("accounts.createOne")} />
      )}

      <Button variant="secondary" size="md" onPress={() => navigation.navigate("AddAccount")}>
        {t("accounts.addAccount")}
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.heading,
    fontSize: 24,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    padding: spacing.lg,
  },
  heroLabel: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
  },
  heroValue: {
    marginTop: spacing.xs,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.mono,
    fontSize: 32,
  },
  heroMeta: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
  },
  list: {
    gap: spacing.sm,
  },
  accountCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  accountIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryGlow,
    alignItems: "center",
    justifyContent: "center",
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: typography.fontSize.sm,
  },
  accountType: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
  },
  accountBalance: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.md,
  },
});
