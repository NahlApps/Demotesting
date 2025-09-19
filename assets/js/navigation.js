// assets/js/navigation.js
import { locale, DateTime } from './config.js';
import { defaultLink2 } from './config.js';         // ⬅️ add this
import { checkNumberValidity } from './validation.js';
import { choosedDate } from './appointments.js';
import { saveUser, clearUser } from './storage.js';

export function startTimer(duration, display) {
  const holder = document.getElementById("resend-objects");
  if (holder && holder.style) holder.style.display = "block";
  try { const r = document.getElementById("page6-resend"); if (r) r.remove(); } catch {}

  let timer = duration;
  const intervalId = setInterval(() => {
    const minutes = String(parseInt(timer / 60, 10)).padStart(2, '0');
    const seconds = String(parseInt(timer % 60, 10)).padStart(2, '0');
    if (display) display.textContent = minutes + ":" + seconds;
    timer -= 1;

    if (timer < 0) {
      clearInterval(intervalId);
      const timerElement = document.getElementById("resend-objects");
      if (!timerElement) return;

      const btn = document.createElement("button");
      btn.id = "page6-resend";
      btn.className = "filter-button";
      btn.type = "button";
      const sp = document.createElement("span");
      sp.textContent = "إعادة ارسال";
      btn.appendChild(sp);

      timerElement.after(btn);
      timerElement.style.display = "none";

      const contact = document.getElementById("page6-contact");
      if (contact) contact.style.display = "block";
    }
  }, 1000);
}

