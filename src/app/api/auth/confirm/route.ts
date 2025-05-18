import type { EmailOtpType } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

import { createClient } from "@/supabase/clients/server";
import { redirect } from "next/navigation";

/* 
    This handles email confirmation.
    Make sure to modify your email template to support this flow.

    1. Go to Auth templates in your dashboard
    2. In the `Confirm signup` tab
    -> Change {{ .ConfirmationURL }}
    -> to
    -> {{ .SiteURL }}/api/auth/confirm?token_hash={{ .TokenHash }}&type=signup
*/
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type") as EmailOtpType | null;
    const next = searchParams.get("next") ?? "/authenticated";

    if (token_hash && type) {
        const supabase = await createClient();

        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });
        // Redirect the user to an error page with some instructions
        if (error) {
            redirect(`/error?type=confirmation&message=${error.message}`);
        }
    }

    if (next) {
        // Redirect the user to specified redirect URL or to /authenticated
        redirect(next);
    }
}
