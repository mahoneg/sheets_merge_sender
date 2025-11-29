# Sheets Merge Sender - Backend Server

This is the Node.js backend server that provides API endpoints for SMS and email sending functionality to support the browser version of the Sheets Merge Sender application.

## Features

- **SMS Sending**: Integrates with Twilio for SMS delivery
- **Email Sending**: Integrates with Gmail/Nodemailer for email delivery
- **REST API**: Clean REST endpoints for SMS and email operations
- **Health Monitoring**: Health check and configuration endpoints
- **Static File Serving**: Serves the browser application
- **CORS Support**: Cross-origin request handling
- **Error Handling**: Comprehensive error handling and logging

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your actual credentials:

```env
# Server Configuration
PORT=3000

# Twilio Configuration (for SMS sending)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+16592745880

# Email Configuration (for email sending)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
SECRETARY_EMAIL=hohosecretary@gmail.com
```

### 3. Start the Server

```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

### 4. Access the Application

Open your browser and navigate to:

- **Main App**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **Configuration**: http://localhost:3000/api/config

## API Endpoints

### SMS Endpoint

**POST** `/api/send-sms`

Send an SMS message via Twilio.

**Request Body:**

```json
{
  "to": "+1234567890",
  "message": "Your personalized message here"
}
```

**Response:**

```json
{
  "success": true,
  "messageId": "SM1234567890abcdef",
  "message": "SMS sent successfully"
}
```

### Email Endpoint

**POST** `/api/send-email`

Send an email message via Nodemailer.

**Request Body:**

```json
{
  "to": "recipient@example.com",
  "message": "Your personalized message here",
  "subject": "HoHoKus St Barts Celebration"
}
```

**Response:**

```json
{
  "success": true,
  "messageId": "<abc123@example.com>",
  "message": "Email sent successfully"
}
```

### Health Check

**GET** `/api/health`

Check server status and service configuration.

**Response:**

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "services": {
    "twilio": true,
    "email": true
  }
}
```

### Configuration

**GET** `/api/config`

Get server configuration information.

**Response:**

```json
{
  "twilioConfigured": true,
  "emailConfigured": true,
  "defaultPhoneNumber": "+16592745880",
  "defaultEmail": "mahoneg1@gmail.com",
  "secretaryEmail": "hohosecretary@gmail.com"
}
```

## Configuration Guide

### Twilio Setup (for SMS)

1. **Create a Twilio Account**

   - Sign up at [twilio.com](https://www.twilio.com)
   - Get your Account SID and Auth Token from the console

2. **Get a Phone Number**

   - Purchase a phone number in the Twilio console
   - Note the phone number for configuration

3. **Configure Environment Variables**
   ```env
   TWILIO_ACCOUNT_SID=AC1234567890abcdef
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_PHONE_NUMBER=+16592745880
   ```

### Gmail Setup (for Email)

1. **Enable 2-Factor Authentication**

   - Go to your Google Account settings
   - Enable 2-factor authentication

2. **Generate App Password**

   - Go to Google Account → Security → App passwords
   - Generate a new app password for "Mail"
   - Use this password instead of your regular Gmail password

3. **Configure Environment Variables**
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password_here
   SECRETARY_EMAIL=hohosecretary@gmail.com
   ```

## Security Considerations

### Environment Variables

- Never commit `.env` files to version control
- Use strong, unique passwords for app passwords
- Rotate API keys regularly

### CORS Configuration

The server includes CORS middleware for cross-origin requests. In production, you may want to restrict this to specific domains:

```javascript
app.use(
  cors({
    origin: ["http://localhost:3000", "https://yourdomain.com"],
  })
);
```

### Rate Limiting

For production use, consider adding rate limiting:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use("/api/", limiter);
```

## Error Handling

The server includes comprehensive error handling:

- **Validation Errors**: Invalid phone numbers, email addresses
- **Service Errors**: Twilio/Nodemailer failures
- **Network Errors**: Connection timeouts
- **Server Errors**: Internal server errors

All errors are logged to the console and returned as JSON responses.

## Logging

The server logs important events:

- Server startup and configuration
- Successful SMS/email sends
- Error conditions
- API requests

Example logs:

```
Server running on http://localhost:3000
SMS sent successfully: SM1234567890abcdef
Email sent successfully: <abc123@example.com>
SMS sending error: Invalid phone number
```

## Development

### Running in Development Mode

```bash
npm run dev
```

This uses nodemon for automatic server restart on file changes.

### Testing Endpoints

You can test the API endpoints using curl:

```bash
# Test SMS
curl -X POST http://localhost:3000/api/send-sms \
  -H "Content-Type: application/json" \
  -d '{"to":"+1234567890","message":"Test message"}'

# Test Email
curl -X POST http://localhost:3000/api/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","message":"Test email"}'

# Health Check
curl http://localhost:3000/api/health
```

## Production Deployment

### Environment Variables

Ensure all required environment variables are set in your production environment.

### Process Management

Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start server.js --name "sheets-merge-sender"
pm2 save
pm2 startup
```

### Reverse Proxy

Use Nginx or Apache as a reverse proxy:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Common Issues

1. **Twilio Authentication Error**

   - Verify your Account SID and Auth Token
   - Check that your Twilio account is active

2. **Gmail Authentication Error**

   - Ensure 2-factor authentication is enabled
   - Use app password instead of regular password
   - Check that "Less secure app access" is not required

3. **CORS Errors**

   - Verify the frontend is making requests to the correct URL
   - Check that CORS middleware is properly configured

4. **Port Already in Use**
   - Change the PORT environment variable
   - Kill the process using the port: `lsof -ti:3000 | xargs kill`

### Debug Mode

Enable debug logging by setting the NODE_ENV:

```bash
NODE_ENV=development npm start
```

## Support

For issues or questions:

1. Check the server logs for error messages
2. Verify all environment variables are set correctly
3. Test individual services (Twilio/Gmail) separately
4. Check the health endpoint for service status
