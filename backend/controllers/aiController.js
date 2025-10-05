import documentService from '../services/documentService.js';

const summarizeDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const user = req.user;
        // This service function now returns only the summary string.
        const summary = await documentService.summarizeDocumentById(documentId, user);
        res.status(200).json({ summary });
    } catch (error) {
        console.error('Error in summarizeDocument controller:', error.message);
        if (error.message.includes('Not found')) {
            return res.status(404).json({ error: error.message });
        }
        if (error.message.includes('Forbidden')) {
            return res.status(403).json({ error: error.message });
        }
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

/**
 * Handles the request to chat with a document.
 */
const chat = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { messages } = req.body;
        const user = req.user;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages array is required.' });
        }

        const answer = await documentService.chatWithDocument(documentId, messages, user);
        res.status(200).json({ answer });

    } catch (error) {
        console.error('Error in chat controller:', error.message);
        // Pass the specific error message from the service to the frontend
        res.status(400).json({ error: error.message });
    }
};

export default {
    summarizeDocument,
    chat,
};
