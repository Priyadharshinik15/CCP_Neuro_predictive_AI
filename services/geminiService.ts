import { Contract } from '../types';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyAXSPTgdmxoQsx6yC0SdYjEUOuGvXv-8Hg" });

const mockApiResponse = async (text: string): Promise<string> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(text);
        }, 1500);
    });
};

export const analyzeText = async (prompt: string, documentText: string): Promise<string> => {
  const response = `Based on your prompt "${prompt}", here's a mock analysis of the document:\n\nThe document appears to be a standard service agreement. The liability clause seems reasonable, and the payment terms are clearly defined. This is a mocked response from the frontend.`;
  return mockApiResponse(response);
};

export const generateContractStream = async (prompt: string, onChunk: (chunk: string) => void) => {
    try {
        const fullPrompt = `Generate a formal, comprehensive, and legally-styled contract based on the following user request. The output should be only the contract text itself, without any introductory phrases like "Here is the contract you requested:". The contract should be well-formatted with clear sections (e.g., PARTIES, RECITALS, SCOPE OF SERVICES, PAYMENT TERMS, TERM AND TERMINATION, CONFIDENTIALITY, INTELLECTUAL PROPERTY, LIMITATION OF LIABILITY, GOVERNING LAW, ENTIRE AGREEMENT, SIGNATURES)You are a legal assistant specializing in contract analysis and drafting. 
Answer the following user question clearly, concisely, and professionally. 
If the user asks about risks, clauses, or terms, provide structured and practical guidance.
Avoid disclaimers like "I am an AI". Stay professional and neutral.
.

User Request: "${prompt}"`;
        
        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
        });

        for await (const chunk of response) {
            onChunk(chunk.text);
        }
    } catch (error) {
        console.error("Error generating contract stream:", error);
        if (error instanceof Error && error.message.includes('API key')) {
             throw new Error("Failed to generate contract. Please ensure your API key is correctly configured.");
        }
        throw new Error("An error occurred while generating the contract. Please try again.");
    }
};

export const performOcr = async (imageBase64: string, mimeType: string): Promise<string> => {
  const response = `[Mock OCR Result]\n\nThis is text extracted from the scanned image.\n- Point one from the document.\n- Another important detail.\n- End of scanned text.`;
  return mockApiResponse(response);
};

export const assessRisk = async (documentText: string): Promise<string> => {
  const response = `
    High Risk:
    - The indemnification clause (Section 8.2) is broad and could expose the company to significant liability. It should be revised to be mutual and capped.
    - Termination for convenience clause is missing for our side.

    Medium Risk:
    - The payment terms (Section 4.1) are Net 60, which could impact cash flow. Suggest negotiating for Net 30.
    
    Low Risk:
    - Confidentiality provisions (Section 6) are standard and appear adequate.
    - Governing law and jurisdiction are appropriate.
  `;
  return mockApiResponse(response);
};

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  try {
    const prompt = `Translate the following English text to ${targetLanguage}. Provide only the translated text, without any additional explanations, introductory phrases, or quotation marks.

Text to translate:
"${text}"`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error translating text:", error);
    if (error instanceof Error && error.message.includes('API key')) {
         throw new Error("Failed to translate text. Please ensure your API key is correctly configured.");
    }
    throw new Error("An error occurred during translation. Please try again.");
  }
};

export const getChatbotResponse = async (
  message: string, 
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  contracts: Contract[]
): Promise<string> => {
    const lowerCaseMessage = message.toLowerCase();

    // Handle "Correct Text" tool
    if (lowerCaseMessage.startsWith('please correct the grammar')) {
        const textToCorrectMatch = message.match(/"([^"]*)"/);
        const textToCorrect = textToCorrectMatch ? textToCorrectMatch[1] : '';
        const correctedText = `(Mock Correction) Here is the corrected text: "${textToCorrect.split('').reverse().join('')}"`;
        return mockApiResponse(correctedText);
    }
    
    // Handle "Suggest Alternatives" tool
    if (lowerCaseMessage.startsWith('please provide a few alternative ways')) {
        const textToRephraseMatch = message.match(/"([^"]*)"/);
        const textToRephrase = textToRephraseMatch ? textToRephraseMatch[1] : '';
        const suggestions = `Of course! Here are a few alternatives for "${textToRephrase}":\n\n1. (More Formal) This is a more formal mock suggestion.\n2. (More Concise) This is a shorter mock version.\n3. (More Casual) This is a casual alternative.`;
        return mockApiResponse(suggestions);
    }

    const findContractsByLocation = (location: string): Contract[] => {
        return contracts.filter(c => c.location.name.toLowerCase().includes(location));
    };

    if (lowerCaseMessage.includes('india')) {
        const indianContracts = findContractsByLocation('india');
        if (indianContracts.length > 0) {
            const contractTitles = indianContracts.map(c => `- ${c.title}`).join('\n');
            return mockApiResponse(`I found the following contracts in India:\n${contractTitles}`);
        }
        return mockApiResponse("I couldn't find any contracts located in India.");
    }

    if (lowerCaseMessage.includes('usa') || lowerCaseMessage.includes('united states')) {
        const usaContracts = findContractsByLocation('usa');
        if (usaContracts.length > 0) {
            const contractTitles = usaContracts.map(c => `- ${c.title}`).join('\n');
            return mockApiResponse(`I found the following contracts in the USA:\n${contractTitles}`);
        }
        return mockApiResponse("I couldn't find any contracts located in the USA.");
    }

    if (lowerCaseMessage.includes('list') && lowerCaseMessage.includes('all') || lowerCaseMessage.includes('global')) {
        if (contracts.length > 0) {
            const contractTitles = contracts.map(c => `- ${c.title} (${c.location.name})`).join('\n');
            return mockApiResponse(`Here are all the contracts available globally:\n${contractTitles}`);
        }
        return mockApiResponse("There are no contracts to list at the moment.");
    }
    
    const responses = [
        "That's an interesting question. Based on my mock data, the standard procedure is to consult with the legal team.",
        "I'm a mock assistant, but I can tell you that your query has been noted. For a real contract, please seek professional advice.",
        `Regarding your message about '${message}', I've found a mock precedent in the system. It suggests a risk level of 'medium'.`,
        "Thank you for your input. I am processing this mock request and will provide a simulated answer shortly."
    ];
    return mockApiResponse(responses[Math.floor(Math.random() * responses.length)]);
};