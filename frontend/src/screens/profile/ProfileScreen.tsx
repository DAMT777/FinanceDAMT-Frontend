import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import LanguageSelector from "../../components/LanguageSelector";
import { AppStackParams } from "../../navigation/types";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParams>>();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const currentLanguage = useUIStore((state) => state.currentLanguage);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);

  const initials = (user?.name ?? "Finance User")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}> 
          <View style={styles.avatarWrap}>
            <LinearGradient colors={[colors.primary, colors.accent]} style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={10} color={colors.textSecondary} />
            </View>
          </View>

          <Text style={styles.name}>{user?.name ?? t("profile.financeUser")}</Text>
          <Text style={styles.email}>{user?.email ?? "user@financedamt.com"}</Text>

          <View style={styles.profileBadge}>
            <Text style={styles.profileBadgeText}>{t("profile.balanced")}</Text>
          </View>
        </View>

        <View style={styles.sections}>
          <Text style={styles.sectionLabel}>{t("profile.manage").toUpperCase()}</Text>
          <View style={styles.card}>
            <SettingRow
              icon="repeat-outline"
              iconColor={colors.accent}
              iconBg="rgba(108,99,255,0.1)"
              label={t("subscriptions.title")}
              value=""
              onPress={() => navigation.navigate("Subscriptions")}
            />
          </View>

          <Text style={styles.sectionLabel}>{t("profile.preferences").toUpperCase()}</Text>
          <View style={styles.card}>
            <SettingRow
              icon="globe-outline"
              iconColor={colors.primary}
              iconBg="rgba(0,214,143,0.1)"
              label={t("profile.language")}
              value={currentLanguage.toUpperCase()}
              onPress={() => setShowLanguageSelector(true)}
            />
            <Divider />
            <SettingRow
              icon="notifications-outline"
              iconColor={colors.warning}
              iconBg="rgba(255,184,48,0.1)"
              label={t("profile.notifications")}
              value={t("common.yes")}
            />
          </View>

          <Text style={styles.sectionLabel}>{t("profile.title").toUpperCase()}</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconCircle, { backgroundColor: "rgba(0,214,143,0.1)" }]}> 
                  <Ionicons name="finger-print-outline" size={16} color={colors.primary} />
                </View>
                <Text style={styles.rowLabel}>{t("profile.biometricLogin")}</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: colors.bgCardBorder, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Divider />
            <SettingRow
              icon="shield-checkmark-outline"
              iconColor={colors.accent}
              iconBg="rgba(108,99,255,0.1)"
              label={t("profile.changePassword")}
              value={t("common.yes")}
            />
          </View>

          <Pressable style={styles.signOutBtn} onPress={() => setShowLogoutDialog(true)}>
            <Ionicons name="log-out-outline" size={18} color={colors.expense} />
            <Text style={styles.signOutText}>{t("auth.signOut")}</Text>
          </Pressable>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showLogoutDialog}
        title={t("auth.signOut")}
        message={t("auth.signOutConfirm")}
        confirmLabel={t("auth.signOut")}
        cancelLabel={t("common.cancel")}
        destructive
        onCancel={() => setShowLogoutDialog(false)}
        onConfirm={() => {
          setShowLogoutDialog(false);
          void logout();
        }}
      />

      <LanguageSelector visible={showLanguageSelector} onClose={() => setShowLanguageSelector(false)} />
    </>
  );
}

function SettingRow({
  icon,
  iconColor,
  iconBg,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  value: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={16} color={iconColor} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>

      <View style={styles.rowRight}>
        <Text style={styles.rowValue}>{value}</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
      </View>
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    alignItems: "center",
  },
  avatarWrap: {
    position: "relative",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontFamily: typography.fontFamily.headingBold,
  },
  editBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.bgCardAlt,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    marginTop: 14,
    color: colors.textPrimary,
    fontSize: 20,
    fontFamily: typography.fontFamily.headingBold,
  },
  email: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
  },
  profileBadge: {
    marginTop: 10,
    backgroundColor: "rgba(0,214,143,0.1)",
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.3)",
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  profileBadgeText: {
    color: colors.primary,
    fontSize: 12,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  sections: {
    marginTop: 24,
    paddingHorizontal: 20,
    gap: 16,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 11,
    letterSpacing: 1.5,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 16,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    marginLeft: 12,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  rowValue: {
    color: colors.textSecondary,
    fontSize: 13,
    fontFamily: typography.fontFamily.body,
  },
  divider: {
    height: 1,
    backgroundColor: colors.bgCardBorder,
    marginLeft: 58,
  },
  signOutBtn: {
    marginTop: 8,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,71,87,0.2)",
    backgroundColor: "rgba(255,71,87,0.08)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  signOutText: {
    marginLeft: 8,
    color: colors.expense,
    fontSize: 15,
    fontFamily: typography.fontFamily.bodyMedium,
  },
});
