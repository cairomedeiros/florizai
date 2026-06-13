import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useAnimatedList(count: number, staggerMs = 60) {
  const anims = useRef<Animated.Value[]>([]);

  if (anims.current.length !== count) {
    anims.current = Array.from({ length: count }, () => new Animated.Value(0));
  }

  useEffect(() => {
    if (count === 0) return;
    anims.current.forEach((a) => a.setValue(0));
    Animated.stagger(
      staggerMs,
      anims.current.map((a) =>
        Animated.spring(a, { toValue: 1, useNativeDriver: true, tension: 60, friction: 10 })
      )
    ).start();
  }, [count, staggerMs]);

  return anims.current;
}
