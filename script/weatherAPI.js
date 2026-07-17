/* =====================================================================
   weatherAPI.js — 날씨 데이터 모듈 (export)
   · 도시 좌표 테이블과 Open-Meteo 호출 함수를 export 한다.
   · realtimeInfo.js 에서 import 해서 사용 (ES Module 분리 과제).
   ===================================================================== */

// 도시명 → 위/경도
export const CITIES = {
  "서울": { lat: 37.5665, lon: 126.9780 },
  "판교": { lat: 37.3948, lon: 127.1112 },
  "광주": { lat: 35.1595, lon: 126.8526 },
  "울산": { lat: 35.5384, lon: 129.3114 },
  "부산": { lat: 35.1796, lon: 129.0756 },
  "도쿄": { lat: 35.6762, lon: 139.6503 },
  "오사카": { lat: 34.6937, lon: 135.5023 },
  "타이베이": { lat: 25.0330, lon: 121.5654 },
  "싱가포르": { lat: 1.3521, lon: 103.8198 },
  "파리": { lat: 48.8566, lon: 2.3522 },
  "런던": { lat: 51.5074, lon: -0.1278 },
  "뉴욕": { lat: 40.7128, lon: -74.0060 },
  "시드니": { lat: -33.8688, lon: 151.2093 }
};

// 브라우저 위치 권한으로 현재 좌표 얻기 (Promise 래핑)
export function getCurrentCoords() {
  return new Promise(function (resolve, reject) {
    if (!navigator.geolocation) { reject(new Error("geolocation-unsupported")); return; }
    navigator.geolocation.getCurrentPosition(
      function (pos) { resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }); },
      function (err) { reject(err); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  });
}

// 좌표 → 지역명 (역지오코딩, 무료·API키 없음·CORS 허용: BigDataCloud)
export async function reverseGeocode(lat, lon) {
  const url =
    "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=" + lat +
    "&longitude=" + lon + "&localityLanguage=ko";
  const res = await fetch(url);
  if (!res.ok) throw new Error("역지오코딩 오류: " + res.status);
  const d = await res.json();
  const name = d.city || d.locality || d.principalSubdivision || d.countryName || "현재 위치";
  // 이름과 겹치는 상위 행정구역은 빼서 "서울특별시 (서울특별시…)" 같은 중복 방지
  const parts = [];
  if (d.principalSubdivision && d.principalSubdivision !== name) parts.push(d.principalSubdivision);
  if (d.countryName && d.countryName !== name) parts.push(d.countryName);
  return { name: name, region: parts.join(" · ") };
}

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
