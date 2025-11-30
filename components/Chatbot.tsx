import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getChatbotResponse } from '../services/geminiService';
import { ChatMessage, Contract } from '../types';
import Spinner from './shared/Spinner';
import { SpeakerIcon, MicrophoneIcon } from '../constants';

interface ChatbotProps {
  onClose: () => void;
  contracts: Contract[];
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose, contracts }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'bot', text: "Hello! I'm Astra, your AI assistant. How can I help you with your contracts today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = useCallback(async (userMessageText: string, apiPrompt: string) => {
    if (isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: userMessageText };
    // Create a snapshot of messages for the history
    const currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);
    
    // Convert message history to the format expected by Gemini API
    const history = currentMessages
      .slice(0, -1) // Exclude the message we're currently sending
      // FIX: Add explicit return type to map callback to prevent type widening on `role`.
      .map((m): { role: 'user' | 'model'; parts: { text: string }[] } => ({
          role: m.sender === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
      }));

    try {
      const responseText = await getChatbotResponse(apiPrompt, history, contracts);
      const botMessage: ChatMessage = { sender: 'bot', text: responseText };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot API error:", error);
      const errorMessage: ChatMessage = { sender: 'bot', text: "Sorry, I'm having trouble responding right now." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, messages, contracts]);
  
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
  
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript, transcript);
      };
  
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };
  
      recognition.onend = () => {
        setIsListening(false);
      };
      recognitionRef.current = recognition;
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
  }, [sendMessage]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Stop speech synthesis on component unmount
  useEffect(() => {
    return () => {
        if (window.speechSynthesis?.speaking) {
            window.speechSynthesis.cancel();
        }
        if (recognitionRef.current && isListening) {
          recognitionRef.current.stop();
        }
    };
  }, [isListening]);

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) {
        alert('Your browser does not support text-to-speech.');
        return;
    }
    window.speechSynthesis.cancel(); // Stop any other message from being spoken
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input, input);
  };

  const handleToolClick = (tool: 'correct' | 'suggest') => {
    if (!input.trim()) return;
    const currentInput = input;
    let apiPrompt = '';
    if (tool === 'correct') {
      apiPrompt = `Please correct the grammar and spelling of the following text. Only provide the corrected text without any commentary You are a legal assistant specializing in contract analysis and drafting. 
Answer the following user question clearly, concisely, and professionally. 
If the user asks about risks, clauses, or terms, provide structured and practical guidance.
Avoid disclaimers like "I am an AI". Stay professional and neutral.
:\n\n"${currentInput}"`;
    } else {
      apiPrompt = `Please provide a few alternative ways to phrase the following text (e.g., more professional, more concise  You are a legal assistant specializing in contract analysis and drafting. 
Answer the following user question clearly, concisely, and professionally. 
If the user asks about risks, clauses, or terms, provide structured and practical guidance.
Avoid disclaimers like "I am an AI". Stay professional and neutral.
):\n\n"${currentInput}"`;
    }
    sendMessage(currentInput, apiPrompt);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 lg:bottom-8 lg:right-8 w-[90vw] max-w-md h-[70vh] max-h-[600px] flex flex-col bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-50 animate-fade-in-up">
      <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-lg font-bold text-white">Astra Assistant</h2>
        <button onClick={onClose} aria-label="Close chat" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
      </header>
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'user' && (
                 <div className="max-w-[80%] p-3 rounded-lg bg-orange-600 text-white">
                  <p className="text-sm break-words">{msg.text}</p>
                </div>
              )}
              {msg.sender === 'bot' && (
                <>
                  <div className="max-w-[80%] p-3 rounded-lg bg-gray-700 text-gray-200">
                    <p className="text-sm break-words">{msg.text}</p>
                  </div>
                   <button
                    onClick={() => handleSpeak(msg.text)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-600 rounded-full transition-colors mb-1 flex-shrink-0"
                    aria-label="Listen to message"
                    title="Listen to message"
                  >
                    <SpeakerIcon />
                  </button>
                </>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] p-3 rounded-lg bg-gray-700 text-gray-200">
                <Spinner />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <footer className="p-4 border-t border-gray-700 flex-shrink-0">
        {input.trim() && !isLoading && (
          <div className="flex items-center space-x-2 mb-2">
            <button
              onClick={() => handleToolClick('correct')}
              className="flex-1 py-2 px-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors text-sm"
              aria-label="Correct text"
            >
              Correct Text
            </button>
            <button
              onClick={() => handleToolClick('suggest')}
              className="flex-1 py-2 px-3 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-md transition-colors text-sm"
              aria-label="Suggest alternatives"
            >
              Suggest Alternatives
            </button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <button
              onClick={handleToggleListening}
              disabled={!recognitionRef.current}
              className={`p-2 rounded-md transition-colors flex-shrink-0 text-white ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                  : 'bg-gray-600 hover:bg-gray-500'
              } disabled:bg-gray-700 disabled:cursor-not-allowed`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
              title={isListening ? 'Stop listening' : 'Start listening'}
            >
              <MicrophoneIcon />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isListening ? "Listening..." : "Ask Astra..."}
            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
            disabled={isLoading || isListening}
          />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-2 bg-orange-600 rounded-md hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white flex-shrink-0" aria-label="Send message">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Chatbot;