export function wirePager(nForm, iti) {
  window.choosedDate = (t, d, i) => choosedDate(t, d, i, nForm);

  for (let i = 1; i < 7; i++) {
    if (i === 4) continue;

    const btnNext = document.getElementById(`page${i}-button`);
    const page = document.getElementById(`page${i}`);
    const pageNext = document.getElementById(`page${i + 1}`);
    if (!btnNext) continue;

    if (i === 2) {
      btnNext.onclick = () => {
        const area = document.getElementById("area");
        if (!area.value) {
          document.getElementById("page2-form").reportValidity();
          return;
        }
        page.classList.remove("fadeIn"); page.classList.add("fadeOut");
        pageNext.classList.remove("fadeOut"); pageNext.classList.add("fadeIn");
        setTimeout(() => { page.style.display = "none"; pageNext.style.display = "flex"; }, 1000);
        nForm.location = area.value;
      };
    } else if (i === 3) {
      btnNext.onclick = () => {
        const cat = document.getElementById("serviceCat");
        const svc = document.getElementById("service");
        const count = document.getElementById("serviceCount");
        const form = document.getElementById("page3-form");

        try {
          const c = parseInt(count.value || "0", 10);
          if (isNaN(c) || c < 1 || c > 10) {
            if (locale === "en") count.setCustomValidity("Must be between 1 and 10");
            else count.setCustomValidity("لابد أن يكون بين 1 و 10");
            throw new Error("bad count");
          }
          count.setCustomValidity("");
        } catch {
          form.reportValidity();
          return;
        }

        if (!cat.value || !svc.value) {
          cat.style.borderColor = cat.value ? 'green' : 'red';
          svc.style.borderColor = svc.value ? 'green' : 'red';
          cat.style.borderWidth = 'thin';
          svc.style.borderWidth = 'thin';
          return;
        }

        nForm.customerN = (document.getElementById("name")?.value || "").trim();
        nForm.serviceCat = cat.value;
        nForm.service = svc.value;
        nForm.serviceCount = count.value;

        page.classList.remove("fadeIn"); page.classList.add("fadeOut");
        pageNext.classList.remove("fadeOut"); pageNext.classList.add("fadeIn");
        setTimeout(() => { page.style.display = "none"; pageNext.style.display = "flex"; }, 1000);
      };
    } else if (i === 5) {
      btnNext.onclick = () => {
        const nameEl = document.getElementById("name");
        const form = document.getElementById("page5-form");
        const paying = document.querySelector('input[name="payingMethod"]:checked')?.value;

        try {
          if (!paying) throw new Error("no payment");
          if (!nameEl.value.trim()) {
            if (locale === "en") nameEl.setCustomValidity("Required field");
            else nameEl.setCustomValidity("يُرجى ملئ هذا الحقل");
            throw new Error("no name");
          }
          nameEl.setCustomValidity("");
        } catch {
          form.reportValidity();
          return;
        }

        if (!checkNumberValidity(iti)) {
          form.reportValidity();
          return;
        }

        nForm.paymentMethod = paying;
        nForm.customerN = nameEl.value.trim();
        nForm.customerM = iti.getNumber().substring(1);

        page.classList.remove("fadeIn"); page.classList.add("fadeOut");
        pageNext.classList.remove("fadeOut"); pageNext.classList.add("fadeIn");
        setTimeout(() => { page.style.display = "none"; pageNext.style.display = "flex"; }, 1000);
      };
    } else if (i === 6) {
      btnNext.onclick = () => {
        const mapState = window.NAHL_MAPS || {};
        const pos = mapState.position;
        if (!pos) {
          if (mapState.map && mapState.infoWindow) {
            mapState.infoWindow.setPosition(mapState.map.getCenter());
            mapState.infoWindow.setContent("الرجاء تحديد الموقع");
            mapState.infoWindow.open(mapState.map);
          }
          return;
        }

        const modalEl = document.getElementById('termsModal');
        const modal = new bootstrap.Modal(modalEl);
        const chk = document.getElementById('termsAccept');
        const ok = document.getElementById('confirmTerms');

        chk.checked = false;
        ok.disabled = true;
        chk.onchange = () => { ok.disabled = !chk.checked; };
        modal.show();

        ok.onclick = () => {
          modal.hide();

          const backBtn = document.getElementById(`page${i}-return`);
          backBtn.style.display = "none";
          btnNext.style.display = "none";

          const pageSpinner = document.getElementById(`page${i}-spinner`);
          const fail = document.getElementById(`fail-alert-5`);
          fail.style.display = "none";
          pageSpinner.style.display = "flex";
          pageSpinner.children[0].style.display = "block";
          pageSpinner.children[1].style.display = "block";

          nForm.urlLocation = pos;

          const desc = document.getElementById("locationDescription");
          if (desc && desc.value.trim().length > 200) {
            if (locale === "en") desc.setCustomValidity("Description is too long");
            else desc.setCustomValidity("الوصف أطول من المتوقع");
            document.getElementById("page6-form").reportValidity();
            backBtn.style.display = "inline-block";
            btnNext.style.display = "inline-block";
            pageSpinner.style.display = "none";
            pageSpinner.children[0].style.display = "none";
            pageSpinner.children[1].style.display = "none";
            return;
          }
          if (desc) {
            desc.setCustomValidity("");
            nForm.locationDescription = desc.value;
          }

          fetch(`${defaultLink2}/reserveAppointment`, {
            redirect: "follow",
            method: "POST",
            body: JSON.stringify(nForm)
          }).then(async (res) => {
            pageSpinner.style.display = 'none';
            if (!res.ok) throw Object.assign(new Error('Custom error'), { response: res });
            const json = await res.json();
            if (json.success) {
              page.classList.remove("fadeIn"); page.classList.add("fadeOut");
              const done = document.getElementById(`page${i + 1}`);
              done.classList.remove("fadeOut"); done.classList.add("fadeIn");
              setTimeout(() => {
                page.style.display = "none";
                done.style.display = "flex";
                if (confirm("عزيزنا/عزيزتنا, ودك نتذكر بياناتك على هذا الجهاز لتسهيل الغسلات الجاية ؟")) {
                  saveUser({ name: document.getElementById("name").value, mobile: iti.getNumber().substring(1) });
                } else {
                  clearUser();
                }
              }, 1000);
            }
          }).catch(async (err) => {
            const resJson = err.response ? await err.response.json() : {};
            backBtn.style.display = "inline-block";
            btnNext.style.display = "inline-block";

            page.classList.remove("fadeIn"); page.classList.add("fadeOut");
            page.style.display = "none";
            const backTo4 = document.getElementById(`page4`);
            backTo4.classList.remove("fadeOut"); backTo4.classList.add("fadeIn");
            backTo4.style.display = "flex";

            const fail3 = document.getElementById(`fail-alert-3`);
            fail3.style.display = "block";
            fail3.children[0].innerHTML =
              locale === "en"
              ? (resJson.msgEN || "Unexpected error, Please contact us")
              : (resJson.msgAR || "عذرًا حصل خطأ غير متوقع الرجاء التواصل معنا");
            fail3.children[2].innerHTML = "";

            document.getElementById('date').dispatchEvent(new Event('change'));
          });
        };
      };
    } else {
      btnNext.onclick = () => {
        page.classList.remove("fadeIn"); page.classList.add("fadeOut");
        pageNext.classList.remove("fadeOut"); pageNext.classList.add("fadeIn");
        setTimeout(() => { page.style.display = "none"; pageNext.style.display = "flex"; }, 1000);
      };
    }
  }

  for (let i = 3; i < 7; i++) {
    const btnBack = document.getElementById(`page${i}-return`);
    if (!btnBack) continue;
    const page = document.getElementById(`page${i}`);
    const prev = (i === 4) ? document.getElementById(`page2`) : document.getElementById(`page${i - 1}`);
    btnBack.onclick = () => {
      page.classList.remove("fadeIn"); page.classList.add("fadeOut");
      prev.classList.remove("fadeOut"); prev.classList.add("fadeIn");
      setTimeout(() => { page.style.display = "none"; prev.style.display = "flex"; }, 1000);
    };
  }
}
