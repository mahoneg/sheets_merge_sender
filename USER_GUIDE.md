# Celebration Sender - How to Use

This guide is for whoever is sending the sobriety celebration texts and
emails. No coding knowledge needed.

## 1. Starting the server

The app runs on your own computer. You start a small local server, then
open it in your web browser.

**Easiest way (Windows):**

1. Open the `backend` folder.
2. Double-click `start.bat`.
3. A black window will open and stay open - leave it running. It will say:

   ```
   Starting server on http://localhost:3000
   Press Ctrl+C to stop the server
   ```

4. Leave that window open the whole time you are using the app. Closing it
   stops the server.

**If you'd rather use the command line:**

```bash
cd backend
npm start
```

**First time only:** if `start.bat` says it created a `.env` file, open
`backend/.env` in a text editor and fill in the real Twilio and Gmail
credentials before sending anything for real. Without this, Preview and
Test File modes still work, but Test SMS/Email and Send SMS/Email will not.

## 2. Opening the screen

With the server running, open a web browser and go to:

```
http://localhost:3000
```

You should see the "Celebration Sender" page.

## 3. Using the screen, step by step

### Step 1 - Upload the roster

- Click "Choose File" and pick your Excel file (`.xlsx`).
- It must contain a sheet named `List` with the members to notify.
- If the file also has a sheet named `Template`, cell A1 of that sheet is
  loaded automatically into the Message Template box below.
- Click "Load File".

### Step 2 - Loaded contacts

After loading, a table appears showing everyone from the `List` sheet:

- **Ready** (green) - this person has a first name and at least a phone
  number or email address, so a message can be sent to them.
- **Skip** (grey/red) - missing required info (no first name, or no
  phone/email at all). These rows are skipped automatically; they are not
  sent anything.

Check this table before sending - it's the fastest way to catch a typo or
a missing phone number in the spreadsheet.

### Step 3 - Settings

- **Mode** - what happens when you click "Process Contacts":
  - `Preview Only` - just prints what each message would say. Nothing is
    sent anywhere. Always try this first.
  - `Test File (write to .txt)` - writes every message to a text file on
    the server instead of sending it, so you can read them over.
  - `Test SMS - all to one number` - sends every SMS-eligible message to
    the phone number you put in "Test phone" below, instead of the real
    numbers. Good for checking what a text actually looks like on a phone.
  - `Test Email - all to one address` - same idea, but for email, using
    the "Test email" box.
  - `Send Email` - sends real emails to everyone in the roster whose
    contact method is email.
  - `Send SMS` - sends real texts to everyone in the roster whose contact
    method is a phone number.
- **Max notifications** - a safety cap on how many messages get sent in
  one run. Leave it high unless you specifically want to send to only the
  first few people.
- **Test phone / Test email** - only used by the two "Test" modes above.

### Step 4 - Message template

Type or edit the message in the box. Use these placeholders anywhere in
the text - they get swapped out per person automatically:

| Placeholder            | Becomes                              |
| ----------------------- | ------------------------------------- |
| `<FirstName>`           | the person's first name               |
| `<LastName>`            | their last name/initial               |
| `<CelebrationDate>`     | the celebration date, formatted       |
| `<Sobriety>`            | their sobriety number (e.g. `5`)      |
| `<SobrietyUnit>`        | `day`/`year` (auto singular/plural)   |

### Sending

1. Click "Process Contacts".
2. Watch the "Results" section at the bottom - it logs each person as
   they're processed, and shows FAILED in red if something goes wrong
   (bad phone number, Twilio/Gmail error, etc.).
3. When it finishes, you'll see a summary: how many were processed and how
   many were skipped.
4. Use "Download Log" to save a text-file copy of everything that
   happened, or "Clear Log" to reset the log for the next run.

## Recommended order of operations

1. Load the file, check the contacts table for anything marked Skip.
2. Run in `Preview Only` mode and read through the messages.
3. Run in `Test SMS`/`Test Email` mode with your own number/address to see
   a real message land.
4. Only then switch to `Send SMS` / `Send Email` for the real run.

## Stopping the server

Close the black command-prompt window, or click into it and press
`Ctrl+C`.
