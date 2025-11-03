// Client configuration - will be loaded from server
let CONFIG = {
    FB_PIXEL_ID: null,
    CLARITY_ID: null
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
const downloadSection = document.getElementById('downloadSection');
const downloadBtn = document.getElementById('downloadBtn');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadConfiguration();
    initializeEventListeners();
    trackPageView();
});

// Load configuration from server
async function loadConfiguration() {
    try {
        const response = await fetch('/api/config');
        const config = await response.json();
        CONFIG.FB_PIXEL_ID = config.FB_PIXEL_ID;
        CONFIG.CLARITY_ID = config.CLARITY_ID;
    } catch (error) {
        console.error('Failed to load configuration:', error);
    }
}

function initializeEventListeners() {
    // File upload handling
    uploadArea.addEventListener('click', () => imageInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    imageInput.addEventListener('change', handleFileSelect);
    
    // Analysis button
    analyzeBtn.addEventListener('click', analyzeImage);
    
    // Download button
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            // Track the download app interest
            trackEvent('download_app_click', {
                source: 'main_page',
                user_completed_analysis: true
            });
            
            // Small delay to ensure tracking completes
            setTimeout(() => {
                window.location.href = '/app-coming-soon.html';
            }, 200);
        });
    }
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
    trackEvent('file_upload', { 
        file_type: file.type, 
        file_size: file.size,
        file_size_mb: Math.round(file.size / 1024 / 1024 * 100) / 100
    });
}

// Image analysis using server API
async function analyzeImage() {
    if (!currentImageFile) {
        showError('Please select an image first.');
        return;
    }
    
    // Track analysis start
    trackEvent('analysis_started', {
        file_type: currentImageFile.type,
        file_size_mb: Math.round(currentImageFile.size / 1024 / 1024 * 100) / 100
    });
    
    // Show loading state
    resultsSection.style.display = 'block';
    loadingSpinner.style.display = 'block';
    analysisResults.style.display = 'none';
    analyzeBtn.disabled = true;
    
    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('image', currentImageFile);
        
        // Call server API
        const response = await fetch('/api/analyze-image', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        const analysis = data.analysis;
        
        // Display results
        displayAnalysis(analysis);
        currentAnalysis = analysis;
        
        // Show download section
        downloadSection.style.display = 'block';
        
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

function displayAnalysis(analysis) {
    analysisResults.innerHTML = `
        <h3>Your Color Analysis Results</h3>
        <div class="analysis-text">${analysis.replace(/\n/g, '<br>')}</div>
    `;
    analysisResults.style.display = 'block';
}

// Removed - now handled by server
// Old client-side functions are no longer needed:
// - fileToBase64()
// - callOpenAIVision() 
// - submitToGoogleSheets()

// Analytics and tracking
function trackPageView() {
    trackEvent('page_view', {
        page: 'main_landing',
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`
    });
}

function trackEvent(eventName, properties = {}) {
    // Facebook Pixel events
    if (typeof fbq !== 'undefined') {
        switch(eventName) {
            case 'page_view':
                fbq('track', 'PageView');
                break;
            case 'file_upload':
                fbq('track', 'InitiateCheckout', {
                    content_category: 'color_analysis',
                    content_name: 'photo_upload'
                });
                break;
            case 'analysis_started':
                fbq('track', 'AddToCart', {
                    content_name: 'color_analysis_started',
                    content_category: 'analysis'
                });
                break;
            case 'image_analysis':
                if (properties.success) {
                    fbq('track', 'Purchase', {
                        currency: 'USD',
                        value: 0.00,
                        content_name: 'color_analysis_completed',
                        content_category: 'analysis'
                    });
                } else {
                    fbq('track', 'AddToCart', {
                        content_name: 'analysis_failed'
                    });
                }
                break;
            case 'download_app_click':
                fbq('track', 'Lead', {
                    content_name: 'download_app_interest',
                    content_category: 'app_download'
                });
                break;
            case 'app_coming_soon_visit':
                fbq('track', 'ViewContent', {
                    content_name: 'app_coming_soon_page',
                    content_category: 'app_interest'
                });
                break;
            case 'email_signup':
                fbq('track', 'CompleteRegistration', {
                    content_name: 'app_notification_signup'
                });
                break;
            default:
                fbq('track', 'CustomEvent', {
                    event_name: eventName,
                    ...properties
                });
        }
    }
    
    // Microsoft Clarity events
    if (typeof clarity !== 'undefined') {
        clarity('set', eventName, JSON.stringify(properties));
        
        // Additional Clarity custom events
        switch(eventName) {
            case 'file_upload':
                clarity('set', 'user_engagement', 'photo_uploaded');
                break;
            case 'analysis_started':
                clarity('set', 'user_engagement', 'analysis_button_clicked');
                break;
            case 'image_analysis':
                clarity('set', 'conversion', properties.success ? 'analysis_success' : 'analysis_failed');
                break;
            case 'download_app_click':
                clarity('set', 'conversion', 'app_interest_shown');
                break;
        }
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
    
    // Override the server calls with mock responses for development
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (url === '/api/analyze-image') {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            analysis: `This is a demo analysis of your uploaded image. 

Color Analysis: The image features a rich palette with dominant blues and warm accent colors that create visual harmony.

Mood & Atmosphere: The composition conveys a sense of tranquility and balance, with excellent use of light and shadow.

Visual Elements: Strong compositional elements guide the viewer's eye through the frame, creating engaging visual flow.

Artistic Quality: The image demonstrates good understanding of color theory and visual design principles.

Note: This is a demonstration. Configure your server with real API keys to get actual AI analysis.`
                        })
                    });
                }, 2000);
            });
        } else if (url.startsWith('/api/submit-')) {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        ok: true,
                        json: () => Promise.resolve({ success: true, message: 'Demo submission successful!' })
                    });
                }, 1000);
            });
        } else if (url === '/api/config') {
            return Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ FB_PIXEL_ID: null, CLARITY_ID: null })
            });
        }
        
        return originalFetch.apply(this, arguments);
    };
}

// Check if we're in demo mode (server not responding or no config)
fetch('/api/config')
    .then(response => response.json())
    .catch(() => {
        console.log('Server not available, enabling demo mode');
        enableDemoMode();
    });