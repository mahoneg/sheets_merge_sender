// Download the helper library from https://www.twilio.com/docs/node/install
// Find your Account SID and Auth Token at twilio.com/console
// and set the environment variables. See http://twil.io/secure
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require('twilio')(accountSid, authToken);
const messageMap = new Map(); 

async function send_sms (msg, toNumber, rowNum) { 
  
  twilioClient.messages
    .create({
      body: msg,
      from: '+16592745880',
      to: toNumber
    })
    .then(message => {
      console.log(message.sid)
    });

  // return message.sid
}

module.exports = { send_sms };
