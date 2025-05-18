import Link from "next/link";

export default function Page() {
    return (
        <main className="w-screen h-screen flex justify-center items-center">
            <article className="border flex flex-col gap-7 p-10">
                <h1 className="text-4xl font-bold tracking-wide leading-tighter max-w-2xl">
                    Welcome to Supabase - Next.js Starter Kit!
                </h1>
                <p>
                    You can head directly to the authentication page by clicking
                    the button below.
                </p>
                <Link
                    className="bg-gray-500 self-start px-3 py-1 hover:bg-blue-500"
                    href={"/login"}
                >
                    <span className="font-semibold tracking-wider">
                        {">"} Login
                    </span>
                </Link>
            </article>
        </main>
    );
}
