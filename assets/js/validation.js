// validation.js
// intl-tel-input is loaded globally by index.html
let iti;

export function initPhoneInput(inputEl) {
  iti = window.intlTelInput(inputEl, {
    utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@24.4.0/build/js/utils.js",
    countryOrder: ["sa", "qa"],
    initialCountry: "sa",
    onlyCountries: ["sa", "qa", "ae", "om", "kw", "bh"],
    excludeCountries: ["il"],
    strictMode: true
  });
  return iti;
}

export function getFullNumber() {
  return iti ? iti.getNumber().substring(1) : "";
}

export function isPhoneValid() {
  return iti ? iti.isValidNumber() : false;
}

// Simple URL validation (not used for map URL since we build it)
export function isValidUrl(value) {
  const re = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
  return re.test(String(value).trim());
}

// Plate: 1–4 digits only
export function attachPlateSanitizer(inputEl, onChange) {
  inputEl.addEventListener("input", () => {
    inputEl.value = inputEl.value.replace(/\D/g, "").slice(0, 4);
    if (onChange) onChange();
  });
}
