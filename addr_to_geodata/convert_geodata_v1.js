import { readDataFromExcel, saveDataToExcel } from "../excel_tools.js";
import {
  convertAddressToCoordinates,
  convertCoordinatesFromWGS84,
} from "../coords_tools.js";

const sourceExcelPath = process.env.TARGET_FILE_PATH; // 원본 엑셀 파일 경로
const resultExcelPath = process.env.RESULT_FILE_PATH; // 결과 엑셀 파일 경로

// 저장할 엑셀 헤더 정보
const excelHeaderInfo = ["id", "name", "address", "coords"];

// 메인 로직
let originCoordsSystem = 4326;
let targetCoordsSystem = 5186;
async function main() {
  const data = await readDataFromExcel(sourceExcelPath);
  const results = [];

  for (const item of data) {
    const address = item["법정동 주소"];
    const coord = await convertAddressToCoordinates(address);
    if (coord) {
      const [convertedX, convertedY] = convertCoordinatesFromWGS84(
        originCoordsSystem,
        targetCoordsSystem,
        [(parseFloat(coord.x), parseFloat(coord.y))]
      );
      results.push({
        id: item["ID"],
        name: item["고시원명"],
        address: address,
        coords: JSON.stringify([
          2001,
          targetCoordsSystem,
          [convertedX, convertedY, null],
          [null],
          [null],
        ]),
      });
    } else {
      console.log(`주소를 변환할 수 없습니다: ${address}`);
    }
  }

  saveDataToExcel(excelHeaderInfo, results, resultExcelPath);
  console.log("작업 완료");
}

main().catch(console.error);
