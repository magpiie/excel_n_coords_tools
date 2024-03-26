import xlsx from "xlsx";
const { readFile, utils, writeFile } = xlsx;
import fetch from "node-fetch";

const kakaoRESTApiKey = process.env.KAKAO_API_KEY;
const sourceExcelPath = "C:/Users/JJJ/Desktop/report/geodata_origin.xlsx"; // 원본 엑셀 파일 경로
const resultExcelPath =
  "C:/Users/JJJ/Desktop/report/converted_coordinates.xlsx"; // 결과 엑셀 파일 경로

// 주소를 좌표로 변환하는 함수
async function convertAddressToCoordinates(address) {
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
  return data.documents[0];
}

// 엑셀 파일에서 주소 목록을 읽는 함수
function readAddressesFromExcel(filePath) {
  const workbook = readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = utils.sheet_to_json(sheet, { header: 1 });
  const headerRow = rows[0]; // 헤더 행을 가져옵니다.
  let addressColumnIndex = headerRow.indexOf("법정동 주소"); // '법정동 주소' 컬럼의 인덱스를 찾습니다.

  if (addressColumnIndex === -1) {
    throw new Error("'법정동 주소' 컬럼을 찾을 수 없습니다.");
  }

  return rows
    .slice(1) // 첫 번째 행(헤더) 제외
    .map((row) => row[addressColumnIndex]); // '법정동 주소' 컬럼의 값만 추출
}

// 좌표를 새 엑셀 파일에 저장하는 함수
function saveCoordinatesToExcel(coordinates, filePath) {
  const worksheet = utils.json_to_sheet(
    coordinates.map((coord) => ({
      Address: coord.address_name,
      Latitude: coord.y,
      Longitude: coord.x,
    })),
    { header: ["address", "latitude", "longitude"] }
  );
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "coordinates");
  writeFile(workbook, filePath);
}

// 메인 로직
async function main() {
  const addresses = readAddressesFromExcel(sourceExcelPath);
  const coordinates = [];

  for (const address of addresses) {
    const coord = await convertAddressToCoordinates(address);
    if (coord) {
      coordinates.push(coord);
    } else {
      console.log(`주소를 변환할 수 없습니다: ${address}`);
    }
  }

  saveCoordinatesToExcel(coordinates, resultExcelPath);
  console.log("작업 완료");
}

main().catch(console.error);
