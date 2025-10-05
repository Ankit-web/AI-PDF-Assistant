import React, { useState } from 'react';
import { BookOpenIcon, DocumentArrowUpIcon, ChatBubbleLeftRightIcon, BoltIcon } from '@heroicons/react/24/outline';
import Login from './Login';
import Signup from './Signup';

// Reusable Navbar Component
const Navbar = ({ onLoginClick, onSignupClick }) => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-20 bg-slate-900/50 backdrop-blur-sm border-b border-slate-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <BookOpenIcon className="h-8 w-8 text-indigo-400" />
                        <span className="text-white text-2xl font-bold ml-3">SMART-PDF-QA</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={onLoginClick} className="text-slate-300 hover:text-white transition">Login</button>
                        <button onClick={onSignupClick} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition">
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

// Reusable Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
    return (
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 text-center">
            <div className="bg-indigo-500/10 rounded-full p-3 w-max mx-auto mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400">{description}</p>
        </div>
    );
};

// Reusable Footer Component
const Footer = () => {
    return (
        <footer className="bg-slate-900 mt-20">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-slate-400">
                <p>&copy; 2025 SMART-PDF-QA. All rights reserved.</p>
            </div>
        </footer>
    );
};


const LandingPage = () => {
    const [isLoginOpen, setLoginOpen] = useState(false);
    const [isSignupOpen, setSignupOpen] = useState(false);

    return (
        <div className="text-white">
            {/* Render Login and Signup Modals */}
            <Login isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} onSwitchToSignup={() => { setLoginOpen(false); setSignupOpen(true); }} />
            <Signup isOpen={isSignupOpen} onClose={() => setSignupOpen(false)} onSwitchToLogin={() => { setSignupOpen(false); setLoginOpen(true); }} />

            <Navbar onLoginClick={() => setLoginOpen(true)} onSignupClick={() => setSignupOpen(true)} />

            <main className="pt-16">
                {/* Hero Section */}
                <section className="text-center py-20 md:py-32 px-4">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
                        Unlock the Knowledge in Your Documents
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-300">
                        DocuMind uses AI to help you summarize, chat with, and understand your PDFs faster than ever before.
                    </p>
                    <button 
                        onClick={() => setSignupOpen(true)}
                        className="mt-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg text-lg"
                    >
                        Get Started for Free
                    </button>
                </section>

                {/* Features Section */}
                <section className="max-w-5xl mx-auto px-4 py-16">
                    <h2 className="text-3xl font-bold text-center text-white mb-12">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard 
                            icon={<DocumentArrowUpIcon className="h-8 w-8 text-indigo-400" />}
                            title="1. Upload Your PDF"
                            description="Easily upload any PDF document. Our system securely processes your file and prepares it for analysis."
                        />
                        <FeatureCard 
                            icon={<BoltIcon className="h-8 w-8 text-indigo-400" />}
                            title="2. Get Instant Insights"
                            description="Generate a concise, AI-powered summary to quickly grasp the main points of your document."
                        />
                        <FeatureCard 
                            icon={<ChatBubbleLeftRightIcon className="h-8 w-8 text-indigo-400" />}
                            title="3. Chat with Your Document"
                            description="Ask specific questions and get accurate, context-aware answers directly from your document's content."
                        />
                    </div>
                </section>
            </main>
            
            <Footer />
        </div>
    );
};

export default LandingPage;
