// Global config & shared constants
export const defaultLink2 = `https://nahl-platform.vercel.app/api/app/AM/general/${'33e0d05d-d771-46f4-a7e7-7c634b4e3a9e'}/form`;

export const acceptedHourdiff = 1;
export const acceptedMindiff = 30;

export const DateTime = window.luxon?.DateTime;
export const dayjs = window.dayjs;

// locale detection
export const locale = (navigator.language || navigator.userLanguage || 'ar').includes('ar') ? 'ar' : 'en';

// weekdays (AR + EN)
export const weekdaysAR = ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت","الأحد"];
export const weekdaysEN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

// Maps helpers
export const prePosition = "https://www.google.com/maps/search/?api=1&query=";
