import { login, register } from "./actions";

export default function Page() {
    return (
        <main className="w-screen h-screen flex justify-center items-center">
            <form className="flex flex-col gap-10 border p-8">
                <div className="flex flex-col gap-2">
                    <label
                        className="font-semibold text-sm tracking-tight"
                        htmlFor="email"
                    >
                        Email
                    </label>
                    <input
                        placeholder="Enter your email..."
                        className="rounded-md px-2"
                        id="email"
                        name="email"
                        type="email"
                        required
                    />
                    <label
                        className="font-semibold text-sm tracking-tight"
                        htmlFor="password"
                    >
                        Password
                    </label>
                    <input
                        placeholder="Enter your passsword..."
                        className="rounded-md px-2"
                        id="password"
                        name="password"
                        type="password"
                        required
                    />
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        className="border border-blue-400 bg-blue-500 text-white font-semibold py-1 px-3 rounded-md"
                        formAction={login}
                    >
                        Login
                    </button>
                    <button
                        className="border text-white/80 font-semibold py-1 px-3 rounded-md transition duration-300 hover:border-gray-200 hover:bg-gray-300 hover:text-black"
                        formAction={register}
                    >
                        Register
                    </button>
                </div>
            </form>
        </main>
    );
}
