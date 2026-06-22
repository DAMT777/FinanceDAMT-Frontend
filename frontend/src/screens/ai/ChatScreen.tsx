import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
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
import { useChatMessage } from "../../hooks/useAI";
import { ChatMessageDto } from "../../types/api";

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
  const chatMutation = useChatMessage();

  const suggestions = [t("ai.suggestion1"), t("ai.suggestion2"), t("ai.suggestion3")];

  // The backend agent decides what to do with each message: generate a report,
  // store a money movement described in natural language, or chat normally.
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

      setMessages((prev) => [
        ...prev,
        {
          ...createMessage("assistant", response.response),
          timestamp: response.history[response.history.length - 1]?.timestamp ?? new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [...prev, createMessage("assistant", t("ai.couldNotReach"))]);
    }
  };

  const hasText = input.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <LinearGradient colors={[colors.accent, "#FF6B9D"]} style={styles.avatar}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          </LinearGradient>

          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.headerTitle}>{t("ai.title")}</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.headerSubtitle}>{t("ai.poweredBy")} · {t("ai.updatedNow")}</Text>
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
        style={{ flex: 1 }}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesWrap}
        renderItem={({ item }) => {
          if (item.role === "user") {
            return (
              <View style={styles.userRow}>
                <View style={styles.userBubble}>
                  <Text style={styles.messageText}>{item.content}</Text>
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
                <Text style={styles.messageText}>
                  {parseMessageParts(item.content).map((part, index) => (
                    <Text
                      key={`${part.text}-${index}`}
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
                </Text>
              </View>
            </View>
          );
        }}
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

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.inputBar}>
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
    </View>
  );
}

function TouchableChip({ text, onPress }: { text: string; onPress: () => void }) {
  return (
    <Pressable style={styles.chip} onPress={onPress}>
      <Text style={styles.chipText}>{text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.bgCardBorder,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontFamily: typography.fontFamily.headingBold,
  },
  onlineRow: {
    marginTop: 2,
    flexDirection: "row",
    alignItems: "center",
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 4,
  },
  headerSubtitle: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
  },
  messagesWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  userRow: {
    alignItems: "flex-end",
  },
  userBubble: {
    maxWidth: "72%",
    backgroundColor: "#0D2818",
    borderWidth: 1,
    borderColor: "rgba(0,214,143,0.2)",
    borderRadius: 16,
    borderBottomRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  aiRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  aiMiniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  aiBubble: {
    maxWidth: "82%",
    backgroundColor: colors.bgCard,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  messageText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
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
  emptyWrap: {
    marginTop: 36,
    alignItems: "center",
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.bodyMedium,
  },
  emptySub: {
    marginTop: 4,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: typography.fontFamily.body,
  },
  chipsContainer: {
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 8,
  },
  chip: {
    height: 32,
    paddingHorizontal: 12,
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
    fontSize: 12,
    color: colors.textSecondary,
  },
  inputBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    marginRight: 8,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: typography.fontFamily.body,
  },
  sendBtn: {
    marginLeft: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: {
    backgroundColor: colors.primary,
  },
  sendBtnEmpty: {
    backgroundColor: colors.bgCardAlt,
  },
});
