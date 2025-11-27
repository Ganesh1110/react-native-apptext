import React, { useState, useEffect } from "react";
import {
  Button,
  ScrollView,
  View,
  Linking,
  Alert,
  StyleSheet,
} from "react-native";
import AppText, {
  AppTextProvider,
  LocaleProvider,
  useLang,
  Trans,
  MarkdownTrans,
  LazyLocaleProvider,
  useLazyLocale,
  NumberFormatter,
  OrdinalFormatter,
  translationCache,
  performanceMonitor,
} from "react-native-apptext";

// ============================================================================
// TRANSLATIONS - Enhanced with all features
// ============================================================================
const translations = {
  en: {
    welcome: "Welcome, {{name}}!",

    // ICU Plurals
    items: "{count, plural, one {# item} other {# items}}",
    messages:
      "{count, plural, =0 {No messages} =1 {One message} other {# messages}}",
    cart: "{count, plural, =0 {Your cart is empty} one {# item in cart} other {# items in cart}}",

    // ICU Select
    greeting:
      "{gender, select, male {He is online} female {She is online} other {They are online}}",
    permission:
      "{role, select, admin {Full access} user {Limited access} guest {View only} other {No access}}",

    // Combined Select + Plural
    invitation:
      "{gender, select, male {He sent {count, plural, one {# invitation} other {# invitations}}} female {She sent {count, plural, one {# invitation} other {# invitations}}} other {They sent {count, plural, one {# invitation} other {# invitations}}}}",

    // Ordinals
    position:
      "You finished {place, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}",
    rank: "{rank, selectordinal, one {#st place} two {#nd place} few {#rd place} other {#th place}}",

    // Number formatting
    price: "Total: {amount, number, currency}",
    price_simple: "Price: {amount, number, currency}",
    discount: "Save {amount, number, currency}",
    percent: "Progress: {value, number, percent}",
    completion: "Completion: {value, number, percent}",

    // Date formatting
    lastSeen: "Last seen: {date, date, short}",
    appointment: "Appointment: {date, date, long}",

    // Nested keys
    user: {
      profile: {
        name: "Name",
        email: "Email",
        settings: {
          privacy: "Privacy Settings",
          notifications: {
            email: "Email Notifications",
            push: "Push Notifications",
          },
        },
      },
      actions: {
        edit: "Edit Profile",
        delete: "Delete Account",
        save: "Save Changes",
        cancel: "Cancel",
      },
    },

    // Markdown examples (for MarkdownTrans)
    rich_welcome:
      "Hello **{{name}}**! Welcome to our [amazing app](https://example.com)",
    terms:
      "By continuing, you agree to our __Terms of Service__ and __Privacy Policy__",
    tutorial: "Press `Ctrl+S` to save, or use **File > Save**",
    code_example: "Use the ~~old method~~ **new API** instead",

    // Performance demo
    performance: {
      title: "⚡ Performance Features",
      caching: "Translation caching enabled",
      stats:
        "Cache stats: {{hits}} hits, {{misses}} misses, {{rate}}% hit rate",
      monitor: "Performance monitoring active",
      memory: "Memory optimizations enabled",
    },

    // Feature showcase
    features: {
      lazy: "🔄 Lazy Loading",
      markdown: "📝 Markdown Support",
      numbers: "🔢 Advanced Formatting",
      perf: "⚡ Performance",
      cli: "🛠️ CLI Tools",
    },

    // Lazy loading demo
    lazy: {
      title: "Dynamic Module Loaded!",
      description: "This translation was loaded on-demand",
      button: "Load More Languages",
    },

    // Number formatting examples
    numbers: {
      compact: "Downloads: {count, number, compact}",
      unit: "Distance: {distance, number, unit meter}",
      signed: "Temperature: {temp, number, signed}",
      range: "Price range: {start, number, currency} - {end, number, currency}",
      ordinal: "You came in {position, selectordinal} place!",
    },
  },

  es: {
    welcome: "¡Bienvenido, {{name}}!",
    items: "{count, plural, one {# artículo} other {# artículos}}",
    messages:
      "{count, plural, =0 {No hay mensajes} =1 {Un mensaje} other {# mensajes}}",
    cart: "{count, plural, =0 {Tu carrito está vacío} one {# artículo en el carrito} other {# artículos en el carrito}}",
    greeting:
      "{gender, select, male {Él está en línea} female {Ella está en línea} other {Ellos están en línea}}",
    permission:
      "{role, select, admin {Acceso completo} user {Acceso limitado} guest {Solo vista} other {Sin acceso}}",
    invitation:
      "{gender, select, male {Él envió {count, plural, one {# invitación} other {# invitaciones}}} female {Ella envió {count, plural, one {# invitación} other {# invitaciones}}} other {Ellos enviaron {count, plural, one {# invitación} other {# invitaciones}}}}",
    position: "Terminaste en el {place, selectordinal, other {#º}} lugar",
    rank: "{rank, selectordinal, other {#º lugar}}",
    price: "Total: {amount, number, currency}",
    price_simple: "Precio: {amount, number, currency}",
    discount: "Ahorra {amount, number, currency}",
    percent: "Progreso: {value, number, percent}",
    completion: "Completado: {value, number, percent}",
    lastSeen: "Última vez visto: {date, date, short}",
    appointment: "Cita: {date, date, long}",
    user: {
      profile: {
        name: "Nombre",
        email: "Correo electrónico",
        settings: {
          privacy: "Configuración de privacidad",
          notifications: {
            email: "Notificaciones por correo",
            push: "Notificaciones push",
          },
        },
      },
      actions: {
        edit: "Editar perfil",
        delete: "Eliminar cuenta",
        save: "Guardar cambios",
        cancel: "Cancelar",
      },
    },
    rich_welcome:
      "¡Hola **{{name}}**! Bienvenido a nuestra [increíble aplicación](https://example.com)",
    terms:
      "Al continuar, aceptas nuestros __Términos de Servicio__ y __Política de Privacidad__",
    tutorial: "Presiona `Ctrl+S` para guardar, o usa **Archivo > Guardar**",
    code_example: "Usa la **nueva API** en lugar del ~~método antiguo~~",
    performance: {
      title: "⚡ Características de Rendimiento",
      caching: "Caché de traducciones habilitado",
      stats:
        "Estadísticas de caché: {{hits}} aciertos, {{misses}} fallos, {{rate}}% tasa de acierto",
      monitor: "Monitoreo de rendimiento activo",
      memory: "Optimizaciones de memoria habilitadas",
    },
    features: {
      lazy: "🔄 Carga Diferida",
      markdown: "📝 Soporte Markdown",
      numbers: "🔢 Formato Avanzado",
      perf: "⚡ Rendimiento",
      cli: "🛠️ Herramientas CLI",
    },
    lazy: {
      title: "¡Módulo Dinámico Cargado!",
      description: "Esta traducción se cargó bajo demanda",
      button: "Cargar Más Idiomas",
    },
    numbers: {
      compact: "Descargas: {count, number, compact}",
      unit: "Distancia: {distance, number, unit meter}",
      signed: "Temperatura: {temp, number, signed}",
      range:
        "Rango de precio: {start, number, currency} - {end, number, currency}",
      ordinal: "¡Llegaste en {position, selectordinal} lugar!",
    },
  },

  ar: {
    welcome: "مرحباً، {{name}}!",
    items:
      "{count, plural, zero {لا توجد عناصر} one {عنصر واحد} two {عنصران} few {# عناصر} many {# عنصراً} other {# عنصر}}",
    messages:
      "{count, plural, =0 {لا توجد رسائل} =1 {رسالة واحدة} other {# رسائل}}",
    cart: "{count, plural, =0 {سلة التسوق فارغة} one {عنصر واحد في السلة} other {# عناصر في السلة}}",
    greeting:
      "{gender, select, male {إنه متصل} female {إنها متصلة} other {إنهم متصلون}}",
    permission:
      "{role, select, admin {وصول كامل} user {وصول محدود} guest {للعرض فقط} other {لا يوجد وصول}}",
    invitation:
      "{gender, select, male {أرسل {count, plural, one {# دعوة} other {# دعوات}}} female {أرسلت {count, plural, one {# دعوة} other {# دعوات}}} other {أرسلوا {count, plural, one {# دعوة} other {# دعوات}}}}",
    position: "لقد أنهيت في المرتبة {place, selectordinal, other {#}}",
    rank: "{rank, selectordinal, other {المركز رقم #}}",
    price: "الإجمالي: {amount, number, currency}",
    price_simple: "السعر: {amount, number, currency}",
    discount: "وفر {amount, number, currency}",
    percent: "التقدم: {value, number, percent}",
    completion: "الإنجاز: {value, number, percent}",
    lastSeen: "آخر ظهور: {date, date, short}",
    appointment: "الموعد: {date, date, long}",
    user: {
      profile: {
        name: "الاسم",
        email: "البريد الإلكتروني",
        settings: {
          privacy: "إعدادات الخصوصية",
          notifications: {
            email: "تنبيهات البريد الإلكتروني",
            push: "تنبيهات الدفع",
          },
        },
      },
      actions: {
        edit: "تعديل الملف الشخصي",
        delete: "حذف الحساب",
        save: "حفظ التغييرات",
        cancel: "إلغاء",
      },
    },
    rich_welcome:
      "مرحباً **{{name}}**! مرحباً بك في [تطبيقنا الرائع](https://example.com)",
    terms: "بالمتابعة، أنت توافق على __شروط الخدمة__ و __سياسة الخصوصية__",
    tutorial: "اضغط `Ctrl+S` للحفظ، أو استخدم **ملف > حفظ**",
    code_example: "استخدم **الواجهة الجديدة** بدلاً من ~~الطريقة القديمة~~",
    performance: {
      title: "⚡ ميزات الأداء",
      caching: "ذاكرة التخزين المؤقت للترجمات مفعلة",
      stats:
        "إحصائيات الذاكرة: {{hits}} نجاح، {{misses}} فشل، {{rate}}% معدل النجاح",
      monitor: "مراقبة الأداء نشطة",
      memory: "تحسينات الذاكرة مفعلة",
    },
    features: {
      lazy: "🔄 التحميل الكسول",
      markdown: "📝 دعم Markdown",
      numbers: "🔢 التنسيق المتقدم",
      perf: "⚡ الأداء",
      cli: "🛠️ أدوات CLI",
    },
    lazy: {
      title: "تم تحميل الوحدة الديناميكية!",
      description: "تم تحميل هذه الترجمة عند الطلب",
      button: "تحميل المزيد من اللغات",
    },
    numbers: {
      compact: "التحميلات: {count, number, compact}",
      unit: "المسافة: {distance, number, unit meter}",
      signed: "درجة الحرارة: {temp, number, signed}",
      range: "نطاق السعر: {start, number, currency} - {end, number, currency}",
      ordinal: "لقد وصلت في المركز {position, selectordinal}!",
    },
  },
};

