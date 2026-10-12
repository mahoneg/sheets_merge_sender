// Builds a sample MergeList.xlsx with fake data. Usage: node make_sample_xlsx.js <out.xlsx>
const path = require("path");
const XLSX = require(path.join(__dirname, "..", "backend", "node_modules", "xlsx"));

const serial = (y, m, d) => Math.round((Date.UTC(y, m - 1, d) - Date.UTC(1899, 11, 30)) / 86400000);
const nextYear = new Date().getFullYear() + 1;

const list = [
  [null, "FirstName", "LastName (initial)", "Phone/email", "email", "Sobriety", "SobrietyUnit", "CelebrationDate"],
  [null, "Alex", "T", "201-555-0101", null, 1, "year", serial(nextYear, 3, 15)],
  [null, "Jordan", "M", "201-555-0102", null, 5, "year", serial(nextYear, 3, 15)],
  [null, "Sam", "R", null, "sam@example.com", 90, "day", serial(nextYear, 3, 15)],
];
const template = [[
  "Hi <FirstName> <LastName>.\n\nCongratulations on your <Sobriety> <SobrietyUnit> anniversary!\n\n" +
  "Will you be joining us to celebrate on <CelebrationDate>?\nPlease reply YES or NO.\n\n" +
  "PS - to be removed from the list, reply STOP",
]];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(list), "List");
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(template), "Template");
XLSX.writeFile(wb, process.argv[2]);
