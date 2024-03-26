import XLSX from "xlsx";
import fs from "fs";

// 엑셀 파일을 열기
const workbook = XLSX.readFile(
  "C:/Users/JJJ/Desktop/report/converted_coordinates_test.xlsx"
);
// 첫 번째 워크시트를 읽기
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// 워크시트를 JSON으로 변환
const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

// 쿼리문을 저장할 문자열 초기화
let queryStrings = "";

// 첫 번째 행은 컬럼 이름이므로 데이터 로우는 두 번째 행부터 시작
for (let i = 1; i < rows.length; i++) {
  const row = rows[i];
  // id, name, address, coords에 해당하는 값 할당
  const [id, name, address, coords] = row;
  // address에서 SIGUN과 ADMDONG 추출
  const addressParts = address.split(" ");
  const sigun = addressParts[1] ? addressParts[1] : ""; // 첫 번째 공백과 두 번째 공백 사이의 값
  const admdong = addressParts.slice(2).join(" "); // 두 번째 공백 이후의 모든 값
  // coords 문자열 파싱
  const coordsParsed = JSON.parse(coords);
  const [sdoGtype, sdoSrid, pointArray] = coordsParsed;
  if (!pointArray || pointArray.length < 2) {
    console.error("Invalid pointArray format:", pointArray);
    continue; // 해당 로우를 스킵하고 다음 로우로 넘어갑니다.
  }
  const x = pointArray[0];
  const y = pointArray[1];
  // SDO_GEOMETRY 쿼리 문자열 생성
  const sdoGeometryString = `MDSYS.SDO_GEOMETRY(${sdoGtype}, ${sdoSrid}, MDSYS.SDO_POINT_TYPE(${x}, ${y}, NULL), NULL, NULL)`;
  // 쿼리 문자열 생성
  const queryString = `INSERT INTO SAHA_GIS.GIS_EX_CENTER3 (OGR_FID, GEOMETRY, DBPID, OBJECTID, SIGUN, ADMDONG, ADDRESS, NAME, "OPEN", TFLOOR, "ADD", UFLOOR, DUPADD, WIND1, NEWNAME, "TIME", MODNAME, MODADD, NEWADDRESS, JOINID, PRE, BDMGTSN, ORID, TYPEAC, TYPEBC, TYPEAD, TYPEBD, UFID, XCOOR, YCOOR, AREA, TAREA, INSDATE, ISSDATE, OPENRE, PDFURL) VALUES(0, ${sdoGeometryString}, 0, '', '${sigun}', '${admdong}', '${address}', '${name}', '', '', '', '', '', '', '${name}', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '/pdf/ex_center/${id}.pdf');\n`;
  // 쿼리 문자열을 전체 문자열에 추가
  queryStrings += queryString;
}

// 생성된 쿼리 문자열을 파일에 쓰기
fs.writeFileSync(
  "C:/Users/JJJ/Desktop/report/ex_center_test.txt",
  queryStrings
);

console.log("쿼리문이 ex_center.txt 파일에 저장되었습니다.");
