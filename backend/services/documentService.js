import documentRepository from '../repositories/documentRepository.js';
import aiService from './aiService.js';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const handlePdfUpload = async (file, user) => {
    if (!file) throw new Error('No file uploaded.');

    const documentCount = await documentRepository.countDocumentsByOwner(user.id);
    if (documentCount >= 3) {
        throw new Error("Upload limit reached. You can only have a maximum of 3 documents.");
    }

    const tempFilePath = path.join('temp', `${Date.now()}-${file.originalname}`);
    try {
        await fs.mkdir('temp', { recursive: true });
        await fs.writeFile(tempFilePath, file.buffer);
        const pythonProcess = spawn('python', ['./utils/pdf_extractor.py', tempFilePath]);
        let extractedText = '', errorText = '';
        for await (const chunk of pythonProcess.stdout) { extractedText += chunk.toString('utf-8'); }
        for await (const chunk of pythonProcess.stderr) { errorText += chunk.toString('utf-8'); }
        const exitCode = await new Promise((resolve) => pythonProcess.on('close', resolve));
        if (exitCode !== 0) throw new Error(`Python script failed: ${errorText}`);
        
        if (!extractedText || extractedText.trim().length < 50) {
            throw new Error("This PDF contains no text or the content is too short to process.");
        }

        const documentData = {
            title: file.originalname,
            originalContent: extractedText,
            fileBuffer: file.buffer,
            sourceType: 'pdf',
            owner: user.id,
            status: 'processing',
        };
        
        const newDocument = await documentRepository.createDocument(documentData);

        createEmbeddingsInBackground(newDocument._id, user);

        return newDocument;

    } catch (error) {
        console.error("Error in handlePdfUpload:", error);
        throw new Error(error.message || 'Failed to process the PDF file.');
    } finally {
        try { await fs.unlink(tempFilePath); } catch (e) { /* ignore cleanup error */ }
    }
};

// --- THIS IS THE MISSING FUNCTION ---
/**
 * Retrieves a document file buffer and performs ownership check.
 */
const getDocumentFileById = async (documentId, user) => {
    const document = await documentRepository.findDocumentById(documentId);
    if (!document) {
        throw new Error('Document not found.');
    }
    if (document.owner.toString() !== user.id.toString()) {
        throw new Error('Forbidden: You do not have permission to access this file.');
    }
    if (!document.fileBuffer) {
        throw new Error('File data not found for this document.');
    }
    return document.fileBuffer;
};

const createEmbeddingsInBackground = async (documentId, user) => {
    try {
        console.log(`[Background Job] Starting embedding generation for doc: ${documentId}`);
        const document = await documentRepository.findDocumentById(documentId);
        if (!document || document.owner.toString() !== user.id.toString()) {
            throw new Error('Document not found or permission denied for background processing.');
        }

        const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
        const textChunks = await splitter.splitText(document.originalContent);
        if (textChunks.length === 0) throw new Error('Document has no content to process.');

        const vectors = await aiService.generateEmbeddings(textChunks);
        const embeddings = textChunks.map((chunk, index) => ({ chunk: chunk, vector: vectors[index] }));
        
        await documentRepository.updateDocumentById(documentId, { embeddings, status: 'ready' });
        console.log(`[Background Job] Successfully completed embedding generation for doc: ${documentId}`);

    } catch (error) {
        console.error(`[Background Job] FAILED embedding generation for doc: ${documentId}`, error);
        await documentRepository.updateDocumentById(documentId, { status: 'failed' });
    }
};

const triggerCreateEmbeddings = async (documentId, user) => {
    // This function is now effectively deprecated but kept for potential future use
};

const summarizeDocumentById = async (documentId, user) => {
    const document = await documentRepository.findDocumentById(documentId);
    if (!document) { throw new Error('Document not found.'); }
    if (document.owner.toString() !== user.id.toString()) throw new Error('Forbidden.');
    
    const textToSummarize = document.originalContent.slice(0, 15000);
    const summary = await aiService.summarizeText(textToSummarize);
    documentRepository.updateDocumentById(documentId, { summary: summary });
    return summary;
};

const chatWithDocument = async (documentId, messages, user) => {
    const document = await documentRepository.findDocumentById(documentId);
    if (!document || document.embeddings.length === 0) throw new Error('Document not ready for chat.');
    if (document.owner.toString() !== user.id.toString()) throw new Error('Forbidden.');
    
    const CHAT_LIMIT = 30;
    if (document.chatMessageCount >= CHAT_LIMIT) {
        throw new Error(`Chat limit of ${CHAT_LIMIT} messages reached.`);
    }

    const latestUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!latestUserMessage) throw new Error("No user message found.");
    const question = latestUserMessage.content;
    const questionVector = (await aiService.generateEmbeddings([question]))[0];
    
    // Cosine Similarity logic can be inlined or kept as a helper
    const cosineSimilarity = (vecA, vecB) => {
        let dotProduct = 0.0, normA = 0.0, normB = 0.0;
        for (let i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }
        if (normA === 0 || normB === 0) return 0;
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    };

    const similarities = document.embeddings.map(emb => ({
        chunk: emb.chunk,
        similarity: cosineSimilarity(questionVector, emb.vector)
    }));
    similarities.sort((a, b) => b.similarity - a.similarity);
    const context = similarities.slice(0, 3).map(s => s.chunk).join('\n\n');
    
    const answer = await aiService.getChatCompletion(messages, context);

    await documentRepository.updateDocumentById(documentId, { $inc: { chatMessageCount: 1 } });
    return answer;
};

const getDocumentsForUser = async (userId) => {
    return await documentRepository.findDocumentsByOwner(userId);
};

const deleteDocumentById = async (documentId, user) => {
    const document = await documentRepository.findDocumentById(documentId);
    if (!document) {
        throw new Error('Document not found.');
    }
    if (document.owner.toString() !== user.id.toString()) {
        throw new Error('Forbidden.');
    }
    await documentRepository.deleteDocumentById(documentId);
    return document;
};

export default {
    handlePdfUpload,
    getDocumentFileById, // <-- Add the new function to the exports
    summarizeDocumentById,
    getDocumentsForUser,
    triggerCreateEmbeddings,
    chatWithDocument,
    deleteDocumentById,
};
