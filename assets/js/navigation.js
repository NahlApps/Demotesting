import { locale, DateTime } from './config.js';
import { checkNumberValidity } from './validation.js';
import { callContent2 } from './api.js';
import { choosedDate } from './appointments.js';
import { saveUser, clearUser } from './storage.js';

// simple timer (used in OTP flow previously)
export function startTimer(duration, display) {
  document.getElementById("resend-objects")?.style && (document.getElementById("resend-objects").style.display = "block");
  try { document.getElementById("page6-resend")?.remove(); } catch {}
  let timer = duration;

  const time_counter = setInterval(function () {
    const minutes = String(parseInt(timer / 60, 10)).padStart(2, '0');
    const seconds = String(parseInt(timer % 60, 10)).padStart(2, '0');

    if (display) display.textContent = `${minutes}:${seconds}`;
    timer = --timer;

    if (timer < 0) {
      clearInterval(time_counter);
      const timerElement = document.getElementById("resend-objects");
      if (!timerElement) return;

      const resendButton = document.createElement("button");
      resendButton.id = "page6-resend";
      resendButton.className = "filter-button";
      resendButton.type = "button";
      const sp = document.createElement("span");
      sp.textContent = "إعادة ارسال";
      resendButton.appendChild(sp);

      timerElement.after(resendButton);
      timerElement.style.display = "none";
      document.getElementById("page6-contact") && (document.getElementById("page6-contact").style.display = "block");
    }
  }, 1000);
}

