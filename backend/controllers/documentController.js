import documentService from '../services/documentService.js';
// Make sure this path is correct for your project structure
import Document from '../models/documentModel.js'; 

/**
 * Document Controller
 */

const uploadPdf = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided.' });
        }
        const user = req.user;
        const newDocument = await documentService.handlePdfUpload(req.file, user);
        res.status(201).json({
            message: 'File uploaded and processed successfully!',
            document: newDocument,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getMyDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const documents = await documentService.getDocumentsForUser(userId);
        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve documents.' });
    }
};

const getDocumentFile = async (req, res) => {
    try {
        const { documentId } = req.params;
        const user = req.user;
        const fileBuffer = await documentService.getDocumentFileById(documentId, user);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${documentId}.pdf"`);
        res.send(fileBuffer);
    } catch (error) {
        console.error('Error in getDocumentFile controller:', error.message);
        if (error.message.includes('Not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

const deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const user = req.user;
        await documentService.deleteDocumentById(documentId, user);
        res.status(200).json({ message: 'Document deleted successfully.' });
    } catch (error) {
        console.error('Error in deleteDocument controller:', error.message);
        if (error.message.includes('Not found')) {
            return res.status(404).json({ error: error.message });
        }
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};

// --- THIS IS THE NEW FUNCTION THAT HANDLES THE ROUTE ---
const getDocumentById = async (req, res) => {
    try {
        const document = await Document.findOne({ 
            _id: req.params.documentId, 
            user: req.user.id 
        });

        if (!document) {
            return res.status(404).json({ msg: 'Document not found' });
        }
        res.json(document);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Document not found' });
        }
        res.status(500).send('Server Error');
    }
};

export default {
    uploadPdf,
    getMyDocuments,
    getDocumentFile,
    deleteDocument,
    getDocumentById, // <-- Export the new function
};
