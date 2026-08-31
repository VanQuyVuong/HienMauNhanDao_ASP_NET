// src/components/LiquidTabBar.jsx
// Thanh Menu Liquid Navigation độc đáo — Hiệu ứng bong bóng nâng cao (Elevated Liquid Bubble Tab Bar)
import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const TABS = [
  { key: "TrangChu", label: "Trang chủ", icon: "🏠" },
  { key: "TinTuc", label: "Tin tức", icon: "📰" },
  { key: "ChienDich", label: "Chiến dịch", icon: "📋" },
  { key: "HoSo", label: "Hồ sơ", icon: "👤" },
];

export default function LiquidTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.liquidBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const tabConfig =
            TABS.find((t) => t.key === route.name) || {
              label: options.tabBarLabel || route.name,
              icon: "⭐",
            };

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              {isFocused ? (
                /* Bong bóng Nổi (Liquid Elevated Active Bubble) */
                <View style={styles.activeBubbleContainer}>
                  <LinearGradient
                    colors={["#e62e43", "#c01b30"]}
                    style={styles.activeBubble}
                  >
                    <Text style={styles.activeIcon}>{tabConfig.icon}</Text>
                  </LinearGradient>
                  <Text style={styles.activeLabel}>{tabConfig.label}</Text>
                </View>
              ) : (
                /* Tab Thường (Inactive Tab) */
                <View style={styles.inactiveTab}>
                  <Text style={styles.inactiveIcon}>{tabConfig.icon}</Text>
                  <Text style={styles.inactiveLabel}>{tabConfig.label}</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 20 : Platform.OS === "web" ? 14 : 12,
    left: 16,
    right: 16,
    alignItems: "center",
    zIndex: 99,
  },
  liquidBar: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 30,
    height: 64,
    width: "100%",
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  
  // Active Liquid Bubble Style
  activeBubbleContainer: {
    alignItems: "center",
    top: -18,
  },
  activeBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#f8f9fa",
    shadowColor: "#e62e43",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  activeIcon: {
    fontSize: 22,
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#e62e43",
    marginTop: 2,
  },

  // Inactive Tab Style
  inactiveTab: {
    alignItems: "center",
    justifyContent: "center",
  },
  inactiveIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  inactiveLabel: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#94a3b8",
    marginTop: 2,
  },
});