// ============================================================================
// LAZY LOADING CONFIGURATION
// ============================================================================
const lazyLoaders = {
  en: () => Promise.resolve({ default: translations.en }),
  es: () => Promise.resolve({ default: translations.es }),
  ar: () => Promise.resolve({ default: translations.ar }),
  // Add more languages as needed
  fr: () =>
    Promise.resolve({
      default: {
        welcome: "Bienvenue, {{name}}!",
        items: "{count, plural, one {# article} other {# articles}}",
      },
    }),
  de: () =>
    Promise.resolve({
      default: {
        welcome: "Willkommen, {{name}}!",
        items: "{count, plural, one {# Artikel} other {# Artikel}}",
      },
    }),
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  const [useLazy, setUseLazy] = useState(false);

  if (useLazy) {
    return (
      <AppTextProvider>
        <LazyLocaleProvider
          loaders={lazyLoaders}
          defaultLanguage="en"
          preloadLanguages={["es", "ar"]}
          onLoadStart={(locale) => console.log(`Loading ${locale}...`)}
          onLoadComplete={(locale) => console.log(`Loaded ${locale}!`)}
          onLoadError={(locale, error) =>
            console.error(`Failed to load ${locale}:`, error)
          }
        >
          <EnhancedDemoApp onSwitchProvider={() => setUseLazy(false)} />
        </LazyLocaleProvider>
      </AppTextProvider>
    );
  }

  return (
    <AppTextProvider>
      <LocaleProvider
        translations={translations}
        defaultLanguage="en"
        fallbackLanguage="en"
        useICU={true}
        onMissingTranslation={(lang, key) => {
          console.warn(`Missing translation: ${key} in ${lang}`);
        }}
      >
        <EnhancedDemoApp onSwitchProvider={() => setUseLazy(true)} />
      </LocaleProvider>
    </AppTextProvider>
  );
}

