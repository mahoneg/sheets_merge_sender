# Sheets Merge Sender - Browser Version

This is a browser-compatible version of the original Node.js `sheets_merge_sender.js` script. It allows you to upload Excel files and send personalized messages to contacts directly in your web browser.

## Features

- **File Upload**: Upload Excel (.xlsx, .xls) files directly in the browser
- **Preview Mode**: Test your message template before sending
- **Email/SMS Simulation**: Preview email and SMS messages (actual sending requires API integration)
- **Real-time Logging**: See processing results in real-time
- **Download Logs**: Save processing logs as text files
- **Modern UI**: Clean, responsive interface

## How to Use

1. **Open the Application**

   - Open `sheets_merge_sender_browser.html` in any modern web browser
   - No server setup required - it runs entirely in the browser

2. **Upload Excel File**

   - Click "Choose File" and select your Excel file
   - The file should have a "List" sheet with contact information
   - Click "Load File" to process the file

3. **Configure Settings**

   - **Mode**: Choose between Preview, Email, or SMS modes
   - **Max Notifications**: Set the maximum number of messages to process
   - **Test Phone/Email**: Enter test contact information for SMS/Email modes

4. **Customize Message Template**

   - Edit the message template in the text area
   - Use these placeholders:
     - `<FirstName>` - Contact's first name
     - `<LastName>` - Contact's last name (initial)
     - `<CelebrationDate>` - Celebration date
     - `<Sobriety>` - Sobriety duration
     - `<SobrietyUnit>` - Sobriety unit (day/year)

5. **Process Contacts**
   - Click "Process Contacts" to start processing
   - View real-time results in the log output
   - Use "Clear Log" to reset the display
   - Use "Download Log" to save the log as a text file

## Excel File Format

Your Excel file should have a sheet named "List" with the following columns:

| Column Name        | Description                    | Required                |
| ------------------ | ------------------------------ | ----------------------- |
| FirstName          | Contact's first name           | Yes                     |
| LastName (initial) | Contact's last name or initial | No                      |
| Phone/email        | Phone number or email address  | Yes (if no email)       |
| email              | Email address                  | Yes (if no Phone/email) |
| Sobriety           | Sobriety duration number       | No                      |
| SobrietyUnit       | Unit of sobriety (days/years)  | No                      |
| CelebrationDate    | Excel date number              | No                      |

## Modes

### Preview Mode

- Shows what messages would be sent without actually sending them
- Perfect for testing your template and data

### Email Mode

- Simulates sending emails (currently logs to console)
- To enable actual email sending, integrate with an email service API

### SMS Mode

- Simulates sending SMS messages (currently logs to console)
- To enable actual SMS sending, integrate with an SMS service API

## Browser Compatibility

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Internet Explorer**: Not supported

## Dependencies

The browser version uses CDN-hosted libraries:

- **XLSX.js**: For Excel file parsing
- **Day.js**: For date formatting

## Differences from Node.js Version

### What's Different

- **File Handling**: Uses browser File API instead of Node.js fs module
- **SMS/Email**: Currently simulates sending (logs to console)
- **Environment Variables**: Uses browser form inputs instead of .env file
- **UI**: Added modern web interface with real-time feedback

### What's the Same

- **Core Logic**: Same member validation and template substitution
- **Excel Processing**: Same XLSX library for parsing
- **Date Handling**: Same dayjs library for date formatting
- **Message Formatting**: Same template substitution logic

## Integration for Actual Sending

To enable actual SMS/Email sending, you would need to:

### For SMS:

```javascript
// Replace the sendTextMsg function with actual SMS API integration
function sendTextMsg(sendMsg, toNumber) {
  // Example with Twilio API
  fetch("/api/send-sms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: toNumber, message: sendMsg }),
  });
}
```

### For Email:

```javascript
// Replace the sendEmailMsg function with actual email API integration
function sendEmailMsg(sendMsg, toEmail) {
  // Example with email service API
  fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to: toEmail, message: sendMsg }),
  });
}
```

## Security Notes

- All processing happens locally in your browser
- No data is sent to external servers (unless you integrate APIs)
- Excel files are processed client-side only
- Logs are stored locally and can be downloaded

## Troubleshooting

### File Won't Load

- Ensure the file is a valid Excel (.xlsx or .xls) format
- Check that the file has a "List" sheet
- Try refreshing the page and uploading again

### No Contacts Found

- Verify your Excel file has a sheet named "List"
- Check that the column names match the expected format
- Ensure there's data in the FirstName column

### Template Not Working

- Check that placeholder names match exactly (case-sensitive)
- Verify the column names in your Excel file match the placeholders
- Test with a simple template first

## Support

For issues or questions about the browser version, check the browser console for detailed error messages and refer to the log output for processing details.
