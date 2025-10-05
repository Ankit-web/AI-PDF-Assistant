import express from 'express';
import multer from 'multer';
import documentController from '../controllers/documentController.js';
import { isLoggedIn } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Configure multer with a 20MB file size limit
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
});

// @route   POST /api/docs/upload
router.post(
    '/upload',
    isLoggedIn,
    upload.single('document'),
    documentController.uploadPdf
);

// @route   GET /api/docs/mine
router.get('/mine', isLoggedIn, documentController.getMyDocuments);

// @route   GET /api/docs/file/:documentId
router.get('/file/:documentId', isLoggedIn, documentController.getDocumentFile);

// --- THIS IS THE CRUCIAL ROUTE THAT FIXES THE 404 ERROR ---
// @route   GET /api/docs/:documentId
// @desc    Get a single document's metadata by its ID
router.get('/:documentId', isLoggedIn, documentController.getDocumentById);

// @route   DELETE /api/docs/:documentId
router.delete('/:documentId', isLoggedIn, documentController.deleteDocument);

export default router;
