require("dotenv").config();
const fs = require("fs");
const constants = require("./constants");
const sendSMS = require("./sendSMS");
const sendEmail = require("./sendEmail");

const {
  getAuthToken,
  getSpreadSheet,
  getSpreadSheetValues,
} = require("./googleSheetsService.js");

const spreadsheetId = constants.defaultSpreadsheetId;

let liveMode = true;
let overridePhoneNumber = undefined;
let overrideEmail = undefined;
let filePath = undefined;
let maxNotifies = 1000000; // 1mm
let fileD = undefined;

function closeFd(fd) {
  fs.close(fd, (err) => {
    if (err) throw err;
  });
}

function checkMember(member) {
  if (member[constants.FIRST_NAME_COL] === "") {
    // no first name -- BAD
    return null;
  }

  if (
    member[constants.PHONE_COL] === "" &&
    member[constants.EMAIL_COL] === ""
  ) {
    // no phone or email.
    return null;
  }

  if (member[constants.PHONE_COL] !== "") {
    member.push("phone");
  } else {
    member.push("email");
  }

  return member;
}

function subsituteTemplate(member, template, celebrationDate) {
  returnString = template
    .replace("<FirstName>", member[constants.FIRST_NAME_COL])
    .replace("<LastName>", member[constants.LAST_NAME_COL]);
  returnString = returnString
    .replace("<CelebrationDate>", celebrationDate)
    .replace("<Sobriety>", member[constants.SOBRIETY_COL])
    .replace("<SobrietyUnit>", member[constants.UNITS_COL]);

  // console.log(returnString);
  return returnString;
}

async function openSpreadSheet() {
  try {
    const auth = await getAuthToken();
    const response = await getSpreadSheet({
      spreadsheetId,
      auth,
    });
    // console.log('output for getSpreadSheet', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(error.message, error.stack);
  }
}

async function getSheetValues(sheetName) {
  try {
    const auth = await getAuthToken();
    const response = await getSpreadSheetValues({
      spreadsheetId,
      sheetName,
      auth,
    });

    // console.log('output for getSpreadSheetValues', JSON.stringify(response.data, null, 2));
    return response;
  } catch (error) {
    console.log(error.message, error.stack);
    throw error;
  }
}

function fixPhoneNumber(phoneNum) {
  let returnString = phoneNum.trim().replace(/-/g, "");
  return returnString;
}

function sendTextMsg(sendMsg, toNumber) {
  toNumber = overridePhoneNumber != undefined ? overridePhoneNumber : toNumber;

  if (filePath != undefined) {
    // console.log(sendMsg);  // use actual file later.
    fs.appendFileSync(
      fileD,
      "\n\n*********** send txt msg *******************\n\n",
      "utf8",
      (err) => {
        closeFd(fileD);
        if (err) throw err;
      }
    );
    fs.appendFileSync(fileD, sendMsg, "utf8", (err) => {
      closeFd(fileD);
      if (err) throw err;
    });
  } else {
    console.log("\n\n****************** Send text *********************\n\n");
    console.log(toNumber + "\n" + sendMsg);
    // toNumber = fixPhoneNumber(toNumber)
    sendSMS.send_sms(sendMsg, toNumber);
  }
}

function sendEmailMsg(sendMsg, toEmail) {
  toEmail = overrideEmail != undefined ? overrideEmail : toEmail;
  if (filePath != undefined) {
    // console.log(sendMsg);  // use actual file later.
    fs.appendFileSync(
      fileD,
      "\n\n*********** send EMAIL msg *******************\n\n",
      "utf8",
      (err) => {
        closeFd(fileD);
        if (err) throw err;
      }
    );
    fs.appendFileSync(fileD, sendMsg, "utf8", (err) => {
      closeFd(fileD);
      if (err) throw err;
    });
  } else {
    console.log("****************** Send email *********************");
    sendEmail.send_email(sendMsg, toEmail);
  }
}

// run in Live or test mode - where to send texts or emails
function setupRunningMode() {
  const testSenderLvlEnv = process.env.TEST_SENDER_LEVEL;
  const testMaxNotifies = process.env.TEST_MAX_NOTIFIES;
  maxNotifies =
    testMaxNotifies == undefined ? maxNotifies : parseInt(testMaxNotifies);

  if (
    testSenderLvlEnv == undefined ||
    testSenderLvlEnv != constants.TEST_SENDER_LIVE
  ) {
    liveMode = false;

    if (testSenderLvlEnv == constants.TEST_SENDER_TO_PHONE) {
      overridePhoneNumber =
        process.env.TEST_PHONE_NUMBER == undefined
          ? constants.TEST_DEFAULT_PHONE_NUMBER
          : process.env.TEST_PHONE_NUMBER;
      overrideEmail =
        process.env.TEST_EMAIL_ADDR === undefined
          ? constants.TEST_DEFAULT_EMAIL_ADDR
          : process.env.TEST_EMAIL_ADDR;
    } else if (testSenderLvlEnv == constants.TEST_SENDER_TO_FILE) {
      filePath =
        process.env.TEST_FILE_PATH === undefined
          ? constants.TEST_DEFAULT_FILE_PATH
          : process.env.TEST_FILE_PATH;
      fileD = fs.openSync(filePath, "w", 0o666, (err) => {
        if (err) throw err;
      });
    }
  }
}

async function main() {
  //
  setupRunningMode();
  openSpreadSheet();
  let msgTemplatePromise;
  let celebrantPromise;
  msgTemplatePromise = await getSheetValues("Template");
  celebrantPromise = await getSheetValues("List");
  msgTemplate = msgTemplatePromise.data.values[0];
  msgTemplate = msgTemplate[0];
  celebrantList = celebrantPromise.data.values;

  // // use row 0 to setup indexes but for now lets just get it processed..
  titles = celebrantList.shift();
  memberCount = 0;

  for (const member of celebrantList) {
    memberCount++;

    if (memberCount == 1) {
      celebrationDate = member.pop();
    }

    if (checkMember(member)) {
      sendMsg = subsituteTemplate(member, msgTemplate, celebrationDate);

      if (member[member.length - 1] === "phone") {
        sendTextMsg(sendMsg, member[constants.PHONE_COL]);
      } else {
        sendEmailMsg(sendMsg, member[constants.EMAIL_COL]);
      }
    }

    if (memberCount >= maxNotifies) {
      break;
    }
  }
}

main();
