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
app.use(express.static(path.join(__dirname, "../")));

// Twilio configuration
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

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

    // Validate phone number format
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to.replace(/\s/g, ""))) {
      return res.status(400).json({
        error: "Invalid phone number format",
      });
    }

    // Send SMS via Twilio
    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER || "+16592745880",
      to: to,
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

    // Add BCC to secretary email if configured
    const bccEmail = process.env.SECRETARY_EMAIL || "hohosecretary@gmail.com";
    const toWithBcc = `${to}, ${bccEmail}`;

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER || "mahoneg1@gmail.com",
      to: toWithBcc,
      subject: subject,
      text: message,
    };

    const info = await emailTransporter.sendMail(mailOptions);

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
});

module.exports = app;
