// assets/js/api.js
import { defaultLink2 } from "./config.js";

let controllers = []; // [controller, signal]

export async function callContent(path, { abortable = false } = {}) {
  let signal;
  if (abortable) {
    controllers.forEach(([c]) => c.abort());
    controllers = [];
    const controller = new AbortController();
    signal = controller.signal;
    controllers.push([controller, signal]);
  }

  await new Promise((r) => setTimeout(r, 300)); // tiny debounce
  const res = await fetch(`${defaultLink2}${path}`, {
    method: "GET",
    redirect: "follow",
    ...(abortable ? { signal } : {}),
  });
  if (!res.ok) throw new Error(`GET ${path} failed (${res.status})`);
  return res.json();
}

export async function callContentRetry(path, { abortable = true, retries = 3 } = {}) {
  try {
    return await callContent(path, { abortable });
  } catch (err) {
    if (retries > 0) {
      console.warn("[api] retry", retries, path);
      await new Promise((r) => setTimeout(r, 1000));
      return callContentRetry(path, { abortable, retries: retries - 1 });
    }
    throw err;
  }
}

// Convenience wrappers
export const fetchLocations = () => callContentRetry(`/locations`, { abortable: true });

export const fetchServices = (locationId) =>
  callContentRetry(`/services?location=${encodeURIComponent(locationId)}`, { abortable: true });

export const fetchAppointments = (isoDate, locationId, serviceId) => {
  const qs = `startDate=${encodeURIComponent(isoDate)}&location=${encodeURIComponent(locationId)}&service=${encodeURIComponent(serviceId)}`;
  return callContentRetry(`/appointments?${qs}`, { abortable: true });
};

export async function reserveAppointment(payload) {
  const res = await fetch(`${defaultLink2}/reserveAppointment`, {
    method: "POST",
    redirect: "follow",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = new Error("Reservation failed");
    err.response = await res.json().catch(() => ({}));
    throw err;
  }
  return res.json();
}
