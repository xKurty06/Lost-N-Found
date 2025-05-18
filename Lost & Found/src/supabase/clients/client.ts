import { createBrowserClient } from "@supabase/ssr";

/* CLIENT */
export function createClient() {
    const client = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    return client;
}
