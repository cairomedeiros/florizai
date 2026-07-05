import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../components/Skeleton';
import { ScreenHeader } from '../../components/ui';
import { usePlants } from '../../contexts/PlantContext';
import { useTheme } from '../../contexts/ThemeContext';
import * as api from '../../lib/api';

type Message = {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
};

const GREETING: Message = {
  id: 'greeting',
  text: 'Olá! Como posso ajudar você a cuidar melhor da sua planta hoje?',
  isBot: true,
  timestamp: new Date(),
};

const SUGGESTIONS = [
  'Com que frequência devo regar?',
  'Por que as folhas estão amareladas?',
  'Quanto sol ela precisa?',
];

function TypingDots({ color }: { color: string }) {
  const dots = useRef([new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)]).current;

  useEffect(() => {
    const loops = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 160),
          Animated.timing(dot, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 320, useNativeDriver: true }),
          Animated.delay((2 - i) * 160),
        ])
      )
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [dots]);

  return (
    <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 4 }}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 3.5,
            backgroundColor: color,
            opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
            transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
          }}
        />
      ))}
    </View>
  );
}

export default function PlantChatScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { plants } = usePlants();
  const { id: plantId } = useLocalSearchParams<{ id?: string }>();

  const plantName = plants.find((p) => p.id === plantId)?.name;

  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        // No plant context (e.g. opened from DevMenu) -> standalone RAG, no chat.
        if (!plantId) {
          setMessages([GREETING]);
          return;
        }
        // /chat/create makes a NEW chat every call, so reuse the plant's chat id
        // from storage — otherwise each screen open starts over and the history
        // is orphaned in the previous chat.
        const storageKey = `@florizai:chat:${plantId}`;
        const storedId = await AsyncStorage.getItem(storageKey);
        let chat = storedId ? await api.getChat(storedId).catch(() => null) : null;
        if (!chat) {
          chat = await api.createChat(plantId);
          await AsyncStorage.setItem(storageKey, chat.id);
        }
        if (!active) return;
        setChatId(chat.id);
        const history = await api.listMessages(chat.id);
        if (!active) return;
        setMessages(
          history.length
            ? history.map((m) => ({
                id: m.id,
                text: m.content,
                isBot: m.role === 'assistant',
                timestamp: new Date(m.created_at),
              }))
            : [GREETING]
        );
      } catch (e) {
        console.error('Failed to start chat', e);
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [plantId]);

  const addMessage = (text: string, isBot: boolean) => {
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${isBot}`, text, isBot, timestamp: new Date() },
    ]);
  };

  const send = async (raw: string) => {
    const question = raw.trim();
    if (!question || sending) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addMessage(question, false);
    setInput('');
    setSending(true);
    try {
      if (chatId) {
        const reply = await api.sendMessage(chatId, { content: question });
        addMessage(reply.content, true);
      } else {
        const { answer } = await api.ask(question);
        addMessage(answer, true);
      }
    } catch (e) {
      addMessage(e instanceof Error ? e.message : 'Erro ao responder. Tente de novo.', true);
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => send(input);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    messagesContainer: { flex: 1, paddingHorizontal: 20 },
    messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 14 },
    botAvatar: {
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: colors.primarySoft,
      alignItems: 'center', justifyContent: 'center',
    },
    messageBubble: { maxWidth: '78%', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20 },
    botBubble: {
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderBottomLeftRadius: 6,
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary,
      borderBottomRightRadius: 6,
      marginLeft: 'auto',
    },
    messageText: { fontSize: 15.5, lineHeight: 22 },
    botText: { color: colors.text },
    userText: { color: colors.onPrimary },
    timestamp: { fontSize: 10.5, marginTop: 5 },
    botTimestamp: { color: colors.textSecondary },
    userTimestamp: { color: colors.onPrimary, opacity: 0.65, textAlign: 'right' },
    suggestions: { gap: 8, marginTop: 4, marginBottom: 14, marginLeft: 38 },
    suggestionChip: {
      alignSelf: 'flex-start',
      backgroundColor: colors.primarySoft,
      borderRadius: 999,
      paddingVertical: 9,
      paddingHorizontal: 15,
    },
    suggestionText: { color: colors.primary, fontSize: 13.5, fontWeight: '600' },
    inputContainer: {
      flexDirection: 'row',
      padding: 14,
      paddingBottom: 14 + insets.bottom,
      backgroundColor: colors.background,
      alignItems: 'flex-end',
      gap: 10,
    },
    input: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: colors.border,
      borderRadius: 24,
      paddingHorizontal: 18,
      paddingVertical: 12,
      fontSize: 15.5,
      color: colors.text,
      maxHeight: 120,
    },
    sendButton: {
      backgroundColor: colors.primary,
      width: 46,
      height: 46,
      borderRadius: 23,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: { backgroundColor: colors.surfaceAlt },
  });

  const BotAvatar = () => (
    <View style={styles.botAvatar}>
      <Ionicons name="leaf" size={15} color={colors.primary} />
    </View>
  );

  if (isLoading) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={0}
      >
        <ScreenHeader title={plantName ?? 'Assistente'} />
        <View style={[styles.messagesContainer, { paddingTop: 8 }]}>
          <Skeleton width="78%" height={64} borderRadius={20} style={{ marginBottom: 14 }} />
          <Skeleton width="62%" height={56} borderRadius={20} style={{ marginBottom: 14, alignSelf: 'flex-end' }} />
          <Skeleton width="75%" height={72} borderRadius={20} style={{ marginBottom: 14 }} />
        </View>
        <View style={styles.inputContainer}>
          <Skeleton height={46} borderRadius={23} style={{ flex: 1 }} />
          <Skeleton width={46} height={46} borderRadius={23} />
        </View>
      </KeyboardAvoidingView>
    );
  }

  const showSuggestions = messages.length <= 1 && !sending;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      <ScreenHeader title={plantName ?? 'Assistente'} />

      <ScrollView
        ref={scrollRef}
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) =>
          message.isBot ? (
            <View key={message.id} style={styles.messageRow}>
              <BotAvatar />
              <View style={[styles.messageBubble, styles.botBubble]}>
                <Text style={[styles.messageText, styles.botText]}>{message.text}</Text>
                <Text style={[styles.timestamp, styles.botTimestamp]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          ) : (
            <View key={message.id} style={styles.messageRow}>
              <View style={[styles.messageBubble, styles.userBubble]}>
                <Text style={[styles.messageText, styles.userText]}>{message.text}</Text>
                <Text style={[styles.timestamp, styles.userTimestamp]}>
                  {formatTime(message.timestamp)}
                </Text>
              </View>
            </View>
          )
        )}

        {showSuggestions && (
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                style={({ pressed }) => [styles.suggestionChip, pressed && { opacity: 0.65 }]}
                onPress={() => send(s)}
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </Pressable>
            ))}
          </View>
        )}

        {sending && (
          <View style={styles.messageRow}>
            <BotAvatar />
            <View style={[styles.messageBubble, styles.botBubble]}>
              <TypingDots color={colors.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Faça uma pergunta..."
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
        />
        <Pressable
          style={({ pressed }) => [
            styles.sendButton,
            (!input.trim() || sending) && styles.sendButtonDisabled,
            pressed && { transform: [{ scale: 0.92 }] },
          ]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          <Ionicons
            name="arrow-up"
            size={21}
            color={!input.trim() || sending ? colors.textSecondary : colors.onPrimary}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
