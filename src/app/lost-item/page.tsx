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
  return (
    <div className="min-h-screen bg-[url('/images/cvsu-homebg.jpg')] bg-cover bg-center">
      <div className="max-w-5xl mx-auto pt-8">
        <form className="flex items-center justify-center mb-8">
          <input
            type="text"
            placeholder="Lost Items"
            className="rounded-full px-6 py-2 w-2/3 max-w-lg focus:outline-none shadow"
            disabled
          />
          <div className="relative ml-[-3rem]">
            <input
              type="text"
              placeholder="Search"
              className="rounded-full px-4 py-2 w-40 focus:outline-none border border-gray-300 shadow"
            />
            <span className="absolute right-3 top-2 text-gray-500">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" /></svg>
            </span>
          </div>
        </form>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {lostItems.map(item => (
            <div key={item.id} className="bg-white/90 rounded-2xl shadow-lg p-4 flex flex-col items-center border-4 border-green-700">
              <div className="w-full h-40 relative mb-3 rounded-xl overflow-hidden">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
              </div>
              <div className="w-full">
                <h2 className="font-bold text-lg mb-1">{item.title}</h2>
                <p className="text-xs text-gray-700 mb-1">{item.date}</p>
                <p className="text-xs mb-1"><span className="text-green-700 font-semibold">&#9679; </span>{item.location}</p>
                <p className="text-xs mb-1"><span className="text-green-700 font-semibold">&#9679; Note:</span> {item.note}</p>
                <p className="text-xs mb-2"><span className="text-green-700 font-semibold">&#9679; Color:</span> {item.color}</p>
              </div>
              <button className="mt-auto bg-green-700 text-white rounded-lg px-6 py-2 font-semibold hover:bg-green-800 transition">Claim Item</button>
            </div>
          ))}
        </div>
        <button className="fixed bottom-10 right-10 bg-green-600 hover:bg-green-700 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl text-4xl border-4 border-white">
          <span>+</span>
        </button>
      </div>
    </div>
  );
}