// ============================================================================
// DEMO APP WITH ALL FEATURES
// ============================================================================
function EnhancedDemoApp({ onSwitchProvider }) {
  const { t, tn, changeLanguage, language, direction } = useLang();

  // Conditionally use lazy locale hook
  const lazyLocaleData = useLazyLocale ? useLazyLocale() : null;
  const { loadLocale, loadedLocales, isLoading } = lazyLocaleData || {};

  const [stats, setStats] = useState({ hits: 0, misses: 0, hitRate: 0 });

  // Update cache stats
  useEffect(() => {
    const updateStats = () => {
      const cacheStats = translationCache.getStats();
      setStats({
        hits: cacheStats.hits,
        misses: cacheStats.misses,
        hitRate: parseFloat(cacheStats.hitRate.toFixed(2)),
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rich text components for Trans component
  const richComponents = {
    bold: <AppText weight="bold" color="primary" />,
    link: <AppText color="info" style={{ textDecorationLine: "underline" }} />,
    terms: <AppText weight="bold" color="error" />,
    privacy: <AppText weight="bold" color="info" />,
  };

  const handleLinkPress = (url) => {
    Alert.alert("Open Link", `Do you want to open ${url}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Open", onPress: () => Linking.openURL(url) },
    ]);
  };

  const loadAdditionalLanguage = async (lang) => {
    if (loadLocale && !loadedLocales?.has(lang)) {
      await loadLocale(lang);
      Alert.alert("Success", `${lang.toUpperCase()} loaded dynamically!`);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F7F7F9" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 20,
          gap: 24,
        }}
      >
        {/* Header Section */}
        <View style={styles.card}>
          <AppText.DisplaySmall>✨ React Native AppText</AppText.DisplaySmall>

          <AppText.BodyMedium color="secondary">
            Enterprise-grade i18n with ICU MessageFormat, lazy loading, and
            performance optimizations
          </AppText.BodyMedium>

          <View
            style={[
              styles.tagContainer,
              {
                flexDirection: direction === "rtl" ? "row-reverse" : "row",
              },
            ]}
          >
            <AppText.LabelSmall style={styles.tag}>
              {t("features.lazy")}
            </AppText.LabelSmall>
            <AppText.LabelSmall style={styles.tag}>
              {t("features.markdown")}
            </AppText.LabelSmall>
            <AppText.LabelSmall style={styles.tag}>
              {t("features.numbers")}
            </AppText.LabelSmall>
            <AppText.LabelSmall style={styles.tag}>
              {t("features.perf")}
            </AppText.LabelSmall>
            <AppText.LabelSmall style={styles.tag}>
              {t("features.cli")}
            </AppText.LabelSmall>
          </View>

          <View style={{ marginTop: 8 }}>
            <AppText.LabelMedium weight="bold" color="primary">
              Current Language: {language} ({direction.toUpperCase()})
            </AppText.LabelMedium>
            {isLoading && (
              <AppText.LabelSmall color="warning">
                🔄 Loading translations...
              </AppText.LabelSmall>
            )}
          </View>
        </View>

        <View style={styles.container}>
          <AppText.H1
            animated
            animation={{ type: "typewriter", delay: 150, duration: 2500 }}
            animationSpeed={35} // optional custom prop
            cursor={true} // optional blinking cursor
            style={[styles.spacer, { letterSpacing: 0.5 }]}
          >
            Welcome to the Future of Text (Typewriter)
          </AppText.H1>

          <AppText.HeadlineLarge
            animated
            animation={{ type: "fade", duration: 1000 }}
            style={styles.spacer}
          >
            Fade In Headline Large
          </AppText.HeadlineLarge>

          <AppText.TitleMedium
            animated
            animation={{ type: "slideInRight", duration: 800 }}
            style={styles.spacer}
          >
            Slide In From Right
          </AppText.TitleMedium>

          <AppText.BodyLarge
            animated
            animation={{ type: "bounceIn", duration: 1500 }}
            style={styles.spacer}
          >
            Bounce In Body Text
          </AppText.BodyLarge>

          <View style={styles.sequenceContainer}>
            <AppText.HeadlineSmall
              animated
              animation={{ type: "slideInUp", delay: 0, duration: 400 }}
            >
              Item 1 (Delay: 0ms)
            </AppText.HeadlineSmall>
            <AppText.BodySmall
              animated
              animation={{ type: "slideInUp", delay: 200, duration: 600 }}
            >
              Item 2 (Delay: 200ms)
            </AppText.BodySmall>
            <AppText.Caption
              animated
              animation={{ type: "slideInUp", delay: 400, duration: 400 }}
            >
              Item 3 (Delay: 400ms)
            </AppText.Caption>
          </View>

          <View style={styles.sequenceContainer}>
            <AppText.HeadlineSmall
              animated
              animation={{ type: "fade", delay: 0, duration: 500 }}
            >
              Fade Item 1
            </AppText.HeadlineSmall>
            <AppText.BodySmall
              animated
              animation={{ type: "slideInRight", delay: 300, duration: 500 }}
            >
              Slide Item 2
            </AppText.BodySmall>
            <AppText.Caption
              animated
              animation={{ type: "bounceIn", delay: 600, duration: 700 }}
            >
              Bounce Item 3
            </AppText.Caption>
          </View>
        </View>

        {/* Language Switcher */}
        <View style={styles.card}>
          <AppText.HeadlineSmall>🌍 Language Selection</AppText.HeadlineSmall>
          <AppText.BodySmall color="textSecondary" style={{ marginBottom: 8 }}>
            Each language shows prices in native currency with automatic RTL
            support
          </AppText.BodySmall>

          <View style={{ gap: 10 }}>
            <Button
              title="🇺🇸 English (US) - USD $"
              onPress={() => changeLanguage("en")}
              color={language === "en" ? "#007AFF" : "#666"}
            />
            <Button
              title="🇪🇸 Spanish - EUR €"
              onPress={() => changeLanguage("es")}
              color={language === "es" ? "#007AFF" : "#666"}
            />
            <Button
              title="🇸🇦 Arabic - SAR ر.س (RTL)"
              onPress={() => changeLanguage("ar")}
              color={language === "ar" ? "#007AFF" : "#666"}
            />
          </View>

          {/* Lazy Loading Section */}
          {loadLocale && (
            <View style={{ marginTop: 16, gap: 8 }}>
              <AppText.LabelMedium weight="bold">
                🔄 Dynamic Language Loading
              </AppText.LabelMedium>
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                <Button
                  title="Load French"
                  onPress={() => loadAdditionalLanguage("fr")}
                  color={loadedLocales?.has("fr") ? "#34C759" : "#666"}
                />
                <Button
                  title="Load German"
                  onPress={() => loadAdditionalLanguage("de")}
                  color={loadedLocales?.has("de") ? "#34C759" : "#666"}
                />
              </View>
              <AppText.LabelSmall color="textSecondary">
                Loaded: {Array.from(loadedLocales || []).join(", ")}
              </AppText.LabelSmall>
            </View>
          )}
        </View>

        {/* MarkdownTrans Component */}
        <View
          style={[
            styles.card,
            styles.highlightCard,
            { borderColor: "#4CAF50" },
          ]}
        >
          <AppText.HeadlineSmall>
            📝 MarkdownTrans Component
          </AppText.HeadlineSmall>

          <MarkdownTrans
            i18nKey="rich_welcome"
            values={{ name: "Sarah" }}
            markdownStyles={{
              bold: { color: "#007AFF" },
              link: { color: "#5AC8FA", textDecorationLine: "underline" },
            }}
            onLinkPress={handleLinkPress}
            variant="bodyMedium"
          />

          <MarkdownTrans
            i18nKey="terms"
            markdownStyles={{
              underline: { color: "#FF3B30", textDecorationLine: "underline" },
            }}
            variant="bodySmall"
            color="textSecondary"
          />

          <MarkdownTrans
            i18nKey="tutorial"
            markdownStyles={{
              code: {
                backgroundColor: "#F0F0F0",
                fontFamily: "monospace",
                paddingHorizontal: 4,
                borderRadius: 3,
              },
              bold: { color: "#007AFF" },
            }}
            variant="bodySmall"
          />

          <AppText.LabelSmall color="success" style={{ marginTop: 8 }}>
            ✓ Rich text ✓ Markdown syntax ✓ Link handling ✓ Custom styling
          </AppText.LabelSmall>
        </View>

        {/* Trans Component with Rich Text */}
        <View
          style={[
            styles.card,
            styles.highlightCard,
            { borderColor: "#2196F3" },
          ]}
        >
          <AppText.HeadlineSmall>🆕 Trans Component</AppText.HeadlineSmall>

          <Trans
            i18nKey="rich_welcome"
            values={{ name: "Sarah" }}
            components={richComponents}
            variant="bodyMedium"
          />

          <Trans
            i18nKey="terms"
            components={richComponents}
            variant="bodySmall"
            color="textSecondary"
          />

          <AppText.LabelSmall color="success" style={{ marginTop: 8 }}>
            ✓ Rich text ✓ Component interpolation ✓ Seamless integration
          </AppText.LabelSmall>
        </View>

        {/* Advanced Number Formatting */}
        <View
          style={[
            styles.card,
            styles.highlightCard,
            { borderColor: "#FF6B35" },
          ]}
        >
          <AppText.HeadlineSmall>
            🔢 Advanced Number Formatting
          </AppText.HeadlineSmall>

          <View style={{ gap: 6 }}>
            <AppText>
              • Compact: {NumberFormatter.formatCompact(1234567, language)}
            </AppText>
            <AppText>
              • Currency: {NumberFormatter.formatCurrency(1299.99, language)}
            </AppText>
            <AppText>
              • Percent: {NumberFormatter.formatPercent(0.856, language)}
            </AppText>
            <AppText>
              • Unit: {NumberFormatter.formatUnit(5.2, language, "kilometer")}
            </AppText>
            <AppText>
              • Signed: {NumberFormatter.formatSigned(25, language)}°C
            </AppText>
            <AppText>
              • Range:{" "}
              {NumberFormatter.formatRange(99, 199, language, {
                style: "currency",
                currency: "USD",
              })}
            </AppText>
            <AppText>
              • Ordinal: {OrdinalFormatter.format(3, language)} place
            </AppText>
          </View>

          <AppText.LabelSmall color="textSecondary" style={{ marginTop: 8 }}>
            ✓ Compact numbers ✓ Currency formatting ✓ Unit conversion ✓ Ordinals
          </AppText.LabelSmall>
        </View>

        {/* ICU Examples */}
        <View style={styles.card}>
          <AppText.HeadlineSmall>✅ ICU MessageFormat</AppText.HeadlineSmall>

          <View style={{ gap: 8 }}>
            <AppText weight="semibold">Plurals:</AppText>
            <AppText>• {t("items", { count: 1 })}</AppText>
            <AppText>• {t("items", { count: 5 })}</AppText>
            <AppText>• {t("messages", { count: 0 })}</AppText>
            <AppText>• {t("messages", { count: 3 })}</AppText>
          </View>

          <View style={{ gap: 8, marginTop: 12 }}>
            <AppText weight="semibold">Select:</AppText>
            <AppText>• {t("greeting", { gender: "male" })}</AppText>
            <AppText>• {t("greeting", { gender: "female" })}</AppText>
            <AppText>• {t("permission", { role: "admin" })}</AppText>
          </View>

          <View style={{ gap: 8, marginTop: 12 }}>
            <AppText weight="semibold">Ordinals:</AppText>
            <AppText>• {t("position", { place: 1 })}</AppText>
            <AppText>• {t("position", { place: 2 })}</AppText>
            <AppText>• {t("position", { place: 3 })}</AppText>
            <AppText>• {t("rank", { rank: 21 })}</AppText>
          </View>

          <View style={{ gap: 8, marginTop: 12 }}>
            <AppText weight="semibold">Combined:</AppText>
            <AppText>• {t("invitation", { gender: "male", count: 1 })}</AppText>
            <AppText>
              • {t("invitation", { gender: "female", count: 5 })}
            </AppText>
          </View>
        </View>

        {/* Currency Formatting */}
        <View
          style={[
            styles.card,
            styles.highlightCard,
            { borderColor: "#FFD54F" },
          ]}
        >
          <AppText.HeadlineSmall>💰 Currency Formatting</AppText.HeadlineSmall>
          <View style={{ gap: 8 }}>
            <AppText>• {t("price", { amount: 1299.99 })}</AppText>
            <AppText>• {t("price_simple", { amount: 49.99 })}</AppText>
            <AppText>• {t("discount", { amount: 25.5 })}</AppText>
            <AppText>• {t("percent", { value: 0.856 })}</AppText>

            <AppText.LabelSmall color="textSecondary" style={{ marginTop: 8 }}>
              ✓ ISO currency codes ✓ 200+ countries ✓ RTL support ✓ Automatic
              symbol placement
            </AppText.LabelSmall>
          </View>
        </View>

        {/* Material Design Typography */}
        <View
          style={[
            styles.card,
            styles.highlightCard,
            { borderColor: "#9C27B0" },
          ]}
        >
          <AppText.HeadlineSmall>
            🎨 Material Design 3 Typography
          </AppText.HeadlineSmall>

          <View style={{ gap: 6 }}>
            <AppText.DisplayLarge>Display Large</AppText.DisplayLarge>
            <AppText.DisplayMedium>Display Medium</AppText.DisplayMedium>
            <AppText.DisplaySmall>Display Small</AppText.DisplaySmall>
            <AppText.HeadlineLarge>Headline Large</AppText.HeadlineLarge>
            <AppText.HeadlineMedium>Headline Medium</AppText.HeadlineMedium>
            <AppText.HeadlineSmall>Headline Small</AppText.HeadlineSmall>
            <AppText.TitleLarge>Title Large</AppText.TitleLarge>
            <AppText.TitleMedium>Title Medium</AppText.TitleMedium>
            <AppText.TitleSmall>Title Small</AppText.TitleSmall>
            <AppText.BodyLarge>Body Large</AppText.BodyLarge>
            <AppText.BodyMedium>
              Body Medium - Default text style
            </AppText.BodyMedium>
            <AppText.BodySmall>Body Small</AppText.BodySmall>
            <AppText.LabelLarge>Label Large</AppText.LabelLarge>
            <AppText.LabelMedium>Label Medium</AppText.LabelMedium>
            <AppText.LabelSmall>Label Small - For captions</AppText.LabelSmall>
          </View>
        </View>

        {/* Nested Translations */}
        <View style={styles.card}>
          <AppText.HeadlineSmall>🗂️ Nested Keys</AppText.HeadlineSmall>
          <View style={{ gap: 6 }}>
            <AppText>• {t("user.profile.name")}</AppText>
            <AppText>• {t("user.profile.settings.privacy")}</AppText>
            <AppText>
              • {t("user.profile.settings.notifications.email")}
            </AppText>
            <AppText>• {t("user.actions.edit")}</AppText>
          </View>
        </View>

        {/* Performance Stats */}
        <View
          style={[
            styles.card,
            styles.highlightCard,
            { borderColor: "#2196F3" },
          ]}
        >
          <AppText.HeadlineSmall>
            {t("performance.title")}
          </AppText.HeadlineSmall>
          <View style={{ gap: 6 }}>
            <AppText>✓ {t("performance.caching")}</AppText>
            <AppText>✓ {t("performance.monitor")}</AppText>
            <AppText>✓ {t("performance.memory")}</AppText>

            <AppText.LabelSmall color="textSecondary" style={{ marginTop: 8 }}>
              {t("performance.stats", {
                hits: stats.hits,
                misses: stats.misses,
                rate: stats.hitRate,
              })}
            </AppText.LabelSmall>
          </View>

          <View style={{ marginTop: 12, gap: 8 }}>
            <AppText.LabelMedium weight="bold">
              Performance Actions:
            </AppText.LabelMedium>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
              <Button
                title="Clear Cache"
                onPress={() => {
                  translationCache.clear();
                  const newStats = translationCache.getStats();
                  setStats({
                    hits: newStats.hits,
                    misses: newStats.misses,
                    hitRate: parseFloat(newStats.hitRate.toFixed(2)),
                  });
                }}
              />
              <Button
                title="Get Stats"
                onPress={() => {
                  const perfStats = performanceMonitor.getAllStats();
                  console.log("Performance Stats:", perfStats);
                  Alert.alert(
                    "Performance Stats",
                    "Check console for detailed stats"
                  );
                }}
              />
            </View>
          </View>
        </View>

        {/* Script Detection Demo */}
        <View style={styles.card}>
          <AppText.HeadlineSmall>🌐 Multi-Script Support</AppText.HeadlineSmall>
          <View style={{ gap: 8 }}>
            <AppText script="Latn">Latin Script: Hello World</AppText>
            {/* <AppText>العربية: مرحبا بالعالم</AppText> */}
            <AppText script="Arab" direction="rtl">
              العربية: مرحبا بالعالم
            </AppText>
            <AppText script="Hani">中文: 你好世界</AppText>
            {/* <AppText>עברית: שלום עולם</AppText> */}
            <AppText script="Hebr" direction="rtl">
              עברית: שלום עולם
            </AppText>
            <AppText>देवनागरी: नमस्ते दुनिया</AppText>
          </View>
          <AppText.LabelSmall color="textSecondary" style={{ marginTop: 8 }}>
            ✓ 50+ writing systems ✓ Automatic RTL ✓ Line height optimization
          </AppText.LabelSmall>
        </View>

        {/* Footer */}
        <View style={{ padding: 20, alignItems: "center" }}>
          <AppText.LabelSmall color="textSecondary">
            React Native AppText v3.4.0
          </AppText.LabelSmall>
          <AppText.LabelSmall color="textSecondary">
            Made with ❤️ for the React Native community
          </AppText.LabelSmall>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  spacer: {
    marginBottom: 20,
  },
  sequenceContainer: {
    marginTop: 40,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  highlightCard: {
    borderWidth: 2,
  },
  tagContainer: {
    gap: 8,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});
