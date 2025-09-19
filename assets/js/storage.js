// assets/js/storage.js

export function getName() {
  try { return localStorage.getItem("name") || ""; } catch { return ""; }
}
export function setName(v) {
  try { localStorage.setItem("name", v || ""); } catch {}
}
export function getMobile() {
  try { return localStorage.getItem("mobile") || ""; } catch { return ""; }
}
export function setMobile(v) {
  try { localStorage.setItem("mobile", v || ""); } catch {}
}
export function clearSaved() {
  try {
    localStorage.removeItem("name");
    localStorage.removeItem("mobile");
  } catch {}
}

