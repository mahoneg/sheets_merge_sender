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
Test File modes still work, but the Test SMS/Email modes and real Send
will not.

## 2. Opening the screen

With the server running, open a web browser and go to:

```
http://localhost:3000
```

You should see the "Celebration Sender" page. If `backend/MergeList.xlsx`
exists, it's automatically pre-selected in the file picker (see Step 1) -
it still needs one click on "Load File" to actually load it.

## 3. Using the screen, step by step

### Step 1 - Upload the roster

- If `MergeList.xlsx` is pre-selected, just click "Load File". Otherwise,
  click "Choose File" and pick your Excel file (`.xlsx`).
- It must contain a sheet named `List` with the members to notify.
- If the file also has a sheet named `Template`, cell A1 of that sheet is
  loaded automatically into the Message Template box (Step 4).

### Step 2 - Contacts

After loading, a table appears showing everyone from the `List` sheet,
with columns Status, FirstName, LastName (initial), Phone, email,
Sobriety, SobrietyUnit, Last Sent, and Message:

- **Status** starts as **Ready** (green) if the person has a first name
  and at least a phone number or email address, or **Skip** (grey) if
  required info is missing - these rows are never sent anything.
- Whichever of **Phone** or **email** will actually be used to reach that
  person is shown in **bold** (a phone number wins if both are present).
- **Last Sent** fills in with a time once that contact has been processed
  or sent to; it's blank until then, and clears only when a different
  file is loaded (not when you use Reset Status).
- The **Message** column has a **View** button - click it to see exactly
  what that person's message will say, using the current template. The
  same popup has a **Send** button that sends (or resends) just that one
  person right away, and a **Reset Status** button.
- The row under the table totals contacts by status (e.g.
  `Ready: 2   Total: 2`), updated live as you process.
- Also in this card:
  - **Mode** - see below.
  - **More settings** - a collapsible panel with Max notifications, Test
    phone, Test email, and a **Save Settings** button (saves these plus
    Mode to the server so they're already filled in next time you open
    the app).

**Mode** controls what "Process Contacts" does:

- `Preview Only` - just logs what each message would say. Nothing is sent
  anywhere. Always try this first.
- `Send (SMS, or Email if no phone)` - the real send. Each contact gets a
  text if they have a phone number, otherwise an email.
- `Test File (write to test_send_<date>.txt)` - writes every message to a
  dated text file on the server instead of sending it. View it with "View
  Test File" (Step 5).
- `Test SMS - all to <number>` - sends every SMS-eligible message to the
  Test phone number instead of the real numbers. The dropdown shows the
  actual number once you've typed one in.
- `Test Email - all to <address>` - same idea, for email, using the Test
  email box.

**Important:** once a contact has any status other than Ready (e.g.
Previewed, Text, Email, Test Text, Failed), "Process Contacts" skips them
on later runs and logs "already <status>" instead of reprocessing them.
Use **Reset Status** to put everyone back to Ready/Skip so a run will
touch them again, or use the **View → Send** button to (re)send one
person individually regardless of their current status.

### Step 4 - Message template

Toggle "Show template" to reveal the box. Use these placeholders anywhere
in the text - they get swapped out per person automatically:

| Placeholder         | Becomes                            |
| -------------------- | ----------------------------------- |
| `<FirstName>`        | the person's first name             |
| `<LastName>`         | their last name/initial             |
| `<CelebrationDate>`  | the celebration date, formatted     |
| `<Sobriety>`         | their sobriety number (e.g. `5`)    |
| `<SobrietyUnit>`     | `day`/`year` (auto singular/plural) |

### Step 5 - Sending and reviewing

1. Click "Process Contacts". Buttons next to it: **Reset Status** (put
   every contact back to Ready/Skip), **Clear Log**, **Download Log**.
2. Toggle **View Log** to watch each contact get processed in real time,
   with FAILED shown in red if something goes wrong (bad phone number,
   Twilio/Gmail error, etc.) and a summary line at the end (Processed /
   Skipped / Already done).
3. Toggle **View Test File** to read the actual file that Test File mode
   wrote today. Only one of View Log / View Test File can be open at a
   time - opening one closes the other.
4. Use "Download Log" to save a text-file copy of the on-screen log.

## Recommended order of operations

1. Load the file, check the Contacts table for anything marked Skip.
2. Run in `Preview Only` mode and read through the messages (or use each
   row's View button to spot-check one).
3. Run in `Test SMS`/`Test Email` mode with your own number/address to see
   a real message land.
4. Click **Reset Status** to clear the test run, then switch to `Send` for
   the real run.
5. If one person needs a resend later (typo fixed, they didn't get it),
   use that row's **View → Send** rather than reprocessing everyone.

## Stopping the server

Close the black command-prompt window, or click into it and press
`Ctrl+C`.
