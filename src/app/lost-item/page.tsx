"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';

const lostItems = [
	{
		id: 1,
		title: 'Wallet',
		date: 'Today, 7:30am',
		location: 'Near Bleachers',
		note: 'Inilaan ko po sa Guard ng Gate 2',
		color: 'Black',
		image: '/images/wallet.jpg',
	},
	{
		id: 2,
		title: 'Aquaflask tumbler',
		date: 'Yesterday, 1:39pm',
		location: 'Outside DIT bldg.',
		note: 'Binigay ko po sa Guard ng Gate 1',
		color: 'Gray',
		image: '/images/tumbler.jpg',
	},
	{
		id: 3,
		title: 'Cap',
		date: '2 days ago, 11:27am',
		location: 'Sa Batibot malapit sa Museum',
		note: 'Nasa Guard po ng Gate 3',
		color: 'Brown',
		image: '/images/cap.jpg',
	},
];

export default function LostItemPage() {
	const [search, setSearch] = useState('');
	const [sort, setSort] = useState('recent');

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

	return (
		<div className="min-h-screen relative">
			<div className="absolute inset-0 w-full h-full -z-10">
				<Image
					src="/images/cvsu-homebg.jpg"
					alt="Cavite State University Background"
					fill
					priority
					className="object-cover object-center"
					style={{ filter: 'blur(5px) brightness(0.5)' }}
					sizes="100vw"
					quality={100}
				/>
			</div>
			<div className="max-w-5xl mx-auto pt-24">
				<div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
					{/* Top Bar: Title | Sort | Search */}
					<div className="flex w-full items-center justify-between gap-4 bg-white rounded-full px-4 py-2 shadow">
						{/* Title */}
						<span className="text-lg md:text-xl font-bold text-green-900 whitespace-nowrap pl-2">
							Lost Items
						</span>
						{/* Sort Dropdown */}
						<div className="flex items-center relative">
							<select
								value={sort}
								onChange={e => setSort(e.target.value)}
								className="flex items-center bg-neutral-50 border border-neutral-200 rounded-full px-4 py-2 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 transition min-w-[120px] appearance-none pr-8"
								style={{ minWidth: 120 }}
								aria-label="Sort lost items"
							>
								<option value="recent">Most Recent</option>
								<option value="oldest">Oldest</option>
								<option value="title">Title (A-Z)</option>
								<option value="color">Color</option>
							</select>
							<span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
								<svg
									className="w-4 h-4 text-gray-500"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
								</svg>
							</span>
						</div>
						{/* Search Input */}
						<div className="relative flex items-center w-56">
							<input
								type="text"
								placeholder="Search"
								value={search}
								onChange={e => setSearch(e.target.value)}
								className="rounded-full border border-green-900 px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-green-300 transition text-gray-800 placeholder:text-green-900 pr-10"
								aria-label="Search lost items"
							/>
							<span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-900">
								<svg
									width="20"
									height="20"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
									/>
								</svg>
							</span>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
					{filteredItems.length === 0 ? (
						<div className="col-span-full text-center text-gray-500 py-12">No items found.</div>
					) : (
						filteredItems.map(item => (
							<div
								key={item.id}
								className="bg-white/90 rounded-2xl shadow-lg p-4 flex flex-col items-center border-4 border-green-700"
							>
								<div className="w-full h-40 relative mb-3 rounded-xl overflow-hidden">
									<Image
										src={item.image}
										alt={item.title}
										fill
										className="object-cover"
									/>
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
								<button className="mt-auto bg-green-700 text-white rounded-lg px-6 py-2 font-semibold hover:bg-green-800 transition">
									Claim Item
								</button>
							</div>
						))
					)}
				</div>
				<button className="fixed bottom-10 right-10 bg-green-600 hover:bg-green-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl text-4xl border-4 border-white">
					<span>+</span>
				</button>
			</div>
		</div>
	);
}
