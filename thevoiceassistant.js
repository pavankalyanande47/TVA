// speechbot-integrated.js
// SpeechBot with bottom-right positioning and proper UI

// Create and inject the speechbot HTML structure
const speechbotHTML = `
<div class="speechbot-container" id="speechbot-container">
    <!-- Floating Button -->
    <button class="speechbot-toggle-btn" id="speechbotToggle">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" class="mic-icon">
            <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14S10 13.1 10 12V4C10 2.9 10.9 2 12 2ZM18.9 11C18.4 11 18 11.4 18 11.9C18 16.3 14.4 19.8 10 19.8S2 16.3 2 11.9C2 11.4 1.6 11 1.1 11C0.6 11 0.2 11.4 0.2 11.9C0.2 17.1 4.3 21.4 9.5 21.9V23C9.5 23.6 9.9 24 10.5 24S11.5 23.6 11.5 23V21.9C16.7 21.4 20.8 17.1 20.8 11.9C20.8 11.4 20.4 11 19.9 11Z"/>
        </svg>
        <span class="pulse-dot"></span>
    </button>
    
    <!-- Main Panel -->
    <div class="speechbot-panel" id="speechbotPanel">
        <div class="speechbot-header">
            <div class="speechbot-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#667eea">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
            </div>
            <div>
                <h4>SpeechBot Assistant 
                    <span class="language-badge" id="currentLangBadge">EN</span>
                </h4>
                <div class="speechbot-status" id="speechbotStatus">Ready</div>
            </div>
            <button class="speechbot-close" id="speechbotClose">&times;</button>
        </div>
        
        <div class="speechbot-conversation" id="speechbotConversation">
            <!-- Messages appear here -->
        </div>
        
        <div class="speechbot-controls">
            <!-- Language Selection -->
            <div class="lang-selection" id="langSelection">
                <div class="lang-header">
                    <p class="lang-prompt">Choose your language:</p>
                    <button class="clear-btn" id="clearBtn" title="Clear conversation and restart">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#64748b">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                        Clear
                    </button>
                </div>
                <div class="lang-dropdown-container">
                    <div class="lang-dropdown" id="langDropdown">
                        <div class="lang-dropdown-selected" id="langDropdownSelected">
                            <span class="selected-text">Select Language</span>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="#64748b" class="dropdown-arrow">
                                <path d="M7 10l5 5 5-5z"/>
                            </svg>
                        </div>
                        <div class="lang-dropdown-options" id="langDropdownOptions">
                            <div class="lang-option" data-lang="en">
                                <span class="lang-name">English</span>
                                <span class="lang-code">EN</span>
                            </div>
                            <div class="lang-option" data-lang="hi">
                                <span class="lang-name">हिंदी</span>
                                <span class="lang-code">HI</span>
                            </div>
                            <div class="lang-option" data-lang="te">
                                <span class="lang-name">తెలుగు</span>
                                <span class="lang-code">TE</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Voice Control -->
            <div class="voice-control" id="voiceControl" style="display:none;">
                <div class="voice-control-header">
                    <button class="change-lang-btn" id="changeLangBtn" title="Change Language">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#667eea">
                            <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                        </svg>
                        Change Language
                    </button>
                    <button class="clear-btn" id="clearBtn2" title="Clear conversation and restart">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#64748b">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                        Clear
                    </button>
                </div>
                <button class="mic-btn" id="micBtn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white" class="mic-icon-btn">
                        <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14S10 13.1 10 12V4C10 2.9 10.9 2 12 2ZM18.9 11C18.4 11 18 11.4 18 11.9C18 16.3 14.4 19.8 10 19.8S2 16.3 2 11.9C2 11.4 1.6 11 1.1 11C0.6 11 0.2 11.4 0.2 11.9C0.2 17.1 4.3 21.4 9.5 21.9V23C9.5 23.6 9.9 24 10.5 24S11.5 23.6 11.5 23V21.9C16.7 21.4 20.8 17.1 20.8 11.9C20.8 11.4 20.4 11 19.9 11Z"/>
                    </svg>
                    <span id="micBtnText">Click to Speak</span>
                </button>
                <div class="voice-visualizer" id="voiceVisualizer" style="display:none;">
                    <div class="bar"></div><div class="bar"></div>
                    <div class="bar"></div><div class="bar"></div>
                    <div class="bar"></div>
                </div>
                <!-- Instruction will be inserted here by JavaScript -->
            </div>
        </div>
    </div>
</div>
`;

