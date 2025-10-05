import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { 
    DocumentPlusIcon, TrashIcon, ExclamationTriangleIcon, 
    InformationCircleIcon, LightBulbIcon 
} from '@heroicons/react/24/outline';
import DocumentCardSkeleton from '../components/DocumentSkeleton.jsx';

// --- CHANGE 1: Get the API URL from the environment variable ---
const API_URL = import.meta.env.VITE_API_URL;

// --- Confirmation Modal Component (Unchanged) ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-xl">
                <div className="flex items-center mb-4">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3" />
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                </div>
                <p className="text-slate-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition">Cancel</button>
                    <button onClick={onConfirm} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition">Confirm Delete</button>
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [uploadMessage, setUploadMessage] = useState('');
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);

    const uploadLimitReached = documents.length >= 3;

    const fetchData = async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/');
                return;
            }
            // --- CHANGE 2: Use the API_URL variable ---
            const docsResponse = await axios.get(`${API_URL}/api/docs/mine`, { headers: { Authorization: `Bearer ${token}` } });
            setDocuments(docsResponse.data);
        } catch (err) {
            if (err.response && err.response.status === 401) {
                console.log("Token expired or invalid, logging out.");
                localStorage.removeItem('token');
                navigate('/');
            } else {
                setError('Failed to fetch data. Please try again later.');
            }
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        const isProcessing = documents.some(doc => doc.status === 'processing');
        let intervalId = null;
        if (isProcessing) {
            intervalId = setInterval(() => {
                fetchData(false);
            }, 5000);
        }
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [documents]);

    useEffect(() => {
        fetchData();
    }, []);
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileSizeLimit = 20 * 1024 * 1024;
            if (selectedFile.size > fileSizeLimit) {
                setUploadMessage('Error: File size cannot exceed 20 MB.');
                if (fileInputRef.current) { fileInputRef.current.value = null; }
                setFile(null);
                return;
            }
            setFile(selectedFile);
            setUploadMessage('');
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!file) { setUploadMessage('Please select a file first.'); return; }
        const formData = new FormData();
        formData.append('document', file);
        setUploadMessage('Uploading...');
        try {
            const token = localStorage.getItem('token');
            // --- CHANGE 3: Use the API_URL variable ---
            await axios.post(`${API_URL}/api/docs/upload`, formData, { headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` } });
            setUploadMessage('File uploaded successfully! Processing now...');
            setFile(null);
            if (fileInputRef.current) { fileInputRef.current.value = null; }
            fetchData(false);
        } catch (err) {
            const errorMessage = err.response?.data?.error || 'File upload failed. Please try again.';
            setUploadMessage(errorMessage);
        }
    };

    const openDeleteModal = (doc) => {
        setDocToDelete(doc);
        setIsModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDocToDelete(null);
        setIsModalOpen(false);
    };

    const handleDeleteConfirm = async () => {
        if (!docToDelete) return;
        try {
            const token = localStorage.getItem('token');
            // --- CHANGE 4: Use the API_URL variable ---
            await axios.delete(`${API_URL}/api/docs/${docToDelete._id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            setDocuments(docs => docs.filter(doc => doc._id !== docToDelete._id));
        } catch (err) {
            console.error("Delete failed:", err);
        } finally {
            closeDeleteModal();
        }
    };
    
    if (error) return ( <div className="p-8 text-center text-red-500">{error}</div> );

    return (
        <>
            <ConfirmationModal isOpen={isModalOpen} onClose={closeDeleteModal} onConfirm={handleDeleteConfirm} title="Delete Document" message={`Are you sure you want to permanently delete "${docToDelete?.title}"? This action cannot be undone.`} />
            
            <main className="p-4 md:p-8">
                <div className="w-full max-w-5xl mx-auto space-y-8">
                    
                    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <LightBulbIcon className="h-6 w-6 mr-2 text-yellow-400"/>
                            How to Use SMART-PDF-QA
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300 text-sm">
                            <div>
                                <h4 className="font-bold text-white mb-2">Workflow</h4>
                                <ol className="list-decimal list-inside space-y-2">
                                    <li><span className="font-semibold">Upload</span>: Add a new PDF document.</li>
                                    <li><span className="font-semibold">Process</span>: The document will be automatically processed by our AI.</li>
                                    <li><span className="font-semibold">Workspace</span>: Click 'Open Workspace' to view the PDF and use AI tools.</li>
                                    <li><span className="font-semibold">Interact</span>: Use the side panel to chat or generate a summary on-demand.</li>
                                </ol>
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-2">Current Limits</h4>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Only **PDF** files are supported.</li>
                                    <li>Maximum file size is **20 MB**.</li>
                                    <li>You can have up to **3 documents** at a time.</li>
                                    <li>Each document has a **30-message** chat limit.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <DocumentPlusIcon className="h-6 w-6 mr-2 text-indigo-400"/>
                            Upload a New PDF
                        </h3>
                        {uploadLimitReached ? (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm p-4 rounded-lg flex items-center">
                                <InformationCircleIcon className="h-5 w-5 mr-3"/>
                                You have reached your limit of 3 documents. Please delete one to upload another.
                            </div>
                        ) : (
                            <form onSubmit={handleFileUpload} className="flex flex-col sm:flex-row items-center sm:space-x-4">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-indigo-300 hover:file:bg-slate-600 transition"
                                />
                                <button type="submit" className="w-full mt-4 sm:mt-0 sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 whitespace-nowrap">
                                    Upload File
                                </button>
                            </form>
                        )}
                        {uploadMessage && <p className={`mt-3 text-sm ${uploadMessage.startsWith('Error:') || uploadMessage.includes('Failed') || uploadMessage.includes('limit') ? 'text-red-400' : 'text-gray-300'}`}>{uploadMessage}</p>}
                    </div>

                    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-4">Your Documents ({loading ? '...' : documents.length}/3)</h3>
                        
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <DocumentCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : documents.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">You haven't uploaded any documents yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {documents.map(doc => (
                                    <li key={doc._id} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 flex flex-col justify-between list-none">
                                        <div>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                                                    doc.status === 'ready' ? 'bg-green-500/20 text-green-300' :
                                                    doc.status === 'processing' ? 'bg-blue-500/20 text-blue-300' :
                                                    'bg-red-500/20 text-red-300'
                                                }`}>
                                                    {doc.status}
                                                </span>
                                                <button onClick={() => openDeleteModal(doc)} className="text-slate-400 hover:text-red-500 transition">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                            <p className="font-bold text-lg text-white break-words">{doc.title}</p>
                                        </div>
                                        <div className="mt-4">
                                            {doc.status === 'ready' && (
                                                <Link to={`/workspace/${doc._id}`} state={{ document: doc }} className="block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded text-sm transition">
                                                    Open Workspace
                                                </Link>
                                            )}
                                            {doc.status === 'processing' && (
                                                <div className="text-center text-blue-400 text-sm p-2 bg-slate-800 rounded-md">
                                                    <i>Processing...</i>
                                                </div>
                                            )}
                                             {doc.status === 'failed' && (
                                                <div className="text-center text-red-400 text-sm p-2 bg-red-800/20 rounded-md">
                                                    <i>Processing Failed</i>
                                                </div>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
};

export default Dashboard;
