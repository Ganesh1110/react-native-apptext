import React, { useState } from "react";
import { Button, ScrollView, View } from "react-native";
import AppText, {
  AppTextProvider,
  LocaleProvider,
  useLang,
  Trans,
} from "react-native-apptext";

// For the new features (you'll need to add these imports after implementing)
// import { LazyLocaleProvider } from "react-native-apptext";
// import { MarkdownTrans } from "react-native-apptext";
// import { NumberFormatter, OrdinalFormatter } from "react-native-apptext";
// import { translationCache, performanceMonitor } from "react-native-apptext";

// ============================================================================
// TRANSLATIONS - Enhanced with new features
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
  },
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  return (
    <LocaleProvider
      translations={translations}
      defaultLanguage="en"
      fallbackLanguage="en"
      useICU={true}
      onMissingTranslation={(lang, key) => {
        console.warn(`Missing translation: ${key} in ${lang}`);
      }}
    >
      <AppTextProvider>
        <EnhancedDemoApp />
      </AppTextProvider>
    </LocaleProvider>
  );
}

// ============================================================================
// DEMO APP WITH ALL FEATURES
// ============================================================================
function EnhancedDemoApp() {
  const { t, tn, changeLanguage, language, direction } = useLang();
  const [activeTab, setActiveTab] = useState("overview");

  // Rich text components for Trans component
  const richComponents = {
    bold: <AppText weight="bold" color="primary" />,
    link: <AppText color="info" style={{ textDecorationLine: "underline" }} />,
    terms: <AppText weight="bold" color="error" />,
    privacy: <AppText weight="bold" color="info" />,
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
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
            gap: 10,
          }}
        >
          <AppText.DisplaySmall>✨ React Native AppText</AppText.DisplaySmall>

          <AppText.BodyMedium color="secondary">
            Enterprise-grade i18n with ICU MessageFormat, lazy loading, and
            performance optimizations
          </AppText.BodyMedium>

          <View
            style={{
              flexDirection: direction === "rtl" ? "row-reverse" : "row",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <AppText.LabelSmall
              style={{
                backgroundColor: "#E3F2FD",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
            >
              {t("features.lazy")}
            </AppText.LabelSmall>
            <AppText.LabelSmall
              style={{
                backgroundColor: "#F3E5F5",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
            >
              {t("features.markdown")}
            </AppText.LabelSmall>
            <AppText.LabelSmall
              style={{
                backgroundColor: "#FFF8E1",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
            >
              {t("features.numbers")}
            </AppText.LabelSmall>
            <AppText.LabelSmall
              style={{
                backgroundColor: "#E8F5E9",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
            >
              {t("features.perf")}
            </AppText.LabelSmall>
            <AppText.LabelSmall
              style={{
                backgroundColor: "#FCE4EC",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
            >
              {t("features.cli")}
            </AppText.LabelSmall>
          </View>

          <View style={{ marginTop: 8 }}>
            <AppText.LabelMedium weight="bold" color="primary">
              Current Language: {language} ({direction.toUpperCase()})
            </AppText.LabelMedium>
          </View>
        </View>

        {/* Language Switcher */}
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 16,
            gap: 12,
          }}
        >
          <AppText.HeadlineSmall>🌍 Language Selection</AppText.HeadlineSmall>
          <AppText.BodySmall color="textSecondary" style={{ marginBottom: 8 }}>
            Each language shows prices in native currency with automatic RTL
            support
          </AppText.BodySmall>

          <View style={{ gap: 10 }}>
            <Button
              title="🇺🇸 English (US) - USD $"
              onPress={() => changeLanguage("en-US")}
              color={language === "en-US" ? "#007AFF" : "#666"}
            />
            <Button
              title="🇬🇧 English (UK) - GBP £"
              onPress={() => changeLanguage("en-GB")}
              color={language === "en-GB" ? "#007AFF" : "#666"}
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
        </View>

        {/* Trans Component with Rich Text */}
        <View
          style={{
            backgroundColor: "#E8F5E8",
            padding: 20,
            borderRadius: 16,
            gap: 12,
            borderWidth: 2,
            borderColor: "#4CAF50",
          }}
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

        {/* ICU Examples */}
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 16,
            gap: 12,
          }}
        >
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
        </View>

        {/* Currency Formatting */}
        <View
          style={{
            backgroundColor: "#FFF8E1",
            padding: 20,
            borderRadius: 16,
            gap: 12,
            borderWidth: 2,
            borderColor: "#FFD54F",
          }}
        >
          <AppText.HeadlineSmall>💰 Currency Formatting</AppText.HeadlineSmall>
          <View style={{ gap: 8 }}>
            <AppText>• {t("price", { amount: 1299.99 })}</AppText>
            <AppText>• {t("price_simple", { amount: 49.99 })}</AppText>
            <AppText>• {t("discount", { amount: 25.5 })}</AppText>
            <AppText>• {t("percent", { value: 0.856 })}</AppText>

            <AppText.LabelSmall color="textSecondary" style={{ marginTop: 8 }}>
              ✓ ISO currency codes ✓ 200+ countries ✓ RTL support
            </AppText.LabelSmall>
          </View>
        </View>

        {/* Material Design Typography */}
        <View
          style={{
            backgroundColor: "#F3E5F5",
            padding: 20,
            borderRadius: 16,
            gap: 12,
            borderWidth: 2,
            borderColor: "#9C27B0",
          }}
        >
          <AppText.HeadlineSmall>
            🎨 Material Design 3 variants: 16
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
        <View
          style={{
            backgroundColor: "#fff",
            padding: 20,
            borderRadius: 16,
            gap: 12,
          }}
        >
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

        {/* Performance Stats (Placeholder for when you implement caching) */}
        <View
          style={{
            backgroundColor: "#E3F2FD",
            padding: 20,
            borderRadius: 16,
            gap: 12,
            borderWidth: 2,
            borderColor: "#2196F3",
          }}
        >
          <AppText.HeadlineSmall>
            {t("performance.title")}
          </AppText.HeadlineSmall>
          <View style={{ gap: 6 }}>
            <AppText>✓ {t("performance.caching")}</AppText>
            <AppText>✓ {t("performance.monitor")}</AppText>
            <AppText>✓ {t("performance.memory")}</AppText>

            {/* Uncomment when caching is implemented:
            <AppText.LabelSmall color="textSecondary" style={{ marginTop: 8 }}>
              {t("performance.stats", { 
                hits: stats.hits, 
                misses: stats.misses, 
                rate: stats.hitRate.toFixed(2) 
              })}
            </AppText.LabelSmall>
            */}
          </View>
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
