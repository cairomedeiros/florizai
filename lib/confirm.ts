import { Alert, Platform } from 'react-native';

// react-native-web's Alert.alert ignores buttons/callbacks, so a confirm dialog
// silently does nothing on web. Fall back to the browser's native window.confirm.
export function confirmDestructive(
  title: string,
  message: string,
  confirmLabel: string,
  onConfirm: () => void | Promise<void>
) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancelar', style: 'cancel' },
    { text: confirmLabel, style: 'destructive', onPress: () => onConfirm() },
  ]);
}
