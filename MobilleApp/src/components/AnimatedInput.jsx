// src/components/AnimatedInput.jsx
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
  autoComplete = 'off',
  ...rest
}) {
  const [isFocused, setIsFocused]       = useState(false);
  const [isHovered, setIsHovered]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const shakeX    = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;

  // Icon pulse on focus
  useEffect(() => {
    if (isFocused) {
      Animated.sequence([
        Animated.timing(iconScale, { toValue: 1.25, duration: 110, useNativeDriver: true }),
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

  const borderColor = isFocused
    ? '#e62e43'
    : isHovered
    ? 'rgba(230, 46, 67, 0.4)'
    : '#cbd5e1';

  const iconColor  = isFocused ? '#e62e43' : isHovered ? '#e62e43' : '#64748b';
  const labelColor = isFocused ? '#e62e43' : '#475569';

  return (
    <Animated.View style={[{ transform: [{ translateX: shakeX }] }, styles.wrapper, style]}>
      {/* Top Label */}
      {label ? (
        <Text style={[styles.outerLabel, { color: labelColor }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.container,
          {
            borderColor,
            backgroundColor: (isFocused || isHovered) ? '#ffffff' : '#f8fafc',
            shadowOpacity: isFocused ? 0.15 : 0,
          }
        ]}
        onMouseEnter={() => Platform.OS === 'web' && setIsHovered(true)}
        onMouseLeave={() => Platform.OS === 'web' && setIsHovered(false)}
      >
        {/* Left Icon */}
        {icon ? (
          <Animated.Text style={[styles.icon, { color: iconColor, transform: [{ scale: iconScale }] }]}>
            {icon}
          </Animated.Text>
        ) : null}

        {/* Input Text Element */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={showToggle ? !showPassword : secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={Platform.OS === 'web' ? 'off' : autoComplete}
          maxLength={maxLength}
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={`Nhập ${label ? label.toLowerCase() : ''}...`}
          placeholderTextColor="#94a3b8"
          {...rest}
        />

        {/* Password Eye Toggle */}
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
                {showPassword ? 'Ẩn' : 'Hiện'}
              </Text>
            )}
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  outerLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 52,
    shadowColor: '#e62e43',
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 0,
    ...Platform.select({
      web: {
        transitionProperty: 'border-color, background-color, box-shadow',
        transitionDuration: '180ms',
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
  input: {
    flex: 1,
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '600',
    paddingVertical: 0,
    height: '100%',
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
