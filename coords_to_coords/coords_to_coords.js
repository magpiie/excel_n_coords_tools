import xlsx from "xlsx";
const { readFile, utils, writeFile } = xlsx;
import proj4 from "proj4";

const sourceExcelPath =
  "C:/Users/JJJ/Desktop/report/converted_coordinates_basic.xlsx"; // 원본 엑셀 파일 경로
const resultExcelPath =
  "C:/Users/JJJ/Desktop/report/converted_coordinates_test5179.xlsx"; // 결과 엑셀 파일 경로

// WGS84 좌표계 (EPSG:4326) & KATEC 좌표계 (EPSG:5186) & GS84 좌표계 (EPSG:5179)의 정의
proj4.defs("EPSG:4326", "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs");
// proj4.defs(
//   "EPSG:5186",
//   "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=bessel +units=m +no_defs"
// );
proj4.defs(
  "EPSG:5186",
  "+proj=tmerc +lat_0=38 +lon_0=127.5 +k=0.9996 +x_0=1000000 +y_0=2000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);

proj4.defs(
  "EPSG:5179",
  "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs"
);

// 좌표 변환 함수
function convertCoordinatesFromWGS84(latitude, longitude) {
  return proj4(proj4.defs("EPSG:4326"), proj4.defs("EPSG:5179"), [
    longitude,
    latitude,
  ]);
}

// 엑셀 파일에서 정보를 읽는 함수
async function readDataFromExcel(filePath) {
  const workbook = readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = utils.sheet_to_json(sheet);
  return data;
}

// 좌표를 새 엑셀 파일에 저장하는 함수
function saveDataToExcel(data, filePath) {
  const worksheet = utils.json_to_sheet(data, {
    header: ["Address", "Latitude", "Longitude"],
  });
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Results");
  writeFile(workbook, filePath);
}

// 메인 로직
async function main() {
  const data = await readDataFromExcel(sourceExcelPath);
  const results = [];

  for (const item of data) {
    const address = item["Address"];
    const [convertedX, convertedY] = convertCoordinatesFromWGS84(
      parseFloat(item["Latitude"]),
      parseFloat(item["Longitude"])
    );
    results.push({
      Address: address,
      Latitude: convertedY,
      Longitude: convertedX,
    });
  }

  saveDataToExcel(results, resultExcelPath);
  console.log("작업 완료");
}

main().catch(console.error);
