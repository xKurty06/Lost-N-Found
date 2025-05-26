'use client';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';

// Import legal contents as React components
import { termsOfService, privacyPolicy } from '../../legal/legal-contents';

// Add type annotations for Modal props and openModal param
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  onAgree: () => void;
}

class Modal extends React.Component<ModalProps> {
  render() {
    const { open, onClose, title, content, onAgree } = this.props;
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadein-up">
          <h3 className="text-xl font-bold mb-4 text-green-700">{title}</h3>
          <div className="prose max-h-80 overflow-y-auto text-gray-800 mb-6">{content}</div>
          <div className="flex justify-end gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">Cancel</button>
            <button onClick={onAgree} className="px-4 py-2 rounded bg-cvsu-yellow text-green-900 font-bold hover:bg-yellow-400">Agree</button>
          </div>
        </div>
      </div>
    );
  }
}

const TERMS_CONTENT = termsOfService;
const PRIVACY_CONTENT = privacyPolicy;

interface LoginFormProps {
  agree: boolean;
  setAgree: (v: boolean) => void;
  openModal: (type: 'terms' | 'policy') => void;
}

interface LoginFormState {
  showPassword: boolean;
}

class LoginForm extends React.Component<LoginFormProps, LoginFormState> {
  constructor(props: LoginFormProps) {
    super(props);
    this.state = { showPassword: false };
  }

  render() {
    const { agree, setAgree, openModal } = this.props;
    const { showPassword } = this.state;
    return (
      <>
        <form className="w-full max-w-md flex flex-col gap-4" action="#" method="POST">
          <div className="flex flex-col gap-1">
            <div className="text-xs text-gray-400 mt-1 mb-2">* Indicates required field</div>
            <label htmlFor="username" className="text-white font-semibold flex items-center gap-2">
              <span className="inline-block"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4Z"/></svg></span>
              CvSU E-mail<span className="text-red-500 ml-1">*</span>
            </label>
            <input type="text" id="username" placeholder="CvSU E-mail" name="username" required className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-cvsu-yellow shadow" />
          </div>
          <div className="flex flex-col gap-1 relative">
            <label htmlFor="password" className="text-white font-semibold flex items-center gap-2">
              <span className="inline-block"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 1 0-8 0v4h8Z"/></svg></span>
              Password<span className="text-red-500 ml-1">*</span>
            </label>
            <input type={showPassword ? 'text' : 'password'} id="password" placeholder="Password" name="password" required className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-cvsu-yellow shadow pr-10" />
            <button type="button" tabIndex={-1} className="absolute right-3 top-9 text-gray-500 hover:text-green-700" onClick={() => this.setState({ showPassword: !showPassword })} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? (
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0 1 12 19c-5 0-9-4-9-7s4-7 9-7c1.13 0 2.21.19 3.22.54M19.07 4.93A9.97 9.97 0 0 1 21 12c0 1.61-.5 3.13-1.36 4.41M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path strokeLinecap="round" strokeLinejoin="round" d="m3 3 18 18" /></svg>
              ) : (
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2 12S5 5 12 5s10 7 10 7-3 7-10 7S2 12 2 12Z" /></svg>
              )}
            </button>
          </div>
          <button type="submit" className="w-full mt-2 bg-cvsu-yellow text-green-900 font-bold py-2 rounded-full shadow hover:bg-yellow-400 transition disabled:opacity-60" disabled={!agree}>Login</button>
        </form>
        <div className="flex flex-col items-center mt-4">
          <span className="text-white text-xs font-semibold">Just browsing?</span>
          <Link href="/" className="text-green-400 font-semibold text-sm hover:underline">Continue as Guest</Link>
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

export default function LoginPage() {
  const [agree, setAgree] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalStep, setModalStep] = useState<'none' | 'terms' | 'privacy'>('none');

  function openModal(type: 'terms' | 'policy') {
    if (type === 'terms') {
      setModalTitle('Terms of Service');
      setModalContent(TERMS_CONTENT);
      setModalStep('terms');
    } else if (type === 'policy') {
      setModalTitle('Privacy Policy');
      setModalContent(PRIVACY_CONTENT);
      setModalStep('privacy');
    }
    setModalOpen(true);
  }

  function handleAgree() {
    if (modalStep === 'terms') {
      // After agreeing to Terms, show Privacy Policy
      setModalTitle('Privacy Policy');
      setModalContent(PRIVACY_CONTENT);
      setModalStep('privacy');
    } else if (modalStep === 'privacy') {
      setAgree(true);
      setModalOpen(false);
      setModalStep('none');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/images/login-bg.png')] bg-cover bg-center">
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setModalStep('none'); }} title={modalTitle} content={modalContent} onAgree={handleAgree} />
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-stretch justify-center bg-white/10 rounded-3xl shadow-2xl backdrop-blur-md border border-white/30 overflow-hidden">
        {/* Left: Logo */}
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-transparent p-10">
          <Image src="/images/logo-nobg.png" alt="LF Hub Logo" width={320} height={320} className="drop-shadow-xl bg-transparent" priority />
        </div>
        {/* Vertical Divider */}
        <div className="hidden md:block w-px bg-white/40 my-12 mx-2 rounded-full" />
        {/* Right: Login Form */}
        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-green-400 mb-2 text-center tracking-wider">LOGIN</h2>
          <p className="text-white text-center text-base mb-6 font-semibold">Welcome to LF Hub</p>
          <LoginForm agree={agree} setAgree={setAgree} openModal={openModal} />
        </div>
      </div>
    </div>
  );
}