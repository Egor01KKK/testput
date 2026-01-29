import React, { useEffect } from 'react';
import { Text, TextStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface AnimatedTextProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: TextStyle;
  animationType?: 'fadeIn' | 'slideUp' | 'fadeSlideUp';
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  delay = 0,
  duration = 500,
  style,
  animationType = 'fadeSlideUp',
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(animationType.includes('slide') ? 20 : 0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      })
    );

    if (animationType.includes('slide')) {
      translateY.value = withDelay(
        delay,
        withTiming(0, {
          duration,
          easing: Easing.out(Easing.cubic),
        })
      );
    }
  }, [delay, duration, animationType]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {children}
    </Animated.Text>
  );
};

export default AnimatedText;
