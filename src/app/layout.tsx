import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./navbar";

export const metadata: Metadata = {
    title: "Lost-N-Found",
    description: "",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className="bg-background px-4 md:px-16 lg:px-32 xl:px-64">
                <Navbar />
                <div className="pt-20">{/* Add top padding to prevent content from being hidden behind navbar */}
                    <main className="mx-auto w-full max-w-6xl">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
