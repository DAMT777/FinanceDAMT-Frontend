import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { typography } from "../../constants/typography";
import { moderateScale, scale } from "../../utils/responsive";
import { useChatMessage } from "../../hooks/useAI";
import { ChatMessageDto } from "../../types/api";
import { makeStyles } from "../../theme/styles";

type ChatUiMessage = ChatMessageDto & { id: string };

function parseMessageParts(content: string): Array<{ text: string; style?: "moneyPositive" | "moneyNegative" | "percent" }> {
  const regex = /(\$\d[\d.,]*)|((?:\d{1,3})?%)/g;
  const parts: Array<{ text: string; style?: "moneyPositive" | "moneyNegative" | "percent" }> = [];
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > last) {
      parts.push({ text: content.slice(last, match.index) });
    }
    const token = match[0];
    if (token.includes("%")) {
      parts.push({ text: token, style: "percent" });
    } else {
      parts.push({ text: token, style: token.startsWith("-$") ? "moneyNegative" : "moneyPositive" });
    }
    last = match.index + token.length;
  }

  if (last < content.length) {
    parts.push({ text: content.slice(last) });
  }

  return parts;
}

function createMessage(role: "user" | "assistant", content: string): ChatUiMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}

export default function ChatScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  // Id of the assistant message currently revealing with the typewriter effect.
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const listRef = useRef<FlatList<ChatUiMessage>>(null);
  const chatMutation = useChatMessage();

  const suggestions = [t("ai.suggestion1"), t("ai.suggestion2"), t("ai.suggestion3")];

  const onSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || chatMutation.isPending) return;

    const userMessage = createMessage("user", trimmed);
    const historySnapshot = messages.map(({ role, content, timestamp }) => ({ role, content, timestamp }));
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await chatMutation.mutateAsync({
        message: userMessage.content,
        history: historySnapshot,
      });

      const assistantMessage: ChatUiMessage = {
        ...createMessage("assistant", response.response),
        timestamp: response.history[response.history.length - 1]?.timestamp ?? new Date().toISOString(),
      };
      setAnimatingId(assistantMessage.id);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      setMessages((prev) => [...prev, createMessage("assistant", t("ai.couldNotReach"))]);
    }
  };

  const hasText = input.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <LinearGradient colors={[colors.accent, "#FF6B9D"]} style={styles.avatar}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          </LinearGradient>

          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.headerTitle}>{t("ai.title")}</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSubtitle}>
                {chatMutation.isPending ? t("ai.typing") : `${t("ai.poweredBy")} · ${t("ai.updatedNow")}`}
              </Text>
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t("common.delete")}
            onPress={() => setMessages([])}
          >
            <Ionicons name="trash-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesWrap}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => {
          if (item.role === "user") {
            return (
              <View style={styles.userRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.userMessageText}>{item.content}</Text>
                </View>
              </View>
            );
          }

          return (
            <View style={styles.aiRow}>
              <View style={styles.aiMiniAvatar}>
                <Ionicons name="sparkles" size={12} color="#FFFFFF" />
              </View>
              <View style={styles.aiBubble}>
                <AiMessageText
                  content={item.content}
                  animate={item.id === animatingId}
                  onDone={() => setAnimatingId((current) => (current === item.id ? null : current))}
                />
              </View>
            </View>
          );
        }}
        ListFooterComponent={chatMutation.isPending ? <TypingBubble /> : null}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>{t("ai.emptyTitle")}</Text>
            <Text style={styles.emptySub}>{t("ai.emptySubtitle")}</Text>
          </View>
        }
      />

      <View style={{ height: 48 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
          style={{ height: 48 }}
        >
          {suggestions.map((s) => (
            <TouchableChip key={s} text={s} onPress={() => setInput(s)} />
          ))}
        </ScrollView>
      </View>

      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
          <View style={styles.inputWrap}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t("ai.typeMessage")}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              multiline
            />
            <Ionicons name="mic-outline" size={18} color={colors.textSecondary} />
          </View>

          <Pressable
            style={[styles.sendBtn, hasText ? styles.sendBtnActive : styles.sendBtnEmpty]}
            accessibilityRole="button"
            accessibilityLabel={t("ai.title")}
            onPress={() => void onSend()}
            disabled={!hasText || chatMutation.isPending}
          >
            <Ionicons
              name="send"
              size={16}
              color={hasText ? colors.textInverse : colors.textSecondary}
            />
          </Pressable>
        </View>
    </KeyboardAvoidingView>
  );
}

function TouchableChip({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.chipText}>{text}</Text>
    </Pressable>
  );
}

