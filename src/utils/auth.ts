import Cookies from 'js-cookie';

export function getUserFromCookie() {
    const cookie = Cookies.get('lfhub_user');
    if (!cookie) return null;
    try {
        return JSON.parse(cookie);
    } catch {
        return null;
    }
}

export function requireUserOrRedirect(router: any, showToast?: (msg: string, type?: string) => void) {
    const user = getUserFromCookie();
    if (!user) {
        if (showToast) showToast('You must be logged in to continue.', 'error');
        router.push('/login');
        return false;
    }
    return true;
}
