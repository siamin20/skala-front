/* =====================================================================
   realtimeInfo.js — 실시간 날씨 위젯 (ES Module, import)
   · weatherAPI.js 에서 CITIES·getWeather 를 import.
   · #city-select 의 change 이벤트 → 도시명·위경도를 즉시 표시(innerHTML),
     "로딩 중…" 후 fetch/async·await 로 실제 기온·습도를 렌더한다.
   ===================================================================== */
import { CITIES, getWeather } from "./weatherAPI.js";

const select = document.getElementById("city-select");
const box = document.getElementById("weather-box");

if (select && box) {
  select.addEventListener("change", async () => {
    const city = select.value;
    const coord = CITIES[city];
    if (!coord) return;

    // 1) DOM/이벤트 단계 — 좌표 즉시 표시
    box.classList.remove("text-muted");
    box.dataset.state = "loading";
    box.innerHTML =
      '<div class="wx-head">' +
        '<span class="wx-city">' + city + "</span>" +
        '<span class="wx-coord mono">' + coord.lat.toFixed(2) + ", " + coord.lon.toFixed(2) + "</span>" +
      "</div>" +
      '<p class="wx-loading">실시간 날씨 불러오는 중…</p>';

    // 2) 비동기 단계 — 실제 온도·습도
    try {
      const w = await getWeather(coord.lat, coord.lon);
      box.dataset.state = "done";
      box.innerHTML =
        '<div class="wx-head">' +
          '<span class="wx-city">' + city + "</span>" +
          '<span class="wx-coord mono">' + coord.lat.toFixed(2) + ", " + coord.lon.toFixed(2) + "</span>" +
        "</div>" +
        '<div class="wx-metrics">' +
          '<div class="wx-metric"><span class="wx-metric__k">기온</span>' +
            '<span class="wx-metric__v">' + w.temp + w.unitTemp + "</span></div>" +
          '<div class="wx-metric"><span class="wx-metric__k">습도</span>' +
            '<span class="wx-metric__v">' + w.humidity + w.unitHum + "</span></div>" +
        "</div>";
    } catch (err) {
      box.dataset.state = "error";
      box.innerHTML =
        '<div class="wx-head"><span class="wx-city">' + city + "</span></div>" +
        '<p class="wx-error">날씨를 불러오지 못했어요. 잠시 후 다시 시도해 주세요.</p>';
    }
  });
}
