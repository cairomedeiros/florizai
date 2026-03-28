import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastState = 'offline' | 'restored' | 'hidden';

export function NetworkToast() {
  const insets = useSafeAreaInsets();
  const [state, setState] = useState<ToastState>('hidden');
  const translateY = useRef(new Animated.Value(-80)).current;
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  const slideIn = () => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const slideOut = () => {
    Animated.timing(translateY, {
      toValue: -80,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setState('hidden'));
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((netState) => {
      const connected = netState.isConnected && netState.isInternetReachable !== false;

      if (isFirstRender.current) {
        isFirstRender.current = false;
        if (!connected) {
          setState('offline');
          slideIn();
        }
        return;
      }

      if (restoreTimer.current) {
        clearTimeout(restoreTimer.current);
        restoreTimer.current = null;
      }

      if (!connected) {
        setState('offline');
        slideIn();
      } else {
        setState('restored');
        slideIn();
        restoreTimer.current = setTimeout(() => {
          slideOut();
        }, 2500);
      }
    });

    return () => {
      unsubscribe();
      if (restoreTimer.current) clearTimeout(restoreTimer.current);
    };
  }, []);

  if (state === 'hidden') return null;

  const isOffline = state === 'offline';

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 8, transform: [{ translateY }] },
        isOffline ? styles.offlineBg : styles.restoredBg,
      ]}
    >
      <View style={styles.content}>
        <Ionicons
          name={isOffline ? 'wifi-outline' : 'wifi'}
          size={18}
          color="#fff"
          style={styles.icon}
        />
        <Text style={styles.text}>
          {isOffline ? 'Voce esta sem internet' : 'Conexao restaurada'}
        </Text>
        {isOffline && (
          <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" style={styles.spinner} />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 9999,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  offlineBg: {
    backgroundColor: '#1a1a2e',
  },
  restoredBg: {
    backgroundColor: '#1a7a4a',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  spinner: {
    marginLeft: 8,
  },
});
