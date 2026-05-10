/**
 * LeadForge Digital — Express Backend
 * Handles contact form submissions and sends email notifications.
 *
 * Setup:
 *   npm install express nodemailer cors dotenv express-rate-limit helmet
 *   cp .env.example .env   (fill in your SMTP credentials)
 *   node api/server.js
 */

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

/* ---- Security & Middleware ---- */
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*', // Set to your domain in production
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (the frontend)
app.use(express.static(path.join(__dirname, '..')));

/* ---- Rate Limiting: prevent spam on contact form ---- */
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,                    // Max 5 submissions per IP per window
  message: { error: 'Too many submissions. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/* ---- Nodemailer transporter ---- */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter on startup
transporter.verify((err) => {
  if (err) {
    console.warn('⚠️  Email transporter not configured:', err.message);
    console.warn('   Forms will log to console only until SMTP is set up.');
  } else {
    console.log('✅ Email transporter ready');
  }
});

/* ---- Validation helper ---- */
function validateContactPayload(body) {
  const errors = [];
  if (!body.name || body.name.trim().length < 2) errors.push('Name is required');
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) errors.push('Valid email required');
  if (!body.phone || body.phone.replace(/\D/g, '').length < 10) errors.push('Valid phone number required');
  if (!body.business_type) errors.push('Business type is required');
  return errors;
}

/* ---- HTML email template ---- */
function buildEmailHTML(data) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; color: #1e293b; background: #f8fafc; margin:0; padding:0; }
  .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.1); }
  .header { background: #0a1628; padding: 32px; text-align: center; }
  .header h1 { color: #f5a623; margin: 0; font-size: 22px; }
  .header p { color: rgba(255,255,255,.6); margin: 8px 0 0; font-size: 14px; }
  .body { padding: 32px; }
  .field { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
  .field label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; display: block; margin-bottom: 4px; }
  .field value { font-size: 15px; color: #1e293b; }
  .cta { background: #f5a623; color: #060d1a; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 700; display: inline-block; margin-top: 16px; }
  .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
</style></head>
<body>
<div class="container">
  <div class="header">
    <h1>🔥 New Lead — LeadForge Digital</h1>
    <p>A potential client submitted the contact form</p>
  </div>
  <div class="body">
    <div class="field"><label>Name</label><value>${data.name}</value></div>
    <div class="field"><label>Email</label><value><a href="mailto:${data.email}">${data.email}</a></value></div>
    <div class="field"><label>Phone</label><value><a href="tel:${data.phone}">${data.phone}</a></value></div>
    <div class="field"><label>Business Type</label><value>${data.business_type}</value></div>
    ${data.current_website ? `<div class="field"><label>Current Website</label><value><a href="${data.current_website}">${data.current_website}</a></value></div>` : ''}
    ${data.message ? `<div class="field"><label>Challenge / Message</label><value>${data.message}</value></div>` : ''}
    <div class="field"><label>SMS Consent</label><value>${data.sms_consent ? 'Yes' : 'No'}</value></div>
    <div class="field"><label>Submitted At</label><value>${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET</value></div>
    <a href="mailto:${data.email}?subject=Re: Your LeadForge Digital Inquiry" class="cta">Reply to ${data.name} →</a>
  </div>
  <div class="footer">LeadForge Digital LLC · leadforgedigital.com · Do not forward this email.</div>
</div>
</body>
</html>
  `;
}

/* ---- Auto-reply email to client ---- */
function buildAutoReplyHTML(name) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><style>
  body { font-family: Arial, sans-serif; color: #1e293b; background: #f8fafc; margin:0; padding:0; }
  .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,.1); }
  .header { background: #0a1628; padding: 32px; text-align: center; }
  .header h1 { color: #f5a623; margin: 0; font-size: 20px; }
  .body { padding: 36px; }
  .body p { color: #475569; line-height: 1.75; margin: 0 0 16px; }
  .cta { background: #f5a623; color: #060d1a; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 700; display: inline-block; margin: 8px 0 24px; }
  .footer { background: #f8fafc; padding: 20px 32px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
</style></head>
<body>
<div class="container">
  <div class="header"><h1>✅ We got your message, ${name}!</h1></div>
  <div class="body">
    <p>Thanks for reaching out to LeadForge Digital. We've received your quote request and our team will review it within the next <strong>24 hours</strong>.</p>
    <p>Here's what to expect:</p>
    <p>✅ A personalized proposal tailored to your business<br>
    ✅ A quick strategy call to answer your questions<br>
    ✅ Fixed pricing with no hidden fees</p>
    <p>In the meantime, feel free to explore our case studies:</p>
    <a href="https://leadforgedigital.com/pages/portfolio.html" class="cta">View Our Results →</a>
    <p style="font-size:14px; color:#94a3b8;">Questions? Reply to this email or call us at <a href="tel:+18005550199">(800) 555-0199</a>.</p>
  </div>
  <div class="footer">
    LeadForge Digital LLC · leadforgedigital.com<br>
    <a href="#">Unsubscribe</a> · <a href="#">Privacy Policy</a>
  </div>
</div>
</body>
</html>
  `;
}

/* =====================================================
   ROUTES
   ===================================================== */

/** POST /api/contact — Contact form handler */
app.post('/api/contact', formLimiter, async (req, res) => {
  const errors = validateContactPayload(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const data = {
    name: req.body.name.trim(),
    email: req.body.email.trim().toLowerCase(),
    phone: req.body.phone.trim(),
    business_type: req.body.business_type,
    current_website: req.body.current_website?.trim() || '',
    message: req.body.message?.trim() || '',
    sms_consent: !!req.body.sms_consent,
  };

  // Always log to console for debugging
  console.log('\n📩 New form submission:', JSON.stringify(data, null, 2));

  try {
    // Send notification email to agency
    if (process.env.SMTP_USER) {
      await transporter.sendMail({
        from: `"LeadForge Digital" <${process.env.SMTP_USER}>`,
        to: process.env.NOTIFY_EMAIL || process.env.SMTP_USER,
        subject: `🔥 New Lead: ${data.name} — ${data.business_type}`,
        html: buildEmailHTML(data),
      });

      // Send auto-reply to the client
      await transporter.sendMail({
        from: `"LeadForge Digital" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: `We received your request, ${data.name} ✅`,
        html: buildAutoReplyHTML(data.name),
      });
    }

    // Optional: forward to webhook (e.g., Zapier, Make, CRM)
    if (process.env.WEBHOOK_URL) {
      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }

    return res.status(200).json({ success: true, message: 'Submission received.' });
  } catch (err) {
    console.error('Email send error:', err);
    // Still return success so the user isn't blocked — log internally
    return res.status(200).json({ success: true, message: 'Submission received (email pending).' });
  }
});

/** GET /api/health — Health check */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/** Fallback: serve index.html for all other routes */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

/* ---- Start server ---- */
app.listen(PORT, () => {
  console.log(`\n🚀 LeadForge Digital server running on http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