// Reveals the assistant's message character-by-character (typewriter effect).
// Only the newest reply animates; older messages render in full immediately.
function AiMessageText({ content, animate, onDone }: { content: string; animate: boolean; onDone: () => void }) {
  const [count, setCount] = useState(animate ? 0 : content.length);

  useEffect(() => {
    if (!animate) {
      setCount(content.length);
      return;
    }
    setCount(0);
    const charsPerTick = Math.max(2, Math.round(content.length / 140));
    let shown = 0;
    const timer = setInterval(() => {
      shown += charsPerTick;
      if (shown >= content.length) {
        setCount(content.length);
        clearInterval(timer);
        onDone();
      } else {
        setCount(shown);
      }
    }, 18);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animate, content]);

  const visible = content.slice(0, count);
  const typing = animate && count < content.length;

  return (
    <Text style={styles.messageText}>
      {parseMessageParts(visible).map((part, index) => (
        <Text
          key={`${index}-${part.text}`}
          style={
            part.style === "moneyPositive"
              ? styles.moneyPositive
              : part.style === "moneyNegative"
                ? styles.moneyNegative
                : part.style === "percent"
                  ? styles.percent
                  : undefined
          }
        >
          {part.text}
        </Text>
      ))}
      {typing ? <Text style={styles.caret}>▋</Text> : null}
    </Text>
  );
}

// "AI is typing" bubble with three pulsing dots, shown while awaiting the reply.
function TypingBubble() {
  return (
    <View style={styles.aiRow}>
      <View style={styles.aiMiniAvatar}>
        <Ionicons name="sparkles" size={12} color="#FFFFFF" />
      </View>
      <View style={[styles.aiBubble, styles.typingBubble]}>
        <TypingDots />
      </View>
    </View>
  );
}

function TypingDots() {
  const d1 = useRef(new Animated.Value(0.3)).current;
  const d2 = useRef(new Animated.Value(0.3)).current;
  const d3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const pulse = (value: Animated.Value, startDelay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(startDelay),
          Animated.timing(value, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.delay(300 - startDelay),
        ]),
      );
    const anims = [pulse(d1, 0), pulse(d2, 150), pulse(d3, 300)];
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [d1, d2, d3]);

  return (
    <View style={styles.typingDots}>
      <Animated.View style={[styles.typingDot, { opacity: d1 }]} />
      <Animated.View style={[styles.typingDot, { opacity: d2 }]} />
      <Animated.View style={[styles.typingDot, { opacity: d3 }]} />
    </View>
  );
}

const styles = makeStyles((colors) => ({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: scale(20),
    paddingBottom: scale(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: moderateScale(16),
    fontFamily: typography.fontFamily.headingBold,
  },
  onlineRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  onlineDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: colors.primary,
    marginRight: scale(4),
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: moderateScale(12),
    fontFamily: typography.fontFamily.body,
  },
  messagesWrap: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    gap: scale(10),
  },
  userRow: {
    alignItems: "flex-end",
  },
  userBubble: {
    maxWidth: "72%",
    backgroundColor: "#0D2818",
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.2)",
    borderRadius: scale(16),
    borderBottomRightRadius: scale(4),
    paddingHorizontal: scale(14),
    paddingVertical: scale(10),
  },
  aiRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: scale(8),
  },
  aiMiniAvatar: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: scale(4),
  },
  aiBubble: {
    maxWidth: "82%",
    backgroundColor: colors.bgCard,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    borderRadius: scale(16),
    borderBottomLeftRadius: scale(4),
    paddingHorizontal: scale(14),
    paddingVertical: scale(10),
  },
  messageText: {
    color: colors.textPrimary,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    fontFamily: typography.fontFamily.body,
  },
  userMessageText: {
    color: "#F0F0FF",
    fontSize: moderateScale(14),
    lineHeight: moderateScale(22),
    fontFamily: typography.fontFamily.body,
  },
  moneyPositive: {
    color: colors.income,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  moneyNegative: {
    color: colors.expense,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  percent: {
    color: colors.warning,
    fontFamily: typography.fontFamily.monoSemiBold,
  },
  caret: {
    color: colors.accent,
    fontFamily: typography.fontFamily.body,
  },
  typingBubble: {
    paddingVertical: scale(14),
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: scale(5),
  },
  typingDot: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(4),
    backgroundColor: colors.textSecondary,
  },
  emptyWrap: {
    marginTop: scale(36),
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: moderateScale(14),
    fontFamily: typography.fontFamily.bodyMedium,
  },
  emptySub: {
    marginTop: scale(4),
    color: colors.textSecondary,
    fontSize: moderateScale(12),
    fontFamily: typography.fontFamily.body,
  },
  chipsContainer: {
    paddingHorizontal: scale(16),
    alignItems: "center",
    gap: scale(8),
  },
  chip: {
    height: scale(32),
    paddingHorizontal: scale(12),
    borderRadius: 99,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    backgroundColor: colors.bgCard,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  chipText: {
    fontFamily: typography.fontFamily.body,
    fontSize: moderateScale(12),
    color: colors.textSecondary,
  },
  inputBar: {
    paddingHorizontal: scale(16),
    paddingVertical: scale(12),
    borderTopWidth: 1,
    borderTopColor: colors.bgCardBorder,
    flexDirection: "row",
    alignItems: "center",
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.bgCardBorder,
    borderRadius: scale(24),
    paddingHorizontal: scale(16),
    paddingVertical: scale(10),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    marginRight: scale(8),
    color: colors.textPrimary,
    fontSize: moderateScale(14),
    fontFamily: typography.fontFamily.body,
  },
  sendBtn: {
    marginLeft: scale(10),
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: {
    backgroundColor: colors.primary,
  },
  sendBtnEmpty: {
    backgroundColor: colors.bgCardAlt,
  },
}));
