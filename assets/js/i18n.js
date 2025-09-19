// assets/js/i18n.js
import { locale } from "./config.js";

export const translations = {
  en: {
    "data-submitted": "Data Has Been Submitted Successfully",
    "desc-too-long": "Description is too long",
    "unexpected": "Unexpected error, Please contact us",
    "phone-invalid": "Please enter a valid phone number",
  },
  ar: {
    "data-submitted": "تم إرسال البيانات بنجاح",
    "desc-too-long": "الوصف أطول من المتوقع",
    "unexpected": "عذرًا حصل خطأ غير متوقع الرجاء التواصل معنا",
    "phone-invalid": "الرجاء ادخال رقم الهاتف بطريقة صحيحة",
  },
};

export function t(key) {
  return translations[locale]?.[key] || translations.en[key] || key;
}
