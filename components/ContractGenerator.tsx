
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { generateContractStream } from '../services/geminiService';
import Spinner from './shared/Spinner';
import Card from './shared/Card';

// Add type definition for the jsPDF library loaded from CDN
declare global {
  interface Window {
    jspdf: any;
  }
}


const ContractGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Generate a simple Non-Disclosure Agreement (NDA) between "Party A" and "Party B" regarding confidential business plans. The governing law should be California.');
  const [generatedContract, setGeneratedContract] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);

  const handleGenerate = useCallback(async () => {
    if (!prompt) {
      setError('Please provide instructions for the contract.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedContract('');
    try {
      await generateContractStream(prompt, (chunk) => {
        setGeneratedContract((prev) => prev + chunk);
      });
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred during generation.');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  const handleSaveAsPdf = useCallback(() => {
    if (!generatedContract) return;

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
    
    const lines = doc.splitTextToSize(generatedContract, usableWidth);
    
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

    doc.save('generated-contract.pdf');
  }, [generatedContract]);

  useEffect(() => {
    if (resultContainerRef.current) {
      resultContainerRef.current.scrollTop = resultContainerRef.current.scrollHeight;
    }
  }, [generatedContract]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-6">Contract Generator</h1>
      <Card>
        <div className="flex flex-col space-y-4">
          <label htmlFor="contract-prompt" className="block text-lg font-semibold text-gray-200">
            Describe the contract you need
          </label>
          <textarea
            id="contract-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Generate a freelance graphic design contract for a logo project..."
            rows={6}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
            disabled={isLoading}
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt}
            className="self-start py-2 px-6 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? <Spinner /> : 'Generate Contract'}
          </button>
        </div>
      </Card>

      {(isLoading || generatedContract || error) && (
        <Card className="mt-6">
           <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Generated Document</h2>
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => navigator.clipboard.writeText(generatedContract)}
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-opacity disabled:opacity-50"
                    disabled={isLoading || !generatedContract}
                >
                    Copy Text
                </button>
                <button
                    onClick={handleSaveAsPdf}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-opacity disabled:opacity-50"
                    disabled={isLoading || !generatedContract}
                >
                    Save as PDF
                </button>
            </div>
          </div>
          {error && <p className="text-red-400">{error}</p>}
           <div ref={resultContainerRef} className="max-h-[60vh] overflow-y-auto bg-gray-800/50 p-4 rounded-md border border-gray-700">
            <pre className="whitespace-pre-wrap text-gray-300 font-sans">
              {generatedContract}
              {isLoading && <span className="inline-block w-2 h-4 bg-white animate-pulse ml-1" aria-hidden="true"></span>}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ContractGenerator;