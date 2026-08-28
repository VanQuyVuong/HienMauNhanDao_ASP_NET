// src/components/AnimatedInput.jsx
// Component o nhap lieu tai su dung voi 3 hieu ung:
//   1. Floating Label  - nhan noi truot len khi focus hoac co gia tri
//   2. Shake on Error  - lac trai phai moi khi shakeKey tang (sau submit sai)
//   3. Icon Animation  - icon pulse + doi mau do khi focus

import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
} from 'react-native';

export default function AnimatedInput({
  label,
  icon,
  value,
  onChangeText,
  showToggle = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  maxLength,
  shakeKey = 0,
  style,
  ...rest
}) {
  const [isFocused, setIsFocused]       = useState(false);
  const [isHovered, setIsHovered]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isFloating = isFocused || !!value;

  const labelProgress = useRef(new Animated.Value(isFloating ? 1 : 0)).current;
  const shakeX        = useRef(new Animated.Value(0)).current;
  const iconScale     = useRef(new Animated.Value(1)).current;

  // Floating label animation
  useEffect(() => {
    Animated.timing(labelProgress, {
      toValue: isFloating ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isFloating]);

  // Icon pulse on focus
  useEffect(() => {
    if (isFocused) {
      Animated.sequence([
        Animated.timing(iconScale, { toValue: 1.3,  duration: 110, useNativeDriver: true }),
        Animated.timing(iconScale, { toValue: 1.0,  duration: 110, useNativeDriver: true }),
      ]).start();
    }
  }, [isFocused]);

  // Shake on error
  useEffect(() => {
    if (shakeKey === 0) return;
    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -10, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:   8, duration: 55, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  -5, duration: 45, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:   0, duration: 45, useNativeDriver: true }),
    ]).start();
  }, [shakeKey]);

  const labelTop      = labelProgress.interpolate({ inputRange: [0, 1], outputRange: [17, -10] });
  const labelFontSize = labelProgress.interpolate({ inputRange: [0, 1], outputRange: [15, 11]  });

  const borderColor = isFocused
    ? '#e62e43'
    : isHovered
    ? 'rgba(230, 46, 67, 0.4)'
    : '#e8ecef';

  const iconColor  = isFocused ? '#e62e43' : isHovered ? 'rgba(230, 46, 67, 0.6)' : '#bbb';
  const labelColor = isFloating ? '#e62e43' : '#aaa';

  return (
    <Animated.View style={[{ transform: [{ translateX: shakeX }] }, style]}>
      <View
        style={[
          styles.container,
          {
            borderColor,
            backgroundColor: (isFocused || isHovered) ? '#fff' : '#f8f9fa',
            shadowOpacity: isFocused ? 0.15 : 0,
          }
        ]}
        onMouseEnter={() => Platform.OS === 'web' && setIsHovered(true)}
        onMouseLeave={() => Platform.OS === 'web' && setIsHovered(false)}
      >
        <Animated.Text style={[styles.icon, { color: iconColor, transform: [{ scale: iconScale }] }]}>
          {icon}
        </Animated.Text>

        <View style={styles.inputArea}>
          <Animated.Text
            style={[
              styles.label,
              {
                top: labelTop,
                fontSize: labelFontSize,
                color: labelColor,
                backgroundColor: isFloating ? '#fff' : 'transparent',
                paddingHorizontal: isFloating ? 3 : 0,
              }
            ]}
            pointerEvents="none"
          >
            {label}
          </Animated.Text>

          <TextInput
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={showToggle ? !showPassword : secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            maxLength={maxLength}
            style={styles.input}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder=""
            placeholderTextColor="transparent"
            {...rest}
          />
        </View>

        {showToggle && (
          <Pressable
            onPress={() => setShowPassword(p => !p)}
            style={({ pressed }) => [styles.eyeButton, { transform: [{ scale: pressed ? 0.88 : 1 }] }]}
          >
            {({ hovered }) => (
              <Text style={[
                styles.eyeText,
                (Platform.OS === 'web' && hovered) && { color: '#c01b30', textDecorationLine: 'underline' }
              ]}>
                {showPassword ? 'An' : 'Hien'}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 16,
    height: 58,
    shadowColor: '#e62e43',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 0,
    ...Platform.select({
      web: {
        transitionProperty: 'border-color, background-color, box-shadow',
        transitionDuration: '180ms',
        overflow: 'visible',
      }
    })
  },
  icon: {
    fontSize: 18,
    marginRight: 10,
    ...Platform.select({
      web: { transitionProperty: 'color', transitionDuration: '180ms' }
    })
  },
  inputArea: {
    flex: 1,
    position: 'relative',
    height: '100%',
    justifyContent: 'center',
    ...Platform.select({ web: { overflow: 'visible' } })
  },
  label: {
    position: 'absolute',
    left: 0,
    fontWeight: '500',
    zIndex: 5,
    ...Platform.select({
      web: {
        pointerEvents: 'none',
        userSelect: 'none',
      }
    })
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a2e',
    fontWeight: '600',
    paddingTop: 6,
    ...Platform.select({ web: { outlineStyle: 'none' } })
  },
  eyeButton: { paddingLeft: 8, paddingVertical: 4 },
  eyeText: {
    color: '#e62e43',
    fontSize: 13,
    fontWeight: 'bold',
    ...Platform.select({
      web: { transitionProperty: 'color', transitionDuration: '150ms' }
    })
  },
});
