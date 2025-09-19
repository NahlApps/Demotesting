// Populate car brands + select2 wiring + helpers
export const carBrands = [
  "Acura","Alfa Romeo","Aston Martin","Audi","Bentley","BMW","Bugatti","Buick",
  "Cadillac","Chevrolet","Chrysler","Citroën","Dacia","Daewoo","Daihatsu","Dodge",
  "Ferrari","Fiat","Ford","Genesis","GMC","Haval","Holden","Honda","Hummer",
  "Hyundai","Infiniti","Isuzu","Jaguar","Jeep","Kia","Koenigsegg","Lada",
  "Lamborghini","Lancia","Land Rover","Lexus","Lincoln","Lotus","Maserati",
  "Maybach","Mazda","McLaren","Mercedes-Benz","Mercury","MG","Mini","Mitsubishi",
  "Nissan","Opel","Pagani","Peugeot","Plymouth","Pontiac","Porsche","RAM",
  "Renault","Rolls-Royce","Saab","Saturn","Scion","Seat","Skoda","Smart",
  "SsangYong","Subaru","Suzuki","Tata","Tesla","Toyota","Volkswagen",
  "Volvo","Wiesmann","Zotye"
].sort();

export function mountBrands() {
  const sel = $('#carBrand');
  carBrands.forEach(b => sel.append(`<option value="${b}">${b}</option>`));
  sel.select2({ placeholder: "Select a car brand", allowClear: true });
}

export function updateLocationDescription() {
  const brand = document.getElementById("carBrand").value || "";
  const name = document.getElementById("carName").value || "";
  const plate = document.getElementById("plateNumber").value || "";
  const desc = [brand, name, plate].filter(Boolean).join(", ");
  document.getElementById("locationDescription").value = desc;
}

// expose for inline oninput in HTML
window.updateLocationDescription = updateLocationDescription;
