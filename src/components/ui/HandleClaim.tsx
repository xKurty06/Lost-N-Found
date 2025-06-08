'use client';

import React, { useState, useRef, useEffect } from 'react';
import { termsOfService, privacyPolicy } from '../../legal/legal-contents';
import { useToast } from './ToastProvider';
import Cookies from 'js-cookie';
import { getUserFromCookie, requireUserOrRedirect } from '../../utils/auth';

export default function HandleClaim({ open, onClose, onSubmit, claimItem }: {
    open: boolean;
    onClose: () => void;
    onSubmit?: (data: any) => void;
    claimItem?: any;
}) {
    const [reason, setReason] = useState('');
    const [characteristics, setCharacteristics] = useState('');
    const [brand, setBrand] = useState('');
    const [name, setName] = useState('');
    const [studentNumber, setStudentNumber] = useState('');
    const [phone, setPhone] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [idImage, setIdImage] = useState<File | null>(null);
    const [idImagePreview, setIdImagePreview] = useState<string | null>(null);
    const [agree, setAgree] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<React.ReactNode>(null);
    const [modalTitle, setModalTitle] = useState('');
    const [modalStep, setModalStep] = useState<'none' | 'terms' | 'privacy'>('none');
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const idFileInputRef = useRef<HTMLInputElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const termsModalRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();
    const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;

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

    useEffect(() => {
        if (!open) return;
        function handleClickOutside(e: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [open, onClose]);
    useEffect(() => {
        if (!modalOpen) return;
        function handleClickOutside(e: MouseEvent) {
            if (termsModalRef.current && !termsModalRef.current.contains(e.target as Node)) {
                setModalOpen(false);
                setModalStep('none');
            }
        }
        function handleEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setModalOpen(false);
                setModalStep('none');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [modalOpen]);

    if (!open) return null;

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    }

    function handleIdImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setIdImage(file);
            setIdImagePreview(URL.createObjectURL(file));
        }
    }

    function openModal(type: 'terms' | 'policy') {
        if (type === 'terms') {
            setModalTitle('Terms and Conditions');
            setModalContent(termsOfService);
            setModalStep('terms');
        } else if (type === 'policy') {
            setModalTitle('Privacy Policy');
            setModalContent(privacyPolicy);
            setModalStep('privacy');
        }
        setModalOpen(true);
    }

    function handleAgree() {
        if (modalStep === 'terms') {
            setModalTitle('Privacy Policy');
            setModalContent(privacyPolicy);
            setModalStep('privacy');
        } else if (modalStep === 'privacy') {
            setAgree(true);
            setModalOpen(false);
            setModalStep('none');
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        // Validation for all fields
        if (!reason.trim()) {
            showToast('Please state why this item is yours.', 'error');
            return;
        }
        if (!characteristics.trim()) {
            showToast('Please describe the characteristics of the item.', 'error');
            return;
        }
        if (!brand.trim()) {
            showToast('Please enter the brand of the item.', 'error');
            return;
        }
        if (!image) {
            showToast('Image proof is required.', 'error');
            return;
        }
        if (!idImage) {
            showToast('ID image is required.', 'error');
            return;
        }
        if (!name.trim()) {
            showToast('Name is required.', 'error');
            return;
        }
        if (!studentNumber.trim()) {
            showToast('Student Number is required.', 'error');
            return;
        }
        if (!phone.trim()) {
            showToast('Phone Number is required.', 'error');
            return;
        }
        if (!agree) {
            showToast('You must accept the Terms and Privacy Policy.', 'error');
            return;
        }
        setSubmitting(true);
        try {
            // Get user info from cookie
            const user = getUserFromCookie();
            if (!user) {
                showToast('You must be logged in to claim an item.', 'error');
                setSubmitting(false);
                return;
            }
            // Get the item being claimed from prop
            const item = claimItem;
            if (!item || !item.id) {
                showToast('No item selected for claim.', 'error');
                setSubmitting(false);
                return;
            }
            // Upload images to Supabase Storage (bucket: 'claim-images')
            const supabase = require('@/supabase/clients/client').createClient();
            const proofFileName = `proof_${item.id}_${Date.now()}`;
            const idFileName = `id_${item.id}_${Date.now()}`;
            let proofImageUrl = '';
            let idImageUrl = '';
            // Upload proof image
            const { data: proofUpload, error: proofError } = await supabase.storage.from('claim-images').upload(proofFileName, image);
            if (proofError) throw new Error('Failed to upload proof image.');
            proofImageUrl = supabase.storage.from('claim-images').getPublicUrl(proofFileName).publicUrl;
            // Upload ID image
            const { data: idUpload, error: idError } = await supabase.storage.from('claim-images').upload(idFileName, idImage);
            if (idError) throw new Error('Failed to upload ID image.');
            idImageUrl = supabase.storage.from('claim-images').getPublicUrl(idFileName).publicUrl;
            // Insert into pending_claims
            const { error: insertError } = await supabase.from('pending_claims').insert({
                item_id: item.id,
                claimer_id: user.id,
                full_name: name,
                contact_number: phone,
                email: user.email || '',
                proof_image_url: proofImageUrl,
                student_id_image_url: idImageUrl,
                legal_agreement: true,
                status: 'pending',
            });
            if (insertError) throw new Error('Failed to submit claim.');
            // Update item status to 'pending'
            await supabase.from('items').update({ status: 'pending' }).eq('id', item.id);
            showToast('Claim submitted!', 'success');
            if (onSubmit) onSubmit({ itemId: item.id });
            setSubmitting(false);
            onClose();
        } catch (err: any) {
            showToast(err.message || 'Failed to submit claim.', 'error');
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div ref={modalRef} className="w-full max-w-lg">
                <form
                    className="bg-white shadow-2xl p-8 w-full relative animate-fadein-up mt-20 max-h-[90vh] overflow-y-auto rounded-2xl flex flex-col"
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
                    <h2 className="text-2xl font-extrabold text-green-800 mb-6 text-center">Claim Item</h2>
                    <div className="flex flex-col gap-4">
                        <label className="font-semibold text-green-900">Please state why this item is yours<span className="text-red-500">*</span>
                            <textarea className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none resize-none" value={reason} onChange={e => setReason(e.target.value)} required rows={3} maxLength={300} placeholder="Describe the item in as much detail as possible, especially what is not visible or has not been described." />
                        </label>
                        <label className="font-semibold text-green-900">Can you describe the characteristics of the item?<span className="text-red-500">*</span>
                            <input type="text" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none" value={characteristics} onChange={e => setCharacteristics(e.target.value)} required maxLength={100} placeholder="e.g. Has a scratch, sticker, etc." />
                        </label>
                        <label className="font-semibold text-green-900">What is the Brand of the item?<span className="text-red-500">*</span>
                            <input type="text" className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none" value={brand} onChange={e => setBrand(e.target.value)} required maxLength={50} placeholder="e.g. Nike, Adidas, etc." />
                        </label>
                        <div>
                            <span className="font-semibold text-green-900">Upload Image for Proof <span className="text-red-600">*</span></span>
                            <div className="flex items-center gap-4 mt-2">
                                <button
                                    type="button"
                                    className="bg-cvsu-yellow text-green-900 font-bold px-4 py-2 rounded-lg shadow hover:bg-yellow-400 transition"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    Choose file
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
                                            onClick={() => { setImage(null); setImagePreview(null); }}
                                            aria-label="Remove image"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                            {!image && (
                                <span className="text-xs text-red-600 mt-1 block">Image proof is required.</span>
                            )}
                        </div>
                        <div>
                            <span className="font-semibold text-green-900">Upload your Student ID <span className="text-red-600">*</span></span>
                            <div className="flex items-center gap-4 mt-2">
                                <button
                                    type="button"
                                    className="bg-cvsu-yellow text-green-900 font-bold px-4 py-2 rounded-lg shadow hover:bg-yellow-400 transition"
                                    onClick={() => idFileInputRef.current?.click()}
                                >
                                    Choose file
                                </button>
                                <input
                                    ref={idFileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleIdImageChange}
                                    required
                                />
                                {idImagePreview && (
                                    <div className="relative inline-block">
                                        <img src={idImagePreview} alt="ID Preview" className="w-16 h-16 object-cover rounded-lg border" />
                                        <button
                                            type="button"
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-700 focus:outline-none"
                                            onClick={() => { setIdImage(null); setIdImagePreview(null); }}
                                            aria-label="Remove ID image"
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                            {!idImage && (
                                <span className="text-xs text-red-600 mt-1 block">Student ID is required.</span>
                            )}
                        </div>
                        <label className="font-semibold text-green-900">Name<span className="text-red-500">*</span>
                            <input
                                type="text"
                                className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                maxLength={50}
                                placeholder="e.g. John Doe"
                            />
                        </label>
                        <label className="font-semibold text-green-900">Student Number<span className="text-red-500">*</span>
                            <input
                                type="text"
                                className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none"
                                value={studentNumber}
                                onChange={e => setStudentNumber(e.target.value)}
                                required
                                maxLength={20}
                                placeholder="e.g. 202401234"
                            />
                        </label>
                        <label className="font-semibold text-green-900">Contact Number<span className="text-red-500">*</span>
                            <input
                                type="text"
                                className="mt-1 w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-cvsu-yellow outline-none"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                required
                                maxLength={20}
                                placeholder="e.g. 0966 123 4567"
                            />
                        </label>
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
                            {submitting ? 'Submitting...' : 'Submit My Claim'}
                        </button>
                    </div>
                </form>
            </div>
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fadein-up" ref={termsModalRef}>
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
