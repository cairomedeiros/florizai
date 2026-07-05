import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
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
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Skeleton } from '../../components/Skeleton';
import { Input, PrimaryButton, ScreenHeader } from '../../components/ui';
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
  const [saving, setSaving] = useState(false);

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
    if (!name.trim() || saving) return; // guard re-entry: no double-create
    setSaving(true);
    const next = new Date();
    next.setDate(next.getDate() + 7);
    try {
      await addPlant({
        name: name.trim(),
        description: description.trim(),
        imageUri: imageUri ?? undefined,
        nextWatering: next,
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      setSaving(false);
      Alert.alert('Erro ao salvar', e instanceof Error ? e.message : 'Tente de novo.');
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flex: 1, paddingHorizontal: 24, paddingTop: 8 },
    photoSection: { alignItems: 'center', marginBottom: 30 },
    photoBox: {
      width: 168, height: 168, borderRadius: 32,
      backgroundColor: colors.primarySoft,
      borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
      alignItems: 'center', justifyContent: 'center', marginBottom: 14,
      overflow: 'hidden',
    },
    photoBoxWithImage: { borderStyle: 'solid', borderColor: colors.primary },
    photoImage: { width: '100%', height: '100%' },
    photoText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 8 },
    changePhoto: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingVertical: 8, paddingHorizontal: 16,
      borderRadius: 999, backgroundColor: colors.surface,
      borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border,
    },
    changePhotoText: { color: colors.primary, fontSize: 13.5, fontWeight: '700' },
    inputContainer: { marginBottom: 22 },
  });

  if (isLoading) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScreenHeader title="Nova planta" onBack={handleBack} />
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}>
          <View style={styles.photoSection}>
            <Skeleton width={168} height={168} borderRadius={32} />
            <Skeleton width={130} height={36} borderRadius={18} style={{ marginTop: 14 }} />
          </View>
          <View style={styles.inputContainer}>
            <Skeleton width={110} height={14} style={{ marginBottom: 8 }} />
            <Skeleton height={54} borderRadius={16} />
          </View>
          <View style={styles.inputContainer}>
            <Skeleton width={140} height={14} style={{ marginBottom: 8 }} />
            <Skeleton height={110} borderRadius={16} />
          </View>
          <Skeleton height={54} borderRadius={18} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScreenHeader title="Nova planta" onBack={handleBack} />

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      >
        <View style={styles.photoSection}>
          <Pressable
            style={[styles.photoBox, imageUri && styles.photoBoxWithImage]}
            onPress={handleAddPhoto}
          >
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.photoImage} contentFit="cover" />
            ) : (
              <>
                <Ionicons name="camera-outline" size={52} color={colors.primary} />
                <Text style={styles.photoText}>Toque para adicionar{'\n'}uma foto</Text>
              </>
            )}
          </Pressable>
          <Pressable style={styles.changePhoto} onPress={handleAddPhoto}>
            <Ionicons name="image-outline" size={15} color={colors.primary} />
            <Text style={styles.changePhotoText}>{imageUri ? 'Trocar foto' : 'Escolher foto'}</Text>
          </Pressable>
        </View>

        <Input
          label="Nome da planta"
          placeholder="Ex: Suculenta da Sala"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          hint="Dê um nome carinhoso para sua plantinha"
        />

        <Input
          label="Descrição"
          optional
          placeholder="Ex: Suculenta pequena perto da janela."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          hint="Adicione informações sobre espécie, localização ou cuidados especiais"
        />

        <PrimaryButton
          label={saving ? 'Salvando...' : 'Salvar planta'}
          onPress={handleSave}
          disabled={!name.trim()}
          loading={saving}
          style={{ marginTop: 8 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
