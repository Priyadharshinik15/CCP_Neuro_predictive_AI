import React, { useState, useCallback, useEffect } from 'react';
import Card from './Card';
import Spinner from './Spinner';
import { translateText } from '../../services/geminiService';
import { SpeakerIcon } from '../../constants';

declare global {
  interface Window {
    jspdf: any;
  }
}

interface TranslationModalProps {
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh', name: 'Mandarin Chinese' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mr', name: 'Marathi' },
];

const TranslationModal: React.FC<TranslationModalProps> = ({ onClose }) => {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Stop speech synthesis on component unmount
    return () => {
      if (window.speechSynthesis?.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleTranslate = useCallback(async () => {
    if (!sourceText) {
      setError('Please enter text to translate.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setTranslatedText('');
    try {
      const languageName = LANGUAGES.find(l => l.code === targetLanguage)?.name || 'the selected language';
      const result = await translateText(sourceText, languageName);
      setTranslatedText(result);
    } catch (e) {
      setError('An unexpected error occurred during translation.');
    } finally {
      setIsLoading(false);
    }
  }, [sourceText, targetLanguage]);
  
  const handleSpeak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
        alert('Your browser does not support text-to-speech.');
        return;
    }
    window.speechSynthesis.cancel(); // Always stop previous speech first

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set language for better pronunciation
    const lang = LANGUAGES.find(l => l.code === targetLanguage);
    if (lang) {
        utterance.lang = lang.code;
    }

    window.speechSynthesis.speak(utterance);
  }, [targetLanguage]);

  const handleSaveAsPdf = useCallback(() => {
    if (!translatedText) return;

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const margin = 15;
    const usableWidth = doc.internal.pageSize.getWidth() - margin * 2;
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    
    const lines = doc.splitTextToSize(translatedText, usableWidth);
    
    let cursorY = margin;
    const lineHeight = 5; // in mm

    lines.forEach((line: string) => {
      if (cursorY + lineHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    doc.save('translated-text.pdf');
  }, [translatedText]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="translation-modal-title"
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] animate-fade-in px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl"
        onClick={e => e.stopPropagation()}
      >
        <Card className="bg-gray-800 border-gray-600 max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h2 id="translation-modal-title" className="text-2xl font-bold text-white">Translate Text</h2>
            <button onClick={onClose} aria-label="Close" className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
          </div>
          
          <div className="flex-grow overflow-y-auto pr-2">
            <div className="space-y-4">
              <div>
                <label htmlFor="source-text" className="block text-sm font-medium text-gray-300 mb-1">Text to Translate</label>
                <textarea
                  id="source-text"
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Enter or paste text here..."
                  rows={6}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>
              
              <div>
                <label htmlFor="target-language" className="block text-sm font-medium text-gray-300 mb-1">Translate To</label>
                <select
                  id="target-language"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                >
                  {LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code}>{lang.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleTranslate}
                disabled={isLoading || !sourceText}
                className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isLoading ? <Spinner /> : 'Translate'}
              </button>

              {(isLoading || translatedText || error) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-200 mb-2 mt-4">Result</h3>
                  {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                  {error && <p className="text-red-400">{error}</p>}
                  {translatedText && (
                    <div>
                      <div className="float-right mb-2 flex items-center space-x-2">
                        <button
                          onClick={() => handleSpeak(translatedText)}
                          className="p-2 bg-gray-600 hover:bg-gray-500 rounded-full text-sm font-medium"
                          title="Listen to translated text"
                          aria-label="Listen to translated text"
                        >
                          <SpeakerIcon />
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(translatedText)}
                          className="px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-medium"
                        >
                          Copy Text
                        </button>
                        <button
                          onClick={handleSaveAsPdf}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium"
                        >
                          Save as PDF
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap bg-gray-900/50 p-4 rounded-md text-gray-300 font-sans clear-both">{translatedText}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TranslationModal;