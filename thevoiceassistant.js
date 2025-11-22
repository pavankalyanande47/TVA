// speechbot.js - Full UI SpeechBot with enhanced features

const link = document.createElement("link");
link.rel = "icon";
link.href = "data:,";
document.head.appendChild(link);

class SpeechBot {
    constructor(website) {
        this.website = website;
        this.apiBaseUrl = 'https://fidgetingly-testable-christoper.ngrok-free.dev';
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isSpeaking = false;
        this.hasWelcomed = false;
        this.speechQueue = [];
        this.currentUtterance = null;
        this.isProcessingQueue = false;
        this.shouldBeListening = false;
        this.shouldBeListeningAfterSpeech = false;
        this.autoCloseTimeout = null;
        this.isHidingResponse = false;
        this.currentLanguage = 'en';
        this.conversationState = 'idle';
        this.hasShownListeningMessage = false;
        this.currentAudio = null;
        this.backendAudioElements = [];
        this.noSpeechTimeout = null;

        // Translation API endpoints
        this.translateApiPath = '/translate';
        
        this.voices = [];
        this.englishVoice = null;
        this.teluguVoice = null;
        this.prefersBackendTTSFor = { te: false, en: false };
        this.backendTTSPath = '/tts';
        this.init();
    }

    init() {
        this.createWidget();
        this.setupSpeechRecognition();
        this.setupTextToSpeech();
        this.addStyles();
    }

    /* ---------- Styles & UI ---------- */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Voice Assistant Styles */
            .voice-assistant {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: Arial, sans-serif;
            }

            .assistant-btn {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 24px;
                transition: transform 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .assistant-btn:hover {
                transform: scale(1.1);
            }

            .assistant-btn.listening {
                animation: pulse 1.5s infinite;
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
            }

            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }

            .chat-container {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 380px;
                height: 500px;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                display: none;
                flex-direction: column;
                overflow: hidden;
                border: 2px solid #e0e0e0;
            }

            .chat-container.active {
                display: flex;
            }

