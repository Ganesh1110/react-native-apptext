import React from "react";
import { Button, ScrollView, View } from "react-native";
import AppText, {
  AppTextProvider,
  LocaleProvider,
  useLang,
} from "react-native-apptext";

// Define your translations
const translations = {
  en: {
    welcome: "Welcome, {{name}}!",

    // Correct ICU plural format
    items: "{count, plural, one {# item} other {# items}}",

    messages:
      "{count, plural, =0 {No messages} =1 {One message} other {# messages}}",

    cart: "{count, plural, =0 {Your cart is empty} one {# item in cart} other {# items in cart}}",

    // Correct ICU select format
    greeting:
      "{gender, select, male {He is online} female {She is online} other {They are online}}",

    permission:
      "{role, select, admin {Full access} user {Limited access} guest {View only} other {No access}}",

    // Combined select and plural
    invitation:
      "{gender, select, male {He sent {count, plural, one {# invitation} other {# invitations}}} female {She sent {count, plural, one {# invitation} other {# invitations}}} other {They sent {count, plural, one {# invitation} other {# invitations}}}}",

    // Ordinal examples
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
      actions: { edit: "Edit Profile", delete: "Delete Account" },
    },

    auth: {
      login: {
        title: "Welcome Back",
        submit: "Sign In",
        errors: {
          invalid: "Invalid credentials",
          network: "Network error",
        },
      },
    },

    buttons: { save: "Save", cancel: "Cancel" },

    errors: { generic: "Something went wrong" },
  },
  "en-US": {
    welcome: "Welcome, {{name}}! 🇺🇸",
    price: "Total: {amount, number, currency}",
    price_simple: "Price: {amount, number, currency}",
    discount: "Save {amount, number, currency}",
  },
  "en-GB": {
    welcome: "Welcome, {{name}}! 🇬🇧",
    price: "Total: {amount, number, currency}",
    price_simple: "Price: {amount, number, currency}",
    discount: "Save {amount, number, currency}",
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
      actions: { edit: "Editar perfil", delete: "Eliminar cuenta" },
    },

    auth: {
      login: {
        title: "Bienvenido de nuevo",
        submit: "Iniciar sesión",
        errors: {
          invalid: "Credenciales inválidas",
          network: "Error de red",
        },
      },
    },

    buttons: { save: "Guardar", cancel: "Cancelar" },

    errors: { generic: "Algo salió mal" },
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
      actions: { edit: "تعديل الملف الشخصي", delete: "حذف الحساب" },
    },

    auth: {
      login: {
        title: "مرحباً بعودتك",
        submit: "تسجيل الدخول",
        errors: {
          invalid: "بيانات اعتماد غير صحيحة",
          network: "خطأ في الشبكة",
        },
      },
    },

    buttons: { save: "حفظ", cancel: "إلغاء" },

    errors: { generic: "حدث خطأ ما" },
  },
  fa: {
    welcome: "خوش آمدید، {{name}}!",

    items: "{count, plural, one {# مورد} other {# مورد}}",

    messages:
      "{count, plural, =0 {هیچ پیامی نیست} =1 {یک پیام} other {# پیام}}",

    cart: "{count, plural, =0 {سبد خرید شما خالی است} one {# مورد در سبد} other {# مورد در سبد}}",

    greeting:
      "{gender, select, male {او آنلاین است} female {او آنلاین است} other {آنها آنلاین هستند}}",

    permission:
      "{role, select, admin {دسترسی کامل} user {دسترسی محدود} guest {فقط مشاهده} other {هیچ دسترسی}}",

    invitation:
      "{gender, select, male {او {count, plural, one {# دعوت} other {# دعوت}} ارسال کرد} female {او {count, plural, one {# دعوت} other {# دعوت}} ارسال کرد} other {آنها {count, plural, one {# دعوت} other {# دعوت}} ارسال کردند}}",

    position:
      "شما در جایگاه {place, selectordinal, one {#م} two {#م} few {#م} other {#م}} قرار گرفتید",

    rank: "{rank, selectordinal, one {#م مقام} two {#م مقام} few {#م مقام} other {#م مقام}}",

    price: "جمع: {amount, number, currency}",
    price_simple: "قیمت: {amount, number, currency}",
    discount: "صرفه‌جویی {amount, number, currency}",
    percent: "پیشرفت: {value, number, percent}",
    completion: "تکمیل: {value, number, percent}",

    lastSeen: "آخرین بازدید: {date, date, short}",
    appointment: "قرار ملاقات: {date, date, long}",

    user: {
      profile: {
        name: "نام",
        email: "ایمیل",
        settings: {
          privacy: "تنظیمات حریم خصوصی",
          notifications: {
            email: "اطلاع‌رسانی ایمیل",
            push: "اطلاع‌رسانی پوش",
          },
        },
      },
      actions: { edit: "ویرایش پروفایل", delete: "حذف حساب" },
    },

    auth: {
      login: {
        title: "خوش آمدید",
        submit: "ورود",
        errors: {
          invalid: "اطلاعات نامعتبر",
          network: "خطای شبکه",
        },
      },
    },

    buttons: { save: "ذخیره", cancel: "لغو" },

    errors: { generic: "خطایی رخ داد" },
  },
  de: {
    welcome: "Willkommen, {{name}}!",
    price: "Gesamt: {amount, number, currency}",
    price_simple: "Preis: {amount, number, currency}",
    discount: "Sparen Sie {amount, number, currency}",
    percent: "Fortschritt: {value, number, percent}",
  },
  ja: {
    welcome: "ようこそ、{{name}}さん！",
    price: "合計: {amount, number, currency}",
    price_simple: "価格: {amount, number, currency}",
    discount: "{amount, number, currency}節約",
    percent: "進捗: {value, number, percent}",
  },
  zh: {
    welcome: "欢迎，{{name}}！",
    price: "总计: {amount, number, currency}",
    price_simple: "价格: {amount, number, currency}",
    discount: "节省 {amount, number, currency}",
    percent: "进度: {value, number, percent}",
  },
};

