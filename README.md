# Color Type AI - Secure Image Analysis Tool

An AI-powered application that analyzes uploaded images using GPT-4 Vision with a secure server-side architecture that protects your API keys.

## 🔒 Security First

This application now uses a **secure server-side architecture** to protect your API keys and credentials from being exposed to users.

## Features

- 🖼️ **Secure Image Upload**: Drag & drop or click to upload images (JPG, PNG, WebP up to 10MB)
- 🤖 **AI Analysis**: GPT-4 Vision API analyzes images for color composition, mood, and visual elements
- ⭐ **Review System**: Star ratings and text feedback collection
- 📊 **Data Collection**: Reviews and app interest stored in Google Sheets
- 📈 **Analytics**: Microsoft Clarity for site analytics
- 📱 **Facebook Pixel**: Conversion tracking and audience building
- 📱 **Mobile App Interest**: Form to gauge interest in mobile version
- 🛡️ **API Key Protection**: All sensitive credentials stored server-side only

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and add your API keys:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
GOOGLE_SHEETS_URL=https://your-webhook-url.com
FB_PIXEL_ID=your-facebook-pixel-id
CLARITY_ID=your-clarity-project-id
PORT=3000
```

### 3. Start the Server

```bash
# Production
npm start

# Development (with auto-restart)
npm run dev
```

### 4. Open the Application

Navigate to `http://localhost:3000` in your browser.

## 🛡️ Security Features

- ✅ **API keys protected server-side**: No sensitive data exposed to client
- ✅ **Environment variables**: Secured with `.gitignore`
- ✅ **Server-side processing**: All API calls happen on your server
- ✅ **CORS protection**: Configured for security
- ✅ **Demo mode**: Works without API keys for testing

## API Configuration

### OpenAI API Setup

1. Sign up at [OpenAI](https://platform.openai.com/)
2. Create an API key
3. Replace `YOUR_OPENAI_API_KEY` in the config

### 3. Google Sheets Integration

#### Option A: Google Apps Script (Recommended)
1. Create a new Google Sheet
2. Add columns: `timestamp`, `rating`, `reviewText`, `email`, `analysis`
3. Create a Google Apps Script with this code:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  if (e.parameter.type === 'reviews') {
    sheet.appendRow([
      data.timestamp,
      data.rating,
      data.reviewText,
      data.email,
      data.analysis
    ]);
  } else if (e.parameter.type === 'app_interest') {
    sheet.appendRow([
      data.timestamp,
      data.appInterest,
      data.appEmail,
      data.appFeatures
    ]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Deploy as web app and use the URL

#### Option B: Zapier Integration
1. Create Zapier webhook
2. Connect to Google Sheets
3. Use webhook URL in config

### 4. Microsoft Clarity Setup

1. Sign up at [Microsoft Clarity](https://clarity.microsoft.com/)
2. Create a project
3. Replace `YOUR_CLARITY_PROJECT_ID` in both HTML and JS files

### 5. Facebook Pixel Setup

1. Create Facebook Business account
2. Set up Facebook Pixel in Events Manager
3. Replace `YOUR_FB_PIXEL_ID` in both HTML and JS files

### 6. Customization

#### Analysis Prompt
Customize the AI analysis by modifying `ANALYSIS_PROMPT` in the config:

```javascript
ANALYSIS_PROMPT: 'Analyze this image focusing on [your specific requirements]. Provide insights about...'
```

#### Styling
Modify `styles.css` to match your brand:
- Colors: Update the CSS custom properties
- Fonts: Change the font-family declarations
- Layout: Adjust spacing and sizing

## Demo Mode

The application includes a demo mode that works without API keys. It will automatically enable when placeholder API keys are detected, showing mock responses for testing.

## File Structure

```
├── index.html          # Main landing page
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── README.md           # This file
└── config.example.js   # Example configuration
```

## Browser Support

- Chrome/Edge 80+
- Firefox 75+
- Safari 13+
- Mobile browsers

## Privacy & GDPR

- Email collection is optional
- Clear privacy messaging recommended
- Consider adding privacy policy link
- Data stored in Google Sheets (review data retention policies)

## Performance

- Images are processed client-side before API calls
- Lazy loading for sections
- Optimized CSS and JavaScript
- Mobile-responsive design

## Deployment

### Static Hosting (Recommended)
- Netlify
- Vercel
- GitHub Pages
- Firebase Hosting

### Traditional Hosting
- Upload all files to web server
- Ensure HTTPS for API calls
- Configure proper MIME types

## Cost Estimates

- **OpenAI API**: ~$0.01-0.03 per image analysis
- **Google Sheets**: Free up to usage limits
- **Clarity**: Free
- **Facebook Pixel**: Free
- **Hosting**: $0-10/month depending on traffic

## Troubleshooting

### Common Issues

1. **API Errors**: Check API keys and quotas
2. **CORS Issues**: Use proper hosting (not file://)
3. **Image Upload**: Check file size and format
4. **Analytics**: Verify tracking codes are correct

### Debug Mode

Enable console logging by adding to your config:
```javascript
DEBUG: true
```

## Security Considerations

- API keys should be server-side in production
- Consider rate limiting for API calls
- Validate all user inputs
- Use HTTPS for all API communications

## Contributing

1. Fork the repository
2. Create feature branch
3. Submit pull request with description

## License

MIT License - feel free to use and modify for your projects.