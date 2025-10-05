import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BookOpenIcon, ArrowRightOnRectangleIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

// --- CHANGE 1: Get the API URL from the environment variable ---
const API_URL = import.meta.env.VITE_API_URL;

const Navbar = ({ user, onLogout }) => {
    return (
        <nav className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <BookOpenIcon className="h-8 w-8 text-indigo-400"/>
                        <span className="text-white text-2xl font-bold ml-3">AI-PDF-Assistant</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-sm text-slate-400">Signed in as</p>
                            <p className="font-semibold truncate text-white">{user?.name}</p>
                        </div>
                        <button
                            onClick={onLogout}
                            title="Logout"
                            className="p-2 rounded-full bg-slate-700 hover:bg-red-600 text-white transition duration-200"
                        >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

const Footer = () => {
    return (
        <footer className="bg-slate-900 mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-slate-400">
                <p>&copy; 2025 AI-PDF-Assistant. All rights reserved.</p>
            </div>
        </footer>
    );
};

const MainLayout = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    // --- CHANGE 2: Use the API_URL variable ---
                    const userResponse = await axios.get(`${API_URL}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
                    setUser(userResponse.data);
                }
            } catch (error) {
                console.error("Failed to fetch user in layout", error);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar user={user} onLogout={handleLogout} />
            <main className="flex-1 w-full">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