// Create and inject the CSS styles
const speechbotCSS = `
<style>
/* SpeechBot Styles - Fixed to bottom-right corner */
.speechbot-container {
    position: fixed !important;
    bottom: 30px !important;
    right: 30px !important;
    z-index: 10000 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.speechbot-toggle-btn {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
    border: 4px solid white;
    color: white;
    cursor: pointer;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    position: relative;
    outline: none;
    padding: 0;
}

.speechbot-toggle-btn:hover {
    transform: scale(1.1);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.6);
}

.speechbot-toggle-btn .mic-icon {
    width: 28px;
    height: 28px;
}

.pulse-dot {
    position: absolute;
    width: 20px;
    height: 20px;
    background: #ff6b6b;
    border-radius: 50%;
    top: 5px;
    right: 5px;
    animation: pulse 2s infinite;
    display: none;
}

@keyframes pulse {
    0% { transform: scale(0.8); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.7; }
    100% { transform: scale(0.8); opacity: 1; }
}

.speechbot-panel {
    position: absolute;
    bottom: 90px;
    right: 0;
    width: 380px;
    height: 450px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    display: none;
    overflow: hidden;
    border: 2px solid #e0e7ff;
    flex-direction: column;
}

.speechbot-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
    position: relative;
    min-height: 60px;
}

.speechbot-avatar {
    width: 36px;
    height: 36px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.speechbot-header h4 {
    margin: 0;
    flex: 1;
    font-size: 15px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
}

.language-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 500;
}

.speechbot-status {
    font-size: 10px;
    opacity: 0.8;
    margin-top: 2px;
}

.speechbot-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s;
    position: absolute;
    top: 15px;
    right: 12px;
    flex-shrink: 0;
}

.speechbot-close:hover {
    background: rgba(255, 255, 255, 0.1);
}

.speechbot-conversation {
    flex: 1;
    overflow-y: auto;
    padding: 12px;
    background: #f8fafc;
    min-height: 0;
}

.speechbot-conversation::-webkit-scrollbar {
    width: 5px;
}

.speechbot-conversation::-webkit-scrollbar-track {
    background: #f1f5f9;
}

.speechbot-conversation::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
}

.message {
    margin-bottom: 10px;
    max-width: 85%;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.bot-message {
    background: white;
    padding: 10px 12px;
    border-radius: 12px 12px 12px 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    border-left: 3px solid #667eea;
    word-wrap: break-word;
    font-size: 13px;
    line-height: 1.4;
}

.user-message {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    padding: 10px 12px;
    border-radius: 12px 12px 4px 12px;
    margin-left: auto;
    word-wrap: break-word;
    font-size: 13px;
    line-height: 1.4;
}

.bot-message strong, .user-message strong {
    display: block;
    margin-bottom: 3px;
    font-size: 11px;
    opacity: 0.8;
}

.typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 12px;
    background: white;
    border-radius: 15px;
    border: 1px solid #e0e0e0;
    max-width: 100px;
}

.typing-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #667eea;
    animation: typingBounce 1.4s ease-in-out infinite;
}

.typing-dot:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typingBounce {
    0%, 80%, 100% {
        transform: scale(0.8);
        opacity: 0.5;
    }
    40% {
        transform: scale(1);
        opacity: 1;
    }
}

.speechbot-controls {
    padding: 10px 12px;
    background: white;
    border-top: 1px solid #e0e7ff;
    flex-shrink: 0;
    min-height: 100px;
}

.lang-selection {
    text-align: center;
}

.lang-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.lang-prompt {
    color: #64748b;
    font-weight: 500;
    font-size: 12px;
    margin: 0;
}

.clear-btn {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    color: #64748b;
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 3px;
    transition: all 0.2s;
    outline: none;
}

.clear-btn:hover {
    background: #e2e8f0;
    color: #475569;
}

.lang-dropdown-container {
    margin-top: 8px;
}

.lang-dropdown {
    position: relative;
    width: 100%;
    max-width: 180px;
    margin: 0 auto;
}

.lang-dropdown-selected {
    padding: 8px 12px;
    background: white;
    border: 2px solid #667eea;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 500;
    color: #334155;
    height: 36px;
    box-sizing: border-box;
    font-size: 13px;
}

.lang-dropdown-selected .dropdown-arrow {
    transition: transform 0.3s;
}

.lang-dropdown.open .lang-dropdown-selected .dropdown-arrow {
    transform: rotate(180deg);
}

.lang-dropdown-options {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 2px solid #667eea;
    border-radius: 8px;
    margin-bottom: 4px;
    display: none;
    z-index: 1000;
    box-shadow: 0 -4px 15px rgba(0, 0, 0, 0.1);
    max-height: 150px;
    overflow-y: auto;
}

.lang-dropdown.open .lang-dropdown-options {
    display: block;
}

.lang-dropdown-options::-webkit-scrollbar {
    width: 4px;
}

.lang-dropdown-options::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 2px;
}

.lang-dropdown-options::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
}

.lang-option {
    padding: 8px 12px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background-color 0.2s;
    min-height: 36px;
    box-sizing: border-box;
    font-size: 13px;
}

.lang-option:hover {
    background: #f8fafc;
}

.lang-option .lang-name {
    font-size: 13px;
}

.lang-option .lang-code {
    background: #e0e7ff;
    color: #667eea;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 10px;
    font-weight: 600;
}

.voice-control {
    text-align: center;
}

.voice-control-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.change-lang-btn {
    background: #f1f5f9;
    border: 1px solid #cbd5e1;
    color: #667eea;
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 3px;
    transition: all 0.2s;
    outline: none;
    font-weight: 500;
}

.change-lang-btn:hover {
    background: #e0e7ff;
}

.mic-btn {
    width: 100%;
    max-width: 160px;
    padding: 10px 20px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    margin: 0 auto 8px;
    transition: all 0.3s;
    outline: none;
    height: 40px;
}

.mic-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.mic-btn.listening {
    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
    animation: pulse 1s infinite;
}

.mic-btn .mic-icon-btn {
    width: 16px;
    height: 16px;
}

.voice-visualizer {
    display: flex;
    gap: 3px;
    height: 24px;
    align-items: center;
    justify-content: center;
    margin-top: 6px;
}

.voice-visualizer .bar {
    width: 3px;
    height: 8px;
    background: #667eea;
    border-radius: 2px;
    animation: visualizer 1s ease-in-out infinite;
    opacity: 0.7;
}

.voice-visualizer .bar:nth-child(2) { animation-delay: 0.1s; }
.voice-visualizer .bar:nth-child(3) { animation-delay: 0.2s; }
.voice-visualizer .bar:nth-child(4) { animation-delay: 0.3s; }
.voice-visualizer .bar:nth-child(5) { animation-delay: 0.4s; }

@keyframes visualizer {
    0%, 100% { height: 8px; }
    50% { height: 20px; }
}

/* Speak instruction styles */
.speak-instruction {
    background: #f8fafc;
    border: 1px solid #e0e7ff;
    border-radius: 8px;
    padding: 8px 10px;
    margin-top: 8px;
    font-size: 12px;
    color: #64748b;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    line-height: 1.3;
}

.instruction-text {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px;
}

.instruction-text svg {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
}

/* Responsive Design */
@media (max-width: 480px) {
    .speechbot-container {
        bottom: 20px !important;
        right: 20px !important;
    }
    
    .speechbot-panel {
        width: 300px;
        height: 420px;
        right: -20px;
        bottom: 80px;
    }
    
    .speechbot-toggle-btn {
        width: 60px;
        height: 60px;
    }
    
    .speechbot-toggle-btn .mic-icon {
        width: 24px;
        height: 24px;
    }
    
    .pulse-dot {
        width: 16px;
        height: 16px;
    }
    
    .speechbot-header {
        padding: 10px 12px;
        min-height: 55px;
    }
    
    .speechbot-header h4 {
        font-size: 14px;
    }
    
    .voice-control-header {
        flex-direction: column;
        gap: 6px;
        align-items: stretch;
    }
    
    .change-lang-btn, .clear-btn {
        width: 100%;
        justify-content: center;
    }
    
    .lang-dropdown-options {
        max-height: 140px;
    }
    
    .mic-btn {
        max-width: 140px;
        padding: 8px 16px;
        font-size: 13px;
        height: 36px;
    }
}

@media (max-height: 600px) {
    .speechbot-panel {
        height: 400px;
    }
    
    .lang-dropdown-options {
        bottom: auto;
        top: 100%;
        margin-top: 4px;
        margin-bottom: 0;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
}

@media (max-width: 360px) {
    .speechbot-panel {
        width: 260px;
        height: 400px;
        right: -30px;
    }
    
    .lang-dropdown {
        max-width: 160px;
    }
    
    .mic-btn {
        max-width: 130px;
    }
}

/* Ensure no other styles override our positioning */
body .speechbot-container {
    position: fixed !important;
    bottom: 30px !important;
    right: 30px !important;
    z-index: 10000 !important;
}
</style>
`;

// SpeechBot Integrated Class
class SpeechBotIntegrated {
    constructor(website = null) {
        console.log('SpeechBot constructor called');
        
        // Initialize with default values
        this.currentLang = 'en';
        this.conversationState = 'language_selection';
        this.conversationHistory = [];
        
        // Load saved state from localStorage
        this.loadSavedState();
        
        // Other properties
        this.isListening = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.speechQueue = [];
        this.voices = [];
        this.isPanelOpen = false;
        this.isLanguageDropdownOpen = false;
        this.isIntroTypingActive = false;
        this.currentAudio = null;
        this.typingSpeed = 20;
        this.isVoiceSelectionActive = false;
        this.languagePromptsShown = false;
        this.silenceTimeout = null;
        this.maxSilenceTime = 5000;
        this.speakButtonTexts = {
            'en': 'Click to Speak',
            'hi': 'बोलने के लिए क्लिक करें',
            'te': 'మాట్లాడటానికి క్లిక్ చేయండి'
        };
        this.interruptAudio = false;
        this.audioInterruptCheck = null;
        this.shouldIgnoreSpeech = false;
        
        // SpeechBot backend configuration
        this.apiBaseUrl = 'https://fidgetingly-testable-christoper.ngrok-free.dev';
        this.translateApiPath = '/translate';
        this.backendTTSPath = '/tts';
        
        // Language-specific messages with native scripts
        this.languageMessages = {
            'en': {
                selectLanguage: "Please say English to speak in English",
                languageSelected: "Perfect! I'll speak English. How can I help you today?",
                speakPrompt: "Click on speak button to ask questions.",
                greeting: "Hello! Welcome to SpeechBot. How can I assist you today?",
                welcomeBack: "Welcome back! How can I help you today?"
            },
            'hi': {
                selectLanguage: "हिंदी बोलने के लिए हिंदी बोलें",
                languageSelected: "बहुत बढ़िया! मैं हिंदी में बात करूंगी। आज मैं आपकी कैसे मदद कर सकता हूं?",
                speakPrompt: "प्रश्न पूछने के लिए स्पीक बटन पर क्लिक करें।",
                greeting: "नमस्ते! SpeechBot में आपका स्वागत है। आज मैं आपकी कैसे सहायता कर सकता हूं?",
                welcomeBack: "फिर से स्वागत है! आज मैं आपकी कैसे मदद कर सकता हूं?"
            },
            'te': {
                selectLanguage: "తెలుగులో మాట్లాడటానికి తెలుగు అని చెప్పండి",
                languageSelected: "మంచిది! నేను తెలుగులో మాట్లాడతాను. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
                speakPrompt: "ప్రశ్నలు అడగడానికి స్పీక్ బటన్‌పై క్లిక్ చేయండి.",
                greeting: "హలో! SpeechBot కు స్వాగతం. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
                welcomeBack: "మళ్లీ స్వాగతం! ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?"
            }
        };
        
        // Greeting phrases
        this.greetingPhrases = {
            'en': ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'what\'s up'],
            'hi': ['नमस्ते', 'हैलो', 'कैसे हो', 'क्या हाल है', 'सुप्रभात', 'शुभ संध्या'],
            'te': ['హలో', 'నమస్కారం', 'ఎలా ఉన్నారు', 'మీరు ఎలా ఉన్నారు', 'శుభోదయం', 'శుభ సాయంత్రం']
        };
        
