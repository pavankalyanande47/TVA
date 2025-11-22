// speechbot.js - Complete fixed code with proper listening timing for both English and Telugu
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
        this.autoCloseTimeout = null;
        this.isHidingResponse = false;
        this.currentLanguage = 'en';
        this.conversationState = 'idle';
        this.hasShownListeningMessage = false;
        this.recognitionRestartTimeout = null;
        this.isRecognitionStarting = false;
        this.recognitionStartTime = 0;
        this.silenceTimeout = null;
        this.lastSpeechTime = 0;
        this.userIsSpeaking = false;

        // Translation API endpoints
        this.translateApiPath = '/translate';
        
        this.voices = [];
        this.englishVoice = null;
        this.teluguVoice = null;
        this.prefersBackendTTSFor = { te: false, en: false };
        this.backendTTSPath = '/tts';
        
        // Mobile detection
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Audio context for mobile audio issues
        this.audioContext = null;
        this.audioElements = [];
        
        // Enhanced Greeting patterns with better Telugu matching
        this.greetingPatterns = {
            en: [
                /\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/i,
                /\b(how are you|how do you do)\b/i,
                /\b(thank you|thanks|thankyou|I am Happy)\b/i,
                /\b(no|nope|nah)\b/i,
                /\b(yes|yeah|yep|sure)\b/i,
                /\b(fine|good|well|ok|okay)\b/i
            ],
            te: [
                /(నమస్కారం|హలో|హాయ్|హే|నమస్తే|హాయి|నమస్కారము)/i,
                /(మీరు ఎలా ఉన్నారు|ఎలా ఉన్నారు|నువ్వు ఎలా ఉన్నావు|ఎలా ఉన్నావు)/i,
                /(ధన్యవాదాలు|థాంక్యూ|థాంక్స్|సంతోషం|మంచిది|థాంక్సు)/i,
                /(లేదు|కాదు|నో|అలాగే|నో ప్రాబ్లం)/i,
                /(అవును|అవ్|హ|హమ్మ|యస్)/i,
                /(బాగున్నాను|ఫైన్|గుడ్|సరే|ఓకే|బాగా ఉన్నాను)/i
            ]
        };
        
        this.init();
    }

    init() {
        this.createWidget();
        this.setupSpeechRecognition();
        this.setupTextToSpeech();
        this.addStyles();
        this.setupAudioContext();
    }

    /* ---------- Audio Context Setup for Mobile ---------- */
    setupAudioContext() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.audioContext = new AudioContext();
                document.addEventListener('click', () => {
                    if (this.audioContext && this.audioContext.state === 'suspended') {
                        this.audioContext.resume();
                    }
                }, { once: true });
            }
        } catch (error) {
            console.warn('AudioContext not supported:', error);
        }
    }

    /* ---------- Styles & UI ---------- */
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
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

            /* Mobile-specific styles */
            @media (max-width: 480px) {
                .voice-assistant {
                    bottom: 10px;
                    right: 10px;
                }
                
                .chat-container {
                    width: 95vw;
                    height: 70vh;
                    right: 2.5vw;
                    bottom: 70px;
                }
                
                .assistant-btn {
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                }
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
                <div class="chat-header">
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
                
                <div class="chat-messages" id="chat-messages"></div>
                
                <div class="chat-input-area">
                    <div class="chat-input">
                        <input type="text" id="text-input" placeholder="Type your message...">
                        <button id="send-text-btn" class="send-btn">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="powered-by-tva">
                        <span>Powered by TVA - The Voice Assistant</span>
                    </div>
                </div>
            </div>
            
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
            if (document.getElementById('speechbot-chat-container').classList.contains('active')) {
                this.startConversation();
            }
        });

        // Add touch event for mobile
        if (this.isMobile) {
            document.getElementById('assistant-btn').addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.toggleChat();
            }, { passive: false });
        }
    }

    updateRecognitionLanguage() {
        if (this.recognition) {
            const langCode = this.currentLanguage === 'te' ? 'te-IN' : 'en-US';
            this.recognition.lang = langCode;
            console.log('Speech recognition language set to:', langCode);
        }
    }

    /* ---------- Speech Recognition - FIXED TIMING LOGIC ---------- */
    setupSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const Recog = window.webkitSpeechRecognition || window.SpeechRecognition;
            this.recognition = new Recog();

            // FIX: Better settings for continuous listening
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 3;

            this.recognition.onstart = () => {
                console.log('Speech recognition started - microphone active');
                this.isListening = true;
                this.isRecognitionStarting = false;
                this.recognitionStartTime = Date.now();
                this.updateButtonState();
                this.updateSendButtonToMic(true);
                
                // Start silence detection timeout
                this.startSilenceDetection();
                
                if (!this.hasShownListeningMessage) {
                    const listeningMessage = this.currentLanguage === 'te' 
                        ? "🎤 వింటున్నాను... మీ ప్రశ్నను ఇప్పుడు మాట్లాడండి!" 
                        : "🎤 Listening... Speak your question now!";
                    this.addMessage(listeningMessage, 'bot');
                    this.hasShownListeningMessage = true;
                }
            };

            this.recognition.onend = () => {
                console.log('Speech recognition ended');
                this.isListening = false;
                this.isRecognitionStarting = false;
                this.updateButtonState();
                this.updateSendButtonToMic(false);

                // Clear silence timeout when recognition ends
                if (this.silenceTimeout) {
                    clearTimeout(this.silenceTimeout);
                    this.silenceTimeout = null;
                }

                // Only restart if we should be listening and no speech was detected
                if (this.shouldBeListening && !this.isSpeaking && this.conversationState === 'awaiting_question' && !this.userIsSpeaking) {
                    console.log('Auto-restarting speech recognition after normal end');
                    setTimeout(() => {
                        if (this.shouldBeListening && !this.isSpeaking && this.conversationState === 'awaiting_question' && !this.isRecognitionStarting) {
                            this.startListening();
                        }
                    }, 500);
                }
            };

            this.recognition.onresult = (event) => {
                console.log('Speech recognition result received');
                
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                        console.log('Final result:', event.results[i][0].transcript, 'Confidence:', event.results[i][0].confidence);
                        
                        // Reset silence detection when we get final results
                        this.resetSilenceDetection();
                        
                        // Log alternatives for debugging
                        if (event.results[i].length > 1) {
                            console.log('Alternative results:');
                            for (let j = 1; j < event.results[i].length; j++) {
                                console.log(`  Alt ${j}:`, event.results[i][j].transcript, 'Confidence:', event.results[i][j].confidence);
                            }
                        }
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                        // User is speaking - reset silence detection
                        if (interimTranscript.trim().length > 0) {
                            this.userIsSpeaking = true;
                            this.resetSilenceDetection();
                        }
                    }
                }

                if (finalTranscript) {
                    console.log('Final transcript:', finalTranscript);
                    this.userIsSpeaking = false;
                    
                    // Stop auto-listening after getting valid user input
                    this.shouldBeListening = false;
                    this.hasShownListeningMessage = false;
                    this.updateSendButtonToMic(false);
                    this.addMessage(finalTranscript, 'user');

                    if (this.isGreeting(finalTranscript)) {
                        this.handleGreeting(finalTranscript);
                    } else {
                        this.showTypingIndicator();
                        this.processUserInput(finalTranscript);
                    }
                } else if (interimTranscript) {
                    console.log('Interim transcript:', interimTranscript);
                }
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.isListening = false;
                this.isRecognitionStarting = false;
                this.updateButtonState();
                
                // Clear silence timeout on error
                if (this.silenceTimeout) {
                    clearTimeout(this.silenceTimeout);
                    this.silenceTimeout = null;
                }
                
                if (event.error === 'no-speech') {
                    console.log('No speech detected - this is normal during pauses');
                    // Don't change shouldBeListening for no-speech errors
                    this.userIsSpeaking = false;
                } else {
                    this.shouldBeListening = false;
                    this.userIsSpeaking = false;
                }
                
                this.hasShownListeningMessage = false;
                this.updateSendButtonToMic(true, false);

                let errorMessage = this.currentLanguage === 'te' 
                    ? 'క్షమించండి, సమస్య ఎదురైంది. దయచేసి మళ్లీ ప్రయత్నించండి.' 
                    : 'Sorry, I encountered an issue. Please try again.';

                if (event.error === 'not-allowed') {
                    errorMessage = this.currentLanguage === 'te'
                        ? 'మైక్రోఫోన్ యాక్సెస్ నిరాకరించబడింది. దయచేసి మైక్రోఫోన్ అనుమతులను అనుమతించండి మరియు మళ్లీ ప్రయత్నించండి.'
                        : 'Microphone access denied. Please allow microphone permissions and try again.';
                    this.shouldBeListening = false;
                } else if (event.error === 'no-speech') {
                    errorMessage = this.currentLanguage === 'te'
                        ? 'మాట్లాడడం గుర్తించబడలేదు. దయచేసి మీ ప్రశ్నను మాట్లాడండి.'
                        : 'No speech detected. Please speak your question.';
                    // Keep listening for no-speech errors
                    this.shouldBeListening = true;
                } else if (event.error === 'audio-capture') {
                    errorMessage = this.currentLanguage === 'te'
                        ? 'మైక్రోఫోన్ కనబడలేదు. దయచేసి మీ ఆడియో సెట్టింగ్లను తనిఖీ చేయండి.'
                        : 'No microphone found. Please check your audio settings.';
                    this.shouldBeListening = false;
                } else if (event.error === 'network') {
                    errorMessage = this.currentLanguage === 'te'
                        ? 'నెట్‌వర్క్ లోపం. దయచేసి మీ ఇంటర్నెట్ కనెక్షన్‌ను తనిఖీ చేయండి.'
                        : 'Network error. Please check your internet connection.';
                    this.shouldBeListening = false;
                } else if (event.error === 'aborted') {
                    console.log('Speech recognition aborted - normal during restarts');
                    return;
                }

                if (event.error !== 'aborted' && event.error !== 'no-speech') {
                    this.addMessage(errorMessage, 'bot');
                }

                setTimeout(() => {
                    if (this.conversationState === 'awaiting_question' && this.shouldBeListening) {
                        this.showMicrophonePrompt();
                    }
                }, 1000);
            };

            this.recognition.onnomatch = () => {
                console.log('No speech match found');
                this.userIsSpeaking = false;
            };
        } else {
            const errorMessage = this.currentLanguage === 'te'
                ? 'మీ బ్రౌజర్‌లో స్పీచ్ రికగ్నిషన్‌కు మద్దతు లేదు. ఉత్తమ అనుభవం కోసం దయచేసి Google Chrome ఉపయోగించండి.'
                : 'Speech recognition is not supported in your browser. Please use Google Chrome for the best experience.';
            this.addMessage(errorMessage, 'bot');
        }
    }

    /* ---------- Silence Detection for 20-second timeout ---------- */
    startSilenceDetection() {
        this.lastSpeechTime = Date.now();
        
        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
        }
        
        this.silenceTimeout = setTimeout(() => {
            console.log('20 seconds of silence detected - stopping listening');
            this.stopListening();
            this.showMicrophonePrompt();
        }, 20000); // 20 seconds
    }

    resetSilenceDetection() {
        this.lastSpeechTime = Date.now();
        
        if (this.silenceTimeout) {
            clearTimeout(this.silenceTimeout);
        }
        
        // Restart the silence detection
        this.silenceTimeout = setTimeout(() => {
            console.log('20 seconds of silence detected - stopping listening');
            this.stopListening();
            this.showMicrophonePrompt();
        }, 20000);
    }

    /* ---------- Start Listening - IMPROVED ---------- */
    startListening() {
        if (!this.recognition || this.isSpeaking || this.isRecognitionStarting) {
            console.log('Cannot start listening: busy or already starting');
            return;
        }
        
        try {
            this.isRecognitionStarting = true;
            this.userIsSpeaking = false;
            this.updateRecognitionLanguage();
            
            if (this.recognitionRestartTimeout) {
                clearTimeout(this.recognitionRestartTimeout);
                this.recognitionRestartTimeout = null;
            }
            
            if (this.silenceTimeout) {
                clearTimeout(this.silenceTimeout);
                this.silenceTimeout = null;
            }
            
            if (this.isListening) {
                try {
                    this.recognition.stop();
                } catch (e) {
                    console.log('Error stopping recognition:', e);
                }
                
                setTimeout(() => {
                    this._actuallyStartListening();
                }, 300);
            } else {
                this._actuallyStartListening();
            }
            
        } catch (error) {
            console.error('Failed to start recognition', error);
            this.isRecognitionStarting = false;
            setTimeout(() => {
                if (this.conversationState === 'awaiting_question') {
                    this.showMicrophonePrompt();
                }
            }, 1000);
        }
    }

    _actuallyStartListening() {
        try {
            this.recognition.start();
            this.shouldBeListening = true;
            console.log('Attempting to start listening in language:', this.recognition.lang);
        } catch (error) {
            console.error('Failed in _actuallyStartListening:', error);
            this.isRecognitionStarting = false;
            
            // Retry after a delay
            if (this.conversationState === 'awaiting_question') {
                setTimeout(() => {
                    if (!this.isRecognitionStarting && this.shouldBeListening) {
                        console.log('Retrying to start listening...');
                        this.startListening();
                    }
                }, 1000);
            }
        }
    }

    /* ---------- Stop Listening ---------- */
    stopListening() {
        if (this.recognition && (this.isListening || this.isRecognitionStarting)) {
            try {
                this.recognition.stop();
            } catch (e) {
                console.log('Error stopping recognition:', e);
            }
            this.isListening = false;
            this.isRecognitionStarting = false;
            this.shouldBeListening = false;
            this.hasShownListeningMessage = false;
            this.userIsSpeaking = false;
            
            if (this.recognitionRestartTimeout) {
                clearTimeout(this.recognitionRestartTimeout);
                this.recognitionRestartTimeout = null;
            }
            
            if (this.silenceTimeout) {
                clearTimeout(this.silenceTimeout);
                this.silenceTimeout = null;
            }
            
            this.updateButtonState();
            this.updateSendButtonToMic(false);
        }
    }

    /* ---------- Greeting Detection & Handling ---------- */
    isGreeting(text) {
        const patterns = this.greetingPatterns[this.currentLanguage] || this.greetingPatterns.en;
        
        if (this.currentLanguage === 'te') {
            const teluguText = text.toLowerCase();
            const commonTeluguGreetings = [
                'హాయ్', 'హలో', 'నమస్కారం', 'నమస్తే', 'హే', 
                'హాయి', 'నమస్కారము', 'హలో సర్', 'హలో మాడం'
            ];
            
            const hasTeluguGreeting = commonTeluguGreetings.some(greeting => 
                teluguText.includes(greeting.toLowerCase())
            );
            
            return hasTeluguGreeting || patterns.some(pattern => pattern.test(text));
        }
        
        return patterns.some(pattern => pattern.test(text));
    }

    handleGreeting(userInput) {
        console.log('Handling greeting:', userInput, 'Language:', this.currentLanguage);
        
        const greetingResponse = this.getGreetingResponse(userInput);
        
        this.addMessage(greetingResponse.display, 'bot');
        this.speechQueue = [];
        this.speakWithNaturalVoice(greetingResponse.speak, false);
    }

    getGreetingResponse(userInput) {
        const lowerInput = userInput.toLowerCase();
        
        if (this.currentLanguage === 'en') {
            if (/\b(hi|hello|hey|greetings|good morning|good afternoon|good evening)\b/i.test(lowerInput)) {
                return {
                    display: "Hello! Welcome! I'm here to help you learn more about this organization. Feel free to ask me any questions.",
                    speak: "Hello! Welcome! I'm here to help you learn more about this organization. Feel free to ask me any questions."
                };
            } else if (/\b(how are you|how do you do)\b/i.test(lowerInput)) {
                return {
                    display: "I'm doing great, thank you! I'm here and ready to help you with any questions about this organization.",
                    speak: "I'm doing great, thank you! I'm here and ready to help you with any questions about this organization."
                };
            } else if (/\b(thank you|thanks|thankyou|I am Happy)\b/i.test(lowerInput)) {
                return {
                    display: "You're welcome! I'm happy to help. Is there anything else you'd like to know about this organization?",
                    speak: "You're welcome! I'm happy to help. Is there anything else you'd like to know about this organization?"
                };
            } else if (/\b(no|nope|nah)\b/i.test(lowerInput)) {
                return {
                    display: "No problem! I'm here whenever you need assistance. Feel free to ask me anything about this organization.",
                    speak: "No problem! I'm here whenever you need assistance. Feel free to ask me anything about this organization."
                };
            } else if (/\b(yes|yeah|yep|sure)\b/i.test(lowerInput)) {
                return {
                    display: "Great! What would you like to know about this organization? I'm here to answer all your questions.",
                    speak: "Great! What would you like to know about this organization? I'm here to answer all your questions."
                };
            } else if (/\b(fine|good|well|ok|okay)\b/i.test(lowerInput)) {
                return {
                    display: "That's good to hear! How can I assist you with information about this organization today?",
                    speak: "That's good to hear! How can I assist you with information about this organization today?"
                };
            }
        }
        else if (this.currentLanguage === 'te') {
            const teluguInput = userInput.toLowerCase();
            
            if (/(నమస్కారం|హలో|హాయ్|హే|నమస్తే|హాయి|నమస్కారము)/i.test(teluguInput)) {
                return {
                    display: "నమస్కారం! స్వాగతం! ఈ సంస్థ గురించి మీకు ఏమి తెలుసుకోవాలని ఉంది? నేను మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను.",
                    speak: "నమస్కారం! స్వాగతం! ఈ సంస్థ గురించి మీకు ఏమి తెలుసుకోవాలని ఉంది? నేను మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను."
                };
            } else if (/(మీరు ఎలా ఉన్నారు|ఎలా ఉన్నారు|నువ్వు ఎలా ఉన్నావు|ఎలా ఉన్నావు)/i.test(teluguInput)) {
                return {
                    display: "నేను చాలా బాగున్నాను, ధన్యవాదాలు! ఈ సంస్థ గురించి మీ ప్రశ్నలకు సమాధానం ఇవ్వడానికి నేను సిద్ధంగా ఉన్నాను.",
                    speak: "నేను చాలా బాగున్నాను, ధన్యవాదాలు! ఈ సంస్థ గురించి మీ ప్రశ్నలకు సమాధానం ఇవ్వడానికి నేను సిద్ధంగా ఉన్నాను."
                };
            } else if (/(ధన్యవాదాలు|థాంక్యూ|థాంక్స్|సంతోషం|మంచిది|థాంక్సు)/i.test(teluguInput)) {
                return {
                    display: "స్వాగతం! మీకు సహాయం చేయడం నాకు సంతోషం. ఈ సంస్థ గురించి మీకు ఇంకా ఏమి తెలుసుకోవాలని ఉంది?",
                    speak: "స్వాగతం! మీకు సహాయం చేయడం నాకు సంతోషం. ఈ సంస్థ గురించి మీకు ఇంకా ఏమి తెలుసుకోవాలని ఉంది?"
                };
            } else if (/(లేదు|కాదు|నో|అలాగే|నో ప్రాబ్లం)/i.test(teluguInput)) {
                return {
                    display: "పర్వాలేదు! మీకు సహాయం కావలసినప్పుడల్లా నేను ఇక్కడే ఉంటాను. ఈ సంస్థ గురించి మీరు ఏదైనా అడగవచ్చు.",
                    speak: "పర్వాలేదు! మీకు సహాయం కావలసినప్పుడల్లా నేను ఇక్కడే ఉంటాను. ఈ సంస్థ గురించి మీరు ఏదైనా అడగవచ్చు."
                };
            } else if (/(అవును|అవ్|హ|హమ్మ|యస్)/i.test(teluguInput)) {
                return {
                    display: "అద్భుతం! ఈ సంస్థ గురించి మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు? మీ అన్ని ప్రశ్నలకు నేను సమాధానం ఇస్తాను.",
                    speak: "అద్భుతం! ఈ సంస్థ గురించి మీరు ఏమి తెలుసుకోవాలనుకుంటున్నారు? మీ అన్ని ప్రశ్నలకు నేను సమాధానం ఇస్తాను."
                };
            } else if (/(బాగున్నాను|ఫైన్|గుడ్|సరే|ఓకే|బాగా ఉన్నాను)/i.test(teluguInput)) {
                return {
                    display: "అది వినడానికి బాగుంది! ఈ సంస్థ గురించి నేను ఈరోజు మీకు ఎలా సహాయం చేయగలను?",
                    speak: "అది వినడానికి బాగుంది! ఈ సంస్థ గురించి నేను ఈరోజు మీకు ఎలా సహాయం చేయగలను?"
                };
            }
            
            if (teluguInput.length <= 20) {
                return {
                    display: "నమస్కారం! స్వాగతం! ఈ సంస్థ గురించి మీకు ఏమి తెలుసుకోవాలని ఉంది? నేను మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను.",
                    speak: "నమస్కారం! స్వాగతం! ఈ సంస్థ గురించి మీకు ఏమి తెలుసుకోవాలని ఉంది? నేను మీకు సహాయం చేయడానికి ఇక్కడ ఉన్నాను."
                };
            }
        }

        return {
            display: "Hello! I'm here to help you learn more about this organization. What would you like to know?",
            speak: "Hello! I'm here to help you learn more about this organization. What would you like to know?"
        };
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
        console.log('Processing user input:', input, 'Language:', this.currentLanguage);
        
        if (this.isGreeting(input)) {
            console.log('Input detected as greeting');
            this.handleGreeting(input);
            return;
        }

        console.log('Input treated as regular question');
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
        const chatContainer = document.getElementById('speechbot-chat-container');
        if (!chatContainer.classList.contains('active') || this.isHidingResponse) {
            console.log('Chat is closed - not adding speech to queue');
            return;
        }

        if (!this.synthesis && !this.prefersBackendTTSFor.en && !this.prefersBackendTTSFor.te) {
            console.warn('No speech synthesis available and backend not configured.');
            return;
        }

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

        const chatContainer = document.getElementById('speechbot-chat-container');
        if (!chatContainer.classList.contains('active') || this.isHidingResponse) {
            console.log('Chat is closed - clearing speech queue');
            this.speechQueue = [];
            this.isProcessingQueue = false;
            this.stopSpeech();
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

            if (!chatContainer.classList.contains('active') || this.isHidingResponse) {
                console.log('Chat closed during speech preparation - cancelling');
                throw new Error('Chat closed');
            }

            if (useBackend) {
                await this._speakViaBackend(text, langKey);
            } else {
                await this._speakViaBrowser(text, langKey);
            }
        } catch (err) {
            console.error('Error during speech:', err);
            
            if (!chatContainer.classList.contains('active') || this.isHidingResponse) {
                console.log('Chat closed - skipping fallback');
            } else if (useBackend && (langKey === 'te' ? this.teluguVoice : this.englishVoice)) {
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
                if (!chatContainer.classList.contains('active') || this.isHidingResponse) {
                    console.log('Chat closed - stopping speech queue processing');
                    this.speechQueue = [];
                    this.isProcessingQueue = false;
                    return;
                }

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
                utterance.rate = this.isMobile ? 1.0 : 1.1;
                utterance.pitch = 1.0;
            } else {
                utterance.rate = this.isMobile ? 0.99 : 0.95;
                utterance.pitch = 1.03;
            }
            utterance.volume = 0.95;

            utterance.onstart = () => {
                const chatContainer = document.getElementById('speechbot-chat-container');
                if (!chatContainer.classList.contains('active') || this.isHidingResponse) {
                    console.log('Chat closed during speech start - cancelling');
                    this.synthesis.cancel();
                    resolve();
                    return;
                }
                
                this.isSpeaking = true;
                this.currentUtterance = utterance;
                this.resetAutoCloseTimeout();
            };

            utterance.onend = () => {
                console.log('Browser TTS ended successfully');
                resolve();
            };

            utterance.onerror = (e) => {
                console.error('SpeechSynthesisUtterance error:', e);
                resolve();
            };

            try {
                this.synthesis.cancel();
            } catch (e) { }

            setTimeout(() => {
                const chatContainer = document.getElementById('speechbot-chat-container');
                if (!chatContainer.classList.contains('active') || this.isHidingResponse) {
                    console.log('Chat closed right before speaking - cancelling');
                    resolve();
                    return;
                }

                try {
                    this.synthesis.speak(utterance);
                } catch (err) {
                    console.error('speak() threw:', err);
                    resolve();
                }
            }, 200);
        });
    }

    async _speakViaBackend(text, langKey) {
        const langParam = langKey === 'te' ? 'te' : 'en';
        const ttsUrl = this.apiBaseUrl + this.backendTTSPath;

        try {
            const response = await fetch(ttsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text: this._preprocessTextForLanguage(text, langKey), 
                    lang: langParam 
                })
            });

            if (!response.ok) {
                throw new Error(`TTS backend returned ${response.status}`);
            }

            const blob = await response.blob();
            const audioURL = URL.createObjectURL(blob);

            await this._playAudioFromURL(audioURL);

            setTimeout(() => {
                try {
                    URL.revokeObjectURL(audioURL);
                } catch (e) {
                    console.warn('Error revoking audio URL:', e);
                }
            }, 3000);
        } catch (err) {
            console.error('Backend TTS error:', err);
            throw err;
        }
    }

    _preprocessTextForLanguage(text, langKey) {
        let t = text.trim();
        t = t.replace(/[.,;!?]+$/, '');
        
        if (this.isMobile && langKey === 'te') {
            t = t + ' ';
        }

        if (t.length > 600) {
            t = t.substring(0, 600) + '...';
        }

        return t;
    }

    _playAudioFromURL(url) {
        return new Promise((resolve, reject) => {
            const chatContainer = document.getElementById('speechbot-chat-container');
            if (!chatContainer.classList.contains('active') || this.isHidingResponse) {
                console.log('Chat closed - skipping audio playback');
                resolve();
                return;
            }

            const audio = new Audio(url);
            audio.volume = 0.95;
            
            audio.addEventListener('loadedmetadata', () => {
                console.log('Audio loaded, duration:', audio.duration);
            });
            
            audio.addEventListener('canplaythrough', () => {
                console.log('Audio can play through');
            });
            
            const checkChatClosed = () => {
                if (!chatContainer.classList.contains('active') || this.isHidingResponse) {
                    console.log('Chat closed during audio playback - stopping');
                    audio.pause();
                    audio.currentTime = 0;
                    resolve();
                }
            };
            
            const intervalId = setInterval(checkChatClosed, 500);
            
            audio.addEventListener('ended', () => {
                console.log('Audio playback ended naturally');
                clearInterval(intervalId);
                setTimeout(() => {
                    resolve();
                }, 100);
            });
            
            audio.addEventListener('error', (e) => {
                console.error('Audio playback error', e, audio.error);
                clearInterval(intervalId);
                try {
                    audio.pause();
                    audio.currentTime = 0;
                } catch (err) {
                    console.warn('Error cleaning up audio:', err);
                }
                resolve();
            });
            
            const playAudio = () => {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.then(() => {
                        console.log('Audio playback started successfully');
                    }).catch((err) => {
                        console.warn('Autoplay blocked, attempting fallback:', err);
                        clearInterval(intervalId);
                        
                        if (!chatContainer.classList.contains('active') || this.isHidingResponse) {
                            console.log('Chat closed - skipping fallback');
                            resolve();
                        } else if ((this.currentLanguage === 'te' && this.teluguVoice) || (this.currentLanguage !== 'te' && this.englishVoice)) {
                            const text = this.speechQueue[0]?.text || 'Sorry, there was an audio issue.';
                            this._speakViaBrowser(text, this.currentLanguage === 'te' ? 'te' : 'en').then(resolve).catch(resolve);
                        } else {
                            resolve();
                        }
                    });
                }
            };

            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    playAudio();
                }).catch(err => {
                    console.warn('Failed to resume audio context:', err);
                    playAudio();
                });
            } else {
                playAudio();
            }
        });
    }

    /* ---------- Post-speech actions & auto listening - FIXED ---------- */
    handlePostSpeechActions(isAnswer, isFollowUp) {
        const chatContainer = document.getElementById('speechbot-chat-container');

        if (!chatContainer.classList.contains('active') || this.isHidingResponse) {
            return;
        }

        // After answering a question, show microphone prompt but don't auto-listen
        if (isAnswer) {
            console.log('Answer completed - showing microphone prompt');
            this.showMicrophonePrompt();
            this.conversationState = 'idle';
        } else {
            // After greeting, auto-listen for the user's question
            console.log('Greeting completed - AUTO-LISTENING ENABLED');
            this.shouldBeListening = true;
            this.conversationState = 'awaiting_question';
            this.hasShownListeningMessage = false;
            
            setTimeout(() => {
                if (!this.isSpeaking && this.shouldBeListening && this.conversationState === 'awaiting_question') {
                    console.log('Auto-starting listening after greeting');
                    this.startListening();
                }
            }, 1500);
        }
    }

    showMicrophonePrompt() {
        const chatMessages = document.getElementById('chat-messages');
        const promptDiv = document.createElement('div');
        promptDiv.className = 'prompt-message';
        
        let promptText = 'Click on the microphone to ask more questions';
        if (this.currentLanguage === 'te') {
            promptText = 'మరిన్ని ప్రశ్నలు అడగడానికి మైక్రోఫోన్‌పై క్లిక్ చేయండి';
        }

        promptDiv.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#666">
                <path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14S10 13.1 10 12V4C10 2.9 10.9 2 12 2ZM18.9 11C18.4 11 18 11.4 18 11.9C18 16.3 14.4 19.8 10 19.8S2 16.3 2 11.9C2 11.4 1.6 11 1.1 11C0.6 11 0.2 11.4 0.2 11.9C0.2 17.1 4.3 21.4 9.5 21.9V23C9.5 23.6 9.9 24 10.5 24S11.5 23.6 11.5 23V21.9C16.7 21.4 20.8 17.1 20.8 11.9C20.8 11.4 20.4 11 19.9 11Z"/>
            </svg>
            ${promptText}
        `;

        chatMessages.appendChild(promptDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
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
            }, 20000000);
        }
    }

    stopSpeech() {
        if (this.synthesis) {
            try {
                this.synthesis.cancel();
            } catch (e) { }
        }
        
        this.audioElements.forEach(audio => {
            try {
                audio.pause();
                audio.currentTime = 0;
                audio.src = '';
                audio.load();
            } catch (e) { }
        });
        this.audioElements = [];
        
        this.isSpeaking = false;
        this.currentUtterance = null;
        this.speechQueue = [];
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
            } catch (error) {
                console.error('Welcome translation failed:', error);
                this.addMessage(displayMessage, 'bot');
                this.speechQueue = [];
                this.speakWithNaturalVoice(speakMessage, false);
            }
        } else {
            this.addMessage(displayMessage, 'bot');
            this.speechQueue = [];
            this.speakWithNaturalVoice(speakMessage, false);
        }
    }

    getWelcomeMessage() {
        if (!this.hasWelcomed) {
            return "Hello! I am here to help you. You can ask me any questions.";
        } else {
            return "I am listening. Please ask your question.";
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

        this.stopListening();
        this.stopSpeech();
        this.conversationState = 'idle';
        this.shouldBeListening = false;
        this.hasShownListeningMessage = false;
        this.updateSendButtonToMic(false);

        if (this.recognitionRestartTimeout) {
            clearTimeout(this.recognitionRestartTimeout);
            this.recognitionRestartTimeout = null;
        }

        if (this.autoCloseTimeout) {
            clearTimeout(this.autoCloseTimeout);
            this.autoCloseTimeout = null;
        }
    }

    sendTextMessage() {
        const textInput = document.getElementById('text-input');
        const message = textInput.value.trim();

        if (message) {
            this.addMessage(message, 'user');
            
            if (this.isGreeting(message)) {
                this.handleGreeting(message);
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
