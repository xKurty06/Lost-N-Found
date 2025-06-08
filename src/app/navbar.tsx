"use client";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '../supabase/clients/client';
import Cookies from 'js-cookie';

export default function Navbar() {
    const router = useRouter();
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const [user, setUser] = useState<any>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Read user from cookie
        const cookie = Cookies.get('lfhub_user');
        if (cookie) {
            try {
                setUser(JSON.parse(cookie));
            } catch {}
        } else {
            setUser(null);
        }
    }, []);

    useEffect(() => {
        // Smooth scroll for nav links and trigger custom event for Lost/Found
        const handleNavClick = (e: Event) => {
            let target = e.target as HTMLElement | null;
            while (target && target.tagName !== 'A') {
                target = target.parentElement;
            }
            if (!target) return;
            const href = target.getAttribute('href');
            if (!href) return;
            // If it's a hash link
            if (href.startsWith('#')) {
                if (pathname !== '/') {
                    e.preventDefault();
                    // Use string interpolation for Next.js router
                    router.push('/' + href);
                    return;
                }
                const el = document.querySelector(href);
                if (el) {
                    e.preventDefault();
                    // Dispatch custom event for Lost/Found nav
                    if (href === '#getStarted') {
                        window.dispatchEvent(new CustomEvent('triggerClickMe'));
                    }
                    const nav = document.querySelector('nav');
                    const navHeight = nav ? nav.offsetHeight : 0;
                    let offset = el instanceof HTMLElement ? el.offsetTop : 0;
                    // If there's a heading inside, scroll to it
                    const h = el.querySelector('h2, h3, h1');
                    if (h) {
                        const hRect = h.getBoundingClientRect();
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        offset = scrollTop + hRect.top - navHeight - 24;
                    } else {
                        offset = offset - navHeight - 24;
                    }
                    // Clamp offset
                    const maxScroll = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
                    if (offset > maxScroll) offset = maxScroll;
                    if (offset < 0) offset = 0;
                    window.scrollTo({ top: offset, behavior: 'smooth' });
                }
            } else if (href === '/' || href === window.location.pathname) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        const navLinks = document.querySelectorAll('nav a[href]');
        navLinks.forEach(link => link.addEventListener('click', handleNavClick));
        return () => {
            navLinks.forEach(link => link.removeEventListener('click', handleNavClick));
        };
    }, [pathname, router]);

    useEffect(() => {
        if (!dropdownOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        }
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') setDropdownOpen(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [dropdownOpen]);

    return (
        <nav className="bg-green-500 w-full fixed top-0 left-0 z-50 shadow-lg border-b border-cvsu-yellow">
            <div className="max-w-6xl mx-auto px-6 md:px-8 py-2 flex items-center justify-between">
                {/* Left: Logo, Site Name, and Navs */}
                <div className="flex items-center gap-4">
                    <Link href="/home" className="flex items-center gap-2 group">
                        <img
                            src="/images/logo.png"
                            alt="Lost & Found Hub Logo"
                            className="h-10 w-10 object-contain rounded-full bg-white border-2 border-green-700 group-hover:scale-110 transition-transform duration-200"
                        />
                        <span className="text-white font-extrabold text-xl md:text-2xl tracking-tight transition-colors duration-200">
                            Lost & Found Hub
                        </span>
                    </Link>
                    <span className="mx-4 h-8 border-l border-white hidden md:inline-block"></span>
                    <div className="hidden md:flex gap-6 font-semibold text-white text-base ml-2">
                        <Link href="/home" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 transition-colors duration-200">Home</Link>
                        <Link href="#getStarted" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 transition-colors duration-200">Lost/Found</Link>
                        <Link href="#about" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 transition-colors duration-200">About</Link>
                        <Link href="#contact" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 transition-colors duration-200">Contact</Link>
                        <Link href="#feedback" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 transition-colors duration-200">Feedback</Link>
                    </div>
                </div>
                {/* Right: Login/User Button */}
                <div className="relative">
                    {!user ? (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 text-white font-semibold text-base px-4 py-2 rounded-lg hover:bg-cvsu-yellow hover:text-green-900 transition focus:outline-none focus:ring-2 focus:ring-cvsu-yellow"
                        >
                            <FaUserCircle className="text-2xl" />
                            <span className="hidden sm:inline">Login</span>
                        </Link>
                    ) : (
                        <button
                            className="flex items-center gap-2 text-white font-semibold text-base px-4 py-2 rounded-lg hover:bg-cvsu-yellow hover:text-green-900 transition focus:outline-none focus:ring-2 focus:ring-cvsu-yellow max-w-[140px]"
                            onClick={() => setDropdownOpen(v => !v)}
                            aria-haspopup="true"
                            aria-expanded={dropdownOpen}
                        >
                            <FaUserCircle className="text-2xl" />
                            <span className="hidden sm:inline truncate max-w-[80px]" style={{textOverflow:'ellipsis',overflow:'hidden',display:'inline-block',verticalAlign:'bottom'}}>{user.username}</span>
                        </button>
                    )}
                    {dropdownOpen && user && (
                        <div ref={dropdownRef} className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-50 border border-gray-200 animate-fadein-up">
                            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
                                <img src="/icons/profile.svg" alt="Profile" className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200" />
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-green-800 truncate text-lg" title={user.username}>{user.username}</span>
                                    <span className="text-xs text-gray-500 truncate mt-1">Signed in as</span>
                                </div>
                            </div>
                            <div className="py-2">
                                <button
                                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 font-semibold rounded-b-lg"
                                    onClick={() => {
                                        Cookies.remove('lfhub_user');
                                        setUser(null);
                                        setDropdownOpen(false);
                                        window.location.href = '/login';
                                    }}
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {/* Mobile Nav Toggle (optional for future) */}
            </div>
            {/* Mobile Nav */}
            <div className="md:hidden px-4 pb-2 flex gap-4 justify-center bg-green-700/90">
                <Link href="/home" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 text-white font-semibold py-1 transition-colors duration-200">Home</Link>
                <Link href="#getStarted" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 text-white font-semibold py-1 transition-colors duration-200">Lost/Found</Link>
                <Link href="#about" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 text-white font-semibold py-1 transition-colors duration-200">About</Link>
                <Link href="#contact" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 text-white font-semibold py-1 transition-colors duration-200">Contact</Link>
                <Link href="#feedback" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 text-white font-semibold py-1 transition-colors duration-200">Feedback</Link>
            </div>
        </nav>
    );
}
