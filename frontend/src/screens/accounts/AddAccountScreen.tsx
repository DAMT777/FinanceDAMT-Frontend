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
import { useCreateAccount } from "../../hooks/useAccounts";
import { useUIStore } from "../../store/uiStore";
import { getApiErrorMessage } from "../../utils/apiError";
import { AccountType } from "../../types/api";
import { makeStyles } from "../../theme/styles";

const ACCOUNT_TYPES: { type: AccountType; icon: keyof typeof Ionicons.glyphMap; labelKey: string; color: string }[] = [
  { type: "Cash", icon: "cash-outline", labelKey: "accounts.cash", color: colors.primary },
  { type: "Bank", icon: "business-outline", labelKey: "accounts.bank", color: colors.info },
  { type: "Credit", icon: "card-outline", labelKey: "accounts.credit", color: colors.accent },
];

export default function AddAccountScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const createAccount = useCreateAccount();
  const showToast = useUIStore((state) => state.showToast);

  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("Bank");
  const [balance, setBalance] = useState("");
  const [creditLimit, setCreditLimit] = useState("");

  const isValid = name.trim().length > 0 && balance.trim().length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    try {
      await createAccount.mutateAsync({
        name: name.trim(),
        type,
        balance: parseFloat(balance.replace(/\./g, "")) || 0,
        creditLimit: type === "Credit" && creditLimit ? parseFloat(creditLimit.replace(/\./g, "")) : undefined,
      });
      showToast(t("accounts.accountCreated"), "success");
      navigation.goBack();
    } catch (error) {
      showToast(getApiErrorMessage(error, t, "accounts.couldNotCreate"), "error");
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
          <Text style={styles.title}>{t("accounts.newAccount")}</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("accounts.type")}</Text>
          <View style={styles.typeRow}>
            {ACCOUNT_TYPES.map(({ type: typeOption, icon, labelKey, color }) => {
              const active = type === typeOption;
              return (
                <Pressable
                  key={typeOption}
                  style={[
                    styles.typeChip,
                    active && { borderColor: color, backgroundColor: `${color}18` },
                  ]}
                  onPress={() => setType(typeOption)}
                >
                  <Ionicons name={icon} size={20} color={active ? color : colors.textSecondary} />
                  <Text style={[styles.typeLabel, active && { color }]}>{t(labelKey)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("accounts.accountName")}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ej. Bancolombia, Efectivo…"
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            {type === "Credit" ? t("accounts.currentDebtOrBalance") : t("accounts.initialBalance")}
          </Text>
          <TextInput
            style={[styles.input, styles.amountInput]}
            value={balance}
            onChangeText={setBalance}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        {type === "Credit" ? (
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>{t("accounts.creditLimit")}</Text>
            <TextInput
              style={[styles.input, styles.amountInput]}
              value={creditLimit}
              onChangeText={setCreditLimit}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        ) : null}

        <Pressable
          onPress={() => void handleSave()}
          disabled={!isValid || createAccount.isPending}
          style={styles.savePressable}
        >
          <LinearGradient
            colors={isValid ? ["#00D68F", "#00B87A"] : [colors.bgCard, colors.bgCard]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
          >
            <Text style={[styles.saveBtnText, !isValid && styles.saveBtnTextDisabled]}>
              {createAccount.isPending ? t("accounts.creating") : t("accounts.createAccount")}
            </Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = makeStyles((colors) => ({
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
  typeRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  typeChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 14,
    backgroundColor: colors.bgCard,
    paddingVertical: spacing.sm,
    alignItems: "center",
    gap: 4,
  },
  typeLabel: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 12,
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
    fontSize: typography.fontSize.md,
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
}));
