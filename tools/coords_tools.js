import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import fetch from "node-fetch";
import proj4 from "proj4";

const __filename = fileURLToPath(import.meta.url); // 현재 파일의 URL을 파일 경로로 변환
const __dirname = path.dirname(__filename); // __filename에서 디렉토리 경로만 추출
dotenv.config({ path: path.resolve(__dirname, "./.env") });

const kakaoRESTApiKey = process.env.KAKAO_API_KEY;

// 주소를 좌표로 변환하는 함수
export async function convertAddressToCoordinates(address) {
  const response = await fetch(
    `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(
      address
    )}`,
    {
      headers: {
        Authorization: `KakaoAK ${kakaoRESTApiKey}`,
      },
    }
  );
  const data = await response.json();
  if (data?.documents) {
    return data.documents[0];
  }
}

// WGS84 좌표계 (EPSG:4326) & KATEC 좌표계 (EPSG:5186) & GS84 좌표계 (EPSG:5179)의 정의
proj4.defs("EPSG:4326", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");
proj4.defs(
  "EPSG:5186",
  "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);
proj4.defs(
  "EPSG:5179",
  "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs"
);

// 좌표 변환 함수
// let originSystem = 4326;
// let targetSystem = 5186;
export function convertCoordinatesFromWGS84(
  originSystem,
  targetSystem,
  [longitude, latitude]
) {
  return proj4(
    proj4.defs(`EPSG:${originSystem}`),
    proj4.defs(`EPSG:${targetSystem}`),
    [longitude, latitude]
  );
}
