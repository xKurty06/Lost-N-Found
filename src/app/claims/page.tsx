"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { usePathname } from 'next/navigation';
import { createClient } from '@/supabase/clients/client';
import ReactDOM from 'react-dom';
import { useToast } from '@/components/ui/ToastProvider';
import { getUserFromCookie } from '@/utils/auth';

export default function ClaimsPage() {
	const pathname = usePathname();
	const [search, setSearch] = useState("");
	const [pendingSearch, setPendingSearch] = useState("");
	const [sort, setSort] = useState("recent");
	const [showSortOptions, setShowSortOptions] = useState(false);
	const [items, setItems] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [copiedItemNumber, setCopiedItemNumber] = useState<string | null>(null);
	const [showScrollButton, setShowScrollButton] = useState(false);
	const sortDropdownRef = useRef<HTMLDivElement>(null);
	const { showToast } = useToast();

	const sortOptions = [
		{ value: "recent", label: "Most Recent" },
		{ value: "oldest", label: "Oldest" },
		{ value: "title", label: "Title (A-Z)" },
		{ value: "color", label: "Color" }
	];

	useEffect(() => {
		async function fetchItems() {
			setLoading(true);
			const user = getUserFromCookie();
			if (!user) {
				setItems([]);
				setLoading(false);
				return;
			}
			const supabase = createClient();
			let query = supabase
				.from('items')
				.select('*, users: user_id (username)')
				.eq('status', 'pending');
			if (user.role !== 'staff' && user.role !== 'admin') {
				query = query.eq('user_id', user.id);
			}
			const { data, error } = await query.order('date_time_found', { ascending: false });
			if (!error && data) {
				setItems(data);
			} else {
				setItems([]);
			}
			setLoading(false);
		}
		fetchItems();
	}, []);

	// Fetch pending claims for all items and mark items with hasPendingClaim
	useEffect(() => {
		async function fetchPendingClaims() {
			if (!items.length) return;
			const supabase = createClient();
			const itemIds = items.map(item => item.id);
			const { data: claims, error } = await supabase
				.from('pending_claims')
				.select('item_id')
				.in('item_id', itemIds);
			if (!error && claims) {
				const claimedIds = new Set(claims.map(c => c.item_id));
				setItems(prev => prev.map(item => ({ ...item, hasPendingClaim: claimedIds.has(item.id) })));
			}
		}
		fetchPendingClaims();
		// Only run when items change
	}, [items.length]);

	useEffect(() => {
		if (!showSortOptions) return;
		function handleClickOutside(e: MouseEvent) {
			if (sortDropdownRef.current && !(sortDropdownRef.current as any).contains(e.target)) {
				setShowSortOptions(false);
			}
		}
		function handleEscape(e: KeyboardEvent) {
			if (e.key === 'Escape') setShowSortOptions(false);
		}
		document.addEventListener('mousedown', handleClickOutside);
		document.addEventListener('keydown', handleEscape);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.removeEventListener('keydown', handleEscape);
		};
	}, [showSortOptions]);

	function sortItems(items: any[], sort: string) {
		switch (sort) {
			case "oldest":
				return [...items].sort((a, b) => new Date(a.date_time_found).getTime() - new Date(b.date_time_found).getTime());
			case "title":
				return [...items].sort((a, b) => a.title.localeCompare(b.title));
			case "color":
				return [...items].sort((a, b) => {
					const colorA = Array.isArray(a.color) ? (a.color[0] || '') : (a.color || '');
					const colorB = Array.isArray(b.color) ? (b.color[0] || '') : (b.color || '');
					return colorA.localeCompare(colorB);
				});
			case "recent":
			default:
				return [...items].sort((a, b) => new Date(b.date_time_found).getTime() - new Date(a.date_time_found).getTime());
		}
	}

	const [, forceUpdate] = React.useReducer(x => x + 1, 0);

	function handleSortSelect(option: string) {
		setSort(option);
		setShowSortOptions(false);
		forceUpdate();
	}

	const filteredItems = useMemo(() => {
		let filtered = items.filter(item => {
			// Only show items with available pending claims
			if (!item.hasPendingClaim) return false;
			const searchTerm = search.trim().toLowerCase();
			if (!searchTerm) return true;
			const inTitle = item.title?.toLowerCase().includes(searchTerm);
			const inDesc = item.description?.toLowerCase().includes(searchTerm);
			const inLoc = item.location?.toLowerCase().includes(searchTerm);
			const inColor = Array.isArray(item.color)
				? item.color.some((c: string) => c?.toLowerCase().includes(searchTerm))
				: item.color?.toLowerCase().includes(searchTerm);
			return inTitle || inDesc || inLoc || inColor;
		});
		return sortItems(filtered, sort);
	}, [search, sort, items]);

	// Debounced live search with loading effect
	const searchTimeout = useRef<NodeJS.Timeout | null>(null);
	const [searchLoading, setSearchLoading] = useState(false);
	useEffect(() => {
		if (pendingSearch !== search) {
			setSearchLoading(true);
			if (searchTimeout.current) clearTimeout(searchTimeout.current);
			searchTimeout.current = setTimeout(() => {
				setSearch(pendingSearch);
				setSearchLoading(false);
			}, 300);
		}
		return () => {
			if (searchTimeout.current) clearTimeout(searchTimeout.current);
		};
	}, [pendingSearch]);

	useEffect(() => {
		const handleScroll = () => {
			setShowScrollButton(window.scrollY > 300);
		};
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	function formatPHDate(dateString: string) {
		if (!dateString) return '';
		const date = new Date(dateString);
		return date.toLocaleString('en-PH', {
			year: 'numeric', month: 'short', day: 'numeric',
			hour: '2-digit', minute: '2-digit', hour12: true,
			timeZone: 'Asia/Manila'
		});
	}

	function DescriptionWithPopover({ description }: { description: string }) {
		const [open, setOpen] = useState(false);
		const spanRef = useRef<HTMLSpanElement>(null);
		const popoverRef = useRef<HTMLDivElement>(null);
		const buttonRef = useRef<HTMLButtonElement>(null);
		const [truncated, setTruncated] = useState(false);
		const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});

		useEffect(() => {
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

		useEffect(() => {
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

		useEffect(() => {
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

		return (
			<span className="text-xs flex items-center gap-1 relative">
				<svg className="inline w-4 h-4 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" d="M16.862 2.487a2.25 2.25 0 0 1 3.182 3.182l-12.2 12.2a2.25 2.25 0 0 1-.796.51l-4.13 1.377a.75.75 0 0 1-.948-.948l1.377-4.13a2.25 2.25 0 0 1 .51-.796l12.2-12.2Zm2.121 1.06a.75.75 0 0 0-1.06 0l-12.2 12.2a.75.75 0 0 0-.17.266l-1.13 3.39 3.39-1.13a.75.75 0 0 0 .266-.17l12.2-12.2a.75.75 0 0 0 0-1.06Z" />
				</svg>
				<span className="text-green-700 font-semibold text-xs">Description:</span>{' '}
				<span
					className="break-words text-xs max-w-[135px] inline-block align-bottom truncate overflow-hidden whitespace-nowrap"
					ref={spanRef}
					title={description}
					style={{ userSelect: 'text' }}
				>
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
				{open && typeof window !== 'undefined' && ReactDOM.createPortal(
					<div
						ref={popoverRef}
						className="bg-white rounded-xl shadow-2xl border border-green-200 p-4 animate-fadein-up"
						tabIndex={-1}
						role="dialog"
						style={popoverStyle}
					>
						<h3 className="text-xs font-bold mb-2 text-green-700">Full Description</h3>
						<div className="text-xs prose max-h-48 overflow-y-auto text-gray-800 mb-2 whitespace-pre-line break-words">{description}</div>
						<div className="flex justify-end">
							<button onClick={() => setOpen(false)} className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 font-semibold text-xs">Close</button>
						</div>
					</div>,
					document.body
				)}
			</span>
		);
	}

	const refreshItems = async () => {
		setLoading(true);
		const user = getUserFromCookie();
		if (!user) {
			setItems([]);
			setLoading(false);
			return;
		}
		const supabase = createClient();
		let query = supabase
			.from('items')
			.select('*, users: user_id (username)')
			.eq('status', 'pending');
		if (user.role !== 'staff' && user.role !== 'admin') {
			query = query.eq('user_id', user.id);
		}
		const { data, error } = await query.order('date_time_found', { ascending: false });
		if (!error && data) {
			setItems(data);
		} else {
			setItems([]);
		}
		setLoading(false);
	};

	// Color swatch map (copied from HandleReport)
	const colorSwatchMap: Record<string, string> = {
		Tan: '#D2B48C', Charcoal: '#36454F', Bronze: '#CD7F32', Copper: '#B87333', Amber: '#FFBF00', Burgundy: '#800020', Ivory: '#FFFFF0', Azure: '#007FFF', Emerald: '#50C878', Sapphire: '#0F52BA', Ruby: '#E0115F', Rose: '#FF007F', 'Sky Blue': '#87CEEB', Mustard: '#FFDB58', Plum: '#8E4585', Salmon: '#FA8072', Khaki: '#F0E68C', Denim: '#1560BD', Sand: '#C2B280', Chocolate: '#7B3F00', 'Forest Green': '#228B22', Slate: '#708090', Lilac: '#C8A2C8', Seafoam: '#93E9BE', Crimson: '#DC143C', Fuchsia: '#FF00FF', Aqua: '#00FFFF', Periwinkle: '#CCCCFF', Eggplant: '#614051', Mauve: '#E0B0FF', Chartreuse: '#7FFF00', Apricot: '#FBCEB1', Cerulean: '#007BA7', Taupe: '#483C32', Steel: '#4682B4', Blush: '#DE5D83', 'Mint Green': '#98FF98', Sunflower: '#FFDA03', Pumpkin: '#FF7518', Bubblegum: '#FFC1CC', 'Indigo Blue': '#3F00FF', 'Royal Blue': '#4169E1', Jade: '#00A86B', Onyx: '#353839', Pearl: '#EAE0C8', Rust: '#B7410E', Sienna: '#882D17', Topaz: '#FFC87C', Zaffre: '#0014A8', Amethyst: '#9966CC', Canary: '#FFFF99', Celeste: '#B2FFFF', Flamingo: '#FC8EAC', Honey: '#FFC30B', Jasmine: '#F8DE7E', Lemon: '#FFF700', Obsidian: '#0B0B0B', Opal: '#A8C3BC', Papaya: '#FFEFD5', Quartz: '#51484F', Raspberry: '#E30B5D', Scarlet: '#FF2400', Tangerine: '#F28500', Ultramarine: '#3F00FF', Vanilla: '#F3E5AB', Wisteria: '#C9A0DC', Xanadu: '#738678', 'Yale Blue': '#0F4D92', Zucchini: '#506022', Black: '#000', White: '#FFF', Gray: '#808080', Red: '#FF0000', Blue: '#0000FF', Green: '#008000', Yellow: '#FFFF00', Orange: '#FFA500', Purple: '#800080', Pink: '#FFC0CB', Brown: '#A52A2A', Beige: '#F5F5DC', Cyan: '#00FFFF', Magenta: '#FF00FF', Maroon: '#800000', Navy: '#000080', Olive: '#808000', Teal: '#008080', Lime: '#00FF00', Gold: '#FFD700', Silver: '#C0C0C0', Violet: '#8F00FF', Indigo: '#4B0082', Turquoise: '#40E0D0', Coral: '#FF7F50', Peach: '#FFE5B4', Mint: '#98FF98', Lavender: '#E6E6FA'
	};

	return (
		<div className="min-h-screen w-full flex flex-col">
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
			<div className="flex-1 w-full max-w-5xl mx-auto pt-24 px-2 overflow-y-auto relative z-10">
				<div className="mb-8">
					<div className="flex flex-col gap-3 sm:hidden w-full px-2">
						<div className="flex w-full justify-center gap-2 mt-4">
							<Link
								href="/lost-item"
								className={`min-w-[110px] flex items-center justify-center gap-2 px-4 py-1.5 rounded-full font-semibold transition border-2 shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-sm ${pathname === "/lost-item" ? "bg-green-700 text-white border-green-700 pointer-events-none" : "bg-white text-green-700 border-green-700 hover:bg-green-50"}`}
								aria-current={pathname === "/lost-item" ? "page" : undefined}
							>
								Lost
							</Link>
							<Link
								href="/claims"
								className={`min-w-[110px] flex items-center justify-center gap-2 px-4 py-1.5 rounded-full font-semibold transition border-2 shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-sm ${pathname === "/claims" ? "bg-green-700 text-white border-green-700 pointer-events-none" : "bg-white text-green-700 border-green-700 hover:bg-green-50"}`}
								aria-current={pathname === "/claims" ? "page" : undefined}
							>
								Claims
							</Link>
							<Link
								href="/found-item"
								className={`min-w-[110px] flex items-center justify-center gap-2 px-4 py-1.5 rounded-full font-semibold transition border-2 shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-sm ${pathname === "/found-item" ? "bg-green-700 text-white border-green-700 pointer-events-none" : "bg-white text-green-700 border-green-700 hover:bg-green-50"}`}
								aria-current={pathname === "/found-item" ? "page" : undefined}
							>
								Found
							</Link>
						</div>
					</div>
					<div className="hidden sm:flex flex-row items-center justify-center gap-4">
						<div className="flex w-10/12 items-center justify-between gap-4 bg-white rounded-full px-4 py-2 shadow">
							<div className="flex gap-2 mr-4 items-center">
								<Link
									href="/lost-item"
									className={`min-w-[90px] flex items-center justify-center gap-2 px-4 py-1.5 rounded-full font-bold font-sans transition border-2 shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-sm ${pathname === "/lost-item" ? "bg-green-700 text-white border-green-700 scale-105 pointer-events-none" : "bg-white text-green-700 border-green-700 hover:bg-green-50 hover:scale-105"}`}
									aria-current={pathname === "/lost-item" ? "page" : undefined}
								>
									Lost
								</Link>
								<Link
									href="/claims"
									className={`min-w-[90px] flex items-center justify-center gap-2 px-4 py-1.5 rounded-full font-bold font-sans transition border-2 shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-sm ${pathname === "/claims" ? "bg-green-700 text-white border-green-700 scale-105 pointer-events-none" : "bg-white text-green-700 border-green-700 hover:bg-green-50 hover:scale-105"}`}
									aria-current={pathname === "/claims" ? "page" : undefined}
								>
									Claims
								</Link>
								<Link
									href="/found-item"
									className={`min-w-[90px] flex items-center justify-center gap-2 px-4 py-1.5 rounded-full font-bold font-sans transition border-2 shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-sm ${pathname === "/found-item" ? "bg-green-700 text-white border-green-700 scale-105 pointer-events-none" : "bg-white text-green-700 border-green-700 hover:bg-green-50 hover:scale-105"}`}
									aria-current={pathname === "/found-item" ? "page" : undefined}
								>
									Found
								</Link>
								{/* Refresh button in topbar */}
								<button
									type="button"
									className="ml-0 p-0 flex items-center hover:bg-gray-100 rounded-full transition"
									aria-label="Refresh items"
									title="Refresh items"
									style={{ minWidth: '2.5rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
									onClick={refreshItems}
								>
									<img src="/icons/refresh.svg" alt="Refresh" className="w-6 h-6" style={{ filter: 'invert(36%) sepia(94%) saturate(453%) hue-rotate(88deg) brightness(70%) contrast(91%)', minWidth: '1.5rem', minHeight: '1.5rem' }} />
								</button>
							</div>
							<div className="flex items-center gap-2 w-full justify-end">
								<div className="relative flex items-center w-32 sm:w-56 md:w-64 lg:w-72 xl:w-80 min-w-0">
									<input
										type="text"
										placeholder="Search"
										value={pendingSearch}
										onChange={e => {
											setPendingSearch(e.target.value);
											if (search !== "") setSearch("");
										}}
										className="rounded-full border border-green-900 px-3 py-1.5 w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-700 hover:border-green-700 transition text-gray-800 placeholder:text-green-900 pr-12 ml-20"
										aria-label="Search found items"
										onKeyDown={e => {
											if (e.key === 'Enter') {
												setSearch(pendingSearch);
											}
										}}
									/>
									{search ? (
										<button
											type="button"
											className="absolute right-0 top-0 h-full w-12 flex items-center justify-center rounded-r-full bg-green-600 hover:bg-green-600/80 focus:outline-none"
											aria-label="Clear search"
											onClick={() => {
												setPendingSearch("");
												setSearch("");
											}}
											tabIndex={0}
										>
											<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									) : (
										<button
											type="button"
											className="absolute right-0 top-0 h-full w-12 flex items-center justify-center rounded-r-full bg-green-600 hover:bg-green-600/80 focus:outline-none"
											aria-label="Search"
											onClick={() => {
												setSearch(pendingSearch);
											}}
											tabIndex={0}
											disabled={!pendingSearch}
										>
											<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
											</svg>
										</button>
									)}
								</div>
								<div className="flex items-center relative flex-shrink-0">
									<button
										type="button"
										className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-100 transition border-none outline-none"
										aria-label="Sort options"
										onClick={() => setShowSortOptions(v => !v)}
									>
										<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M9 17h6" />
										</svg>
									</button>
									{showSortOptions && (
										<div className="absolute right-0 top-12 w-44 bg-white rounded-xl shadow-lg border border-green-200 z-20 animate-fade-in min-w-[10rem] max-w-[90vw]" tabIndex={-1}>
											<ul className="py-2">
												{sortOptions.map(opt => (
													<li key={opt.value}>
														<button
															onClick={() => handleSortSelect(opt.value)}
															className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${sort === opt.value ? 'text-green-700 font-bold bg-gray-100' : 'text-gray-700'}`}
														>
															{opt.label}
														</button>
													</li>
												))}
											</ul>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-3 gap-y-5 max-w-6xl mx-0 px-0 pb-8">
					{loading ? (
						<div className="col-span-full text-center text-white py-12 font-semibold text-lg drop-shadow-md flex flex-col items-center justify-center">
							<div className="lds-dual-ring" aria-label="Loading"></div>
							<span className="mt-4">Loading items...</span>
						</div>
					) : filteredItems.length === 0 ? (
						<div className="col-span-full text-center text-white py-12 font-semibold text-lg drop-shadow-md">No pending claims found.</div>
					) : (
						filteredItems.map(item => (
							<div
								key={item.id}
								className="bg-white/95 rounded-2xl shadow-lg p-3 flex flex-col items-center border-4 border-green-700 transition-transform hover:scale-[1.025] hover:shadow-xl focus-within:shadow-xl outline-none cursor-pointer"
								tabIndex={0}
								onClick={() => {
									window.location.href = `/claims/${item.item_number}`;
								}}
								role="button"
								aria-label={`View details for item #${String(item.item_number).padStart(6, '0')}`}
							>
								<div className="w-full h-40 relative mb-2 rounded-xl overflow-hidden">
									<Zoom>
										<img
											src={item.image_url || '/images/logo.png'}
											alt={item.title}
											className="object-cover w-full h-full aspect-square bg-white"
											style={{ cursor: 'pointer', objectFit: 'cover', width: '100%', height: '100%', background: 'white' }}
										/>
									</Zoom>
									<button
										type="button"
										className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow-md z-10"
										aria-label="Expand image"
										tabIndex={-1}
										onClick={e => {
											e.stopPropagation();
											// Find the img inside the Zoom and trigger click for expand
											const img = e.currentTarget.parentElement?.querySelector('img');
											if (img) img.click();
										}}
									>
										<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2m-8 0H6a2 2 0 01-2-2v-2" />
										</svg>
									</button>
								</div>
								<div className="w-full flex flex-col gap-0.5 mb-2">
									<div className="flex items-center justify-between mb-1">
										<h2 className="font-bold text-lg truncate flex items-center gap-2" title={item.title}>
											{item.title}
										</h2>
										{typeof item.item_number !== 'undefined' && (
											<span className="flex items-center gap-1 ml-2 whitespace-nowrap">
												<span className="text-xs font-mono text-green-700 font-bold">#{String(item.item_number).padStart(6, '0')}</span>
												<button
													type="button"
													className="ml-1 p-1 rounded hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-400"
													title="Copy item number"
													aria-label="Copy item number"
													onClick={() => {
														const formatted = `#${String(item.item_number).padStart(6, '0')}`;
														navigator.clipboard.writeText(formatted);
														setCopiedItemNumber(formatted);
														setTimeout(() => setCopiedItemNumber(null), 3000);
													}}
												>
													{copiedItemNumber === `#${String(item.item_number).padStart(6, '0')}` ? (
														<img src="/icons/check_icon.svg" alt="Copied" className="w-4 h-4 inline" style={{ filter: 'invert(36%) sepia(94%) saturate(453%) hue-rotate(88deg) brightness(70%) contrast(91%)' }} />
													) : (
														<img src="/icons/content_copy.svg" alt="Copy" className="w-4 h-4 inline" style={{ filter: 'invert(36%) sepia(94%) saturate(453%) hue-rotate(88deg) brightness(70%) contrast(91%)' }} />
													)}
												</button>
											</span>
										)}
									</div>
									<p className="text-xs text-gray-600 mb-1">
										Reported by: <span className="font-semibold">{item.users?.username || 'Unknown'}</span>
									</p>
									<p className="text-xs text-gray-700 flex items-center gap-1">
										<svg className="inline w-4 h-4 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
										<span className="text-green-700 font-semibold">Found:</span> {item.date_time_found ? formatPHDate(item.date_time_found) : ''}
									</p>
									<p className="text-xs flex items-center gap-1">
										<svg className="inline w-4 h-4 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z" /></svg>
										<span className="text-green-700 font-semibold">Location:</span> {item.location}
									</p>
									<DescriptionWithPopover description={item.description} />
									<p className="text-xs flex items-center gap-1">
										{Array.isArray(item.color) ? item.color.map((color: string, idx: number) => (
											<span key={color + idx} className="flex items-center gap-1 mr-2">
												<span className="inline-block w-3 h-3 rounded-full border border-green-700" style={{ background: colorSwatchMap[color] || color.toLowerCase() }} title={color}></span>
												<span className="text-green-700 font-semibold">{color}</span>
											</span>
										)) : (
											<span className="flex items-center gap-1">
												<span className="inline-block w-3 h-3 rounded-full border border-green-700" style={{ background: colorSwatchMap[item.color] || item.color?.toLowerCase() }} title={item.color}></span>
												<span className="text-green-700 font-semibold">Color:</span>
												<span className="text-green-700 font-semibold">
													{Array.isArray(item.color) ? item.color.join(', ') : item.color}
												</span>
											</span>
										)}
									</p>
								</div>
								<div className="flex w-full items-center mt-auto">
									<div className="flex-1 flex justify-center gap-1">
										<button
											className="bg-green-700 text-white rounded-lg px-5 py-1.5 font-semibold hover:bg-cvsu-yellow hover:text-green-900 transition text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
											onClick={() => {
												const user = getUserFromCookie();
												if (!user) {
													showToast('You must be logged in to claim an item.', 'error');
													return;
												}
											}}
										>
											Review Item
										</button>
										<button
											type="button"
											className="bg-white border border-green-700 text-green-700 rounded-lg px-1 py-1 font-semibold hover:bg-green-50 hover:text-green-900 transition text-sm focus:outline-none focus:ring-2 focus:ring-green-400 flex items-center ml-0"
											title="Copy item link"
											aria-label="Copy item link"
											onClick={() => {
												const url = `${window.location.origin}/claims?item=${item.item_number}`;
												navigator.clipboard.writeText(url);
												setCopiedItemNumber(url);
												setTimeout(() => setCopiedItemNumber(null), 3000);
											}}
										>
											{copiedItemNumber === `${window.location.origin}/claims?item=${item.item_number}` ? (
												<img src="/icons/check_icon.svg" alt="Copied" className="w-5 h-5 inline" style={{ filter: 'invert(36%) sepia(94%) saturate(453%) hue-rotate(88deg) brightness(70%) contrast(91%)' }} />
											) : (
												<img src="/icons/copy_link.png" alt="Copy link" className="w-5 h-5 inline" style={{ filter: 'invert(36%) sepia(94%) saturate(453%) hue-rotate(88deg) brightness(70%) contrast(91%)' }} />
											)}
											<span className="sr-only">Copy link</span>
										</button>
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
			<style jsx global>{`
				.react-medium-image-zoom__overlay {
					background: rgba(255,255,255,0.2) !important;
					backdrop-filter: blur(12px) !important;
				}
				.react-medium-image-zoom__zoom {
					max-width: 60vw !important;
					max-height: 40vh !important;
					border-radius: 1rem !important;
					box-shadow: 0 8px 32px rgba(0,0,0,0.25);
					margin: 5vh auto !important;
				}
			`}</style>
			{showScrollButton && (
				<div
					style={{
						position: 'fixed',
						bottom: '24px',
						left: '50%',
						transform: 'translateX(-50%)',
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						zIndex: 1000,
					}}
				>
					<button
						onClick={scrollToTop}
						style={{
							width: '30px',
							height: '30px',
							background: '#22c55e',
							border: 'none',
							borderRadius: '50%',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							boxShadow: '0 4px 16px rgba(34,197,94,0.18)',
							cursor: 'pointer',
							transition: 'background 0.2s',
							outline: 'none',
							padding: 0,
						}}
						aria-label="Scroll to Top"
						onMouseOver={e => (e.currentTarget.style.background = '#16a34a')}
						onMouseOut={e => (e.currentTarget.style.background = '#22c55e')}
					>
						<Image src={'/icons/scroll_top.svg'} alt="Scroll to Top" width={24} height={24} />
					</button>
					<span
						style={{
							marginTop: '5px',
							fontWeight: 'bold',
							fontSize: '10px',
							textShadow: '0 1px 4px rgba(0,0,0,0.08)',
						}}
					>
						<span
							onClick={scrollToTop}
							onMouseOver={e => (e.currentTarget.style.color = '#16a34a')}
							onMouseOut={e => (e.currentTarget.style.color = '#22c55e')}
							style={{
								cursor: 'pointer',
								fontWeight: 'bold',
								fontSize: '10px',
								textShadow: '0 1px 4px rgba(0,0,0,0.08)',
								color: '#22c55e',
								transition: 'color 0.2s',
							}}
						>
							BACK TO TOP
						</span>
					</span>
				</div>
			)}
		</div>
	);
}
