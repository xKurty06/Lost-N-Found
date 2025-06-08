import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = Cookies.get('lfhub_cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  const handleAccept = () => {
    Cookies.set('lfhub_cookie_consent', 'true', { expires: 365 });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-0 w-full flex justify-center z-[1000] pointer-events-none">
      <div className="bg-white border border-gray-300 shadow-lg rounded-xl px-6 py-4 flex flex-col md:flex-row items-center gap-4 max-w-xl pointer-events-auto animate-fadein-up">
        <span className="text-gray-800 text-sm md:text-base">
          This website uses cookies to enhance your experience. By continuing to use this site, you agree to our use of cookies.
        </span>
        <button
          className="bg-green-700 hover:bg-green-800 text-white font-bold px-4 py-2 rounded-lg shadow transition"
          onClick={handleAccept}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
