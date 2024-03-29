import { readDataFromExcel, saveDataToExcel } from "../tools/excel_tools.js";
import { convertAddressToCoordinates } from "../tools/coords_tools.js";

// 저장할 엑셀 헤더 정보
const excelHeaderInfo = ["id", "name", "gu", "dong", "address", "coords"];

// 메인 로직
let originCoordsSystem = 4326;
let targetCoordsSystem = 5186;
export async function convertGeo_v1(sourceExcelPath, resultExcelPath) {
  const data = await readDataFromExcel(sourceExcelPath);
  const results = [];

  for (const item of data) {
    const address = item["법정동 주소"];
    const coord = await convertAddressToCoordinates(address);
    if (coord) {
      // const [convertedX, convertedY] = convertCoordinatesFromWGS84(
      //   originCoordsSystem,
      //   targetCoordsSystem,
      //   [(parseFloat(coord.x), parseFloat(coord.y))]
      // );
      results.push({
        id: item["ID"],
        name: item["고시원명"],
        gu: item["자치구"],
        dong: item["동"],
        address: address,
        coords: JSON.stringify([
          2001,
          originCoordsSystem,
          [coord.x, coord.y, null],
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

// convertGeo_v1().catch(console.error);
