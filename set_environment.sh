# bash/zsh equivalent of set_environment.ps1 -- use:  source ./set_environment.sh
export GCLOUD_PROJECT='semiotic-nexus-281714'
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/develop/AADev/sheets_merge_sender/keys/hhk_service_account_credentials.json"
export SPREADSHEET_LOCAL='YES'
export SPREADSHEET_NAME='MergeList.xlsx'

# test_file mode (writes 1 message to a file) -- from setup_test_file_notifies.ps1
# export TEST_SENDER_LEVEL='TEST_FILE'
# export TEST_FILE_PATH='./messages.txt'
# export TEST_MAX_NOTIFIES=1

# test_phone mode -- from setup_test_text_notifies.ps1
# export TEST_SENDER_LEVEL='TEST_PHONE'
# export TEST_PHONE_NUMBER='2035363134'
# export TEST_EMAIL_ADDR='mahoneg1@gmail.com'
# export TEST_MAX_NOTIFIES=1
