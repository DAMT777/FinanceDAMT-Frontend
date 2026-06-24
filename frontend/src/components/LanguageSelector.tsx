import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { colors } from "../constants/colors";
import { spacing } from "../constants/spacing";
import { typography } from "../constants/typography";
import { useUIStore } from "../store/uiStore";
import { makeStyles } from "../theme/styles";

type Props = {
  visible: boolean;
  onClose: () => void;
};

type LanguageOption = {
  code: "es" | "en" | "pt" | "fr";
  flag: string;
};

const OPTIONS: LanguageOption[] = [
  { code: "es", flag: "🇨🇴" },
  { code: "en", flag: "🇺🇸" },
  { code: "pt", flag: "🇧🇷" },
  { code: "fr", flag: "🇫🇷" },
];

export default function LanguageSelector({ visible, onClose }: Props) {
  const { t } = useTranslation();
  const currentLanguage = useUIStore((state) => state.currentLanguage);
  const changeLanguage = useUIStore((state) => state.changeLanguage);
  const [selected, setSelected] = useState<"es" | "en" | "pt" | "fr">((currentLanguage as "es" | "en" | "pt" | "fr") || "es");

  useEffect(() => {
    if (!visible) return;
    setSelected((currentLanguage as "es" | "en" | "pt" | "fr") || "es");
  }, [currentLanguage, visible]);

  const onConfirm = async () => {
    await changeLanguage(selected);
    onClose();
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{t("language.title")}</Text>
          <View style={styles.optionsList}>
            {OPTIONS.map((option) => {
              const active = selected === option.code;
              return (
                <Pressable
                  key={option.code}
                  style={[styles.option, active && styles.optionActive]}
                  onPress={() => setSelected(option.code)}
                >
                  <View style={styles.optionLeft}>
                    <Text style={[styles.radio, active && styles.radioActive]}>{active ? "●" : "○"}</Text>
                    <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                      {t(`language.${option.code}`)}
                    </Text>
                  </View>
                  <View style={styles.optionRight}>
                    <Text style={styles.flag}>{option.flag}</Text>
                    {active ? <Text style={styles.check}>✓</Text> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
          <Pressable style={styles.confirmBtn} onPress={() => void onConfirm()}>
            <Text style={styles.confirmText}>{t("language.confirm")}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = makeStyles((colors) => ({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 18,
  },
  optionsList: {
    gap: spacing.sm,
  },
  option: {
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 14,
    backgroundColor: colors.bgCard,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  optionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  radio: {
    color: colors.textMuted,
    fontSize: 16,
  },
  radioActive: {
    color: colors.primary,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 15,
  },
  optionLabelActive: {
    color: colors.primary,
  },
  flag: {
    fontSize: 17,
  },
  check: {
    color: colors.primary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 15,
  },
  confirmBtn: {
    marginTop: spacing.xs,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    color: colors.textInverse,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 15,
  },
}));
