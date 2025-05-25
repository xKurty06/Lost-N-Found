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
            <body className="bg-white">
                <div className="fixed top-0 left-0 w-full z-40">
                    <Navbar />
                </div>
                <div className="">
                    <main>
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
