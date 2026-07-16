/* =====================================================================
   weatherAPI.js — 날씨 데이터 모듈 (export)
   · 도시 좌표 테이블과 Open-Meteo 호출 함수를 export 한다.
   · realtimeInfo.js 에서 import 해서 사용 (ES Module 분리 과제).
   ===================================================================== */

// 도시명 → 위/경도
export const CITIES = {
  "서울": { lat: 37.5665, lon: 126.9780 },
  "광주": { lat: 35.1595, lon: 126.8526 },
  "부산": { lat: 35.1796, lon: 129.0756 },
  "도쿄": { lat: 35.6762, lon: 139.6503 },
  "파리": { lat: 48.8566, lon: 2.3522 }
};

// Open-Meteo 실시간 날씨 (현재 기온·습도)
export async function getWeather(lat, lon) {
  const url =
    "https://api.open-meteo.com/v1/forecast?latitude=" + lat +
    "&longitude=" + lon +
    "&current=temperature_2m,relative_humidity_2m";

  const res = await fetch(url);
  if (!res.ok) throw new Error("날씨 응답 오류: " + res.status);
  const data = await res.json();
  const c = data.current || {};
  return {
    temp: c.temperature_2m,               // ℃
    humidity: c.relative_humidity_2m,     // %
    unitTemp: (data.current_units && data.current_units.temperature_2m) || "°C",
    unitHum: (data.current_units && data.current_units.relative_humidity_2m) || "%"
  };
}
