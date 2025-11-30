
import React, { useState, useCallback } from 'react';
import { analyzeText, assessRisk } from '../services/geminiService';
import Spinner from './shared/Spinner';
import Card from './shared/Card';
import RiskAnalysisResult from './shared/RiskAnalysisResult';

// Add type definition for the jsPDF library loaded from CDN
declare global {
  interface Window {
    jspdf: any;
  }
}

const AIWorkbench: React.FC = () => {
  const [documentText, setDocumentText] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<'general' | 'risk' | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if(file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setDocumentText(e.target?.result as string);
          setFileName(file.name);
          setError(null);
        };
        reader.readAsText(file);
      } else {
        setError('Please upload a valid .txt file.');
        setDocumentText('');
        setFileName('');
      }
    }
  };
  
  const handleAnalysis = useCallback(async () => {
    if (!prompt || !documentText) {
      setError('Please upload a document and enter a prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResponse('');
    setAnalysisType('general');
    try {
      const result = await analyzeText(prompt, documentText);
      setResponse(result);
    } catch (e) {
      setError('An unexpected error occurred during analysis.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt, documentText]);

  const handleRiskAssessment = useCallback(async () => {
    if (!documentText) {
        setError('Please upload a document to assess risk.');
        return;
    }
    setIsLoading(true);
    setError(null);
    setResponse('');
    setAnalysisType('risk');
    try {
        const result = await assessRisk(documentText);
        setResponse(result);
    } catch (e) {
        setError('An unexpected error occurred during risk assessment.');
    } finally {
        setIsLoading(false);
    }
  }, [documentText]);

  const handleSaveAsPdf = useCallback(() => {
    if (!response) return;

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
    
    const lines = doc.splitTextToSize(response, usableWidth);
    
    let cursorY = margin;
    const lineHeight = 5; // in mm

    lines.forEach((line: string) => {
      // Check if adding the next line would exceed the page height
      if (cursorY + lineHeight > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        cursorY = margin;
      }
      doc.text(line, margin, cursorY);
      cursorY += lineHeight;
    });

    doc.save('ai-workbench-result.pdf');
  }, [response]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-6">AI Workbench</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">1. Load Contract</h2>
          <div className="flex flex-col space-y-4">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300">
              Upload Document (.txt)
            </label>
            <input id="file-upload" type="file" accept=".txt" onChange={handleFileChange} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-500/20 file:text-orange-400 hover:file:bg-orange-500/30"/>
            {fileName && <p className="text-sm text-green-400">Loaded: {fileName}</p>}
            <textarea
              value={documentText}
              onChange={(e) => setDocumentText(e.target.value)}
              placeholder="Or paste contract text here..."
              rows={10}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold mb-4">2. Analyze & Assess</h2>
           <div className="flex flex-col space-y-4">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask a question about the contract... (e.g., 'What is the liability cap?')"
              rows={4}
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
            <button
              onClick={handleAnalysis}
              disabled={isLoading || !documentText || !prompt}
              className="w-full py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center"
            >
              {isLoading ? <Spinner /> : 'Run Analysis'}
            </button>
            <button
                onClick={handleRiskAssessment}
                disabled={isLoading || !documentText}
                className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center"
            >
                {isLoading ? <Spinner /> : 'Assess Risk'}
            </button>
          </div>
        </Card>
      </div>
      
      {(isLoading || response || error) && (
        <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
          {error && <p className="text-red-400">{error}</p>}
          {response && (
             <div>
                <div className="float-right mb-2 flex items-center space-x-2">
                    <button
                        onClick={() => navigator.clipboard.writeText(response)}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium"
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
                <div className="clear-both pt-2">
                  {analysisType === 'risk' ? (
                    <RiskAnalysisResult resultText={response} />
                  ) : (
                    <pre className="whitespace-pre-wrap bg-gray-800/50 p-4 rounded-md text-gray-300 font-sans">{response}</pre>
                  )}
                </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AIWorkbench;