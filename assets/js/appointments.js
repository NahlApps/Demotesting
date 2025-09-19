import { DateTime, dayjs, locale, weekdaysAR, weekdaysEN } from './config.js';
import { callContent2 } from './api.js';

// state
export let appointments = [[], [], []];
export let ActualTimes = [[], [], []];
export let timesLoaded = false;

function headerWeekdayName(dt) {
  const idx = dt.weekday % 7; // luxon: 1..7
  return (locale === 'ar') ? weekdaysAR[idx - 1] : weekdaysEN[idx - 1];
}

export function setupInitialDates() {
  const d1 = DateTime.now();
  const d2 = d1.plus({ days: 1 });
  const d3 = d1.plus({ days: 2 });
  const dates = [d1, d2, d3];

  for (let i = 1; i <= 3; i++) {
    document.getElementById(`day${i}`).innerText = headerWeekdayName(dates[i - 1]);
    document.getElementById(`day${i}date`).innerText = dates[i - 1].toFormat('yyyy-MM-dd');
  }

  const min = new Date().toLocaleDateString("fr-ca");
  document.getElementById("date").setAttribute("min", min);
  document.getElementById("date").value = DateTime.now().toFormat('yyyy-MM-dd');
}

// render times for a given day index (0,1,2)
export function timesSetter(index) {
  const timeContainer = document.getElementById("time-container");
  $("#time-container").empty();
  timeContainer.innerHTML = "";

  if (appointments[index].length === 0) {
    timeContainer.innerHTML = `
      <div role="status" style="grid-column-start: span 3;justify-self: center;">
        <span>لا توجد مواعيد متاحة</span>
      </div>`;
    return;
  }

  for (let y = 0; y < appointments[index].length; y++) {
    timeContainer.innerHTML += `
      <button onclick="window.choosedDate('${ActualTimes[index][y]}','${document.getElementById(`day${index+1}date`).innerText}',4)" class="time-button" dir="ltr">
        ${appointments[index][y]}
      </button>`;
  }
}

export function wireDateChange(nForm) {
  document.getElementById('date').onchange = () => {
    const dateEl = document.getElementById('date');
    dateEl.disabled = true;
    document.getElementById('time-container').innerHTML = `
      <div id="department-spinner" class="spinner-border" role="status" style="grid-column-start: span 3;justify-self: center;">
        <span class="sr-only">Loading...</span>
      </div>`;

    ActualTimes = [[], [], []];
    appointments = [[], [], []];
    timesLoaded = false;

    const day1 = DateTime.fromISO(dateEl.value);
    const day2 = day1.plus({ days: 1 });
    const day3 = day1.plus({ days: 2 });
    const datesSet = [day1, day2, day3];

    for (let i = 1; i <= 3; i++) {
      document.getElementById(`day${i}`).innerText = headerWeekdayName(datesSet[i - 1]);
      document.getElementById(`day${i}date`).innerText = datesSet[i - 1].toFormat('yyyy-MM-dd');
    }

    const location = document.getElementById("area").value;
    const service = document.getElementById("service").value;

    callContent2(`/appointments?startDate=${day1.toFormat('yyyy-MM-dd')}&location=${location}&service=${service}`, (data) => {
      const received = data.data.appointments || [];
      const tmpActualTimes = [];

      for (let i = 0; i < received.length; i++) {
        const x = DateTime.fromISO(received[i]['TS_appointment_date'], { setZone: true });
        const y = DateTime.fromISO(received[i]['TS_appointment_time'], { setZone: true });
        received[i]['TS_appointment_date'] = x.toISODate();
        received[i]['TS_appointment_time'] = y.toLocaleString(DateTime.TIME_SIMPLE).replace(" ", " ");
        tmpActualTimes[i] = y.toFormat('hh:mm a');
      }

      for (let i = 0; i < received.length; i++) {
        const d = received[i]["TS_appointment_date"];
        if (d === day1.toFormat('yyyy-MM-dd')) {
          appointments[0].push(received[i]['TS_appointment_time']);
          ActualTimes[0].push(tmpActualTimes[i]);
        } else if (d === day2.toFormat('yyyy-MM-dd')) {
          appointments[1].push(received[i]['TS_appointment_time']);
          ActualTimes[1].push(tmpActualTimes[i]);
        } else if (d === day3.toFormat('yyyy-MM-dd')) {
          appointments[2].push(received[i]['TS_appointment_time']);
          ActualTimes[2].push(tmpActualTimes[i]);
        }
      }

      timesLoaded = true;
      timesSetter(0); // initially render day 1
      dateEl.disabled = false;
    }, true);
  };
}

// choose time + navigate to next page
export function choosedDate(timeLabel, dateISO, currentPage, nForm) {
  nForm.date = dateISO;
  const parts = timeLabel.split(" ");
  const parsedTime = DateTime.fromFormat(parts.join(" "), "h:mm a");
  nForm.time = parsedTime.toFormat("HH:mm");

  const p1 = document.getElementById(`page${currentPage}`);
  const p2 = document.getElementById(`page${currentPage + 1}`);
  p1.classList.remove("fadeIn"); p1.classList.add("fadeOut");
  p2.classList.remove("fadeOut"); p2.classList.add("fadeIn");
  setTimeout(() => { p1.style.display = "none"; p2.style.display = "flex"; }, 1000);
}
