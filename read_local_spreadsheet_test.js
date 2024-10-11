const fs = require('fs');

const spreadsheet_reader = require('xlsx');
 
const file = spreadsheet_reader.readFile('./MergeList.xlsx');

let data = [];

const sheets = file.SheetNames;

