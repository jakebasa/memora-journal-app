import { GoogleGenAI } from '@google/genai';

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({});

// Removed automatic execution of test function on module import
// The main() function was causing API calls during server startup
// async function main() {
//     const response = await ai.models.generateContent({
//         model: 'gemini-2.5-flash',
//         contents: 'Explain how AI works in a few words',
//     });
//     // console.log(response.text);
// }

// main(); // Commented out to prevent API calls on server startup

export { ai };
