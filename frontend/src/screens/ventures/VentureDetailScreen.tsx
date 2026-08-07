import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { colors } from "../../constants/colors";
import { spacing } from "../../constants/spacing";
import { typography } from "../../constants/typography";
import { useDeleteBatch, useDeleteVenture, useRegisterSale, useVenture } from "../../hooks/useVentures";
import { useUIStore } from "../../store/uiStore";
import { AppStackParams } from "../../navigation/types";
import { VentureBatchDto } from "../../types/api";
import { getApiErrorMessage } from "../../utils/apiError";
import { makeStyles } from "../../theme/styles";

function formatCurrency(value: number): string {
  try {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
  } catch {
    return `$${Math.round(value)}`;
  }
}

function roiColor(v: number): string {
  return v > 0 ? colors.income : v < 0 ? colors.expense : colors.textSecondary;
}

type VentureDetailRoute = RouteProp<AppStackParams, "VentureDetail">;

export default function VentureDetailScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const route = useRoute<VentureDetailRoute>();
  const { ventureId } = route.params;

  const { data: venture, isLoading } = useVenture(ventureId);
  const deleteVenture = useDeleteVenture();
  const deleteBatch = useDeleteBatch();
  const registerSale = useRegisterSale();
  const showToast = useUIStore((state) => state.showToast);

  const [pendingBatch, setPendingBatch] = useState<VentureBatchDto | null>(null);
  const [confirmDeleteVenture, setConfirmDeleteVenture] = useState(false);
  const [saleBatch, setSaleBatch] = useState<VentureBatchDto | null>(null);
  const [saleUnits, setSaleUnits] = useState("");

  if (isLoading || !venture) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const handleDeleteVenture = async () => {
    setConfirmDeleteVenture(false);
    try {
      await deleteVenture.mutateAsync(venture.id);
      showToast(t("ventures.deleted"), "success");
      navigation.goBack();
    } catch {
      showToast(t("ventures.couldNotDelete"), "error");
    }
  };

  const handleDeleteBatch = async () => {
    if (!pendingBatch) return;
    const target = pendingBatch;
    setPendingBatch(null);
    try {
      await deleteBatch.mutateAsync({ ventureId: venture.id, batchId: target.id });
      showToast(t("ventures.batchDeleted"), "success");
    } catch {
      showToast(t("ventures.couldNotDelete"), "error");
    }
  };

  const handleRegisterSale = async () => {
    if (!saleBatch) return;
    const units = Math.round(Number(saleUnits.replace(/[^\d]/g, "")) || 0);
    if (units <= 0) {
      showToast(t("ventures.enterUnits"), "warning");
      return;
    }
    if (units > saleBatch.unitsRemaining) {
      showToast(t("ventures.notEnoughUnits", { count: saleBatch.unitsRemaining }), "warning");
      return;
    }
    const batchId = saleBatch.id;
    setSaleBatch(null);
    setSaleUnits("");
    try {
      await registerSale.mutateAsync({ ventureId: venture.id, batchId, data: { units } });
      showToast(t("ventures.saleRegistered"), "success");
    } catch (error) {
      showToast(getApiErrorMessage(error, t, "ventures.couldNotSave"), "error");
    }
  };

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable onPress={() => navigation.navigate("AddVenture", { venture })} style={styles.iconBtn}>
              <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={() => setConfirmDeleteVenture(true)} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={20} color={colors.expense} />
            </Pressable>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.venEmoji}>{venture.icon || "🚀"}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.venName}>{venture.name}</Text>
            {venture.description ? <Text style={styles.venDesc}>{venture.description}</Text> : null}
          </View>
        </View>

        <LinearGradient colors={["#07271D", "#0B1A30", "#16113A"]} style={styles.metricsCard}>
          <View style={styles.roiRow}>
            <Text style={styles.roiLabel}>{t("ventures.roi")}</Text>
            <Text style={[styles.roiValue, { color: roiColor(venture.roiPercentage) }]}>
              {venture.roiPercentage > 0 ? "+" : ""}{Math.round(venture.roiPercentage)}%
            </Text>
          </View>
          <View style={styles.metricsGrid}>
            <Metric label={t("ventures.invested")} value={formatCurrency(venture.totalInvestment)} />
            <Metric label={t("ventures.income")} value={formatCurrency(venture.totalRevenue)} />
            <Metric label={t("ventures.netBalance")} value={formatCurrency(venture.netBalance)} valueColor={roiColor(venture.netBalance)} />
            <Metric label={t("ventures.sold")} value={`${venture.totalUnitsSold}/${venture.totalUnitsProduced}`} />
            <Metric label={t("ventures.remaining")} value={String(venture.totalUnitsRemaining)} />
            <Metric label={t("ventures.unitCost")} value={formatCurrency(venture.unitCost)} sub={t("ventures.perUnit")} />
          </View>
        </LinearGradient>

        <View style={styles.batchesHead}>
          <Text style={styles.batchesTitle}>
            {t("ventures.batches")} ({venture.batchCount})
          </Text>
          <Pressable onPress={() => navigation.navigate("AddBatch", { ventureId: venture.id })} style={styles.addBatchBtn}>
            <Ionicons name="add" size={16} color={colors.primary} />
            <Text style={styles.addBatchText}>{t("ventures.addBatch")}</Text>
          </Pressable>
        </View>

        {venture.batches.length ? (
          <View style={styles.batchList}>
            {venture.batches.map((b) => {
              const soldOut = b.unitsRemaining <= 0;
              return (
                <View key={b.id} style={styles.batchCard}>
                  <Pressable onPress={() => navigation.navigate("AddBatch", { ventureId: venture.id, batch: b })}>
                    <View style={styles.batchTopRow}>
                      <Text style={styles.batchLabel} numberOfLines={1}>
                        {b.label || t("ventures.batches")}
                      </Text>
                      <View style={styles.batchTopRight}>
                        <View style={[styles.roiPill, { borderColor: roiColor(b.roiPercentage) }]}>
                          <Text style={[styles.roiPillText, { color: roiColor(b.roiPercentage) }]}>
                            {b.roiPercentage > 0 ? "+" : ""}{Math.round(b.roiPercentage)}%
                          </Text>
                        </View>
                        <Pressable onPress={() => setPendingBatch(b)} hitSlop={8} style={styles.batchDelete}>
                          <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                        </Pressable>
                      </View>
                    </View>
                    <Text style={styles.batchDate}>
                      {new Date(b.date).toLocaleDateString(i18n.language || "es", { day: "2-digit", month: "short", year: "numeric" })}
                    </Text>
                    <View style={styles.batchMetaRow}>
                      <BatchMeta label={t("ventures.invested")} value={formatCurrency(b.investment)} />
                      <BatchMeta label={t("ventures.unitPrice")} value={formatCurrency(b.unitPrice)} />
                      <BatchMeta label={t("ventures.sold")} value={`${b.unitsSold}/${b.unitsProduced}`} />
                    </View>
                    <View style={styles.batchMetaRow}>
                      <BatchMeta label={t("ventures.income")} value={formatCurrency(b.revenue)} />
                      <BatchMeta label={t("ventures.netBalance")} value={formatCurrency(b.netBalance)} valueColor={roiColor(b.netBalance)} />
                      <BatchMeta label={t("ventures.remaining")} value={String(b.unitsRemaining)} />
                    </View>
                  </Pressable>

                  <Pressable
                    style={[styles.saleBtn, soldOut && styles.saleBtnDisabled]}
                    disabled={soldOut}
                    onPress={() => { setSaleBatch(b); setSaleUnits(""); }}
                  >
                    <Ionicons name="cart-outline" size={16} color={soldOut ? colors.textMuted : colors.primary} />
                    <Text style={[styles.saleBtnText, soldOut && { color: colors.textMuted }]}>
                      {soldOut ? t("ventures.soldOut") : t("ventures.registerSale")}
                    </Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.noBatches}>{t("ventures.noBatches")}</Text>
        )}
      </ScrollView>

      <ConfirmDialog
        visible={pendingBatch !== null}
        title={t("ventures.deleteBatch")}
        message={t("ventures.deleteBatchConfirm")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        onCancel={() => setPendingBatch(null)}
        onConfirm={() => void handleDeleteBatch()}
      />

      <ConfirmDialog
        visible={confirmDeleteVenture}
        title={t("ventures.delete")}
        message={t("ventures.deleteConfirm", { name: venture.name })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        destructive
        onCancel={() => setConfirmDeleteVenture(false)}
        onConfirm={() => void handleDeleteVenture()}
      />

      <Modal visible={saleBatch !== null} transparent animationType="fade" onRequestClose={() => setSaleBatch(null)}>
        <Pressable style={styles.saleBackdrop} onPress={() => setSaleBatch(null)}>
          <Pressable style={styles.saleCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.saleTitle}>{t("ventures.registerSale")}</Text>
            <Text style={styles.saleSubtitle}>
              {t("ventures.unitsAvailable", { count: saleBatch?.unitsRemaining ?? 0 })}
              {saleBatch ? ` · ${formatCurrency(saleBatch.unitPrice)}/u` : ""}
            </Text>
            <TextInput
              value={saleUnits}
              onChangeText={setSaleUnits}
              keyboardType="numeric"
              placeholder={t("ventures.saleUnits")}
              placeholderTextColor={colors.textMuted}
              style={styles.saleInput}
              autoFocus
            />
            {saleBatch && saleUnits ? (
              <Text style={styles.salePreview}>
                + {formatCurrency((Math.round(Number(saleUnits.replace(/[^\d]/g, "")) || 0)) * saleBatch.unitPrice)}
              </Text>
            ) : null}
            <View style={styles.saleActions}>
              <Pressable style={styles.saleCancel} onPress={() => setSaleBatch(null)}>
                <Text style={styles.saleCancelText}>{t("common.cancel")}</Text>
              </Pressable>
              <Pressable style={styles.saleConfirm} onPress={() => void handleRegisterSale()}>
                <Text style={styles.saleConfirmText}>{t("ventures.registerSale")}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function Metric({ label, value, sub, valueColor }: { label: string; value: string; sub?: string; valueColor?: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
      {sub ? <Text style={styles.metricSub}>{sub}</Text> : null}
    </View>
  );
}

function BatchMeta({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.batchMetaItem}>
      <Text style={styles.batchMetaLabel}>{label}</Text>
      <Text style={[styles.batchMetaValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

const styles = makeStyles((colors) => ({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 130, gap: spacing.lg },
  loading: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerActions: { flexDirection: "row", gap: spacing.xs },
  iconBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  titleRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  venEmoji: { fontSize: 40 },
  venName: { color: colors.textPrimary, fontFamily: typography.fontFamily.heading, fontSize: 24 },
  venDesc: { marginTop: 2, color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 13 },
  metricsCard: { borderRadius: 20, borderWidth: 1, borderColor: colors.hairline, padding: spacing.lg },
  roiRow: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between" },
  roiLabel: { color: "rgba(255,255,255,0.55)", fontSize: 12, letterSpacing: 1.4, fontFamily: typography.fontFamily.bodyMedium },
  roiValue: { fontSize: 34, fontFamily: typography.fontFamily.monoExtraBold },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", marginTop: spacing.md },
  metric: { width: "33.33%", paddingVertical: 8, gap: 2 },
  metricLabel: { color: "rgba(255,255,255,0.45)", fontSize: 10, fontFamily: typography.fontFamily.body },
  metricValue: { color: "#FFFFFF", fontSize: 14, fontFamily: typography.fontFamily.monoSemiBold },
  metricSub: { color: "rgba(255,255,255,0.35)", fontSize: 9, fontFamily: typography.fontFamily.body },
  batchesHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  batchesTitle: { color: colors.textPrimary, fontFamily: typography.fontFamily.headingSemiBold, fontSize: 16 },
  addBatchBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  addBatchText: { color: colors.primary, fontFamily: typography.fontFamily.bodyMedium, fontSize: 13 },
  batchList: { gap: spacing.sm },
  batchCard: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 16,
    padding: spacing.md,
    gap: 10,
  },
  batchTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  batchLabel: { flex: 1, color: colors.textPrimary, fontFamily: typography.fontFamily.headingSemiBold, fontSize: 14 },
  batchTopRight: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  roiPill: { borderWidth: 1, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3 },
  roiPillText: { fontSize: 12, fontFamily: typography.fontFamily.monoSemiBold },
  batchDelete: { padding: 2 },
  batchDate: { color: colors.textMuted, fontFamily: typography.fontFamily.body, fontSize: 11, marginTop: -4, marginBottom: 4 },
  batchMetaRow: { flexDirection: "row", marginBottom: 2 },
  batchMetaItem: { flex: 1, gap: 2 },
  batchMetaLabel: { color: colors.textSecondary, fontSize: 10, fontFamily: typography.fontFamily.body },
  batchMetaValue: { color: colors.textPrimary, fontSize: 13, fontFamily: typography.fontFamily.monoSemiBold },
  saleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.3)",
    backgroundColor: "rgba(0,214,143,0.06)",
  },
  saleBtnDisabled: {
    borderColor: colors.bgCardBorder,
    backgroundColor: "transparent",
  },
  saleBtnText: { color: colors.primary, fontFamily: typography.fontFamily.bodyMedium, fontSize: 13 },
  noBatches: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: spacing.lg,
  },
  saleBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  saleCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.bgCardAlt,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  saleTitle: { color: colors.textPrimary, fontFamily: typography.fontFamily.headingSemiBold, fontSize: 18 },
  saleSubtitle: { color: colors.textSecondary, fontFamily: typography.fontFamily.body, fontSize: 13 },
  saleInput: {
    marginTop: 4,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.mono,
    fontSize: typography.fontSize.lg,
    textAlign: "center",
  },
  salePreview: {
    color: colors.income,
    fontFamily: typography.fontFamily.monoSemiBold,
    fontSize: 15,
    textAlign: "center",
  },
  saleActions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  saleCancel: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  saleCancelText: { color: colors.textSecondary, fontFamily: typography.fontFamily.bodyMedium, fontSize: 15 },
  saleConfirm: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  saleConfirmText: { color: colors.textInverse, fontFamily: typography.fontFamily.headingSemiBold, fontSize: 15 },
}));
