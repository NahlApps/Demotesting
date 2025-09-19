export function loadUser() {
  try {
    return {
      name: localStorage.getItem("name") || "",
      mobile: localStorage.getItem("mobile") || "",
    };
  } catch {
    return { name: "", mobile: "" };
  }
}

export function saveUser({ name, mobile }) {
  try {
    localStorage.setItem("name", name || "");
    localStorage.setItem("mobile", mobile || "");
  } catch {}
}

export function clearUser() {
  try {
    localStorage.removeItem("name");
    localStorage.removeItem("mobile");
  } catch {}
}
