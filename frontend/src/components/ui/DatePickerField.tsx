import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { moderateScale, scale } from "../../utils/responsive";

interface DatePickerFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minimumDate?: Date;
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export default function DatePickerField({
  value,
  onChange,
  placeholder,
  minimumDate,
}: DatePickerFieldProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "es";
  const [open, setOpen] = useState(false);

  const selected = value ? new Date(`${value}T00:00:00`) : null;
  const [viewDate, setViewDate] = useState<Date>(() => selected ?? new Date());

  const minKey = minimumDate ? toKey(minimumDate) : null;

  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Date(2024, 0, 1 + i)
          .toLocaleDateString(locale, { weekday: "narrow" })
          .toUpperCase(),
      ),
    [locale],
  );

  const cells = useMemo(() => {
    const first = startOfMonth(viewDate);
    const leading = (first.getDay() + 6) % 7;
    const total = daysInMonth(viewDate);
    const list: (Date | null)[] = [];
    for (let i = 0; i < leading; i++) list.push(null);
    for (let d = 1; d <= total; d++) {
      list.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
    }
    return list;
  }, [viewDate]);

  const monthTitle = viewDate
    .toLocaleDateString(locale, { month: "long", year: "numeric" })
    .replace(/^./, (c) => c.toUpperCase());

  const displayValue = selected
    ? selected.toLocaleDateString(locale, { day: "2-digit", month: "short", year: "numeric" })
    : "";

  const todayKey = toKey(new Date());

  const handlePick = (date: Date) => {
    onChange(toKey(date));
    setOpen(false);
  };

  return (
    <>
      <Pressable
        style={styles.field}
        onPress={() => {
          setViewDate(selected ?? new Date());
          setOpen(true);
        }}
        accessibilityRole="button"
      >
        <Text style={[styles.fieldText, !displayValue && styles.placeholder]}>
          {displayValue || placeholder || t("common.selectDate")}
        </Text>
        <Ionicons name="calendar-outline" size={moderateScale(18)} color={colors.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.calendar} onPress={(e) => e.stopPropagation()}>
            <View style={styles.calHeader}>
              <Pressable
                hitSlop={10}
                onPress={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                style={styles.navBtn}
              >
                <Ionicons name="chevron-back" size={moderateScale(20)} color={colors.textPrimary} />
              </Pressable>
              <Text style={styles.calTitle}>{monthTitle}</Text>
              <Pressable
                hitSlop={10}
                onPress={() => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                style={styles.navBtn}
              >
                <Ionicons name="chevron-forward" size={moderateScale(20)} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {weekdays.map((w, i) => (
                <Text key={`${w}-${i}`} style={styles.weekday}>
                  {w}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((date, i) => {
                if (!date) return <View key={`blank-${i}`} style={styles.cell} />;
                const key = toKey(date);
                const isSelected = selected != null && key === toKey(selected);
                const isToday = key === todayKey;
                const disabled = minKey != null && key < minKey;
                return (
                  <Pressable
                    key={key}
                    style={styles.cell}
                    disabled={disabled}
                    onPress={() => handlePick(date)}
                  >
                    <View style={[styles.dayDot, isSelected && styles.daySelected]}>
                      <Text
                        style={[
                          styles.dayText,
                          isToday && !isSelected && styles.dayToday,
                          isSelected && styles.dayTextSelected,
                          disabled && styles.dayDisabled,
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: scale(14),
    paddingHorizontal: scale(16),
    paddingVertical: scale(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.body,
    fontSize: typography.fontSize.md,
  },
  placeholder: {
    color: colors.textMuted,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: scale(24),
  },
  calendar: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.bgCardAlt,
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    padding: scale(16),
  },
  calHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: scale(12),
  },
  navBtn: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bgCard,
  },
  calTitle: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: moderateScale(16),
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: scale(4),
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: moderateScale(11),
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayDot: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    alignItems: "center",
    justifyContent: "center",
  },
  daySelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.body,
    fontSize: moderateScale(14),
  },
  dayToday: {
    color: colors.primary,
    fontFamily: typography.fontFamily.headingSemiBold,
  },
  dayTextSelected: {
    color: colors.textInverse,
    fontFamily: typography.fontFamily.headingSemiBold,
  },
  dayDisabled: {
    color: colors.textMuted,
    opacity: 0.4,
  },
});