// Wrap your app
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
      <YourApp />
    </LocaleProvider>
  );
}

function YourApp() {
  const { t, tn, changeLanguage, language } = useLang();

  return (
    <AppTextProvider>
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
            <AppText.H1 animated animation={{ type: "fadeIn" }}>
              ✨ Future of Text
            </AppText.H1>

            <AppText.Body color="secondary">
              Beautiful, scalable multilingual text — powered by ICU,
              animations, and automatic RTL support.
            </AppText.Body>

            <AppText variant="caption" color="gray">
              50+ languages • Smart formatting • Lightning-fast rendering
            </AppText>

            <AppText variant="caption" weight="bold" color="primary">
              Current Language: {language}
            </AppText>
          </View>

          {/* Translations Section */}
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 16,
              gap: 16,
            }}
          >
            <AppText.H3>✅ Basic Example</AppText.H3>
            <AppText>{t("welcome", { name: "John" })}</AppText>
          </View>

          {/* Currency Formatting Tests */}
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
            <AppText.H3>💰 Currency Formatting (Fixed!)</AppText.H3>
            <View style={{ gap: 8 }}>
              <AppText weight="semibold">Standard Price:</AppText>
              <AppText>{t("price", { amount: 1299.99 })}</AppText>

              <AppText weight="semibold" style={{ marginTop: 8 }}>
                Simple Price:
              </AppText>
              <AppText>{t("price_simple", { amount: 49.99 })}</AppText>

              <AppText weight="semibold" style={{ marginTop: 8 }}>
                Discount:
              </AppText>
              <AppText>{t("discount", { amount: 25.5 })}</AppText>

              <AppText variant="caption" color="gray" style={{ marginTop: 8 }}>
                ✓ Proper ISO currency codes (USD, EUR, GBP, etc.)
              </AppText>
              <AppText variant="caption" color="gray">
                ✓ Correct symbols for all 200+ countries
              </AppText>
              <AppText variant="caption" color="gray">
                ✓ RTL support for Arabic, Hebrew, Persian
              </AppText>
            </View>
          </View>

          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 16,
              gap: 12,
            }}
          >
            <AppText.H3>✅ Plural & ICU Examples</AppText.H3>
            <AppText>{t("items", { count: 1 })}</AppText>
            <AppText>{t("items", { count: 5 })}</AppText>
            <AppText>{t("messages", { count: 0 })}</AppText>
            <AppText>{t("messages", { count: 1 })}</AppText>
            <AppText>{t("messages", { count: 3 })}</AppText>
          </View>

          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 16,
              gap: 12,
            }}
          >
            <AppText.H3>✅ Gender-Based Examples</AppText.H3>
            <AppText>{t("greeting", { gender: "male" })}</AppText>
            <AppText>{t("greeting", { gender: "female" })}</AppText>
            <AppText>{t("greeting", { gender: "other" })}</AppText>
            <AppText>{t("permission", { role: "admin" })}</AppText>
            <AppText>{t("permission", { role: "user" })}</AppText>
            <AppText>{t("permission", { role: "guest" })}</AppText>
          </View>

          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 16,
              gap: 12,
            }}
          >
            <AppText.H3>✅ Combined Select + Plural</AppText.H3>
            <AppText>{t("invitation", { gender: "male", count: 1 })}</AppText>
            <AppText>{t("invitation", { gender: "female", count: 3 })}</AppText>
            <AppText>{t("invitation", { gender: "other", count: 5 })}</AppText>
          </View>

          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 16,
              gap: 12,
            }}
          >
            <AppText.H3>✅ Ordinal Numbers</AppText.H3>
            <AppText>{t("position", { place: 1 })}</AppText>
            <AppText>{t("position", { place: 2 })}</AppText>
            <AppText>{t("position", { place: 3 })}</AppText>
            <AppText>{t("position", { place: 4 })}</AppText>
            <AppText>{t("rank", { rank: 21 })}</AppText>
            <AppText>{t("rank", { rank: 22 })}</AppText>
          </View>

          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 16,
              gap: 12,
            }}
          >
            <AppText.H3>✅ Number & Date Formatting</AppText.H3>
            <AppText>{t("price", { amount: 1299.99 })}</AppText>
            <AppText>{t("percent", { value: 0.85 })}</AppText>
            <AppText>{t("completion", { value: 0.42 })}</AppText>
            <AppText>{t("lastSeen", { date: new Date() })}</AppText>
            <AppText>{t("appointment", { date: new Date() })}</AppText>
          </View>

          {/* Nested Keys */}
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 16,
              gap: 12,
            }}
          >
            <AppText.H3>✅ Nested Translations</AppText.H3>
            <AppText>{t("user.profile.settings.privacy")}</AppText>
            <AppText>{t("user.profile.settings.notifications.email")}</AppText>
            <AppText>{t("user.profile.settings.notifications.push")}</AppText>
            <AppText>{t("user.actions.edit")}</AppText>
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
            <AppText.H3>🌍 Switch Language & Currency</AppText.H3>
            <AppText variant="caption" color="gray" style={{ marginBottom: 8 }}>
              Each language will show prices in its native currency!
            </AppText>

            <View style={{ gap: 10 }}>
              <Button
                title="🇺🇸 English (US) - USD $"
                onPress={() => changeLanguage("en-US")}
              />
              <Button
                title="🇬🇧 English (UK) - GBP £"
                onPress={() => changeLanguage("en-GB")}
              />
              <Button
                title="🇪🇸 Spanish - EUR €"
                onPress={() => changeLanguage("es")}
              />
              <Button
                title="🇸🇦 Arabic - SAR ر.س"
                onPress={() => changeLanguage("ar")}
              />
              <Button
                title="🇮🇷 Persian - IRR ﷼"
                onPress={() => changeLanguage("fa")}
              />
              <Button
                title="🇩🇪 German - EUR €"
                onPress={() => changeLanguage("de")}
              />
              <Button
                title="🇯🇵 Japanese - JPY ¥"
                onPress={() => changeLanguage("ja")}
              />
              <Button
                title="🇨🇳 Chinese - CNY ¥"
                onPress={() => changeLanguage("zh")}
              />
            </View>
          </View>

          {/* Testing Panel */}
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
            <AppText.H3>🧪 Currency Test Results</AppText.H3>
            <View style={{ gap: 6 }}>
              <AppText variant="caption">Test various amounts:</AppText>
              <AppText>• {t("price_simple", { amount: 0.99 })}</AppText>
              <AppText>• {t("price_simple", { amount: 9.99 })}</AppText>
              <AppText>• {t("price_simple", { amount: 99.99 })}</AppText>
              <AppText>• {t("price_simple", { amount: 999.99 })}</AppText>
              <AppText>• {t("price_simple", { amount: 9999.99 })}</AppText>
              <AppText>• {t("price_simple", { amount: 1234567.89 })}</AppText>
            </View>
          </View>
        </ScrollView>
      </View>
    </AppTextProvider>
  );
}
