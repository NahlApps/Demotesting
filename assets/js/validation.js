import { locale } from './config.js';

const errorMap = ["رقم غير صحيح", "رمز دولة غير صحيح", "المُدخل أقصر من المتوقع", "المُدخل أطول من المتوقع", "رقم غير صحيح"];

export function checkUrlValidity() {
  const location = document.getElementById("googleMap");
  const reg = /^(https?:\/\/.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/g;
  const locationValue = (location?.value || "").trim();

  if (!locationValue || !reg.test(locationValue)) {
    if (locale === "en") location?.setCustomValidity("Please Enter a URL");
    else location?.setCustomValidity("الرجاء ادخال رابط الموقع بالشكل الصحيح");
    return false;
  }
  return true;
}

export function checkNumberValidity(iti) {
  const number = document.getElementById("mobile");
  const phoneNumber = iti.getNumber().substring(1);
  const region = iti.getSelectedCountryData().dialCode;

  if (isNaN(phoneNumber) || !iti.isValidNumber() || !phoneNumber) {
    const msg = errorMap[iti.getValidationError()] || "رقم غير صحيح";
    if (locale === "en") number.setCustomValidity("Please enter a Valid a phone number");
    else number.setCustomValidity(msg);
    return false;
  }
  if (region === "966") {
    if (iti.getNumber().substring(4, 6) === "05") {
      if (locale === "en") number.setCustomValidity("Please enter a Valid a phone number");
      else number.setCustomValidity("الرجاء ادخال رقم الهاتف بطريقة صحيحة");
      return false;
    }
  }
  number.setCustomValidity("");
  return true;
}

// 1–4 digits, no alert (use setCustomValidity)
export function validatePlateNumber(input) {
  const v = input.value.replace(/\D/g, '').slice(0, 4);
  input.value = v;
  if (v && !/^\d{1,4}$/.test(v)) {
    input.setCustomValidity("رقم اللوحة يجب أن يكون من 1 إلى 4 أرقام");
  } else {
    input.setCustomValidity("");
  }
}
