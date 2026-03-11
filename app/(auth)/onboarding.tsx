import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hasPhoto, setHasPhoto] = useState(false);

  const handleAddPhoto = () => {
    // TODO: Implement camera/gallery picker
    setHasPhoto(true);
    console.log('Add photo');
  };

  const handleSave = () => {
    if (!name.trim()) {
      console.log('Name is required');
      return;
    }
    // TODO: Save plant to database
    console.log('Saving plant:', { name, description, hasPhoto });
    router.back();
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
    backButtonText: {
      fontSize: 20,
      color: colors.text,
    },
    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    content: {
      flex: 1,
      padding: 24,
    },
    photoSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    photoPlaceholder: {
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: colors.surface,
      borderWidth: 3,
      borderColor: colors.border,
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    photoPlaceholderWithImage: {
      borderStyle: 'solid',
      borderColor: colors.primary,
    },
    photoIcon: {
      fontSize: 48,
      marginBottom: 8,
    },
    photoText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    addPhotoButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
    },
    addPhotoButtonText: {
      color: '#ffffff',
      fontSize: 14,
      fontWeight: '600',
    },
    inputContainer: {
      marginBottom: 24,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    labelOptional: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: 'normal',
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: 'top',
    },
    saveButton: {
      backgroundColor: colors.primary,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    saveButtonDisabled: {
      backgroundColor: colors.border,
    },
    saveButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
    },
    hint: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 8,
      lineHeight: 18,
    },
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🌸 Adicionar Planta</Text>
      </View>

      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.photoSection}>
          <TouchableOpacity
            style={[
              styles.photoPlaceholder,
              hasPhoto && styles.photoPlaceholderWithImage,
            ]}
            onPress={handleAddPhoto}
          >
            <Text style={styles.photoIcon}>{hasPhoto ? '🌱' : '📷'}</Text>
            <Text style={styles.photoText}>
              {hasPhoto ? 'Foto adicionada!' : 'Adicionar foto'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
            <Text style={styles.addPhotoButtonText}>
              {hasPhoto ? 'Trocar Foto' : 'Escolher Foto'}
            </Text>
          </TouchableOpacity>
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
          <Text style={styles.hint}>
            Dê um nome carinhoso para sua plantinha 🌿
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Descrição <Text style={styles.labelOptional}>(opcional)</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ex: Suculenta pequena que fica perto da janela. Gosta de sol e pouca água."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
          <Text style={styles.hint}>
            Adicione informações sobre a espécie, localização ou cuidados especiais
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!name.trim()}
        >
          <Text style={styles.saveButtonText}>Adicionar Planta</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