            /* HEADER - FIXED LAYOUT */
            .chat-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 12px 15px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-height: 50px;
                flex-shrink: 0;
                width: 100%;
                box-sizing: border-box;
            }

            .header-section {
                display: flex;
                align-items: center;
            }

            .header-left {
                justify-content: flex-start;
                flex: 1;
            }

            .header-right {
                justify-content: flex-end;
                gap: 10px;
            }

            .assistant-title {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .assistant-text {
                font-size: 14px;
                font-weight: bold;
                color: white;
            }

            .robo-icon {
                animation: float 3s ease-in-out infinite;
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
                border-radius: 50%;
            }

            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                25% { transform: translateY(-3px) rotate(1deg); }
                50% { transform: translateY(-5px) rotate(0deg); }
                75% { transform: translateY(-3px) rotate(-1deg); }
            }

            /* LANGUAGE SELECTOR - RIGHT SIDE */
            .language-selector-wrapper {
                display: flex;
                align-items: center;
            }

            .lang-dropdown {
                padding: 6px 10px;
                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.3);
                background: rgba(255, 255, 255, 0.15);
                color: white;
                font-size: 12px;
                font-weight: bold;
                backdrop-filter: blur(10px);
                cursor: pointer;
                min-width: 90px;
            }

            .lang-dropdown:focus {
                outline: none;
                border-color: rgba(255, 255, 255, 0.6);
            }

            .lang-dropdown option {
                background: white;
                color: #333;
            }

            /* CLOSE BUTTON */
            .close-btn {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: white;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                border-radius: 50%;
                flex-shrink: 0;
            }

            .close-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            /* CHAT MESSAGES */
            .chat-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                background: #f8f9fa;
                min-height: 0;
            }

            .message {
                margin-bottom: 15px;
                padding: 10px 15px;
                border-radius: 18px;
                max-width: 80%;
                word-wrap: break-word;
                line-height: 1.4;
            }

            .bot-message {
                background: white;
                border: 1px solid #e0e0e0;
                border-bottom-left-radius: 5px;
                align-self: flex-start;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .user-message {
                background: #667eea;
                color: white;
                border-bottom-right-radius: 5px;
                margin-left: auto;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }

            /* INPUT AREA */
            .chat-input-area {
                border-top: 1px solid #e0e0e0;
                background: white;
                flex-shrink: 0;
            }

            .chat-input {
                padding: 15px;
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .chat-input input {
                flex: 1;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 20px;
                outline: none;
                font-size: 14px;
            }

            .send-btn {
                background: #667eea;
                color: white;
                border: none;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.3s ease;
            }

            .send-btn:hover {
                background: #5a6fd8;
            }

            .send-btn.mic-active {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                animation: pulse 1.5s infinite;
            }

            /* POWERED BY TEXT - DEFINITELY VISIBLE */
            .powered-by-tva {
                text-align: center;
                font-size: 11px;
                color: #888;
                padding: 8px 15px;
                background: #f8f9fa;
                border-top: 1px solid #e0e0e0;
                font-style: italic;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }

            .powered-by-tva span {
                display: inline-block;
            }

            /* Voice animation for assistant button */
            .voice-waves {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }

            .voice-wave {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                border: 2px solid rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                animation: voiceWave 2s linear infinite;
            }

            .voice-wave:nth-child(2) {
                animation-delay: 0.5s;
            }

            .voice-wave:nth-child(3) {
                animation-delay: 1s;
            }

            @keyframes voiceWave {
                0% {
                    width: 0;
                    height: 0;
                    opacity: 1;
                }
                100% {
                    width: 100%;
                    height: 100%;
                    opacity: 0;
                }
            }

            /* Typing indicator */
            .typing-indicator {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 10px 15px;
                background: white;
                border-radius: 18px;
                border: 1px solid #e0e0e0;
                max-width: 120px;
            }

            .typing-dot {
                width: 8px;
                height: 8px;
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

            /* Improved scrollbar */
            .chat-messages::-webkit-scrollbar {
                width: 6px;
            }

            .chat-messages::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 3px;
            }

            .chat-messages::-webkit-scrollbar-thumb {
                background: #c1c1c1;
                border-radius: 3px;
            }

            .chat-messages::-webkit-scrollbar-thumb:hover {
                background: #a8a8a8;
            }

            /* Prompt message */
            .prompt-message {
                font-size: 12px;
                color: #666;
                text-align: center;
                margin-top: 10px;
                padding: 8px 12px;
                background: #f8f9fa;
                border-radius: 15px;
                border: 1px solid #e0e0e0;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
            }

            .speechbot-loading-dots {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #667eea;
                animation: speechbot-pulse 1.5s ease-in-out infinite;
                margin-right: 4px;
            }
            
            .speechbot-loading-dots:nth-child(2) {
                animation-delay: 0.2s;
                background: #764ba2;
            }
            
            .speechbot-loading-dots:nth-child(3) {
                animation-delay: 0.4s;
                background: #f093fb;
            }
            
            @keyframes speechbot-pulse {
                0%, 100% { 
                    opacity: 1; 
                    transform: scale(1); 
                }
                50% { 
                    opacity: 0.5; 
                    transform: scale(0.8); 
                }
            }
            
            .speaker-button {
                background: none;
                border: none;
                cursor: pointer;
                padding: 5px;
                margin-left: 10px;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .speaker-button:hover {
                background: #f0f0f0;
            }
            
            .speaker-button.speaking {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .speaker-button.speaking svg {
                fill: white;
            }
            
            .response-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .response-title {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .colorful-robo {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%);
                background-size: 400% 400%;
                animation: gradientShift 4s ease infinite;
            }
            
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            /* Listening message styling */
            .listening-message {
                font-style: italic;
                color: #666;
                text-align: center;
                padding: 8px;
                background: #f0f8ff;
                border-radius: 10px;
                border: 1px solid #d1e7ff;
                margin: 10px 0;
            }
        `;
        document.head.appendChild(style);
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.id = 'speechbot-widget-container';
        widget.className = 'voice-assistant';
        widget.innerHTML = `
            <div class="chat-container" id="speechbot-chat-container">
                <!-- HEADER WITH PROPER LAYOUT -->
                <div class="chat-header">
                    <!-- LEFT SIDE: AI Assistant -->
                    <div class="header-section header-left">
                        <div class="assistant-title">
                            <img 
                                src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png" 
                                alt="AI Assistant"
                                class="robo-icon"
                                width="20" 
                                height="20"
                            />
                            <span class="assistant-text">AI Assistant</span>
                        </div>
                    </div>
                    
                    <!-- RIGHT SIDE: Language Selector + Close Button -->
                    <div class="header-section header-right">
                        <div class="language-selector-wrapper">
                            <select id="languageSelector" class="lang-dropdown">
                                <option value="en">English</option>
                                <option value="te">తెలుగు</option>
                            </select>
                        </div>
                        <button class="close-btn" id="close-chat" title="Close">×</button>
                    </div>
                </div>
                
                <!-- CHAT MESSAGES -->
                <div class="chat-messages" id="chat-messages"></div>
                
                <!-- INPUT AREA -->
                <div class="chat-input-area">
                    <div class="chat-input">
                        <input type="text" id="text-input" placeholder="Type your message...">
                        <button id="send-text-btn" class="send-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- POWERED BY TEXT - ADDED HERE -->
                    <div class="powered-by-tva">
                        <span>Powered by TVA - The Voice Assistant</span>
                    </div>
                </div>
            </div>
            
            <!-- FLOATING BUTTON -->
            <button class="assistant-btn" id="assistant-btn" title="Open assistant">
                <div class="voice-waves" id="voice-waves" style="display: none;">
                    <div class="voice-wave"></div>
                    <div class="voice-wave"></div>
                    <div class="voice-wave"></div>
                </div>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14S10 13.1 10 12V4C10 2.9 10.9 2 12 2ZM18.9 11C18.4 11 18 11.4 18 11.9C18 16.3 14.4 19.8 10 19.8S2 16.3 2 11.9C2 11.4 1.6 11 1.1 11C0.6 11 0.2 11.4 0.2 11.9C0.2 17.1 4.3 21.4 9.5 21.9V23C9.5 23.6 9.9 24 10.5 24S11.5 23.6 11.5 23V21.9C16.7 21.4 20.8 17.1 20.8 11.9C20.8 11.4 20.4 11 19.9 11Z"/>
                </svg>
            </button>
        `;

        document.body.appendChild(widget);

        document.getElementById('assistant-btn').addEventListener('click', () => {
            this.toggleChat();
        });

        document.getElementById('close-chat').addEventListener('click', () => {
            this.hideChat();
        });

        document.getElementById('send-text-btn').addEventListener('click', () => {
            this.sendTextMessage();
        });

        document.getElementById('text-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendTextMessage();
            }
        });

        document.getElementById('languageSelector').addEventListener('change', (e) => {
            this.currentLanguage = e.target.value;
            this.updateRecognitionLanguage();
            this.loadVoices();
            this.updateUITexts();
            if (document.getElementById('speechbot-chat-container').classList.contains('active')) {
                this.startConversation();
            }
        });
    }

    updateUITexts() {
        // Update placeholder text based on language
        const textInput = document.getElementById('text-input');
        if (this.currentLanguage === 'te') {
            textInput.placeholder = 'మీ సందేశాన్ని టైప్ చేయండి...';
        } else {
            textInput.placeholder = 'Type your message...';
        }
    }

    updateRecognitionLanguage() {
        if (this.recognition) {
            this.recognition.lang = this.currentLanguage === 'te' ? 'te-IN' : 'en-US';
        }
    }

    /* ---------- Speech Recognition ---------- */
    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const Recog = window.webkitSpeechRecognition || window.SpeechRecognition;
            this.recognition = new Recog();

            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 1;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.updateButtonState();
                this.updateSendButtonToMic(true);
                
                // Set 8-second timeout for no speech
                this.noSpeechTimeout = setTimeout(() => {
                    if (this.isListening) {
                        this.recognition.stop();
                        this.handleNoSpeech();
                    }
                }, 8000);
                
                // Only show listening message once per session
                if (!this.hasShownListeningMessage) {
                    const listeningMessage = this.currentLanguage === 'te' 
                        ? "🎤 వింటున్నాను... ఇప్పుడు మీ ప్రశ్నను మాట్లాడండి!" 
                        : "🎤 Listening... Speak your question now!";
                    this.addMessage(listeningMessage, 'bot');
                    this.hasShownListeningMessage = true;
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
                this.updateButtonState();
                this.updateSendButtonToMic(false);
                this.clearNoSpeechTimeout();

                // Auto-restart listening only if we're supposed to be listening
                if (this.shouldBeListening && !this.isSpeaking) {
                    setTimeout(() => {
                        if (this.shouldBeListening && !this.isSpeaking) {
                            this.startListening();
                        }
                    }, 100);
                }
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.clearNoSpeechTimeout();
                this.shouldBeListening = false;
                this.hasShownListeningMessage = false;
                this.updateSendButtonToMic(false);
                this.addMessage(transcript, 'user');

                this.showTypingIndicator();
                
                // Check if it's a greeting or common phrase
                const response = this.handleCommonPhrases(transcript);
                if (response) {
                    this.handleCommonResponse(response);
                } else {
                    this.processUserInput(transcript);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.clearNoSpeechTimeout();
                this.isListening = false;
                
                if (event.error === 'no-speech') {
                    this.handleNoSpeech();
                } else {
                    this.shouldBeListening = false;
                    this.hasShownListeningMessage = false;
                    this.updateButtonState();
                    this.updateSendButtonToMic(false);
                    
                    let errorMessage = this.currentLanguage === 'te' 
                        ? 'క్షమించండి, నేను ఒక సమస్యను ఎదుర్కొంటున్నాను. దయచేసి మళ్లీ ప్రయత్నించండి.' 
                        : 'Sorry, I encountered an issue. Please try again.';

                    if (event.error === 'not-allowed') {
                        errorMessage = this.currentLanguage === 'te'
                            ? 'మైక్రోఫోన్ యాక్సెస్ నిరాకరించబడింది. దయచేసి మైక్రోఫోన్ అనుమతులను అనుమతించండి మరియు మళ్లీ ప్రయత్నించండి.'
                            : 'Microphone access denied. Please allow microphone permissions and try again.';
                    } else if (event.error === 'audio-capture') {
                        errorMessage = this.currentLanguage === 'te'
                            ? 'మైక్రోఫోన్ కనుగొనబడలేదు. దయచేసి మీ ఆడియో సెట్టింగ్లను తనిఖీ చేయండి.'
                            : 'No microphone found. Please check your audio settings.';
                    } else if (event.error === 'network') {
                        errorMessage = this.currentLanguage === 'te'
                            ? 'నెట్‌వర్క్ లోపం. దయచేసి మీ ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేయండి.'
                            : 'Network error. Please check your internet connection.';
                    }

                    this.addMessage(errorMessage, 'bot');
                }
            };
        } else {
            const errorMessage = 'Speech recognition is not supported in your browser. Please use Google Chrome for the best experience.';
            this.addMessage(errorMessage, 'bot');
        }
    }

    clearNoSpeechTimeout() {
        if (this.noSpeechTimeout) {
            clearTimeout(this.noSpeechTimeout);
            this.noSpeechTimeout = null;
        }
    }

    handleNoSpeech() {
        this.isListening = false;
        this.updateButtonState();
        
        // Show prompt to click microphone
        const promptMessage = this.currentLanguage === 'te'
            ? "మాట్లాడడం గుర్తించబడలేదు. దయచేసి మళ్లీ మాట్లాడడానికి మైక్రోఫోన్‌పై క్లిక్ చేయండి."
            : "No speech detected. Please click the microphone to speak again.";
        
        this.addMessage(promptMessage, 'bot');
        
        // Keep microphone enabled
        this.updateSendButtonToMic(true, false);
        this.shouldBeListening = false; // Don't auto-restart, wait for user click
    }

    /* ---------- Common Phrases Handler ---------- */
    handleCommonPhrases(input) {
        const text = input.toLowerCase().trim();
        
        // English greetings and common phrases
        const englishPhrases = {
            greetings: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste'],
            thanks: ['thank you', 'thanks', 'thank you very much', 'thanks a lot', 'appreciate it', 'i am good'],
            bye: ['bye', 'goodbye', 'see you', 'take care', 'have a good day'],
            howareyou: ['how are you', 'how are you doing', "how's it going", "what's up"]
        };

        // Telugu greetings and common phrases
        const teluguPhrases = {
            greetings: ['నమస్కారం', 'హలో', 'హాయ్', 'ఎలా ఉన్నారు', 'శుభోదయం', 'శుభ మద్యాహ్నం', 'శుభ సాయంత్రం'],
            thanks: ['ధన్యవాదాలు', 'మీకు ధన్యవాదాలు', 'చాలా ధన్యవాదాలు', 'కృతజ్ఞతలు','థాంక్యూ'],
            bye: ['బై', 'వీడ్కోలు', 'తర్వాత కలుద్దాం', 'జాగ్రత్త', 'మంచి రోజు అగునుగాక'],
            howareyou: ['మీరు ఎలా ఉన్నారు', 'ఎలా ఉన్నారు', 'సరేనా', 'ఏమిటి సంగతులు']
        };

        const phrases = this.currentLanguage === 'te' ? teluguPhrases : englishPhrases;

        // Check for matches
        if (phrases.greetings.some(phrase => text.includes(phrase))) {
            return this.currentLanguage === 'te' 
                ? { type: 'greeting', text: 'నమస్కారం! మీకు ఎలా సహాయపడగలను?' }
                : { type: 'greeting', text: 'Hello! How may I help you?' };
        }
        
        if (phrases.thanks.some(phrase => text.includes(phrase))) {
            return this.currentLanguage === 'te'
                ? { type: 'thanks', text: 'మీకు సహాయం చేయగలిగినందుకు నేను సంతోషంగా ఉన్నాను! మీకు ఇంకేమైనా సహాయం కావాలా?' }
                : { type: 'thanks', text: 'I am happy to help you! Is there anything else you need assistance with?' };
        }
        
        if (phrases.bye.some(phrase => text.includes(phrase))) {
            return this.currentLanguage === 'te'
                ? { type: 'bye', text: 'థాంక్యూ ,మీరు మళ్ళి కలవాలి అని కోరుకుంటున్నాను' }
                : { type: 'bye', text: 'Goodbye! Feel free to come back if you have more questions. Have a great day!' };
        }
        
        if (phrases.howareyou.some(phrase => text.includes(phrase))) {
            return this.currentLanguage === 'te'
                ? { type: 'howareyou', text: 'నేను చాలా బాగున్నాను, ధన్యవాదాలు! మీకు ఎలా సహాయపడగలను?' }
                : { type: 'howareyou', text: 'I am doing great, thank you! How can I assist you today?' };
        }

        return null;
    }

    handleCommonResponse(response) {
        this.addMessage(response.text, 'bot');
        this.speechQueue = [];
        this.speakWithNaturalVoice(response.text, true);
    }

    /* ---------- Text-to-Speech Setup ---------- */
    setupTextToSpeech() {
        if (!this.synthesis) {
            console.warn('Speech synthesis not supported in this browser');
            return;
        }

        this.loadVoices();

        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = this.loadVoices.bind(this);
        }
    }

    loadVoices() {
        try {
            this.voices = this.synthesis.getVoices() || [];

            this.englishVoice = this.voices.find(v =>
                (v.lang && (v.lang.includes('en') || v.lang.includes('en-'))) &&
                (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('neural') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('victoria'))
            ) || this.voices.find(v => v.lang && v.lang.includes('en')) || null;

            this.teluguVoice = this.voices.find(v => v.lang && (v.lang === 'te' || v.lang.startsWith('te') || v.lang === 'te-IN')) || null;

            this.prefersBackendTTSFor.te = !this.teluguVoice;
            this.prefersBackendTTSFor.en = !this.englishVoice;

            console.log('Voices loaded. English:', this.englishVoice?.name || 'none', 'Telugu:', this.teluguVoice?.name || 'none');
            console.log('Prefers backend TTS: ', this.prefersBackendTTSFor);
        } catch (err) {
            console.error('Error loading voices', err);
        }
    }

    /* ---------- Translation Methods ---------- */
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

    async processUserInput(input) {
        let processedQuestion = input;
        
        if (this.currentLanguage === 'te') {
            try {
                processedQuestion = await this.translateText(input, 'te', 'en');
                console.log('Translated Telugu to English:', input, '->', processedQuestion);
            } catch (error) {
                console.error('Failed to translate Telugu input:', error);
            }
        }

        this.processQuery(processedQuestion);
    }

    /* ---------- Core speech queue & speaking ---------- */
    speakWithNaturalVoice(text, isAnswer = false, isFollowUp = false) {
        if (!this.synthesis && !this.prefersBackendTTSFor.en && !this.prefersBackendTTSFor.te) {
            console.warn('No speech synthesis available and backend not configured.');
            return;
        }

        // Reset hiding response flag when starting new speech
        this.isHidingResponse = false;

        this.speechQueue.push({
            text,
            isAnswer,
            isFollowUp,
            timestamp: Date.now()
        });

        if (!this.isProcessingQueue) {
            this.processSpeechQueue();
        }
    }

    async processSpeechQueue() {
        if (this.speechQueue.length === 0) {
            this.isProcessingQueue = false;
            return;
        }

        if (this.isSpeaking) {
            return;
        }

        if (this.isHidingResponse) {
            console.log('Skipping speech - response is being hidden');
            this.speechQueue = [];
            this.isProcessingQueue = false;
            return;
        }

        this.isProcessingQueue = true;
        const speechItem = this.speechQueue[0];
        const { text, isAnswer, isFollowUp } = speechItem;

        this.stopListening();

        const langKey = this.currentLanguage === 'te' ? 'te' : 'en';
        const useBackend = this.prefersBackendTTSFor[langKey];

        try {
            this.isSpeaking = true;
            this.currentUtterance = null;

            if (useBackend) {
                await this._speakViaBackend(text, langKey);
            } else {
                await this._speakViaBrowser(text, langKey);
            }
        } catch (err) {
            console.error('Error during speech:', err);
            if (useBackend && (langKey === 'te' ? this.teluguVoice : this.englishVoice)) {
                console.log('Backend failed — falling back to browser voice');
                try {
                    await this._speakViaBrowser(text, langKey);
                } catch (err2) {
                    console.error('Fallback browser TTS failed as well:', err2);
                }
            }
        } finally {
            const completed = this.speechQueue.shift();
            this.isSpeaking = false;
            this.currentUtterance = null;

            setTimeout(() => {
                if (this.speechQueue.length > 0 && !this.isHidingResponse) {
                    this.processSpeechQueue();
                } else {
                    this.isProcessingQueue = false;
                    if (!this.isHidingResponse) {
                        this.handlePostSpeechActions(isAnswer, isFollowUp);
                    }
                }
            }, 600);
        }
    }

    _speakViaBrowser(text, langKey) {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) return reject(new Error('No speechSynthesis'));

            const utterance = new SpeechSynthesisUtterance(this._preprocessTextForLanguage(text, langKey));
            utterance.lang = langKey === 'te' ? 'te-IN' : (this.englishVoice?.lang || 'en-US');

            utterance.voice = (langKey === 'te' ? this.teluguVoice : this.englishVoice) || null;

            if (langKey === 'te') {
                utterance.rate = 1.1;
                utterance.pitch = 1.0;
            } else {
                utterance.rate = 0.95;
                utterance.pitch = 1.03;
            }
            utterance.volume = 0.95;

            utterance.onstart = () => {
                this.isSpeaking = true;
                this.currentUtterance = utterance;
                this.resetAutoCloseTimeout();
            };

            utterance.onend = () => {
                this.isSpeaking = false;
                resolve();
            };

            utterance.onerror = (e) => {
                console.error('SpeechSynthesisUtterance error:', e);
                this.isSpeaking = false;
                resolve();
            };

            try {
                this.synthesis.cancel();
            } catch (e) { }

            setTimeout(() => {
                try {
                    this.synthesis.speak(utterance);
                } catch (err) {
                    console.error('speak() threw:', err);
                    this.isSpeaking = false;
                    resolve();
                }
            }, 180);
        });
    }

    async _speakViaBackend(text, langKey) {
        const langParam = langKey === 'te' ? 'te' : 'en';
        const ttsUrl = this.apiBaseUrl + this.backendTTSPath;

        try {
            const response = await fetch(ttsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: this._preprocessTextForLanguage(text, langKey), lang: langParam })
            });

            if (!response.ok) {
                throw new Error(`TTS backend returned ${response.status}`);
            }

            const blob = await response.blob();
            const audioURL = URL.createObjectURL(blob);

            await this._playAudioFromURL(audioURL);

            setTimeout(() => URL.revokeObjectURL(audioURL), 5000);
        } catch (err) {
            console.error('Backend TTS error:', err);
            throw err;
        }
    }

    _preprocessTextForLanguage(text, langKey) {
        let t = text.trim();

        if (t.length > 600) {
            t = t.substring(0, 600) + '...';
        }

        return t;
    }

    _playAudioFromURL(url) {
        return new Promise((resolve, reject) => {
            // Create new audio element
            const audio = new Audio(url);
            audio.volume = 0.95;
            
            // Store reference to track all audio elements
            this.backendAudioElements.push(audio);
            this.currentAudio = audio;
            
            const cleanup = () => {
                this.isSpeaking = false;
                const index = this.backendAudioElements.indexOf(audio);
                if (index > -1) {
                    this.backendAudioElements.splice(index, 1);
                }
                if (this.currentAudio === audio) {
                    this.currentAudio = null;
                }
                resolve();
            };
            
            audio.onended = cleanup;
            audio.onerror = (e) => {
                console.error('Audio playback error', e);
                cleanup();
            };
            
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    this.isSpeaking = true;
                }).catch((err) => {
                    console.warn('Autoplay blocked, attempting fallback to speechSynthesis', err);
                    cleanup();
                    if ((this.currentLanguage === 'te' && this.teluguVoice) || (this.currentLanguage !== 'te' && this.englishVoice)) {
                        this._speakViaBrowser(url, this.currentLanguage === 'te' ? 'te' : 'en').then(resolve).catch(resolve);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    /* ---------- STOP ALL SPEECH METHODS ---------- */
    stopAllSpeech() {
        console.log('Stopping all speech...');
        
        // Stop browser TTS
        if (this.synthesis) {
            try {
                this.synthesis.cancel();
            } catch (e) {
                console.error('Error stopping browser TTS:', e);
            }
        }
        
        // Stop all backend TTS audio elements
        this.backendAudioElements.forEach(audio => {
            try {
                audio.pause();
                audio.currentTime = 0;
            } catch (e) {
                console.error('Error stopping backend TTS audio:', e);
            }
        });
        this.backendAudioElements = [];
        this.currentAudio = null;
        
        // Clear speech queue
        this.speechQueue = [];
        
        // Reset states
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.isProcessingQueue = false;
    }

    stopSpeech() {
        this.stopAllSpeech();
    }

    /* ---------- Post-speech actions & auto listening ---------- */
    handlePostSpeechActions(isAnswer, isFollowUp) {
        const chatContainer = document.getElementById('speechbot-chat-container');

        if (!chatContainer.classList.contains('active') || this.isHidingResponse) {
            this.shouldBeListeningAfterSpeech = false;
            return;
        }

        // Show microphone prompt after answer is spoken
        if (isAnswer) {
            this.showMicrophonePrompt();
            
            // DO NOT auto-start listening after answer - wait for user to click microphone
            this.shouldBeListening = false;
        }

        // Auto-start listening after welcome message (first interaction)
        if (this.conversationState === 'awaiting_question' && !isAnswer) {
            console.log('Starting listening after welcome message');
            this.shouldBeListening = true;
            this.hasShownListeningMessage = false;
            setTimeout(() => {
                if (!this.isSpeaking && this.shouldBeListening) {
                    this.startListening();
                }
            }, 1500);
        }
    }

    showMicrophonePrompt() {
        const chatMessages = document.getElementById('chat-messages');
        const promptDiv = document.createElement('div');
        promptDiv.className = 'prompt-message';
        
        let promptText = this.currentLanguage === 'te' 
            ? 'మరిన్ని ప్రశ్నలు అడగడానికి మైక్రోఫోన్‌పై క్లిక్ చేయండి'
            : 'Click on the microphone to ask more questions';

        promptDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#666">
                <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14S10 13.1 10 12V4C10 2.9 10.9 2 12 2ZM18.9 11C18.4 11 18 11.4 18 11.9C18 16.3 14.4 19.8 10 19.8S2 16.3 2 11.9C2 11.4 1.6 11 1.1 11C0.6 11 0.2 11.4 0.2 11.9C0.2 17.1 4.3 21.4 9.5 21.9V23C9.5 23.6 9.9 24 10.5 24S11.5 23.6 11.5 23V21.9C16.7 21.4 20.8 17.1 20.8 11.9C20.8 11.4 20.4 11 19.9 11Z"/>
            </svg>
            ${promptText}
        `;

        chatMessages.appendChild(promptDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Change send button to microphone
        this.updateSendButtonToMic(true, false);
    }

    updateSendButtonToMic(isMic, isActive = false) {
        const sendButton = document.getElementById('send-text-btn');
        if (isMic) {
            sendButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14S10 13.1 10 12V4C10 2.9 10.9 2 12 2ZM18.9 11C18.4 11 18 11.4 18 11.9C18 16.3 14.4 19.8 10 19.8S2 16.3 2 11.9C2 11.4 1.6 11 1.1 11C0.6 11 0.2 11.4 0.2 11.9C0.2 17.1 4.3 21.4 9.5 21.9V23C9.5 23.6 9.9 24 10.5 24S11.5 23.6 11.5 23V21.9C16.7 21.4 20.8 17.1 20.8 11.9C20.8 11.4 20.4 11 19.9 11Z"/>
                </svg>
            `;
            sendButton.onclick = () => {
                this.startListening();
            };
            if (isActive) {
                sendButton.classList.add('mic-active');
            } else {
                sendButton.classList.remove('mic-active');
            }
        } else {
            sendButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
            `;
            sendButton.onclick = () => {
                this.sendTextMessage();
            };
            sendButton.classList.remove('mic-active');
        }
    }

    resetAutoCloseTimeout() {
        if (this.autoCloseTimeout) {
            clearTimeout(this.autoCloseTimeout);
        }

        const chatContainer = document.getElementById('speechbot-chat-container');
        if (chatContainer.classList.contains('active')) {
            this.autoCloseTimeout = setTimeout(() => {
                if (!this.isSpeaking && this.speechQueue.length === 0 && chatContainer.classList.contains('active')) {
                    this.hideChat();
                } else {
                    this.resetAutoCloseTimeout();
                }
            }, 20000);
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (e) { }
            this.isListening = false;
            this.shouldBeListening = false;
            this.hasShownListeningMessage = false;
            this.updateButtonState();
            this.updateSendButtonToMic(false);
            this.clearNoSpeechTimeout();
        }
    }

    startListening() {
        if (!this.recognition || this.isSpeaking) return;
        try {
            this.updateRecognitionLanguage();
            this.recognition.start();
            this.shouldBeListening = true;
        } catch (error) {
            console.error('Failed to start recognition', error);
            setTimeout(() => {
                this.showMicrophonePrompt();
            }, 1000);
        }
    }

    updateButtonState() {
        const button = document.getElementById('assistant-btn');
        const voiceWaves = document.getElementById('voice-waves');

        if (this.isListening) {
            button.classList.add('listening');
            voiceWaves.style.display = 'block';
        } else {
            button.classList.remove('listening');
            voiceWaves.style.display = 'none';
        }
    }

    /* ---------- Conversation flow ---------- */
    async startConversation() {
        if (!this.recognition) {
            this.addMessage(this.getErrorMessage('general_error'), 'bot');
            return;
        }

        let speakMessage = this.getWelcomeMessage();
        let displayMessage = speakMessage;

        if (!this.hasWelcomed) {
            this.hasWelcomed = true;
            this.conversationState = 'awaiting_question';
        } else {
            this.conversationState = 'awaiting_question';
        }

        this.isHidingResponse = false;
        this.hasShownListeningMessage = false;

        if (this.currentLanguage === 'te') {
            try {
                const translatedMessage = await this.translateText(speakMessage, 'en', 'te');
                this.addMessage(translatedMessage, 'bot');
                this.speechQueue = [];
                this.speakWithNaturalVoice(translatedMessage, false);
                this.shouldBeListeningAfterSpeech = true;
            } catch (error) {
                console.error('Welcome translation failed:', error);
                this.addMessage(displayMessage, 'bot');
                this.speechQueue = [];
                this.speakWithNaturalVoice(speakMessage, false);
                this.shouldBeListeningAfterSpeech = true;
            }
        } else {
            this.addMessage(displayMessage, 'bot');
            this.speechQueue = [];
            this.speakWithNaturalVoice(speakMessage, false);
            this.shouldBeListeningAfterSpeech = true;
        }
    }

    getWelcomeMessage() {
        if (!this.hasWelcomed) {
            return this.currentLanguage === 'te' 
                ? "నమస్కారం! నేను మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను. మీరు నన్ను ఏవైనా ప్రశ్నలు అడగవచ్చు." 
                : "Hello! I am here to help you. You can ask me any questions.";
        } else {
            return this.currentLanguage === 'te'
                ? "నేను వింటున్నాను. దయచేసి మీ ప్రశ్నను అడగండి."
                : "I am listening. Please ask your question.";
        }
    }

    /* ---------- Query Processing ---------- */
    async processQuery(question) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/speechbot/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    website: this.website, 
                    question: question,
                    language: this.currentLanguage
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (data.answer) {
                if (data.answer.includes('Client not found') || data.answer.includes('not found')) {
                    await this.handleErrorResponse('not_found');
                } else if (data.answer.includes('Subscription expired')) {
                    await this.handleErrorResponse('subscription_expired');
                } else {
                    await this.handleSuccessResponse(data.answer);
                }
            } else {
                throw new Error('No answer received from server');
            }
        } catch (error) {
            console.error('Error processing query:', error);
            await this.handleErrorResponse('general_error');
        }
    }

    async handleSuccessResponse(englishAnswer) {
        let displayAnswer = englishAnswer;
        let speakAnswer = englishAnswer;

        if (this.currentLanguage === 'te') {
            try {
                speakAnswer = await this.translateText(englishAnswer, 'en', 'te');
                displayAnswer = speakAnswer;
                console.log('Translated English to Telugu:', englishAnswer, '->', speakAnswer);
            } catch (error) {
                console.error('Failed to translate answer to Telugu:', error);
                speakAnswer = this.getFallbackMessage('translation_failed');
            }
        }

        this.addMessage(displayAnswer, 'bot');
        this.speechQueue = [];
        this.speakWithNaturalVoice(speakAnswer, true);
    }

    async handleErrorResponse(errorType) {
        let errorMessage = this.getErrorMessage(errorType);
        
        if (this.currentLanguage === 'te') {
            try {
                errorMessage = await this.translateText(errorMessage, 'en', 'te');
            } catch (error) {
                console.error('Failed to translate error message:', error);
            }
        }

        this.addMessage(errorMessage, 'bot');
        this.speechQueue = [];
        this.speakWithNaturalVoice(errorMessage, false);
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

    /* ---------- UI helpers ---------- */
    addMessage(text, sender, isThinking = false) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        if (isThinking) {
            messageDiv.innerHTML = `
                <div class="typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            `;
        } else {
            messageDiv.textContent = text;
        }

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        this.resetAutoCloseTimeout();
    }

    showTypingIndicator() {
        this.addMessage('', 'bot', true);
    }

    toggleChat() {
        const chatContainer = document.getElementById('speechbot-chat-container');
        const isActive = chatContainer.classList.contains('active');

        if (!isActive) {
            chatContainer.classList.add('active');
            this.startConversation();
        } else {
            this.hideChat();
        }
    }

    hideChat() {
        const chatContainer = document.getElementById('speechbot-chat-container');
        chatContainer.classList.remove('active');

        this.isHidingResponse = true;

        // STOP ALL SPEECH when hiding chat
        this.stopAllSpeech();
        this.stopListening();
        this.conversationState = 'idle';
        this.shouldBeListening = false;
        this.shouldBeListeningAfterSpeech = false;
        this.hasShownListeningMessage = false;
        this.updateSendButtonToMic(false);
        this.clearNoSpeechTimeout();

        if (this.autoCloseTimeout) {
            clearTimeout(this.autoCloseTimeout);
        }
    }

    sendTextMessage() {
        const textInput = document.getElementById('text-input');
        const message = textInput.value.trim();

        if (message) {
            this.addMessage(message, 'user');
            
            // Check if it's a greeting or common phrase
            const response = this.handleCommonPhrases(message);
            if (response) {
                this.handleCommonResponse(response);
            } else {
                this.showTypingIndicator();
                this.processUserInput(message);
            }
            textInput.value = '';
        }
    }
}

/* ---------- Helper init code ---------- */
function initt_v_a(website) {
    if (!window.speechBot) {
        window.speechBot = new SpeechBot(website);
        console.log('🎉 SpeechBot initialized for website:', website);
    } else {
        console.log('ℹ️ SpeechBot already initialized');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const script = document.querySelector('script[data-website]');
    if (script) {
        const website = script.getAttribute('data-website');
        initt_v_a(website);
    }
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpeechBot, initt_v_a };
}
