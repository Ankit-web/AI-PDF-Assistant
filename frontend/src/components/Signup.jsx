import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserIcon, AtSymbolIcon, LockClosedIcon, XMarkIcon } from '@heroicons/react/24/solid';

// --- CHANGE 1: Get the API URL from the environment variable ---
const API_URL = import.meta.env.VITE_API_URL;

const Signup = ({ isOpen, onClose, onSwitchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            // --- CHANGE 2: Use the API_URL variable in the request ---
            await axios.post(`${API_URL}/api/users/signup`, { name, email, password });
            setSuccess('Signup successful! Please log in.');
            setTimeout(() => {
                onSwitchToLogin();
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'An unexpected error occurred.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-slate-800/50 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-slate-700 w-full max-w-md relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <h2 className="text-2xl font-bold text-white text-center mb-6">Create an Account</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && <p className="bg-red-500/20 text-red-400 text-sm text-center p-3 rounded-md">{error}</p>}
                    {success && <p className="bg-green-500/20 text-green-400 text-sm text-center p-3 rounded-md">{success}</p>}
                    
                    <div className="relative">
                        <UserIcon className="h-5 w-5 text-slate-400 absolute top-3.5 left-4" />
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="pl-11 block w-full bg-slate-700/50 border-slate-600 rounded-md shadow-sm p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                        />
                    </div>

                    <div className="relative">
                        <AtSymbolIcon className="h-5 w-5 text-slate-400 absolute top-3.5 left-4" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-11 block w-full bg-slate-700/50 border-slate-600 rounded-md shadow-sm p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                        />
                    </div>
                    
                    <div className="relative">
                        <LockClosedIcon className="h-5 w-5 text-slate-400 absolute top-3.5 left-4" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-11 block w-full bg-slate-700/50 border-slate-600 rounded-md shadow-sm p-3 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 transform hover:scale-105 shadow-lg"
                    >
                        Create Account
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-6">
                    Already have an account?{' '}
                    <button onClick={onSwitchToLogin} className="font-medium text-indigo-400 hover:text-indigo-300 hover:underline bg-transparent border-none p-0">
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Signup;
