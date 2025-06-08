'use client';
import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { createClient } from '../../supabase/clients/client';
import bcrypt from 'bcryptjs';
import { useToast } from '../../components/ui/ToastProvider';
import Cookies from 'js-cookie';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const usernameLength = username.length;
  const { showToast } = useToast();

  const usernameRegex = /^[a-zA-Z0-9_]{4,20}$/;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!username || !password) {
      showToast('All fields are required.', 'error');
      setLoading(false);
      return;
    }
    if (!usernameRegex.test(username)) {
      showToast('Username must be 4-20 characters, letters, numbers, or underscores only.', 'error');
      setLoading(false);
      return;
    }
    if (password.length < 6 || password.length > 32) {
      showToast('Password must be 6-32 characters.', 'error');
      setLoading(false);
      return;
    }
    try {
      const client = createClient();
      const { data: user } = await client
        .from('users')
        .select('id, password_hash')
        .eq('username', username)
        .maybeSingle();
      if (!user) {
        showToast('Invalid username or password.', 'error');
        setLoading(false);
        return;
      }
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        showToast('Invalid username or password.', 'error');
        setLoading(false);
        return;
      }
      showToast('Login successful!', 'success');
      setLoading(false);
      // Set cookie for session (username and user id)
      Cookies.set('lfhub_user', JSON.stringify({ id: user.id, username }), { expires: 7 });
      window.location.href = '/home';
    } catch (err) {
      showToast('Unexpected error. Please try again.', 'error');
      setLoading(false);
    }
  };

  return (
    <form className="w-full max-w-md flex flex-col gap-4" onSubmit={handleLogin}>
      <div className="flex flex-col gap-1 relative">
        <label htmlFor="username" className="text-white font-semibold flex items-center gap-2">
          <span className="inline-block"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 14c-4.418 0-8 1.79-8 4v2h16v-2c0-2.21-3.582-4-8-4Z" /></svg></span>
          Username<span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <input type="text" id="username" placeholder="Username" name="username" required minLength={4} maxLength={20} pattern="[a-zA-Z0-9_]+" className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-cvsu-yellow shadow pr-16" value={username} onChange={e => setUsername(e.target.value)} />
          <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${usernameLength > 20 ? 'text-red-500' : 'text-gray-400'}`}>{usernameLength}/20</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 relative">
        <label htmlFor="password" className="text-white font-semibold flex items-center gap-2">
          <span className="inline-block"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2Zm10-10V7a4 4 0 1 0-8 0v4h8Z" /></svg></span>
          Password<span className="text-red-500 ml-1">*</span>
        </label>
        <input type={showPassword ? 'text' : 'password'} id="password" placeholder="Password" name="password" required minLength={6} maxLength={32} className="w-full px-4 py-2 rounded-lg bg-white text-black focus:outline-none focus:ring-2 focus:ring-cvsu-yellow shadow pr-10" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="button" tabIndex={-1} className="absolute right-3 top-8 text-gray-600 hover:text-green-700 transition-colors duration-150 rounded-full p-1 bg-transparent" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
          {showPassword ? (
            <Image src="/icons/hide_password.png" alt="Hide password" width={22} height={22} className="transition-transform duration-150 hover:scale-105" />
          ) : (
            <Image src="/icons/show_password.png" alt="Show password" width={22} height={22} className="transition-transform duration-150 hover:scale-105" />
          )}
        </button>
      </div>
      <button type="submit" className="w-full mt-2 bg-green-600 text-white font-bold py-2 rounded-full shadow hover:bg-green-600/60 transition disabled:opacity-60" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
      <div className="flex flex-col items-center mt-4">
        <div className="flex flex-row items-center gap-3">
          <div className="flex flex-col items-center">
            <span className="text-white text-xs font-bold">Don't have an account?</span>
            <Link href="/register" className="text-green-400 font-semibold text-sm hover:underline mt-1">Register</Link>
          </div>
          <span className="block w-px h-10 bg-white/40 mx-2 rounded-full" />
          <div className="flex flex-col items-center">
            <span className="text-white text-xs font-bold">Just browsing?</span>
            <Link href="/home" className="text-green-400 font-semibold text-sm hover:underline mt-1">Continue as Guest</Link>
          </div>
        </div>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/images/login-bg.png')] bg-cover bg-center">
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-stretch justify-center bg-white/10 rounded-3xl shadow-2xl backdrop-blur-md border border-white/30 overflow-hidden">
        <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-transparent p-10">
          <Link href="/home" className="group">
            <Image
              src="/images/logo.png"
              alt="Lost & Found Hub Logo"
              width={160}
              height={160}
              className="h-64 w-64 object-contain rounded-full bg-white drop-shadow-xl transition-transform duration-200 group-hover:scale-110 cursor-pointer"
              priority
            />
          </Link>
        </div>
        <div className="hidden md:block w-px bg-white/40 my-12 mx-2 rounded-full" />
        <div className="flex-1 flex flex-col justify-center items-center p-8 md:p-14">
          <h2 className="text-3xl md:text-4xl font-extrabold text-green-400 mb-2 text-center tracking-wider">LOGIN</h2>
          <p className="text-white text-center text-base mb-6 font-semibold">Welcome to LF Hub</p>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}