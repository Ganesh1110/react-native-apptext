import React, { useState } from "react";
import {
  View,
  Text as RNText,
  StyleSheet,
  Button,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Switch,
} from "react-native";
import AppText, {
  AppTextProvider,
  LocaleProvider,
  useLang,
  RTLProvider,
} from "react-native-text-kit";

const translations = {
  en: {
    app_title: "React Native Text Kit",
    greeting: "Hello, {{name}}!",
    items_count: "{count, plural, one {# item} other {# items}}",
    welcome: "Welcome to the demo",
    typography: "Typography",
    animations: "Animations",
    rtl_demo: "RTL Demo",
    theme: "Theme",
    switch_language: "Switch Language",
    try_it: "Try it!",
    features: "Features",
    display_large: "Display Large",
    headline_medium: "Headline Medium",
    body_large: "Body Large",
    label_small: "Label Small",
    fade_in: "Fade In",
    bounce: "Bounce",
    typewriter_type: " typewriter",
    dark_mode: "Dark Mode",
  },
  es: {
    app_title: "React Native Text Kit",
    greeting: "¡Hola, {{name}}!",
    items_count: "{count, plural, one {# elemento} other {# elementos}}",
    welcome: "Bienvenido a la demo",
    typography: "Tipografía",
    animations: "Animaciones",
    rtl_demo: "Demo RTL",
    theme: "Tema",
    switch_language: "Cambiar Idioma",
    try_it: "¡Pruébalo!",
    features: "Características",
    display_large: "Título Grande",
    headline_medium: "Encabezado Mediano",
    body_large: "Texto Normal",
    label_small: "Etiqueta Pequeña",
    fade_in: "Aparecer",
    bounce: "Rebotar",
    typewriter_type: "máquina de escribir",
    dark_mode: "Modo Oscuro",
  },
  ar: {
    app_title: "React Native Text Kit",
    greeting: "مرحباً، {{name}}!",
    items_count: "{count, plural, zero {لا عناصر} one {# عنصر} other {# عناصر}}",
    welcome: "مرحباً بك في العرض",
    typography: "الخطوط",
    animations: "الرسوم المتحركة",
    rtl_demo: "عرض من اليمين لليسار",
    theme: "السمة",
    switch_language: "تغيير اللغة",
    try_it: "جربه!",
    features: "الميزات",
    display_large: "عنوان كبير",
    headline_medium: "عنوان متوسط",
    body_large: "نص عادي",
    label_small: "تسمية صغيرة",
    fade_in: "ظهور",
    bounce: "ارتداد",
    typewriter_type: "آلة كاتبة",
    dark_mode: "الوضع الداكن",
  },
};

function DemoContent() {
  const { t, tn, changeLanguage, language, direction } = useLang();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const languages = ["en", "es", "ar"];
  const currentLangIndex = languages.indexOf(language);
  const nextLangIndex = (currentLangIndex + 1) % languages.length;
  const nextLang = languages[nextLangIndex];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? "#121212" : "#F5F5F5",
    },
    section: {
      marginBottom: 24,
      paddingHorizontal: 16,
    },
    sectionTitle: {
      marginBottom: 12,
    },
    row: {
      flexDirection: direction === "rtl" ? "row-reverse" : "row",
      flexWrap: "wrap",
      gap: 8,
    },
    buttonRow: {
      flexDirection: direction === "rtl" ? "row-reverse" : "row",
      gap: 8,
      marginBottom: 16,
    },
    card: {
      backgroundColor: isDarkMode ? "#1E1E1E" : "#FFFFFF",
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    demoButton: {
      backgroundColor: "#4CAF50",
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginTop: 8,
    },
    demoButtonText: {
      color: "#FFFFFF",
      fontWeight: "600",
      textAlign: "center",
    },
    toggleRow: {
      flexDirection: direction === "rtl" ? "row-reverse" : "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.toggleRow}>
        <AppText variant="bodyLarge">{t("dark_mode")}</AppText>
        <Switch
          value={isDarkMode}
          onValueChange={setIsDarkMode}
          trackColor={{ false: "#767577", true: "#81C784" }}
          thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
        />
      </View>

      <View style={styles.section}>
        <AppText variant="titleLarge" weight="700" style={styles.sectionTitle}>
          {t("welcome")}
        </AppText>
        <AppText variant="bodyLarge">{t("greeting", { name: "Developer" })}</AppText>
        <AppText variant="bodyMedium" color={isDarkMode ? "#BB86FC" : "#6200EE"}>
          {tn("items_count", 5)}
        </AppText>
      </View>

      <View style={styles.section}>
        <AppText variant="titleMedium" weight="600" style={styles.sectionTitle}>
          {t("typography")}
        </AppText>
        <View style={styles.card}>
          <AppText.DisplayLarge color={isDarkMode ? "#FFFFFF" : "#000000"}>
            {t("display_large")}
          </AppText.DisplayLarge>
          <AppText.HeadlineMedium color={isDarkMode ? "#E0E0E0" : "#333333"}>
            {t("headline_medium")}
          </AppText.HeadlineMedium>
          <AppText.BodyLarge color={isDarkMode ? "#BDBDBD" : "#555555"}>
            {t("body_large")}
          </AppText.BodyLarge>
          <AppText.LabelSmall color={isDarkMode ? "#9E9E9E" : "#777777"}>
            {t("label_small")}
          </AppText.LabelSmall>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="titleMedium" weight="600" style={styles.sectionTitle}>
          {t("animations")}
        </AppText>
        <View style={styles.card}>
          <View style={styles.row}>
            <AppText
              animated
              animation={{ type: "fadeIn", duration: 500 }}
              variant="bodyMedium"
              color="#4CAF50"
            >
              {t("fade_in")}
            </AppText>
          </View>
          <View style={styles.row}>
            <AppText
              animated
              animation={{ type: "bounceIn", duration: 600 }}
              variant="bodyMedium"
              color="#2196F3"
            >
              {t("bounce")}
            </AppText>
          </View>
          <View style={styles.row}>
            <AppText
              animated
              animation={{ type: "typewriter", speed: 50 }}
              variant="bodyMedium"
              color="#FF9800"
              cursor
            >
              {t("typewriter_type")}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="titleMedium" weight="600" style={styles.sectionTitle}>
          {t("rtl_demo")}
        </AppText>
        <View style={styles.card}>
          <AppText variant="bodyLarge" style={{ textAlign: direction === "rtl" ? "right" : "left" }}>
            {direction === "rtl" ? "مرحباً بك في العرض التوضيحي" : "Welcome to the demo"}
          </AppText>
          <AppText variant="bodyMedium" style={{ textAlign: direction === "rtl" ? "right" : "left" }}>
            {direction === "rtl" ? "هذا النص يظهر من اليمين لليسار" : "This text is displayed right to left"}
          </AppText>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => changeLanguage(nextLang)}
          >
            <RNText style={styles.demoButtonText}>
              {t("switch_language")} → {nextLang.toUpperCase()}
            </RNText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function App() {
  const [language, setLanguage] = useState("en");
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? "#121212" : "#F5F5F5" }}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      <LocaleProvider translations={translations} defaultLanguage={language}>
        <RTLProvider language={language} autoApply>
          <AppTextProvider>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 24 }}>
              <DemoContent />
            </ScrollView>
          </AppTextProvider>
        </RTLProvider>
      </LocaleProvider>
    </SafeAreaView>
  );
}

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  row: {
    flexWrap: "wrap",
    gap: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  demoButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
  },
});