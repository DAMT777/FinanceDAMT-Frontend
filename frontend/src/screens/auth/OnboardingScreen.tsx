import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import Button from "../../components/ui/Button";
import { spacing } from "../../constants/spacing";

type Slide = {
  id: string;
  title: string;
  subtitle: string;
};

type OnboardingProps = {
  navigation: {
    replace: (route: "Login") => void;
  };
};

export default function OnboardingScreen({ navigation }: OnboardingProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<Slide>>(null);

  const slides: Slide[] = [
    {
      id: "1",
      title: t("onboarding.slide1Title"),
      subtitle: t("onboarding.slide1Subtitle"),
    },
    {
      id: "2",
      title: t("onboarding.slide2Title"),
      subtitle: t("onboarding.slide2Subtitle"),
    },
    {
      id: "3",
      title: t("onboarding.slide3Title"),
      subtitle: t("onboarding.slide3Subtitle"),
    },
  ];

  const viewabilityConfig = useMemo(() => ({ viewAreaCoveragePercentThreshold: 60 }), []);

  const onNext = () => {
    if (index >= slides.length - 1) {
      navigation.replace("Login");
      return;
    }

    listRef.current?.scrollToIndex({ index: index + 1, animated: true });
  };

  const onViewableItemsChanged = ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
    const next = viewableItems[0]?.index ?? 0;
    setIndex(next);
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        horizontal
        pagingEnabled
        data={slides}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}> 
            <View style={styles.mockupZone}>
              {item.id === "1" ? (
                <View style={styles.stackWrap}>
                  <View style={[styles.txCard, styles.txCardTop]}>
                    <View style={styles.txLeft}>
                      <Text style={styles.txEmoji}>🚗</Text>
                      <Text style={styles.txName}>{t("onboarding.mockRide")}</Text>
                    </View>
                    <Text style={styles.txExpense}>-18.000</Text>
                  </View>
                  <View style={[styles.txCard, styles.txCardMid]}>
                    <View style={styles.txLeft}>
                      <Text style={styles.txEmoji}>☕</Text>
                      <Text style={styles.txName}>{t("onboarding.mockCoffee")}</Text>
                    </View>
                    <Text style={styles.txExpense}>-14.500</Text>
                  </View>
                  <View style={[styles.txCard, styles.txCardBottom]}>
                    <View style={styles.txLeft}>
                      <Text style={styles.txEmoji}>💼</Text>
                      <Text style={styles.txName}>{t("onboarding.mockSalary")}</Text>
                    </View>
                    <Text style={styles.txIncome}>+5.650.000</Text>
                  </View>
                </View>
              ) : null}

              {item.id === "2" ? (
                <View style={styles.goalWrap}>
                  <View style={styles.ringOuter}>
                    <View style={styles.ringInner}>
                      <Text style={styles.ringValue}>68%</Text>
                      <Text style={styles.ringLabel}>COMPLETADO</Text>
                    </View>
                  </View>
                  <View style={styles.goalCard}>
                    <Text style={styles.goalTitle}>{t("onboarding.mockGoalTitle")}</Text>
                    <Text style={styles.goalSub}>{t("onboarding.mockGoalSub")}</Text>
                  </View>
                </View>
              ) : null}

              {item.id === "3" ? (
                <View style={styles.chatMockup}>
                  <View style={styles.userBubbleMock}>
                    <Text style={styles.userBubbleText}>{t("onboarding.mockQuestion")}</Text>
                  </View>

                  <View style={styles.aiRow}>
                    <View style={styles.aiDot} />
                    <View style={styles.aiBubbleMock}>
                      <Text style={styles.aiBubbleText}>{t("onboarding.mockAnswer1")}</Text>
                    </View>
                  </View>

                  <View style={styles.aiRow}>
                    <View style={styles.aiDot} />
                    <View style={styles.aiBubbleMock}>
                      <Text style={styles.aiBubbleText}>{t("onboarding.mockAnswer2")}</Text>
                    </View>
                  </View>
                </View>
              ) : null}
            </View>

            <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 24 }]}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>

              <View style={styles.dotsRow}>
                {slides.map((slide, dotIndex) => (
                  <View key={slide.id} style={[styles.dotBase, dotIndex === index ? styles.dotActive : styles.dotInactive]} />
                ))}
              </View>

              {index === slides.length - 1 ? (
                <Button variant="primary" size="lg" onPress={onNext}>
                  {t("onboarding.getStarted")}
                </Button>
              ) : (
                <Pressable style={styles.nextLink} onPress={onNext}>
                  <Text style={styles.nextText}>{t("onboarding.next")}</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </Pressable>
              )}
            </View>
          </View>
        )}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  slide: {
    flex: 1,
  },
  mockupZone: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  stackWrap: {
    width: "100%",
    alignItems: "center",
  },
  txCard: {
    width: "90%",
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  txCardTop: {
    transform: [{ rotate: "-4deg" }],
  },
  txCardMid: {
    marginTop: 10,
    transform: [{ rotate: "2deg" }],
  },
  txCardBottom: {
    marginTop: 10,
    transform: [{ rotate: "-2deg" }],
  },
  txLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  txEmoji: {
    fontSize: 18,
  },
  txName: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 14,
  },
  txExpense: {
    color: colors.expense,
    fontFamily: typography.fontFamily.monoSemiBold,
    fontSize: 14,
  },
  txIncome: {
    color: colors.income,
    fontFamily: typography.fontFamily.monoSemiBold,
    fontSize: 14,
  },
  goalWrap: {
    alignItems: "center",
  },
  ringOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 9,
    borderColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  ringValue: {
    color: colors.accent,
    fontFamily: typography.fontFamily.monoSemiBold,
    fontSize: 24,
  },
  ringLabel: {
    marginTop: 2,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 10,
  },
  goalCard: {
    marginTop: 14,
    width: 220,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  goalTitle: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.bodyMedium,
    fontSize: 14,
  },
  goalSub: {
    marginTop: 4,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.body,
    fontSize: 12,
  },
  chatMockup: {
    width: "100%",
    gap: 10,
    paddingHorizontal: 10,
  },
  userBubbleMock: {
    alignSelf: "flex-end",
    maxWidth: "78%",
    backgroundColor: "#0D2818",
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.2)",
    borderRadius: 14,
    borderBottomRightRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubbleText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
  },
  aiRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  aiDot: {
    width: 12,
    height: 12,
    marginTop: 6,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  aiBubbleMock: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    borderRadius: 14,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  aiBubbleText: {
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.body,
    fontSize: 13,
  },
  bottomArea: {
    minHeight: 220,
    paddingHorizontal: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    lineHeight: 36,
    fontFamily: typography.fontFamily.headingBold,
  },
  subtitle: {
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 22,
    fontSize: 15,
    fontFamily: typography.fontFamily.body,
  },
  dotsRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dotBase: {
    borderRadius: 99,
    height: 8,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.bgCardBorder,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.primary,
  },
  nextLink: {
    marginTop: 18,
    alignSelf: "flex-end",
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  nextText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.headingSemiBold,
    fontSize: 14,
  },
});
