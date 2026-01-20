import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface DecorativeElementsProps {
  show?: boolean;
}

export const DecorativeElements: React.FC<DecorativeElementsProps> = ({ show = true }) => {
  const { colors } = useTheme();
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!show) return;

    const createFloatingAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: 1,
            duration: 3000,
            delay,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 3000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = createFloatingAnimation(floatAnim1, 0);
    const anim2 = createFloatingAnimation(floatAnim2, 1000);
    const anim3 = createFloatingAnimation(floatAnim3, 2000);

    anim1.start();
    anim2.start();
    anim3.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
    };
  }, [show, floatAnim1, floatAnim2, floatAnim3]);

  if (!show) return null;

  const translateY1 = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const translateY2 = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const translateY3 = floatAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  return (
    <View style={styles.container} pointerEvents="none">
      <Animated.Text
        style={[
          styles.sakura,
          styles.sakura1,
          { transform: [{ translateY: translateY1 }] },
        ]}
      >
        🌸
      </Animated.Text>
      <Animated.Text
        style={[
          styles.sakura,
          styles.sakura2,
          { transform: [{ translateY: translateY2 }] },
        ]}
      >
        🌸
      </Animated.Text>
      <Animated.Text
        style={[
          styles.sakura,
          styles.sakura3,
          { transform: [{ translateY: translateY3 }] },
        ]}
      >
        🌸
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  sakura: {
    position: 'absolute',
    fontSize: 24,
    opacity: 0.3,
  },
  sakura1: {
    top: '15%',
    left: '10%',
  },
  sakura2: {
    top: '25%',
    right: '15%',
  },
  sakura3: {
    top: '40%',
    left: '20%',
  },
});
