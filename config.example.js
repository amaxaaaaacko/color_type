// Example configuration file
// Copy this to the CONFIG object in script.js and replace with your actual values

const EXAMPLE_CONFIG = {
    // OpenAI API Key - Get from https://platform.openai.com/
    OPENAI_API_KEY: 'sk-your-openai-api-key-here',
    
    // Google Sheets webhook URL
    // Option 1: Google Apps Script deployment URL
    GOOGLE_SHEETS_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    
    // Option 2: Zapier webhook URL
    // GOOGLE_SHEETS_URL: 'https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/',
    
    // Facebook Pixel ID - Get from Facebook Business Manager
    FB_PIXEL_ID: '1234567890123456',
    
    // Microsoft Clarity Project ID - Get from https://clarity.microsoft.com/
    CLARITY_ID: 'abcd1234',
    
    // Custom analysis prompt - Modify as needed
    ANALYSIS_PROMPT: `Analyze this image comprehensively and provide insights about:

1. Color Composition: Describe the dominant colors, color harmony, and palette analysis
2. Mood & Atmosphere: What emotions or feelings does the image convey?
3. Visual Elements: Composition, lighting, focal points, and artistic techniques
4. Style Analysis: Art style, photographic technique, or design approach
5. Aesthetic Quality: Overall visual impact and artistic merit

Please provide a detailed but accessible analysis that would be valuable for someone interested in understanding their image better. Keep the tone engaging and informative.`
};

// Notes:
// - All API keys should be kept secure and not committed to public repositories
// - Consider using environment variables or server-side configuration in production
// - The demo mode will activate automatically if placeholder values are detected