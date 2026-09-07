import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const AnimatedBackground = () => {
  const orb1X = useSharedValue(0);
  const orb1Y = useSharedValue(0);
  const orb2X = useSharedValue(0);
  const orb2Y = useSharedValue(0);

  useEffect(() => {
    orb1X.value = withRepeat(
      withSequence(
        withTiming(100, { duration: 15000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-50, { duration: 15000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 15000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    orb1Y.value = withRepeat(
      withSequence(
        withTiming(100, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
        withTiming(-50, { duration: 12000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 12000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    orb2X.value = withRepeat(
      withSequence(
        withTiming(-120, { duration: 18000, easing: Easing.inOut(Easing.ease) }),
        withTiming(80, { duration: 18000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 18000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    orb2Y.value = withRepeat(
      withSequence(
        withTiming(-150, { duration: 20000, easing: Easing.inOut(Easing.ease) }),
        withTiming(50, { duration: 20000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 20000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const orb1Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: orb1X.value }, { translateY: orb1Y.value }],
    };
  });

  const orb2Style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: orb2X.value }, { translateY: orb2Y.value }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.baseBg} />
      <Animated.View style={[styles.orb1, orb1Style]}>
        <LinearGradient
          colors={['#ff4d4f', '#e62e43', 'rgba(230,46,67,0)']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      <Animated.View style={[styles.orb2, orb2Style]}>
        <LinearGradient
          colors={['#ff7875', '#c01b30', 'rgba(192,27,48,0)']}
          style={styles.gradient}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </Animated.View>
      <View style={styles.overlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  baseBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f8fafc',
  },
  orb1: {
    position: 'absolute',
    top: -height * 0.1,
    left: -width * 0.2,
    width: width * 1.4,
    height: width * 1.4,
    opacity: 0.15,
  },
  orb2: {
    position: 'absolute',
    bottom: -height * 0.1,
    right: -width * 0.3,
    width: width * 1.5,
    height: width * 1.5,
    opacity: 0.15,
  },
  gradient: {
    flex: 1,
    borderRadius: 9999,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
});

export default AnimatedBackground;