export function wirePager(nForm, iti) {
  // Expose global for inline onclick in HTML (time buttons)
  window.choosedDate = (t, d, i) => choosedDate(t, d, i, nForm);

  for (let i = 1; i < 7; i++) {
    if (i === 4) continue; // #page4 has times grid selection

    const btnNext = document.getElementById(`page${i}-button`);
    const page = document.getElementById(`page${i}`);
    const pageNext = document.getElementById(`page${i + 1}`);

    if (!btnNext) continue;

    if (i === 2) {
      btnNext.onclick = () => {
        const field1 = document.getElementById("area");
        if (!field1.value) {
          // show a quick hint via map infowindow (handled in maps.js if needed)
          document.getElementById("page2-form").reportValidity();
          return;
        }
        page.classList.remove("fadeIn"); page.classList.add("fadeOut");
        pageNext.classList.remove("fadeOut"); pageNext.classList.add("fadeIn");
        setTimeout(() => { page.style.display = "none"; pageNext.style.display = "flex"; }, 1000);
        nForm.location = field1.value;
      };
    } else if (i === 3) {
      btnNext.onclick = () => {
        const field3 = document.getElementById("serviceCat");
        const field4 = document.getElementById("service");
        const serviceCount = document.getElementById("serviceCount");
        const form = document.getElementById("page3-form");

        try {
          if (parseInt(serviceCount.value) <= 0 || parseInt(serviceCount.value) > 10) {
            if (locale === "en") serviceCount.setCustomValidity("Must be between 1 and 10");
            else serviceCount.setCustomValidity("لابد أن يكون بين 1 و 10");
            throw new Error("bad count");
          }
        } catch {
          form.reportValidity();
          return;
        }

        if (!field3.value || !field4.value) {
          field3.style.borderColor = field3.value ? 'green' : 'red';
          field4.style.borderColor = field4.value ? 'green' : 'red';
          field3.style.borderWidth = 'thin';
          field4.style.borderWidth = 'thin';
          return;
        } else {
          field3.style.borderColor = 'green';
          field3.style.borderWidth = 'thin';
          field4.style.borderColor = 'green';
          field4.style.borderWidth = 'thin';
        }

        nForm.customerN = (document.getElementById("name")?.value || "").trim();
        nForm.serviceCat = field3.value;
        nForm.service = field4.value;
        nForm.serviceCount = serviceCount.value;

        page.classList.remove("fadeIn"); page.classList.add("fadeOut");
        pageNext.classList.remove("fadeOut"); pageNext.classList.add("fadeIn");
        setTimeout(() => { page.style.display = "none"; pageNext.style.display = "flex"; }, 1000);
      };
    } else if (i === 5) {
      btnNext.onclick = () => {
        const field1 = document.getElementById("name");
        const form = document.getElementById("page5-form");
        const payingMethod = document.querySelector('input[name="payingMethod"]:checked')?.value;

        try {
          if (!payingMethod) throw new Error("no payment");
          if (!field1.value.trim()) {
            if (locale === "en") field1.setCustomValidity("Required field");
            else field1.setCustomValidity("يُرجى ملئ هذا الحقل");
            throw new Error("no name");
          }
        } catch {
          form.reportValidity();
          return;
        }

        if (!checkNumberValidity(iti)) {
          form.reportValidity();
          return;
        }

        nForm.paymentMethod = payingMethod;
        nForm.customerN = field1.value.trim();
        nForm.customerM = iti.getNumber().substring(1);

        page.classList.remove("fadeIn"); page.classList.add("fadeOut");
        pageNext.classList.remove("fadeOut"); pageNext.classList.add("fadeIn");
        setTimeout(() => { page.style.display = "none"; pageNext.style.display = "flex"; }, 1000);
      };
    } else if (i === 6) {
      // page6: show terms, then send POST
      btnNext.onclick = () => {
        const { map, infoWindow, position } = window.__MAP_STATE__ || {};
        if (!position) {
          if (map && infoWindow) {
            infoWindow.setPosition(map.getCenter());
            infoWindow.setContent("الرجاء تحديد الموقع");
            infoWindow.open(map);
          }
          return;
        }

        const termsModalEl = document.getElementById('termsModal');
        const termsModal = new bootstrap.Modal(termsModalEl);
        const acceptCheckbox = document.getElementById('termsAccept');
        const confirmBtn = document.getElementById('confirmTerms');

        acceptCheckbox.checked = false;
        confirmBtn.disabled = true;

        acceptCheckbox.onchange = () => { confirmBtn.disabled = !acceptCheckbox.checked; };
        termsModal.show();

        confirmBtn.onclick = () => {
          termsModal.hide();

          document.getElementById(`page${i}-return`).style.display = "none";
          btnNext.style.display = "none";
          const pageSpinner = document.getElementById(`page${i}-spinner`);
          const failAlert = document.getElementById(`fail-alert-5`);
          failAlert.style.display = "none";
          pageSpinner.style.display = "flex";
          pageSpinner.children[0].style.display = "block";
          pageSpinner.children[1].style.display = "block";

          nForm.urlLocation = position;

          const x = document.getElementById("locationDescription");
          try {
            if (x && x.value.trim().length > 200) {
              if (locale === "en") x.setCustomValidity("Description is too long");
              else x.setCustomValidity("الوصف أطول من المتوقع");
              throw new Error("desc too long");
            }
          } catch {
            document.getElementById("page6-form").reportValidity();
            document.getElementById(`page${i}-return`).style.display = "inline-block";
            btnNext.style.display = "inline-block";
            pageSpinner.style.display = "none";
            pageSpinner.children[0].style.display = "none";
            pageSpinner.children[1].style.display = "none";
            return;
          }

          fetch(`${location.origin ? location.origin : ''}${new URL('.', window.location).pathname}${''}`); // noop to keep scope warm

          fetch(`${defaultLink2}/reserveAppointment`, {
            redirect: "follow",
            method: "POST",
            body: JSON.stringify(nForm)
          }).then(async (res) => {
            pageSpinner.style.display = 'none';
            if (!res.ok) throw Object.assign(new Error('Custom error'), { response: res });
            const response = await res.json();
            if (response.success) {
              page.classList.remove("fadeIn"); page.classList.add("fadeOut");
              const done = document.getElementById(`page${i + 1}`);
              done.classList.remove("fadeOut"); done.classList.add("fadeIn");

              setTimeout(() => {
                page.style.display = "none";
                done.style.display = "flex";
                // remember user?
                if (confirm(`عزيزنا/عزيزتنا, ودك نتذكر بياناتك على هذا الجهاز لتسهيل الغسلات الجاية ؟`)) {
                  saveUser({ name: document.getElementById("name").value, mobile: iti.getNumber().substring(1) });
                } else {
                  clearUser();
                }
              }, 1000);
            }
          }).catch(async (err) => {
            console.log("Error:", err.message);
            const ejson = err.response ? await err.response.json() : {};
            document.getElementById(`page${i}-return`).style.display = "inline-block";
            btnNext.style.display = "inline-block";

            page.classList.remove("fadeIn"); page.classList.add("fadeOut");
            page.style.display = "none";
            const backTo4 = document.getElementById(`page4`);
            backTo4.classList.remove("fadeOut"); backTo4.classList.add("fadeIn");
            backTo4.style.display = "flex";

            const failAlert3 = document.getElementById(`fail-alert-3`);
            failAlert3.style.display = "block";
            if (locale === "en") {
              failAlert3.children[0].innerHTML = ejson.msgEN ? ejson.msgEN : "Unexpected error, Please contact us";
            } else {
              failAlert3.children[0].innerHTML = ejson.msgAR ? ejson.msgAR : "عذرًا حصل خطأ غير متوقع الرجاء التواصل معنا";
            }
            failAlert3.children[2].innerHTML = "";
            document.getElementById('date').dispatchEvent(new Event('change'));
          });
        };
      };
    } else {
      btnNext.onclick = () => {
        page.classList.remove("fadeIn"); page.classList.add("fadeOut");
        pageNext.classList.remove("fadeOut"); pageNext.classList.add("fadeIn");
        setTimeout(() => { page.style.display = "none"; pageNext.style.display = "
