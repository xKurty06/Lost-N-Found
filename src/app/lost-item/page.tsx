"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { usePathname } from 'next/navigation';
import HandleReport from "@/components/ui/HandleReport";

const lostItems = [
	{
		id: 1,
		title: 'Wallet',
		date: 'Today, 7:30am',
		location: 'Near Bleachers',
		note: 'Inilaan ko po sa Guard ng Gate 2',
		color: 'Black',
		image: '/images/logo.png',
	},
	{
		id: 2,
		title: 'Aquaflask tumbler',
		date: 'Yesterday, 1:39pm',
		location: 'Outside DIT bldg.',
		note: 'Binigay ko po sa Guard ng Gate 1',
		color: 'Gray',
		image: '/images/login-bg.png',
	},
	{
		id: 3,
		title: 'Cap',
		date: '2 days ago, 11:27am',
		location: 'Sa Batibot malapit sa Museum',
		note: 'Nasa Guard po ng Gate 3',
		color: 'Brown',
		image: '/images/cvsu-homebg.jpg',
	},
	{
		id: 4,
		title: 'Cap',
		date: '2 days ago, 11:27am',
		location: 'Sa Batibot malapit sa Museum',
		note: 'Nasa Guard po ng Gate 3',
		color: 'Brown',
		image: '/images/cvsu-homebg.jpg',
	},
	{
		id: 5, // changed from 3 to 5 to ensure uniqueness
		title: 'Cap',
		date: '2 days ago, 11:27am',
		location: 'Sa Batibot malapit sa Museum',
		note: 'Nasa Guard po ng Gate 3',
		color: 'Brown',
		image: '/images/cvsu-homebg.jpg',
	},
	{
		id: 6, // changed from 4 to 6 to ensure uniqueness
		title: 'Cap',
		date: '2 days ago, 11:27am',
		location: 'Sa Batibot malapit sa Museum',
		note: 'Nasa Guard po ng Gate 3',
		color: 'Brown',
		image: '/images/cvsu-homebg.jpg',
	},
];
export default function LostItemPage() {
	const pathname = usePathname();
	const [search, setSearch] = useState("");
	const [pendingSearch, setPendingSearch] = useState("");
	const [reportOpen, setReportOpen] = useState(false);
	// --- New: Sort/Filter System ---
	const [sort, setSort] = useState("recent");
	const [showSortOptions, setShowSortOptions] = useState(false);
	const sortOptions = [
		{ value: "recent", label: "Most Recent" },
		{ value: "oldest", label: "Oldest" },
		{ value: "title", label: "Title (A-Z)" },
		{ value: "color", label: "Color" }
	];

	function sortItems(items: typeof lostItems, sort: string) {
		switch (sort) {
			case "oldest":
				return [...items].sort((a, b) => a.id - b.id);
			case "title":
				return [...items].sort((a, b) => a.title.localeCompare(b.title));
			case "color":
				return [...items].sort((a, b) => a.color.localeCompare(b.color));
			case "recent":
			default:
				return [...items].sort((a, b) => b.id - a.id);
		}
	}

	function handleSortSelect(option: string) {
		setSort(option);
		setShowSortOptions(false);
	}

	// Filter and sort items
	const filteredItems = useMemo(() => {
		let items = lostItems.filter(item =>
			item.title.toLowerCase().includes(search.toLowerCase()) ||
			item.location.toLowerCase().includes(search.toLowerCase()) ||
			item.note.toLowerCase().includes(search.toLowerCase()) ||
			item.color.toLowerCase().includes(search.toLowerCase())
		);
		return sortItems(items, sort);
	}, [search, sort, lostItems]);

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
			<div className="flex-1 w-full max-w-5xl mx-auto pt-24 px-2 overflow-y-auto relative z-10">
				<div className="mb-8">
					{/* Mobile Top Bar */}
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
								href="/found-item"
								className={`min-w-[110px] flex items-center justify-center gap-2 px-4 py-1.5 rounded-full font-semibold transition border-2 shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-sm ${pathname === "/found-item" ? "bg-green-700 text-white border-green-700 pointer-events-none" : "bg-white text-green-700 border-green-700 hover:bg-green-50"}`}
								aria-current={pathname === "/found-item" ? "page" : undefined}
							>
								Found
							</Link>
						</div>
						<div className="flex w-full gap-1 pt-2"> {/* Decreased gap and padding between nav and search bar */}
							<div className="relative flex items-center flex-1">
								<input
									type="text"
									placeholder="Search"
									value={pendingSearch}
									onChange={e => setPendingSearch(e.target.value)}
									className="rounded-l-full rounded-r-full border-none px-4 py-2 w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-green-400 text-green-900 placeholder:text-green-900 bg-white shadow-md pr-12 text-base"
									aria-label="Search found items"
									onKeyDown={e => {
										if (e.key === 'Enter') {
											setSearch(pendingSearch);
										}
									}}
									style={{ boxShadow: '0 2px 8px rgba(0,64,0,0.08)' }}
								/>
								<button
									type="button"
									className="absolute right-0 top-0 h-full w-12 flex items-center justify-center rounded-r-full bg-green-600 hover:bg-green-700 focus:outline-none transition border-none shadow-md"
									aria-label={pendingSearch ? "Clear search" : "Search"}
									onClick={() => {
										if (pendingSearch) {
											setPendingSearch("");
											setSearch("");
										} else {
											setSearch(pendingSearch);
										}
									}}
									tabIndex={0}
									disabled={!pendingSearch && !search}
									style={{ boxShadow: '0 2px 8px rgba(0,64,0,0.08)', borderTopRightRadius: '9999px', borderBottomRightRadius: '9999px' }}
								>
									{pendingSearch ? (
										<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									) : (
										<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="white">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
										</svg>
									)}
								</button>
							</div>
							<div className="flex items-center relative flex-shrink-0 bg-white rounded-full">
								<button
									type="button"
									className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-gray-200 transition border-none outline-none"
									aria-label="Sort options"
									onClick={() => setShowSortOptions(v => !v)}
								>
									<svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
					{/* Desktop Top Bar (unchanged) */}
					<div className="hidden sm:flex flex-row items-center justify-center gap-4">
						<div className="flex w-10/12 items-center justify-between gap-4 bg-white rounded-full px-4 py-2 shadow">
							{/* Navigation Bar (inline) */}
							<div className="flex gap-2 mr-4 items-center">
								<Link
									href="/lost-item"
									className={`min-w-[90px] flex items-center justify-center gap-2 px-4 py-1.5 rounded-full font-bold font-sans transition border-2 shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-sm ${pathname === "/lost-item" ? "bg-green-700 text-white border-green-700 scale-105 pointer-events-none" : "bg-white text-green-700 border-green-700 hover:bg-green-50 hover:scale-105"}`}
									aria-current={pathname === "/lost-item" ? "page" : undefined}
								>
									Lost
								</Link>
								<Link
									href="/found-item"
									className={`min-w-[90px] flex items-center justify-center gap-2 px-4 py-1.5 rounded-full font-bold font-sans transition border-2 shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-sm ${pathname === "/found-item" ? "bg-green-700 text-white border-green-700 scale-105 pointer-events-none" : "bg-white text-green-700 border-green-700 hover:bg-green-50 hover:scale-105"}`}
									aria-current={pathname === "/found-item" ? "page" : undefined}
								>
									Found
								</Link>
								<button
									type="button"
									className="ml-0 p-0 flex items-center hover:bg-gray-100 rounded-full transition"
									aria-label="Refresh items"
									title="Refresh items"
									style={{ minWidth: '2.5rem', minHeight: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
									onClick={() => window.location.reload()}
								>
									<img src="/icons/refresh.svg" alt="Refresh" className="w-6 h-6" style={{ filter: 'invert(36%) sepia(94%) saturate(453%) hue-rotate(88deg) brightness(70%) contrast(91%)', minWidth: '1.5rem', minHeight: '1.5rem' }} />
								</button>
							</div>
							{/* Search Bar and Sort Icon Grouped, filter to the right */}
							<div className="flex items-center gap-2 w-full justify-end">
								<div className="relative flex items-center w-32 sm:w-56 md:w-64 lg:w-72 xl:w-80 min-w-0">
									<input
										type="text"
										placeholder="Search"
										value={pendingSearch}
										onChange={e => {
											setPendingSearch(e.target.value);
											if (search !== "") setSearch(""); // Reset search if user starts typing after search is set
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
				{/* Update grid container for perfect alignment with navbar and decrease gap */}
				{/* --- Grid container: truly edge-to-edge, no horizontal padding, minimal gap --- */}
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-4 max-w-5xl mx-0 px-0 pb-8">
					{filteredItems.length === 0 ? (
						<div className="col-span-full text-center text-white py-12 font-semibold text-lg drop-shadow-md">No items found.</div>
					) : (
						filteredItems.map(item => (
							<div
								key={item.id}
								className="bg-white/95 rounded-2xl shadow-lg p-3 flex flex-col items-center border-4 border-green-700 transition-transform hover:scale-[1.025] hover:shadow-xl focus-within:shadow-xl outline-none"
								tabIndex={0}
							>
								<div className="w-full h-40 relative mb-2 rounded-xl overflow-hidden">
									<Zoom>
										<img
											src={item.image}
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
								<div className="w-full flex flex-col gap-1">
									<h2 className="font-bold text-lg mb-1 truncate flex items-center gap-2" title={item.title}>
										{item.title}
									</h2>
									<p className="text-xs text-gray-700 flex items-center gap-1">
										<svg className="inline w-4 h-4 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
										{item.date}
									</p>
									<p className="text-xs flex items-center gap-1">
										<svg className="inline w-4 h-4 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12.414a4 4 0 10-1.414 1.414l4.243 4.243a1 1 0 001.414-1.414z" /></svg>
										<span className="text-green-700 font-semibold">Location:</span> {item.location}
									</p>
									<p className="text-xs flex items-center gap-1">
										<svg className="inline w-4 h-4 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 7.165 6 9.388 6 12v2.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
										<span className="text-green-700 font-semibold">Note:</span> {item.note}
									</p>
									<p className="text-xs flex items-center gap-1">
										<span className="inline-block w-3 h-3 rounded-full border border-green-700 mr-1" style={{ background: item.color.toLowerCase() }}></span>
										<span className="text-green-700 font-semibold">Color:</span> {item.color}
									</p>
								</div>
								<button className="mt-auto bg-green-700 text-white rounded-lg px-5 py-1.5 font-semibold hover:bg-cvsu-yellow hover:text-green-900 transition text-sm focus:outline-none focus:ring-2 focus:ring-green-400">
									Claim Item
								</button>
							</div>
						))
					)}
				</div>
				<button
					className="fixed bottom-10 right-10 bg-green-600 hover:bg-green-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl text-4xl border-4 border-white"
					onClick={() => setReportOpen(true)}
					aria-label="Report Lost/Found Item"
				>
					<span className='pb-2'>+</span>
				</button>
				<HandleReport open={reportOpen} onClose={() => setReportOpen(false)} />
				<div className="h-16 sm:h-24" /> {/* Spacer at the bottom for extra space below content and FAB */}
			</div>
			{/* Custom styles for react-medium-image-zoom modal */}
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
		</div>
	);
}
