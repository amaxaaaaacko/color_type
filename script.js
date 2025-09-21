// Configuration - Replace with your actual API keys and IDs
const CONFIG = {
    OPENAI_API_KEY: 'YOUR_OPENAI_API_KEY', // Replace with your OpenAI API key
    GOOGLE_SHEETS_URL: 'YOUR_GOOGLE_SHEETS_WEBHOOK_URL', // Replace with your Google Sheets webhook
    FB_PIXEL_ID: 'YOUR_FB_PIXEL_ID', // Replace with your Facebook Pixel ID
    CLARITY_ID: 'YOUR_CLARITY_PROJECT_ID', // Replace with your Clarity project ID
    // Default analysis prompt - you can customize this
    ANALYSIS_PROMPT: 'Analyze this image for color composition, mood, style, and dominant visual elements. Provide insights about the color palette, emotional impact, and artistic qualities. Keep the response engaging and informative for a general audience.'
};

// Global variables
let currentImageFile = null;
let currentAnalysis = null;

// DOM elements
const uploadArea = document.getElementById('uploadArea');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('resultsSection');
const loadingSpinner = document.getElementById('loadingSpinner');
const analysisResults = document.getElementById('analysisResults');
const reviewSection = document.getElementById('reviewSection');
const reviewForm = document.getElementById('reviewForm');
const appInterestForm = document.getElementById('appInterestForm');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    trackPageView();
});

function initializeEventListeners() {
    // File upload handling
    uploadArea.addEventListener('click', () => imageInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    imageInput.addEventListener('change', handleFileSelect);
    
    // Analysis button
    analyzeBtn.addEventListener('click', analyzeImage);
    
    // Form submissions
    reviewForm.addEventListener('submit', handleReviewSubmission);
    appInterestForm.addEventListener('submit', handleAppInterestSubmission);
}

// File upload handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showError('Please select a valid image file.');
        return;
    }
    
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size must be less than 10MB.');
        return;
    }
    
    currentImageFile = file;
    
    // Preview the image
    const reader = new FileReader();
    reader.onload = function(e) {
        imagePreview.innerHTML = `<img src="${e.target.result}" alt="Uploaded image">`;
        analyzeBtn.disabled = false;
    };
    reader.readAsDataURL(file);
    
    // Track file upload event
    trackEvent('file_upload', { file_type: file.type, file_size: file.size });
}

// Image analysis using OpenAI GPT-4 Vision
async function analyzeImage() {
    if (!currentImageFile) {
        showError('Please select an image first.');
        return;
    }
    
    // Show loading state
    resultsSection.style.display = 'block';
    loadingSpinner.style.display = 'block';
    analysisResults.style.display = 'none';
    analyzeBtn.disabled = true;
    
    try {
        // Convert image to base64
        const base64Image = await fileToBase64(currentImageFile);
        
        // Call OpenAI API
        const analysis = await callOpenAIVision(base64Image);
        
        // Display results
        displayAnalysis(analysis);
        currentAnalysis = analysis;
        
        // Show review section
        reviewSection.style.display = 'block';
        
        // Track analysis event
        trackEvent('image_analysis', { success: true });
        
    } catch (error) {
        console.error('Analysis error:', error);
        showError('Sorry, there was an error analyzing your image. Please try again.');
        trackEvent('image_analysis', { success: false, error: error.message });
    } finally {
        loadingSpinner.style.display = 'none';
        analyzeBtn.disabled = false;
    }
}

async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

async function callOpenAIVision(base64Image) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-4-vision-preview",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: CONFIG.ANALYSIS_PROMPT
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: "high"
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500
        })
    });
    
    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
}

function displayAnalysis(analysis) {
    analysisResults.innerHTML = `
        <h3>Analysis Results</h3>
        <div class="analysis-text">${analysis.replace(/\n/g, '<br>')}</div>
    `;
    analysisResults.style.display = 'block';
}

// Review form handling
async function handleReviewSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(reviewForm);
    const reviewData = {
        rating: formData.get('rating'),
        reviewText: formData.get('reviewText'),
        email: formData.get('email'),
        timestamp: new Date().toISOString(),
        analysis: currentAnalysis
    };
    
    try {
        await submitToGoogleSheets(reviewData, 'reviews');
        showSuccess('Thank you for your review!');
        reviewForm.reset();
        
        // Track review submission
        trackEvent('review_submission', { rating: reviewData.rating });
        
    } catch (error) {
        console.error('Review submission error:', error);
        showError('Sorry, there was an error submitting your review. Please try again.');
    }
}

// App interest form handling
async function handleAppInterestSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(appInterestForm);
    const interestData = {
        appInterest: formData.get('appInterest'),
        appEmail: formData.get('appEmail'),
        appFeatures: formData.get('appFeatures'),
        timestamp: new Date().toISOString()
    };
    
    try {
        await submitToGoogleSheets(interestData, 'app_interest');
        showSuccess('Thank you for your interest! We\'ll keep you updated.');
        appInterestForm.reset();
        
        // Track app interest
        trackEvent('app_interest_submission', { interest_level: interestData.appInterest });
        
    } catch (error) {
        console.error('App interest submission error:', error);
        showError('Sorry, there was an error submitting your interest. Please try again.');
    }
}

// Google Sheets integration
async function submitToGoogleSheets(data, sheetType) {
    // This would typically use Google Apps Script or a service like Zapier
    // For now, we'll use a placeholder webhook URL
    const webhookUrl = CONFIG.GOOGLE_SHEETS_URL + `?type=${sheetType}`;
    
    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    if (!response.ok) {
        throw new Error(`Submission failed: ${response.status}`);
    }
    
    return response.json();
}

// Analytics and tracking
function trackPageView() {
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', 'PageView');
    }
    
    // Microsoft Clarity
    if (typeof clarity !== 'undefined') {
        clarity('set', 'page_view', 'landing_page');
    }
}

function trackEvent(eventName, properties = {}) {
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, properties);
    }
    
    // Microsoft Clarity
    if (typeof clarity !== 'undefined') {
        clarity('set', eventName, JSON.stringify(properties));
    }
    
    // Console log for debugging
    console.log('Event tracked:', eventName, properties);
}

// Utility functions
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    // Insert at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(successDiv, container.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 5000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Insert at the top of the container
    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, container.firstChild);
    
    // Remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

// Demo mode for testing without API keys
function enableDemoMode() {
    console.log('Demo mode enabled - using mock responses');
    
    // Override API call with mock response
    window.callOpenAIVision = async function(base64Image) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return `This is a demo analysis of your uploaded image. 

Color Analysis: The image features a rich palette with dominant blues and warm accent colors that create visual harmony.

Mood & Atmosphere: The composition conveys a sense of tranquility and balance, with excellent use of light and shadow.

Visual Elements: Strong compositional elements guide the viewer's eye through the frame, creating engaging visual flow.

Artistic Quality: The image demonstrates good understanding of color theory and visual design principles.

Note: This is a demonstration. Replace with your OpenAI API key to get real AI analysis.`;
    };
    
    // Override Google Sheets submission
    window.submitToGoogleSheets = async function(data, sheetType) {
        console.log('Demo: Would submit to Google Sheets:', data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    };
}

// Check if we're in demo mode (no API keys configured)
if (CONFIG.OPENAI_API_KEY === 'YOUR_OPENAI_API_KEY' || !CONFIG.OPENAI_API_KEY) {
    enableDemoMode();
}