        // Local greeting responses
        this.greetingResponses = {
            'en': [
                "Hello! Nice to meet you. How can I assist you today?",
                "Hi there! I'm here to help. What can I do for you?",
                "Greetings! I'm SpeechBot, ready to assist you.",
                "Good day! How can I be of service to you today?"
            ],
            'hi': [
                "नमस्ते! आपसे मिलकर अच्छा लगा। आज मैं आपकी कैसे सहायता कर सकता हूं?",
                "नमस्कार! मैं यहां मदद के लिए हूं। मैं आपके लिए क्या कर सकता हूं?",
                "अभिवादन! मैं SpeechBot हूं, आपकी सहायता के लिए तैयार हूं।",
                "शुभ दिन! आज मैं आपकी कैसे सेवा कर सकता हूं?"
            ],
            'te': [
                "హలో! మిమ్మల్ని కలవడం సంతోషంగా ఉంది. ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
                "హాయ్! నేను సహాయం చేయడానికి ఇక్కడ ఉన్నాను. నేను మీ కోసం ఏమి చేయగలను?",
                "శుభాకాంక్షలు! నేను SpeechBot, మీకు సహాయం చేయడానికి సిద్ధంగా ఉన్నాను.",
                "శుభ దినం! ఈరోజు నేను మీకు ఎలా సేవ చేయగలను?"
            ]
        };
        
        // Get website name
        this.website = website || this.getWebsiteName();
        
