import { locale } from './config.js';

export const translations = {
  en: {
    "app-title": "Departements List",
    "add-new": "Add new",
    "show-added": "Show Added",
    "search-box": { "attribute":"placeholder","search":"Search" },
    "service-category-id": "Service Category ID",
    "cat-num": "Category No.",
    "arabic-name": "Arabic Name",
    "english-name": "English Name",
    "service-name-ar": "Service Name in Arabic",
    "service-name-en": "Service Name in English",
    "cat-name": "Category Name",
    "price": "Price",
    "price-no-vat":"Service Price w/o VAT",
    "vat":"VAT",
    "vat-amount":"VAT Amount",
    "price-with-vat": "Price with VAT",
    "serial-num":"Serial Number",
    "data-submitted":"Data Has Been Submitted Successfully",
    "cancel" : "Cancel",
    "save" : "Save",
    "edit": "Edit",
    "delete": "Delete",
    "deleted":"Deleted",
    "confirm-deletion":"Confirm Deletion",
    "add-loc" :"Add Location",
    "location" : "Location",
    "locations" : "Locations",
    servicesCat: {},
    services: {},
    locationsTrans: {},
  },
  ar: {
    "app-title": "قائمة الأقسام",
    "add-new": "اضافة قسم",
    "show-added": "عرض الأقسم",
    "search-box": { "attribute":"placeholder","search":"ابحث" },
    "service-category-id": "رقم الصنف",
    "cat-num": "رقم القسم",
    "arabic-name": "الاسم باللغة العربية",
    "english-name": "الاسم باللغة الانجليزية",
    "service-name-ar": "اسم الخدمة باللغة العربية",
    "service-name-en": "اسم الخدمة باللغة الإنجليزية",
    "cat-name": "اسم الصنف",
    "price": "السعر",
    "price-no-vat":"سعر الخدمة بدون الضريبة",
    "vat":"الضريبة",
    "vat-amount":"قيمة الضريبة",
    "price-with-vat": "السعر مع الضريبة",
    "serial-num":"الرقم التسلسلي",
    "data-submitted":"تم إرسال البيانات بنجاح",
    "cancel" : "إلغاء",
    "save" : "حفظ",
    "edit": "تعديل",
    "delete": "حذف",
    "deleted":"تم الحذف",
    "confirm-deletion":"تأكيد الحذف",
    "add-loc" :"اضافة منطقة",
    "location" : "منطقة",
    "locations" : "المناطق",
    servicesCat: {},
    services: {},
    locationsTrans: {},
  },
};

export const i18n = {
  t(key, fallback = '') {
    const segs = key.split('.');
    let obj = translations[locale];
    for (const s of segs) {
      obj = (obj || {})[s];
    }
    return (obj == null) ? fallback : obj;
  }
};
