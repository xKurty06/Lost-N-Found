"use client";

import { useSearchParams } from "next/navigation";

export default function Page() {
    const searchParams = useSearchParams();

    const errorType = searchParams.get("type") ?? "Authentication";
    const errorMessage = searchParams.get("message") ?? "An error occurred.";

    return (
        <main className="w-screen h-screen flex justify-center items-center">
            <article className="bg-red-700 p-10 rounded-md flex flex-col gap-5">
                <h1 className="font-bold text-3xl">⚠️ Something went wrong.</h1>
                <p>{errorMessage}</p>
                <p className="underline">Failed at: {errorType}</p>
            </article>
        </main>
    );
}
