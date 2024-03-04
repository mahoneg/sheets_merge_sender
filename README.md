# sheets_merge_sender

Send a text or email from a merged google sheets
to read sheets see..
https://developers.google.com/sheets/api/quickstart/js
https://hackernoon.com/how-to-use-google-sheets-api-with-nodejs-cz3v316f
https://www.twilio.com/docs/messaging/quickstart/node

you might need the following - I hope the clone pulls most of the stuff needed

> npm init
> npm add twilio
> npm add googleapis
> node sheets_merge_sender.js

-- The following environment variables are needed
GCLOUD_PROJECT='semiotic-nexus-281714'

# next is the directory of the keyfile downloaded from google

GOOGLE_APPLICATION_CREDENTIALS=D:\develop\AADev\text_sender\keys\hhk_service_account_credentials.json'
**TO_DO**
TEST_SENDER_LEVEL='VALUE' --
Where value is'LIVE' - run in prod mode send the mesages to receipient
'TEST_SEND' - send the text/email messages to the test accounts.  
 'TEST_FILE' - output messages to a file
TEST_PHONE_NUMBER= 10 digit phone number - your phone or (659) 274-5880 Default - test phone in Twilio
TEST_EMAIL_ADDR= email to send to put yours here.
TEST_FILE_PATH=path to file eq '.\members.txt'
TEST_MAX_NOTIFIES=# -- set this to the max number of messages to generate.
