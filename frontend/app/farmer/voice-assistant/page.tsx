'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Languages, HelpCircle } from 'lucide-react';
import { useLanguage } from '@/components/shared/LanguageContext';

export default function VoiceAssistant() {
  const { language, t } = useLanguage();
  const [voiceLang, setVoiceLang] = useState<'Tamil' | 'English' | 'Hindi'>('English');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', text: 'Vanakkam! I am your SmartAg voice assistant. Ask me questions about mandi prices, harvest grouping, or weather alerts.' }
  ]);
  const [typingInput, setTypingInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);

  // Sync voice assistant language selection with app language
  useEffect(() => {
    if (language === 'ta') setVoiceLang('Tamil');
    else if (language === 'hi') setVoiceLang('Hindi');
    else setVoiceLang('English');
  }, [language]);

  // Setup Web Speech Recognition and Synthesis
  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        
        rec.onstart = () => setIsListening(true);
        rec.onend = () => setIsListening(false);
        rec.onerror = () => setIsListening(false);
        rec.onresult = (e: any) => {
          const text = e.results[0][0].transcript;
          setTranscript(text);
          sendMessage(text);
        };
        recognitionRef.current = rec;
      }
    }
  }, []);

  // Set SpeechRecognition locale lang attribute
  useEffect(() => {
    if (recognitionRef.current) {
      if (voiceLang === 'Tamil') recognitionRef.current.lang = 'ta-IN';
      else if (voiceLang === 'Hindi') recognitionRef.current.lang = 'hi-IN';
      else recognitionRef.current.lang = 'en-IN';
    }
  }, [voiceLang]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition API not supported or active in this browser. Please use text input field.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    
    // Stop any current voice output
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (voiceLang === 'Tamil') utterance.lang = 'ta-IN';
    else if (voiceLang === 'Hindi') utterance.lang = 'hi-IN';
    else utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text }]);
    setTypingInput('');

    try {
      const token = localStorage.getItem('smartag_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/ai/voice-chat`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          message: text,
          language: voiceLang,
          context: `
[FULL WEBSITE DATA CONTEXT]
- Farmer Profile: Active
- Primary Crops: 🍅 Tomato (400kg, Quality A), Onion (200kg)
- Mandi Prices (Madurai): Tomato ₹22/kg, Onion ₹35/kg
- FPO Logistics: Nearest FPO Collection Point is 12km away. Group Selling offers ₹27/kg for Tomatoes.
- Weather Alerts: Heavy Rain Expected in next 48 hours (90% Precipitation Risk).
- AI Recommendations: Harvest Tomatoes immediately due to rain alert and transport to FPO shelter.
          `
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', text: data.response_text }]);
        speakText(data.response_text);
      } else {
        throw new Error('API Error');
      }
    } catch (e) {
      // Mock fallback message responses
      let reply = "";
      if (voiceLang === 'Tamil') {
        reply = "தக்காளி விலை இப்போது சந்தையில் ₹22 ஆக உள்ளது. FPO-வில் இணைந்தால் உங்களுக்கு ₹27 கிடைக்கும்.";
      } else if (voiceLang === 'Hindi') {
        reply = "टमाटर की मंडी दर ₹22 प्रति किलो है। FPO समूह में शामिल होने पर ₹27 प्रति किलो मिलेगा।";
      } else {
        reply = "Mandi 🍅 tomato prices are Rs. 22 per kg. Joining the FPO group gives Rs. 27 per kg. We recommend joining FPO Group A.";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      speakText(reply);
    }
  };

  const handlePresetQuestion = (q: string) => {
    sendMessage(q);
  };

  const presetChips = {
    Tamil: ['நான் என்ன விற்கணும்?', 'விலை எங்கு அதிகம்?', 'மழை எப்போது வரும்?'],
    English: ['Where should I sell?', 'Is there a rain alert?', 'What is the Tomato price?'],
    Hindi: ['मुझे क्या करना चाहिए?', 'टमाटर का भाव क्या है?', 'बारिश कब होगी?']
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-6 h-[calc(100vh-140px)] justify-between">
      
      {/* Top controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-3 shrink-0 bg-card/80 backdrop-blur-md p-6 rounded-3xl border border-border shadow-sm bg-card/80 backdrop-blur-md px-6 py-4 rounded-3xl border border-border inline-block shadow-sm">
        <div>
          <h1 className="text-2xl font-serif font-black text-green-900 flex items-center gap-2">
            AI Voice Assistant
          </h1>
          <p className="text-xs text-muted-foreground">
            Ask agricultural queries using voice command in your regional language.
          </p>
        </div>

        {/* Assistant Language toggle */}
        <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-lg">
          <Languages className="w-4 h-4 text-green-800" />
          <select 
            value={voiceLang} 
            onChange={(e) => setVoiceLang(e.target.value as any)}
            className="text-xs font-bold text-green-800 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="Tamil">Tamil 🇮🇳</option>
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
          </select>
        </div>
      </div>

      {/* History scroll section */}
      <div className="flex-1 overflow-y-auto bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col gap-4 max-h-[360px] my-2">
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            className={`flex max-w-[80%] flex-col gap-1 p-3.5 rounded-xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-green-800 text-primary-foreground self-end' : 'bg-surface text-foreground self-start'}`}
          >
            <span className="text-[9px] font-bold opacity-60 uppercase">{m.role}</span>
            <div className="whitespace-pre-wrap">{m.text}</div>
          </div>
        ))}
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-2 shrink-0">
        {presetChips[voiceLang].map((q, idx) => (
          <button
            key={idx}
            onClick={() => handlePresetQuestion(q)}
            className="bg-card hover:bg-muted border border-border text-[10px] font-bold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5 text-green-800" />
            <span>{q}</span>
          </button>
        ))}
      </div>

      {/* Microphone interface */}
      <div className="bg-card border border-border p-5 rounded-xl flex items-center gap-4 shrink-0 shadow-sm">
        
        {/* Pulsing Mic Button */}
        <button
          onClick={toggleListening}
          className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-green-800 text-primary-foreground hover:bg-green-700'}`}
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Text fallback input */}
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(typingInput); }}
          className="flex-1 flex gap-2"
        >
          <input
            type="text"
            placeholder={isListening ? 'Listening to your voice...' : 'Type your question or use mic...'}
            value={isListening ? transcript : typingInput}
            onChange={(e) => setTypingInput(e.target.value)}
            disabled={isListening}
            className="flex-1 text-xs font-semibold bg-surface border border-border p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-800 text-foreground disabled:bg-muted disabled:text-muted-foreground"
          />
          <button
            type="submit"
            disabled={isListening || !typingInput.trim()}
            className="bg-amber-400 hover:bg-amber-500 text-green-950 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Speaks overlay indicator */}
        {isSpeaking && (
          <div className="flex items-center gap-1.5 bg-amber-400/20 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-bold shrink-0">
            <Volume2 className="w-4 h-4 animate-bounce" />
            <span>Speaking...</span>
          </div>
        )}
      </div>

    </div>
  );
}
