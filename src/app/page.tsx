"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Page() {
    const getStartedRef = useRef<HTMLDivElement>(null);
    const [showClickMe, setShowClickMe] = useState(false);
    const aboutRef = useRef<HTMLDivElement>(null);
    const [aboutVisible, setAboutVisible] = useState(false);

    // Shared function to center the getStarted section
    function scrollToGetStarted() {
        setShowClickMe(true);
        setTimeout(() => setShowClickMe(false), 2000);
        const nav = document.querySelector('nav');
        const navHeight = nav ? nav.offsetHeight : 0;
        const section = getStartedRef.current;
        if (!section) return;
        const sectionRect = section.getBoundingClientRect();
        const scrollTopVal = window.pageYOffset || document.documentElement.scrollTop;
        const viewportHeight = window.innerHeight;
        const sectionHeight = sectionRect.height;
        // Center the section: align its center with the viewport center below the navbar
        let offset = scrollTopVal + sectionRect.top + sectionHeight / 2 - viewportHeight / 2 - navHeight / 2;
        // Clamp offset so it doesn't scroll past the bottom or above the top
        const maxScroll = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
        if (offset > maxScroll) offset = maxScroll;
        if (offset < 0) offset = 0;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    }

    useEffect(() => {
        // Listen for custom event from navbar to trigger Click Me effect
        const handleTriggerClickMe = () => {
            scrollToGetStarted();
        };
        window.addEventListener('triggerClickMe', handleTriggerClickMe);
        return () => {
            window.removeEventListener('triggerClickMe', handleTriggerClickMe);
        };
    }, []);

    useEffect(() => {
        // Smooth scroll for nav links
        const handleNavClick = (e: Event) => {
            let target = e.target as HTMLElement | null;
            // Traverse up to find the anchor if a child element was clicked
            while (target && target.tagName !== 'A') {
                target = target.parentElement;
            }
            if (!target) return;
            const href = target.getAttribute('href');
            if (!href) return;
            if (href.startsWith('#')) {
                const el = document.querySelector(href);
                if (el) {
                    e.preventDefault();
                    // Center the getStarted section in the viewport
                    if (href === '#getStarted' && getStartedRef.current) {
                        scrollToGetStarted();
                        return;
                    }
                    // Default smooth scroll for other sections
                    const nav = document.querySelector('nav');
                    const navHeight = nav ? nav.offsetHeight : 0;
                    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                    let offset = el instanceof HTMLElement ? el.offsetTop : 0;
                    // If there's a heading inside, scroll to it
                    const h = el.querySelector('h2, h3, h1');
                    if (h) {
                        const hRect = h.getBoundingClientRect();
                        offset = scrollTop + hRect.top - navHeight - 24;
                    } else {
                        offset = offset - navHeight - 24;
                    }
                    // Special offset for Contact section
                    if (href === '#contact') {
                        const nav = document.querySelector('nav');
                        const navHeight = nav ? nav.offsetHeight : 0;
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                        let offset = el instanceof HTMLElement ? el.offsetTop : 0;
                        offset = offset - navHeight - 24; // 24px extra spacing
                        // Clamp offset
                        const maxScroll = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
                        if (offset > maxScroll) offset = maxScroll;
                        if (offset < 0) offset = 0;
                        window.scrollTo({ top: offset, behavior: 'smooth' });
                        return;
                    }
                    window.scrollTo({ top: offset, behavior: 'smooth' });
                }
            } else if (href === '/' || href === window.location.pathname) {
                // Smooth scroll to top for Home
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        // Attach to all nav links
        const navLinks = document.querySelectorAll('nav a[href]');
        navLinks.forEach(link => link.addEventListener('click', handleNavClick));
        return () => {
            navLinks.forEach(link => link.removeEventListener('click', handleNavClick));
        };
    }, []);

    useEffect(() => {
        const observer = new window.IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setAboutVisible(true);
                }
            },
            { threshold: 0.3 }
        );
        if (aboutRef.current) {
            observer.observe(aboutRef.current);
        }
        return () => {
            if (aboutRef.current) observer.unobserve(aboutRef.current);
        };
    }, []);

    useEffect(() => {
        // On mount, if there is a hash in the URL, scroll to that section smoothly
        if (window.location.hash) {
            const hash = window.location.hash;
            setTimeout(() => {
                const el = document.querySelector(hash);
                if (el) {
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
            }, 100); // Delay to ensure DOM is ready
        }
    }, []);

    return (
        <>
            {/* Hero Section with BG image */}
            <section className="relative w-full min-h-screen flex flex-col items-center justify-start overflow-hidden">
                <div className="absolute inset-0 w-full h-full -z-10">
                    <Image
                        src="/images/cvsu-homebg.jpg"
                        alt="Cavite State University Background"
                        fill
                        priority
                        className="object-cover object-center"
                        style={{ filter: "blur(5px) brightness(0.6)" }}
                        sizes="100vw"
                        quality={100}
                    />
                </div>
                <div className="flex flex-col w-full max-w-4xl px-8 pt-24 pb-10 relative z-10">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-lg mb-32 tracking-tight mt-36" style={{ fontFamily: 'cursive' }}>
                        Welcome!
                    </h1>
                    <div className="items-center justify-center text-center">
                        <p className="text-2xl md:text-3xl font-semibold text-white drop-shadow mb-20 tracking-wide animate-fadein-slow">
                            Lost something? Found something?<br />
                            <span className="text-cvsu-yellow font-extrabold animate-pulse">We're here to help</span> – get started now!
                        </p>
                        <Link href="#getStarted" className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition mt-14 relative" onClick={e => {
                            e.preventDefault();
                            scrollToGetStarted();
                        }}>
                            Get Started!
                        </Link>
                    </div>

                </div>
            </section>

            {/* Popout Arrow Button */}
            <div className="w-full flex justify-center items-center pointer-events-none absolute left-0 right-0 bottom-8 z-20">
                <button
                    aria-label="Scroll to About section"
                    onClick={() => {
                        const about = document.getElementById('about');
                        if (about) {
                            const nav = document.querySelector('nav');
                            const navHeight = nav ? nav.offsetHeight : 0;
                            const rect = about.getBoundingClientRect();
                            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                            const viewportHeight = window.innerHeight;
                            const sectionHeight = rect.height;
                            // Center the section: align its center with the viewport center below the navbar
                            let offset = scrollTop + rect.top + sectionHeight / 1.45 - viewportHeight / 2 - navHeight / 2;
                            // Clamp offset
                            const maxScroll = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - window.innerHeight;
                            if (offset > maxScroll) offset = maxScroll;
                            if (offset < 0) offset = 0;
                            window.scrollTo({ top: offset, behavior: 'smooth' });
                        }
                    }}
                    className="bg-white bg-opacity-80 hover:bg-green-500 hover:text-white text-green-700 rounded-full p-3 shadow-lg transition-all duration-300 animate-bounce focus:scale-110 focus:bg-green-600 focus:text-white pointer-events-auto"
                    tabIndex={0}
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Lost/Found Banner Section */}
            <section id="getStarted" className="w-full" style={{ background: '#006f3d' }}>
                <div ref={getStartedRef} className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 px-4 py-24 relative">
                    {/* LOST ITEM */}
                    <Link href="/lost-item" className="flex flex-col items-center w-full md:w-1/2 max-w-md">
                        <button className={`flex items-center bg-[#003e22] bg-opacity-90 rounded-xl px-10 py-6 shadow-lg transition hover:bg-green-800 group w-full justify-center transform hover:scale-105 duration-200 relative ${showClickMe ? 'ring-4 ring-yellow-400 animate-bounce' : ''}`}>
                            <span className="text-4xl md:text-5xl font-extrabold text-gray-100 tracking-wide font-[cursive]">LOST ITEM</span>
                            <img src="/icons/lostitem-icon.svg" alt="Lost Icon" className="w-14 h-14 ml-4" />
                            {showClickMe && (
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#ff9400] text-black font-bold px-3 py-1 rounded-full text-sm shadow-lg animate-pulse z-10">Click me!</span>
                            )}
                        </button>
                        <span className="text-white text-base md:text-lg font-medium text-center mt-4">
                            Find &amp; Browse items, post details of lost items,<br />including descriptions, locations, and images.
                        </span>
                    </Link>
                    {/* FOUND */}
                    <div className="flex flex-col items-center w-full md:w-1/2 max-w-md">
                        <button className={`flex items-center bg-[#003e22] bg-opacity-90 rounded-xl px-13 py-6 shadow-lg transition hover:bg-green-800 group w-full justify-center transform hover:scale-105 duration-200 relative ${showClickMe ? 'ring-4 ring-yellow-400 animate-bounce' : ''}`}>
                            <span className="text-4xl md:text-5xl font-extrabold text-gray-100 tracking-wide font-[cursive]">FOUND ITEM</span>
                            <img src="/icons/founditem-icon.svg" alt="Found Icon" className="w-14 h-14 ml-4" />
                            {showClickMe && (
                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#ff9400] text-black font-bold px-3 py-1 rounded-full text-sm shadow-lg animate-pulse z-10">Click me!</span>
                            )}
                        </button>
                        <span className="text-white text-base md:text-lg font-medium text-center mt-4">
                            Archive of items marked as found, where lost<br />items are moved once identified.
                        </span>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="w-full mt-36 mb-20">
                <div
                    ref={aboutRef}
                    className={`max-w-6xl mx-auto px-8 transition-all duration-700 ${aboutVisible ? "animate-fadein-up animate-about-glow" : "opacity-0 translate-y-10"}`}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-3xl md:text-4xl font-bold text-green-800 font-[cursive] drop-shadow relative">
                          About LF Hub
                          {aboutVisible && (
                            <span className="absolute left-0 -bottom-2 w-full animated-underline" />
                          )}
                        </h2>
                        <Image src="/images/logo.png" alt="LF Hub Logo" width={40} height={40} className="rounded-full bg-white border-2 border-green-700" />
                    </div>
                    <div className="text-green-900 text-base md:text-xl mt-10 leading-relaxed space-y-6 font-sans">
                        <p>
                            At Lost and Found Hub, we believe that even the smallest acts of honesty and kindness can make a big difference. Founded with the goal of helping students at Cavite State University recover misplaced or forgotten items, our platform serves as a central digital space where the campus community can come together to report lost belongings or turn in found ones.
                        </p>
                        <p>
                            We understand how frustrating it can be to lose something important – whether it’s your student ID, a cherished hoodie, a gadget, or even a single notebook filled with class notes. That’s why we’ve designed this hub to be easy to use, reliable, and student-centered.
                        </p>
                        <p>
                            Our mission is to build a trustworthy system that not only helps recover personal items but also encourages a culture of responsibility, empathy, and cooperation among students. Every returned item is a small victory – and a reminder that we’re all in this together.
                        </p>
                        <p>
                            Whether you’re here because you’ve lost something or you want to do the right thing by reporting a found item, Lost and Found Hub is here to help.
                        </p>
                    </div>
                </div>
            </section>

            {/* Divider Line */}
            <div className="w-full flex justify-center items-center my-20">
                <img src="/images/divider.png" alt="divider" className="mx-auto h-4 object-contain" style={{ width: '60%' }} />
            </div>


            {/* 3 Quick Steps Section */}
            <section className="w-full px-4 animate-fadein-slow">
                <div className="max-w-5xl mx-auto mb-12 flex flex-col items-center">
                    <h3 className="text-3xl md:text-4xl font-bold text-green-700 mb-12 mt-4 text-center font-[cursive] drop-shadow">3 Quick Steps</h3>
                    <div className="flex flex-col md:flex-row gap-8 md:gap-10 w-full justify-center items-stretch mb-26">
                        <div className="flex flex-col items-center border border-green-400 rounded-2xl p-10 w-full max-w-[270px] min-h-[340px] bg-white/80 shadow-xl transition-shadow hover:shadow-2xl flex-1 animate-slidein-up">
                            <img src="/icons/report-icon.png" alt="Report Icon" className="h-16 w-16 mb-7 drop-shadow-lg" />
                            <span className="font-extrabold text-2xl mb-3 text-green-800">Report</span>
                            <span className="text-lg text-gray-700 text-center">Submit details of item you found.</span>
                        </div>
                        <div className="flex flex-col items-center border border-green-400 rounded-2xl p-10 w-full max-w-[270px] min-h-[340px] bg-white/80 shadow-xl transition-shadow hover:shadow-2xl flex-1 animate-slidein-up delay-100">
                            <img src="/icons/find-icon.png" alt="Browse Icon" className="h-16 w-16 mb-7 drop-shadow-lg" />
                            <span className="font-extrabold text-2xl mb-3 text-green-800">Browse</span>
                            <span className="text-lg text-gray-700 text-center">Find and browse reported found items.</span>
                        </div>
                        <div className="flex flex-col items-center border border-green-400 rounded-2xl p-10 w-full max-w-[270px] min-h-[340px] bg-white/80 shadow-xl transition-shadow hover:shadow-2xl flex-1 animate-slidein-up delay-200">
                            <img src="/icons/found-icon.png" alt="Claim Icon" className="h-16 w-16 mb-7 drop-shadow-lg" />
                            <span className="font-extrabold text-2xl mb-3 text-green-800">Claim</span>
                            <span className="text-lg text-gray-700 text-center">Confirm and reclaim your item.</span>
                        </div>
                    </div>
                </div>
            </section>
            <div className="w-full flex justify-center items-center my-20">
                <img src="/images/divider.png" alt="divider" className="mx-auto h-4 object-contain" style={{ width: '60%' }} />
            </div>

            {/* Contact Section */}
            <section id="contact" className="w-full bg-gradient-to-br from-green-50 via-white to-yellow-50 py-16 px-4">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10 md:gap-20 rounded-3xl shadow-2xl border border-green-200 bg-white/80 backdrop-blur-lg p-10">
                    <div className="flex flex-col items-start gap-4 w-full">
                        <h3 className="text-3xl font-extrabold text-green-700 mb-2 flex items-center gap-2">
                            <svg className="w-8 h-8 text-cvsu-yellow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 10.5V6.75A2.25 2.25 0 0 0 18.75 4.5H5.25A2.25 2.25 0 0 0 3 6.75v10.5A2.25 2.25 0 0 0 5.25 19.5h13.5A2.25 2.25 0 0 0 21 17.25V13.5" /></svg>
                            Contact Us
                        </h3>
                        <div className="flex flex-col gap-2 text-lg text-green-900">
                            <div className="flex items-center gap-2">
                                <i className="fab fa-facebook text-blue-600 text-2xl"></i>
                                <a href="#" className="hover:underline hover:text-blue-700 transition">LF Hub Facebook</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="fab fa-instagram text-pink-500 text-2xl"></i>
                                <a href="#" className="hover:underline hover:text-pink-600 transition">@lfhub_cvsu</a>
                            </div>
                            <div className="flex items-center gap-2">
                                <i className="fas fa-envelope text-red-500 text-2xl"></i>
                                <a href="mailto:lfhub@cvsu.edu.ph" className="hover:underline hover:text-red-600 transition">lfhub@cvsu.edu.ph</a>
                            </div>
                        </div>
                        <div className="mt-6 text-green-800 text-base">
                            <span className="font-semibold">Location:</span> Room 101, Lost & Found Office, Cavite State University - Main Campus
                        </div>
                    </div>
                </div>
            </section>

            {/* Feedback Section */}
            <section id="feedback" className="w-full bg-gradient-to-br from-yellow-50 via-white to-green-50 py-16 px-4">
                <div className="max-w-4xl mx-auto flex flex-col items-center justify-center rounded-3xl shadow-2xl border border-green-200 bg-white/80 backdrop-blur-lg p-10">
                    <h3 className="text-2xl font-bold text-green-700 mb-6 flex items-center gap-2">
                        <svg className="w-7 h-7 text-cvsu-yellow" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 20h.01M8.5 4.5l7 7m0 0l-7 7m7-7H3" /></svg>
                        Send Feedback
                    </h3>
                    <form className="w-full max-w-xl flex flex-col gap-4">
                        <input type="text" placeholder="Your Name *" className="w-full px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-cvsu-yellow outline-none bg-white/80 text-green-900" required/>
                        <input type="email" placeholder="Your Email *" className="w-full px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-cvsu-yellow outline-none bg-white/80 text-green-900" required/>
                        <textarea placeholder="Your Feedback or Message *" rows={4} className="w-full px-4 py-2 rounded-lg border border-green-200 focus:ring-2 focus:ring-cvsu-yellow outline-none bg-white/80 text-green-900 resize-none" required/>
                        <button type="submit" className="bg-cvsu-yellow text-green-900 font-bold py-2 px-8 rounded-full shadow hover:bg-yellow-400 transition mt-2 self-end">Send</button>
                    </form>
                    <div className="text-xs text-gray-500 mt-2">We value your feedback and will get back to you as soon as possible.</div>
                </div>
            </section>

            {/* Footer */}
            <footer className="w-full text-xs text-gray-600 text-center py-4 border-t mt-4">
                <div className="flex flex-wrap justify-center gap-4 mb-2">
                    <a href="#" className="hover:underline">Website Terms</a>
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Accessibility Statement</a>
                    <a href="#" className="hover:underline">CA Transparency in Supply Chain Act</a>
                    <a href="#" className="hover:underline">Do not sell my information</a>
                    <a href="#" className="hover:underline">Warranty</a>
                    <a href="#" className="hover:underline">Supplier Code of Conduct</a>
                </div>
                <div>
                    ©2025 Lost and Found. All Rights Reserved
                </div>
            </footer>
        </>
    );
}
