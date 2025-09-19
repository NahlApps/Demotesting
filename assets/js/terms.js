// assets/js/terms.js
import { submitFromPage6 } from "./navigation.js";

export function initTermsFlow() {
  const page6Btn = document.getElementById("page6-button");
  if (!page6Btn) return;

  page6Btn.addEventListener("click", () => {
    // ensure position already chosen on map
    // We still open modal first like your updated behavior
    openTermsModal().then((ok) => {
      if (ok) submitFromPage6();
    });
  });
}

function openTermsModal() {
  return new Promise((resolve) => {
    const modalEl = document.getElementById("termsModal");
    if (!modalEl || !window.bootstrap) {
      // fallback: proceed directly
      resolve(true);
      return;
    }

    const modal = new window.bootstrap.Modal(modalEl);
    const chk = document.getElementById("termsAccept");
    const confirmBtn = document.getElementById("confirmTerms");

    // reset
    if (chk) chk.checked = false;
    if (confirmBtn) confirmBtn.disabled = true;

    if (chk) chk.onchange = () => {
      confirmBtn.disabled = !chk.checked;
    };

    if (confirmBtn) {
      confirmBtn.onclick = () => {
        modal.hide();
        resolve(true);
      };
    }

    modal.show();
  });
}
