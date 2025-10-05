import { HfInference } from '@huggingface/inference';
import axios from 'axios';

// === HUGGING FACE SETUP (for Embeddings) ===
const hf = new HfInference(process.env.HF_TOKEN);
const EMBEDDING_MODEL = 'BAAI/bge-base-en-v1.5';

// === OPENROUTER SETUP (for Chat & Summarization) ===
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const CHAT_AND_SUMMARIZATION_MODEL = 'mistralai/mistral-7b-instruct';


const summarizeText = async (textToSummarize) => {
    try {
        const response = await axios.post(
            OPENROUTER_API_URL,
            {
                model: CHAT_AND_SUMMARIZATION_MODEL,
                messages: [{ role: "user", content: `Provide a concise summary of the following text:\n\n${textToSummarize.slice(0, 15000)}` }], // Truncate for safety
            },
            { headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` } }
        );
        const summary = response.data.choices[0]?.message?.content;
        if (!summary) throw new Error('Summary not found in API response.');
        return summary.trim();
    } catch (error) {
        console.error('OpenRouter Summarization API Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to summarize text.');
    }
};

const generateEmbeddings = async (textChunks) => {
    try {
        // Using the reliable, official Hugging Face library
        const vectors = await hf.featureExtraction({
            model: EMBEDDING_MODEL,
            inputs: textChunks,
        });
        return vectors;
    } catch (error) {
        console.error('Hugging Face Embedding API Error:', error);
        throw new Error('Failed to generate embeddings.');
    }
};

const getChatCompletion = async (messages, context) => {
    // --- THIS IS THE UPDATED PROMPT ---
    const systemPrompt = {
        role: "system",
        content: `You are a helpful AI study assistant. Your task is to answer the user's question based only on the context provided. If the answer is not in the context, say "I could not find an answer in the document." Format your entire response using Markdown. Use headings, lists, and bold text to make the information clear and easy to read.\n\nContext:\n${context}`
    };

    const lastTenMessages = messages.slice(-10);
    const finalMessages = [systemPrompt, ...lastTenMessages];

    try {
        const response = await axios.post(
            OPENROUTER_API_URL,
            {
                model: CHAT_AND_SUMMARIZATION_MODEL,
                messages: finalMessages,
            },
            { headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` } }
        );
        const answer = response.data.choices[0]?.message?.content;
        if (!answer) return "The AI could not generate an answer. Please try again.";
        return answer.trim();
    } catch (error) {
        console.error('OpenRouter Chat API Error:', error.response ? error.response.data : error.message);
        throw new Error('Failed to get chat completion.');
    }
};

export default {
    summarizeText,
    generateEmbeddings,
    getChatCompletion,
};
