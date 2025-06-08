"use client";
import { usePathname } from 'next/navigation';
import Navbar from "./navbar";
import "./globals.css";
import ToastProvider from '../components/ui/ToastProvider';
import CookieConsent from '../components/ui/CookieConsent';

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const pathname = usePathname();
    const showNavbar = pathname !== '/register' && pathname !== '/login';
    return (
        <html lang="en">
            <body className="bg-white">
                <ToastProvider>
                    {showNavbar && (
                        <div className="fixed top-0 left-0 w-full z-40">
                            <Navbar />
                        </div>
                    )}
                    <div className="">
                        <main>
                            {children}
                        </main>
                    </div>
                    <CookieConsent />
                </ToastProvider>
            </body>
        </html>
    );
}
