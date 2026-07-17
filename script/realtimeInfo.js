/* =====================================================================
   realtimeInfo.js — 실시간 날씨 위젯 (ES Module, import)
   · weatherAPI.js 에서 CITIES·getWeather + 현재위치(getCurrentCoords·reverseGeocode) import.
   · #city-select 의 change 이벤트 → 도시명·위경도를 즉시 표시(innerHTML),
     "로딩 중…" 후 fetch/async·await 로 실제 기온·습도를 렌더한다.
   · "📍 현재 위치" 선택 시: 브라우저 위치 → 역지오코딩으로 지역명 → 같은 날씨 렌더.
   ===================================================================== */
import { CITIES, getWeather, getCurrentCoords, reverseGeocode } from "./weatherAPI.js";

const select = document.getElementById("city-select");
const box = document.getElementById("weather-box");

// 헤더(지역명 + 좌표/부제) 마크업
function head(name, sub) {
  return (
    '<div class="wx-head">' +
      '<span class="wx-city">' + name + "</span>" +
      (sub ? '<span class="wx-coord mono">' + sub + "</span>" : "") +
    "</div>"
  );
}

// 좌표가 정해진 뒤 공통 렌더 흐름: 로딩 → fetch → 기온·습도
async function showWeather(name, lat, lon) {
  const coordText = lat.toFixed(2) + ", " + lon.toFixed(2);
  box.classList.remove("text-muted");
  box.dataset.state = "loading";
  box.innerHTML = head(name, coordText) + '<p class="wx-loading">실시간 날씨 불러오는 중…</p>';

  try {
    const w = await getWeather(lat, lon);
    box.dataset.state = "done";
    box.innerHTML =
      head(name, coordText) +
      '<div class="wx-metrics">' +
        '<div class="wx-metric"><span class="wx-metric__k">기온</span>' +
          '<span class="wx-metric__v">' + w.temp + w.unitTemp + "</span></div>" +
        '<div class="wx-metric"><span class="wx-metric__k">습도</span>' +
          '<span class="wx-metric__v">' + w.humidity + w.unitHum + "</span></div>" +
      "</div>";
  } catch (err) {
    box.dataset.state = "error";
    box.innerHTML = head(name) + '<p class="wx-error">날씨를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>';
  }
}

// "📍 현재 위치" 흐름: 위치 권한 → 좌표 → 역지오코딩(지역명) → 날씨
async function showCurrentLocation() {
  box.classList.remove("text-muted");
  box.dataset.state = "loading";
  box.innerHTML = head("현재 위치") + '<p class="wx-loading">위치 확인 중… (권한을 허용해 주세요)</p>';

  let coords;
  try {
    coords = await getCurrentCoords();
  } catch (err) {
    box.dataset.state = "error";
    const denied = err && err.code === 1; // PERMISSION_DENIED
    box.innerHTML =
      head("현재 위치") +
      '<p class="wx-error">' +
        (denied
          ? "위치 권한이 거부됐어요. 주소창의 위치 아이콘에서 허용하거나, 위 목록에서 도시를 골라 주세요."
          : "현재 위치를 가져오지 못했어요. 위 목록에서 도시를 골라 주세요.") +
      "</p>";
    return;
  }

  // 좌표는 확보 → 지역명은 있으면 좋고, 실패해도 좌표로 날씨는 보여준다
  let name = "현재 위치";
  try {
    const place = await reverseGeocode(coords.lat, coords.lon);
    name = place.region ? place.name + " (" + place.region + ")" : place.name;
  } catch (e) { /* 역지오코딩 실패 시 기본 이름 유지 */ }

  await showWeather(name, coords.lat, coords.lon);
}

if (select && box) {
  select.addEventListener("change", async () => {
    const val = select.value;
    if (val === "__geo__") { await showCurrentLocation(); return; }

    const coord = CITIES[val];
    if (!coord) return;
    await showWeather(val, coord.lat, coord.lon);
  });
}
