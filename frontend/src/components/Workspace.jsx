import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
    PaperAirplaneIcon,
    InformationCircleIcon,
    DocumentTextIcon,
    BoltIcon,
    MagnifyingGlassPlusIcon,
    MagnifyingGlassMinusIcon,
    ClipboardDocumentIcon,
    CpuChipIcon,
    ChatBubbleLeftEllipsisIcon,
    SparklesIcon
} from '@heroicons/react/24/solid';
import { Document, Page, pdfjs } from 'react-pdf';
import ReactMarkdown from 'react-markdown';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import TextareaAutosize from 'react-textarea-autosize';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// --- CHANGE 1: Get the API URL from the environment variable ---
const API_URL = import.meta.env.VITE_API_URL;

const pdfTextLayerFix = `
.react-pdf__Page__textContent {
  color: transparent !important;
  background: transparent !important;
  mix-blend-mode: multiply !important;
  -webkit-text-fill-color: transparent !important;
}
.react-pdf__Page__textContent span {
  background: transparent !important;
  color: transparent !important;
}
`;

const darkPanelTextFix = `
.summary-panel, .chat-panel {
  color: #f5f5f5;
}
.summary-panel p,
.summary-panel span,
.summary-panel li,
.chat-panel p,
.chat-panel span,
.chat-panel li {
  color: #f5f5f5 !important;
}
`;

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

const Avatar = ({ role, userName }) => {
    const getInitials = (name) => {
        if (!name) return 'U';
        const names = name.split(' ');
        if (names.length > 1 && names[1]) {
            return `${names[0][0]}${names[1][0]}`.toUpperCase();
        }
        return name[0].toUpperCase();
    };

    if (role === 'assistant') {
        return (
            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center">
                <CpuChipIcon className="h-5 w-5 text-indigo-400" />
            </div>
        );
    }

    return (
        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-sm">
            {getInitials(userName)}
        </div>
    );
};

