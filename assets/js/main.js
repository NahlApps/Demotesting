import { locale, DateTime } from './config.js';
import { translations } from './i18n.js';
import { loadUser } from './storage.js';
import { callContent2 } from './api.js';
import { servicesDropdownLoader2 } from './services.js';
import { setupInitialDates, wireDateChange } from './appointments.js';
import { wirePager } from './navigation.js';
import { myMap, setBoundries, detectMyLocation } from './maps.js';
import { mountBrands } from './brands.js';

// 1) Global helpers required by inline HTML attributes
window.handleSubmit = (e) => e.preventDefault();

// 2) Init intl-tel-input
const input = document.querySelector("#mobile");
const iti = window.intlTelInput(input, {
  utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@24.4.0/build/js/utils.js",
  countryOrder:["sa","qa"],
  initialCountry:"sa",
  onlyCountries:["sa","qa","ae","om","kw","bh"],
  excludeCountries:["il"],
  strictMode:true,
  i18n: {
    ac:"جزيرة أسينشين", ad:"أندورا", ae:"الإمارات العربية المتحدة", af:"أفغانستان", ag:"أنتيغوا وبربودا", ai:"أنغويلا",
    al:"ألبانيا", am:"أرمينيا", ao:"أنغولا", ar:"الأرجنتين", as:"ساموا الأمريكية", at:"النمسا", au:"أستراليا", aw:"أروبا",
    ax:"جزر آلاند", az:"أذربيجان", ba:"البوسنة والهرسك", bb:"بربادوس", bd:"بنغلاديش", be:"بلجيكا", bf:"بوركينا فاسو",
    bg:"بلغاريا", bh:"البحرين", bi:"بوروندي", bj:"بنين", bl:"سان بارتليمي", bm:"برمودا", bn:"بروناي", bo:"بوليفيا",
    bq:"هولندا الكاريبية", br:"البرازيل", bs:"جزر البهاما", bt:"بوتان", bw:"بوتسوانا", by:"بيلاروس", bz:"بليز", ca:"كندا",
    cc:"جزر كوكوس (كيلينغ)", cd:"الكونغو - كينشاسا", cf:"جمهورية أفريقيا الوسطى", cg:"الكونغو - برازافيل", ch:"سويسرا",
    ci:"ساحل العاج", ck:"جزر كوك", cl:"تشيلي", cm:"الكاميرون", cn:"الصين", co:"كولومبيا", cr:"كوستاريكا", cu:"كوبا",
    cv:"الرأس الأخضر", cw:"كوراساو", cx:"جزيرة كريسماس", cy:"قبرص", cz:"التشيك", de:"ألمانيا", dj:"جيبوتي",
    dk:"الدانمرك", dm:"دومينيكا", do:"جمهورية الدومينيكان", dz:"الجزائر", ec:"الإكوادور", ee:"إستونيا", eg:"مصر",
    eh:"الصحراء الغربية", er:"إريتريا", es:"إسبانيا", et:"إثيوبيا", fi:"فنلندا", fj:"فيجي", fk:"جزر فوكلاند",
    fm:"ميكرونيزيا", fo:"جزر فارو", fr:"فرنسا", ga:"الغابون", gb:"المملكة المتحدة", gd:"غرينادا", ge:"جورجيا",
    gf:"غويانا الفرنسية", gg:"غيرنزي", gh:"غانا", gi:"جبل طارق", gl:"غرينلاند", gm:"غامبيا", gn:"غينيا",
    gp:"غوادلوب", gq:"غينيا الاستوائية", gr:"اليونان", gt:"غواتيمالا", gu:"غوام", gw:"غينيا بيساو", gy:"غيانا",
    hk:"هونغ كونغ الصينية (منطقة إدارية خاصة)", hn:"هندوراس", hr:"كرواتيا", ht:"هايتي", hu:"هنغاريا", id:"إندونيسيا",
    ie:"أيرلندا", im:"جزيرة مان", in:"الهند", io:"الإقليم البريطاني في المحيط الهندي", iq:"العراق", ir:"إيران",
    is:"آيسلندا", it:"إيطاليا", je:"جيرسي", jm:"جامايكا", jo:"الأردن", jp:"اليابان", ke:"كينيا", kg:"قيرغيزستان",
    kh:"كمبوديا", ki:"كيريباتي", km:"جزر القمر", kn:"سانت كيتس ونيفيس", kp:"كوريا الشمالية", kr:"كوريا الجنوبية",
    kw:"الكويت", ky:"جزر كايمان", kz:"كازاخستان", la:"لاوس", lb:"لبنان", lc:"سانت لوسيا", li:"ليختنشتاين",
    lk:"سريلانكا", lr:"ليبيريا", ls:"ليسوتو", lt:"ليتوانيا", lu:"لوكسمبورغ", lv:"لاتفيا", ly:"ليبيا", ma:"المغرب",
    mc:"موناكو", md:"مولدوفا", me:"الجبل الأسود", mf:"سان مارتن", mg:"مدغشقر", mh:"جزر مارشال", mk:"مقدونيا الشمالية",
    ml:"مالي", mm:"ميانمار (بورما)", mn:"منغوليا", mo:"منطقة ماكاو الإدارية الخاصة", mp:"جزر ماريانا الشمالية",
    mq:"جزر المارتينيك", mr:"موريتانيا", ms:"مونتسرات", mt:"مالطا", mu:"موريشيوس", mv:"جزر المالديف", mw:"ملاوي",
    mx:"المكسيك", my:"ماليزيا", mz:"موزمبيق", na:"ناميبيا", nc:"كاليدونيا الجديدة", ne:"النيجر", nf:"جزيرة نورفولك",
    ng:"نيجيريا", ni:"نيكاراغوا", nl:"هولندا", no:"النرويج", np:"نيبال", nr:"ناورو", nu:"نيوي", nz:"نيوزيلندا",
    om:"عُمان", pa:"بنما", pe:"بيرو", pf:"بولينيزيا الفرنسية", pg:"بابوا غينيا الجديدة", ph:"الفلبين", pk:"باكستان",
    pl:"بولندا", pm:"سان بيير ومكويلون", pr:"بورتوريكو", ps:"الأراضي الفلسطينية", pt:"البرتغال", pw:"بالاو",
    py:"باراغواي", qa:"قطر", re:"روينيون", ro:"رومانيا", rs:"صربيا", ru:"روسيا", rw:"رواندا", sa:"المملكة العربية السعودية",
    sb:"جزر سليمان", sc:"سيشل", sd:"السودان", se:"السويد", sg:"سنغافورة", sh:"سانت هيلينا", si:"سلوفينيا",
    sj:"سفالبارد وجان ماين", sk:"سلوفاكيا", sl:"سيراليون", sm:"سان مارينو", sn:"السنغال", so:"الصومال",
    sr:"سورينام", ss:"جنوب السودان", st:"ساو تومي وبرينسيبي", sv:"السلفادور", sx:"سانت مارتن", sy:"سوريا",
    sz:"إسواتيني", tc:"جزر توركس وكايكوس", td:"تشاد", tg:"توغو", th:"تايلاند", tj:"طاجيكستان", tk:"توكيلو",
    tl:"تيمور - ليشتي", tm:"تركمانستان", tn:"تونس", to:"تونغا", tr:"تركيا", tt:"ترينيداد وتوباغو", tv:"توفالو",
    tw:"تايوان", tz:"تنزانيا", ua:"أوكرانيا", ug:"أوغندا", us:"الولايات المتحدة", uy:"أورغواي", uz:"أوزبكستان",
    va:"الفاتيكان", vc:"سانت فنسنت وجزر غرينادين", ve:"فنزويلا", vg:"جزر فيرجن البريطانية",
    vi:"جزر فيرجن التابعة للولايات المتحدة", vn:"فيتنام", vu:"فانواتو", wf:"جزر والس وفوتونا", ws:"ساموا",
    xk:"كوسوفو", ye:"اليمن", yt:"مايوت", za:"جنوب أفريقيا", zm:"زامبيا", zw:"زيمبابوي"
  },
});
window.__iti__ = iti;

