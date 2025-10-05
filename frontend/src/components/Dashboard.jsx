import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Book, FileText, Loader, MessageSquare, LogOut, Trash2, Lightbulb } from 'lucide-react';

// --- CHANGE 1: Use relative URL ---
// When deployed, the frontend (Vercel) will use the VITE_API_URL from .env.production
// When running locally, it uses VITE_API_URL from .env.local
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadError, setUploadError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [docToDelete, setDocToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/');
                    return;
                }
                // --- CHANGE 2: Use the API_URL variable ---
                const docsResponse = await axios.get(`${API_URL}/api/docs/mine`, { headers: { Authorization: `Bearer ${token}` } });
                
                // ✅ FIX: Handle both array and object responses
                const docs = Array.isArray(docsResponse.data) ? docsResponse.data : (docsResponse.data.documents || []);
                setDocuments(docs);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    console.log("Token expired or invalid, logging out.");
                    localStorage.removeItem('token');
                    navigate('/');
                } else {
                    setError('Failed to fetch data. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setUploadError('');
        if (file && file.type === 'application/pdf') {
            if (file.size > 20 * 1024 * 1024) {
                setUploadError('File size exceeds 20MB limit.');
                setSelectedFile(null);
                event.target.value = null;
            } else {
                setSelectedFile(file);
            }
        } else {
            setUploadError('Only PDF files are allowed.');
            setSelectedFile(null);
            event.target.value = null;
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadError('Please select a file.');
            return;
        }

        if (documents.length >= 3) {
            setUploadError('You can only have up to 3 documents at a time.');
            return;
        }

        try {
            setUploading(true);
            setUploadError('');
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('pdf', selectedFile);
            // --- CHANGE 3: Use the API_URL variable ---
            const uploadResponse = await axios.post(`${API_URL}/api/docs/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            setDocuments([...documents, uploadResponse.data]);
            setSelectedFile(null);
            document.querySelector('input[type="file"]').value = null;
        } catch (err) {
            setUploadError(err.response?.data?.error || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        if (!docToDelete) return;
        try {
            setDeleting(true);
            const token = localStorage.getItem('token');
            // --- CHANGE 4: Use the API_URL variable ---
            await axios.delete(`${API_URL}/api/docs/${docToDelete._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDocuments(docs => docs.filter(doc => doc._id !== docToDelete._id));
            setDocToDelete(null);
        } catch (err) {
            console.error('Delete failed:', err.response?.data || err.message);
            alert('Failed to delete document. Please try again.');
        } finally {
            setDeleting(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <Loader className="animate-spin text-blue-300" size={48} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <p className="text-red-400">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div className="flex items-center space-x-3">
                        <Book className="text-blue-300" size={36} />
                        <h1 className="text-4xl font-bold text-white">AI-PDF-Assistant</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-300">Signed in as <strong className="text-white">{user?.name || 'User'}</strong></span>
                        <button onClick={handleLogout} className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition">
                            <LogOut size={18} />
                            <span>Logout</span>
                        </button>
                    </div>
                </header>

                <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl mb-8">
                    <div className="flex items-start space-x-3 mb-4">
                        <Lightbulb className="text-yellow-300 mt-1" size={24} />
                        <h2 className="text-2xl font-bold text-white">How to Use AI-PDF-Assistant</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-blue-300 mb-2">Workflow</h3>
                            <ol className="text-gray-300 space-y-1 list-decimal list-inside">
                                <li><strong>Upload:</strong> Add a new PDF document.</li>
                                <li><strong>Process:</strong> The document will be automatically processed by our AI.</li>
                                <li><strong>Workspace:</strong> Click 'Open Workspace' to view the PDF and use AI tools.</li>
                                <li><strong>Interact:</strong> Use the side panel to chat or generate a summary on-demand.</li>
                            </ol>
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-300 mb-2">Current Limits</h3>
                            <ul className="text-gray-300 space-y-1 list-disc list-inside">
                                <li>Only <strong>PDF</strong> files are supported.</li>
                                <li>Maximum file size is <strong>20 MB</strong>.</li>
                                <li>You can have up to <strong>3 documents</strong> at a time.</li>
                                <li>Each document has a <strong>30-message</strong> chat limit.</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl mb-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <FileText className="text-purple-300" size={28} />
                        <h2 className="text-3xl font-bold text-white">Upload a New PDF</h2>
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg cursor-pointer transition">
                            Choose file
                            <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                        </label>
                        <span className="text-gray-300">{selectedFile ? selectedFile.name : 'No file chosen'}</span>
                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || uploading}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition"
                        >
                            {uploading ? 'Uploading...' : 'Upload File'}
                        </button>
                    </div>
                    {uploadError && <p className="text-red-400 mt-4">{uploadError}</p>}
                </div>

                <div className="bg-slate-800/70 backdrop-blur-md border border-slate-700 rounded-2xl p-8 shadow-2xl">
                    <h2 className="text-3xl font-bold text-white mb-6">Your Documents ({documents.length}/3)</h2>
                    <div>
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 animate-pulse">
                                        <div className="h-6 bg-slate-600 rounded mb-3"></div>
                                        <div className="h-4 bg-slate-600 rounded mb-2"></div>
                                        <div className="h-10 bg-slate-600 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : !Array.isArray(documents) || documents.length === 0 ? (
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
                                                    'bg-yellow-500/20 text-yellow-300'
                                                }`}>
                                                    {doc.status === 'ready' ? 'Ready' : doc.status === 'processing' ? 'Processing...' : 'Pending'}
                                                </span>
                                                <button
                                                    onClick={() => setDocToDelete(doc)}
                                                    className="text-red-400 hover:text-red-300 transition"
                                                    title="Delete document"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                            <h3 className="text-white font-semibold mb-2 truncate">{doc.originalName}</h3>
                                            <p className="text-gray-400 text-sm mb-1">Pages: {doc.pageCount || 'N/A'}</p>
                                            <p className="text-gray-400 text-sm">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/workspace/${doc._id}`)}
                                            disabled={doc.status !== 'ready'}
                                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition"
                                        >
                                            <MessageSquare size={18} />
                                            <span>Open Workspace</span>
                                        </button>
                                    </li>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {docToDelete && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md mx-4">
                        <h2 className="text-2xl font-bold text-white mb-4">Confirm Deletion</h2>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete <strong className="text-white">{docToDelete.originalName}</strong>?
                            This action cannot be undone.
                        </p>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => setDocToDelete(null)}
                                disabled={deleting}
                                className="flex-1 bg-slate-700 hover:bg-slate-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
