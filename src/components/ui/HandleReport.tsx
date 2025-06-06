import React, { useState, useRef } from 'react';

export default function HandleReport({ open, onClose, onSubmit }: {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: any) => void;
}) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [color, setColor] = useState('');
    const [contact, setContact] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Prevent background scroll when modal is open
    React.useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    if (!open) return null;

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        // Compose data
        const data = { title, description, location, date, color, contact, image };
        if (onSubmit) onSubmit(data);
        setSubmitting(false);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <form
                className="bg-white shadow-2xl p-8 w-full max-w-lg relative animate-fadein-up mt-20 max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col"
                style={{ borderRadius: 24 }}
                onSubmit={handleSubmit}
            >
                <button
                    type="button"
                    className="absolute top-4 right-4 text-gray-500 hover:text-green-700 text-2xl font-bold"
                    onClick={onClose}
                    aria-label="Close"
                >
                    ×
                </button>
                <h2 className="text-2xl font-extrabold text-green-800 mb-6 text-center">Report Found Item</h2>
                <div className="flex flex-col gap-4">
                    <label className="font-semibold text-green-900">Title<span className="text-red-500">*</span>
                        <div className="relative w-full">
                            <input
                                type="text"
                                className="mt-1 w-full border rounded-lg px-3 pr-12 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none"
                                value={title}
                                onChange={e => {
                                    if (e.target.value.length <= 20) setTitle(e.target.value);
                                }}
                                required
                                maxLength={20}
                                placeholder="e.g. Wallet, ID Lace, Umbrella, etc."
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 bg-white px-1 pointer-events-none">{title.length}/20</span>
                        </div>
                    </label>
                    <label className="font-semibold text-green-900">Description<span className="text-red-500">*</span>
                        <textarea className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none resize-none" value={description} onChange={e => setDescription(e.target.value)} required rows={3} maxLength={300} placeholder="Describe the item, any unique features, etc." />
                    </label>
                    <label className="font-semibold text-green-900">Location Found<span className="text-red-500">*</span>
                        <input type="text" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none" value={location} onChange={e => setLocation(e.target.value)} required maxLength={80} placeholder="e.g. Library, DIT Building, Gate 2, Eco Park" />
                    </label>
                    <label className="font-semibold text-green-900">Date & Time Found<span className="text-red-500">*</span>
                        <input
                            type="datetime-local"
                            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                            max={new Date().toISOString().slice(0, 16)}
                        />
                    </label>
                    <label className="font-semibold text-green-900">Color
                        <input type="text" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none" value={color} onChange={e => setColor(e.target.value)} maxLength={30} placeholder="e.g. Black, Blue, Red" />
                    </label>
                    <label className="font-semibold text-green-900">Contact Info (optional)
                        <input type="text" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none" value={contact} onChange={e => setContact(e.target.value)} maxLength={80} placeholder="Phone, email, or social handle" />
                    </label>
                    <div>
                        <span className="font-semibold text-green-900">Upload Image</span>
                        <div className="flex items-center gap-4 mt-2">
                            <button
                                type="button"
                                className="bg-cvsu-yellow text-green-900 font-bold px-4 py-2 rounded-lg shadow hover:bg-yellow-400 transition"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Choose Image
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                            {imagePreview && (
                                <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-row gap-4 mt-8">
                    <button
                        type="button"
                        className="w-1/2 bg-gray-200 hover:bg-gray-300 text-green-900 font-bold py-3 rounded-full shadow transition"
                        onClick={onClose}
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="w-1/2 bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-full shadow-lg transition disabled:opacity-60"
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
        </div>
    );
}
