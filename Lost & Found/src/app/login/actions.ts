"use server";

import { createClient } from "@/supabase/clients/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const userInfo = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const { error: loginError } = await supabase.auth.signInWithPassword(
        userInfo
    );
    if (loginError) {
        return redirect(`/error?type=login&message=${loginError.message}`);
    }

    redirect("/authenticated");
}

export async function register(formData: FormData) {
    const supabase = await createClient();

    const userInfo = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const { error: registrationError } = await supabase.auth.signUp(userInfo);
    if (registrationError) {
        return redirect(
            `/error?type=registration&message=${registrationError.message}`
        );
    }

    redirect("/authenticated");
}