        // Initialize
        this.injectHTMLAndCSS();
        this.init();
    }
    
    loadSavedState() {
        try {
            console.log('Loading saved state from localStorage...');
            
            // Load language
            const savedLang = localStorage.getItem('speechbot_language');
            if (savedLang) {
                this.currentLang = savedLang;
                console.log('Loaded language:', savedLang);
            }
            
            // Load state
            const savedState = localStorage.getItem('speechbot_state');
            if (savedState) {
                this.conversationState = savedState;
                console.log('Loaded state:', savedState);
            }
            
            // Load conversation history
            const savedHistory = localStorage.getItem('speechbot_conversation');
            if (savedHistory) {
                try {
                    this.conversationHistory = JSON.parse(savedHistory);
                    console.log('Loaded conversation history:', this.conversationHistory.length, 'messages');
                } catch (e) {
                    console.error('Error parsing conversation history:', e);
                    this.conversationHistory = [];
                }
            }
            
        } catch (error) {
            console.error('Error loading saved state:', error);
            // Reset to defaults on error
            this.currentLang = 'en';
            this.conversationState = 'language_selection';
            this.conversationHistory = [];
        }
    }
    
    saveState() {
        try {
            console.log('Saving state to localStorage...');
            
            // Save current state
            localStorage.setItem('speechbot_language', this.currentLang);
            localStorage.setItem('speechbot_state', this.conversationState);
            
            // Save conversation history
            const historyToSave = JSON.stringify(this.conversationHistory);
            localStorage.setItem('speechbot_conversation', historyToSave);
            
            console.log('State saved successfully:', {
                language: this.currentLang,
                state: this.conversationState,
                historyLength: this.conversationHistory.length
            });
            
            return true;
        } catch (error) {
            console.error('Error saving state:', error);
            return false;
        }
    }
    
    getWebsiteName() {
        const script = document.querySelector('script[data-website]');
        if (script) {
            return script.getAttribute('data-website');
        }
        
        const hostname = window.location.hostname;
        return hostname || 'default-website';
    }
    
    injectHTMLAndCSS() {
        // Remove existing if any
        const existing = document.querySelector('.speechbot-container');
        if (existing) {
            existing.remove();
        }
        
        // Remove existing style if any
        const existingStyle = document.querySelector('style[data-speechbot]');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // Inject CSS
        const styleElement = document.createElement('style');
        styleElement.setAttribute('data-speechbot', 'true');
        styleElement.textContent = speechbotCSS;
        document.head.appendChild(styleElement);
        
        // Inject HTML
        const container = document.createElement('div');
        container.innerHTML = speechbotHTML;
        document.body.appendChild(container.firstElementChild);
    }
    
    init() {
        this.setupSpeechRecognition();
        this.setupTextToSpeech();
        this.bindEvents();
        this.updateLanguageBadge();
         this.debugBackendConnection();
        
        console.log('🎉 SpeechBot initialized for website:', this.website);
        console.log('Initial state:', {
            language: this.currentLang,
            state: this.conversationState,
            historyLength: this.conversationHistory.length
        });
    }
    
    setupSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.maxAlternatives = 1;
            
            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateStatus("Listening...");
                const micBtn = document.getElementById('micBtn');
                const visualizer = document.getElementById('voiceVisualizer');
                const pulse = document.querySelector('.pulse-dot');
                if (micBtn) micBtn.classList.add('listening');
                if (micBtn) document.getElementById('micBtnText').textContent = this.getListeningText();
                if (visualizer) visualizer.style.display = 'flex';
                if (pulse) pulse.style.display = 'block';
                
                // Start silence detection
                this.startSilenceDetection();
            };
            
            this.recognition.onresult = (event) => {
                // Reset silence timeout when speech is detected
                this.resetSilenceDetection();
                
                // Get both interim and final results
                let transcript = '';
                let hasFinalResult = false;
                
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript;
                        hasFinalResult = true;
                    } else {
                        transcript += event.results[i][0].transcript;
                    }
                }
                
                console.log('User said:', transcript, 'Final:', hasFinalResult);
                
                // Only process if we have a final result
                if (hasFinalResult && transcript.trim().length > 0) {
                    // If we're in language selection and voice selection is active, check for language keywords
                    if (this.isVoiceSelectionActive && (!this.currentLang || this.conversationState === 'language_selection')) {
                        this.handleLanguageVoiceSelection(transcript);
                    } else if (this.currentLang && this.conversationState === 'ready') {
                        this.handleUserInput(transcript);
                    }
                }
            };
            
            this.recognition.onerror = (event) => {
                console.log('Speech recognition error:', event.error);
                if (event.error !== 'no-speech') {
                    this.stopListening();
                    if (this.isPanelOpen && this.currentLang) {
                        const errorMessage = "I didn't catch that. Please try again.";
                        this.addBotMessage(errorMessage, this.currentLang.toUpperCase());
                        this.speakText(errorMessage);
                    }
                }
            };
            
            this.recognition.onend = () => {
                this.isListening = false;
                this.stopSilenceDetection();
                const micBtn = document.getElementById('micBtn');
                const visualizer = document.getElementById('voiceVisualizer');
                const pulse = document.querySelector('.pulse-dot');
                if (micBtn) micBtn.classList.remove('listening');
                if (micBtn) document.getElementById('micBtnText').textContent = this.speakButtonTexts[this.currentLang] || 'Click to Speak';
                if (visualizer) visualizer.style.display = 'none';
                if (pulse) pulse.style.display = 'none';
                this.updateStatus("Ready");
                
                // Restart listening if voice selection is still active
                if (this.isVoiceSelectionActive && this.isPanelOpen && !this.currentLang) {
                    setTimeout(() => {
                        if (this.isVoiceSelectionActive && this.isPanelOpen && !this.currentLang) {
                            this.startListening();
                        }
                    }, 500);
                }
            };
        } else {
            console.warn('Speech recognition not supported');
            this.showUnsupportedMessage();
        }
    }
    
    getListeningText() {
        if (!this.currentLang) return "Listening...";
        const texts = {
            'en': 'Listening...',
            'hi': 'सुन रहा हूं...',
            'te': 'వినడం...'
        };
        return texts[this.currentLang] || 'Listening...';
    }
    
    startSilenceDetection() {
        this.stopSilenceDetection();
        this.silenceTimeout = setTimeout(() => {
            if (this.isListening && !this.isSpeaking) {
                console.log('No speech detected for 5 seconds, stopping listening');
                this.stopListening();
                if (this.currentLang) {
                    this.showSpeakInstruction();
                }
            }
        }, this.maxSilenceTime);
    }
    
    resetSilenceDetection() {
        this.stopSilenceDetection();
        if (this.isListening && !this.isSpeaking) {
            this.startSilenceDetection();
        }
    }
    
    stopSilenceDetection() {
        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
            this.silenceTimeout = null;
        }
    }
    
    showUnsupportedMessage() {
        const toggleBtn = document.getElementById('speechbotToggle');
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
            toggleBtn.title = "Voice not supported in your browser";
            toggleBtn.style.background = '#ccc';
            toggleBtn.onclick = () => {
                alert("Voice assistant is not supported in your browser. Please use Chrome, Edge, or Safari.");
            };
        }
    }
    
    setupTextToSpeech() {
        if (!this.synth) {
            console.warn('Speech synthesis not supported');
            return;
        }
        
        this.loadVoices();
        
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = this.loadVoices.bind(this);
        }
    }
    
    loadVoices() {
        try {
            this.voices = this.synth.getVoices() || [];
            console.log('Voices loaded:', this.voices.length);
        } catch (err) {
            console.error('Error loading voices:', err);
        }
    }
    
    bindEvents() {
        // Ensure elements exist before binding events
        setTimeout(() => {
            const toggleBtn = document.getElementById('speechbotToggle');
            const closeBtn = document.getElementById('speechbotClose');
            const clearBtn1 = document.getElementById('clearBtn');
            const clearBtn2 = document.getElementById('clearBtn2');
            const changeLangBtn = document.getElementById('changeLangBtn');
            const dropdownSelected = document.getElementById('langDropdownSelected');
            const dropdownOptions = document.getElementById('langDropdownOptions');
            const micBtn = document.getElementById('micBtn');
            
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => this.togglePanel());
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.hidePanel());
            }
            
            if (clearBtn1) {
                clearBtn1.addEventListener('click', () => this.clearAndRestart());
            }
            
            if (clearBtn2) {
                clearBtn2.addEventListener('click', () => this.clearAndRestart());
            }
            
            if (changeLangBtn) {
                changeLangBtn.addEventListener('click', () => this.showLanguageSelectionUI());
            }
            
            if (dropdownSelected && dropdownOptions) {
                dropdownSelected.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleLanguageDropdown();
                });
                
                dropdownOptions.querySelectorAll('.lang-option').forEach(option => {
                    option.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const lang = e.currentTarget.dataset.lang;
                        this.selectLanguage(lang);
                        this.closeLanguageDropdown();
                    });
                });
            }
            
            if (micBtn) {
                micBtn.addEventListener('click', () => {
                    if (this.isListening) {
                        this.stopListening();
                    } else if (!this.isSpeaking && this.currentLang) {
                        this.startListening();
                    } else if (!this.currentLang) {
                        this.addBotMessage("Please select a language first.", "EN");
                    }
                });
            }
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                const dropdown = document.getElementById('langDropdown');
                if (dropdown && !dropdown.contains(e.target)) {
                    this.closeLanguageDropdown();
                }
            });
            
            // Close dropdown on scroll
            document.addEventListener('scroll', () => this.closeLanguageDropdown(), true);
            
        }, 100); // Small delay to ensure DOM is ready
    }
    
    toggleLanguageDropdown() {
        const dropdown = document.getElementById('langDropdown');
        const options = document.getElementById('langDropdownOptions');
        
        if (!dropdown || !options) return;
        
        // Close all other dropdowns first
        this.closeAllDropdowns();
        
        if (this.isLanguageDropdownOpen) {
            dropdown.classList.remove('open');
        } else {
            dropdown.classList.add('open');
            
            // Check if there's enough space below, if not, show above
            const dropdownRect = dropdown.getBoundingClientRect();
            const optionsHeight = options.scrollHeight;
            const spaceBelow = window.innerHeight - dropdownRect.bottom;
            
            if (spaceBelow < optionsHeight + 10) {
                options.style.bottom = 'auto';
                options.style.top = '100%';
                options.style.marginBottom = '0';
                options.style.marginTop = '4px';
                options.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                options.style.bottom = '100%';
                options.style.top = 'auto';
                options.style.marginBottom = '4px';
                options.style.marginTop = '0';
                options.style.boxShadow = '0 -4px 20px rgba(0, 0, 0, 0.1)';
            }
        }
        this.isLanguageDropdownOpen = !this.isLanguageDropdownOpen;
    }
    
    closeAllDropdowns() {
        const dropdown = document.getElementById('langDropdown');
        if (dropdown) {
            dropdown.classList.remove('open');
        }
        this.isLanguageDropdownOpen = false;
    }
    
    closeLanguageDropdown() {
        this.closeAllDropdowns();
    }
    async showWelcomeMessage() {
    const welcomeMessage = this.conversationHistory.length === 0 
        ? this.languageMessages[this.currentLang]?.greeting 
        : this.languageMessages[this.currentLang]?.welcomeBack;
    
    if (welcomeMessage) {
        // Create greeting message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <strong>🤖 SpeechBot (${this.currentLang.toUpperCase()}): </strong><span class="typing-text"></span>
        `;
        
        const conversation = document.getElementById('speechbotConversation');
        if (conversation) {
            conversation.appendChild(messageDiv);
            conversation.scrollTop = conversation.scrollHeight;
        }
        
        const typingSpan = messageDiv.querySelector('.typing-text');
        
        // Start BOTH speaking and typing simultaneously
        const speakPromise = this.speakWithFallback(welcomeMessage, this.currentLang);
        const typePromise = this.typeTextWithAnimation(typingSpan, welcomeMessage, this.currentLang);
        
        // Wait for BOTH to complete
        await Promise.all([speakPromise, typePromise]);
        
        // Save the welcome message to conversation history
        this.conversationHistory.push({
            type: 'bot',
            text: welcomeMessage,
            lang: this.currentLang.toUpperCase(),
            timestamp: Date.now()
        });
        
        // Save to localStorage
        this.saveState();
        
        console.log('Welcome message added to history');
    }
}
   togglePanel() {
    const panel = document.getElementById('speechbotPanel');
    if (!panel) return;
    
    if (this.isPanelOpen) {
        this.hidePanel();
    } else {
        this.showPanel();
        
        // Load conversation from history - CRITICAL FIX
        this.loadConversation();
        
        // If no conversation exists yet, show appropriate UI
        if (this.conversationHistory.length === 0) {
            if (this.conversationState === 'language_selection') {
                this.showLanguageSelectionUI();
            } else {
                this.showVoiceControl();
                // Show welcome message for fresh start
                this.showWelcomeMessage();
            }
        } else {
            // We have conversation history, show voice control
            this.showVoiceControl();
            this.conversationState = 'ready';
            this.updateStatus("Ready");
            
            // Scroll to bottom to show latest messages
            const conversation = document.getElementById('speechbotConversation');
            if (conversation) {
                conversation.scrollTop = conversation.scrollHeight;
            }
        }
    }
}
    
    showPanel() {
        const panel = document.getElementById('speechbotPanel');
        if (panel) {
            panel.style.display = 'flex';
            this.isPanelOpen = true;
            this.updateStatus("Ready");
        }
    }
    
    hidePanel() {
        const panel = document.getElementById('speechbotPanel');
        if (panel) {
            panel.style.display = 'none';
        }
        this.isPanelOpen = false;
        
        this.stopAllSpeech();
        this.stopListening();
        this.closeLanguageDropdown();
        this.isVoiceSelectionActive = false;
        this.languagePromptsShown = false;
        this.shouldIgnoreSpeech = false;
        
        const pulse = document.querySelector('.pulse-dot');
        if (pulse) pulse.style.display = 'none';
        this.updateStatus("Ready");
    }
    
    stopAllSpeech() {
        this.interruptAudio = true;
        this.shouldIgnoreSpeech = false;
        
        // Clear audio interrupt check
        if (this.audioInterruptCheck) {
            clearInterval(this.audioInterruptCheck);
            this.audioInterruptCheck = null;
        }
        
        // Stop browser TTS
        if (this.synth && this.synth.speaking) {
            this.synth.cancel();
        }
        this.isSpeaking = false;
        this.speechQueue = [];
        
        // Stop backend audio safely
        if (this.currentAudio) {
            try {
                // Remove event listeners first
                this.currentAudio.onended = null;
                this.currentAudio.onerror = null;
                this.currentAudio.onpause = null;
                
                // Pause and reset
                this.currentAudio.pause();
                this.currentAudio.currentTime = 0;
            } catch (e) {
                console.log('Error stopping audio:', e);
            }
            this.currentAudio = null;
        }
        
        this.interruptAudio = false;
    }
    
    clearAndRestart() {
        console.log('Clearing and restarting conversation...');
        
        // Stop any ongoing activities
        this.stopListening();
        this.stopAllSpeech();
        
        // Clear conversation UI
        const conversation = document.getElementById('speechbotConversation');
        if (conversation) {
            conversation.innerHTML = '';
        }
        
        // Clear localStorage
        localStorage.removeItem('speechbot_language');
        localStorage.removeItem('speechbot_state');
        localStorage.removeItem('speechbot_conversation');
        
        // Reset state variables
        this.currentLang = 'en';
        this.conversationState = 'language_selection';
        this.conversationHistory = [];
        this.updateLanguageBadge();
        this.isVoiceSelectionActive = false;
        this.languagePromptsShown = false;
        
        // Update dropdown text
        const selectedText = document.querySelector('.selected-text');
        if (selectedText) {
            selectedText.textContent = 'Select Language';
        }
        
        // Show language selection UI
        this.showLanguageSelectionUI();
        
        console.log('Conversation cleared and restarted');
    }
    
    async showLanguageSelectionUI() {
        console.log('Showing language selection UI');
        
        // Clear conversation UI
        const conversation = document.getElementById('speechbotConversation');
        if (conversation) {
            conversation.innerHTML = '';
        }
        
        this.updateStatus("Language Selection");
        this.conversationState = 'language_selection';
        this.currentLang = 'en';
        this.updateLanguageBadge();
        this.showLanguageSelection();
        
        // Hide the speak instruction
        this.hideSpeakInstruction();
        
        // Stop any ongoing typing
        this.isIntroTypingActive = false;
        
        // Clear any existing typing indicators
        this.removeTypingIndicator();
        
        // Show language selection message in all three languages
        if (!this.languagePromptsShown) {
            await this.showAllLanguagePrompts();
        }
    }
    
    async showAllLanguagePrompts() {
        const conversation = document.getElementById('speechbotConversation');
        if (!conversation) return;
        
        // Clear any existing messages
        conversation.innerHTML = '';
        
        // Mark that prompts have been shown
        this.languagePromptsShown = true;
        
        // Create messages for all three languages FIRST
        const languages = ['en', 'hi', 'te'];
        
        for (const lang of languages) {
            // Create message container
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message bot-message';
            messageDiv.innerHTML = `
                <strong>🤖 SpeechBot (${lang.toUpperCase()}): </strong><span class="typing-text"></span>
            `;
            
            conversation.appendChild(messageDiv);
            conversation.scrollTop = conversation.scrollHeight;
            
            const typingSpan = messageDiv.querySelector('.typing-text');
            const messageText = this.languageMessages[lang]?.selectLanguage;
            
            if (messageText) {
                // Show text instantly (no typing animation)
                typingSpan.textContent = messageText;
            }
        }
        
        // Enable voice selection and start listening IMMEDIATELY
        this.isVoiceSelectionActive = true;
        
        // Now speak all messages one by one with proper sequencing
        for (const lang of languages) {
            // Check if we should continue speaking
            if (!this.isVoiceSelectionActive || this.currentLang !== 'en') {
                break;
            }
            
            const messageText = this.languageMessages[lang]?.selectLanguage;
            if (messageText) {
                try {
                    // Set flag to ignore speech recognition while speaking
                    this.shouldIgnoreSpeech = true;
                    
                    // Speak the current language prompt
                    await this.speakLanguagePromptSequentially(messageText, lang);
                    
                    // Add a small pause between languages for better clarity
                    if (lang !== 'te') { // Don't pause after the last one
                        await this.sleep(500);
                    }
                    
                    this.shouldIgnoreSpeech = false;
                } catch (error) {
                    console.log(`Speech interrupted for ${lang}:`, error);
                    this.shouldIgnoreSpeech = false;
                    // Continue with next language even if current one fails
                    continue;
                }
            }
        }
        
        // Start listening AFTER all prompts are spoken
        if (this.isVoiceSelectionActive && this.currentLang === 'en') {
            this.startListening();
        }
    }
    
    async speakLanguagePromptSequentially(text, lang) {
        return new Promise((resolve) => {
            // Stop any ongoing speech first
            this.stopAllSpeech();
            
            // Wait a bit for cleanup
            setTimeout(() => {
                this.speakWithFallback(text, lang).then(resolve).catch(resolve);
            }, 100);
        });
    }
    
    showLanguageSelection() {
        const langSelection = document.getElementById('langSelection');
        const voiceControl = document.getElementById('voiceControl');
        
        if (langSelection) langSelection.style.display = 'block';
        if (voiceControl) voiceControl.style.display = 'none';
    }
    
    showVoiceControl() {
        const langSelection = document.getElementById('langSelection');
        const voiceControl = document.getElementById('voiceControl');
        
        if (langSelection) langSelection.style.display = 'none';
        if (voiceControl) voiceControl.style.display = 'block';
        
        this.isVoiceSelectionActive = false;
        
        // Update mic button text to selected language
        const micBtnText = document.getElementById('micBtnText');
        if (micBtnText && this.currentLang) {
            micBtnText.textContent = this.speakButtonTexts[this.currentLang] || 'Click to Speak';
        }
        
        // Show the instruction
        this.showSpeakInstruction();
    }
    
    async selectLanguage(lang) {
        console.log('Selecting language:', lang);
        
        // Stop voice selection mode
        this.isVoiceSelectionActive = false;
        
        // Stop listening and speech
        this.stopListening();
        this.stopAllSpeech();
        
        // Wait a bit for cleanup
        await this.sleep(100);
        
        // Update selected text in dropdown
        const selectedText = document.querySelector('.selected-text');
        const langNames = {
            'en': 'English',
            'hi': 'हिंदी',
            'te': 'తెలుగు'
        };
        if (selectedText) {
            selectedText.textContent = langNames[lang] || 'Select Language';
        }
        
        this.currentLang = lang;
        this.showVoiceControl();
        
        // Save language to localStorage
        localStorage.setItem('speechbot_language', lang);
        this.updateLanguageBadge();
        
        // Update speech recognition language
        if (this.recognition) {
            const langCodes = {
                'en': 'en-US',
                'hi': 'hi-IN',
                'te': 'te-IN'
            };
            this.recognition.lang = langCodes[lang] || 'en-US';
        }
        
        // Get language-specific greeting
        const greeting = this.languageMessages[lang]?.languageSelected || 
                       this.languageMessages['en'].languageSelected;
        
        // Clear conversation UI
        const conversation = document.getElementById('speechbotConversation');
        if (conversation) {
            conversation.innerHTML = '';
        }
        
        // Clear conversation history when changing language
        this.conversationHistory = [];
        this.saveState();
        
        // Create greeting message element
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <strong>🤖 SpeechBot (${lang.toUpperCase()}): </strong><span class="typing-text"></span>
        `;
        
        if (conversation) {
            conversation.appendChild(messageDiv);
            conversation.scrollTop = conversation.scrollHeight;
        }
        
        const typingSpan = messageDiv.querySelector('.typing-text');
        
        // Start BOTH speaking and typing simultaneously
        const speakPromise = this.speakWithFallback(greeting, lang);
        const typePromise = this.typeTextWithAnimation(typingSpan, greeting, lang);
        
        // Wait for BOTH to complete
        await Promise.all([speakPromise, typePromise]);
        
        // Save the greeting to conversation history
        this.conversationHistory.push({
            type: 'bot',
            text: greeting,
            lang: lang.toUpperCase(),
            timestamp: Date.now()
        });
        
        this.conversationState = 'ready';
        localStorage.setItem('speechbot_state', 'ready');
        this.saveState();
    }
    
    async typeTextWithAnimation(element, text, lang) {
        return new Promise(resolve => {
            if (!element) {
                resolve();
                return;
            }
            
            element.textContent = '';
            let i = 0;
            
            // Calculate typing speed based on text length
            const baseSpeed = this.typingSpeed;
            const totalChars = text.length;
            
            const typeChar = () => {
                if (i < text.length) {
                    const char = text.charAt(i);
                    
                    if (lang !== 'en' && /[\u0900-\u097F\u0C00-\u0C7F]/.test(char)) {
                        element.textContent += char;
                        i++;
                        setTimeout(typeChar, baseSpeed * 1.2);
                    } else {
                        element.textContent += char;
                        i++;
                        
                        // Speed up typing slightly to ensure it finishes with speech
                        const progress = i / totalChars;
                        const adjustedSpeed = baseSpeed * (0.8 + progress * 0.4);
                        
                        setTimeout(typeChar, adjustedSpeed);
                    }
                } else {
                    resolve();
                }
            };
            
            typeChar();
        });
    }
    
    updateLanguageBadge() {
        const badge = document.getElementById('currentLangBadge');
        if (badge) {
            badge.textContent = this.currentLang ? this.currentLang.toUpperCase() : 'EN';
        }
    }
    
    startListening() {
        if (this.recognition && !this.isListening && !this.isSpeaking && this.isPanelOpen && !this.shouldIgnoreSpeech) {
            const langCodes = {
                'en': 'en-US',
                'hi': 'hi-IN',
                'te': 'te-IN'
            };
            const langKey = this.currentLang || 'en';
            this.recognition.lang = langCodes[langKey] || 'en-US';
            
            try {
                this.recognition.start();
                this.isListening = true;
                const micBtn = document.getElementById('micBtn');
                const visualizer = document.getElementById('voiceVisualizer');
                const pulse = document.querySelector('.pulse-dot');
                if (micBtn) micBtn.classList.add('listening');
                if (micBtn) document.getElementById('micBtnText').textContent = this.getListeningText();
                if (visualizer) visualizer.style.display = 'flex';
                if (pulse) pulse.style.display = 'block';
                if (!this.currentLang || this.conversationState === 'language_selection') {
                    this.updateStatus("Listening for language...");
                } else {
                    const statusTexts = {
                        'en': `Listening in English...`,
                        'hi': `हिंदी में सुन रहा हूं...`,
                        'te': `తెలుగులో వినడం...`
                    };
                    this.updateStatus(statusTexts[this.currentLang] || `Listening in ${this.currentLang.toUpperCase()}...`);
                }
            } catch (e) {
                console.log('Cannot start listening:', e);
                this.updateStatus("Ready");
            }
        }
    }
    
    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (e) {
                // Ignore stop errors
            }
            this.isListening = false;
            this.stopSilenceDetection();
            const micBtn = document.getElementById('micBtn');
            const visualizer = document.getElementById('voiceVisualizer');
            const pulse = document.querySelector('.pulse-dot');
            if (micBtn) micBtn.classList.remove('listening');
            if (micBtn) document.getElementById('micBtnText').textContent = this.speakButtonTexts[this.currentLang] || 'Click to Speak';
            if (visualizer) visualizer.style.display = 'none';
            if (pulse) pulse.style.display = 'none';
            this.updateStatus("Ready");
        }
    }
    
    async handleUserInput(text) {
        console.log("User said:", text);
        
        // Check if we should ignore this input (speechbot is speaking)
        if (this.shouldIgnoreSpeech) {
            console.log("Ignoring speech while SpeechBot is speaking");
            return;
        }
        
        // Only add user message when language is chosen (for questions)
        if (this.currentLang && this.conversationState === 'ready') {
            this.addUserMessage(text);
            this.stopListening(); // Stop listening after user speaks
        }
        
        // Handle language selection via voice
        if (!this.currentLang || this.conversationState === 'language_selection') {
            await this.handleLanguageVoiceSelection(text);
            return;
        }
        
        // Handle language change command (optional)
        if (this.isLanguageChangeCommand(text)) {
            await this.handleLanguageChangeCommand(text);
            return;
        }
        
        // Check if it's a greeting that should be handled locally
        if (this.isGreeting(text)) {
            await this.handleGreetingLocally(text);
            return;
        }
        
        // Process as normal question
        this.showTypingIndicator();
        await this.processUserInputWithBackend(text);
    }
    
    isGreeting(text) {
        if (!this.currentLang) return false;
        
        const lowerText = text.toLowerCase();
        const greetings = this.greetingPhrases[this.currentLang] || this.greetingPhrases['en'];
        
        return greetings.some(greeting => lowerText.includes(greeting.toLowerCase()));
    }
    
    async handleGreetingLocally(text) {
        this.removeTypingIndicator();
        
        // Get a random greeting response
        const responses = this.greetingResponses[this.currentLang] || this.greetingResponses['en'];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Create message element FIRST
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot-message';
        messageDiv.innerHTML = `
            <strong>🤖 SpeechBot (${this.currentLang.toUpperCase()}): </strong><span class="typing-text"></span>
        `;
        
        const conversation = document.getElementById('speechbotConversation');
        if (conversation) {
            conversation.appendChild(messageDiv);
            conversation.scrollTop = conversation.scrollHeight;
        }
        
        const typingSpan = messageDiv.querySelector('.typing-text');
        
        // Start BOTH speaking and typing simultaneously
        const speakPromise = this.speakWithFallback(randomResponse, this.currentLang);
        const typePromise = this.typeTextWithAnimation(typingSpan, randomResponse, this.currentLang);
        
        // Wait for BOTH to complete (or at least typing to complete)
        await Promise.all([speakPromise, typePromise]);
        
        // Save to conversation history
        this.saveState();
    }
    
    isLanguageChangeCommand(text) {
        const lowerText = text.toLowerCase();
        return lowerText.includes('change language') || 
               lowerText.includes('switch language') || 
               lowerText.includes('language change');
    }
    
    async handleLanguageChangeCommand(text) {
        this.addBotMessage("Let me show you the language selection options.", (this.currentLang || 'en').toUpperCase());
        await this.speakText("Let me show you the language selection options.");
        this.showLanguageSelectionUI();
        this.conversationState = 'language_selection';
    }
    
    async handleLanguageVoiceSelection(text) {
        const lowerText = text.toLowerCase();
        
        let selectedLang = null;
        
        if (lowerText.includes('english') || lowerText.includes('inglish') || lowerText.includes('en')) {
            selectedLang = 'en';
        } else if (lowerText.includes('hindi') || lowerText.includes('हिंदी') || lowerText.includes('hi')) {
            selectedLang = 'hi';
        } else if (lowerText.includes('telugu') || lowerText.includes('తెలుగు') || lowerText.includes('te')) {
            selectedLang = 'te';
        }
        
        if (selectedLang) {
            console.log('Language selected via voice:', selectedLang);
            await this.selectLanguage(selectedLang);
        } else if (this.isVoiceSelectionActive) {
            // If voice selection is active and no language detected, continue listening
            this.startListening();
        }
    }
    
    async processUserInputWithBackend(userInput) {
    try {
        let processedQuestion = userInput;
        
        // If not English, translate to English for backend
        if (this.currentLang !== 'en') {
            processedQuestion = await this.translateText(userInput, this.currentLang, 'en');
            console.log('Translated to English:', processedQuestion);
        }
        
        console.log('Sending to backend:', {
            website: this.website,
            question: processedQuestion,
            language: this.currentLang
        });

        const response = await fetch(`${this.apiBaseUrl}/speechbot/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                website: this.website, 
                question: processedQuestion,
                language: this.currentLang
            })
        });

        if (!response.ok) {
            console.error('Backend error:', response.status, response.statusText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Backend response:', data);

        if (!data.answer || data.answer.trim() === '') {
            console.log('Backend returned empty answer');
            await this.handleErrorResponse('no_match');
            return;
        }

        this.removeTypingIndicator();
        await this.handleBackendResponse(data.answer);
        
    } catch (error) {
        console.error('Error processing with backend:', error);
        this.removeTypingIndicator();
        await this.handleErrorResponse('general_error');
    }
}
    async handleBackendResponse(englishAnswer) {
    let displayAnswer = englishAnswer;
    let speakAnswer = englishAnswer;

    // If not English, translate answer to selected language
    if (this.currentLang !== 'en') {
        try {
            speakAnswer = await this.translateText(englishAnswer, 'en', this.currentLang);
            displayAnswer = speakAnswer;
            console.log('Translated answer:', englishAnswer, '->', speakAnswer);
        } catch (error) {
            console.error('Failed to translate answer:', error);
            speakAnswer = this.getFallbackMessage('translation_failed');
        }
    }

    // Create message element FIRST - THIS IS THE KEY FIX
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <strong>🤖 SpeechBot (${this.currentLang.toUpperCase()}): </strong><span class="typing-text"></span>
    `;
    
    const conversation = document.getElementById('speechbotConversation');
    if (conversation) {
        conversation.appendChild(messageDiv);
        conversation.scrollTop = conversation.scrollHeight;
    }
    
    const typingSpan = messageDiv.querySelector('.typing-text');
    
    // Start BOTH speaking and typing simultaneously
    const speakPromise = this.speakWithFallback(speakAnswer, this.currentLang);
    const typePromise = this.typeTextWithAnimation(typingSpan, displayAnswer, this.currentLang);
    
    // Wait for BOTH to complete (or at least typing to complete)
    await Promise.all([speakPromise, typePromise]);
    
    // CRITICAL: Save the bot message to conversation history
    this.conversationHistory.push({
        type: 'bot',
        text: displayAnswer,
        lang: this.currentLang.toUpperCase(),
        timestamp: Date.now()
    });
    
    // Save to localStorage
    this.saveState();
    
    console.log('Bot response saved to history:', {
        text: displayAnswer.substring(0, 50) + '...',
        lang: this.currentLang.toUpperCase()
    });
}
    
    async speakWithFallback(text, lang) {
        return new Promise((resolve) => {
            if (!this.isPanelOpen || !text || text.trim() === '') {
                this.isSpeaking = false;
                return resolve();
            }
            
            this.isSpeaking = true;
            this.updateStatus("Speaking...");
            
            // First try backend TTS
            this.speakWithBackendSimple(text, lang)
                .then(() => {
                    this.isSpeaking = false;
                    if (this.isPanelOpen) {
                        this.updateStatus("Ready");
                    }
                    resolve();
                })
                .catch(() => {
                    // If backend fails, use browser TTS
                    this.speakWithBrowserSimple(text, lang).then(() => {
                        this.isSpeaking = false;
                        if (this.isPanelOpen) {
                            this.updateStatus("Ready");
                        }
                        resolve();
                    });
                });
        });
    }
    
    async speakWithBackendSimple(text, lang) {
        return new Promise((resolve, reject) => {
            // Check if we should continue
            if (this.interruptAudio) {
                return reject(new Error("Speech interrupted"));
            }
            
            fetch(`${this.apiBaseUrl}${this.backendTTSPath}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text, lang: lang })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`TTS HTTP error ${response.status}`);
                }
                return response.blob();
            })
            .then(blob => {
                const audioUrl = URL.createObjectURL(blob);
                
                // Clear previous audio
                if (this.currentAudio) {
                    try {
                        this.currentAudio.pause();
                        this.currentAudio.currentTime = 0;
                    } catch (e) {}
                }
                
                this.currentAudio = new Audio(audioUrl);
                
                this.currentAudio.onended = () => {
                    this.isSpeaking = false;
                    this.currentAudio = null;
                    if (this.isPanelOpen) {
                        this.updateStatus("Ready");
                    }
                    resolve();
                };
                
                this.currentAudio.onerror = () => {
                    this.isSpeaking = false;
                    this.currentAudio = null;
                    if (this.isPanelOpen) {
                        this.updateStatus("Ready");
                    }
                    reject(new Error("Audio playback error"));
                };
                
                // Play the audio
                this.currentAudio.play().catch(error => {
                    console.log('Audio play failed:', error);
                    this.isSpeaking = false;
                    this.currentAudio = null;
                    reject(error);
                });
            })
            .catch(error => {
                this.isSpeaking = false;
                if (this.isPanelOpen) {
                    this.updateStatus("Ready");
                }
                reject(error);
            });
        });
    }
    
    async speakWithBrowserSimple(text, lang) {
        return new Promise((resolve) => {
            if (!this.synth) {
                this.isSpeaking = false;
                return resolve();
            }
            
            // Cancel any ongoing speech
            if (this.synth.speaking) {
                this.synth.cancel();
            }
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set language based on selected lang
            if (lang === 'hi') {
                utterance.lang = 'hi-IN';
                const hindiVoice = this.voices.find(voice => 
                    voice.lang.includes('hi') || voice.name.includes('Hindi')
                );
                if (hindiVoice) utterance.voice = hindiVoice;
            } else if (lang === 'te') {
                utterance.lang = 'te-IN';
                const teluguVoice = this.voices.find(voice => 
                    voice.lang.includes('te') || voice.name.includes('Telugu')
                );
                if (teluguVoice) utterance.voice = teluguVoice;
            } else {
                utterance.lang = 'en-US';
            }
            
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            utterance.onend = () => {
                this.isSpeaking = false;
                if (this.isPanelOpen) {
                    this.updateStatus("Ready");
                }
                resolve();
            };
            
            utterance.onerror = () => {
                this.isSpeaking = false;
                if (this.isPanelOpen) {
                    this.updateStatus("Ready");
                }
                resolve();
            };
            
            this.synth.speak(utterance);
        });
    }
    
    async speakText(text) {
        if (this.isPanelOpen && !this.isSpeaking) {
            await this.speakWithFallback(text, this.currentLang || 'en');
        }
    }

    // Add this debug method to check if backend is responding
async debugBackendConnection() {
    try {
        console.log('Testing backend connection...');
        const testResponse = await fetch(`${this.apiBaseUrl}/speechbot/query`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                website: this.website, 
                question: "test question",
                language: 'en'
            })
        });
        
        console.log('Backend test response status:', testResponse.status);
        const testData = await testResponse.json();
        console.log('Backend test response data:', testData);
        
        return true;
    } catch (error) {
        console.error('Backend connection test failed:', error);
        return false;
    }
}
    
    async handleErrorResponse(errorType) {
    console.log('Handling error response:', errorType);
    
    let errorMessage = this.getErrorMessage(errorType);
    
    if (this.currentLang && this.currentLang !== 'en') {
        try {
            errorMessage = await this.translateText(errorMessage, 'en', this.currentLang);
        } catch (error) {
            console.error('Failed to translate error message:', error);
            errorMessage = this.getLocalizedErrorMessage(errorType);
        }
    }

    // Create error message element FIRST
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <strong>🤖 SpeechBot (${this.currentLang ? this.currentLang.toUpperCase() : 'EN'}): </strong><span class="typing-text"></span>
    `;
    
    const conversation = document.getElementById('speechbotConversation');
    if (conversation) {
        conversation.appendChild(messageDiv);
        conversation.scrollTop = conversation.scrollHeight;
    }
    
    const typingSpan = messageDiv.querySelector('.typing-text');
    
    // Start BOTH speaking and typing simultaneously
    const speakPromise = this.speakWithFallback(errorMessage, this.currentLang || 'en');
    const typePromise = this.typeTextWithAnimation(typingSpan, errorMessage, this.currentLang || 'en');
    
    // Wait for BOTH to complete
    await Promise.all([speakPromise, typePromise]);
    
    // Save error message to conversation history
    this.conversationHistory.push({
        type: 'bot',
        text: errorMessage,
        lang: this.currentLang ? this.currentLang.toUpperCase() : 'EN',
        timestamp: Date.now()
    });
    
    // Save to localStorage
    this.saveState();
    
    console.log('Error response saved to history');
}
    
    getLocalizedErrorMessage(errorType) {
        const messages = {
            'en': {
                'not_found': 'Sorry, assistance is not available for this organization.',
                'subscription_expired': 'Sorry, the service for this organization has expired.',
                'general_error': 'Sorry, I am having trouble providing an answer at the moment.',
                'no_answers': 'I do not have answers configured yet. Please contact the website administrator.',
                'no_match': 'I am sorry, I do not have an answer for that question. Please ask something else.'
            },
            'hi': {
                'not_found': 'क्षमा करें, इस संगठन के लिए सहायता उपलब्ध नहीं है।',
                'subscription_expired': 'क्षमा करें, इस संगठन के लिए सेवा समाप्त हो गई है।',
                'general_error': 'क्षमा करें, इस समय मैं उत्तर देने में कठिनाई हो रही है।',
                'no_answers': 'मेरे पास अभी तक उत्तर कॉन्फ़िगर नहीं किए गए हैं। कृपया वेबसाइट व्यवस्थापक से संपर्क करें।',
                'no_match': 'मुझे खेद है, उस प्रश्न का उत्तर मेरे पास नहीं है। कृपया कुछ और पूछें।'
            },
            'te': {
                'not_found': 'క్షమించండి, ఈ సంస్థ కోసం సహాయం అందుబాటులో లేదు.',
                'subscription_expired': 'క్షమించండి, ఈ సంస్థ కోసం సేవ గడువు ముగిసింది.',
                'general_error': 'క్షమించండి, ప్రస్తుతం సమాధానం అందించడంలో నేను ఇబ్బంది పడుతున్నాను.',
                'no_answers': 'నాకు ఇంకా సమాధానాలు కాన్ఫిగర్ చేయబడలేదు. దయచేసి వెబ్‌సైట్ నిర్వాహకుడిని సంప్రదించండి.',
                'no_match': 'క్షమించండి, ఆ ప్రశ్నకు నాకు సమాధానం లేదు. దయచేసి మరొక ప్రశ్న అడగండి.'
            }
        };
        
        const langMessages = messages[this.currentLang] || messages['en'];
        return langMessages[errorType] || langMessages['general_error'];
    }
    
    getErrorMessage(errorType) {
        const messages = {
            'not_found': 'Sorry, assistance is not available for this organization.',
            'subscription_expired': 'Sorry, the service for this organization has expired.',
            'general_error': 'Sorry, I am having trouble providing an answer at the moment.',
            'no_answers': 'I do not have answers configured yet. Please contact the website administrator.',
            'no_match': 'I am sorry, I do not have an answer for that question. Please ask something else.'
        };
        return messages[errorType] || messages['general_error'];
    }
    
    getFallbackMessage(type) {
        const messages = {
            'translation_failed': 'I have the information but cannot translate it at the moment. Please check the text response.'
        };
        return messages[type] || 'Sorry, there was an issue processing your request.';
    }
    
    async translateText(text, sourceLang, targetLang) {
        try {
            const response = await fetch(`${this.apiBaseUrl}${this.translateApiPath}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    source_lang: sourceLang,
                    target_lang: targetLang
                })
            });

            if (!response.ok) {
                throw new Error(`Translation failed: ${response.status}`);
            }

            const data = await response.json();
            return data.translated_text || text;
        } catch (error) {
            console.error('Translation error:', error);
            return text;
        }
    }
    
   addBotMessage(text, lang, skipSave = false) {
    const conversation = document.getElementById('speechbotConversation');
    if (!conversation) {
        console.error('Cannot add bot message: conversation element not found');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <strong>🤖 SpeechBot (${lang}): </strong>${text}
    `;
    conversation.appendChild(messageDiv);
    conversation.scrollTop = conversation.scrollHeight;
    
    // Only save to history if not skipping (for initial loading)
    if (!skipSave) {
        const newMessage = { 
            type: 'bot', 
            text: text, 
            lang: lang, 
            timestamp: Date.now() 
        };
        
        this.conversationHistory.push(newMessage);
        console.log('Added bot message to history:', newMessage);
        
        // Save to localStorage
        this.saveState();
    }
}

addUserMessage(text, skipSave = false) {
    const conversation = document.getElementById('speechbotConversation');
    if (!conversation) {
        console.error('Cannot add user message: conversation element not found');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <strong>👤 You:</strong><br>${text}
    `;
    conversation.appendChild(messageDiv);
    conversation.scrollTop = conversation.scrollHeight;
    
    // Only save to history if not skipping (for initial loading)
    if (!skipSave) {
        const newMessage = { 
            type: 'user', 
            text: text, 
            timestamp: Date.now() 
        };
        
        this.conversationHistory.push(newMessage);
        console.log('Added user message to history:', newMessage);
        
        // Save to localStorage
        this.saveState();
    }
}
    
    loadConversation() {
    const conversation = document.getElementById('speechbotConversation');
    if (!conversation) {
        console.error('Conversation element not found!');
        return;
    }
    
    console.log('Loading conversation from history:', this.conversationHistory.length, 'messages');
    
    // Clear current conversation display
    conversation.innerHTML = '';
    
    // If no history, show empty
    if (this.conversationHistory.length === 0) {
        console.log('No conversation history to load');
        return;
    }
    
    // Load each message from history
    this.conversationHistory.forEach(msg => {
        const messageDiv = document.createElement('div');
        
        if (msg.type === 'bot') {
            messageDiv.className = 'message bot-message';
            messageDiv.innerHTML = `
                <strong>🤖 SpeechBot (${msg.lang || this.currentLang.toUpperCase() || 'EN'}): </strong>${msg.text}
            `;
        } else if (msg.type === 'user') {
            messageDiv.className = 'message user-message';
            messageDiv.innerHTML = `
                <strong>👤 You:</strong><br>${msg.text}
            `;
        }
        
        conversation.appendChild(messageDiv);
    });
    
    // Scroll to bottom to show latest messages
    conversation.scrollTop = conversation.scrollHeight;
    
    console.log('Conversation loaded successfully');
}
    
    showTypingIndicator() {
        const conversation = document.getElementById('speechbotConversation');
        if (!conversation) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        conversation.appendChild(typingDiv);
        conversation.scrollTop = conversation.scrollHeight;
    }
    
    removeTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
    
    updateStatus(text) {
        const statusElement = document.getElementById('speechbotStatus');
        if (statusElement) {
            statusElement.textContent = text;
        }
    }
    
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // New method: Show speak instruction
    showSpeakInstruction() {
        const voiceControl = document.getElementById('voiceControl');
        if (!voiceControl) return;
        
        const instructionElement = document.querySelector('.speak-instruction');
        
        if (!instructionElement) {
            // Create instruction element if it doesn't exist
            const instruction = document.createElement('div');
            instruction.className = 'speak-instruction';
            instruction.id = 'speakInstruction';
            instruction.innerHTML = `
                <div class="instruction-text">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#667eea">
                        <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14S10 13.1 10 12V4C10 2.9 10.9 2 12 2ZM18.9 11C18.4 11 18 11.4 18 11.9C18 16.3 14.4 19.8 10 19.8S2 16.3 2 11.9C2 11.4 1.6 11 1.1 11C0.6 11 0.2 11.4 0.2 11.9C0.2 17.1 4.3 21.4 9.5 21.9V23C9.5 23.6 9.9 24 10.5 24S11.5 23.6 11.5 23V21.9C16.7 21.4 20.8 17.1 20.8 11.9C20.8 11.4 20.4 11 19.9 11Z"/>
                    </svg>
                    <span id="instructionText">Click on speak button to ask questions</span>
                </div>
            `;
            
            // Insert after the voice visualizer
            voiceControl.appendChild(instruction);
        }
        
        // Update the instruction text based on current language
        const instructionText = document.getElementById('instructionText');
        if (instructionText && this.currentLang) {
            instructionText.textContent = this.languageMessages[this.currentLang]?.speakPrompt || 
                                         this.languageMessages['en'].speakPrompt;
        }
    }
    
    // New method: Hide speak instruction
    hideSpeakInstruction() {
        const instruction = document.getElementById('speakInstruction');
        if (instruction) {
            instruction.remove();
        }
    }
}

/* ---------- Initialization Functions ---------- */
function initt_v_a(website) {
    if (!window.speechBotInstance) {
        window.speechBotInstance = new SpeechBotIntegrated(website);
        console.log('🎉 SpeechBot initialized for website:', website);
    } else {
        console.log('ℹ️ SpeechBot already initialized');
    }
}

// Auto-initialize if data-website attribute is present
document.addEventListener('DOMContentLoaded', function() {
    const script = document.querySelector('script[data-website]');
    if (script) {
        const website = script.getAttribute('data-website');
        initt_v_a(website);
    }
});

// Manual initialization
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpeechBotIntegrated, initt_v_a };
}
