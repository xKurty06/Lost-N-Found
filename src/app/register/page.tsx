'use client';

import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { createClient } from '../../supabase/clients/client';
import bcrypt from 'bcryptjs';
import { termsOfService, privacyPolicy } from '../../legal/legal-contents';

interface RegisterFormProps {
    agree: boolean;
    setAgree: (v: boolean) => void;
    openModal: (type: 'terms' | 'policy') => void;
}

interface RegisterFormState {
    showPassword: boolean;
    showConfirmPassword: boolean;
    loading: boolean;
    error: string | null;
    success: string | null;
}

class RegisterForm extends React.Component<RegisterFormProps, RegisterFormState> {
    usernameRef: React.RefObject<HTMLInputElement>;
    passwordRef: React.RefObject<HTMLInputElement>;
    confirmPasswordRef: React.RefObject<HTMLInputElement>;
    constructor(props: RegisterFormProps) {
        super(props);
        this.state = { showPassword: false, showConfirmPassword: false, loading: false, error: null, success: null };
        this.usernameRef = React.createRef();
        this.passwordRef = React.createRef();
        this.confirmPasswordRef = React.createRef();
    }

    handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        this.setState({ loading: true, error: null, success: null });
        const username = this.usernameRef.current?.value?.trim();
        const password = this.passwordRef.current?.value;
        const confirmPassword = this.confirmPasswordRef.current?.value;
        if (!username || !password || !confirmPassword) {
            this.setState({ loading: false, error: 'All fields are required.' });
            return;
        }
        if (password !== confirmPassword) {
            this.setState({ loading: false, error: 'Passwords do not match.' });
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
                this.setState({ loading: false, error: 'Username already taken.' });
                return;
            }
            const password_hash = await bcrypt.hash(password, 10);
            const { error } = await client.from('users').insert({ username, password_hash });
            if (error) {
                this.setState({ loading: false, error: 'Registration failed. Please try again.' });
                return;
            }
            this.setState({ loading: false, success: 'Registration successful! You can now log in.', error: null });
            if (this.usernameRef.current) this.usernameRef.current.value = '';
            if (this.passwordRef.current) this.passwordRef.current.value = '';
            if (this.confirmPasswordRef.current) this.confirmPasswordRef.current.value = '';
        } catch (err) {
            this.setState({ loading: false, error: 'Unexpected error. Please try again.' });
        }
    };

    render() {
        const { agree, setAgree, openModal } = this.props;
        const { showPassword, showConfirmPassword, loading, error, success } = this.state;
        return (
            <>
                <form className="w-full max-w-md flex flex-col gap-4" onSubmit={this.handleRegister}>
                    <div className="flex flex-col gap-1">
                        <div className="text-xs text-gray-400 mt-1 mb-2">* Indicates required field</div>
                        <label htmlFor="username" className="text-white font-semibold flex items-center gap-2">
                            <span className="inline-block"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4Z" /></svg></span>
                            Username<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type="text" id="username" placeholder="Username" name="username" required className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-cvsu-yellow shadow" ref={this.usernameRef} />
                    </div>
                    <div className="flex flex-col gap-1 relative">
                        <label htmlFor="password" className="text-white font-semibold flex items-center gap-2">
                            <span className="inline-block"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 1 0-8 0v4h8Z" /></svg></span>
                            Password<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type={showPassword ? 'text' : 'password'} id="password" placeholder="Password" name="password" required className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-cvsu-yellow shadow pr-10" ref={this.passwordRef} />
                        <button type="button" tabIndex={-1} className="absolute right-3 top-8 text-gray-600 hover:text-green-700 transition-colors duration-150 bg-white/90 rounded-full p-1" onClick={() => this.setState({ showPassword: !showPassword })} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                            {showPassword ? (
                                <Image src="/icons/hide_password.png" alt="Hide password" width={22} height={22} className="transition-transform duration-150 hover:scale-105" />
                            ) : (
                                <Image src="/icons/show_password.png" alt="Show password" width={22} height={22} className="transition-transform duration-150 hover:scale-105" />
                            )}
                        </button>
                    </div>
                    <div className="flex flex-col gap-1 relative">
                        <label htmlFor="confirmPassword" className="text-white font-semibold flex items-center gap-2">
                            <span className="inline-block"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 1 0-8 0v4h8Z" /></svg></span>
                            Confirm Password<span className="text-red-500 ml-1">*</span>
                        </label>
                        <input type={showConfirmPassword ? 'text' : 'password'} id="confirmPassword" placeholder="Confirm Password" name="confirmPassword" required className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-cvsu-yellow shadow pr-10" ref={this.confirmPasswordRef} />
                        <button type="button" tabIndex={-1} className="absolute right-3 top-8 text-gray-600 hover:text-green-700 transition-colors duration-150 bg-white/90 rounded-full p-1" onClick={() => this.setState({ showConfirmPassword: !this.state.showConfirmPassword })} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>
                            {showConfirmPassword ? (
                                <Image src="/icons/hide_password.png" alt="Hide password" width={22} height={22} className="transition-transform duration-150 hover:scale-105" />
                            ) : (
                                <Image src="/icons/show_password.png" alt="Show password" width={22} height={22} className="transition-transform duration-150 hover:scale-105" />
                            )}
                        </button>
                    </div>
                    <button type="submit" className="w-full mt-2 bg-cvsu-yellow text-green-900 font-bold py-2 rounded-full shadow hover:bg-yellow-400 transition disabled:opacity-60" disabled={!agree || loading}>{loading ? 'Registering...' : 'Register'}</button>
                    {error && <div className="text-red-500 text-sm font-semibold mt-2">{error}</div>}
                    {success && <div className="text-green-500 text-sm font-semibold mt-2">{success}</div>}
                </form>
                <div className="flex flex-col items-center mt-4">
                    <span className="text-white text-xs font-semibold">Already have an account?</span>
                    <Link href="/login" className="text-green-400 font-semibold text-sm hover:underline">Login</Link>
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
}

export default function RegisterPage() {
    const [agree, setAgree] = useState(false);
    const [modalType, setModalType] = useState<'terms' | 'policy' | null>(null);

    const openModal = (type: 'terms' | 'policy') => {
        setModalType(type);
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        setModalType(null);
        document.body.style.overflow = 'auto';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[url('/images/login-bg.png')] bg-cover bg-center">
            <div className="w-full max-w-4xl flex flex-col md:flex-row items-stretch justify-center bg-white/10 rounded-3xl shadow-2xl backdrop-blur-md border border-white/30 overflow-hidden">
                {/* Left: Logo */}
                <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-transparent p-10">
                    <Image src="/images/logo-nobg.png" alt="LF Hub Logo" width={320} height={320} className="drop-shadow-xl bg-transparent" priority />
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
            {modalType === 'terms' && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-black bg-opacity-80 absolute inset-0" onClick={closeModal} />
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg z-10 max-w-lg w-full">
                        <div className="bg-cvsu-yellow px-4 py-2">
                            <h3 className="text-green-900 font-semibold text-lg">Terms of Service</h3>
                        </div>
                        <div className="p-4 max-h-[70vh] overflow-auto">
                            {termsOfService}
                        </div>
                        <div className="bg-gray-100 px-4 py-2 flex justify-end gap-2">
                            <button onClick={closeModal} className="bg-green-900 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-green-800 transition-colors duration-150">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {modalType === 'policy' && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="bg-black bg-opacity-80 absolute inset-0" onClick={closeModal} />
                    <div className="bg-white rounded-lg overflow-hidden shadow-lg z-10 max-w-lg w-full">
                        <div className="bg-cvsu-yellow px-4 py-2">
                            <h3 className="text-green-900 font-semibold text-lg">Privacy Policy</h3>
                        </div>
                        <div className="p-4 max-h-[70vh] overflow-auto">
                            {privacyPolicy}
                        </div>
                        <div className="bg-gray-100 px-4 py-2 flex justify-end gap-2">
                            <button onClick={closeModal} className="bg-green-900 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-green-800 transition-colors duration-150">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
