import dotenv from "dotenv";

import { convertGeo_v1 } from "./addr_to_geodata/convert_geodata_v1.js";
import { convertGeo_v2 } from "./addr_to_geodata/convert_geodata_v2.js";

dotenv.config();

const sourceExcelPath = process.env.TARGET_FILE_PATH; // 원본 엑셀 파일 경로
const resultExcelPath = process.env.RESULT_FILE_PATH; // 결과 엑셀 파일 경로

if (process.argv[2] === "v1") {
  convertGeo_v1(sourceExcelPath, resultExcelPath).catch(console.error);
} else if (process.argv[2] === "v2") {
  convertGeo_v2(sourceExcelPath, resultExcelPath).catch(console.error);
}
