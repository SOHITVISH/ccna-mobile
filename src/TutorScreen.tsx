import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { allTopics, curriculum } from "./curriculum";
import { glossary } from "./glossary";
import { lessonContent } from "./lessonContent";
import { colors } from "./theme";

type Message = { id: string; role: "assistant" | "user"; text: string };

const suggestions = [
  "Explain subnet masks simply",
  "When does a switch flood a frame?",
  "Help me understand OSPF neighbors",
  "What does an ACL do?",
];

const stopWords = new Set(["about", "after", "again", "also", "does", "explain", "from", "have", "help", "into", "need", "should", "that", "them", "they", "this", "what", "when", "where", "which", "with", "would", "your"]);

function answerFromCourse(prompt: string, contextTopicId?: string) {
  const normalized = prompt.toLowerCase();
  const words = normalized.match(/[a-z0-9/]+/g) ?? [];
  const keywords = words.filter((word) => word.length > 2 && !stopWords.has(word));
  const currentContext = contextTopicId ? allTopics.find((topic) => topic.id === contextTopicId) : undefined;
  const ranked = allTopics.map((topic) => {
    const corpus = `${topic.title} ${topic.explanation} ${topic.example} ${lessonContent[topic.id].deepDive.join(" ")} ${lessonContent[topic.id].learningObjectives.join(" ")}`.toLowerCase();
    const score = keywords.reduce((total, keyword) => {
      if (keyword === topic.id) return total + 5;
      if (topic.title.toLowerCase().includes(keyword)) return total + 4;
      if (corpus.includes(keyword)) return total + 1;
      return total;
    }, 0);
    return { topic, score };
  }).sort((a, b) => b.score - a.score);

  const selected = currentContext && ranked[0]?.score === 0
    ? currentContext
    : ranked[0]?.score > 0
      ? ranked[0].topic
      : undefined;

  if (!selected || (ranked[0]?.score ?? 0) === 0) {
    return "I can help with the CCNA topics in this app, but I couldn't match that question yet. Try asking about a specific concept such as subnetting, VLAN trunks, OSPF, DHCP, ACLs, or JSON.";
  }

  const details = lessonContent[selected.id];
  const definition = glossary.find((entry) =>
    normalized.includes(entry.term.toLowerCase()) && entry.term.length > 2
  );
  const matchingDomain = curriculum.find((domain) => domain.id === selected.domainId);
  return [
    `${selected.title} — ${matchingDomain?.title ?? selected.domainTitle}`,
    details.deepDive[0],
    `Think of it this way: ${selected.example}`,
    details.deepDive[1],
    definition ? `Term to remember — ${definition.term}: ${definition.definition}` : `Try this next: ${details.lab.title}. ${details.lab.scenario}`,
  ].join("\n\n");
}

