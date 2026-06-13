import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
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
import { useTheme } from '../../contexts/ThemeContext';

type Message = {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
};

export default function PlantChatScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setMessages([
        {
          id: '1',
          text: 'Ola! Como posso ajudar voce a cuidar melhor da sua planta hoje?',
          isBot: true,
          timestamp: new Date(),
        },
      ]);
      setIsLoading(false);
    }, 650);

    return () => clearTimeout(timeout);
  }, []);

  const addMessage = (text: string, isBot: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addMessage(input, false);
    setInput('');

    // TODO: Implement AI response logic with Supabase/OpenAI
    setTimeout(() => {
      addMessage('Entendo sua dúvida. Vou pesquisar boas práticas para essa planta.', true);
    }, 1000);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 16,
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    backButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    messagesContainer: {
      flex: 1,
      padding: 20,
    },
    messageBubble: {
      maxWidth: '80%',
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
    },
    botBubble: {
      alignSelf: 'flex-start',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: colors.primary,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
    },
    botText: {
      color: colors.text,
    },
    userText: {
      color: '#ffffff',
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 16,
      paddingBottom: 16 + insets.bottom,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      gap: 12,
    },
    input: {
      flex: 1,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text,
    },
    sendButton: {
      backgroundColor: colors.primary,
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  if (isLoading) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <Skeleton width={36} height={36} borderRadius={18} />
          <Skeleton width={170} height={24} borderRadius={10} />
        </View>

        <View style={styles.messagesContainer}>
          <Skeleton width="78%" height={64} borderRadius={16} style={{ marginBottom: 12 }} />
          <Skeleton
            width="62%"
            height={56}
            borderRadius={16}
            style={{ marginBottom: 12, alignSelf: 'flex-end' }}
          />
          <Skeleton width="75%" height={72} borderRadius={16} style={{ marginBottom: 12 }} />
        </View>

        <View style={styles.inputContainer}>
          <Skeleton height={48} borderRadius={24} style={{ flex: 1 }} />
          <Skeleton width={48} height={48} borderRadius={24} />
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Chat com a Planta</Text>
      </View>

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.isBot ? styles.botBubble : styles.userBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.isBot ? styles.botText : styles.userText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Faca uma pergunta..."
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
        />
        <Pressable
          style={styles.sendButton}
          onPress={handleSend}
          disabled={!input.trim()}
        >
          <Ionicons name="send" size={20} color="#ffffff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
