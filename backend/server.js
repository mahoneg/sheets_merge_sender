const express = require("express");
const cors = require("cors");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const fs = require("fs");
const XLSX = require("xlsx");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Twilio client — lazily initialized so a missing .env doesn't crash startup
let _twilioClient = null;
function getTwilioClient() {
  if (!_twilioClient) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error("Twilio credentials not configured (TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN missing from .env)");
    }
    _twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return _twilioClient;
}

// Email transporter — lazily initialized so missing credentials don't crash startup
let _emailTransporter = null;
function getEmailTransporter() {
  if (!_emailTransporter) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error("Email credentials not configured (EMAIL_USER / EMAIL_PASSWORD missing from environment)");
    }
    _emailTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return _emailTransporter;
}

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "sheets_merge_sender_browser.html"));
});

// Items endpoint (sample data for ag-grid)
app.get("/api/items", (req, res) => {
  try {
    const xlsxPath = path.join(__dirname, "MergeList.xlsx");
    if (fs.existsSync(xlsxPath)) {
      const workbook = XLSX.readFile(xlsxPath);
      const firstSheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheet];
      // Convert sheet to JSON rows (objects) — empty cells become null
      const items = XLSX.utils.sheet_to_json(worksheet, { defval: null });
      return res.json(items);
    }

    // Fallback sample data if MergeList.xlsx not present
    const items = [
      { id: 1, name: "Item A", value: 100 },
      { id: 2, name: "Item B", value: 200 },
      { id: 3, name: "Item C", value: 300 },
    ];
    res.json(items);
  } catch (err) {
    console.error("Failed to load MergeList.xlsx", err);
    res
      .status(500)
      .json({ error: "Failed to load items", details: err.message });
  }
});

// SMS sending endpoint
app.post("/api/send-sms", async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        error: "Missing required fields: to and message",
      });
    }

    // Normalize to E.164: strip formatting like dashes/parens/spaces,
    // assume a bare 10-digit number is a US number
    let normalizedTo = String(to).replace(/[^\d+]/g, "");
    if (!normalizedTo.startsWith("+")) {
      normalizedTo = normalizedTo.length === 10 ? `+1${normalizedTo}` : `+${normalizedTo}`;
    }

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(normalizedTo)) {
      return res.status(400).json({
        error: "Invalid phone number format",
      });
    }

    // Send SMS via Twilio
    const twilioMessage = await getTwilioClient().messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || "+16592745880",
      to: normalizedTo,
    });

    console.log(`SMS sent successfully: ${twilioMessage.sid}`);

    res.json({
      success: true,
      messageId: twilioMessage.sid,
      message: "SMS sent successfully",
    });
  } catch (error) {
    console.error("SMS sending error:", error);
    res.status(500).json({
      error: "Failed to send SMS",
      details: error.message,
    });
  }
});

// Email sending endpoint
app.post("/api/send-email", async (req, res) => {
  try {
    const { to, message, subject = "HoHoKus St Barts Celebration" } = req.body;

    if (!to || !message) {
      return res.status(400).json({
        error: "Missing required fields: to and message",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    const bccEmail = process.env.SECRETARY_EMAIL || "hohosecretary@gmail.com";

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER || "mahoneg1@gmail.com",
      to: to,
      bcc: bccEmail,
      subject: subject,
      text: message,
    };

    const info = await getEmailTransporter().sendMail(mailOptions);

    console.log(`Email sent successfully: ${info.messageId}`);

    res.json({
      success: true,
      messageId: info.messageId,
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Email sending error:", error);
    res.status(500).json({
      error: "Failed to send email",
      details: error.message,
    });
  }
});

// Test file endpoint — writes messages to a dated .txt file instead of sending
app.post("/api/send-test-file", (req, res) => {
  try {
    const { name, contact, sendBy, message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Missing required field: message" });
    }

    const outputDir = path.join(__dirname, "test_output");
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const dateStr = new Date().toISOString().slice(0, 10);
    const outputFile = path.join(outputDir, `test_send_${dateStr}.txt`);

    const timestamp = new Date().toLocaleString();
    const separator = "=".repeat(50);
    const entry = `\n${separator}\n[${timestamp}] To: ${name} via ${sendBy} (${contact})\n${separator}\n${message}\n`;

    fs.appendFileSync(outputFile, entry, "utf8");

    console.log(`Test file entry written: ${outputFile}`);

    res.json({
      success: true,
      filePath: outputFile,
      message: "Message written to test file",
    });
  } catch (error) {
    console.error("Test file error:", error);
    res.status(500).json({
      error: "Failed to write to test file",
      details: error.message,
    });
  }
});

// Reads today's test-file output so the browser can display it
app.get("/api/test-file", (req, res) => {
  try {
    const dateStr = new Date().toISOString().slice(0, 10);
    const outputFile = path.join(__dirname, "test_output", `test_send_${dateStr}.txt`);

    if (!fs.existsSync(outputFile)) {
      return res.json({ exists: false, filePath: outputFile, content: "" });
    }

    const content = fs.readFileSync(outputFile, "utf8");
    res.json({ exists: true, filePath: outputFile, content });
  } catch (error) {
    console.error("Failed to read test file", error);
    res.status(500).json({ error: "Failed to read test file", details: error.message });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      twilio: !!process.env.TWILIO_ACCOUNT_SID,
      email: !!process.env.EMAIL_USER,
    },
  });
});

// Configuration endpoint
app.get("/api/config", (req, res) => {
  res.json({
    twilioConfigured: !!process.env.TWILIO_ACCOUNT_SID,
    emailConfigured: !!process.env.EMAIL_USER,
    defaultPhoneNumber: process.env.TWILIO_PHONE_NUMBER || "+16592745880",
    defaultEmail: process.env.EMAIL_USER || "mahoneg1@gmail.com",
    secretaryEmail: process.env.SECRETARY_EMAIL || "hohosecretary@gmail.com",
  });
});

// Saved UI settings (mode, max notifications, test phone/email)
const SETTINGS_FILE = path.join(__dirname, "settings.json");

app.get("/api/settings", (req, res) => {
  try {
    if (!fs.existsSync(SETTINGS_FILE)) {
      return res.json({});
    }
    const settings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
    res.json(settings);
  } catch (error) {
    console.error("Failed to read settings.json", error);
    res.status(500).json({ error: "Failed to read settings", details: error.message });
  }
});

app.post("/api/settings", (req, res) => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(req.body, null, 2), "utf8");
    res.json({ success: true });
  } catch (error) {
    console.error("Failed to write settings.json", error);
    res.status(500).json({ error: "Failed to save settings", details: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({
    error: "Internal server error",
    message: error.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Browser app available at http://localhost:${PORT}`);
  console.log("Available endpoints:");
  console.log("  GET  /api/health - Health check");
  console.log("  GET  /api/config - Configuration info");
  console.log("  POST /api/send-sms - Send SMS");
  console.log("  POST /api/send-email - Send email");
  console.log("  POST /api/send-test-file - Write a message to today's test file");
  console.log("  GET  /api/test-file - Read today's test file");
  console.log("  GET  /api/settings - Read saved UI settings");
  console.log("  POST /api/settings - Save UI settings");
});

module.exports = app;
