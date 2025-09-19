import { defaultLink2 } from './config.js';

let controllers = [];
export function abortAll() {
  for (const [c] of controllers) c.abort();
  controllers = [];
}

export async function callContent(routText, callback, abortable = false) {
  let signal = undefined;
  if (abortable) {
    abortAll();
    const controller = new AbortController();
    signal = controller.signal;
    controllers.push([controller, signal]);
  }
  await new Promise(r => setTimeout(r, 1000));

  fetch(defaultLink2 + `?content=${routText}`, { redirect: "follow", method: "GET", ...(abortable && { signal }) })
    .then(async (response) => callback(await response.json()))
    .catch(err => console.log("Error:", err));
}

export async function callContent2(routText, callback, abortable = false, retries = 3) {
  let signal = undefined;
  if (abortable) {
    abortAll();
    const controller = new AbortController();
    signal = controller.signal;
    controllers.push([controller, signal]);
  }
  await new Promise(r => setTimeout(r, 1000));

  fetch(defaultLink2 + `${routText}`, { redirect: "follow", method: "GET", ...(abortable && { signal }) })
    .then(async (response) => {
      if (!response.ok) {
        if (retries > 0) return callContent2(routText, callback, abortable, retries - 1);
        throw new Error('Network response was not ok');
      }
      callback(await response.json());
    })
    .catch(err => {
      console.log("Error:", err);
      if (!String(err.message).includes("aborted")) {
        setTimeout(() => {
          if (retries > 0) return callContent2(routText, callback, abortable, retries - 1);
        }, 2000);
      }
    });
}
