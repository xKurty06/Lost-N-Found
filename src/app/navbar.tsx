import Link from "next/link";
import { FaUserCircle } from "react-icons/fa";

export default function Navbar() {
    return (
        <nav className="bg-green-500 w-screen left-1/2 right-1/2 -translate-x-1/2 fixed top-0 z-50">
            <div className="max-w-6xl mx-auto px-8 py-3 flex items-center justify-between">
                {/* Left: Logo, Site Name, and Navs */}
                <div className="flex items-center gap-3">
                    <img
                        src="/images/logo.png"
                        alt="Lost & Found Hub Logo"
                        className="h-10 w-10 object-contain rounded-full bg-white"
                    />
                    <span className="text-white font-bold text-lg md:text-xl">
                        Lost & Found Hub
                    </span>
                    <span className="mx-4 h-8 border-l border-white hidden md:inline-block"></span>
                    <div className="flex gap-6 font-semibold text-white text-base ml-2">
                        <Link href="/" className="hover:underline">Home</Link>
                        <Link href="/about" className="hover:underline">About</Link>
                        <Link href="/contact" className="hover:underline">Contact Us</Link>
                        <Link href="/feedback" className="hover:underline">Feedback</Link>
                    </div>
                </div>
                {/* Right: Login Button */}
                <Link
                    href="/login"
                    className="flex items-center gap-2 bg-transparent text-white font-semibold text-base px-4 py-2 rounded hover:bg-green-600 transition"
                >
                    <FaUserCircle className="text-2xl" />
                    Login
                </Link>
            </div>
        </nav>
    );
}
