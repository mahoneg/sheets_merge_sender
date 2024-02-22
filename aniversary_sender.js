const {
    getAuthToken,
    getSpreadSheet,
    getSpreadSheetValues
  } = require('./googleSheetsService.js');
  
  // const spreadsheetId = process.argv[2];
  const spreadsheetId = '10qPkK1HpQINElAO8rQ93DXGshwDFm7UU-oJLDV3-vpg';
  const memberSheetName = "List";
  const templateSheetName = "Template";

  function checkMember(member) {
    if (member[1] === "") {  // no first name -- BAD
        return null;
    }

    if ((member[3] === "")&&(member[4] === "")) { // no phone or email.
        return null;
    }

    if (member[3] !== "") {
        member.push("phone");
    } else {
        member.push("email");
    }
    
    return member;
  }

  function subsituteTemplate(member, template, celebrationDate) {
    returnString = template.replace("<FirstName>", member[1]);
    returnString = returnString.replace("<CelebrationDate>", celebrationDate).replace("<YearsSober>", member[5]);

    console.log(returnString);
    return returnString;
  }
  

  async function openSpreadSheet() {
    try {
      const auth = await getAuthToken();
      const response = await getSpreadSheet({
        spreadsheetId,
        auth
      })
      console.log('output for getSpreadSheet', JSON.stringify(response.data, null, 2));
    } catch(error) {
      console.log(error.message, error.stack);
    }
  }
  

  async function getSheetValues(sheetName) {
    try {
      const auth = await getAuthToken();
      const response = await getSpreadSheetValues({
        spreadsheetId,
        sheetName,
        auth
      }).then(console.log("Hey here"));

    
      console.log('output for getSpreadSheetValues', JSON.stringify(response.data, null, 2));
      return response;
    } catch(error) {
      console.log(error.message, error.stack);
      throw error;
    }
  }
  
  async function main() {
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

          if (member[7] === "phone") {

          } else {

          }
        }
    }
  }
  
  main()