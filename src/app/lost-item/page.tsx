"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from "next/link";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

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
];

export default function LostItemPage() {
	const [search, setSearch] = useState("");
	const [pendingSearch, setPendingSearch] = useState("");
	const [sort, setSort] = useState("recent");
	const [searchLocked, setSearchLocked] = useState(false);
	const [showSortOptions, setShowSortOptions] = useState(false);
	const sortRef = useRef(null);

	// Filter and sort items
	const filteredItems = useMemo(() => {
		let items = lostItems.filter(item =>
			item.title.toLowerCase().includes(search.toLowerCase()) ||
			item.location.toLowerCase().includes(search.toLowerCase()) ||
			item.note.toLowerCase().includes(search.toLowerCase()) ||
			item.color.toLowerCase().includes(search.toLowerCase())
		);
		switch (sort) {
			case 'oldest':
				items = [...items].sort((a, b) => a.id - b.id);
				break;
			case 'title':
				items = [...items].sort((a, b) => a.title.localeCompare(b.title));
				break;
			case 'color':
				items = [...items].sort((a, b) => a.color.localeCompare(b.color));
				break;
			case 'recent':
			default:
				items = [...items].sort((a, b) => b.id - a.id);
				break;
		}
		return items;
	}, [search, sort]);

	// Close sort options when clicking outside
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (sortRef.current && !(sortRef.current as HTMLElement).contains(event.target as Node)) {
				setShowSortOptions(false);
			}
		}
		if (showSortOptions) {
			document.addEventListener("mousedown", handleClickOutside);
		} else {
			document.removeEventListener("mousedown", handleClickOutside);
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showSortOptions]);

	return (
		<div className="min-h-screen relative">
			<div className="absolute inset-0 w-full h-full -z-10">
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
			<div className="max-w-5xl mx-auto pt-24 px-2">
				<div className="mb-8">
					{/* Mobile Top Bar */}
					<div className="flex flex-col gap-3 sm:hidden w-full px-2">
						<div className="flex w-full justify-center gap-2 mt-4"> {/* Reduced margin top for lost/found nav */}
							<Link
								href="/lost-item"
								className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 rounded-full font-semibold transition bg-green-700 text-white border-2 border-green-700 shadow pointer-events-none focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
								aria-current="page"
							>
								Lost
							</Link>
							<Link
								href="/found-item"
								className="flex-1 flex items-center justify-center gap-2 px-2 py-1.5 rounded-full font-semibold transition bg-white text-green-700 border-2 border-green-700 hover:bg-green-50 shadow focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
							>
								Found
							</Link>
						</div>
						<div className="flex w-full gap-1 pt-1"> {/* Decreased gap and padding between nav and search bar */}
							<div className="relative flex items-center flex-1">
								<input
									type="text"
									placeholder="Search"
									value={pendingSearch}
									onChange={e => setPendingSearch(e.target.value)}
									className="rounded-full border border-green-900 px-4 py-2 w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-700 hover:border-green-700 transition text-gray-800 placeholder:text-green-900 pr-10 text-base"
									aria-label="Search lost items"
									onKeyDown={e => {
										if (e.key === 'Enter' && !searchLocked) {
											setSearch(pendingSearch);
											setSearchLocked(true);
											e.preventDefault();
										}
									}}
									disabled={searchLocked}
								/>
								{searchLocked ? (
									<button
										type="button"
										className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-800 focus:outline-none"
										aria-label="Clear search"
										onClick={() => {
											setPendingSearch("");
											setSearch("");
											setSearchLocked(false);
										}}
										tabIndex={0}
									>
										<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								) : (
									<button
										type="button"
										className="absolute right-3 top-1/2 -translate-y-1/2 text-green-900 hover:text-green-700 focus:outline-none"
										aria-label="Search"
										onClick={() => {
											setSearch(pendingSearch);
											setSearchLocked(true);
										}}
										tabIndex={0}
										disabled={!pendingSearch}
										style={{ background: 'none', color: '#14532d' }} // force text-green-900
									>
										<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
										</svg>
									</button>
								)}
							</div>
							<div className="flex items-center relative flex-shrink-0 bg-white rounded-full">
								<button
									type="button"
									className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
									aria-label="Sort options"
									onClick={() => setShowSortOptions(v => !v)}
									ref={sortRef}
								>
									<svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M9 17h6" />
									</svg>
								</button>
								{showSortOptions && (
									<div className="absolute right-0 top-12 w-44 bg-white rounded-xl shadow-lg border border-green-200 z-20 animate-fade-in min-w-[10rem] max-w-[90vw]" tabIndex={-1}>
										<ul className="py-2">
											<li>
												<button
													onClick={() => { setSort('recent'); setShowSortOptions(false); }}
													className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${sort === 'recent' ? 'text-green-700 font-bold' : 'text-gray-700'}`}
												>
													Most Recent
												</button>
											</li>
											<li>
												<button
													onClick={() => { setSort('oldest'); setShowSortOptions(false); }}
													className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${sort === 'oldest' ? 'text-green-700 font-bold' : 'text-gray-700'}`}
												>
													Oldest
												</button>
											</li>
											<li>
												<button
													onClick={() => { setSort('title'); setShowSortOptions(false); }}
													className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${sort === 'title' ? 'text-green-700 font-bold' : 'text-gray-700'}`}
												>
													Title (A-Z)
												</button>
											</li>
											<li>
												<button
													onClick={() => { setSort('color'); setShowSortOptions(false); }}
													className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${sort === 'color' ? 'text-green-700 font-bold' : 'text-gray-700'}`}
												>
													Color
												</button>
											</li>
										</ul>
									</div>
								)}
							</div>
						</div>
					</div>
					{/* Desktop Top Bar (unchanged) */}
					<div className="hidden sm:flex flex-row items-center justify-center gap-4"> {/* Add pt-24 for spacing under navbar */}
						<div className="flex w-10/12 items-center justify-between gap-4 bg-white rounded-full px-4 py-2 shadow">
							{/* Navigation Bar (inline) */}
							<div className="flex gap-2 mr-4">
								<Link
									href="/lost-item"
									className="flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold transition bg-green-700 text-white border-2 border-green-700 shadow scale-105 pointer-events-none focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
									aria-current="page"
								>
									Lost
								</Link>
								<Link
									href="/found-item"
									className="flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold transition bg-white text-green-700 border-2 border-green-700 hover:bg-green-50 shadow hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
								>
									Found
								</Link>
							</div>
							{/* Search Bar and Sort Icon Grouped, filter to the right */}
							<div className="flex items-center gap-2 w-full justify-end">
								<div className="relative flex items-center w-32 sm:w-56 md:w-64 lg:w-72 xl:w-80 min-w-0">
									<input
										type="text"
										placeholder="Search"
										value={pendingSearch}
										onChange={e => setPendingSearch(e.target.value)}
										className="rounded-full border border-green-900 px-4 py-2 w-full min-w-0 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-700 hover:border-green-700 transition text-gray-800 placeholder:text-green-900 pr-10"
										aria-label="Search lost items"
										onKeyDown={e => {
											if (e.key === 'Enter' && !searchLocked) {
												setSearch(pendingSearch);
												setSearchLocked(true);
												e.preventDefault();
											}
										}}
										disabled={searchLocked}
									/>
									{searchLocked ? (
										<button
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 hover:text-red-800 focus:outline-none"
											aria-label="Clear search"
											onClick={() => {
												setPendingSearch("");
												setSearch("");
												setSearchLocked(false);
											}}
											tabIndex={0}
										>
											<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									) : (
										<button
											type="button"
											className="absolute right-3 top-1/2 -translate-y-1/2 text-green-900 hover:text-green-800 focus:outline-none"
											aria-label="Search"
											onClick={() => {
												setSearch(pendingSearch);
											 setSearchLocked(true);
											}}
											tabIndex={0}
											disabled={!pendingSearch}
											style={{ background: 'none' }}
										>
											<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
											</svg>
										</button>
									)}
								</div>
								<div className="flex items-center relative flex-shrink-0">
									<button
										type="button"
										className="flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
										aria-label="Sort options"
										onClick={() => setShowSortOptions(v => !v)}
										ref={sortRef}
									>
										<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M9 17h6" />
										</svg>
									</button>
									{showSortOptions && (
										<div className="absolute right-0 top-12 w-44 bg-white rounded-xl shadow-lg border border-green-200 z-20 animate-fade-in min-w-[10rem] max-w-[90vw]" tabIndex={-1}>
											<ul className="py-2">
												<li>
													<button
														onClick={() => { setSort('recent'); setShowSortOptions(false); }}
														className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${sort === 'recent' ? 'text-green-700 font-bold' : 'text-gray-700'}`}
													>
														Most Recent
													</button>
												</li>
												<li>
													<button
														onClick={() => { setSort('oldest'); setShowSortOptions(false); }}
														className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${sort === 'oldest' ? 'text-green-700 font-bold' : 'text-gray-700'}`}
													>
														Oldest
													</button>
												</li>
												<li>
													<button
														onClick={() => { setSort('title'); setShowSortOptions(false); }}
														className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${sort === 'title' ? 'text-green-700 font-bold' : 'text-gray-700'}`}
													>
														Title (A-Z)
													</button>
												</li>
												<li>
													<button
														onClick={() => { setSort('color'); setShowSortOptions(false); }}
														className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 ${sort === 'color' ? 'text-green-700 font-bold' : 'text-gray-700'}`}
													>
														Color
													</button>
												</li>
											</ul>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8">
					{filteredItems.length === 0 ? (
						<div className="col-span-full text-center text-gray-500 py-12">No items found.</div>
					) : (
						filteredItems.map(item => (
							<div
								key={item.id}
								className="bg-white/90 rounded-2xl shadow-lg p-4 flex flex-col items-center border-4 border-green-700"
							>
								<div className="w-full h-40 relative mb-3 rounded-xl overflow-hidden">
									<Zoom>
										<img
											src={item.image}
											alt={item.title}
											className="object-cover w-full h-full"
											style={{ cursor: 'pointer', objectFit: 'cover', width: '100%', height: '100%' }}
										/>
									</Zoom>
									<button
										type="button"
										className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1 shadow-md z-10"
										aria-label="Expand image"
										onClick={e => {
											e.stopPropagation();
											e.currentTarget.parentElement?.querySelector('img')?.click();
										}}
									>
										<svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-green-700">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V6a2 2 0 012-2h2m8 0h2a2 2 0 012 2v2m0 8v2a2 2 0 01-2 2h-2m-8 0H6a2 2 0 01-2-2v-2" />
										</svg>
									</button>
								</div>
								<div className="w-full">
									<h2 className="font-bold text-lg mb-1">{item.title}</h2>
									<p className="text-xs text-gray-700 mb-1">
										{item.date}
									</p>
									<p className="text-xs mb-1">
										<span className="text-green-700 font-semibold">&#9679; </span>
										{item.location}
									</p>
									<p className="text-xs mb-1">
										<span className="text-green-700 font-semibold">&#9679; Note:</span>{' '}
										{item.note}
									</p>
									<p className="text-xs mb-2">
										<span className="text-green-700 font-semibold">&#9679; Color:</span>{' '}
										{item.color}
									</p>
								</div>
								<button className="mt-auto bg-green-700 text-white rounded-lg px-6 py-2 font-semibold hover:bg-cvsu-yellow transition">
									Claim Item
								</button>
							</div>
						))
					)}
				</div>
				<button className="fixed bottom-10 right-10 bg-green-600 hover:bg-green-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl text-4xl border-4 border-white">
					<span className='pb-2'>+</span>
				</button>
				<div className="h-16 sm:h-24" /> {/* Spacer at the bottom for extra space below content and FAB */}
			</div>
			{/* Custom styles for react-medium-image-zoom modal */}
			<style jsx global>{`
				.react-medium-image-zoom__overlay {
					background: rgba(255,255,255,0.2) !important;
					backdrop-filter: blur(12px) !important;
				}
				.react-medium-image-zoom__zoom {
					max-width: 350px !important;
					max-height: 350px !important;
					border-radius: 1rem !important;
					box-shadow: 0 8px 32px rgba(0,0,0,0.25);
				}
			`}</style>
		</div>
	);
}
