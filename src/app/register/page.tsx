'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { createClient } from '../../supabase/clients/client';
import bcrypt from 'bcryptjs';
import { termsOfService, privacyPolicy } from '../../legal/legal-contents';
import { useRouter } from 'next/navigation';
import { useToast } from '../../components/ui/ToastProvider';

// Convert RegisterForm to accept onSuccess callback
interface RegisterFormProps {
    agree: boolean;
    setAgree: (v: boolean) => void;
    openModal: (type: 'terms' | 'policy') => void;
}

// Convert RegisterForm to function component for easier hook usage
function RegisterForm({ agree, setAgree, openModal }: RegisterFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [usernameLength, setUsernameLength] = useState(0);
    const [passMatch, setPassMatch] = useState(true);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
    const [checkingUsername, setCheckingUsername] = useState(false);
    const usernameRef = React.useRef<HTMLInputElement>(null);
    const passwordRef = React.useRef<HTMLInputElement>(null);
    const confirmPasswordRef = React.useRef<HTMLInputElement>(null);
    const router = useRouter();
    const { showToast } = useToast();
    const usernameCheckTimeout = React.useRef<NodeJS.Timeout | null>(null);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setUsernameError(null);
        setPasswordError(null);
        setConfirmPasswordError(null);
        const username = usernameRef.current?.value?.trim();
        const password = passwordRef.current?.value;
        const confirmPassword = confirmPasswordRef.current?.value;
        const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;
        let hasError = false;
        if (!username) {
            setUsernameError('Username is required.');
            hasError = true;
        } else if (!usernameRegex.test(username)) {
            setUsernameError('Username must be 4-20 characters, letters, numbers, or underscores only.');
            hasError = true;
        }
        if (!password) {
            setPasswordError('Password is required.');
            hasError = true;
        } else if (password.length < 6 || password.length > 32) {
            setPasswordError('Password must be 6-32 characters.');
            hasError = true;
        }
        if (!confirmPassword) {
            setConfirmPasswordError('Please confirm your password.');
            hasError = true;
        } else if (password !== confirmPassword) {
            setConfirmPasswordError('Passwords do not match.');
            hasError = true;
        }
        if (hasError) {
            setLoading(false);
            showToast('Please fix the errors in the form.', 'error');
            return;
        }
        try {
            const client = createClient();
            const { data: existing } = await client
                .from('users')
                .select('id')
                .eq('username', username)
                .maybeSingle();
            if (existing) {
                setLoading(false);
                setUsernameError('Username already taken.');
                showToast('Username already taken.', 'error');
                return;
            }
            const password_hash = await bcrypt.hash(password || '', 10);
            const { error: regError } = await client.from('users').insert({ username, password_hash });
            if (regError) {
                setLoading(false);
                setError(regError.message || 'Registration failed. Please try again.');
                showToast(regError.message || 'Registration failed. Please try again.', 'error');
                return;
            }
            setLoading(false);
            showToast('Registration successful! You can now log in.', 'success', 7000); // 7 seconds
            setTimeout(() => {
                router.push('/login');
            }, 2000); // 2 seconds delay before redirect
            if (usernameRef.current) usernameRef.current.value = '';
            if (passwordRef.current) passwordRef.current.value = '';
            if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
        } catch (err) {
            setLoading(false);
            setError('Unexpected error. Please try again.');
            showToast('Unexpected error. Please try again.', 'error');
        }
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsernameLength(e.target.value.length);
        setUsernameError(null);
        const username = e.target.value.trim();
        if (usernameCheckTimeout.current) clearTimeout(usernameCheckTimeout.current);
        if (!username || username.length < 4) return;
        setCheckingUsername(true);
        usernameCheckTimeout.current = setTimeout(async () => {
            const client = createClient();
            const { data: existing } = await client
                .from('users')
                .select('id')
                .eq('username', username)
                .maybeSingle();
            setCheckingUsername(false);
            if (existing) {
                setUsernameError('Username already taken.');
                showToast('Username already taken.', 'error');
            }
        }, 400);
    };
    const handlePasswordBlur = () => {
        const password = passwordRef.current?.value || '';
        const confirmPassword = confirmPasswordRef.current?.value || '';
        if (confirmPassword.length > 0) {
            setPassMatch(password === confirmPassword);
        }
    };
    const handleConfirmPasswordBlur = () => {
        const password = passwordRef.current?.value || '';
        const confirmPassword = confirmPasswordRef.current?.value || '';
        setPassMatch(password === confirmPassword);
    };

    return (
        <>
            <form className="w-full max-w-md flex flex-col gap-4" onSubmit={handleRegister}>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-400 mt-1 mb-2">* Indicates required field</div>
                    </div>
                    <label htmlFor="username" className="text-white font-semibold flex items-center gap-2">
                        <span className="inline-block"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4Z" /></svg></span>
                        Username<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            id="username"
                            placeholder="Username"
                            name="username"
                            required
                            minLength={4}
                            maxLength={20}
                            pattern="[a-zA-Z0-9_]+"
                            className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-cvsu-yellow shadow pr-16"
                            ref={usernameRef}
                            onChange={handleUsernameChange}
                            autoComplete="off"
                        />
                        {checkingUsername && (
                            <span className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-yellow-500 animate-pulse">Checking...</span>
                        )}
                        <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${usernameLength > 20 ? 'text-red-500' : 'text-gray-400'}`}>{usernameLength}/20</span>
                    </div>
                    {usernameError && <div className="text-red-500 text-xs font-semibold mt-1 ml-1">{usernameError}</div>}
                </div>
                <div className="flex flex-col gap-1 relative">
                    <label htmlFor="password" className="text-white font-semibold flex items-center gap-2">
                        <span className="inline-block"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 1 0-8 0v4h8Z" /></svg></span>
                        Password<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input type={showPassword ? 'text' : 'password'} id="password" placeholder="Password" name="password" required minLength={6} maxLength={32} className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-cvsu-yellow shadow pr-10" ref={passwordRef} onBlur={handlePasswordBlur} />
                    <button type="button" tabIndex={-1} className="absolute right-3 top-8 text-gray-600 hover:text-green-700 transition-colors duration-150 rounded-full p-1 bg-transparent" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                        {showPassword ? (
                            <Image src="/icons/hide_password.png" alt="Hide password" width={22} height={22} className="transition-transform duration-150 hover:scale-105" />
                        ) : (
                            <Image src="/icons/show_password.png" alt="Show password" width={22} height={22} className="transition-transform duration-150 hover:scale-105" />
                        )}
                    </button>
                    {passwordError && <div className="text-red-500 text-xs font-semibold mt-1 ml-1">{passwordError}</div>}
                </div>
                <div className="flex flex-col gap-1 relative">
                    <label htmlFor="confirmPassword" className="text-white font-semibold flex items-center gap-2">
                        <span className="inline-block"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 1 0-8 0v4h8Z" /></svg></span>
                        Confirm Password<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            id="confirmPassword"
                            placeholder="Confirm Password"
                            name="confirmPassword"
                            required
                            minLength={6}
                            maxLength={32}
                            className={`w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-cvsu-yellow shadow pr-10 ${!passMatch ? 'border-2 border-red-500' : ''}`}
                            ref={confirmPasswordRef}
                            onBlur={handleConfirmPasswordBlur}
                            aria-invalid={!passMatch}
                            aria-describedby={!passMatch ? 'password-match-error' : undefined}
                        />
                        <button type="button" tabIndex={-1} className="absolute right-3 top-1 text-gray-600 hover:text-green-700 transition-colors duration-150 rounded-full p-1 bg-transparent" onClick={() => setShowConfirmPassword(v => !v)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                            {showConfirmPassword ? (
                                <Image src="/icons/hide_password.png" alt="Hide password" width={22} height={22} className="transition-transform duration-150 hover:scale-105" />
                            ) : (
                                <Image src="/icons/show_password.png" alt="Show password" width={22} height={22} className="transition-transform duration-150 hover:scale-105" />
                            )}
                        </button>
                        {!passMatch && (
                            <div id="password-match-error" className="absolute left-0 -bottom-7 flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded px-2 py-1 shadow animate-fadein">
                                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9Zm-9 4h.01" /></svg>
                                Passwords do not match
                            </div>
                        )}
                    </div>
                    {confirmPasswordError && <div className="text-red-500 text-xs font-semibold mt-1 ml-1">{confirmPasswordError}</div>}
                </div>
                {/* General error (e.g. Supabase error) */}
                {error && <div className="text-red-500 text-sm text-center font-semibold mt-2">{error}</div>}
                <button type="submit" className="w-full mt-2 bg-green-600 text-white font-bold py-2 rounded-full shadow hover:bg-green-600/60 transition disabled:opacity-60" disabled={!agree || loading}>{loading ? 'Registering...' : 'Register'}</button>
            </form>
            <div className="flex flex-col items-center mt-4">
                <div className="flex flex-row items-center gap-3">
                    <div className="flex flex-col items-center">
                        <span className="text-white text-xs font-bold">Already have an account?</span>
                        <Link href="/login" className="text-green-400 font-semibold text-sm hover:underline mt-1">Login</Link>
                    </div>
                    <span className="block w-px h-10 bg-white/40 mx-2 rounded-full" />
                    <div className="flex flex-col items-center">
                        <span className="text-white text-xs font-bold">Just browsing?</span>
                        <Link href="/home" className="text-green-400 font-semibold text-sm hover:underline mt-1">Continue as Guest</Link>
                    </div>
                </div>
            </div>
            <form className="w-full mt-4" action="#" method="POST" onSubmit={e => { e.preventDefault(); }}>
                <div className="flex items-center justify-center">
                    <input
                        type="checkbox"
                        id="agree"
                        name="agree"
                        required
                        checked={agree}
                        onChange={e => {
                            if (!agree) {
                                openModal('terms');
                            } else {
                                setAgree(false);
                            }
                        }}
                        className="mr-2 accent-cvsu-yellow scale-125 focus:ring-2 focus:ring-cvsu-yellow focus:outline-none transition duration-150"
                    />
                    <label htmlFor="agree" className="text-white text-xs select-none">
                        I agree to the{' '}
                        <span
                            className="underline underline-offset-2 decoration-cvsu-yellow text-white hover:text-cvsu-yellow font-semibold cursor-pointer transition-colors duration-150"
                            onClick={e => { e.preventDefault(); openModal('terms'); }}
                            tabIndex={0}
                            role="button"
                            aria-label="View Terms of Service"
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal('terms'); } }}
                        >
                            Terms of Service
                        </span>
                        {' '}and{' '}
                        <span
                            className="underline underline-offset-2 decoration-cvsu-yellow text-white hover:text-cvsu-yellow font-semibold cursor-pointer transition-colors duration-150"
                            onClick={e => { e.preventDefault(); openModal('policy'); }}
                            tabIndex={0}
                            role="button"
                            aria-label="View Privacy Policy"
                            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal('policy'); } }}
                        >
                            Privacy Policy
                        </span>.
                    </label>
                </div>
            </form>
        </>
    );
}

// Restore Modal component for legal content display, matching the style and behavior of the login page modal. Remove the custom modal logic and use the class-based Modal component for consistency.
class Modal extends React.Component<{ open: boolean; onClose: () => void; title: string; content: React.ReactNode; onAgree?: () => void }> {
    render() {
        const { open, onClose, title, content, onAgree } = this.props;
        if (!open) return null;
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 relative animate-fadein-up">
                    <h3 className="text-xl font-bold mb-4 text-green-700">{title}</h3>
                    <div className="prose max-h-96 overflow-y-auto text-gray-800 mb-6">{content}</div>
                    <div className="flex justify-end gap-2">
                        <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Close</button>
                        {onAgree && <button onClick={onAgree} className="px-4 py-2 rounded bg-cvsu-yellow text-green-900 font-bold hover:bg-yellow-400">Agree</button>}
                    </div>
                </div>
            </div>
        );
    }
}

export default function RegisterPage() {
    const [agree, setAgree] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [modalTitle, setModalTitle] = useState('');
    const [modalStep, setModalStep] = useState<'none' | 'terms' | 'privacy'>('none');
    const router = useRouter();

    function openModal(type: 'terms' | 'policy') {
        if (type === 'terms') {
            setModalTitle('Terms of Service');
            setModalContent(termsOfService);
            setModalStep('terms');
        } else if (type === 'policy') {
            setModalTitle('Privacy Policy');
            setModalContent(privacyPolicy);
            setModalStep('privacy');
        }
        setModalOpen(true);
    }

    function handleAgree() {
        if (modalStep === 'terms') {
            setModalTitle('Privacy Policy');
            setModalContent(privacyPolicy);
            setModalStep('privacy');
        } else if (modalStep === 'privacy') {
            setAgree(true);
            setModalOpen(false);
            setModalStep('none');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('/images/login-bg.png')] bg-cover bg-center">
            <Modal open={modalOpen} onClose={() => { setModalOpen(false); setModalStep('none'); }} title={modalTitle} content={modalContent} onAgree={modalStep !== 'none' ? handleAgree : undefined} />
            <div className="w-full max-w-4xl flex flex-col md:flex-row items-stretch justify-center bg-white/10 rounded-3xl shadow-2xl backdrop-blur-md border border-white/30 overflow-hidden">
                {/* Left: Logo */}
                <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-transparent p-10">
                    <Link href="/home" className="group">
                        <Image
                            src="/images/logo.png"
                            alt="Lost & Found Hub Logo"
                            width={160}
                            height={160}
                            className="h-64 w-64 object-contain rounded-full drop-shadow-xl transition-transform duration-200 group-hover:scale-110 cursor-pointer"
                            priority
                        />
                    </Link>
                </div>
                {/* Vertical Divider */}
                <div className="hidden md:block w-px bg-white/40 my-12 mx-2 rounded-full" />
                {/* Right: Register Form */}
                <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-14">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-green-400 mb-2 text-center tracking-wider">REGISTER</h2>
                    <p className="text-white text-center text-base mb-6 font-semibold">Create your LF Hub account</p>
                    <RegisterForm agree={agree} setAgree={setAgree} openModal={openModal} />
                </div>
            </div>
        </div>
    );
}
