
import React from 'react';
import Card from './shared/Card';

const UserGuide: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-6">User Guide</h1>
      <div className="space-y-6">
        <Card>
          <h2 className="text-2xl font-semibold mb-3 text-orange-400">Welcome to AstraLex</h2>
          <p className="text-gray-300">
            AstraLex is your AI-powered copilot for contract management. This guide will help you get started with its core features.
          </p>
        </Card>
        
        <Card>
          <h3 className="text-xl font-semibold mb-2">Dashboard</h3>
          <p className="text-gray-300">
            The central hub of your activities. Here you can see an overview of your active contracts, get reminders for upcoming deadlines, and use quick action buttons to navigate to other tools.
          </p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-2">AI Workbench</h3>
          <p className="text-gray-300">
            This is the core analysis tool.
            <br />1. <strong>Upload a .txt file</strong> or paste the text of your contract into the text area.
            <br />2. <strong>Ask a question</strong> in the prompt box (e.g., "What are the payment terms?").
            <br />3. Click <strong>Run Analysis</strong> to get an AI-powered answer based on your document.
            <br />4. Use the <strong>Assess Risk</strong> button for a high-level overview of potential legal risks.
          </p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-2">Contract Generator</h3>
          <p className="text-gray-300">
            Need a new contract? Describe your requirements in the text box. Be as specific as possible for the best results (e.g., "Draft a freelance web development agreement for a 3-month project..."). Click <strong>Generate Contract</strong> and the AI will create a template for you.
          </p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-2">Camera Scanner</h3>
          <p className="text-gray-300">
            Digitize physical documents on the fly.
            <br />1. Click <strong>Start Camera</strong> and grant permission if prompted.
            <br />2. Position your document clearly in the camera's view.
            <br />3. Click <strong>Capture & Scan</strong>. The text will be extracted using Optical Character Recognition (OCR).
          </p>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold mb-2">Global Map</h3>
          <p className="text-gray-300">
            Visualize the geographical locations of your contracts. Hover over the orange dots to see contract titles and locations. You can zoom and pan to explore the map.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default UserGuide;