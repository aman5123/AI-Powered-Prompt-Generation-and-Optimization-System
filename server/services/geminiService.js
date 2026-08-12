import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelName = process.env.GEMINI_MODEL || 'gemini-flash-latest'; // Fallback to a real model name

const delay = (ms) => new Promise(res => setTimeout(res, ms));

async function callGeminiWithRetry(options, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await ai.models.generateContent(options);
    } catch (error) {
      if (error.status === 429 && attempt < maxRetries - 1) {
        let waitTime = 5000;
        const match = error.message && error.message.match(/retry in (\d+\.?\d*)s/);
        if (match) {
          waitTime = parseFloat(match[1]) * 1000 + 1000; // add 1s buffer
        } else {
          waitTime = 5000 * Math.pow(2, attempt);
        }
        console.warn(`Rate limit hit (429). Retrying in ${Math.round(waitTime)}ms... (Attempt ${attempt + 1} of ${maxRetries})`);
        await delay(waitTime);
      } else {
        throw error;
      }
    }
  }
}

export async function testGeminiConnection() {
  try {
    const response = await callGeminiWithRetry({
      model: modelName,
      contents: "Respond with exactly: 'API is working!'",
    });
    return { success: true, message: response.text };
  } catch (error) {
    console.error("Gemini API Test Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Analyzes, optimizes, and scores a prompt in a single call to save rate limits.
 */
export async function optimizePrompt(originalPrompt) {
  const systemInstruction = `You are an expert AI prompt engineer. Your task is to analyze, optimize, and score the user's prompt. 
You must return a valid JSON object matching this schema exactly:
{
  "analysis": {
    "objective": "string",
    "context": "string",
    "audience": "string",
    "tone": "string",
    "weaknesses": ["string"],
    "missingInformation": ["string"]
  },
  "optimizedPrompt": "string (the final optimized prompt ready to be used)",
  "improvements": ["string"],
  "assumptions": ["string"],
  "promptScores": {
    "original": number (0-100),
    "optimized": number (0-100)
  }
}

Rules:
- Preserve the user's original intent.
- Do not change the requested task.
- Improve clarity, specificity, context, structure and useful constraints.
- Calculate the score based on clarity, specificity, context, constraints, and output structure.
`;

  const response = await callGeminiWithRetry({
    model: modelName,
    contents: originalPrompt,
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  try {
    const result = JSON.parse(response.text);
    result.promptScores.improvement = result.promptScores.optimized - result.promptScores.original;
    return result;
  } catch (error) {
    console.error("Error parsing optimizePrompt response:", response.text);
    throw new Error("Failed to parse Gemini response as JSON");
  }
}

/**
 * Executes a prompt (original or optimized).
 */
export async function executePrompt(promptText) {
  const response = await callGeminiWithRetry({
    model: modelName,
    contents: promptText,
    config: {
      temperature: 0.7,
    },
  });
  return response.text;
}

/**
 * Compares two responses based on the original intent.
 */
export async function compareResponses(originalPrompt, originalResponse, optimizedResponse) {
  const prompt = `You are an AI quality evaluator. Compare two AI responses generated from the same underlying intent but different prompt formulations.
Original Intent: "${originalPrompt}"

Original Response:
"""
${originalResponse}
"""

Optimized Response:
"""
${optimizedResponse}
"""

Evaluate both responses and return a valid JSON object matching this schema:
{
  "relevance": "string (brief comparison of relevance)",
  "completeness": "string (brief comparison of completeness)",
  "structure": "string (brief comparison of structure/formatting)",
  "instructionFollowing": "string (brief comparison of how well instructions were followed)",
  "requirementCoverage": "string (brief comparison of requirement coverage)",
  "overall": "string (overall summary of which response is better and why)",
  "keyImprovements": ["string"],
  "keyWeaknesses": ["string"],
  "originalScore": number (0-100),
  "optimizedScore": number (0-100)
}
`;

  const response = await callGeminiWithRetry({
    model: modelName,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  try {
    const result = JSON.parse(response.text);
    return result;
  } catch (error) {
    console.error("Error parsing compareResponses response:", response.text);
    throw new Error("Failed to parse Gemini response as JSON");
  }
}