// 3) Load saved user (name/mobile)
try {
  const { name, mobile } = loadUser();
  if (name) document.getElementById("name").value = name;
  if (mobile) iti.setNumber("+" + mobile);
} catch {}

// 4) Date input dir based on lang
document.getElementById("date").setAttribute("dir", locale === 'ar' ? "rtl" : "ltr");

// 5) Initialize dates/week header
setupInitialDates();

// 6) Load locations then populate select2 + translations maps
document.getElementById("page2-spinner").style.display = "block";
callContent2(`/locations`, (data) => {
  const locations = data.data || [];
  const selectData = locations.map(l => ({ id: l.id, text: l["TS_location_arabic_name"] })).sort((a, b) => a.id - b.id);

  $('.js-example-basic-single').select2({ data: selectData, width: "90%" });
  $('#area').trigger('change');

  for (const L of locations) {
    translations.en.locationsTrans[L["TS_location_english_name"].toLowerCase()] = L["TS_location_english_name"];
    translations.ar.locationsTrans[L["TS_location_english_name"].toLowerCase()] = L["TS_location_arabic_name"];
  }

  document.getElementById("page2-spinner").style.display = "none";
});

// 7) When area changes, fetch services & categories then wire dropdowns
$("#area").on("change", () => {
  document.getElementById("page3-1-spinner").style.display = "block";
  document.getElementById("page3-2-spinner").style.display = "block";
  document.getElementById('serviceCat').innerHTML = '';
  document.getElementById('service').innerHTML = '';

  callContent2(`/services?location=${document.getElementById("area").value}`, (data) => {
    const services = data.data.services;
    const categories = data.data.servicesCat;

    const categoriesWithServices = {};
    services.forEach(svc => {
      const catId = svc.TS_category_id;
      if (!categoriesWithServices[catId]) {
        categoriesWithServices[catId] = { category: categories.find(c => c.TS_category_id === catId), services: [], locations: new Set() };
      }
      categoriesWithServices[catId].services.push(svc);
      svc.location.forEach(loc => categoriesWithServices[catId].locations.add(loc));
    });

    for (const s of services) {
      translations.ar.services[s.TS_service_english_name.toLowerCase()] = s.TS_service_arabic_name;
      translations.en.services[s.TS_service_english_name.toLowerCase()] = s.TS_service_english_name;
    }
    for (const c of categories) {
      translations.ar.servicesCat[c.TS_category_english_name.toLowerCase()] = c.TS_category_arabic_name;
      translations.en.servicesCat[c.TS_category_english_name.toLowerCase()] = c.TS_category_english_name;
    }

    servicesDropdownLoader2(categoriesWithServices);

    document.getElementById("page3-1-spinner").style.display = "none";
    document.getElementById("page3-2-spinner").style.display = "none";
  }, true);

  // refresh appointments after services load via the service onchange handler
});

