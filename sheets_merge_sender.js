require("dotenv").config();
const XLSX = require("xlsx");
const fs = require("fs");
const dayjs = require("dayjs");
const constants = require("./constants");
const sendSMS = require("./sendSMS");
const sendEmail = require("./sendEmail");

// const {
//   getAuthToken,
//   getGoogleSpreadSheet,
//   getSpreadSheetValues,
// } = require("./googleSheetsService.js");

const {
  getLocalSpreadSheet,
  getLocalSpreadSheetValues,
} = require("./localSheetsService.js");

const spreadsheetId = constants.defaultSpreadsheetId;
const Phone = "Phone/email";
const LastName = "LastName (initial)";
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

// function checkMember(member) {
//   if (member[constants.FIRST_NAME_COL] === "") {
//     // no first name -- BAD
//     return null;
//   }

//   if (
//     member[constants.PHONE_COL] === "" &&
//     member[constants.EMAIL_COL] === ""
//   ) {
//     // no phone or email.
//     return null;
//   }

//   if (member[constants.PHONE_COL] !== "") {
//     member.push("phone");
//   } else {
//     member.push("email");
//   }

//   return member;
// }
function checkMember(member) {
  if (member["FirstName"] === "") {
    // no first name -- BAD
    return null;
  }

  if (member[Phone] === "" && member["email"] === "") {
    // no phone or email.
    return null;
  }

  if (member[Phone]) {
    member["SendBy"] = "phone";
  } else {
    member["SendBy"] = "email";
  }

  return member;
}

function subsituteTemplate(member, template, celebrationDate) {
  // returnString = template
  //   .replace("<FirstName>", member[constants.FIRST_NAME_COL])
  //   .replace("<LastName>", member[constants.LAST_NAME_COL]);
  // returnString = returnString
  //   .replace("<CelebrationDate>", celebrationDate)
  //   .replace("<Sobriety>", member[constants.SOBRIETY_COL])
  //   .replace("<SobrietyUnit>", member[constants.UNITS_COL]);

  let sobrietyUnit = member["SobrietyUnit"];
  if (sobrietyUnit === "days") {
    sobrietyUnit = "day"
  } else if (member["SobrietyUnit"] === "years") {
    sobrietyUnit = "year"
  }
  returnString = template
    .replace("<FirstName>", member["FirstName"])
    .replace("<LastName>", member[LastName]);
  returnString = returnString
    .replace("<CelebrationDate>", celebrationDate)
    .replace("<Sobriety>", member["Sobriety"])
    .replace("<SobrietyUnit>", sobrietyUnit);

  // console.log(returnString);
  return returnString;
}

async function openSpreadSheet() {
  try {
    const spreadSheet = await getLocalSpreadSheet();
    return spreadSheet;
    // console.log('output for getSpreadSheet', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(error.message, error.stack);
  }
}

async function getSheetValues(spreadSheet, sheetName) {
  try {
    const response = await getLocalSpreadSheetValues({
      spreadSheet,
      sheetName,
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

function fixTemplate(inTemplate) {
  let fixed = inTemplate.replace(/\r/g, ""); // get rid of CR
  return fixed;
}

function sendTextMsg(sendMsg, toNumber) {
  toNumber = overridePhoneNumber != undefined ? overridePhoneNumber : toNumber;

  if (filePath != undefined) {
    // console.log(sendMsg);  // use actual file later.
    fs.appendFileSync(
      fileD,
      "\n\n*********** send txt msg -" +
        toNumber +
        " - *******************\n\n",
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
  const spreadSheetFile = await openSpreadSheet();
  let msgTemplatePromise;
  let celebrantPromise;
  msgTemplatePromise = await getSheetValues(spreadSheetFile, "Template");
  celebrantPromise = await getSheetValues(spreadSheetFile, "List");
  let ops = { header: 0 };
  let ops2 = { header: 0 };
  let msgTemplate = "";
  // msgTemplate = msgTemplatePromise.data.values[0];
  // msgTemplate = msgTemplate[0];
  // celebrantList = celebrantPromise.data.values;

  try {
    console.log(msgTemplatePromise);
    const lclMsgTemplate = msgTemplatePromise.A1.v;
    msgTemplate = fixTemplate(lclMsgTemplate);

    // const msgTemplateList = XLSX.utils.sheet_to_json(msgTemplatePromise, ops);
    // console.log(msgTemplateList);
    // for (const row of msgTemplateList) {
    //   msgTemplate = msgTemplate + row.messageTextLines + "\n";
    // }
  } catch (error) {
    console.log(error.message, error.stack);
  }
  //msgTemplate = msgTemplate[0];
  try {
    celebrantList = XLSX.utils.sheet_to_json(celebrantPromise, ops2);
  } catch (error) {
    console.log(error.message, error.stack);
  }

  // // use row 0 to setup indexes but for now lets just get it processed..
  // titles = celebrantList.shift();
  memberCount = 0;

  for (const member of celebrantList) {
    memberCount++;

    if (memberCount == 1) {
      const tmpDate = new Date(Date.UTC(0, 0, member["CelebrationDate"]));
      const tmpdayjs = dayjs(tmpDate);
      celebrationDate = tmpdayjs.format("ddd MMM D");
    }

    if (checkMember(member)) {
      sendMsg = subsituteTemplate(member, msgTemplate, celebrationDate);

      if (member["SendBy"] === "phone") {
        sendTextMsg(sendMsg, member[Phone]);
      } else {
        sendEmailMsg(sendMsg, member["email"]);
      }
    }

    if (memberCount >= maxNotifies) {
      break;
    }
  }
}

main();
