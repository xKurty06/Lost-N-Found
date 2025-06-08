import React, { useState, useRef } from 'react';
import { useToast } from './ToastProvider';
import { createClient } from '../../supabase/clients/client';
import Cookies from 'js-cookie';
import { getUserFromCookie, requireUserOrRedirect } from '../../utils/auth';
import { useRouter } from 'next/navigation';

// --- FIX: Move getLocalISOString OUTSIDE the component to avoid redefining it on every render ---
function getLocalISOString() {
    const now = new Date();
    now.setSeconds(0, 0);
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
}

const colorSwatchMap: Record<string, string> = {
    Tan: '#D2B48C',
    Charcoal: '#36454F',
    Bronze: '#CD7F32',
    Copper: '#B87333',
    Amber: '#FFBF00',
    Burgundy: '#800020',
    Ivory: '#FFFFF0',
    Azure: '#007FFF',
    Emerald: '#50C878',
    Sapphire: '#0F52BA',
    Ruby: '#E0115F',
    Rose: '#FF007F',
    'Sky Blue': '#87CEEB',
    Mustard: '#FFDB58',
    Plum: '#8E4585',
    Salmon: '#FA8072',
    Khaki: '#F0E68C',
    Denim: '#1560BD',
    Sand: '#C2B280',
    Chocolate: '#7B3F00',
    'Forest Green': '#228B22',
    Slate: '#708090',
    Lilac: '#C8A2C8',
    Seafoam: '#93E9BE',
    Crimson: '#DC143C',
    Fuchsia: '#FF00FF',
    Aqua: '#00FFFF',
    Periwinkle: '#CCCCFF',
    Eggplant: '#614051',
    Mauve: '#E0B0FF',
    Chartreuse: '#7FFF00',
    Apricot: '#FBCEB1',
    Cerulean: '#007BA7',
    Taupe: '#483C32',
    Steel: '#4682B4',
    Blush: '#DE5D83',
    'Mint Green': '#98FF98',
    Sunflower: '#FFDA03',
    Pumpkin: '#FF7518',
    Bubblegum: '#FFC1CC',
    'Indigo Blue': '#3F00FF',
    'Royal Blue': '#4169E1',
    Jade: '#00A86B',
    Onyx: '#353839',
    Pearl: '#EAE0C8',
    Rust: '#B7410E',
    Sienna: '#882D17',
    Topaz: '#FFC87C',
    Zaffre: '#0014A8',
    Amethyst: '#9966CC',
    Canary: '#FFFF99',
    Celeste: '#B2FFFF',
    Flamingo: '#FC8EAC',
    Honey: '#FFC30B',
    Jasmine: '#F8DE7E',
    Lemon: '#FFF700',
    Obsidian: '#0B0B0B',
    Opal: '#A8C3BC',
    Papaya: '#FFEFD5',
    Quartz: '#51484F',
    Raspberry: '#E30B5D',
    Scarlet: '#FF2400',
    Tangerine: '#F28500',
    Ultramarine: '#3F00FF',
    Vanilla: '#F3E5AB',
    Wisteria: '#C9A0DC',
    Xanadu: '#738678',
    'Yale Blue': '#0F4D92',
    Zucchini: '#506022',
    // fallback for common colors
    Black: '#000',
    White: '#FFF',
    Gray: '#808080',
    Red: '#FF0000',
    Blue: '#0000FF',
    Green: '#008000',
    Yellow: '#FFFF00',
    Orange: '#FFA500',
    Purple: '#800080',
    Pink: '#FFC0CB',
    Brown: '#A52A2A',
    Beige: '#F5F5DC',
    Cyan: '#00FFFF',
    Magenta: '#FF00FF',
    Maroon: '#800000',
    Navy: '#000080',
    Olive: '#808000',
    Teal: '#008080',
    Lime: '#00FF00',
    Gold: '#FFD700',
    Silver: '#C0C0C0',
    Violet: '#8F00FF',
    Indigo: '#4B0082',
    Turquoise: '#40E0D0',
};

