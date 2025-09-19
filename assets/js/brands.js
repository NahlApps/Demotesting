// assets/js/brands.js

const carBrands = [
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

export function initBrands() {
  const sel = document.getElementById("carBrand");
  if (!sel) return;

  // Keep "Other" if present (index 0)
  const hasOther = Array.from(sel.options).some(o => o.value === "Other");
  if (!hasOther) {
    const other = document.createElement("option");
    other.value = "Other"; other.text = "Other";
    sel.appendChild(other);
  }

  for (const brand of carBrands) {
    const op = document.createElement("option");
    op.value = brand;
    op.textContent = brand;
    sel.appendChild(op);
  }

  // Select2
  if (window.$ && typeof window.$.fn.select2 === "function") {
    window.$("#carBrand").select2({
      placeholder: "Select a car brand",
      allowClear: true
    });
  }
}
