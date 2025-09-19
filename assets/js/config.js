// config.js
// Central config + shared state + tiny DOM helpers

export const defaultLink2 =
  "https://nahl-platform.vercel.app/api/app/AM/general/33e0d05d-d771-46f4-a7e7-7c634b4e3a9e/form";

export const acceptedHourdiff = 1;
export const acceptedMindiff = 30;

export const DateTime = luxon.DateTime;

// Global app state (kept simple)
export const STATE = {
  controllers: [],
  services: null,
  serviceCategories: null,
  appointments: [[], [], []],
  actualTimes: [[], [], []],
  timesLoaded: false,
  nForm: {
    date: "",
    time: "",
    location: "",
    service: "",
    serviceCount: "",
    serviceCat: "",
    customerM: "",
    customerN: "",
    paymentMethod: "",
    urlLocation: "",
    locationDescription: "",
  },
  locale: "ar",
  positionUrl: "", // google maps link
  polygon: null,
  map: null,
  marker: null,
  infoWindow: null
};

// query helpers
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

// element refs used across modules (lazy getters to avoid null at import time)
export const els = {
  area: () => $("#area"),
  service: () => $("#service"),
  serviceCat: () => $("#serviceCat"),
  dateInput: () => $("#date"),
  timeContainer: () => $("#time-container"),
  failAlert3: () => $("#fail-alert-3"),
  page: (i) => $(`#page${i}`),
  pageBtn: (i) => $(`#page${i}-button`),
  pageBack: (i) => $(`#page${i}-return`),
  name: () => $("#name"),
  mobile: () => $("#mobile"),
  carBrand: () => $("#carBrand"),
  carName: () => $("#carName"),
  plateNumber: () => $("#plateNumber"),
  locationDescription: () => $("#locationDescription"),
  page2Spinner: () => $("#page2-spinner"),
  googleMap: () => $("#googleMap"),
  page3Wait: () => $("#page3-wait"),
  page6Spinner: () => $("#page6-spinner"),
  failAlert5: () => $("#fail-alert-5"),
};