export function TutorScreen({ initialTopicId }: { initialTopicId?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [contextTopicId, setContextTopicId] = useState(initialTopicId);
  const contextTopic = contextTopicId ? allTopics.find((topic) => topic.id === contextTopicId) : undefined;

  useEffect(() => {
    setContextTopicId(initialTopicId);
    const topic = initialTopicId ? allTopics.find((item) => item.id === initialTopicId) : undefined;
    setMessages([{
      id: "welcome",
      role: "assistant",
      text: topic
        ? `I'm here to help you work through ${topic.title}. Ask me to rephrase the idea, give another example, or explain a step in its lab.`
        : "Ask about a CCNA networking concept. I'll find the closest lesson in the course and explain it with a practical example.",
    }]);
  }, [initialTopicId]);

  const suggestionsForTopic = useMemo(() => {
    if (!contextTopic) return suggestions.slice(0, 3);
    return [
      `Explain ${contextTopic.title} more simply`,
      `Give me another example of ${contextTopic.title}`,
      `How can I practice ${contextTopic.title}?`,
    ];
  }, [contextTopic]);

  const sendMessage = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;
    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: "user", text },
      { id: `assistant-${Date.now()}`, role: "assistant", text: answerFromCourse(text, contextTopicId) },
    ]);
    setDraft("");
  };

  return (
    <View style={styles.root}>
      <View style={styles.infoCard}>
        <View style={styles.infoIcon}><Ionicons name="sparkles-outline" size={17} color={colors.blue} /></View>
        <View style={styles.infoBody}>
          <Text style={styles.infoTitle}>PacketPath course tutor</Text>
          <Text style={styles.infoCopy}>Offline course search · your questions stay on this device · not a generative AI model</Text>
        </View>
      </View>
      {contextTopic && (
        <View style={styles.contextChip}>
          <Ionicons name="book-outline" size={14} color={colors.blue} />
          <Text style={styles.contextText}>Lesson context: {contextTopic.title}</Text>
          <Pressable onPress={() => setContextTopicId(undefined)} accessibilityRole="button" accessibilityLabel="Clear lesson context">
            <Ionicons name="close-circle" size={16} color={colors.muted} />
          </Pressable>
        </View>
      )}
      <ScrollView style={styles.messages} contentContainerStyle={styles.messageContent} keyboardShouldPersistTaps="handled">
        {messages.map((message) => (
          <View key={message.id} style={[styles.messageRow, message.role === "user" && styles.userRow]}>
            {message.role === "assistant" && <View style={styles.avatar}><Ionicons name="git-network-outline" size={15} color={colors.blue} /></View>}
            <View style={[styles.bubble, message.role === "user" ? styles.userBubble : styles.assistantBubble]}>
              <Text style={[styles.messageText, message.role === "user" && styles.userMessageText]}>{message.text}</Text>
            </View>
          </View>
        ))}
        {messages.length <= 1 && (
          <View style={styles.suggestions}>
            <Text style={styles.suggestionsTitle}>Try asking</Text>
            {suggestionsForTopic.map((suggestion) => (
              <Pressable key={suggestion} onPress={() => sendMessage(suggestion)} style={styles.suggestionChip}>
                <Text style={styles.suggestionText}>{suggestion}</Text>
                <Ionicons name="arrow-up" size={13} color={colors.blue} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      <View style={styles.composer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={() => sendMessage(draft)}
          returnKeyType="send"
          placeholder="Ask about a CCNA concept..."
          placeholderTextColor="#97A1AF"
          style={styles.input}
          accessibilityLabel="Ask the PacketPath course tutor"
        />
        <Pressable
          onPress={() => sendMessage(draft)}
          disabled={!draft.trim()}
          style={[styles.sendButton, !draft.trim() && styles.sendDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Send question"
        >
          <Ionicons name="arrow-up" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { minHeight: 420, flex: 1 },
  infoCard: { flexDirection: "row", alignItems: "flex-start", gap: 9, backgroundColor: colors.paleBlue, borderRadius: 12, padding: 11, marginBottom: 10 },
  infoIcon: { width: 29, height: 29, borderRadius: 9, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  infoBody: { flex: 1 },
  infoTitle: { color: colors.ink, fontSize: 10, fontWeight: "800" },
  infoCopy: { color: "#64748B", fontSize: 8, lineHeight: 12, marginTop: 3 },
  contextChip: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 18, paddingHorizontal: 9, paddingVertical: 6, marginBottom: 8 },
  contextText: { color: "#5D6C82", fontSize: 8, fontWeight: "700" },
  messages: { flex: 1, maxHeight: 460 },
  messageContent: { paddingVertical: 7, gap: 11 },
  messageRow: { flexDirection: "row", alignItems: "flex-start", gap: 7 },
  userRow: { justifyContent: "flex-end" },
  avatar: { width: 26, height: 26, borderRadius: 9, backgroundColor: colors.paleBlue, alignItems: "center", justifyContent: "center" },
  bubble: { maxWidth: "88%", borderRadius: 13, padding: 11 },
  assistantBubble: { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line },
  userBubble: { backgroundColor: colors.blue },
  messageText: { color: "#526177", fontSize: 10, lineHeight: 16 },
  userMessageText: { color: "#FFFFFF" },
  suggestions: { gap: 7, paddingLeft: 33 },
  suggestionsTitle: { color: colors.muted, fontSize: 8, fontWeight: "800", letterSpacing: 0.6 },
  suggestionChip: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 9 },
  suggestionText: { color: "#5D6C82", fontSize: 9, flex: 1 },
  composer: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: colors.line, borderRadius: 13, padding: 6, marginTop: 9 },
  input: { flex: 1, minHeight: 38, paddingHorizontal: 8, color: colors.ink, fontSize: 10 },
  sendButton: { height: 34, width: 34, borderRadius: 11, backgroundColor: colors.blue, alignItems: "center", justifyContent: "center" },
  sendDisabled: { backgroundColor: "#A8BCE1" },
});
