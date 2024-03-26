import xlsx from "xlsx";
const { readFile, utils, writeFile } = xlsx;

// 엑셀 파일에서 정보를 읽는 함수
// ex) const sourceExcelPath = "C:/Users/JJJ/Desktop/report/geodata_origin_test.xlsx";
export async function readDataFromExcel(filePath) {
  const workbook = readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = utils.sheet_to_json(sheet);
  return data;
}

// 좌표를 새 엑셀 파일에 저장하는 함수
// ex) const resultExcelPath = "C:/Users/JJJ/Desktop/report/converted_coordinates_test.xlsx";
// ex) headerInfo = ["id", "name", "address", "coords"] // 결과 엑셀파일 헤더
export function saveDataToExcel(headerInfo, data, resultExcelPath) {
  const worksheet = utils.json_to_sheet(data, {
    header: headerInfo,
  });
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Results");
  writeFile(workbook, resultExcelPath);
}