export default function HandleReport({ open, onClose, onSubmit }: {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: any) => void;
}) {
    if (!open) return null;

    // HOOKS: All useState/useRef/useEffect at the top, before any function definitions or if (!open) return null
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [contact, setContact] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [agree, setAgree] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [modalTitle, setModalTitle] = useState('');
    const [modalStep, setModalStep] = useState<'none' | 'terms' | 'privacy'>('none');
    const [maxDate, setMaxDate] = useState(() => getLocalISOString());
    const [selectedColors, setSelectedColors] = useState<{ value: string; label: string }[]>([]);
    const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
    const [colorSearch, setColorSearch] = useState<string>('');
    const colorDropdownRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();
    const router = useRouter();

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

    React.useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (open) {
            setMaxDate(getLocalISOString());
            interval = setInterval(() => {
                setMaxDate(getLocalISOString());
            }, 60000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [open]);

    const colorOptions: { value: string; label: string }[] = [
        { value: 'Black', label: 'Black' }, { value: 'White', label: 'White' }, { value: 'Gray', label: 'Gray' }, { value: 'Red', label: 'Red' }, { value: 'Blue', label: 'Blue' }, { value: 'Green', label: 'Green' }, { value: 'Yellow', label: 'Yellow' }, { value: 'Orange', label: 'Orange' }, { value: 'Purple', label: 'Purple' }, { value: 'Pink', label: 'Pink' }, { value: 'Brown', label: 'Brown' }, { value: 'Beige', label: 'Beige' }, { value: 'Cyan', label: 'Cyan' }, { value: 'Magenta', label: 'Magenta' }, { value: 'Maroon', label: 'Maroon' }, { value: 'Navy', label: 'Navy' }, { value: 'Olive', label: 'Olive' }, { value: 'Teal', label: 'Teal' }, { value: 'Lime', label: 'Lime' }, { value: 'Gold', label: 'Gold' }, { value: 'Silver', label: 'Silver' }, { value: 'Violet', label: 'Violet' }, { value: 'Indigo', label: 'Indigo' }, { value: 'Turquoise', label: 'Turquoise' }, { value: 'Coral', label: 'Coral' }, { value: 'Peach', label: 'Peach' }, { value: 'Mint', label: 'Mint' }, { value: 'Lavender', label: 'Lavender' }, { value: 'Tan', label: 'Tan' }, { value: 'Charcoal', label: 'Charcoal' }, { value: 'Bronze', label: 'Bronze' }, { value: 'Copper', label: 'Copper' }, { value: 'Amber', label: 'Amber' }, { value: 'Burgundy', label: 'Burgundy' }, { value: 'Ivory', label: 'Ivory' }, { value: 'Azure', label: 'Azure' }, { value: 'Emerald', label: 'Emerald' }, { value: 'Sapphire', label: 'Sapphire' }, { value: 'Ruby', label: 'Ruby' }, { value: 'Rose', label: 'Rose' }, { value: 'Sky Blue', label: 'Sky Blue' }, { value: 'Mustard', label: 'Mustard' }, { value: 'Plum', label: 'Plum' }, { value: 'Salmon', label: 'Salmon' }, { value: 'Khaki', label: 'Khaki' }, { value: 'Denim', label: 'Denim' }, { value: 'Sand', label: 'Sand' }, { value: 'Chocolate', label: 'Chocolate' }, { value: 'Forest Green', label: 'Forest Green' }, { value: 'Slate', label: 'Slate' }, { value: 'Lilac', label: 'Lilac' }, { value: 'Seafoam', label: 'Seafoam' }, { value: 'Crimson', label: 'Crimson' }, { value: 'Fuchsia', label: 'Fuchsia' }, { value: 'Aqua', label: 'Aqua' }, { value: 'Periwinkle', label: 'Periwinkle' }, { value: 'Eggplant', label: 'Eggplant' }, { value: 'Mauve', label: 'Mauve' }, { value: 'Chartreuse', label: 'Chartreuse' }, { value: 'Apricot', label: 'Apricot' }, { value: 'Cerulean', label: 'Cerulean' }, { value: 'Taupe', label: 'Taupe' }, { value: 'Steel', label: 'Steel' }, { value: 'Blush', label: 'Blush' }, { value: 'Mint Green', label: 'Mint Green' }, { value: 'Sunflower', label: 'Sunflower' }, { value: 'Pumpkin', label: 'Pumpkin' }, { value: 'Bubblegum', label: 'Bubblegum' }, { value: 'Indigo Blue', label: 'Indigo Blue' }, { value: 'Royal Blue', label: 'Royal Blue' }, { value: 'Jade', label: 'Jade' }, { value: 'Onyx', label: 'Onyx' }, { value: 'Pearl', label: 'Pearl' }, { value: 'Rust', label: 'Rust' }, { value: 'Sienna', label: 'Sienna' }, { value: 'Topaz', label: 'Topaz' }, { value: 'Zaffre', label: 'Zaffre' }, { value: 'Amethyst', label: 'Amethyst' }, { value: 'Canary', label: 'Canary' }, { value: 'Celeste', label: 'Celeste' }, { value: 'Flamingo', label: 'Flamingo' }, { value: 'Honey', label: 'Honey' }, { value: 'Jasmine', label: 'Jasmine' }, { value: 'Lemon', label: 'Lemon' }, { value: 'Obsidian', label: 'Obsidian' }, { value: 'Opal', label: 'Opal' }, { value: 'Papaya', label: 'Papaya' }, { value: 'Quartz', label: 'Quartz' }, { value: 'Raspberry', label: 'Raspberry' }, { value: 'Scarlet', label: 'Scarlet' }, { value: 'Tangerine', label: 'Tangerine' }, { value: 'Ultramarine', label: 'Ultramarine' }, { value: 'Vanilla', label: 'Vanilla' }, { value: 'Wisteria', label: 'Wisteria' }, { value: 'Xanadu', label: 'Xanadu' }, { value: 'Yale Blue', label: 'Yale Blue' }, { value: 'Zucchini', label: 'Zucchini' }
    ].sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label

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

    React.useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (open) {
            setMaxDate(getLocalISOString());
            interval = setInterval(() => {
                setMaxDate(getLocalISOString());
            }, 60000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [open]);

    // Add this effect after colorDropdownRef and colorDropdownOpen are defined
    React.useEffect(() => {
        if (!colorDropdownOpen) return;
        function handleClickOutside(event: MouseEvent) {
            if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
                setColorDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [colorDropdownOpen]);

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }

    function handleImageRemove() {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Error validation
        if (!title.trim()) {
            showToast('Title is required.', 'error');
            return;
        }
        if (!description.trim()) {
            showToast('Description is required.', 'error');
            return;
        }
        if (!location.trim()) {
            showToast('Location is required.', 'error');
            return;
        }
        if (!date) {
            showToast('Date & Time Found is required.', 'error');
            return;
        }
        if (!contact.trim()) {
            showToast('Contact Info is required.', 'error');
            return;
        }
        if (!image) {
            showToast('Image is required.', 'error');
            return;
        }
        if (selectedColors.length === 0) {
            showToast('Please select at least 1 color.', 'error');
            setSubmitting(false);
            return;
        }
        if (selectedColors.length > 3) {
            showToast('You can select up to 3 colors only.', 'error');
            setSubmitting(false);
            return;
        }
        if (!agree) {
            showToast('You must accept the Terms and Privacy Policy.', 'error');
            return;
        }
        setSubmitting(true);

        const supabase = createClient();

        // 1. Get and increment next item_number from item_number table
        let item_number = 0;
        let itemNumberId = null;
        let fileName = '';
        try {
            // Fetch the current item number (assuming only one row exists)
            const { data: itemNumRow, error: fetchError } = await supabase.from('item_number').select('*').limit(1).single();
            if (fetchError || !itemNumRow) throw fetchError || new Error('No item_number row found');
            item_number = (itemNumRow.current_number || 0) + 1;
            itemNumberId = itemNumRow.id;
            // Update the item_number table with the new value
            const { error: updateError } = await supabase.from('item_number').update({ current_number: item_number }).eq('id', itemNumberId);
            if (updateError) throw updateError;
        } catch (err) {
            showToast('Failed to generate item number.', 'error');
            setSubmitting(false);
            return;
        }

        // 2. Upload image to Supabase Storage (bucket: 'item-images')
        let image_url = '';
        try {
            const fileExt = image.name.split('.').pop();
            fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
            const { data: uploadData, error: uploadError } = await supabase.storage.from('item-images').upload(fileName, image, {
                cacheControl: '3600',
                upsert: false
            });
            if (uploadError) throw uploadError;
            image_url = supabase.storage.from('item-images').getPublicUrl(fileName).data.publicUrl;
        } catch (err) {
            showToast('Failed to upload image.', 'error');
            setSubmitting(false);
            return;
        }

        // 3. Insert into items table using user from cookie
        const user = getUserFromCookie();
        if (!user || !user.id) {
            showToast('You must be logged in to submit a report.', 'error');
            setSubmitting(false);
            // Clean up uploaded image if user is not authenticated
            if (fileName) {
                await supabase.storage.from('item-images').remove([fileName]);
            }
            onClose();
            return;
        }
        const user_id = user.id;

        // Convert local datetime-local input to UTC ISO string for storage
        let date_time_found_utc = null;
        if (date) {
            // date is in format 'YYYY-MM-DDTHH:mm' (local time)
            const localDate = new Date(date);
            date_time_found_utc = localDate.toISOString(); // always UTC
        }

        const { error: insertError } = await supabase.from('items').insert([
            {
                user_id,
                title,
                description,
                location,
                date_time_found: date_time_found_utc, // store as UTC ISO string
                image_url,
                status: 'not_claimed',
                color: selectedColors.map(c => c.value), // store as array
                item_number,
                updated_at: new Date().toISOString(),
            }
        ]);
        if (insertError) {
            console.error('Supabase insert error:', insertError);
            showToast('Failed to submit report: ' + (insertError.message || insertError), 'error');
            setSubmitting(false);
            // Clean up uploaded image if DB insert fails
            if (fileName) {
                await supabase.storage.from('item-images').remove([fileName]);
            }
            return;
        }
        showToast('Report submitted successfully!', 'success');
        setSubmitting(false);
        onClose();
    }

    function openModal(type: 'terms' | 'policy') {
        if (type === 'terms') {
            setModalTitle('Terms and Conditions');
            setModalContent(require('../../legal/legal-contents').termsOfService);
            setModalStep('terms');
        } else if (type === 'policy') {
            setModalTitle('Privacy Policy');
            setModalContent(require('../../legal/legal-contents').privacyPolicy);
            setModalStep('privacy');
        }
        setModalOpen(true);
    }

    function handleAgree() {
        if (modalStep === 'terms') {
            setModalTitle('Privacy Policy');
            setModalContent(require('../../legal/legal-contents').privacyPolicy);
            setModalStep('privacy');
        } else if (modalStep === 'privacy') {
            setAgree(true);
            setModalOpen(false);
            setModalStep('none');
        }
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
                    <label className="font-semibold text-green-900">Color(s) <span className="text-red-500">*</span>
  <div className="relative" ref={colorDropdownRef}>
    <div className="flex gap-2 items-center w-full">
      <button
        type="button"
        className="mt-1 w-full border rounded-lg px-3 py-2 text-left bg-white focus:ring-2 focus:ring-cvsu-yellow outline-none flex justify-between items-center"
        onClick={() => setColorDropdownOpen(v => !v)}
      >
        <span className="truncate flex-1">
          {selectedColors.length > 0
            ? selectedColors.map(c => c.label).join(', ')
            : 'Select at least 1 color...'}
        </span>
        <span className="ml-2 text-gray-400">{colorDropdownOpen ? '▲' : '▼'}</span>
      </button>
      {selectedColors.length > 0 && (
        <button
          type="button"
          className="ml-2 text-red-500 hover:text-red-500/70 focus:outline-none"
          tabIndex={-1}
          aria-label="Clear selected colors"
          title='Clear selected colors'
          onClick={e => {
            e.stopPropagation();
            setSelectedColors([]);
          }}
        >
          ✕
        </button>
      )}
    </div>
    {colorDropdownOpen && (
      <div className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto bg-white border rounded-lg shadow-lg p-2">
                <input
                    type="text"
                    placeholder="Search colors..."
                    className="mb-2 w-full px-2 py-1 border rounded focus:ring-2 focus:ring-cvsu-yellow outline-none text-sm"
                    value={colorSearch || ''}
                    onChange={e => setColorSearch(e.target.value)}
                    autoFocus
                />
                <div className="grid grid-cols-2 gap-1">
                {colorOptions
                    .filter(option => !colorSearch || option.label.toLowerCase().includes(colorSearch.toLowerCase()))
                    .map(option => {
                        const isChecked = selectedColors.some(c => c.value === option.value);
                        const isDisabled = !isChecked && selectedColors.length >= 3;
                        return (
                            <label key={option.value} className={`flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    disabled={isDisabled}
                                    onChange={e => {
                                        if (e.target.checked) {
                                            setSelectedColors(prev => [...prev, option]);
                                        } else {
                                            setSelectedColors(prev => prev.filter(c => c.value !== option.value));
                                        }
                                    }}
                                />
                                <span>{option.label}</span>
                                <span className="inline-block w-3 h-3 rounded-full border border-green-700 ml-2" style={{ background: colorSwatchMap[option.label] || option.value.toLowerCase() }}></span>
                            </label>
                        );
                    })}
                </div>
            </div>
        )}
    </div>
    <span className="text-xs text-gray-600 block mt-1">Choose 1 to 3 colors.</span>
</label>
                    <label className="font-semibold text-green-900">Location Found<span className="text-red-500">*</span>
                        <input type="text" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none" value={location} onChange={e => setLocation(e.target.value)} required maxLength={80} placeholder="e.g. Library, DIT Building, Eco Park, Near bleachers, etc." />
                    </label>
                    <label className="font-semibold text-green-900">Date & Time Found<span className="text-red-500">*</span>
                        <input
                            type="datetime-local"
                            className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            required
                            max={maxDate}
                            placeholder="Select date and time"
                        />
                    </label>
                    <label className="font-semibold text-green-900">Contact Info<span className="text-red-500">*</span>
                        <input type="text" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none" value={contact} onChange={e => setContact(e.target.value)} required maxLength={80} placeholder="Phone, email, or social handle" />
                    </label>
                    <div>
                        <span className="font-semibold text-green-900">Upload Image <span className="text-red-500">*</span></span>
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
                                required
                            />
                            {imagePreview && (
                                <div className="relative inline-block">
                                    <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border" />
                                    <button
                                        type="button"
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-700 focus:outline-none"
                                        onClick={handleImageRemove}
                                        aria-label="Remove image"
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </div>
                        {!image && (
                            <span className="text-xs text-red-600 mt-1 block">Image is required.</span>
                        )}
                    </div>
                    <div className="flex items-center mt-2">
                        <input
                            type="checkbox"
                            id="agree"
                            name="agree"
                            required
                            checked={agree}
                            onChange={e => {
                                if (!agree) {
                                    openModal('terms');
                                } else {
                                    setAgree(false);
                                }
                            }}
                            className="mr-2 accent-cvsu-yellow scale-125 focus:ring-2 focus:ring-cvsu-yellow focus:outline-none transition duration-150"
                        />
                        <label htmlFor="agree" className="text-xs select-none text-green-900">
                            I accept the{' '}
                            <span
                                className="underline underline-offset-2 decoration-cvsu-yellow text-green-900 hover:text-cvsu-yellow font-semibold cursor-pointer transition-colors duration-150"
                                onClick={e => { e.preventDefault(); openModal('terms'); }}
                                tabIndex={0}
                                role="button"
                                aria-label="View Terms and Conditions"
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal('terms'); } }}
                            >
                                Terms and Condition
                            </span>
                            {' '}and{' '}
                            <span
                                className="underline underline-offset-2 decoration-cvsu-yellow text-green-900 hover:text-cvsu-yellow font-semibold cursor-pointer transition-colors duration-150"
                                onClick={e => { e.preventDefault(); openModal('policy'); }}
                                tabIndex={0}
                                role="button"
                                aria-label="View Privacy Policy"
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal('policy'); } }}
                            >
                                Privacy Policy
                            </span>.
                        </label>
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
                        disabled={submitting || !agree}
                    >
                        {submitting ? 'Submitting...' : 'Submit'}
                    </button>
                </div>
            </form>
            {modalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadein-up">
            <h3 className="text-xl font-bold mb-4 text-green-700">{modalTitle}</h3>
            <div className="prose max-h-80 overflow-y-auto text-gray-800 mb-6">{modalContent}</div>
            <div className="flex justify-end gap-2">
                <button onClick={() => { setModalOpen(false); setModalStep('none'); }} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 font-semibold">{modalStep === 'none' ? 'Close' : 'Cancel'}</button>
                {modalStep !== 'none' && <button onClick={handleAgree} className="px-4 py-2 rounded bg-cvsu-yellow text-green-900 font-bold hover:bg-yellow-400">Agree</button>}
            </div>
        </div>
    </div>
)}
        </div>
    );
}
