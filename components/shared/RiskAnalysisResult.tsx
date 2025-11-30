import React from 'react';
import { CheckCircleIcon, AlertTriangleIcon, AlertOctagonIcon } from '../../constants';
import Card from './Card';

interface RiskAnalysisResultProps {
  resultText: string;
}

const riskLevels = {
  high: {
    icon: <AlertOctagonIcon />,
    bgColor: 'bg-red-900/50',
    textColor: 'text-red-300',
    borderColor: 'border-red-500/50',
    title: 'High Risk',
  },
  medium: {
    icon: <AlertTriangleIcon />,
    bgColor: 'bg-yellow-900/50',
    textColor: 'text-yellow-300',
    borderColor: 'border-yellow-500/50',
    title: 'Medium Risk',
  },
  low: {
    icon: <CheckCircleIcon />,
    bgColor: 'bg-green-900/50',
    textColor: 'text-green-300',
    borderColor: 'border-green-500/50',
    title: 'Low Risk',
  },
};

const RiskAnalysisResult: React.FC<RiskAnalysisResultProps> = ({ resultText }) => {
  const parsedSections = React.useMemo(() => {
    const sections: { level: 'low' | 'medium' | 'high'; content: string }[] = [];
    let summary = '';
    
    // Regex to find risk sections, case-insensitive, looking for multiline content
    const regex = /^\s*(High|Medium|Low)\s*Risk:?\s*([\s\S]*?)(?=\n\s*(High|Medium|Low)\s*Risk:?|$)/gim;

    let match;
    let lastIndex = 0;
    
    const textBeforeFirstMatch = resultText.split(regex)[0] || '';
    if(textBeforeFirstMatch.trim()) {
        summary = textBeforeFirstMatch.trim();
    }

    while ((match = regex.exec(resultText)) !== null) {
      const level = match[1].toLowerCase() as 'low' | 'medium' | 'high';
      const content = match[2].trim();
      if(content) sections.push({ level, content });
      lastIndex = match.index + match[0].length;
    }

    // If no sections were found via regex, treat the whole text as a summary
    if (sections.length === 0 && !summary) {
      summary = resultText.trim();
    } else {
        // Capture any text after the last match as part of the summary.
        const remainingText = resultText.substring(lastIndex).trim();
        if(remainingText && !summary) summary = remainingText;
    }


    // Sort sections: High > Medium > Low
    sections.sort((a, b) => {
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.level] - order[b.level];
    });

    return { summary, sections };
  }, [resultText]);

  return (
    <div className="space-y-4 font-sans">
      {parsedSections.summary && (
        <Card className="bg-gray-800/50">
          <h3 className="text-lg font-semibold text-gray-200 mb-2">Summary</h3>
          <p className="whitespace-pre-wrap text-gray-300">{parsedSections.summary}</p>
        </Card>
      )}
      {parsedSections.sections.map(({ level, content }, index) => {
        const config = riskLevels[level];
        return (
          <details key={index} className={`border ${config.borderColor} rounded-lg overflow-hidden`} open>
            <summary className={`flex items-center gap-3 p-3 cursor-pointer ${config.bgColor} hover:bg-opacity-75`}>
              <span className={config.textColor}>{config.icon}</span>
              <h3 className={`text-lg font-semibold ${config.textColor}`}>{config.title}</h3>
            </summary>
            <div className={`${config.bgColor} bg-opacity-50 p-4`}>
                <p className="whitespace-pre-wrap text-gray-300">{content}</p>
            </div>
          </details>
        );
      })}
    </div>
  );
};

export default RiskAnalysisResult;
