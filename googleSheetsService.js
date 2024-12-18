const { google } = require("googleapis");
const sheets = google.sheets("v4");
const SCOPES = ["https://www.googleapis.com/auth/spreadsheets.readonly"];

async function getAuthToken() {
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
  });
  const authToken = await auth.getClient();
  return authToken;
}

async function getGoogleSpreadSheet({ spreadsheetId, auth }) {
  const res = await sheets.spreadsheets.get({
    spreadsheetId,
    auth,
  });
  return res;
}

async function getGoogleSpreadSheetValues({ spreadsheetId, auth, sheetName }) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    auth,
    range: sheetName,
  });
  return res;
}

module.exports = {
  getAuthToken,
  getGoogleSpreadSheet,
  getGoogleSpreadSheetValues,
};
