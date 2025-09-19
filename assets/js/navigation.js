// assets/js/navigation.js
import { checkNumberValidity, getPhone } from "./validation.js";
import { t } from "./i18n.js";
import { reserveAppointment } from "./api.js";
import { renderTimes } from "./appointments.js";
import { getPosition } from "./maps.js";
import { DateTime } from "./config.js";

// Global N-Form state shared across modules
const nForm = (window.__nForm = window.__nForm || {
  date: "", time: "",
  location: "", service: "", serviceCount: "1", serviceCat: "",
  customerM: "", customerN: "",
  paymentMethod: "",
  urlLocation: "",
  locationDescription: ""
});

export function initNavigation() {
  setupNextBack();
  setupAutoAdvanceFromPage3();
  setupRebook();
}

function setupNextBack() {
  // Page1 -> Page2
  byId("page1-button")?.addEventListener("click", () => go(1, 2));

  // Page2 validations
  byId("page2-button")?.addEventListener("click", () => {
    const area = byId("area");
    if (!area?.value) {
      // let maps overlay hint handle UX
      byId("page2-form")?.reportValidity();
      return;
    }
    nForm.location = area.value;
    go(2, 3);
  });

  // Page5 validations (name, phone, payment)
  byId("page5-button")?.addEventListener("click", () => {
    const name = byId("name");
    if (!name || !name.value.trim()) {
      name?.setCustomValidity(localeIsAR() ? "يُرجى ملئ هذا الحقل" : "Required field");
      byId("page5-form")?.reportValidity();
      return;
    } else {
      name.setCustomValidity("");
    }
    if (!checkNumberValidity()) {
      byId("page5-form")?.reportValidity();
      return;
    }
    const paying = document.querySelector('input[name="payingMethod"]:checked')?.value;
    if (!paying) {
      byId("page5-form")?.reportValidity();
      return;
    }

    nForm.customerN = name.value.trim();
    nForm.customerM = getPhone();
    nForm.paymentMethod = paying;

    go(5, 6);
  });

  // Back buttons
  for (let i = 3; i <= 6; i++) {
    const backBtn = byId(`page${i}-return`);
    if (!backBtn) continue;
    backBtn.addEventListener("click", () => {
      const src = byId(`page${i}`);
      const dst = i === 4 ? byId("page2") : byId(`page${i - 1}`);
      transition(src, dst);
    });
  }
}

// Auto-advance Page3 to Page4 (after availability is shown)
function setupAutoAdvanceFromPage3() {
  const page3 = byId("page3");
  const nextBtn = byId("page3-button"); // kept for compatibility
  if (!page3) return;

  const obs = new MutationObserver(() => {
    if (page3.style.display === "flex") {
      setTimeout(() => {
        // generate first times (if not yet)
        renderTimes(0);
        // move forward
        go(3, 4);
      }, 5000);
    }
  });
  obs.observe(page3, { attributes: true, attributeFilter: ["style"] });
}

function setupRebook() {
  byId("rebook")?.addEventListener("click", () => {
    window.location.href = "https://www.spongnsoap.com/";
  });
}

function go(from, to) {
  const p1 = byId(`page${from}`);
  const p2 = byId(`page${to}`);
  transition(p1, p2);
}

function transition(src, dst) {
  if (!src || !dst) return;
  src.classList.remove("fadeIn"); src.classList.add("fadeOut");
  dst.classList.remove("fadeOut"); dst.classList.add("fadeIn");
  setTimeout(() => { src.style.display = "none"; dst.style.display = "flex"; }, 1000);
}

// Submit from Page6 (called after Terms accepted)
export async function submitFromPage6() {
  const descEl = byId("locationDescription");

  // Validate desc length
  const val = (descEl?.value || "").trim();
  if (val.length > 200) {
    descEl.setCustomValidity(t("desc-too-long"));
    byId("page6-form")?.reportValidity();
    descEl.setCustomValidity("");
    return;
  }

  const pos = getPosition();
  if (!pos) {
    // maps module shows the infoWindow hint already
    return;
  }

  nForm.urlLocation = pos;

  // Spinner + disable nav
  const next = byId("page6-button");
  const back = byId("page6-return");
  const spinWrap = byId("page6-spinner");
  showSpinner(spinWrap, true);
  toggle(next, false); toggle(back, false);

  try {
    const res = await reserveAppointment(nForm);
    if (res?.success) {
      transition(byId("page6"), byId("page7"));
      // remember?
      if (confirm("عزيزنا/عزيزتنا, ودك نتذكر بياناتك على هذا الجهاز لتسهيل الغسلات الجاية ؟")) {
        try {
          localStorage.setItem("name", byId("name").value.trim());
          localStorage.setItem("mobile", nForm.customerM);
        } catch {}
      } else {
        try {
          localStorage.removeItem("name");
          localStorage.removeItem("mobile");
        } catch {}
      }
    } else {
      throw new Error("Reservation not successful");
    }
  } catch (err) {
    console.error("[reserve]", err);
    // Return to page4, show alert
    const errMsg = err.response?.msgAR || err.response?.msgEN || t("unexpected");
    const alert = byId("fail-alert-3");
    if (alert) {
      alert.style.display = "block";
      alert.children[0].innerHTML = errMsg;
      if (alert.children[2]) alert.children[2].innerHTML = "";
    }
    transition(byId("page6"), byId("page4"));
    // trigger a refresh on date list (optional)
    byId("date")?.dispatchEvent(new Event("change"));
  } finally {
    showSpinner(spinWrap, false);
    toggle(next, true); toggle(back, true);
  }
}

function toggle(el, on) { if (el) el.style.display = on ? "inline-block" : "none"; }
function showSpinner(wrap, on) {
  if (!wrap) return;
  wrap.style.display = on ? "flex" : "none";
  const sp = wrap.querySelector(".spinner-border");
  if (sp) sp.style.display = on ? "block" : "none";
}

function byId(id) { return document.getElementById(id); }
function localeIsAR() { return (navigator.language || "").includes("ar"); }
