
const spreadsheet_reader = require('xlsx');
 
let data = [];

async function getLocalSpreadSheet() {
  const file = spreadsheet_reader.readFile('./MergeList.xlsx');
  return file;
}

async function getLocalSpreadSheetValues({spreadSheet, sheetName}) {
  const sheetValues = spreadSheet.Sheets[sheetName];
  return sheetValues;
}

module.exports = {
  getLocalSpreadSheet,
  getLocalSpreadSheetValues
}