const SelectionPopup = ({ selection, onAsk }) => {
    if (!selection.text) return null;

    return (
        <div
            className="fixed z-30"
            style={{ top: `${selection.position.y}px`, left: `${selection.position.x}px` }}
        >
            <button
                onClick={() => onAsk(selection.text)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg flex items-center space-x-2 transition transform hover:scale-105"
            >
                <SparklesIcon className="h-5 w-5" />
                <span>Ask about this</span>
            </button>
        </div>
    );
};

const Workspace = () => {
    const { documentId } = useParams();
    const location = useLocation();
    const documentData = location.state?.document;

    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('pdf');
    const [summary, setSummary] = useState(documentData?.summary || '');
    const [isSummaryLoading, setSummaryLoading] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const CHAT_LIMIT = 30;
    const [remainingMessages, setRemainingMessages] = useState(
        CHAT_LIMIT - (documentData?.chatMessageCount || 0)
    );
    const chatEndRef = useRef(null);
    const [numPages, setNumPages] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [pdfError, setPdfError] = useState('');
    const [pdfScale, setPdfScale] = useState(1.0);
    const [selection, setSelection] = useState({ text: '', position: { x: 0, y: 0 } });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                // --- CHANGE 2: Use the API_URL variable for all requests ---
                const [userResponse, pdfResponse] = await Promise.all([
                    axios.get(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } }),
                    axios.get(`${API_URL}/api/docs/file/${documentId}`, { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' })
                ]);
                setUser(userResponse.data);
                setPdfFile(pdfResponse.data);
                setPdfError('');
            } catch (err) {
                console.error('Failed to fetch initial data', err);
                setPdfError('Could not load document data.');
            }
        };
        if (documentId) fetchData();
    }, [documentId]);

    const handleMouseUp = (e) => {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length > 10) {
            setSelection({
                text: selectedText,
                position: { x: e.clientX + 10, y: e.clientY - 50 }
            });
        } else {
            setSelection({ text: '', position: { x: 0, y: 0 } });
        }
    };

    const handleAskAboutSelection = (selectedText) => {
        setInput(`Explain this selected text in more detail:\n\n"${selectedText}"`);
        setSelection({ text: '', position: { x: 0, y: 0 } });
    };

    const handleGenerateSummary = async () => {
        if (isSummaryLoading) return;
        setSummaryLoading(true);
        try {
            const token = localStorage.getItem('token');
            // --- CHANGE 3: Use the API_URL variable ---
            const response = await axios.post(
                `${API_URL}/api/ai/summarize/${documentId}`,
                null,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSummary(response.data.summary);
        } catch (err) {
            console.error("Failed to generate summary:", err); 
            setSummary('Failed to generate summary.');
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading || remainingMessages <= 0) return;

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newUserMessage = { role: 'user', content: input, timestamp };

        const updatedMessages = [...messages, newUserMessage];
        setMessages(updatedMessages);
        setInput('');
        setIsLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            // --- CHANGE 4: Use the API_URL variable ---
            const response = await axios.post(
                `${API_URL}/api/ai/chat/${documentId}`,
                { messages: updatedMessages.map(({ role, content }) => ({ role, content })) },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const assistantTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const newAssistantMessage = {
                role: 'assistant',
                content: response.data.answer,
                timestamp: assistantTimestamp
            };
            setMessages([...updatedMessages, newAssistantMessage]);
            setRemainingMessages((prev) => prev - 1);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to get a response.');
            setMessages(messages);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);
    const zoomIn = () => setPdfScale((prev) => prev + 0.2);
    const zoomOut = () => setPdfScale((prev) => (prev > 0.6 ? prev - 0.2 : prev));
    const limitReached = remainingMessages <= 0;

    return (
        <>
            <SelectionPopup selection={selection} onAsk={handleAskAboutSelection} />
            <div className="p-4 md:p-8 h-[calc(100vh-4rem)]">
                <style>{pdfTextLayerFix + darkPanelTextFix}</style>
                
                <PanelGroup direction="horizontal" className="max-w-7xl mx-auto h-full">
                    <Panel defaultSize={50} minSize={30}>
                        <div className="summary-panel bg-slate-800/50 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-slate-700 flex flex-col h-full">
                            <div className="flex justify-between items-center border-b border-slate-700 mb-4">
                                <div className="flex">
                                    <button
                                        onClick={() => setActiveTab('pdf')}
                                        className={`py-3 px-4 text-sm font-semibold flex items-center ${activeTab === 'pdf' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}
                                    >
                                        <DocumentTextIcon className="h-5 w-5 mr-2" /> PDF File
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('summary')}
                                        className={`py-3 px-4 text-sm font-semibold flex items-center ${activeTab === 'summary' ? 'text-white border-b-2 border-indigo-500' : 'text-slate-400'}`}
                                    >
                                        <BoltIcon className="h-5 w-5 mr-2" /> Summary
                                    </button>
                                </div>
                                {activeTab === 'pdf' && (
                                    <div className="flex items-center space-x-2 pr-2">
                                        <button onClick={zoomOut} className="p-2 rounded-full hover:bg-slate-700 transition">
                                            <MagnifyingGlassMinusIcon className="h-5 w-5" />
                                        </button>
                                        <button onClick={zoomIn} className="p-2 rounded-full hover:bg-slate-700 transition">
                                            <MagnifyingGlassPlusIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                            {activeTab === 'pdf' && (
                                <div className="flex-1 overflow-y-auto p-2" onMouseUp={handleMouseUp}>
                                    {pdfFile ? (
                                        <Document
                                            file={pdfFile}
                                            onLoadSuccess={onDocumentLoadSuccess}
                                            onLoadError={(err) => setPdfError(`Error loading PDF: ${err.message}`)}
                                            loading={<div className="text-slate-400 flex justify-center items-center h-full">Loading PDF...</div>}
                                        >
                                            {Array.from({ length: numPages || 0 }, (_, index) => (
                                                <Page
                                                    key={`page_${index + 1}`}
                                                    pageNumber={index + 1}
                                                    scale={pdfScale}
                                                    renderTextLayer
                                                    renderAnnotationLayer
                                                />
                                            ))}
                                        </Document>
                                    ) : (
                                        <div className="text-slate-400 flex justify-center items-center h-full">{pdfError || 'Loading PDF...'}</div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'summary' && (
                                <div className="flex-1 overflow-y-auto p-4">
                                    {summary ? (
                                        <div className="prose prose-invert prose-sm max-w-none"><ReactMarkdown>{summary}</ReactMarkdown></div>
                                    ) : (
                                        <div className="text-center">
                                            <button
                                                onClick={handleGenerateSummary}
                                                disabled={isSummaryLoading}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition disabled:opacity-50"
                                            >
                                                {isSummaryLoading ? 'Generating...' : 'Generate Summary'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Panel>

                    <PanelResizeHandle className="w-4 flex items-center justify-center">
                        <div className="w-1 h-10 bg-slate-600 rounded-full"></div>
                    </PanelResizeHandle>

                    <Panel defaultSize={50} minSize={30}>
                        <div className="chat-panel bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-700 flex flex-col h-full">
                            <div className="flex justify-between items-center border-b border-slate-700 p-4">
                                <h3 className="text-lg font-semibold flex items-center"><ChatBubbleLeftEllipsisIcon className="h-6 w-6 mr-2 text-indigo-400" /> Chat</h3>
                                <div className="text-sm text-slate-400">
                                    Messages Left: <span className="font-bold text-white">{remainingMessages > 0 ? remainingMessages : 0}</span> / {CHAT_LIMIT}
                                </div>
                            </div>
                            <main className="flex-1 p-6 overflow-y-auto">
                                <div className="w-full max-w-3xl mx-auto space-y-8">
                                    {messages.length === 0 && !isLoading && (
                                        <div className="text-center text-slate-400 mt-10 p-6 bg-slate-800/30 rounded-lg">
                                            <p>Ask your first question about this document to get started.</p>
                                        </div>
                                    )}
                                    {messages.map((msg, index) => (
                                        <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'assistant' && <Avatar role="assistant" />}
                                            <div className={`group relative max-w-xl p-4 rounded-2xl shadow-md ${msg.role === 'user' ? 'bg-indigo-600 rounded-br-lg' : 'bg-slate-700 rounded-bl-lg'}`}>
                                                <div className="prose prose-invert prose-sm max-w-none break-words"><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                                                <div className="text-xs text-slate-400 mt-2 text-right">{msg.timestamp}</div>
                                                {msg.role === 'assistant' && (
                                                    <button
                                                        onClick={() => handleCopy(msg.content)}
                                                        className="absolute -top-2 -right-2 p-1 bg-slate-600 rounded-full text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Copy text"
                                                    >
                                                        <ClipboardDocumentIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            {msg.role === 'user' && <Avatar role="user" userName={user?.name} />}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex items-start gap-3 justify-start">
                                            <Avatar role="assistant" />
                                            <div className="max-w-lg p-4 rounded-2xl bg-slate-700 rounded-bl-lg animate-pulse">
                                                <div className="h-2 bg-slate-600 rounded w-24"></div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>
                            </main>
                            <footer className="p-4 border-t border-slate-700">
                                {limitReached ? (
                                    <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm p-4 rounded-lg flex items-center justify-center">
                                        <InformationCircleIcon className="h-5 w-5 mr-3" />You have reached the message limit for this document.
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendMessage} className="w-full max-w-3xl mx-auto flex items-start space-x-4 relative">
                                        {error && (<p className="text-red-500 text-sm absolute -top-6">{error}</p>)}
                                        
                                        <TextareaAutosize
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Ask a question about your document..."
                                            className="flex-1 bg-slate-700/50 border-slate-600 rounded-lg p-3 resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
                                            disabled={isLoading || limitReached}
                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                                            minRows={1}
                                            maxRows={5}
                                            maxLength={4000}
                                        />

                                        <button
                                            type="submit"
                                            className="bg-indigo-600 p-3 rounded-full hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition transform hover:scale-110 flex-shrink-0"
                                            disabled={isLoading || !input.trim() || limitReached}
                                        >
                                            <PaperAirplaneIcon className="h-6 w-6" />
                                        </button>
                                    </form>
                                )}
                            </footer>
                        </div>
                    </Panel>
                </PanelGroup>
            </div>
        </>
    );
};

export default Workspace;
