import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserIcon, AtSymbolIcon, LockClosedIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { API_BASE_URL } from '../config.js';

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
            await axios.post(`${API_BASE_URL}/api/users/signup`, { name, email, password });
            setSuccess('Signup successful! Redirecting...');
            setTimeout(() => {
                onClose();
                onSwitchToLogin();
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-md p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold text-white text-center mb-6">Create an Account</h2>
                {error && <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded text-red-300 text-sm">{error}</div>}
                {success && <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 rounded text-green-300 text-sm">{success}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>
                    <div className="relative">
                        <AtSymbolIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>
                    <div className="relative">
                        <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
                    >
                        Create Account
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-400 text-sm">
                    Already have an account?{' '}
                    <button onClick={onSwitchToLogin} className="text-blue-400 hover:underline">
                        Login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Signup;
