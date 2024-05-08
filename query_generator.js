import XLSX from "xlsx";
import fs from "fs";
import dotenv from "dotenv";

import dongInfo from "./assets/dong_info.json" assert { type: "json" };
import guInfo from "./assets/gu_info.json" assert { type: "json" };

dotenv.config();
const resultExcelPath = process.env.RESULT_FILE_PATH; // 결과 엑셀 파일 경로

// 엑셀 파일을 열기
const workbook = XLSX.readFile(resultExcelPath);
// 첫 번째 워크시트를 읽기
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 워크시트를 JSON으로 변환
const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// 쿼리문을 저장할 문자열 초기화
let queryStrings = "";
const originGeoSystem = process.argv[2];
const targetGeoSytem = process.argv[3];

// 첫 번째 행은 컬럼 이름이므로 데이터 로우는 두 번째 행부터 시작
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  // id, name, address, coords에 해당하는 값 할당
  const [id, name, gu, dong, address, sdo_gtype, sdo_srid, coords] = row;
  // address에서 SIGUN과 ADMDONG 추출
  const addressParts = address.split(" ");
  const sigun = addressParts[1] ? addressParts[1] : ""; // 첫 번째 공백과 두 번째 공백 사이의 값
  const admdong = addressParts.slice(2).join(" "); // 두 번째 공백 이후의 모든 값
  // coords 문자열 파싱
  const coordsParsed = JSON.parse(coords);
  const [x, y] = coordsParsed;
  if (!coordsParsed || coordsParsed.length < 2) {
    console.error("Invalid pointArray format:", pointArray);
    continue; // 해당 로우를 스킵하고 다음 로우로 넘어갑니다.
  }

  // 파일경로를 위해 행정구 이름 한글 -> 영문 변환
  const gu_name = guInfo[gu];
  const dong_name = dongInfo[gu_name][dong];

  // SDO_GEOMETRY 쿼리 문자열 생성 - 변환 동시 진행
  const sdoGeometryString = `SDO_CS.TRANSFORM(
    MDSYS.SDO_GEOMETRY(${sdo_gtype}, ${originGeoSystem}, MDSYS.SDO_POINT_TYPE(${x}, ${y}, NULL), NULL, NULL),
    ${targetGeoSytem}
  )`;
  // 쿼리 문자열 생성
  const queryString = `INSERT INTO SAHA_GIS.GIS_EX_CENTER (OGR_FID, GEOMETRY, DBPID, OBJECTID, SIGUN, ADMDONG, ADDRESS, NAME, "OPEN", TFLOOR, "ADD", UFLOOR, DUPADD, WIND1, NEWNAME, "TIME", MODNAME, MODADD, NEWADDRESS, JOINID, PRE, BDMGTSN, ORID, TYPEAC, TYPEBC, TYPEAD, TYPEBD, UFID, XCOOR, YCOOR, AREA, TAREA, INSDATE, ISSDATE, OPENRE, PDFURL) VALUES(${i}, ${sdoGeometryString}, ${i}, '', '${gu}', '${admdong}', '${address}', '${name}', '', '', '', '', '', '', '${name}', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '/pdf/ex_center/${gu_name}/${dong_name}/${id}.pdf');\n`;
  // 쿼리 문자열을 전체 문자열에 추가
  queryStrings += queryString;
}

// 생성된 쿼리 문자열을 파일에 쓰기
fs.writeFileSync(
  `C:/Users/JJJ/Desktop/report/result_query_${Date.now()}.txt`,
  queryStrings
);

console.log("쿼리문이 result_query.txt 파일에 저장되었습니다.");
