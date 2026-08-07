import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import DatePickerField from "../../components/ui/DatePickerField";
import { useAddBatch, useUpdateBatch } from "../../hooks/useVentures";
import { useUIStore } from "../../store/uiStore";
import { getApiErrorMessage } from "../../utils/apiError";
import { AppStackParams } from "../../navigation/types";
import { makeStyles } from "../../theme/styles";

function formatCurrency(value: number): string {
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
  } catch {
    return `$${Math.round(value)}`;
  }
}

function toNumber(text: string): number {
  return Number(text.replace(/[^\d.]/g, "")) || 0;
}

type AddBatchRoute = RouteProp<AppStackParams, "AddBatch">;

export default function AddBatchScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<AddBatchRoute>();
  const ventureId = route.params?.ventureId as string;
  const existing = route.params?.batch;
  const isEdit = Boolean(existing);

  const addBatch = useAddBatch();
  const updateBatch = useUpdateBatch();
  const showToast = useUIStore((state) => state.showToast);

  const [label, setLabel] = useState(existing?.label ?? "");
  const [date, setDate] = useState(existing?.date ?? new Date().toISOString());
  const [investment, setInvestment] = useState(existing ? String(existing.investment) : "");
  const [units, setUnits] = useState(existing ? String(existing.unitsProduced) : "");
  const [income, setIncome] = useState(existing ? String(existing.income) : "");
  const [notes, setNotes] = useState(existing?.notes ?? "");

  const investmentNum = toNumber(investment);
  const unitsNum = Math.round(toNumber(units));
  const incomeNum = toNumber(income);
  const unitCost = unitsNum > 0 ? investmentNum / unitsNum : 0;
  const netBalance = incomeNum - investmentNum;
  const roi = investmentNum > 0 ? Math.round((netBalance / investmentNum) * 100) : 0;
  const roiColor = roi > 0 ? colors.income : roi < 0 ? colors.expense : colors.textSecondary;

  const isValid = investmentNum > 0 && unitsNum > 0;
  const isSaving = addBatch.isPending || updateBatch.isPending;

  const handleSave = async () => {
    if (!isValid) {
      showToast(t("ventures.needInvestment"), "warning");
      return;
    }
    const payload = {
      label: label.trim() || t("ventures.batches"),
      date: new Date(date).toISOString(),
      investment: investmentNum,
      unitsProduced: unitsNum,
      income: incomeNum,
      notes: notes.trim() || undefined,
    };
    try {
      if (existing) {
        await updateBatch.mutateAsync({ ventureId, batchId: existing.id, data: payload });
        showToast(t("ventures.batchUpdated"), "success");
      } else {
        await addBatch.mutateAsync({ ventureId, data: payload });
        showToast(t("ventures.batchCreated"), "success");
      }
      navigation.goBack();
    } catch (error) {
      showToast(getApiErrorMessage(error, t, "ventures.couldNotSave"), "error");
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.dragHandle} />

        <View style={styles.headerRow}>
          <Text style={styles.title}>{isEdit ? t("ventures.editBatch") : t("ventures.addBatch")}</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("ventures.batchLabel")}</Text>
          <TextInput value={label} onChangeText={setLabel} placeholder="Tanda 1" placeholderTextColor={colors.textMuted} style={styles.input} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("ventures.date")}</Text>
          <DatePickerField value={date} onChange={setDate} />
        </View>

        <View style={styles.row}>
          <View style={[styles.fieldGroup, styles.rowItem]}>
            <Text style={styles.label}>{t("ventures.investment")}</Text>
            <TextInput value={investment} onChangeText={setInvestment} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} style={[styles.input, styles.mono]} />
          </View>
          <View style={[styles.fieldGroup, styles.rowItem]}>
            <Text style={styles.label}>{t("ventures.unitsProduced")}</Text>
            <TextInput value={units} onChangeText={setUnits} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} style={[styles.input, styles.mono]} />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("ventures.batchIncome")}</Text>
          <TextInput value={income} onChangeText={setIncome} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textMuted} style={[styles.input, styles.mono]} />
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>{t("ventures.unitCost")}</Text>
            <Text style={styles.previewValue}>{formatCurrency(unitCost)}</Text>
          </View>
          <View style={styles.previewDivider} />
          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>{t("ventures.netBalance")}</Text>
            <Text style={[styles.previewValue, { color: roiColor }]}>{formatCurrency(netBalance)}</Text>
          </View>
          <View style={styles.previewDivider} />
          <View style={styles.previewItem}>
            <Text style={styles.previewLabel}>{t("ventures.roi")}</Text>
            <Text style={[styles.previewValue, { color: roiColor }]}>{roi > 0 ? "+" : ""}{roi}%</Text>
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("ventures.notes")}</Text>
          <TextInput value={notes} onChangeText={setNotes} placeholder="" placeholderTextColor={colors.textMuted} style={[styles.input, styles.multiline]} multiline />
        </View>

        <Pressable onPress={() => void handleSave()} disabled={!isValid || isSaving} style={styles.savePressable}>
          <LinearGradient
            colors={isValid ? ["#00D68F", "#00B87A"] : [colors.bgCard, colors.bgCard]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
          >
            <Text style={[styles.saveBtnText, !isValid && styles.saveBtnTextDisabled]}>{t("ventures.saveBatch")}</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = makeStyles((colors) => ({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 120, gap: spacing.lg },
  dragHandle: {
    alignSelf: "center",
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.bgCardBorder,
    marginTop: spacing.xs,
    marginBottom: -spacing.xs,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: colors.textPrimary, fontFamily: typography.fontFamily.heading, fontSize: 22 },
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
  fieldGroup: { gap: spacing.xs },
  row: { flexDirection: "row", gap: spacing.md },
  rowItem: { flex: 1 },
  label: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    letterSpacing: 0.5,
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
  mono: { fontFamily: typography.fontFamily.mono },
  multiline: { minHeight: 70, textAlignVertical: "top" },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 14,
    paddingVertical: spacing.md,
  },
  previewItem: { flex: 1, alignItems: "center", gap: 4 },
  previewDivider: { width: 1, height: 32, backgroundColor: colors.bgCardBorder },
  previewLabel: {
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 10,
    textAlign: "center",
  },
  previewValue: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.monoSemiBold,
    fontSize: 13,
  },
  savePressable: { borderRadius: 16, overflow: "hidden", marginTop: spacing.sm },
  saveBtn: { height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { color: "#fff", fontFamily: typography.fontFamily.headingSemiBold, fontSize: 16 },
  saveBtnTextDisabled: { color: colors.textMuted },
}));
