import { readDataFromExcel, saveDataToExcel } from "../tools/excel_tools.js";
import { convertAddressToCoordinates } from "../tools/coords_tools.js";

// 저장할 엑셀 헤더 정보
const excelHeaderInfo = [
  "id",
  "name",
  "gu",
  "dong",
  "address",
  "sdo_gtype",
  "sdo_srid",
  "coords",
];

// 메인 로직
let targetCoordsSystem = 5186;
export async function convertGeo_v2(sourceExcelPath, resultExcelPath) {
  const data = await readDataFromExcel(sourceExcelPath);
  const results = [];

  for (const item of data) {
    const address = item["법정동 주소"];
    const coord = await convertAddressToCoordinates(address);
    if (coord) {
      results.push({
        id: item["ID"],
        name: item["고시원명"],
        gu: item["자치구"],
        dong: item["동"],
        address: address,
        sdo_gtype: 2001,
        sdo_srid: targetCoordsSystem,
        coords: JSON.stringify([coord.x, coord.y]),
      });
    } else {
      console.log(`주소를 변환할 수 없습니다: ${address}`);
    }
  }

  if (results.length) {
    saveDataToExcel(excelHeaderInfo, results, resultExcelPath);
    console.log("작업 완료");
  } else {
    console.log("저장할 데이터가 없습니다.");
  }
}

// convertGeo_v2().catch(console.error);
