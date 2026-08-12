import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModel(modelName) {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Hello",
    });
    console.log(`Success with ${modelName}:`, response.text);
  } catch (e) {
    console.error(`Error with ${modelName}:`, e.message);
  }
}

async function run() {
  await testModel('gemini-flash-latest');
  await testModel('gemini-3.5-flash');
}
run();
