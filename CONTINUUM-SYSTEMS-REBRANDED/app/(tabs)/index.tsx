// app/(tabs)/index.tsx
import React from "react";
import { StyleSheet, Text, View, Image, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "../../constants/colors";

const heroImage = require("../../assets/images/HEROIMAGE.jpg");
const logoImage = require("../../assets/images/LOGOVALT.png");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  // Keeps logo safely below the Dynamic Island / notch
  const topPad = Platform.OS === "web" ? 67 : Math.max(insets.top + 12, 24);

  // Leave room for the bottom tabs so nothing gets clipped
  const bottomPad = Math.max(insets.bottom, 14) + 92;

  const handleAskMentor = () => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.push("/(tabs)/talk");
  };

  const handleQuickAccess = (tab: string) => {
    if (Platform.OS !== "web") {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/(tabs)/${tab}` as any);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image source={logoImage} style={styles.logo} resizeMode="contain" />
          <Text style={styles.poweredBy}>Powered by VALT</Text>
        </View>

        <View style={styles.heroCard}>
          <Image source={heroImage} style={styles.heroImage} resizeMode="cover" />
        </View>

        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>CONTINUUM™</Text>
          <Text style={styles.heroSubtitle}>Advanced MIG Intelligence</Text>
        </View>

        <View style={styles.ctaContainer}>
          <Pressable
            onPress={handleAskMentor}
            style={({ pressed }) => [
              styles.ctaButton,
              pressed ? styles.ctaButtonPressed : null,
            ]}
          >
            <Ionicons name="chatbubble-ellipses" size={20} color={Colors.white} />
            <Text style={styles.ctaText}>ASK YOUR EXPERT</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: 20 },

  logoContainer: { alignItems: "center", marginBottom: 12 },
  logo: { width: 195, height: 68 },
  poweredBy: {
    fontSize: 12,
    color: "#999999",
    marginTop: 4,
    textAlign: "center",
  },


  heroCard: {
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: Colors.card,
    marginBottom: 20,
  },
  heroImage: { width: "100%", height: 280 },

  heroTextContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 34,
    color: "#fff",
    letterSpacing: 3,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    color: "#cfcfcf",
    textAlign: "center",
  },

  ctaContainer: { marginTop: 10, marginBottom: 14 },
  ctaButton: {
    backgroundColor: Colors.primary,
    borderRadius: 34,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaButtonPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  ctaText: {
    fontSize: 16,
    color: Colors.white,
    letterSpacing: 0.5,
    fontWeight: "900",
  },
});