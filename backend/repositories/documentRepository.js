import mongoose from 'mongoose';
import Document from '../models/documentModel.js';

/**
 * Creates a new document in the database.
 * @param {object} documentData - The data for the new document.
 * @returns {Promise<Document>} The newly created document.
 */
const createDocument = async (documentData) => {
    const document = new Document(documentData);
    return await document.save();
};

/**
 * Finds a single document by its ID.
 * @param {string} id - The ID of the document.
 * @returns {Promise<Document|null>} The found document or null.
 */
const findDocumentById = async (id) => {
    return await Document.findById(id);
};

/**
 * Finds all documents belonging to a specific owner.
 * @param {string} ownerId - The ID of the user.
 * @returns {Promise<Array<Document>>} A list of documents.
 */
const findDocumentsByOwner = async (ownerId) => {
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        console.error("Invalid owner ID provided to repository:", ownerId);
        return []; // Return an empty array if the ID is not valid
    }
    return await Document.find({ owner: new mongoose.Types.ObjectId(ownerId) });
};

/**
 * --- NEW FUNCTION ---
 * Counts the number of documents owned by a specific user.
 * @param {string} ownerId - The ID of the user.
 * @returns {Promise<number>} The total count of documents.
 */
const countDocumentsByOwner = async (ownerId) => {
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        return 0;
    }
    return await Document.countDocuments({ owner: new mongoose.Types.ObjectId(ownerId) });
};

/**
 * Finds a document by its ID and updates it with new data.
 * @param {string} id - The ID of the document to update.
 * @param {object} updateData - An object containing the fields to update.
 * @returns {Promise<Document|null>} The updated document or null.
 */
const updateDocumentById = async (id, updateData) => {
    return await Document.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * Finds and deletes a document by its ID.
 * @param {string} id - The ID of the document to delete.
 * @returns {Promise<Document|null>} The deleted document or null if not found.
 */
const deleteDocumentById = async (id) => {
    return await Document.findByIdAndDelete(id);
};

export default {
    createDocument,
    findDocumentById,
    findDocumentsByOwner,
    countDocumentsByOwner, // <-- Added the new function export
    updateDocumentById,
    deleteDocumentById,
};
