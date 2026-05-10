# LeadForge Digital — Website Project

A complete, production-ready lead generation website for a U.S. small business digital agency.
Built with semantic HTML, CSS custom properties, vanilla JavaScript, and a Node.js/Express backend.

---

## Project Structure

```
leadforge-agency/
├── index.html              ← Homepage (main entry point)
├── package.json
├── .env.example            ← Copy to .env and configure
├── css/
│   ├── style.css           ← Main design system + homepage styles
│   └── pages.css           ← Inner page styles
├── js/
│   └── script.js           ← All frontend interactivity
├── api/
│   └── server.js           ← Node.js/Express backend (contact form)
├── pages/
│   ├── services.html
│   ├── portfolio.html
│   ├── about.html
│   ├── blog.html
│   └── contact.html
└── images/                 ← Add your images here
    └── (placeholder)
```

---

## Quick Start (Local Development)

### Option A: Static only (no backend)
Just open `index.html` in a browser. Forms will log to console in demo mode.

### Option B: With Node.js backend (full functionality)

**Prerequisites:** Node.js 18+ installed

```bash
# 1. Clone / download project
cd leadforge-agency

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your SMTP credentials and settings

# 4. Start server
npm run dev      # Development (with auto-reload via nodemon)
npm start        # Production

# 5. Open browser
open http://localhost:3000
```

---

## Deployment Options

### ▶ Option 1: Vercel (Recommended — Free tier)
```bash
npm install -g vercel
vercel
# Follow prompts. Set environment variables in Vercel dashboard.
```
Add a `vercel.json` to route API calls:
```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/server.js" },
    { "src": "/(.*)", "dest": "/$1" }
  ]
}
```

### ▶ Option 2: Railway / Render / Fly.io
- Connect your GitHub repo
- Set environment variables from `.env.example` in the dashboard
- Deploy branch: `main`
- Start command: `npm start`

### ▶ Option 3: Traditional VPS / cPanel
```bash
# Upload files via FTP/SSH
# Install Node.js on server
npm install --production
# Use PM2 for process management:
npm install -g pm2
pm2 start api/server.js --name leadforge
pm2 save && pm2 startup
```

### ▶ Option 4: Static hosting (Netlify, GitHub Pages) — no backend
- Upload all files except `api/` folder
- Contact form: use Netlify Forms, Formspree, or EmailJS
- Replace `fetch('/api/contact', ...)` in `js/script.js` with your static form service

---

## Configuration Checklist

### Before launching, update:

**In `index.html` and all pages:**
- [ ] Replace `leadforgedigital.com` with your actual domain
- [ ] Update phone number `(800) 555-0199`
- [ ] Update email `hello@leadforgedigital.com`
- [ ] Uncomment and configure Google Analytics 4 tag
- [ ] Uncomment and configure Meta Pixel (if using)
- [ ] Update JSON-LD schema markup (address, phone, URL)
- [ ] Replace placeholder logo "LF" with actual logo SVG/image

**In `.env`:**
- [ ] Set `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`
- [ ] Set `NOTIFY_EMAIL` (where new leads go)
- [ ] Set `ALLOWED_ORIGIN` to your domain
- [ ] Optionally set `WEBHOOK_URL` for CRM/Zapier integration

**Content:**
- [ ] Replace all testimonial names/companies with real clients (with permission)
- [ ] Add real case study metrics from your actual work
- [ ] Upload real portfolio screenshots to `/images/`
- [ ] Update team names and bios in `about.html`
- [ ] Add Google Maps embed in `contact.html`
- [ ] Update blog post titles/content with real articles

**SEO:**
- [ ] Update all `<meta>` title and description tags with your real city/market
- [ ] Update JSON-LD schema with your actual business address
- [ ] Add `sitemap.xml` (generate at xml-sitemaps.com)
- [ ] Add `robots.txt`
- [ ] Submit to Google Search Console

---

## Contact Form: Email Setup

The form uses Nodemailer. Quickest setup with Gmail:

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Generate an App Password for "Mail"
4. Set in `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=you@gmail.com
   SMTP_PASS=xxxx-xxxx-xxxx-xxxx   (your App Password)
   ```

For production, use a dedicated email service:
- **SendGrid** (free up to 100 emails/day): `SMTP_HOST=smtp.sendgrid.net`
- **Mailgun**: `SMTP_HOST=smtp.mailgun.org`
- **Postmark**: `SMTP_HOST=smtp.postmarkapp.com`

---

## Customizing Colors & Fonts

All design tokens are in `:root {}` at the top of `css/style.css`:

```css
:root {
  --navy-900: #0a1628;      /* Primary dark color */
  --amber-500: #f5a623;     /* Accent / CTA color */
  --font-display: 'Syne';   /* Headings font */
  --font-body: 'DM Sans';   /* Body font */
}
```

Change these to match your brand. Google Fonts URL is in the `<head>` of each HTML file.

---

## Adding a CMS (Optional)

For client-editable content without code:

**Option A: WordPress**
- Export HTML design to WordPress theme
- Use ACF (Advanced Custom Fields) for editable sections

**Option B: Webflow**
- Recreate in Webflow Editor for visual editing
- Export clean HTML/CSS

**Option C: Decap CMS (formerly Netlify CMS)**
- Add `admin/config.yml` to connect to Git-based CMS
- Free, works with Netlify hosting

---

## Performance Notes

This site is optimized for Core Web Vitals:
- No render-blocking scripts (JS deferred at bottom)
- Google Fonts loaded with `display=swap`
- CSS animations use `transform` (GPU-accelerated)
- Images should use WebP format + `loading="lazy"` attribute
- Target: Lighthouse score 90+ on mobile

---

## Support

Questions about setup or customization?
📧 hello@leadforgedigital.com
📞 (800) 555-0199

---

© 2025 LeadForge Digital LLC
