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
import { useCreateVenture, useUpdateVenture } from "../../hooks/useVentures";
import { useUIStore } from "../../store/uiStore";
import { getApiErrorMessage } from "../../utils/apiError";
import { AppStackParams } from "../../navigation/types";
import { makeStyles } from "../../theme/styles";

const VENTURE_EMOJIS = [
  "🚀", "🍪", "🧁", "🍰", "☕", "🍔", "🥟", "🍫",
  "👕", "💅", "💐", "🕯️", "🎨", "📷", "💻", "🧵",
  "🛍️", "🚗", "🐝", "💰",
];

type AddVentureRoute = RouteProp<AppStackParams, "AddVenture">;

export default function AddVentureScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<AddVentureRoute>();
  const existing = route.params?.venture;
  const isEdit = Boolean(existing);

  const createVenture = useCreateVenture();
  const updateVenture = useUpdateVenture();
  const showToast = useUIStore((state) => state.showToast);

  const [name, setName] = useState(existing?.name ?? "");
  const [icon, setIcon] = useState(existing?.icon || "🚀");
  const [description, setDescription] = useState(existing?.description ?? "");

  const isValid = name.trim().length > 0;
  const isSaving = createVenture.isPending || updateVenture.isPending;

  const handleSave = async () => {
    if (!isValid) {
      showToast(t("ventures.needName"), "warning");
      return;
    }
    try {
      if (existing) {
        await updateVenture.mutateAsync({
          id: existing.id,
          data: {
            name: name.trim(),
            icon,
            description: description.trim() || undefined,
            isActive: existing.isActive,
          },
        });
        showToast(t("ventures.updated"), "success");
      } else {
        await createVenture.mutateAsync({
          name: name.trim(),
          icon,
          description: description.trim() || undefined,
        });
        showToast(t("ventures.created"), "success");
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
          <Text style={styles.title}>{isEdit ? t("ventures.editVenture") : t("ventures.addVenture")}</Text>
          <Pressable onPress={() => navigation.goBack()} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("ventures.icon")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
            {VENTURE_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                style={[styles.emojiCell, icon === emoji && styles.emojiCellActive]}
                onPress={() => setIcon(emoji)}
              >
                <Text style={styles.emoji}>{emoji}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("ventures.name")}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t("ventures.namePlaceholder")}
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoFocus={!isEdit}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{t("ventures.description")}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder=""
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.multiline]}
            multiline
          />
        </View>

        <Pressable onPress={() => void handleSave()} disabled={!isValid || isSaving} style={styles.savePressable}>
          <LinearGradient
            colors={isValid ? ["#00D68F", "#00B87A"] : [colors.bgCard, colors.bgCard]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.saveBtn, !isValid && styles.saveBtnDisabled]}
          >
            <Text style={[styles.saveBtnText, !isValid && styles.saveBtnTextDisabled]}>
              {isEdit ? t("ventures.save") : t("ventures.create")}
            </Text>
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
  fieldGroup: { gap: spacing.xs },
  label: {
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.xs,
    letterSpacing: 0.5,
  },
  emojiRow: { gap: spacing.sm, paddingRight: spacing.md },
  emojiCell: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    alignItems: "center",
    justifyContent: "center",
  },
  emojiCellActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  emoji: { fontSize: 20 },
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
  multiline: {
    minHeight: 80,
    textAlignVertical: "top",
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
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: {
    color: "#fff",
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 16,
  },
  saveBtnTextDisabled: { color: colors.textMuted },
}));
