# powershell NOT cmd
# this will set variable in a powershell to create a file with 1 message in it
$env:TEST_SENDER_LEVEL='TEST_PHONE'
# $env:TEST_PHONE_NUMBER=''
#$env:TEST_PHONE_NUMBER='6592745880'
$env:TEST_PHONE_NUMBER='2035363134'
#$env:TEST_FILE_PATH='.\messages.txt'
$env:TEST_MAX_NOTIFIES=1
$env:TEST_EMAIL_ADDR='mahoneg1@gmail.com'

# you can now run vscode out of this shell (code)
# or -- node sheets_merge_sender.js
