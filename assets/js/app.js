import { initPhoneInput } from './phone.js';
import { loadUser } from './storage.js';
import { mountBrands, updateLocationDescription } from './brands.js';
import { validatePlateNumber } from './validation.js';
import { setupInitialDates, wireDateChange } from './appointments.js';
import { callContent2 } from './api.js';
import { servicesDropdownLoader2 } from './services.js';
import { wirePager } from './navigation.js';

const nForm = {
  date: '',
  time: '',
  location: '',
  service: '',
  serviceCount: '',
  serviceCat: '',
  customerM: '',
  customerN: '',
  paymentMethod: '',
  urlLocation: '',
  locationDescription: '',
};

function stubPhone(input) {
  return {
    getNumber() {
      const raw = input?.value || '';
      const clean = raw.startsWith('+') ? raw : `+${raw.replace(/^\+/, '')}`;
      return clean;
    },
    getSelectedCountryData() { return { dialCode: '' }; },
    isValidNumber() { return true; },
    getValidationError() { return 0; },
    setNumber(value) {
      if (!input) return;
      input.value = value?.replace(/^\+/, '') || '';
    },
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const $ = window.jQuery || window.$;
  if (!$) {
    console.error('jQuery is required for the booking form.');
    return;
  }

  window.handleSubmit = (event) => { if (event) event.preventDefault(); };

  const mobileInput = document.getElementById('mobile');
  const iti = initPhoneInput(mobileInput) || stubPhone(mobileInput);

  const stored = loadUser();
  if (stored.name) {
    const nameEl = document.getElementById('name');
    if (nameEl) nameEl.value = stored.name;
  }
  if (stored.mobile) {
    try {
      iti.setNumber(`+${stored.mobile.replace(/^\+/, '')}`);
    } catch (_) {
      if (mobileInput) mobileInput.value = stored.mobile;
    }
  }

  mountBrands();

  document.getElementById('carName')?.addEventListener('input', updateLocationDescription);
  const plate = document.getElementById('plateNumber');
  if (plate) {
    plate.addEventListener('input', (event) => {
      validatePlateNumber(event.target);
      updateLocationDescription();
    });
  }

  const locationDescription = document.getElementById('locationDescription');
  if (locationDescription) {
    nForm.locationDescription = locationDescription.value;
    locationDescription.addEventListener('input', () => {
      nForm.locationDescription = locationDescription.value;
    });
  }

  setupInitialDates();
  wireDateChange(nForm);

  const areaSpinner = document.getElementById('page2-spinner');
  const serviceSpinner = document.getElementById('page3-2-spinner');
  const categorySpinner = document.getElementById('page3-1-spinner');

  const areaSelect = $('#area');
  if (areaSpinner) areaSpinner.style.display = 'block';

  callContent2('/locations', (data) => {
    const locations = (data && data.data) || [];
    const selectData = locations
      .map((loc) => ({ id: loc.id, text: loc.TS_location_arabic_name }))
      .sort((a, b) => a.id - b.id);

    areaSelect.select2({ data: selectData, width: '90%' });
    if (areaSpinner) areaSpinner.style.display = 'none';

    if (selectData.length) {
      areaSelect.val(selectData[0].id).trigger('change');
    } else {
      hideServiceSpinners();
    }
  });

  function hideServiceSpinners() {
    if (serviceSpinner) serviceSpinner.style.display = 'none';
    if (categorySpinner) categorySpinner.style.display = 'none';
  }

  $('#area').on('change', () => {
    const areaValue = document.getElementById('area').value;
    if (categorySpinner) categorySpinner.style.display = 'block';
    if (serviceSpinner) serviceSpinner.style.display = 'block';

    callContent2(`/services?location=${areaValue}`, (payload) => {
      const services = payload?.data?.services || [];
      const serviceCategories = payload?.data?.servicesCat || [];
      const grouped = {};

      services.forEach((service) => {
        const id = service.TS_category_id;
        if (!grouped[id]) {
          grouped[id] = {
            category: serviceCategories.find((cat) => cat.TS_category_id === id) || {},
            services: [],
          };
        }
        grouped[id].services.push(service);
      });

      servicesDropdownLoader2(grouped);
      hideServiceSpinners();
      const dateEl = document.getElementById('date');
      if (dateEl) dateEl.dispatchEvent(new Event('change'));
    }, true);

    if (typeof window.setBoundries === 'function') {
      window.setBoundries();
    }
  });

  wirePager(nForm, iti);

  const rebook = document.getElementById('rebook');
  if (rebook) {
    rebook.addEventListener('click', () => {
      try {
        window.location.href = 'https://www.spongnsoap.com/';
      } catch (_) {}
    });
  }
});
