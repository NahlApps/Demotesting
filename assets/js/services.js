import { locale } from './config.js';

export function add_dropdown_list(show_list, value_list, element_id, _first_option_disabled, key = null) {
  const parentElement = document.getElementById(element_id);
  parentElement.innerHTML = "";

  const first = document.createElement("option");
  first.text = show_list[0];
  first.value = value_list[0];
  if (key) first.setAttribute("data-i18n-key", key);
  first.setAttribute("selected", "selected");
  parentElement.appendChild(first);

  for (let i = 1; i < value_list.length; i++) {
    const opt = document.createElement("option");
    opt.text = show_list[i];
    opt.value = value_list[i];
    if (key) opt.setAttribute("data-i18n-key", key);
    parentElement.appendChild(opt);
  }
  parentElement.dispatchEvent(new Event('change'));
}

export function valueLookUp(list, lookupValuesList, indexLookupValuesList, targetIndex) {
  if (!list.length) return [];
  const out = [];
  for (let c = 0; c < list.length; c++) {
    let ok = true;
    for (let s = 0; s < lookupValuesList.length; s++) {
      if (lookupValuesList[s] !== list[c][indexLookupValuesList[s]]) { ok = false; break; }
    }
    if (ok) out.push(list[c][targetIndex]);
  }
  return out;
}

export function servicesDropdownLoader2(grouped) {
  const categoriesID = Object.keys(grouped);
  if (!categoriesID.length) {
    const catEl = document.getElementById('serviceCat');
    const svcEl = document.getElementById('service');
    if (catEl) catEl.innerHTML = '';
    if (svcEl) svcEl.innerHTML = '';
    return;
  }
  const catSelect = document.getElementById('serviceCat');
  const svcSelect = document.getElementById('service');
  if (catSelect && catSelect.parentNode) {
    const clone = catSelect.cloneNode(false);
    catSelect.parentNode.replaceChild(clone, catSelect);
  }
  if (svcSelect && svcSelect.parentNode) {
    const clone = svcSelect.cloneNode(false);
    svcSelect.parentNode.replaceChild(clone, svcSelect);
  }

  const categoriesNames = [];

  for (const id of categoriesID) {
    if (locale === 'en') categoriesNames.push(grouped[id].category.TS_category_english_name);
    else categoriesNames.push(grouped[id].category.TS_category_arabic_name);
  }

  add_dropdown_list(categoriesNames, categoriesID, "serviceCat", "disabled", "servicesCat");

  document.getElementById('service').innerHTML = "";

  document.getElementById('serviceCat').addEventListener('change', function () {
    const currentCategory = document.getElementById("serviceCat").value;
    const myServicesID = [];
    const myServiceNames = [];

    const sorted = grouped[currentCategory].services.slice().sort((a, b) => a.TS_service_id - b.TS_service_id);
    for (const element of sorted) {
      myServicesID.push(element.TS_service_id);
      myServiceNames.push(locale === "en" ? element.TS_service_english_name : element.TS_service_arabic_name);
    }
    add_dropdown_list(myServiceNames, myServicesID, "service", "disabled", "services");
  });

  document.getElementById('service').addEventListener('change', function () {
    // Trigger appointment refresh when service changes
    document.getElementById('date').dispatchEvent(new Event('change'));
  });

  // init once
  document.getElementById('serviceCat').dispatchEvent(new Event('change'));
}
