import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Supabase - Next.js Starter Kit",
    description: "",
};

export default function RootLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en">
            <body className="bg-background">{children}</body>
        </html>
    );
}
