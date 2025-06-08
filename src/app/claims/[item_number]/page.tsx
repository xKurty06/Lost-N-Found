"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/supabase/clients/client";
import { getUserFromCookie } from "@/utils/auth";
import { useToast } from "@/components/ui/ToastProvider";
import Image from "next/image";
import { use } from "react";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import ReactDOM from 'react-dom';
import HandleReview from '@/components/ui/HandleReview';

export default function ClaimDetailsPage(props: any) {
    // Unwrap params using use() from 'react' and type the result
    const params = use(props.params) as { item_number: string };
    const { item_number } = params;
    const [item, setItem] = useState<any>(null);
    const [claim, setClaim] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [reviewOpen, setReviewOpen] = useState<false | 'accept' | 'reject'>(false);
    const { showToast } = useToast();
    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const supabase = createClient();
            // Fetch item by item_number
            const { data: items, error: itemError } = await supabase
                .from("items")
                .select("*, users: user_id (username)", { count: "exact" })
                .eq("item_number", item_number)
                .limit(1);
            if (itemError || !items || items.length === 0) {
                showToast("Item not found.", "error");
                setLoading(false);
                return;
            }
            setItem(items[0]);
            // Fetch latest pending_claim for this item, including claimer's username
            const { data: claims, error: claimError } = await supabase
                .from("pending_claims")
                .select("*, users: claimer_id (username)")
                .eq("item_id", items[0].id)
                .order("submitted_at", { ascending: false })
                .limit(1);
            if (!claimError && claims && claims.length > 0) {
                setClaim(claims[0]);
            } else {
                setClaim(null);
            }
            setLoading(false);
        }
        fetchData();
    }, [item_number]);

    // Add refresh function
    async function refreshDetails() {
        setLoading(true);
        const supabase = createClient();
        // Fetch item by item_number
        const { data: items, error: itemError } = await supabase
            .from("items")
            .select("*, users: user_id (username)", { count: "exact" })
            .eq("item_number", item_number)
            .limit(1);
        if (itemError || !items || items.length === 0) {
            showToast("Item not found.", "error");
            setLoading(false);
            return;
        }
        setItem(items[0]);
        // Fetch latest pending_claim for this item
        const { data: claims, error: claimError } = await supabase
            .from("pending_claims")
            .select("*")
            .eq("item_id", items[0].id)
            .order("submitted_at", { ascending: false })
            .limit(1);
        if (!claimError && claims && claims.length > 0) {
            setClaim(claims[0]);
        } else {
            setClaim(null);
        }
        setLoading(false);
    }

    useEffect(() => {
        const user = getUserFromCookie();
        if (!user || (!['admin', 'staff'].includes(user.role) && (!item || user.id !== item.user_id))) {
            showToast('Access denied.', 'error');
            router.replace('/lost-item');
        }
    }, [item]);

    if (loading) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
            <div className="flex flex-col items-center justify-center">
                <div className="lds-dual-ring border-green-600" aria-label="Loading"></div>
                <span className="mt-4 text-green-900 text-xl font-bold drop-shadow">Loading details...</span>
            </div>
            <style>{`
                .lds-dual-ring {
                  display: inline-block;
                  width: 64px;
                  height: 64px;
                }
                .lds-dual-ring:after {
                  content: " ";
                  display: block;
                  width: 48px;
                  height: 48px;
                  margin: 8px;
                  border-radius: 50%;
                  border: 6px solid #059669;
                  border-color: #059669 transparent #059669 transparent;
                  animation: lds-dual-ring 1.2s linear infinite;
                }
                @keyframes lds-dual-ring {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
    if (!item) return <div className="text-center py-12 text-red-600">Item not found.</div>;

    // DescriptionWithPopover component (from lost/found item page)
    function DescriptionWithPopover({ description }: { description: string }) {
        const [open, setOpen] = React.useState(false);
        const spanRef = React.useRef<HTMLSpanElement>(null);
        const popoverRef = React.useRef<HTMLDivElement>(null);
        const buttonRef = React.useRef<HTMLButtonElement>(null);
        const [truncated, setTruncated] = React.useState(false);
        const [popoverStyle, setPopoverStyle] = React.useState<React.CSSProperties>({});

        React.useEffect(() => {
            function recalc() {
                if (spanRef.current) {
                    setTruncated(spanRef.current.scrollWidth > spanRef.current.clientWidth);
                }
            }
            recalc();
            window.addEventListener('resize', recalc);
            window.addEventListener('orientationchange', recalc);
            return () => {
                window.removeEventListener('resize', recalc);
                window.removeEventListener('orientationchange', recalc);
            };
        }, [description]);

        React.useEffect(() => {
            if (open && buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                const popoverWidth = 320;
                const minWidth = 220;
                const viewportWidth = window.innerWidth;
                let left = rect.left + window.scrollX + rect.width / 2 - popoverWidth / 2;
                if (left < 8) left = 8;
                if (left + popoverWidth > viewportWidth - 8) left = viewportWidth - popoverWidth - 8;
                setPopoverStyle({
                    position: 'absolute',
                    left,
                    top: rect.bottom + 6 + window.scrollY,
                    zIndex: 1000,
                    minWidth,
                    maxWidth: popoverWidth,
                });
            }
        }, [open]);

        React.useEffect(() => {
            if (!open) return;
            function handleClick(e: MouseEvent) {
                if (
                    popoverRef.current &&
                    !popoverRef.current.contains(e.target as Node) &&
                    buttonRef.current &&
                    !buttonRef.current.contains(e.target as Node)
                ) {
                    setOpen(false);
                }
            }
            document.addEventListener('mousedown', handleClick);
            return () => {
                document.removeEventListener('mousedown', handleClick);
            };
        }, [open]);

        let portal = null;
        if (open && typeof window !== 'undefined') {
            portal = ReactDOM.createPortal(
                <div
                    ref={popoverRef}
                    className="bg-white rounded-xl shadow-2xl border border-green-200 p-4 animate-fadein-up"
                    tabIndex={-1}
                    role="dialog"
                    style={popoverStyle}
                >
                    <h3 className="text-xl font-bold mb-2 text-green-700">Full Description</h3>
                    <div className="text-xl prose max-h-48 overflow-y-auto text-gray-800 mb-2 whitespace-pre-line break-words">{description}</div>
                    <div className="flex justify-end">
                        <button onClick={() => setOpen(false)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 font-semibold text-xs">Close</button>
                    </div>
                </div>,
                document.body
            );
        }

        return (
            <>
                <div className="flex items-center gap-0">
                    <span className="break-words whitespace-pre-line pr-2 text-gray-800 text-base md:text-xl" style={{ maxWidth: 300, display: 'inline-block', verticalAlign: 'middle', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} ref={spanRef} title={description}>
                        {description}
                    </span>
                    {truncated && (
                        <button
                            className="text-cvsu-yellow underline ml-1 text-xs"
                            style={{ paddingLeft: 0 }}
                            onClick={() => setOpen(v => !v)}
                            type="button"
                            ref={buttonRef}
                            aria-haspopup="dialog"
                            aria-expanded={open}
                        >
                            See more
                        </button>
                    )}
                </div>
                {portal}
            </>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col">
            {/* Fixed background image */}
            <div className="fixed inset-0 w-full h-full -z-10">
                <Image
                    src="/images/cvsu-homebg.jpg"
                    alt="Cavite State University Background"
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="100vw"
                    quality={100}
                />
            </div>
            {/* Main content scrolls, bg stays fixed */}
            <div className="flex-1 w-full max-w-6xl mx-auto pt-10 px-10 relative z-10">
                <div className="bg-white/95 rounded-3xl shadow-2xl w-full p-10 border-4 border-green-800 backdrop-blur-lg mt-14 mb-12 flex flex-col gap-8 transition-all duration-300 relative">
                    <div className="flex items-center gap-2 mb-0">
                        <button
                            className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white rounded-full shadow-md hover:bg-green-800 transition-colors text-base font-semibold"
                            onClick={() => router.back()}
                            type="button"
                            aria-label="Back"
                        >
                            <img src="/icons/arrow_left.svg" alt="Back" className="w-5 h-5" />
                            Back
                        </button>
                        <button
                            type="button"
                            className="ml-0 p-0 flex items-center hover:bg-gray-100 rounded-full transition"
                            aria-label="Refresh items"
                            title="Refresh items"
                            style={{ minWidth: '2.5rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            onClick={refreshDetails}
                        >
                            <img src="/icons/refresh.svg" alt="Refresh" className="w-6 h-6" style={{ filter: 'invert(36%) sepia(94%) saturate(453%) hue-rotate(88deg) brightness(70%) contrast(91%)', minWidth: '1.5rem', minHeight: '1.5rem' }} />
                        </button>
                    </div>
                    <div className="mb-0">
                        <h1 className="text-3xl md:text-4xl font-bold text-green-900 flex items-center gap-3 drop-shadow-lg ml-2">
                            <img
                                src="/icons/details.svg"
                                alt="Details"
                                className="w-10 h-10 inline-block"
                                style={{ filter: "invert(24%) sepia(97%) saturate(1162%) hue-rotate(77deg) brightness(60%) contrast(92%)" }}
                            />
                            Claim Details for Item #{String(item.item_number).padStart(6, "0")}
                        </h1>
                    </div>
                    {/* Restore left-right column layout for details */}
                    <div className="flex flex-col lg:flex-row gap-10 w-full">
                        {/* Item Details (Left) */}
                        <div className="flex-1 flex flex-col items-center bg-[#f7fafc] rounded-2xl p-6 border border-green-200 shadow-md min-w-[320px]">
                            <h2 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2">
                                <img src="/icons/info.svg" alt="Item" className="w-7 h-7 inline-block" style={{ filter: "invert(24%) sepia(97%) saturate(1162%) hue-rotate(77deg) brightness(60%) contrast(92%)" }} />
                                <span >Item Info</span>
                            </h2>
                            <div className="w-40 h-40 relative rounded-xl overflow-hidden border-2 border-green-100 bg-white mb-0">
                                <Zoom>
                                    <img
                                        src={item.image_url || "/images/logo.png"}
                                        alt={item.title}
                                        className="object-cover w-full h-full aspect-square bg-white"
                                        style={{ cursor: 'pointer', objectFit: 'cover', width: '100%', height: '100%', background: 'white' }}
                                    />
                                </Zoom>
                                <button
                                    type="button"
                                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow-md z-10"
                                    aria-label="Expand image"
                                    onClick={e => {
                                        e.stopPropagation();
                                        e.currentTarget.parentElement?.querySelector('img')?.click();
                                    }}
                                >
                                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2m-8 0H6a2 2 0 01-2-2v-2" />
                                    </svg>
                                </button>
                            </div>
                            <div className="text-green-700 font-bold text-base md:text-lg mb-2">#{String(item.item_number).padStart(6, "0")}</div>
                            <div className="flex flex-col gap-1 text-gray-800 text-base md:text-xl w-full">
                                <div><span className="font-bold text-green-700">Title:</span> {item.title}</div>
                                <div>
                                    <span className="font-bold text-green-700">Description: </span>
                                    <DescriptionWithPopover description={item.description} />
                                </div>
                                <div><span className="font-bold text-green-700">Location:</span> {item.location}</div>
                                <div><span className="font-bold text-green-700">Color:</span> {Array.isArray(item.color) ? item.color.join(", ") : item.color}</div>
                                <div><span className="font-bold text-green-700">Date Found:</span> {item.date_time_found ? new Date(item.date_time_found).toLocaleString() : "-"}</div>
                                <div><span className="font-bold text-green-700">Status:</span> {item.status}</div>
                                <div><span className="font-bold text-green-700">Last Updated:</span> {item.updated_at ? new Date(item.updated_at).toLocaleString() : "-"}</div>
                                <div><span className="font-bold text-green-700">Reporter:</span> {item.users?.username || '-'
                                }</div>
                                <div><span className="font-bold text-green-700">Brand:</span> {claim?.brand || '-'}</div>
                            </div>
                        </div>
                        {/* Claimer Details (Right) */}
                        <div className="flex-1 flex flex-col items-center bg-[#f7fafc] rounded-2xl p-6 border border-green-200 shadow-md min-w-[320px]">
                            <h2 className="text-xl font-bold text-green-800 mb-3 flex items-center gap-2">
                                <img src="/icons/profile.svg" alt="Profile" className="w-7 h-7 inline-block" />
                                Claimer Details
                            </h2>
                            {claim ? (
                                <>
                                    <div className="flex flex-col gap-1 text-gray-800 text-base md:text-xl w-full">
                                        <div><span className="font-bold text-green-700">Name:</span> {claim.full_name}</div>
                                        <div><span className="font-bold text-green-700">Username:</span> {claim.users?.username || '-'}</div>
                                        <div><span className="font-bold text-green-700">Student number:</span> {claim.student_number}</div>
                                        <div><span className="font-bold text-green-700">Contact:</span> {claim.contact_number}</div>
                                        <div><span className="font-bold text-green-700">Email:</span> {claim.email}</div>
                                        <div>
                                            <span className="font-bold text-green-700">Description: </span>
                                            <DescriptionWithPopover description={claim.description} />
                                        </div>
                                        <div>
                                            <span className="font-bold text-green-700">Characteristics:</span>
                                            <DescriptionWithPopover description={claim.characteristics} />
                                        </div>
                                        <div><span className="font-bold text-green-700">Submitted At:</span> {claim.submitted_at ? new Date(claim.submitted_at).toLocaleString() : '-'}</div>
                                    </div>
                                    <div className="flex gap-4 mt-4 w-full justify-center">
                                        <div>
                                            <span className="font-bold text-green-700">Proof Image:</span>
                                            <div className="w-28 h-28 relative mt-2 rounded-xl border-2 border-green-100 overflow-hidden bg-white shadow-sm">
                                                <Zoom>
                                                    <img
                                                        src={claim.proof_image_url || "/images/logo.png"}
                                                        alt="Proof"
                                                        className="object-cover w-full h-full aspect-square bg-white"
                                                        style={{ cursor: 'pointer', objectFit: 'cover', width: '100%', height: '100%', background: 'white' }}
                                                    />
                                                </Zoom>
                                                <button
                                                    type="button"
                                                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow-md z-10"
                                                    aria-label="Expand image"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        e.currentTarget.parentElement?.querySelector('img')?.click();
                                                    }}
                                                >
                                                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2m-8 0H6a2 2 0 01-2-2v-2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="font-bold text-green-700">Student ID:</span>
                                            <div className="w-28 h-28 relative mt-2 rounded-xl border-2 border-green-100 overflow-hidden bg-white shadow-sm">
                                                <Zoom>
                                                    <img
                                                        src={claim.student_id_image_url || "/images/logo.png"}
                                                        alt="Student ID"
                                                        className="object-cover w-full h-full aspect-square bg-white"
                                                        style={{ cursor: 'pointer', objectFit: 'cover', width: '100%', height: '100%', background: 'white' }}
                                                    />
                                                </Zoom>
                                                <button
                                                    type="button"
                                                    className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow-md z-10"
                                                    aria-label="Expand image"
                                                    onClick={e => {
                                                        e.stopPropagation();
                                                        e.currentTarget.parentElement?.querySelector('img')?.click();
                                                    }}
                                                >
                                                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2m-8 0H6a2 2 0 01-2-2v-2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-gray-500 text-base md:text-xl">No claim submitted for this item.</div>
                            )}
                        </div>
                    </div>
                    {/* Accept/Reject buttons for staff/admin only, if claim exists and item is pending */}
                    {claim && item.status === 'pending' && (
                        <div className="flex justify-center gap-6 mt-8">
                            <button
                                className="bg-green-700 text-white rounded-lg px-8 py-2 font-bold text-lg hover:bg-cvsu-yellow hover:text-green-900 transition focus:outline-none focus:ring-2 focus:ring-green-400"
                                onClick={() => setReviewOpen('accept')}
                            >
                                Accept
                            </button>
                            <button
                                className="bg-red-600 text-white rounded-lg px-8 py-2 font-bold text-lg hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-400"
                                onClick={() => setReviewOpen('reject')}
                            >
                                Reject
                            </button>
                        </div>
                    )}
                    {reviewOpen && (
                        <HandleReview
                            open={!!reviewOpen}
                            onClose={() => setReviewOpen(false)}
                            item={item}
                            modalType={reviewOpen}
                            onStatusChange={status => {
                                setReviewOpen(false);
                                refreshDetails();
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