// 8) Wire date change (loads appointments)
const nForm = {
  date: "", time: "", location: "", service: "",
  serviceCount: "", serviceCat: "", customerM: "",
  customerN: "", paymentMethod: "", urlLocation: "",
  locationDescription: ""
};
wireDateChange(nForm);

// 9) Brands select + helper
mountBrands();
document.getElementById('plateNumber').addEventListener('input', function () {
  this.value = this.value.replace(/\D/g, '').slice(0, 4);
  this.setCustomValidity('');
  window.updateLocationDescription();
});

// 10) Page navigations + terms + submit
wirePager(nForm, iti);

// 11) Detect my location button
document.addEventListener("DOMContentLoaded", function () {
  const locationBtn = document.getElementById("show-my-location");
  if (locationBtn) locationBtn.addEventListener("click", () => window.detectMyLocation && window.detectMyLocation());
});

// 12) Auto-transition from #page3 to #page4 after 5 seconds (as in original)
(function autoFrom3to4(){
  const page3 = document.getElementById('page3');
  const nextBtn = document.getElementById('page3-button');
  if (!page3 || !nextBtn) return;

  const obs = new MutationObserver(() => {
    if (page3.style.display === 'flex') {
      setTimeout(() => nextBtn.click(), 5000);
    }
  });
  obs.observe(page3, { attributes: true, attributeFilter: ['style'] });
})();

// 13) Rebook button
document.getElementById("rebook")?.addEventListener("click", function () {
  window.location.href = "https://www.spongnsoap.com/";
});
