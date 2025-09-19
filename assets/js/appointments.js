// assets/js/appointments.js
import { fetchAppointments } from "./api.js";
import { DateTime, els, weekdaysAR } from "./config.js";

let appointments = [[], [], []];
let actualTimes = [[], [], []];

export function initAppointments() {
  // Min date today
  const dateEl = els.date();
  if (!dateEl) return;
  try {
    dateEl.setAttribute("min", new Date().toLocaleDateString("fr-ca"));
  } catch {}
  // default value
  dateEl.value = DateTime.now().toFormat("yyyy-MM-dd");

  // Header days
  setHeaderDays(DateTime.now());

  // First fetch once service/area loaded
  dateEl.addEventListener("change", () => onDateChange());
}

function setHeaderDays(day1) {
  const day2 = day1.plus({ days: 1 });
  const day3 = day1.plus({ days: 2 });
  const dates = [day1, day2, day3];

  for (let i = 1; i <= 3; i++) {
    const dw = weekdaysAR[dates[i - 1].weekday % 7];
    document.getElementById(`day${i}`).innerText = dw;
    document.getElementById(`day${i}date`).innerText = dates[i - 1].toFormat("yyyy-MM-dd");
  }
}

async function onDateChange() {
  const dateEl = els.date();
  const areaEl = els.area();
  const svcEl = els.service();
  const container = els.timeContainer();
  if (!dateEl || !areaEl || !svcEl || !container) return;

  // disable input while loading
  dateEl.disabled = true;
  container.innerHTML = loadingMarkup();

  appointments = [[], [], []];
  actualTimes = [[], [], []];

  const d1 = DateTime.fromISO(dateEl.value);
  const d2 = d1.plus({ days: 1 });
  const d3 = d1.plus({ days: 2 });
  setHeaderDays(d1);

  try {
    const data = await fetchAppointments(d1.toFormat("yyyy-MM-dd"), areaEl.value, svcEl.value);
    const arr = data?.data?.appointments || [];

    // normalize
    const tmpActual = [];
    for (let i = 0; i < arr.length; i++) {
      const x = DateTime.fromISO(arr[i]["TS_appointment_date"], { setZone: true });
      const y = DateTime.fromISO(arr[i]["TS_appointment_time"], { setZone: true });
      arr[i]["TS_appointment_date"] = x.toISODate();
      arr[i]["TS_appointment_time"] = y.toLocaleString(DateTime.TIME_SIMPLE).replace(" ", " ");
      tmpActual[i] = y.toFormat("hh:mm a");
    }

    for (let i = 0; i < arr.length; i++) {
      const when = arr[i]["TS_appointment_date"];
      const t = arr[i]["TS_appointment_time"];
      const a = tmpActual[i];

      if (when === d1.toFormat("yyyy-MM-dd")) { appointments[0].push(t); actualTimes[0].push(a); }
      else if (when === d2.toFormat("yyyy-MM-dd")) { appointments[1].push(t); actualTimes[1].push(a); }
      else if (when === d3.toFormat("yyyy-MM-dd")) { appointments[2].push(t); actualTimes[2].push(a); }
    }

    // Show first day's times
    renderTimes(0);
  } catch (err) {
    console.error("[appointments]", err);
    container.innerHTML = `<div style="grid-column: 1/-1; text-align:center;">حدث خطأ في جلب المواعيد</div>`;
  } finally {
    dateEl.disabled = false;
  }
}

function loadingMarkup() {
  return `
    <div id="department-spinner" class="spinner-border" role="status"
         style="grid-column: 1 / -1; justify-self: center;">
      <span class="sr-only">Loading...</span>
    </div>`;
}

export function renderTimes(index) {
  const container = els.timeContainer();
  container.innerHTML = "";

  if (!appointments[index]?.length) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; justify-self: center;">لا توجد مواعيد متاحة</div>
    `;
    return;
  }

  for (let y = 0; y < appointments[index].length; y++) {
    const btn = document.createElement("button");
    btn.className = "time-button";
    btn.dir = "ltr";
    btn.textContent = appointments[index][y];
    const date = document.getElementById(`day${index + 1}date`).innerText;
    const time = actualTimes[index][y];
    btn.addEventListener("click", () => window.choosedDate(time, date, 4));
    container.appendChild(btn);
  }
}

// Exposed for inline onclicks created at runtime
window.choosedDate = (time, date, i) => {
  // i == page index (4) from original
  const dt = DateTime.fromFormat(time, "h:mm a");
  const nForm = window.__nForm || (window.__nForm = {});

  nForm.date = date;
  nForm.time = dt.toFormat("HH:mm");

  // transition to next page
  const p1 = document.getElementById(`page${i}`);
  const p2 = document.getElementById(`page${i + 1}`);
  p1.classList.remove("fadeIn"); p1.classList.add("fadeOut");
  p2.classList.remove("fadeOut"); p2.classList.add("fadeIn");
  setTimeout(() => { p1.style.display = "none"; p2.style.display = "flex"; }, 1000);
};

export { onDateChange }; // used by services change
