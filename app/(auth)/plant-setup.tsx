import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { usePlants } from '../../contexts/PlantContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function PlantSetupScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addPlant } = usePlants();
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timeout);
  }, []);

  const handleAddPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleBack = () => {
    if (name.trim() || description.trim() || imageUri) {
      Alert.alert(
        'Descartar alterações?',
        'Você tem informações não salvas. Deseja sair sem salvar?',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    const next = new Date();
    next.setDate(next.getDate() + 7);
    await addPlant({
      name: name.trim(),
      description: description.trim(),
      imageUri: imageUri ?? undefined,
      nextWatering: next,
    });
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: 50, paddingHorizontal: 20, paddingBottom: 16,
      backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
      flexDirection: 'row', alignItems: 'center', gap: 12,
    },
    backButton: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { flex: 1, fontSize: 20, fontWeight: 'bold', color: colors.text },
    content: { flex: 1, padding: 24 },
    photoSection: { alignItems: 'center', marginBottom: 32 },
    photoCircle: {
      width: 160, height: 160, borderRadius: 80,
      backgroundColor: colors.surface,
      borderWidth: 3, borderColor: colors.border, borderStyle: 'dashed',
      alignItems: 'center', justifyContent: 'center', marginBottom: 16,
      overflow: 'hidden',
    },
    photoCircleWithImage: { borderStyle: 'solid', borderColor: colors.primary },
    photoImage: { width: '100%', height: '100%' },
    photoText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
    addPhotoButton: { backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
    addPhotoButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '600' },
    inputContainer: { marginBottom: 24 },
    label: { fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 8 },
    labelOptional: { fontSize: 14, color: colors.textSecondary, fontWeight: 'normal' },
    input: {
      backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
      borderRadius: 12, padding: 16, fontSize: 16, color: colors.text,
    },
    textArea: { minHeight: 100, textAlignVertical: 'top' },
    saveButton: { backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
    saveButtonDisabled: { backgroundColor: colors.border },
    saveButtonText: { color: '#ffffff', fontSize: 16, fontWeight: '600' },
    hint: { fontSize: 12, color: colors.textSecondary, marginTop: 8, lineHeight: 18 },
  });

  if (isLoading) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <View style={styles.header}>
          <Skeleton width={36} height={36} borderRadius={18} />
          <Skeleton width={170} height={24} borderRadius={10} />
        </View>
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}>
          <View style={styles.photoSection}>
            <Skeleton width={160} height={160} borderRadius={80} />
            <Skeleton width={140} height={42} borderRadius={24} style={{ marginTop: 8 }} />
          </View>
          <View style={styles.inputContainer}>
            <Skeleton width={110} height={16} style={{ marginBottom: 8 }} />
            <Skeleton height={54} borderRadius={12} />
          </View>
          <View style={styles.inputContainer}>
            <Skeleton width={140} height={16} style={{ marginBottom: 8 }} />
            <Skeleton height={110} borderRadius={12} />
          </View>
          <Skeleton height={54} borderRadius={12} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={handleBack}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Adicionar Planta</Text>
      </View>

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      >
        <View style={styles.photoSection}>
          <Pressable
            style={[styles.photoCircle, imageUri && styles.photoCircleWithImage]}
            onPress={handleAddPhoto}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.photoImage} contentFit="cover" />
            ) : (
              <>
                <Ionicons name="camera-outline" size={64} color={colors.textSecondary} />
                <Text style={styles.photoText}>Toque para adicionar</Text>
              </>
            )}
          </Pressable>
          <Pressable style={styles.addPhotoButton} onPress={handleAddPhoto}>
            <Text style={styles.addPhotoButtonText}>{imageUri ? 'Trocar Foto' : 'Escolher Foto'}</Text>
          </Pressable>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Nome da Planta <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Suculenta da Sala"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
          <Text style={styles.hint}>Dê um nome carinhoso para sua plantinha</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Descrição <Text style={styles.labelOptional}>(opcional)</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: Suculenta pequena perto da janela."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.hint}>
            Adicione informações sobre espécie, localização ou cuidados especiais
          </Text>
        </View>

        <Pressable
          style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!name.trim()}
        >
          <Text style={styles.saveButtonText}>Salvar Planta</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
