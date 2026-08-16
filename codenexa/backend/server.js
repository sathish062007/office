require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretcodenexa_jwt';

// In-memory OTP store for demonstration
// Format: { 'email_or_phone': { otp: '123456', expiresAt: timestamp } }
const otpStore = {};

// Mail Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Twilio Client Setup
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

// Generate a random 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// 1. Send OTP Route
app.post('/api/auth/send-otp', async (req, res) => {
    const { contact } = req.body;
    
    if (!contact) {
        return res.status(400).json({ error: 'Email or Mobile Number is required.' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes expiry
    
    otpStore[contact] = { otp, expiresAt };

    // Simulate sending OTP (in production, you'd integrate SMS/Email services here)
    console.log(`[OTP Generated] To: ${contact} | OTP: ${otp}`);

    res.json({ message: 'OTP sent successfully. (Check console for mock OTP)', success: true, mockOtp: otp });
});

// 2. Verify OTP Route
app.post('/api/auth/verify-otp', (req, res) => {
    const { contact, otp } = req.body;

    if (!contact || !otp) {
        return res.status(400).json({ error: 'Contact and OTP are required.' });
    }

    const storedData = otpStore[contact];

    if (!storedData) {
        return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
    }

    if (Date.now() > storedData.expiresAt) {
        delete otpStore[contact];
        return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
    }

    if (storedData.otp === String(otp)) {
        delete otpStore[contact]; // OTP used
        const token = jwt.sign({ contact }, JWT_SECRET, { expiresIn: '2h' });
        return res.json({ success: true, token, message: 'Login successful' });
    } else {
        return res.status(400).json({ error: 'Invalid OTP.' });
    }
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// 3. Submit Requirement Route
app.post('/api/submit-requirement', authenticateToken, async (req, res) => {
    const {
        fullName,
        email,
        contactNumber,
        companyName,
        requirementType,
        projectTitle,
        details,
        referenceUrl,
        budget,
        deadline,
        preferredContact
    } = req.body;

    // Validate minimum requirements
    if (!fullName || !email || !requirementType || !details) {
        return res.status(400).json({ error: 'Please fill all required fields.' });
    }

    const emailHtml = `
        <h2>New Requirement Submission: Codenexa</h2>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${contactNumber}</p>
        <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
        <p><strong>Requirement Type:</strong> ${requirementType}</p>
        <p><strong>Project Title:</strong> ${projectTitle || 'N/A'}</p>
        <p><strong>Details:</strong><br/>${details.replace(/\n/g, '<br/>')}</p>
        <p><strong>Reference URL:</strong> ${referenceUrl || 'N/A'}</p>
        <p><strong>Budget:</strong> ${budget || 'N/A'}</p>
        <p><strong>Deadline:</strong> ${deadline || 'N/A'}</p>
        <p><strong>Preferred Contact:</strong> ${preferredContact}</p>
    `;

    const whatsAppMessage = `
*New Codenexa Requirement!*
*Name:* ${fullName}
*Type:* ${requirementType}
*Budget:* ${budget || 'N/A'}
*Details:* ${details.substring(0, 100)}...
    `;

    try {
        // Send Email
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: 'codenexa11@gmail.com',
                subject: `New Requirement from ${fullName} - ${requirementType}`,
                html: emailHtml
            });
            console.log('[Email] Requirement notification sent.');
        } else {
            console.log('[Email] Credentials missing. Mock email dispatch:\n', emailHtml);
        }

        // Send WhatsApp
        if (twilioClient) {
            await twilioClient.messages.create({
                body: whatsAppMessage,
                from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
                to: 'whatsapp:+918838303167'
            });
            console.log('[WhatsApp] Requirement notification sent.');
        } else {
            console.log('[WhatsApp] Twilio credentials missing. Mock WhatsApp dispatch:\n', whatsAppMessage);
        }

        res.json({ success: true, message: 'Requirement submitted successfully.' });
    } catch (error) {
        console.error('[Notification Error]', error);
        res.status(500).json({ error: 'Failed to send notifications, but requirement was received.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
