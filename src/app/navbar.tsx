"use client";
import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
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

    return (
        <nav className="bg-green-600 w-full fixed top-0 left-0 z-50 shadow-lg border-b border-green-700">
            <div className="max-w-6xl mx-auto px-6 md:px-8 py-2 flex items-center justify-between">
                {/* Left: Logo, Site Name, and Navs */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="flex items-center gap-2 group">
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
                        <Link href="/" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 transition-colors duration-200">Home</Link>
                        <Link href="#getStarted" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 transition-colors duration-200">Lost/Found</Link>
                        <Link href="#about" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 transition-colors duration-200">About</Link>
                        <Link href="#contact" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 transition-colors duration-200">Contact</Link>
                        <Link href="#feedback" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 transition-colors duration-200">Feedback</Link>
                    </div>
                </div>
                {/* Right: Login Button */}
                <Link
                    href="/login"
                    className="flex items-center gap-2 text-white font-semibold text-base px-4 py-2 rounded-lg hover:bg-cvsu-yellow hover:text-green-900 transition shadow-sm focus:outline-none focus:ring-2 focus:ring-cvsu-yellow"
                >
                    <FaUserCircle className="text-2xl" />
                    <span className="hidden sm:inline">Login</span>
                </Link>
                {/* Mobile Nav Toggle (optional for future) */}
            </div>
            {/* Mobile Nav */}
            <div className="md:hidden px-4 pb-2 flex gap-4 justify-center bg-green-700/90">
                <Link href="/" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 text-white font-semibold py-1 transition-colors duration-200">Home</Link>
                <Link href="#getStarted" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 text-white font-semibold py-1 transition-colors duration-200">Lost/Found</Link>
                <Link href="#about" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 text-white font-semibold py-1 transition-colors duration-200">About</Link>
                <Link href="#contact" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 text-white font-semibold py-1 transition-colors duration-200">Contact</Link>
                <Link href="#feedback" className="hover:text-cvsu-yellow hover:underline hover:underline-offset-4 text-white font-semibold py-1 transition-colors duration-200">Feedback</Link>
            </div>
        </nav>
    );
}
