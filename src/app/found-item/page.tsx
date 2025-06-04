"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

const foundItems = [
	{
		id: 1,
		title: "Umbrella",
		date: "Today, 9:00am",
		location: "Library Entrance",
		note: "Left at the front desk",
		color: "Blue",
		image: "/images/logo.png",
	},
	{
		id: 2,
		title: "ID Card",
		date: "Yesterday, 2:15pm",
		location: "Cafeteria",
		note: "Given to security",
		color: "White",
		image: "/images/login-bg.png",
	},
];

export default function FoundItemPage() {
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
			<div className="max-w-5xl mx-auto pt-24">
				<div className="flex flex-col sm:flex-row items-center justify-center mb-8 gap-4">
					{/* Top Bar: Navigation | Title | (Sort/Search if needed) */}
					<div className="flex w-10/12 items-center justify-between gap-4 bg-white rounded-full px-4 py-2 shadow">
						{/* Navigation Bar (inline) */}
						<div className="flex gap-2 mr-4">
							<Link
								href="/lost-item"
								className="flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold transition bg-white text-green-700 border-2 border-green-700 hover:bg-green-50 shadow hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
							>
								Lost
							</Link>
							<Link
								href="/found-item"
								className="flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold transition bg-green-700 text-white border-2 border-green-700 shadow scale-105 pointer-events-none focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
								aria-current="page"
							>
								Found
							</Link>
						</div>
					</div>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
					{foundItems.length === 0 ? (
						<div className="col-span-full text-center text-gray-500 py-12">
							No items found.
						</div>
					) : (
						foundItems.map((item) => (
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
										<span className="text-green-700 font-semibold">
											&#9679;{" "}
										</span>
										{item.location}
									</p>
									<p className="text-xs mb-1">
										<span className="text-green-700 font-semibold">
											&#9679; Note:
										</span>{" "}
										{item.note}
									</p>
									<p className="text-xs mb-2">
										<span className="text-green-700 font-semibold">
											&#9679; Color:
										</span>{" "}
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
					<span className="pb-2">+</span>
				</button>
			</div>
		</div>
	);
}
